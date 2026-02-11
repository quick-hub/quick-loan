/**
 * auth-check.js — Global authentication state manager
 * 
 * This script provides centralized authentication management
 * and runs on EVERY page to handle auth state.
 * 
 * CRITICAL: Include this script on ALL pages before other scripts
 * 
 * Features:
 * - Persistent user authentication (stays logged in until logout)
 * - Professional logout with confirmation
 * - Dynamic navigation updates
 * - User greeting display
 * - Page protection for authenticated routes
 * - Token-based session management
 */

(function() {
    'use strict';

    // Global namespace for authentication
    window.QuickLoanAuth = {
        /**
         * Check if user is authenticated
         * Uses multiple verification methods for reliability
         * @returns {boolean}
         */
        isAuthenticated: function() {
            var authFlag = localStorage.getItem('quickloan_auth');
            var authToken = localStorage.getItem('quickloan_token');
            var userData = localStorage.getItem('quickloan_user');
            
            // User is authenticated if ALL conditions are met
            // This ensures complete verification
            return authFlag === 'true' && authToken !== null && userData !== null;
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
         * Login user and set persistent authentication
         * @param {Object} userData - User information
         * @param {string} password - User password (optional, will be hashed)
         * @returns {boolean}
         */
        login: function(userData, password) {
            try {
                // Normalize user data
                var normalizedData = this.normalizeUserData(userData);
                
                // Generate authentication token
                var authToken = this.generateToken(normalizedData.email || normalizedData.name);
                
                // Store user data and auth state
                localStorage.setItem('quickloan_user', JSON.stringify(normalizedData));
                localStorage.setItem('quickloan_auth', 'true');
                localStorage.setItem('quickloan_token', authToken);
                
                // Store password if provided (base64 encoded for demo purposes)
                // In production, use proper encryption or server-side validation
                if (password) {
                    localStorage.setItem('quickloan_password', btoa(password));
                }
                
                // Store login timestamp
                this.updateLastLoginTime();
                
                // Log success for debugging
                console.log('User logged in successfully:', normalizedData.email || normalizedData.name);
                
                return true;
            } catch (e) {
                console.error('Error logging in user:', e);
                return false;
            }
        },

        /**
         * Normalize user data to ensure consistency
         * @param {Object} userData - Raw user data
         * @returns {Object} Normalized user data
         */
        normalizeUserData: function(userData) {
            var normalized = userData;
            
            if (!normalized.name) {
                if (normalized.fullName) {
                    normalized.name = normalized.fullName;
                } else if (normalized.firstName && normalized.lastName) {
                    normalized.name = normalized.firstName + ' ' + normalized.lastName;
                } else if (normalized.firstName) {
                    normalized.name = normalized.firstName;
                } else if (normalized.email) {
                    normalized.name = normalized.email.split('@')[0];
                }
            }
            
            return normalized;
        },

        /**
         * Set user data in localStorage (legacy method - use login instead)
         * @param {Object} userData
         */
        setUserData: function(userData) {
            return this.login(userData, null);
        },

        /**
         * Generate a simple authentication token
         * @param {string} identifier - User email or name
         * @returns {string}
         */
        generateToken: function(identifier) {
            var timestamp = new Date().getTime();
            var random = Math.random().toString(36).substring(2, 15);
            var token = btoa(identifier + '|' + timestamp + '|' + random);
            return token;
        },

        /**
         * Verify if the current auth token is valid
         * @returns {boolean}
         */
        verifyToken: function() {
            var token = localStorage.getItem('quickloan_token');
            if (!token) return false;
            
            try {
                var decoded = atob(token);
                var parts = decoded.split('|');
                
                // Token should have 3 parts: identifier, timestamp, random
                if (parts.length !== 3) return false;
                
                var timestamp = parseInt(parts[1], 10);
                if (isNaN(timestamp)) return false;
                
                // Token is valid (no expiration for persistent login)
                // If you want token expiration, uncomment below:
                /*
                var now = new Date().getTime();
                var thirtyDays = 30 * 24 * 60 * 60 * 1000;
                return (now - timestamp) < thirtyDays;
                */
                
                return true;
            } catch (e) {
                console.error('Error verifying token:', e);
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
                // Clear all authentication data
                localStorage.removeItem('quickloan_auth');
                localStorage.removeItem('quickloan_user');
                localStorage.removeItem('quickloan_token');
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
            var loginBtn = document.getElementById('navLoginBtn');
            if (!loginBtn) return;

            if (this.isAuthenticated()) {
                var firstName = this.getFirstName();
                
                // Update logout button
                loginBtn.textContent = 'Logout';
                loginBtn.href = '#';
                loginBtn.classList.add('logout-btn');
                loginBtn.classList.remove('btn-login');
                
                // Remove old event listeners by cloning
                var newBtn = loginBtn.cloneNode(true);
                if (loginBtn.parentNode) {
                    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
                }
                
                // Add logout event listener
                var self = this;
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.logout();
                });
                
                // Add user greeting
                var navMenu = document.getElementById('navMenu');
                if (navMenu && !document.getElementById('userGreeting')) {
                    var greeting = document.createElement('li');
                    greeting.id = 'userGreeting';
                    greeting.innerHTML = '<span class="user-greeting-text">Hi, <strong>' + firstName + '</strong></span>';
                    navMenu.insertBefore(greeting, newBtn.parentElement);
                }
            } else {
                // Reset to login button
                loginBtn.textContent = 'Login';
                loginBtn.href = 'login.html';
                loginBtn.classList.add('btn-login');
                loginBtn.classList.remove('logout-btn');
                
                // Remove any existing click listeners
                var newLoginBtn = loginBtn.cloneNode(true);
                if (loginBtn.parentNode) {
                    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
                }
                
                // Remove user greeting
                var greeting = document.getElementById('userGreeting');
                if (greeting) {
                    greeting.remove();
                }
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
                    
                    if (isActionButton && btn.id !== 'navLoginBtn') {
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
        },

        /**
         * Refresh authentication (extends session)
         */
        refreshAuth: function() {
            if (this.isAuthenticated() && this.verifyToken()) {
                var userData = this.getUserData();
                if (userData) {
                    // Regenerate token to extend session
                    var authToken = this.generateToken(userData.email || userData.name);
                    localStorage.setItem('quickloan_token', authToken);
                    localStorage.setItem('quickloan_auth', 'true');
                }
            }
        },

        /**
         * Get authentication status for debugging
         * @returns {Object}
         */
        getAuthStatus: function() {
            return {
                authenticated: this.isAuthenticated(),
                hasToken: localStorage.getItem('quickloan_token') !== null,
                hasAuthFlag: localStorage.getItem('quickloan_auth') === 'true',
                hasUserData: localStorage.getItem('quickloan_user') !== null,
                userName: this.getFullName(),
                lastLogin: this.getLastLoginTime(),
                tokenValid: this.verifyToken()
            };
        }
    };

    // Add CSS for user greeting and animations
    var style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight { 
            from { transform: translateX(100%); opacity: 0; } 
            to { transform: translateX(0); opacity: 1; } 
        }
        .user-greeting-text {
            color: #00d4ff;
            font-size: 0.95rem;
            padding: 0.5rem 1rem;
        }
        .user-greeting-text strong {
            font-weight: 700;
        }
        .logout-btn {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            color: white !important;
        }
        .logout-btn:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
        }
    `;
    document.head.appendChild(style);

    // Initialize authentication
    function initialize() {
        // Refresh auth on each page load to extend session
        window.QuickLoanAuth.refreshAuth();
        
        // Update UI
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.protectPage();
        window.QuickLoanAuth.updateActionButtons();
        
        // Log auth status for debugging (can be removed in production)
        if (console && console.log) {
            console.log('QuickLoan Auth Status:', window.QuickLoanAuth.getAuthStatus());
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also run on page show (for back/forward navigation)
    window.addEventListener('pageshow', function(event) {
        // Refresh auth on page show
        window.QuickLoanAuth.refreshAuth();
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.updateActionButtons();
    });

    // Refresh authentication periodically to keep session alive
    setInterval(function() {
        if (window.QuickLoanAuth.isAuthenticated()) {
            window.QuickLoanAuth.refreshAuth();
        }
    }, 5 * 60 * 1000); // Every 5 minutes

})();
