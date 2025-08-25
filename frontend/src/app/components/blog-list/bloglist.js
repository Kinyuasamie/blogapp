// Blog List Controller
(function() {
    'use strict';

    angular.module('blogApp')
        .controller('BlogListController', ['BlogService', 'UtilService', '$location', '$mdToast',
            function(BlogService, UtilService, $location, $mdToast) {
                var vm = this;

                // Initialize properties
                vm.posts = [];
                vm.currentPage = 1;
                vm.totalPages = 1;
                vm.totalPosts = 0;
                vm.hasNext = false;
                vm.hasPrev = false;
                vm.isLoading = true;
                vm.error = null;
                vm.searchQuery = $location.search().search || '';

                // Pagination settings
                vm.postsPerPage = 6;

                // Methods
                vm.loadPosts = loadPosts;
                vm.goToPage = goToPage;
                vm.nextPage = nextPage;
                vm.prevPage = prevPage;
                vm.readPost = readPost;
                vm.formatDate = UtilService.formatDate;
                vm.truncateText = UtilService.truncateText;
                vm.getPageNumbers = getPageNumbers;

                // Initialize
                init();

                function init() {
                    var page = parseInt($location.search().page) || 1;
                    vm.currentPage = page;
                    loadPosts();
                }

                function loadPosts() {
                    vm.isLoading = true;
                    vm.error = null;

                    BlogService.getPosts(vm.currentPage, vm.postsPerPage, vm.searchQuery)
                        .then(function(data) {
                            vm.posts = data.posts || [];
                            vm.currentPage = data.current_page || 1;
                            vm.totalPages = data.total_pages || 1;
                            vm.totalPosts = data.total_posts || 0;
                            vm.hasNext = data.has_next || false;
                            vm.hasPrev = data.has_prev || false;

                            // Update URL without reloading
                            $location.search('page', vm.currentPage > 1 ? vm.currentPage : null);
                        })
                        .catch(function(error) {
                            vm.error = 'Failed to load blog posts. Please try again.';
                            showToast('Failed to load blog posts', 'error');
                        })
                        .finally(function() {
                            vm.isLoading = false;
                        });
                }

                function goToPage(page) {
                    if (page >= 1 && page <= vm.totalPages && page !== vm.currentPage) {
                        vm.currentPage = page;
                        loadPosts();
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

                    // Adjust start if we're near the end
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

                function showToast(message, type) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(message)
                            .position('top right')
                            .hideDelay(3000)
                            .theme(type === 'error' ? 'error-toast' : 'default')
                    );
                }

                // Watch for search parameter changes
                vm.$onInit = function() {
                    // Listen for location changes
                    var unwatch = $location.$$watchers || [];
                    unwatch.push(function() {
                        var newSearch = $location.search().search || '';
                        if (newSearch !== vm.searchQuery) {
                            vm.searchQuery = newSearch;
                            vm.currentPage = 1;
                            loadPosts();
                        }
                    });
                };
            }
        ]);
})();