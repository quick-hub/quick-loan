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

(function () {
    'use strict';

    // Global namespace for authentication
    window.QuickLoanAuth = {
        /**
         * Check if user is authenticated
         * @returns {boolean}
         */
        isAuthenticated: function () {
            var authFlag = localStorage.getItem('quickloan_auth');
            var authToken = localStorage.getItem('quickloan_token');
            var userData = localStorage.getItem('quickloan_user');

            return authFlag === 'true' && authToken !== null && userData !== null;
        },

        /**
         * Get user data from localStorage
         * @returns {Object|null}
         */
        getUserData: function () {
            try {
                var userData = localStorage.getItem('quickloan_user');
                if (!userData) return null;

                var parsed = JSON.parse(userData);

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
        getFirstName: function () {
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
        getFullName: function () {
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
         * Login user and set persistent authentication.
         *
         * If a password is provided it is stored (base64 encoded)
         * so future logins can verify credentials.
         *
         * This method does NOT create accounts — account creation is
         * the responsibility of signup.js / the signup page.
         *
         * @param {Object} userData - User information
         * @param {string} [password] - User password (optional)
         * @returns {boolean}
         */
        login: function (userData, password) {
            try {
                var normalizedData = this.normalizeUserData(userData);
                var authToken = this.generateToken(
                    normalizedData.email || normalizedData.name
                );

                localStorage.setItem('quickloan_user', JSON.stringify(normalizedData));
                localStorage.setItem('quickloan_auth', 'true');
                localStorage.setItem('quickloan_token', authToken);

                if (password) {
                    localStorage.setItem('quickloan_password', btoa(password));
                }

                this.updateLastLoginTime();

                console.log('User logged in:', normalizedData.email || normalizedData.name);
                return true;
            } catch (e) {
                console.error('Error logging in user:', e);
                return false;
            }
        },

        /**
         * Normalize user data to ensure consistency
         * @param {Object} userData
         * @returns {Object}
         */
        normalizeUserData: function (userData) {
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
         * Set user data in localStorage (legacy alias for login)
         * @param {Object} userData
         */
        setUserData: function (userData) {
            return this.login(userData, null);
        },

        /**
         * Generate a simple authentication token
         * @param {string} identifier
         * @returns {string}
         */
        generateToken: function (identifier) {
            var timestamp = new Date().getTime();
            var random = Math.random().toString(36).substring(2, 15);
            return btoa(identifier + '|' + timestamp + '|' + random);
        },

        /**
         * Verify if the current auth token is valid
         * @returns {boolean}
         */
        verifyToken: function () {
            var token = localStorage.getItem('quickloan_token');
            if (!token) return false;

            try {
                var decoded = atob(token);
                var parts = decoded.split('|');
                if (parts.length !== 3) return false;

                var timestamp = parseInt(parts[1], 10);
                if (isNaN(timestamp)) return false;

                return true;
            } catch (e) {
                console.error('Error verifying token:', e);
                return false;
            }
        },

        /**
         * Logout user with confirmation and cleanup
         */
        logout: function () {
            var firstName = this.getFirstName();
            var confirmMessage = 'Are you sure you want to logout, ' + firstName + '?';

            if (confirm(confirmMessage)) {
                localStorage.removeItem('quickloan_auth');
                localStorage.removeItem('quickloan_user');
                localStorage.removeItem('quickloan_token');
                localStorage.removeItem('quickloan_stats');
                localStorage.removeItem('quickloan_activity');
                localStorage.removeItem('quickloan_last_login');
                localStorage.removeItem('quickloan_password');

                try {
                    sessionStorage.clear();
                } catch (e) {
                    console.log('Session storage not available');
                }

                this.showLogoutMessage();

                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 800);
            }
        },

        /**
         * Show logout confirmation message
         */
        showLogoutMessage: function () {
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

            setTimeout(function () {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 2000);
        },

        /**
         * Update navigation based on auth state
         */
        updateNavigation: function () {
            var loginBtn = document.getElementById('navLoginBtn');
            if (!loginBtn) return;

            if (this.isAuthenticated()) {
                var firstName = this.getFirstName();

                loginBtn.textContent = 'Logout';
                loginBtn.href = '#';
                loginBtn.classList.add('logout-btn');
                loginBtn.classList.remove('btn-login');

                var newBtn = loginBtn.cloneNode(true);
                if (loginBtn.parentNode) {
                    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
                }

                var self = this;
                newBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    self.logout();
                });

                var navMenu = document.getElementById('navMenu');
                if (navMenu && !document.getElementById('userGreeting')) {
                    var greeting = document.createElement('li');
                    greeting.id = 'userGreeting';
                    greeting.innerHTML =
                        '<span class="user-greeting-text">Hi, <strong>' +
                        firstName +
                        '</strong></span>';
                    navMenu.insertBefore(greeting, newBtn.parentElement);
                }
            } else {
                loginBtn.textContent = 'Login';
                loginBtn.href = 'login.html';
                loginBtn.classList.add('btn-login');
                loginBtn.classList.remove('logout-btn');

                var newLoginBtn = loginBtn.cloneNode(true);
                if (loginBtn.parentNode) {
                    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
                }

                var greeting = document.getElementById('userGreeting');
                if (greeting) {
                    greeting.remove();
                }
            }
        },

        /**
         * Protect pages that require authentication
         */
        protectPage: function () {
            var protectedPages = ['apply.html', 'dashboard.html', 'processing-fee.html'];
            var currentPage = window.location.pathname.split('/').pop();

            if (protectedPages.indexOf(currentPage) !== -1 && !this.isAuthenticated()) {
                try {
                    sessionStorage.setItem('quickloan_return_url', window.location.href);
                } catch (e) {
                    console.log('Session storage not available');
                }
                window.location.href = 'login.html';
            }
        },

        /**
         * Update action buttons based on auth state
         */
        updateActionButtons: function () {
            if (this.isAuthenticated()) {
                var applyButtons = document.querySelectorAll('a[href="login.html"]');

                applyButtons.forEach(function (btn) {
                    var btnText = btn.textContent.toLowerCase();
                    var isActionButton =
                        btnText.indexOf('apply') !== -1 ||
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
         */
        getLastLoginTime: function () {
            return localStorage.getItem('quickloan_last_login');
        },

        /**
         * Update last login time
         */
        updateLastLoginTime: function () {
            var now = new Date().toISOString();
            localStorage.setItem('quickloan_last_login', now);
        },

        /**
         * Refresh authentication (extends session)
         */
        refreshAuth: function () {
            if (this.isAuthenticated() && this.verifyToken()) {
                var userData = this.getUserData();
                if (userData) {
                    var authToken = this.generateToken(userData.email || userData.name);
                    localStorage.setItem('quickloan_token', authToken);
                    localStorage.setItem('quickloan_auth', 'true');
                }
            }
        },

        /**
         * Get authentication status for debugging
         */
        getAuthStatus: function () {
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
        window.QuickLoanAuth.refreshAuth();
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.protectPage();
        window.QuickLoanAuth.updateActionButtons();

        if (console && console.log) {
            console.log('QuickLoan Auth Status:', window.QuickLoanAuth.getAuthStatus());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    window.addEventListener('pageshow', function () {
        window.QuickLoanAuth.refreshAuth();
        window.QuickLoanAuth.updateNavigation();
        window.QuickLoanAuth.updateActionButtons();
    });

    setInterval(function () {
        if (window.QuickLoanAuth.isAuthenticated()) {
            window.QuickLoanAuth.refreshAuth();
        }
    }, 5 * 60 * 1000);
})();
