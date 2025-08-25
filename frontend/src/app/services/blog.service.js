// Blog Service
(function() {
    'use strict';

    angular.module('blogApp')
        .service('BlogService', ['$http', '$q', function($http, $q) {
            var service = this;
            
            // API base URL
            var API_BASE = 'http://localhost:8080/api';
            
            // Sample data for development
            var samplePosts = [
                {
                    id: 1,
                    title: 'Understanding Compensatory Damages in an ADA Context',
                    slug: 'understanding-compensatory-damages-ada-context-1234',
                    content: '<p>In ADA cases, understanding what this mean when seeking both injunctive relief and compensatory damages under Title II cases providing specific case law and specific damages to which the plaintiff is entitled to where proper documentation is provided.</p><p>The Americans with Disabilities Act (ADA) provides several avenues for relief when violations occur. This comprehensive guide explores the nuances of compensatory damages within the framework of ADA litigation, particularly focusing on Title II cases and the documentation required to support damage claims.</p><p>When pursuing ADA violations, plaintiffs often seek both injunctive relief to remedy ongoing accessibility barriers and compensatory damages to address harm already suffered. Understanding the intersection of these remedies is crucial for effective advocacy.</p>',
                    excerpt: 'In ADA cases, understanding what this mean when seeking both injunctive relief and compensatory damages under Title II cases providing specific case law and specific damages.',
                    author_name: 'Legal Expert',
                    category: 'Legal',
                    published_at: '2024-01-15T10:00:00Z',
                    created_at: '2024-01-15T10:00:00Z',
                    updated_at: '2024-01-15T10:00:00Z',
                    tags: ['ADA', 'Legal', 'Compensatory Damages', 'Accessibility'],
                    featured: true
                },
                {
                    id: 2,
                    title: 'Web Accessibility Best Practices for 2024',
                    slug: 'web-accessibility-best-practices-2024-5678',
                    content: '<p>Web accessibility has become more important than ever in 2024. This comprehensive guide covers the latest WCAG 2.1 guidelines and emerging best practices that every web developer should know.</p><p>As digital experiences continue to evolve, ensuring that websites and applications are accessible to all users, including those with disabilities, is not just a legal requirement but a moral imperative. This article explores practical implementation strategies and tools that can help create more inclusive digital experiences.</p><p>From semantic HTML to proper color contrast ratios, we will cover everything you need to know to make your websites accessible to everyone.</p>',
                    excerpt: 'Web accessibility has become more important than ever in 2024. This comprehensive guide covers the latest WCAG 2.1 guidelines and emerging best practices.',
                    author_name: 'Web Developer',
                    category: 'Technology',
                    published_at: '2024-01-20T14:30:00Z',
                    created_at: '2024-01-20T14:30:00Z',
                    updated_at: '2024-01-20T14:30:00Z',
                    tags: ['Accessibility', 'WCAG', 'Web Development', 'UX'],
                    featured: true
                },
                {
                    id: 3,
                    title: 'The Impact of Digital Accessibility on Business Success',
                    slug: 'digital-accessibility-business-success-9012',
                    content: '<p>Digital accessibility is not just about compliance—it is about creating better experiences for all users and driving business value. Research shows that accessible websites perform better across multiple metrics.</p><p>Companies that prioritize accessibility see improvements in SEO rankings, user engagement, and customer satisfaction. This article examines real-world case studies and provides actionable insights for business leaders looking to champion accessibility initiatives.</p><p>We will explore the business case for accessibility, from legal risk mitigation to market expansion opportunities.</p>',
                    excerpt: 'Digital accessibility is not just about compliance—it is about creating better experiences for all users and driving business value.',
                    author_name: 'Business Analyst',
                    category: 'Business',
                    published_at: '2024-01-25T09:15:00Z',
                    created_at: '2024-01-25T09:15:00Z',
                    updated_at: '2024-01-25T09:15:00Z',
                    tags: ['Business', 'Accessibility', 'Digital Strategy', 'ROI'],
                    featured: false
                },
                {
                    id: 4,
                    title: 'Creating Inclusive User Interfaces',
                    slug: 'creating-inclusive-user-interfaces-3456',
                    content: '<p>Learn how to design and develop user interfaces that work for everyone, including users with disabilities. This comprehensive guide covers the principles of inclusive design and practical implementation strategies.</p><p>Inclusive design benefits all users, not just those with disabilities. By following these principles, you can create interfaces that are more usable, accessible, and effective for everyone.</p>',
                    excerpt: 'Learn how to design and develop user interfaces that work for everyone, including users with disabilities.',
                    author_name: 'UX Designer',
                    category: 'Design',
                    published_at: '2024-01-30T11:45:00Z',
                    created_at: '2024-01-30T11:45:00Z',
                    updated_at: '2024-01-30T11:45:00Z',
                    tags: ['UI/UX', 'Inclusive Design', 'Accessibility', 'User Experience'],
                    featured: false
                },
                {
                    id: 5,
                    title: 'Accessibility Testing Tools and Techniques',
                    slug: 'accessibility-testing-tools-techniques-7890',
                    content: '<p>A comprehensive guide to testing your website or application for accessibility compliance and user experience. Learn about automated testing tools, manual testing techniques, and best practices for accessibility testing.</p><p>Testing for accessibility should be an ongoing process throughout the development lifecycle, not just a final check before launch.</p>',
                    excerpt: 'A comprehensive guide to testing your website or application for accessibility compliance and user experience.',
                    author_name: 'QA Engineer',
                    category: 'Testing',
                    published_at: '2024-02-05T16:20:00Z',
                    created_at: '2024-02-05T16:20:00Z',
                    updated_at: '2024-02-05T16:20:00Z',
                    tags: ['Testing', 'Accessibility', 'Tools', 'Quality Assurance'],
                    featured: false
                },
                {
                    id: 6,
                    title: 'Building Accessible Mobile Applications',
                    slug: 'building-accessible-mobile-applications-2468',
                    content: '<p>Mobile accessibility is crucial for reaching all users. Learn the key principles and implementation strategies for building accessible mobile applications on iOS and Android platforms.</p><p>This guide covers platform-specific accessibility features, testing strategies, and common pitfalls to avoid when developing mobile apps.</p>',
                    excerpt: 'Mobile accessibility is crucial for reaching all users. Learn the key principles and implementation strategies.',
                    author_name: 'Mobile Developer',
                    category: 'Mobile',
                    published_at: '2024-02-10T13:30:00Z',
                    created_at: '2024-02-10T13:30:00Z',
                    updated_at: '2024-02-10T13:30:00Z',
                    tags: ['Mobile', 'Accessibility', 'iOS', 'Android'],
                    featured: false
                }
            ];

            // Get all posts with pagination and search
            service.getPosts = function(page, limit, search) {
                page = page || 1;
                limit = limit || 6;
                
                var deferred = $q.defer();
                
                // Try to get from API first
                var params = {
                    page: page,
                    limit: limit
                };
                
                if (search) {
                    params.search = search;
                }
                
                $http.get(API_BASE + '/posts', { params: params })
                    .then(function(response) {
                        deferred.resolve(response.data);
                    })
                    .catch(function(error) {
                        console.log('API not available, using sample data');
                        // Fallback to sample data
                        var filteredPosts = search ? filterPosts(samplePosts, search) : samplePosts;
                        var paginatedResult = paginatePosts(filteredPosts, page, limit);
                        deferred.resolve(paginatedResult);
                    });
                
                return deferred.promise;
            };

            // Get single post by slug
            service.getPostBySlug = function(slug) {
                var deferred = $q.defer();
                
                $http.get(API_BASE + '/posts/' + slug)
                    .then(function(response) {
                        var post = response.data;
                        post.tags = processTags(post.tags);
                        deferred.resolve(post);
                    })
                    .catch(function(error) {
                        console.log('API not available, using sample data');
                        // Fallback to sample data
                        var post = samplePosts.find(function(p) {
                            return p.slug === slug;
                        });
                        
                        if (post) {
                            deferred.resolve(post);
                        } else {
                            deferred.reject({ status: 404, message: 'Post not found' });
                        }
                    });
                
                return deferred.promise;
            };

            // Helper functions
            function filterPosts(posts, searchQuery) {
                if (!searchQuery) return posts;
                
                var query = searchQuery.toLowerCase();
                return posts.filter(function(post) {
                    return post.title.toLowerCase().includes(query) ||
                           post.excerpt.toLowerCase().includes(query) ||
                           post.author_name.toLowerCase().includes(query) ||
                           post.tags.some(function(tag) {
                               return tag.toLowerCase().includes(query);
                           });
                });
            }

            function paginatePosts(posts, page, limit) {
                var startIndex = (page - 1) * limit;
                var endIndex = startIndex + limit;
                var paginatedPosts = posts.slice(startIndex, endIndex);
                
                return {
                    posts: paginatedPosts,
                    current_page: page,
                    total_pages: Math.ceil(posts.length / limit),
                    total_posts: posts.length,
                    has_next: endIndex < posts.length,
                    has_prev: page > 1
                };
            }

            function processTags(tags) {
                if (typeof tags === 'string' && tags) {
                    return tags.split(',').map(function(tag) {
                        return tag.trim();
                    });
                }
                return tags || [];
            }
        }]);
})();