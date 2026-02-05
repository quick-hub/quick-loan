/**
 * auth-check.js — Global authentication state manager
 * 
 * This script provides centralized authentication management
 * and runs on EVERY page to handle auth state.
 * 
 * Features:
 * - User authentication state management
 * - Professional logout with confirmation
 * - Dynamic navigation updates
 * - User greeting display
 * - Page protection for authenticated routes
 */

(function() {
    'use strict';

    // Global namespace for authentication
    window.QuickLoanAuth = {
        /**
         * Check if user is authenticated
         * @returns {boolean}
         */
        isAuthenticated: function() {
            var authFlag = localStorage.getItem('quickloan_auth');
            return authFlag === 'true';
        },

        /**
         * Get user data from localStorage
         * @returns {Object|null}
         */
        getUserData: function() {
            try {
                var userData = localStorage.getItem('quickloan_user');
                if (!userData) return null;
                
                var parsed = JSON.parse(userData);
                
                // Ensure the user object has a name property
                if (parsed && !parsed.name) {
                    if (parsed.fullName) {
                        parsed.name = parsed.fullName;
                    } else if (parsed.firstName && parsed.lastName) {
                        parsed.name = parsed.firstName + ' ' + parsed.lastName;
                    } else if (parsed.firstName) {
                        parsed.name = parsed.firstName;
                    } else if (parsed.email) {
                        parsed.name = parsed.email.split('@')[0];
                    }
                }
                
                return parsed;
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        },

        /**
         * Get user's first name
         * @returns {string}
         */
        getFirstName: function() {
            var user = this.getUserData();
            if (!user) return 'User';
            
            if (user.firstName) return user.firstName;
            
            if (user.name) {
                var nameParts = user.name.trim().split(/\s+/);
                return nameParts[0];
            }
            
            if (user.fullName) {
                var fullNameParts = user.fullName.trim().split(/\s+/);
                return fullNameParts[0];
            }
            
            if (user.email) {
                return user.email.split('@')[0];
            }
            
            return 'User';
        },

        /**
         * Get user's full name
         * @returns {string}
         */
        getFullName: function() {
            var user = this.getUserData();
            if (!user) return 'User';
            
            if (user.name) return user.name;
            if (user.fullName) return user.fullName;
            if (user.firstName && user.lastName) {
                return user.firstName + ' ' + user.lastName;
            }
            if (user.firstName) return user.firstName;
            if (user.email) return user.email.split('@')[0];
            
            return 'User';
        },

        /**
         * Set user data in localStorage
         * @param {Object} userData
         */
        setUserData: function(userData) {
            try {
                var normalizedData = userData;
                
                if (!normalizedData.name) {
                    if (normalizedData.fullName) {
                        normalizedData.name = normalizedData.fullName;
                    } else if (normalizedData.firstName && normalizedData.lastName) {
                        normalizedData.name = normalizedData.firstName + ' ' + normalizedData.lastName;
                    } else if (normalizedData.firstName) {
                        normalizedData.name = normalizedData.firstName;
                    } else if (normalizedData.email) {
                        normalizedData.name = normalizedData.email.split('@')[0];
                    }
                }
                
                localStorage.setItem('quickloan_user', JSON.stringify(normalizedData));
                localStorage.setItem('quickloan_auth', 'true');
                return true;
            } catch (e) {
                console.error('Error setting user data:', e);
                return false;
            }
        },

        /**
         * Logout user with confirmation and cleanup
         */
        logout: function() {
            var firstName = this.getFirstName();
            var confirmMessage = 'Are you sure you want to logout, ' + firstName + '?';
            
            if (confirm(confirmMessage)) {
                // Clear all user data
                localStorage.removeItem('quickloan_auth');
                localStorage.removeItem('quickloan_user');
                localStorage.removeItem('quickloan_stats');
                localStorage.removeItem('quickloan_activity');
                localStorage.removeItem('quickloan_last_login');
                localStorage.removeItem('quickloan_password');
                
                // Clear session storage
                try {
                    sessionStorage.clear();
                } catch (e) {
                    console.log('Session storage not available');
                }
                
                // Show logout message briefly
                this.showLogoutMessage();
                
                // Redirect to home page after brief delay
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 800);
            }
        },

        /**
         * Show logout confirmation message
         */
        showLogoutMessage: function() {
            var messageDiv = document.createElement('div');
            messageDiv.style.cssText = 
                'position: fixed; top: 20px; right: 20px; ' +
                'background: linear-gradient(135deg, #ef4444, #dc2626); ' +
                'color: white; padding: 1rem 1.5rem; border-radius: 8px; ' +
                'box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); ' +
                'z-index: 10000; font-weight: 600; ' +
                'animation: slideInRight 0.3s ease;';
            messageDiv.textContent = '✓ Logged out successfully';
            document.body.appendChild(messageDiv);
            
            setTimeout(function() {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 2000);
        },

        /**
         * Update navigation based on auth state
         */
        updateNavigation: function() {
            var navMenu = document.getElementById('navMenu');
            if (!navMenu) return;

            // Find or create login/logout button container
            var loginItem = navMenu.querySelector('.nav-auth-item');
            if (!loginItem) {
                loginItem = document.createElement('li');
                loginItem.className = 'nav-auth-item';
                navMenu.appendChild(loginItem);
            }

            if (this.isAuthenticated()) {
                var firstName = this.getFirstName();
                
                // Create greeting + logout button
                loginItem.innerHTML = 
                    '<span class="user-greeting">Hi, ' + firstName + '</span>' +
                    '<a href="#" class="btn-login logout-btn" id="logoutBtn">Logout</a>';
                
                // Add logout event listener
                var self = this;
                var logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        self.logout();
                    });
                }
            } else {
                // Show login button
                loginItem.innerHTML = '<a href="login.html" class="btn-login">Login</a>';
            }
        },

        /**
         * Protect pages that require authentication
         */
        protectPage: function() {
            var protectedPages = ['apply.html', 'dashboard.html', 'processing-fee.html'];
            var currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.indexOf(currentPage) !== -1 && !this.isAuthenticated()) {
                // Store return URL for redirect after login
                try {
                    sessionStorage.setItem('quickloan_return_url', window.location.href);
                } catch (e) {
                    console.log('Session storage not available');
                }
                
                // Redirect to login
                window.location.href = 'login.html';
            }
        },

        /**
         * Update action buttons based on auth state
         */
        updateActionButtons: function() {
            if (this.isAuthenticated()) {
                var applyButtons = document.querySelectorAll('a[href="login.html"]');
                
                applyButtons.forEach(function(btn) {
                    var btnText = btn.textContent.toLowerCase();
                    var isActionButton = btnText.indexOf('apply') !== -1 || 
                                        btnText.indexOf('start') !== -1 ||
                                        btnText.indexOf('get started') !== -1 ||
                                        btnText.indexOf('get loan') !== -1;
                    
                    if (isActionButton && !btn.classList.contains('btn-login')) {
                        btn.href = 'apply.html';
                    }
                });
            }
        },

        /**
         * Get last login time
         * @returns {string|null}
         */
        getLastLoginTime: function() {
            return localStorage.getItem('quickloan_last_login');
        },

        /**
         * Update last login time
         */
        updateLastLoginTime: function() {
            var now = new Date().toISOString();
            localStorage.setItem('quickloan_last_login', now);
        }
    };

    // Add CSS for user greeting and animations
    var style = document.createElement('style');
    style.textContent = 
        '.user-greeting { ' +
        '  color: #333; ' +
        '  font-weight: 600; ' +
        '  margin-right: 1rem; ' +
        '  display: inline-block; ' +
        '} ' +
        '.nav-auth-item { ' +
        '  display: flex; ' +
        '  align-items: center; ' +
        '} ' +
        '@keyframes slideInRight { ' +
        '  from { transform: translateX(100%); opacity: 0; } ' +
        '  to { transform: translateX(0); opacity: 1; } ' +
        '} ' +
        '@media (max-width: 968px) { ' +
        '  .user-greeting { ' +
        '    display: block; ' +
        '    margin-bottom: 0.5rem; ' +
        '    margin-right: 0; ' +
        '  } ' +
        '  .nav-auth-item { ' +
        '    flex-direction: column; ' +
        '    align-items: flex-start; ' +
        '  } ' +
        '}';
    document.head.appendChild(style);

    // Initialize authentication
    function initialize() {
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.protectPage();
        window.QuickLoanAuth.updateActionButtons();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also run on page show (for back/forward navigation)
    window.addEventListener('pageshow', function() {
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.updateActionButtons();
    });

})();
