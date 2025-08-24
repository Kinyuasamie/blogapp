package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"blogapp/internals/models"
)

type BlogHandler struct {
	db *gorm.DB
}

func NewBlogHandler(db *gorm.DB) *BlogHandler {
	return &BlogHandler{db: db}
}

// GetPosts handles GET /api/posts with pagination and search
func (h *BlogHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	search := r.URL.Query().Get("search")
	category := r.URL.Query().Get("category")
	featured := r.URL.Query().Get("featured")

	// Set defaults
	page := 1
	limit := 6

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Build query
	query := h.db.Model(&models.BlogPost{}).Where("published = ?", true)

	// Apply search filter
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(excerpt) LIKE ? OR LOWER(tags) LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Apply category filter
	if category != "" {
		query = query.Where("LOWER(category) = ?", strings.ToLower(category))
	}

	// Apply featured filter
	if featured == "true" {
		query = query.Where("featured = ?", true)
	}

	// Get total count
	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Get posts with pagination
	var posts []models.BlogPost
	if err := query.
		Order("published_at DESC, created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Convert to response format
	var postResponses []models.BlogPostResponse
	for _, post := range posts {
		postResponses = append(postResponses, post.ToResponse(false))
	}

	// Calculate pagination info
	totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))

	response := models.PaginatedResponse{
		Posts:       postResponses,
		CurrentPage: page,
		TotalPages:  totalPages,
		TotalPosts:  totalCount,
		HasNext:     page < totalPages,
		HasPrev:     page > 1,
	}

	json.NewEncoder(w).Encode(response)
}

// GetPostBySlug handles GET /api/posts/{slug}
func (h *BlogHandler) GetPostBySlug(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	slug := vars["slug"]

	var post models.BlogPost
	if err := h.db.Where("slug = ? AND published = ?", slug, true).First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Blog post not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := post.ToResponse(true)
	json.NewEncoder(w).Encode(response)
}

// CreatePost handles POST /api/posts
func (h *BlogHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.CreateBlogPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Title == "" || req.Content == "" || req.AuthorName == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Create blog post
	post := req.ToBlogPost()

	if err := h.db.Create(&post).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			http.Error(w, "Blog post with this slug already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := post.ToResponse(true)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdatePost handles PUT /api/posts/{slug}
func (h *BlogHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	slug := vars["slug"]

	var req models.CreateBlogPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Find existing post
	var existingPost models.BlogPost
	if err := h.db.Where("slug = ?", slug).First(&existingPost).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Blog post not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Update fields
	existingPost.Title = req.Title
	existingPost.Content = req.Content
	existingPost.AuthorName = req.AuthorName
	existingPost.Tags = strings.Join(req.Tags, ",")
	existingPost.Category = req.Category
	existingPost.Featured = req.Featured
	existingPost.Published = req.Published

	if err := h.db.Save(&existingPost).Error; err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := existingPost.ToResponse(true)
	json.NewEncoder(w).Encode(response)
}

// DeletePost handles DELETE /api/posts/{slug}
func (h *BlogHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]

	result := h.db.Where("slug = ?", slug).Delete(&models.BlogPost{})
	if result.Error != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Blog post not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
