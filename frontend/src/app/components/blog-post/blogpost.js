// Blog Post Controller
(function() {
    'use strict';

    angular.module('blogApp')
        .controller('BlogPostController', ['$routeParams', '$location', 'BlogService', 'UtilService', '$mdToast', '$window',
            function($routeParams, $location, BlogService, UtilService, $mdToast, $window) {
                var vm = this;

                // Initialize properties
                vm.post = null;
                vm.isLoading = true;
                vm.error = null;
                vm.slug = $routeParams.slug;

                // Methods
                vm.goBack = goBack;
                vm.formatDate = UtilService.formatDate;
                vm.sharePost = sharePost;
                vm.printPost = printPost;

                // Initialize
                init();

                function init() {
                    if (!vm.slug) {
                        vm.error = 'Invalid post URL';
                        vm.isLoading = false;
                        return;
                    }

                    loadPost();
                }

                function loadPost() {
                    vm.isLoading = true;
                    vm.error = null;

                    BlogService.getPostBySlug(vm.slug)
                        .then(function(post) {
                            vm.post = post;
                            
                            // Update page title
                            $window.document.title = post.title + ' - The Blog';
                            
                            // Update meta description
                            updateMetaDescription(post.excerpt);
                        })
                        .catch(function(error) {
                            if (error.status === 404) {
                                vm.error = 'Blog post not found.';
                            } else {
                                vm.error = 'Failed to load blog post. Please try again.';
                            }
                            showToast('Failed to load blog post', 'error');
                        })
                        .finally(function() {
                            vm.isLoading = false;
                        });
                }

                function goBack() {
                    $window.history.back();
                }

                function sharePost() {
                    if (navigator.share && vm.post) {
                        navigator.share({
                            title: vm.post.title,
                            text: vm.post.excerpt,
                            url: $window.location.href
                        }).catch(function(error) {
                            console.log('Error sharing:', error);
                            fallbackShare();
                        });
                    } else {
                        fallbackShare();
                    }
                }

                function fallbackShare() {
                    // Copy URL to clipboard
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText($window.location.href)
                            .then(function() {
                                showToast('Post URL copied to clipboard!', 'success');
                            })
                            .catch(function() {
                                showToast('Failed to copy URL', 'error');
                            });
                    } else {
                        showToast('Sharing not supported in this browser', 'error');
                    }
                }

                function printPost() {
                    $window.print();
                }

                function updateMetaDescription(description) {
                    var metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription) {
                        metaDescription.setAttribute('content', description);
                    } else {
                        var meta = document.createElement('meta');
                        meta.name = 'description';
                        meta.content = description;
                        document.getElementsByTagName('head')[0].appendChild(meta);
                    }
                }

                function showToast(message, type) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(message)
                            .position('bottom right')
                            .hideDelay(3000)
                            .theme(type === 'error' ? 'error-toast' : 'success-toast')
                    );
                }
            }
        ]);

    // Blog Post Template
    angular.module('blogApp').run(['$templateCache', function($templateCache) {
        $templateCache.put('src/app/components/blog-post/blog-post.html',
            `<div class="min-h-screen">
                <!-- Loading State -->
                <div ng-if="vm.isLoading" class="flex justify-center items-center py-20">
                    <md-progress-circular md-mode="indeterminate" md-diameter="60"></md-progress-circular>
                </div>

                <!-- Error State -->
                <div ng-if="vm.error" class="max-w-2xl mx-auto">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <i class="material-icons text-red-500 text-6xl mb-4">error_outline</i>
                        <h2 class="text-2xl font-bold text-red-800 mb-2">{{vm.error}}</h2>
                        <p class="text-red-600 mb-6">The blog post you're looking for might have been moved or deleted.</p>
                        <div class="space-x-4">
                            <button ng-click="vm.goBack()" 
                                    class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                                <i class="material-icons mr-2">arrow_back</i>
                                Go Back
                            </button>
                            <button ng-click="$location.path('/')" 
                                    class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="material-icons mr-2">home</i>
                                Home
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Blog Post Content -->
                <article ng-if="!vm.isLoading && !vm.error && vm.post" class="max-w-4xl mx-auto">
                    
                    <!-- Breadcrumb Navigation -->
                    <nav class="mb-8" aria-label="Breadcrumb">
                        <ol class="flex items-center space-x-2 text-sm text-gray-500">
                            <li>
                                <a href="#!/" class="hover:text-blue-600 transition-colors">
                                    <i class="material-icons mr-1 text-base">home</i>
                                    Home
                                </a>
                            </li>
                            <li class="flex items-center">
                                <i class="material-icons mx-2">chevron_right</i>
                                <span class="text-gray-700">{{vm.post.title | limitTo:50}}{{vm.post.title.length > 50 ? '...' : ''}}</span>
                            </li>
                        </ol>
                    </nav>

                    <!-- Back Button -->
                    <div class="mb-6">
                        <button ng-click="vm.goBack()" 
                                class="flex items-center text-blue-600 hover:text-blue-800 transition-colors group">
                            <i class="material-icons mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</i>
                            Back to blog posts
                        </button>
                    </div>

                    <!-- Post Header -->
                    <header class="mb-8">
                        <!-- Category Badge -->
                        <div ng-if="vm.post.category" class="mb-4">
                            <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {{vm.post.category}}
                            </span>
                        </div>

                        <!-- Title -->
                        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {{vm.post.title}}
                        </h1>

                        <!-- Post Meta -->
                        <div class="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-200">
                            <div class="flex items-center space-x-6 text-gray-600">
                                <div class="flex items-center">
                                    <i class="material-icons mr-2">person</i>
                                    <span>{{vm.post.author_name}}</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="material-icons mr-2">schedule</i>
                                    <span>{{vm.formatDate(vm.post.published_at)}}</span>
                                </div>
                                <div class="flex items-center" ng-if="vm.post.updated_at !== vm.post.created_at">
                                    <i class="material-icons mr-2">update</i>
                                    <span>Updated {{vm.formatDate(vm.post.updated_at)}}</span>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex items-center space-x-3">
                                <button ng-click="vm.sharePost()" 
                                        class="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <i class="material-icons mr-1">share</i>
                                    <span class="hidden sm:inline">Share</span>
                                </button>
                                <button ng-click="vm.printPost()" 
                                        class="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <i class="material-icons mr-1">print</i>
                                    <span class="hidden sm:inline">Print</span>
                                </button>
                            </div>
                        </div>

                        <!-- Featured Image Placeholder -->
                        <div class="blog-image-placeholder mb-8 h-64 md:h-96 rounded-lg">
                            <i class="material-icons text-6xl">image</i>
                        </div>
                    </header>

                    <!-- Post Content -->
                    <div class="prose prose-lg max-w-none">
                        <!-- Excerpt -->
                        <div class="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded-r-lg">
                            <p class="text-lg text-blue-800 italic leading-relaxed">
                                {{vm.post.excerpt}}
                            </p>
                        </div>

                        <!-- Main Content -->
                        <div class="text-gray-800 leading-relaxed" ng-bind-html="vm.post.content | trusted">
                        </div>
                    </div>

                    <!-- Tags -->
                    <div ng-if="vm.post.tags.length > 0" class="mt-12 pt-8 border-t border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            <span ng-repeat="tag in vm.post.tags" 
                                  class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                                #{{tag}}
                            </span>
                        </div>
                    </div>

                    <!-- Post Footer -->
                    <footer class="mt-12 pt-8 border-t border-gray-200">
                        <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <div class="text-center sm:text-left">
                                <p class="text-gray-600">Written by</p>
                                <p class="text-xl font-semibold text-gray-900">{{vm.post.author_name}}</p>
                            </div>
                            
                            <div class="flex space-x-4">
                                <button ng-click="vm.sharePost()" 
                                        class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                                    <i class="material-icons mr-2">share</i>
                                    Share this post
                                </button>
                                <button ng-click="vm.goBack()" 
                                        class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center">
                                    <i class="material-icons mr-2">arrow_back</i>
                                    Back to posts
                                </button>
                            </div>
                        </div>
                    </footer>
                </article>
            </div>`
        );
    }]);

    // Trust HTML filter
    angular.module('blogApp').filter('trusted', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

})();