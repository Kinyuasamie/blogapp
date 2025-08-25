package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"blogapp/internals/handlers"
	"blogapp/internals/models"
)

// Response structures to match your Angular app expectations
type PostResponse struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Excerpt     string    `json:"excerpt"`
	Content     string    `json:"content"`
	AuthorName  string    `json:"author_name"`
	PublishedAt time.Time `json:"published_at"`
	Category    string    `json:"category"`
	Tags        []string  `json:"tags"`
}

type PostsListResponse struct {
	Posts []PostResponse `json:"posts"`
	Total int            `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}

type SinglePostResponse struct {
	Post PostResponse `json:"post"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Database connection
	db, err := initDatabase()
	if err != nil {
		log.Println("Database connection failed, will use mock data:", err)
		db = nil
	}

	var blogHandler *handlers.BlogHandler
	if db != nil {
		// Auto migrate the schema
		if err := db.AutoMigrate(&models.BlogPost{}); err != nil {
			log.Println("Failed to migrate database:", err)
		}
		// Initialize handlers
		blogHandler = handlers.NewBlogHandler(db)
	}

	// Setup routes
	router := mux.NewRouter()

	// API routes with mock data fallback
	api := router.PathPrefix("/api").Subrouter()

	// Posts endpoints
	api.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
		handleGetPosts(w, r, blogHandler)
	}).Methods("GET")

	api.HandleFunc("/posts/{slug}", func(w http.ResponseWriter, r *http.Request) {
		handleGetPost(w, r, blogHandler)
	}).Methods("GET")

	if blogHandler != nil {
		api.HandleFunc("/posts", blogHandler.CreatePost).Methods("POST")
		api.HandleFunc("/posts/{slug}", blogHandler.UpdatePost).Methods("PUT")
		api.HandleFunc("/posts/{slug}", blogHandler.DeletePost).Methods("DELETE")
	}

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
	}).Methods("GET")

	// Serve static files from frontend directory
	staticFileHandler := http.FileServer(http.Dir("./frontend/"))

	// Handle static files (CSS, JS, images, etc.)
	router.PathPrefix("/src/").Handler(http.StripPrefix("/src/", http.FileServer(http.Dir("./frontend/src/"))))
	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./frontend/assets/"))))

	// Handle root and all other routes (SPA routing)
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Don't serve index.html for API routes
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}

		// Check if it's a request for a static file
		if strings.Contains(r.URL.Path, ".") && !strings.HasSuffix(r.URL.Path, ".html") {
			staticFileHandler.ServeHTTP(w, r)
			return
		}

		// Serve index.html for all other routes (SPA)
		w.Header().Set("Content-Type", "text/html")
		http.ServeFile(w, r, "./frontend/index.html")
	})

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8000", "http://localhost:8080", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Serving frontend from: ./frontend/")
	log.Printf("Visit: http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func handleGetPosts(w http.ResponseWriter, r *http.Request, blogHandler *handlers.BlogHandler) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	page := 1
	limit := 6
	searchQuery := r.URL.Query().Get("search")

	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	// Try to get posts from database first
	if blogHandler != nil {
		// If you have a working database, you can try to use the real handler
		// For now, we'll fall back to mock data
	}

	// Use mock data
	mockPosts := getMockPosts()

	// Filter by search query if provided
	if searchQuery != "" {
		mockPosts = filterPostsBySearch(mockPosts, searchQuery)
	}

	// Apply pagination
	total := len(mockPosts)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		mockPosts = []PostResponse{}
	} else {
		if end > total {
			end = total
		}
		mockPosts = mockPosts[start:end]
	}

	response := PostsListResponse{
		Posts: mockPosts,
		Total: total,
		Page:  page,
		Limit: limit,
	}

	json.NewEncoder(w).Encode(response)
}

