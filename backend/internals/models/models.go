package models

import (
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"
)

// BlogPost represents a blog post in the database
type BlogPost struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	Title       string     `json:"title" gorm:"not null;size:255" validate:"required,min=5,max=255"`
	Slug        string     `json:"slug" gorm:"unique;not null;size:255" validate:"required"`
	Content     string     `json:"content" gorm:"not null;type:text" validate:"required,min=100"`
	Excerpt     string     `json:"excerpt" gorm:"size:500"`
	AuthorName  string     `json:"author_name" gorm:"not null;size:100" validate:"required"`
	Tags        string     `json:"tags" gorm:"size:500"` // Comma-separated tags
	Category    string     `json:"category" gorm:"size:100"`
	Featured    bool       `json:"featured" gorm:"default:false"`
	Published   bool       `json:"published" gorm:"default:true"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

// BeforeCreate hook to generate slug and excerpt
func (bp *BlogPost) BeforeCreate(tx *gorm.DB) error {
	if bp.Slug == "" {
		bp.Slug = generateSlug(bp.Title)
	}

	if bp.Excerpt == "" && bp.Content != "" {
		bp.Excerpt = generateExcerpt(bp.Content)
	}

	if bp.Published && bp.PublishedAt == nil {
		now := time.Now()
		bp.PublishedAt = &now
	}

	return nil
}

// BeforeUpdate hook
func (bp *BlogPost) BeforeUpdate(tx *gorm.DB) error {
	if bp.Excerpt == "" && bp.Content != "" {
		bp.Excerpt = generateExcerpt(bp.Content)
	}
	return nil
}

// BlogPostResponse represents the API response structure
type BlogPostResponse struct {
	ID          uint       `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Content     string     `json:"content,omitempty"`
	Excerpt     string     `json:"excerpt"`
	AuthorName  string     `json:"author_name"`
	Tags        []string   `json:"tags"`
	Category    string     `json:"category"`
	Featured    bool       `json:"featured"`
	Published   bool       `json:"published"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// ToResponse converts BlogPost to BlogPostResponse
func (bp *BlogPost) ToResponse(includeContent bool) BlogPostResponse {
	response := BlogPostResponse{
		ID:          bp.ID,
		Title:       bp.Title,
		Slug:        bp.Slug,
		Excerpt:     bp.Excerpt,
		AuthorName:  bp.AuthorName,
		Tags:        parseTags(bp.Tags),
		Category:    bp.Category,
		Featured:    bp.Featured,
		Published:   bp.Published,
		PublishedAt: bp.PublishedAt,
		CreatedAt:   bp.CreatedAt,
		UpdatedAt:   bp.UpdatedAt,
	}

	if includeContent {
		response.Content = bp.Content
	}

	return response
}

// PaginatedResponse represents paginated blog posts response
type PaginatedResponse struct {
	Posts       []BlogPostResponse `json:"posts"`
	CurrentPage int                `json:"current_page"`
	TotalPages  int                `json:"total_pages"`
	TotalPosts  int64              `json:"total_posts"`
	HasNext     bool               `json:"has_next"`
	HasPrev     bool               `json:"has_prev"`
}

// CreateBlogPostRequest represents the request structure for creating a blog post
type CreateBlogPostRequest struct {
	Title      string   `json:"title" validate:"required,min=5,max=255"`
	Content    string   `json:"content" validate:"required,min=100"`
	AuthorName string   `json:"author_name" validate:"required"`
	Tags       []string `json:"tags"`
	Category   string   `json:"category"`
	Featured   bool     `json:"featured"`
	Published  bool     `json:"published"`
}

// ToBlogPost converts CreateBlogPostRequest to BlogPost
func (req *CreateBlogPostRequest) ToBlogPost() BlogPost {
	return BlogPost{
		Title:      req.Title,
		Content:    req.Content,
		AuthorName: req.AuthorName,
		Tags:       strings.Join(req.Tags, ","),
		Category:   req.Category,
		Featured:   req.Featured,
		Published:  req.Published,
	}
}

// Helper functions

func generateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace non-alphanumeric characters with hyphens
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")

	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")

	// Add timestamp to ensure uniqueness
	timestamp := time.Now().Unix()
	return slug + "-" + string(rune(timestamp%10000))
}

func generateExcerpt(content string) string {
	// Remove HTML tags
	reg := regexp.MustCompile("<[^>]*>")
	plainText := reg.ReplaceAllString(content, "")

	// Limit to 200 characters
	if len(plainText) > 200 {
		return plainText[:200] + "..."
	}

	return plainText
}

func parseTags(tagsString string) []string {
	if tagsString == "" {
		return []string{}
	}

	tags := strings.Split(tagsString, ",")
	var cleanTags []string

	for _, tag := range tags {
		cleanTag := strings.TrimSpace(tag)
		if cleanTag != "" {
			cleanTags = append(cleanTags, cleanTag)
		}
	}

	return cleanTags
}
