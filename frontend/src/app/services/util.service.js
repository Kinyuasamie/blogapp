// Utility Service
(function() {
    'use strict';

    angular.module('blogApp')
        .service('UtilService', function() {
            var service = this;

            // Format date string to readable format
            service.formatDate = function(dateString) {
                if (!dateString) return '';
                
                var date = new Date(dateString);
                var options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                
                return date.toLocaleDateString('en-US', options);
            };

            // Truncate text to specified length
            service.truncateText = function(text, length) {
                if (!text) return '';
                if (text.length <= length) return text;
                return text.substring(0, length).trim() + '...';
            };

            // Generate slug from title
            service.generateSlug = function(title) {
                if (!title) return '';
                
                return title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
                    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
            };

            // Validate email format
            service.isValidEmail = function(email) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            // Format reading time estimate
            service.calculateReadingTime = function(content) {
                if (!content) return '1 min read';
                
                var wordsPerMinute = 200;
                var wordCount = content.split(/\s+/).length;
                var readingTime = Math.ceil(wordCount / wordsPerMinute);
                
                return readingTime + ' min read';
            };

            // Scroll to top of page
            service.scrollToTop = function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            };

            // Scroll to element
            service.scrollToElement = function(elementId) {
                var element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            };

            // Debounce function
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

            // Check if object is empty
            service.isEmpty = function(obj) {
                return Object.keys(obj || {}).length === 0;
            };

            // Deep clone object
            service.deepClone = function(obj) {
                return JSON.parse(JSON.stringify(obj));
            };

            // Format number with commas
            service.formatNumber = function(num) {
                if (!num) return '0';
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            };

            // Get file extension from filename
            service.getFileExtension = function(filename) {
                return filename.split('.').pop().toLowerCase();
            };

            // Convert bytes to human readable format
            service.formatBytes = function(bytes, decimals) {
                if (bytes === 0) return '0 Bytes';
                
                var k = 1024;
                var dm = decimals || 2;
                var sizes = ['Bytes', 'KB', 'MB', 'GB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));
                
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };

            // Check if current environment is mobile
            service.isMobile = function() {
                return window.innerWidth <= 768;
            };

            // Generate random ID
            service.generateId = function() {
                return Math.random().toString(36).substr(2, 9);
            };
        });
})();