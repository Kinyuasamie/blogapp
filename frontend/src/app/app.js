-
        // Main AngularJS Application
        (function() {
            'use strict';

            // Create the main module
            var app = angular.module('blogApp', [
                'ngRoute',
                'ngMaterial',
                'ngMessages',
                'ngSanitize'
            ]);

            // Configuration
            app.config(['$routeProvider', '$locationProvider', '$mdThemingProvider', '$httpProvider',
                function($routeProvider, $locationProvider, $mdThemingProvider, $httpProvider) {
                    
                    // Configure routes
                    $routeProvider
                        .when('/', {
                            templateUrl: 'blog-list.html',
                            controller: 'BlogListController',
                            controllerAs: 'vm'
                        })
                        .when('/post/:slug', {
                            templateUrl: 'blog-post.html',
                            controller: 'BlogPostController',
                            controllerAs: 'vm'
                        })
                        .when('/search', {
                            templateUrl: 'search-results.html',
                            controller: 'SearchController',
                            controllerAs: 'vm'
                        })
                        .otherwise({
                            redirectTo: '/'
                        });

                    // Configure Material Design theme
                    $mdThemingProvider.theme('default')
                        .primaryPalette('blue')
                        .accentPalette('grey')
                        .warnPalette('red');

                    // Configure HTTP interceptors
                    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
                }
            ]);

            // Main Controller
            app.controller('MainController', ['$scope', '$location', '$mdSidenav', 'BlogService',
                function($scope, $location, $mdSidenav, BlogService) {
                    var vm = this;
                    
                    vm.searchQuery = '';
                    vm.isSearching = false;

                    // Navigation methods
                    vm.goHome = function() {
                        $location.path('/');
                    };

                    vm.search = function() {
                        if (vm.searchQuery.trim()) {
                            $location.path('/search').search('q', vm.searchQuery.trim());
                        }
                    };

                    vm.clearSearch = function() {
                        vm.searchQuery = '';
                        $location.path('/').search('q', null);
                    };

                    vm.toggleSidenav = function() {
                        $mdSidenav('left').toggle();
                    };

                    // Watch for route changes to update search query
                    $scope.$on('$routeChangeStart', function(event, next, current) {
                        if (next.$$route && next.$$route.originalPath === '/search') {
                            vm.searchQuery = $location.search().q || '';
                        }
                    });
                }
            ]);

            // Blog List Controller
            app.controller('BlogListController', ['$location', 'BlogService', 'UtilService',
                function($location, BlogService, UtilService) {
                    var vm = this;
                    
                    // State
                    vm.posts = [];
                    vm.isLoading = true;
                    vm.error = null;
                    vm.currentPage = 1;
                    vm.postsPerPage = 6;
                    vm.totalPosts = 0;
                    vm.totalPages = 0;
                    vm.searchQuery = $location.search().q || '';

                    // Computed properties
                    vm.hasPrev = false;
                    vm.hasNext = false;

                    // Methods
                    vm.loadPosts = function() {
                        vm.isLoading = true;
                        vm.error = null;

                        BlogService.getPosts(vm.currentPage, vm.postsPerPage, vm.searchQuery)
                            .then(function(response) {
                                // Simulate API response structure
                                vm.posts = response.posts || vm.generateMockPosts();
                                vm.totalPosts = response.total || vm.posts.length;
                                vm.totalPages = Math.ceil(vm.totalPosts / vm.postsPerPage);
                                vm.hasPrev = vm.currentPage > 1;
                                vm.hasNext = vm.currentPage < vm.totalPages;
                                vm.isLoading = false;
                            })
                            .catch(function(error) {
                                console.log('API not available, using mock data');
                                vm.posts = vm.generateMockPosts();
                                vm.totalPosts = vm.posts.length;
                                vm.totalPages = Math.ceil(vm.totalPosts / vm.postsPerPage);
                                vm.hasPrev = vm.currentPage > 1;
                                vm.hasNext = vm.currentPage < vm.totalPages;
                                vm.isLoading = false;
                            });
                    };

                    vm.generateMockPosts = function() {
                        return [
                            {
                                id: 1,
                                title: "Getting Started with Web Accessibility",
                                slug: "getting-started-web-accessibility",
                                excerpt: "Learn the fundamentals of web accessibility and why it's crucial for creating inclusive digital experiences for all users.",
                                content: "Web accessibility is about making your website usable by everyone, including people with disabilities. This includes visual, auditory, physical, speech, cognitive, and neurological disabilities.",
                                author_name: "Sarah Johnson",
                                published_at: "2024-01-15T10:00:00Z",
                                category: "Accessibility",
                                tags: ["accessibility", "web development", "inclusive design"]
                            },
                            {
                                id: 2,
                                title: "ARIA Labels: A Complete Guide",
                                slug: "aria-labels-complete-guide",
                                excerpt: "Master the use of ARIA labels to improve screen reader compatibility and enhance the accessibility of your web applications.",
                                content: "ARIA (Accessible Rich Internet Applications) labels provide additional context to assistive technologies like screen readers. They help users understand the purpose and state of interactive elements.",
                                author_name: "Michael Chen",
                                published_at: "2024-01-12T14:30:00Z",
                                category: "Technical",
                                tags: ["ARIA", "screen readers", "accessibility"]
                            },
                            {
                                id: 3,
                                title: "Color Contrast in Design",
                                slug: "color-contrast-design",
                                excerpt: "Understanding color contrast ratios and how to ensure your designs meet accessibility standards for users with visual impairments.",
                                content: "Color contrast is crucial for readability. The Web Content Accessibility Guidelines (WCAG) specify minimum contrast ratios that must be met for text and background colors.",
                                author_name: "Emily Rodriguez",
                                published_at: "2024-01-08T09:15:00Z",
                                category: "Design",
                                tags: ["color", "contrast", "visual design", "WCAG"]
                            },
                            {
                                id: 4,
                                title: "Keyboard Navigation Best Practices",
                                slug: "keyboard-navigation-best-practices",
                                excerpt: "Learn how to implement proper keyboard navigation patterns to ensure your website is accessible to users who cannot use a mouse.",
                                content: "Keyboard navigation is essential for users with motor disabilities and those who prefer keyboard shortcuts. Proper focus management and logical tab order are critical.",
                                author_name: "David Kim",
                                published_at: "2024-01-05T16:45:00Z",
                                category: "Development",
                                tags: ["keyboard", "navigation", "focus management"]
                            },
                            {
                                id: 5,
                                title: "Screen Reader Testing Guide",
                                slug: "screen-reader-testing-guide",
                                excerpt: "A comprehensive guide to testing your websites with popular screen readers like NVDA, JAWS, and VoiceOver.",
                                content: "Testing with screen readers is crucial for understanding how blind and visually impaired users experience your website. This guide covers the most popular screen readers and testing techniques.",
                                author_name: "Lisa Thompson",
                                published_at: "2024-01-02T11:20:00Z",
                                category: "Testing",
                                tags: ["screen readers", "testing", "NVDA", "JAWS", "VoiceOver"]
                            },
                            {
                                id: 6,
                                title: "Accessible Form Design",
                                slug: "accessible-form-design",
                                excerpt: "Design forms that are usable by everyone with proper labeling, error handling, and validation techniques.",
                                content: "Forms are critical interaction points on websites. Accessible forms must have proper labels, clear error messages, and logical grouping to be usable by assistive technologies.",
                                author_name: "James Wilson",
                                published_at: "2023-12-28T13:10:00Z",
                                category: "UX Design",
                                tags: ["forms", "labels", "validation", "user experience"]
                            }
                        ];
                    };

                    vm.readPost = function(slug) {
                        $location.path('/post/' + slug);
                    };

                    vm.goToPage = function(page) {
                        vm.currentPage = page;
                        vm.loadPosts();
                    };

                    vm.nextPage = function() {
                        if (vm.hasNext) {
                            vm.goToPage(vm.currentPage + 1);
                        }
                    };

                    vm.prevPage = function() {
                        if (vm.hasPrev) {
                            vm.goToPage(vm.currentPage - 1);
                        }
                    };

                    vm.getPageNumbers = function() {
                        var pages = [];
                        var start = Math.max(1, vm.currentPage - 2);
                        var end = Math.min(vm.totalPages, vm.currentPage + 2);
                        
                        for (var i = start; i <= end; i++) {
                            pages.push(i);
                        }
                        return pages;
                    };

                    // Utility methods
                    vm.formatDate = UtilService.formatDate;
                    vm.truncateText = UtilService.truncateText;

                    // Initialize
                    vm.loadPosts();
                }
            ]);

            // Blog Post Controller
            app.controller('BlogPostController', ['$routeParams', '$location', 'BlogService', 'UtilService',
                function($routeParams, $location, BlogService, UtilService) {
                    var vm = this;
                    
                    // State
                    vm.post = null;
                    vm.isLoading = true;
                    vm.error = null;
                    vm.slug = $routeParams.slug;

                    // Methods
                    vm.loadPost = function() {
                        vm.isLoading = true;
                        vm.error = null;

                        BlogService.getPostBySlug(vm.slug)
                            .then(function(response) {
                                vm.post = response.post || vm.getMockPost(vm.slug);
                                vm.isLoading = false;
                            })
                            .catch(function(error) {
                                console.log('API not available, using mock data');
                                vm.post = vm.getMockPost(vm.slug);
                                if (!vm.post) {
                                    vm.error = "Post not found";
                                }
                                vm.isLoading = false;
                            });
                    };

                    vm.getMockPost = function(slug) {
                        var posts = {
                            "getting-started-web-accessibility": {
                                id: 1,
                                title: "Getting Started with Web Accessibility",
                                slug: "getting-started-web-accessibility",
                                content: "<p>Web accessibility is about making your website usable by everyone, including people with disabilities. This includes visual, auditory, physical, speech, cognitive, and neurological disabilities.</p><h3>Why Accessibility Matters</h3><p>Accessibility ensures that people with disabilities can perceive, understand, navigate, and interact with your website effectively. It's not just the right thing to do—it's often legally required and makes business sense.</p><h3>Getting Started</h3><p>Start by learning the Web Content Accessibility Guidelines (WCAG) 2.1. These guidelines provide a framework for making web content more accessible to people with disabilities.</p><p>Focus on the four main principles:</p><ul><li><strong>Perceivable</strong> - Information must be presentable in ways users can perceive</li><li><strong>Operable</strong> - Interface components must be operable</li><li><strong>Understandable</strong> - Information and UI operation must be understandable</li><li><strong>Robust</strong> - Content must be robust enough for interpretation by assistive technologies</li></ul>",
                                author_name: "Sarah Johnson",
                                published_at: "2024-01-15T10:00:00Z",
                                category: "Accessibility",
                                tags: ["accessibility", "web development", "inclusive design", "WCAG"]
                            },
                            "aria-labels-complete-guide": {
                                id: 2,
                                title: "ARIA Labels: A Complete Guide",
                                slug: "aria-labels-complete-guide",
                                content: "<p>ARIA (Accessible Rich Internet Applications) labels provide additional context to assistive technologies like screen readers. They help users understand the purpose and state of interactive elements.</p><h3>Common ARIA Labels</h3><p>The most commonly used ARIA labels include:</p><ul><li><strong>aria-label</strong> - Provides an accessible name for an element</li><li><strong>aria-labelledby</strong> - References other elements that describe the current element</li><li><strong>aria-describedby</strong> - References elements that provide additional description</li></ul><h3>Best Practices</h3><p>Always test your ARIA labels with actual screen readers. What makes sense visually might not work well for assistive technology users.</p>",
                                author_name: "Michael Chen",
                                published_at: "2024-01-12T14:30:00Z",
                                category: "Technical",
                                tags: ["ARIA", "screen readers", "accessibility", "labels"]
                            },
                            "color-contrast-design": {
                                id: 3,
                                title: "Color Contrast in Design",
                                slug: "color-contrast-design",
                                content: "<p>Color contrast is crucial for readability. The Web Content Accessibility Guidelines (WCAG) specify minimum contrast ratios that must be met for text and background colors.</p><h3>WCAG Standards</h3><p>WCAG 2.1 requires:</p><ul><li><strong>Level AA</strong> - 4.5:1 contrast ratio for normal text, 3:1 for large text</li><li><strong>Level AAA</strong> - 7:1 contrast ratio for normal text, 4.5:1 for large text</li></ul><h3>Testing Tools</h3><p>Use tools like WebAIM's Color Contrast Checker or browser extensions to verify your color combinations meet accessibility standards.</p>",
                                author_name: "Emily Rodriguez",
                                published_at: "2024-01-08T09:15:00Z",
                                category: "Design",
                                tags: ["color", "contrast", "visual design", "WCAG", "testing"]
                            }
                        };
                        return posts[slug] || null;
                    };

                    vm.goBack = function() {
                        $location.path('/');
                    };

                    vm.getReadingTime = function(content) {
                        if (!content) return 0;
                        var wordsPerMinute = 200;
                        var textContent = content.replace(/<[^>]*>/g, '');
                        var wordCount = textContent.split(/\s+/).length;
                        return Math.ceil(wordCount / wordsPerMinute);
                    };

                    // Utility methods
                    vm.formatDate = UtilService.formatDate;

                    // Initialize
                    vm.loadPost();
                }
            ]);

            // Search Controller
            app.controller('SearchController', ['$location', 'BlogService', 'UtilService',
                function($location, BlogService, UtilService) {
                    var vm = this;
                    
                    // State
                    vm.results = [];
                    vm.isLoading = true;
                    vm.error = null;
                    vm.searchQuery = $location.search().q || '';
                    vm.totalResults = 0;

                    // Methods
                    vm.search = function() {
                        if (!vm.searchQuery.trim()) {
                            vm.results = [];
                            vm.totalResults = 0;
                            vm.isLoading = false;
                            return;
                        }

                        vm.isLoading = true;
                        vm.error = null;

                        BlogService.getPosts(1, 20, vm.searchQuery)
                            .then(function(response) {
                                vm.results = response.posts || vm.searchMockPosts(vm.searchQuery);
                                vm.totalResults = vm.results.length;
                                vm.isLoading = false;
                            })
                            .catch(function(error) {
                                console.log('API not available, using mock search');
                                vm.results = vm.searchMockPosts(vm.searchQuery);
                                vm.totalResults = vm.results.length;
                                vm.isLoading = false;
                            });
                    };

                    vm.searchMockPosts = function(query) {
                        var allPosts = [
                            {
                                id: 1,
                                title: "Getting Started with Web Accessibility",
                                slug: "getting-started-web-accessibility",
                                excerpt: "Learn the fundamentals of web accessibility and why it's crucial for creating inclusive digital experiences for all users.",
                                author_name: "Sarah Johnson",
                                published_at: "2024-01-15T10:00:00Z",
                                category: "Accessibility"
                            },
                            {
                                id: 2,
                                title: "ARIA Labels: A Complete Guide",
                                slug: "aria-labels-complete-guide",
                                excerpt: "Master the use of ARIA labels to improve screen reader compatibility and enhance the accessibility of your web applications.",
                                author_name: "Michael Chen",
                                published_at: "2024-01-12T14:30:00Z",
                                category: "Technical"
                            },
                            {
                                id: 3,
                                title: "Color Contrast in Design",
                                slug: "color-contrast-design",
                                excerpt: "Understanding color contrast ratios and how to ensure your designs meet accessibility standards for users with visual impairments.",
                                author_name: "Emily Rodriguez",
                                published_at: "2024-01-08T09:15:00Z",
                                category: "Design"
                            }
                        ];

                        return allPosts.filter(function(post) {
                            var searchTerm = query.toLowerCase();
                            return post.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                                   post.excerpt.toLowerCase().indexOf(searchTerm) !== -1 ||
                                   post.category.toLowerCase().indexOf(searchTerm) !== -1;
                        });
                    };

                    vm.readPost = function(slug) {
                        $location.path('/post/' + slug);
                    };

                    // Utility methods
                    vm.formatDate = UtilService.formatDate;
                    vm.truncateText = UtilService.truncateText;

                    // Initialize
                    vm.search();
                }
            ]);

            // Blog Service
            app.service('BlogService', ['$http', '$q', function($http, $q) {
                var service = this;
                var API_BASE = 'http://localhost:8080/api';

                // Get all posts with pagination and search
                service.getPosts = function(page, limit, searchQuery, category) {
                    var params = {
                        page: page || 1,
                        limit: limit || 6
                    };

                    if (searchQuery) {
                        params.search = searchQuery;
                    }

                    if (category) {
                        params.category = category;
                    }

                    return $http.get(API_BASE + '/posts', { params: params })
                        .then(function(response) {
                            return response.data;
                        })
                        .catch(function(error) {
                            console.error('Error fetching posts:', error);
                            return $q.reject(error);
                        });
                };

                // Get single post by slug
                service.getPostBySlug = function(slug) {
                    return $http.get(API_BASE + '/posts/' + slug)
                        .then(function(response) {
                            return response.data;
                        })
                        .catch(function(error) {
                            console.error('Error fetching post:', error);
                            return $q.reject(error);
                        });
                };

                // Create new post
                service.createPost = function(postData) {
                    return $http.post(API_BASE + '/posts', postData)
                        .then(function(response) {
                            return response.data;
                        })
                        .catch(function(error) {
                            console.error('Error creating post:', error);
                            return $q.reject(error);
                        });
                };
            }]);

            // Utility Service
            app.service('UtilService', [function() {
                var service = this;

                service.formatDate = function(dateString) {
                    if (!dateString) return '';
                    var date = new Date(dateString);
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                };

                service.truncateText = function(text, maxLength) {
                    if (!text || text.length <= maxLength) return text;
                    return text.substring(0, maxLength) + '...';
                };

                service.debounce = function(func, wait) {
                    var timeout;
                    return function executedFunction() {
                        var context = this;
                        var args = arguments;
                        var later = function() {
                            timeout = null;
                            func.apply(context, args);
                        };
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                    };
                };
            }]);

        })();