func handleGetPost(w http.ResponseWriter, r *http.Request, blogHandler *handlers.BlogHandler) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	slug := vars["slug"]

	// Try to get post from database first
	if blogHandler != nil {
		// If you have a working database, you can try to use the real handler
		// For now, we'll fall back to mock data
	}

	// Use mock data
	mockPosts := getMockPosts()

	for _, post := range mockPosts {
		if post.Slug == slug {
			response := SinglePostResponse{Post: post}
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	// Post not found
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Post not found"})
}

func getMockPosts() []PostResponse {
	return []PostResponse{
		{
			ID:          1,
			Title:       "Getting Started with Web Accessibility",
			Slug:        "getting-started-web-accessibility",
			Excerpt:     "Learn the fundamentals of web accessibility and why it's crucial for creating inclusive digital experiences for all users.",
			Content:     "<h2>Introduction to Web Accessibility</h2><p>Web accessibility is about making your website usable by everyone, including people with disabilities. This includes visual, auditory, physical, speech, cognitive, and neurological disabilities.</p><h3>Why Accessibility Matters</h3><p>Accessibility ensures that people with disabilities can perceive, understand, navigate, and interact with your website effectively. It's not just the right thing to do—it's often legally required and makes business sense.</p><h3>Getting Started</h3><p>Start by learning the Web Content Accessibility Guidelines (WCAG) 2.1. These guidelines provide a framework for making web content more accessible to people with disabilities.</p><p>Focus on the four main principles:</p><ul><li><strong>Perceivable</strong> - Information must be presentable in ways users can perceive</li><li><strong>Operable</strong> - Interface components must be operable</li><li><strong>Understandable</strong> - Information and UI operation must be understandable</li><li><strong>Robust</strong> - Content must be robust enough for interpretation by assistive technologies</li></ul>",
			AuthorName:  "Sarah Johnson",
			PublishedAt: time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC),
			Category:    "Accessibility",
			Tags:        []string{"accessibility", "web development", "inclusive design", "WCAG"},
		},
		{
			ID:          2,
			Title:       "ARIA Labels: A Complete Guide",
			Slug:        "aria-labels-complete-guide",
			Excerpt:     "Master the use of ARIA labels to improve screen reader compatibility and enhance the accessibility of your web applications.",
			Content:     "<h2>Understanding ARIA Labels</h2><p>ARIA (Accessible Rich Internet Applications) labels provide additional context to assistive technologies like screen readers. They help users understand the purpose and state of interactive elements.</p><h3>Common ARIA Labels</h3><p>The most commonly used ARIA labels include:</p><ul><li><strong>aria-label</strong> - Provides an accessible name for an element</li><li><strong>aria-labelledby</strong> - References other elements that describe the current element</li><li><strong>aria-describedby</strong> - References elements that provide additional description</li></ul><h3>Best Practices</h3><p>Always test your ARIA labels with actual screen readers. What makes sense visually might not work well for assistive technology users.</p><p>Remember that ARIA labels should supplement, not replace, semantic HTML elements.</p>",
			AuthorName:  "Michael Chen",
			PublishedAt: time.Date(2024, 1, 12, 14, 30, 0, 0, time.UTC),
			Category:    "Technical",
			Tags:        []string{"ARIA", "screen readers", "accessibility", "labels"},
		},
		{
			ID:          3,
			Title:       "Color Contrast in Design",
			Slug:        "color-contrast-design",
			Excerpt:     "Understanding color contrast ratios and how to ensure your designs meet accessibility standards for users with visual impairments.",
			Content:     "<h2>The Importance of Color Contrast</h2><p>Color contrast is crucial for readability. The Web Content Accessibility Guidelines (WCAG) specify minimum contrast ratios that must be met for text and background colors.</p><h3>WCAG Standards</h3><p>WCAG 2.1 requires:</p><ul><li><strong>Level AA</strong> - 4.5:1 contrast ratio for normal text, 3:1 for large text</li><li><strong>Level AAA</strong> - 7:1 contrast ratio for normal text, 4.5:1 for large text</li></ul><h3>Testing Tools</h3><p>Use tools like WebAIM's Color Contrast Checker or browser extensions to verify your color combinations meet accessibility standards.</p><h3>Beyond Compliance</h3><p>Good color contrast benefits everyone, not just users with visual impairments. It improves readability in bright sunlight, on older monitors, and for users with temporary vision issues.</p>",
			AuthorName:  "Emily Rodriguez",
			PublishedAt: time.Date(2024, 1, 8, 9, 15, 0, 0, time.UTC),
			Category:    "Design",
			Tags:        []string{"color", "contrast", "visual design", "WCAG", "testing"},
		},
		{
			ID:          4,
			Title:       "Keyboard Navigation Best Practices",
			Slug:        "keyboard-navigation-best-practices",
			Excerpt:     "Learn how to implement proper keyboard navigation patterns to ensure your website is accessible to users who cannot use a mouse.",
			Content:     "<h2>Keyboard Navigation Fundamentals</h2><p>Keyboard navigation is essential for users with motor disabilities and those who prefer keyboard shortcuts. Proper focus management and logical tab order are critical.</p><h3>Tab Order</h3><p>Ensure your tab order follows a logical sequence that matches the visual layout of your page. Use the tabindex attribute sparingly and preferably with semantic HTML elements.</p><h3>Focus Indicators</h3><p>Always provide visible focus indicators so users can see which element currently has keyboard focus. Never remove focus outlines without providing an alternative.</p><h3>Skip Links</h3><p>Provide skip links to help keyboard users navigate quickly to main content areas, bypassing repetitive navigation elements.</p>",
			AuthorName:  "David Kim",
			PublishedAt: time.Date(2024, 1, 5, 16, 45, 0, 0, time.UTC),
			Category:    "Development",
			Tags:        []string{"keyboard", "navigation", "focus management", "usability"},
		},
		{
			ID:          5,
			Title:       "Screen Reader Testing Guide",
			Slug:        "screen-reader-testing-guide",
			Excerpt:     "A comprehensive guide to testing your websites with popular screen readers like NVDA, JAWS, and VoiceOver.",
			Content:     "<h2>Why Test with Screen Readers?</h2><p>Testing with screen readers is crucial for understanding how blind and visually impaired users experience your website. This guide covers the most popular screen readers and testing techniques.</p><h3>Popular Screen Readers</h3><ul><li><strong>NVDA</strong> - Free and open-source, popular on Windows</li><li><strong>JAWS</strong> - Commercial screen reader, widely used in professional settings</li><li><strong>VoiceOver</strong> - Built into macOS and iOS</li><li><strong>TalkBack</strong> - Android's built-in screen reader</li></ul><h3>Testing Strategies</h3><p>Start by navigating your site with your eyes closed, using only the keyboard and screen reader. Pay attention to how information is announced and whether the navigation makes sense.</p>",
			AuthorName:  "Lisa Thompson",
			PublishedAt: time.Date(2024, 1, 2, 11, 20, 0, 0, time.UTC),
			Category:    "Testing",
			Tags:        []string{"screen readers", "testing", "NVDA", "JAWS", "VoiceOver"},
		},
		{
			ID:          6,
			Title:       "Accessible Form Design",
			Slug:        "accessible-form-design",
			Excerpt:     "Design forms that are usable by everyone with proper labeling, error handling, and validation techniques.",
			Content:     "<h2>Forms and Accessibility</h2><p>Forms are critical interaction points on websites. Accessible forms must have proper labels, clear error messages, and logical grouping to be usable by assistive technologies.</p><h3>Essential Elements</h3><ul><li><strong>Labels</strong> - Every form control needs a proper label</li><li><strong>Fieldsets</strong> - Group related form controls logically</li><li><strong>Error Messages</strong> - Provide clear, helpful error messages</li><li><strong>Instructions</strong> - Give users clear guidance on how to complete forms</li></ul><h3>Validation</h3><p>Implement both client-side and server-side validation. Ensure error messages are associated with the relevant form controls using ARIA attributes.</p>",
			AuthorName:  "James Wilson",
			PublishedAt: time.Date(2023, 12, 28, 13, 10, 0, 0, time.UTC),
			Category:    "UX Design",
			Tags:        []string{"forms", "labels", "validation", "user experience"},
		},
	}
}

func filterPostsBySearch(posts []PostResponse, query string) []PostResponse {
	query = strings.ToLower(query)
	var filtered []PostResponse

	for _, post := range posts {
		if strings.Contains(strings.ToLower(post.Title), query) ||
			strings.Contains(strings.ToLower(post.Excerpt), query) ||
			strings.Contains(strings.ToLower(post.Category), query) {
			filtered = append(filtered, post)
		}

		// Also search in tags
		for _, tag := range post.Tags {
			if strings.Contains(strings.ToLower(tag), query) {
				// Check if already added
				found := false
				for _, f := range filtered {
					if f.ID == post.ID {
						found = true
						break
					}
				}
				if !found {
					filtered = append(filtered, post)
				}
				break
			}
		}
	}

	return filtered
}

func initDatabase() (*gorm.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "samguru")
	dbname := getEnv("DB_NAME", "blog_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := "host=" + host + " user=" + user + " password=" + password + " dbname=" + dbname + " port=" + port + " sslmode=" + sslmode

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
