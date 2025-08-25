// Search Controller
(function() {
    'use strict';

    angular.module('blogApp')
        .controller('SearchController', ['$location', 'BlogService', 'UtilService', '$timeout',
            function($location, BlogService, UtilService, $timeout) {
                var vm = this;

                // Initialize properties
                vm.searchQuery = $location.search().q || '';
                vm.posts = [];
                vm.currentPage = 1;
                vm.totalPages = 1;
                vm.totalPosts = 0;
                vm.hasNext = false;
                vm.hasPrev = false;
                vm.isLoading = false;
                vm.error = null;
                vm.hasSearched = false;

                // Pagination settings
                vm.postsPerPage = 6;

                // Methods
                vm.search = search;
                vm.clearSearch = clearSearch;
                vm.goToPage = goToPage;
                vm.nextPage = nextPage;
                vm.prevPage = prevPage;
                vm.readPost = readPost;
                vm.formatDate = UtilService.formatDate;
                vm.truncateText = UtilService.truncateText;
                vm.getPageNumbers = getPageNumbers;

                // Debounced search function
                vm.debouncedSearch = UtilService.debounce(function() {
                    if (vm.searchQuery.trim()) {
                        vm.currentPage = 1;
                        performSearch();
                    }
                }, 500);

                // Initialize
                init();

                function init() {
                    var page = parseInt($location.search().page) || 1;
                    vm.currentPage = page;
                    
                    if (vm.searchQuery.trim()) {
                        performSearch();
                    }
                }

                function search() {
                    if (vm.searchQuery.trim()) {
                        vm.currentPage = 1;
                        $location.search('q', vm.searchQuery.trim()).search('page', null);
                        performSearch();
                    }
                }

                function clearSearch() {
                    vm.searchQuery = '';
                    vm.posts = [];
                    vm.hasSearched = false;
                    vm.error = null;
                    $location.search('q', null).search('page', null);
                }

                function performSearch() {
                    if (!vm.searchQuery.trim()) {
                        return;
                    }

                    vm.isLoading = true;
                    vm.error = null;
                    vm.hasSearched = true;

                    BlogService.getPosts(vm.currentPage, vm.postsPerPage, vm.searchQuery.trim())
                        .then(function(data) {
                            vm.posts = data.posts || [];
                            vm.currentPage = data.current_page || 1;
                            vm.totalPages = data.total_pages || 1;
                            vm.totalPosts = data.total_posts || 0;
                            vm.hasNext = data.has_next || false;
                            vm.hasPrev = data.has_prev || false;

                            // Update URL
                            $location.search('page', vm.currentPage > 1 ? vm.currentPage : null);
                        })
                        .catch(function(error) {
                            vm.error = 'Search failed. Please try again.';
                            vm.posts = [];
                        })
                        .finally(function() {
                            vm.isLoading = false;
                        });
                }

                function goToPage(page) {
                    if (page >= 1 && page <= vm.totalPages && page !== vm.currentPage) {
                        vm.currentPage = page;
                        performSearch();
                        scrollToTop();
                    }
                }

                function nextPage() {
                    if (vm.hasNext) {
                        goToPage(vm.currentPage + 1);
                    }
                }

                function prevPage() {
                    if (vm.hasPrev) {
                        goToPage(vm.currentPage - 1);
                    }
                }

                function readPost(slug) {
                    $location.path('/post/' + slug);
                }

                function getPageNumbers() {
                    var pages = [];
                    var start = Math.max(1, vm.currentPage - 2);
                    var end = Math.min(vm.totalPages, start + 4);

                    if (end - start < 4) {
                        start = Math.max(1, end - 4);
                    }

                    for (var i = start; i <= end; i++) {
                        pages.push(i);
                    }

                    return pages;
                }

                function scrollToTop() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }

                // Watch for search query changes
                vm.$watch = function() {
                    // Watch search query changes in URL
                    var searchParams = $location.search();
                    var newQuery = searchParams.q || '';
                    
                    if (newQuery !== vm.searchQuery) {
                        vm.searchQuery = newQuery;
                        if (newQuery.trim()) {
                            vm.currentPage = parseInt(searchParams.page) || 1;
                            performSearch();
                        } else {
                            clearSearch();
                        }
                    }
                };
            }
        ]);

    // Search Results Template
    angular.module('blogApp').run(['$templateCache', function($templateCache) {
        $templateCache.put('src/app/components/search/search-results.html',
            `<div class="min-h-screen">
                
                <!-- Search Header -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Search Blogs</h2>
                    
                    <!-- Search Input -->
                    <div class="max-w-2xl">
                        <div class="relative">
                            <input type="search"
                                   ng-model="vm.searchQuery"
                                   ng-change="vm.debouncedSearch()"
                                   ng-keypress="$event.keyCode === 13 && vm.search()"
                                   placeholder="Search for blog posts..."
                                   class="w-full px-4 py-3 pl-12 pr-20 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   aria-label="Search blog posts">
                            <i class="material-icons absolute left-4 top-3.5 text-gray-400">search</i>
                            
                            <!-- Clear Button -->
                            <button ng-if="vm.searchQuery" 
                                    ng-click="vm.clearSearch()"
                                    class="absolute right-12 top-3 text-gray-400 hover:text-gray-600"
                                    aria-label="Clear search">
                                <i class="material-icons">close</i>
                            </button>
                            
                            <!-- Search Button -->
                            <button ng-click="vm.search()"
                                    class="absolute right-2 top-2 bg-blue-500 text-white px-4 py-1.5 rounded-md hover:bg-blue-600 transition-colors"
                                    aria-label="Search">
                                <i class="material-icons">search</i>
                            </button>
                        </div>
                        
                        <!-- Search Tips -->
                        <div ng-if="!vm.hasSearched" class="mt-4 text-sm text-gray-500">
                            <p><strong>Search tips:</strong> Try keywords from post titles, content, or tags. Use specific terms for better results.</p>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div ng-if="vm.isLoading" class="flex justify-center py-12">
                    <div class="text-center">
                        <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                        <p class="mt-4 text-gray-600">Searching posts...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div ng-if="vm.error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center">
                        <i class="material-icons text-red-500 mr-3">error</i>
                        <p class="text-red-700">{{vm.error}}</p>
                    </div>
                    <button ng-click="vm.search()" class="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Try Again
                    </button>
                </div>

                <!-- Search Results Header -->
                <div ng-if="vm.hasSearched && !vm.isLoading" class="mb-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <p class="text-blue-800">
                                    <span ng-if="vm.totalPosts > 0">
                                        Found <strong>{{vm.totalPosts}}</strong> result{{vm.totalPosts !== 1 ? 's' : ''}} for 
                                        <strong>"{{vm.searchQuery}}"</strong>
                                    </span>
                                    <span ng-if="vm.totalPosts === 0">
                                        No results found for <strong>"{{vm.searchQuery}}"</strong>
                                    </span>
                                </p>
                                <p ng-if="vm.totalPosts > 0" class="text-blue-600 text-sm mt-1">
                                    Showing {{((vm.currentPage - 1) * vm.postsPerPage) + 1}}-{{Math.min(vm.currentPage * vm.postsPerPage, vm.totalPosts)}} 
                                    of {{vm.totalPosts}}
                                </p>
                            </div>
                            <button ng-click="vm.clearSearch()" 
                                    class="text-blue-600 hover:text-blue-800 flex items-center">
                                <i class="material-icons mr-1">close</i>
                                Clear Search
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Search Results -->
                <div ng-if="!vm.isLoading && vm.posts.length > 0" 
                     class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    
                    <article ng-repeat="post in vm.posts" 
                            class="blog-card cursor-pointer"
                            ng-click="vm.readPost(post.slug)"
                            role="button"
                            tabindex="0"
                            ng-keypress="$event.keyCode === 13 && vm.readPost(post.slug)"
                            aria-label="Read full post: {{post.title}}">
                        
                        <!-- Image Placeholder -->
                        <div class="blog-image-placeholder">
                            <i class="material-icons text-4xl">image</i>
                        </div>
                        
                        <!-- Card Content -->
                        <div class="p-6">
                            <!-- Post Meta -->
                            <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
                                <span>{{vm.formatDate(post.published_at)}}</span>
                                <span ng-if="post.category" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {{post.category}}
                                </span>
                            </div>
                            
                            <!-- Title with Search Highlight -->
                            <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2"
                                ng-bind-html="post.title | searchHighlight:vm.searchQuery">
                            </h3>
                            
                            <!-- Excerpt with Search Highlight -->
                            <p class="text-gray-600 mb-4 line-clamp-3"
                               ng-bind-html="vm.truncateText(post.excerpt, 120) | searchHighlight:vm.searchQuery">
                            </p>
                            
                            <!-- Author & Read More -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-500">
                                    By {{post.author_name}}
                                </span>
                                <span class="text-blue-500 hover:text-blue-700 font-medium text-sm flex items-center">
                                    Read More
                                    <i class="material-icons ml-1 text-sm">arrow_forward</i>
                                </span>
                            </div>
                            
                            <!-- Tags -->
                            <div ng-if="post.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
                                <span ng-repeat="tag in post.tags.slice(0, 3)" 
                                      class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                                      ng-bind-html="tag | searchHighlight:vm.searchQuery">
                                </span>
                                <span ng-if="post.tags.length > 3" class="text-gray-400 text-xs">
                                    +{{post.tags.length - 3}} more
                                </span>
                            </div>
                        </div>
                    </article>
                </div>

                <!-- No Results State -->
                <div ng-if="!vm.isLoading && vm.hasSearched && vm.posts.length === 0" class="text-center py-12">
                    <i class="material-icons text-6xl text-gray-300 mb-4">search_off</i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
                    <p class="text-gray-500 mb-6 max-w-md mx-auto">
                        We couldn't find any posts matching "<strong>{{vm.searchQuery}}</strong>". 
                        Try different keywords or check your spelling.
                    </p>
                    <div class="space-x-4">
                        <button ng-click="vm.clearSearch()" 
                                class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                            Clear Search
                        </button>
                        <a href="#!/" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 inline-block">
                            Browse All Posts
                        </a>
                    </div>
                </div>

                <!-- Initial State -->
                <div ng-if="!vm.hasSearched && !vm.isLoading" class="text-center py-12">
                    <i class="material-icons text-6xl text-gray-300 mb-4">search</i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Search Our Blog</h3>
                    <p class="text-gray-500 mb-6">
                        Enter keywords to find blog posts on topics that interest you.
                    </p>
                </div>

                <!-- Pagination -->
                <nav ng-if="vm.totalPages > 1" class="pagination-container" aria-label="Search results pagination">
                    
                    <!-- Previous Button -->
                    <button ng-click="vm.prevPage()" 
                            ng-disabled="!vm.hasPrev"
                            class="pagination-btn"
                            aria-label="Previous page">
                        <i class="material-icons">chevron_left</i>
                    </button>

                    <!-- First Page -->
                    <button ng-if="vm.getPageNumbers()[0] > 1"
                            ng-click="vm.goToPage(1)"
                            class="pagination-btn"
                            aria-label="Go to page 1">
                        1
                    </button>
                    
                    <!-- Ellipsis -->
                    <span ng-if="vm.getPageNumbers()[0] > 2" class="pagination-btn" style="border: none; cursor: default;">
                        ...
                    </span>

                    <!-- Page Numbers -->
                    <button ng-repeat="page in vm.getPageNumbers()"
                            ng-click="vm.goToPage(page)"
                            ng-class="{'active': page === vm.currentPage}"
                            class="pagination-btn"
                            aria-label="Go to page {{page}}"
                            aria-current="{{page === vm.currentPage ? 'page' : null}}">
                        {{page}}
                    </button>

                    <!-- Ellipsis -->
                    <span ng-if="vm.getPageNumbers()[vm.getPageNumbers().length - 1] < vm.totalPages - 1" 
                          class="pagination-btn" style="border: none; cursor: default;">
                        ...
                    </span>

                    <!-- Last Page -->
                    <button ng-if="vm.getPageNumbers()[vm.getPageNumbers().length - 1] < vm.totalPages"
                            ng-click="vm.goToPage(vm.totalPages)"
                            class="pagination-btn"
                            aria-label="Go to page {{vm.totalPages}}">
                        {{vm.totalPages}}
                    </button>

                    <!-- Next Button -->
                    <button ng-click="vm.nextPage()" 
                            ng-disabled="!vm.hasNext"
                            class="pagination-btn"
                            aria-label="Next page">
                        <i class="material-icons">chevron_right</i>
                    </button>
                </nav>

                <!-- Page Info -->
                <div ng-if="vm.totalPages > 1" class="text-center text-sm text-gray-500 mt-4">
                    Page {{vm.currentPage}} of {{vm.totalPages}}
                </div>
            </div>`
        );
    }]);

    // Search Highlight Filter
    angular.module('blogApp').filter('searchHighlight', ['$sce', function($sce) {
        return function(text, searchQuery) {
            if (!searchQuery || !text) {
                return text;
            }

            var regex = new RegExp('(' + searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            var highlightedText = text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
            
            return $sce.trustAsHtml(highlightedText);
        };
    }]);

})();