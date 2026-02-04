/**
 * auth-check.js — Global authentication checker
 * 
 * This script runs on EVERY page to:
 * 1. Check if user is logged in
 * 2. Update navigation (Login/Logout button)
 * 3. Handle logout functionality
 * 
 * Load this script FIRST before any page-specific scripts
 */

(function() {
    'use strict';

    // Check authentication status
    function isAuthenticated() {
        return localStorage.getItem('quickloan_auth') === 'true';
    }

    // Get user data
    function getUserData() {
        try {
            const userData = localStorage.getItem('quickloan_user');
            return userData ? JSON.parse(userData) : {};
        } catch (e) {
            console.error('Error parsing user data:', e);
            return {};
        }
    }

    // Handle logout
    function handleLogout(e) {
        if (e) e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            // Clear all authentication data
            localStorage.removeItem('quickloan_auth');
            localStorage.removeItem('quickloan_user');
            localStorage.removeItem('quickloan_last_login');
            localStorage.removeItem('quickloan_password');
            
            // Clear session storage
            try {
                sessionStorage.clear();
            } catch (e) {
                console.log('Session storage not available');
            }
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    }

    // Update navigation based on auth state
    function updateNavigation() {
        // Try multiple selectors for the login button
        const loginBtn = document.getElementById('navLoginBtn') || 
                        document.querySelector('.btn-login') ||
                        document.querySelector('a[href="login.html"]');
        
        if (!loginBtn) return;

        if (isAuthenticated()) {
            const userData = getUserData();
            const firstName = userData.name ? userData.name.split(' ')[0] : 'User';
            
            // User is logged in - show Logout button
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.classList.add('logout-btn');
            loginBtn.classList.remove('btn-login');
            
            // Remove old event listeners by cloning
            const newBtn = loginBtn.cloneNode(true);
            if (loginBtn.parentNode) {
                loginBtn.parentNode.replaceChild(newBtn, loginBtn);
            }
            
            // Add logout event listener
            newBtn.addEventListener('click', handleLogout);
            
            // Add user name if there's space (optional)
            const navMenu = document.getElementById('navMenu');
            if (navMenu && !document.getElementById('userGreeting')) {
                const greeting = document.createElement('li');
                greeting.id = 'userGreeting';
                greeting.innerHTML = '<span style="color: #00d4ff; font-weight: 600;">Hi, ' + firstName + '</span>';
                navMenu.insertBefore(greeting, newBtn.parentElement);
            }
        } else {
            // User is logged out - show Login button
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
            loginBtn.classList.add('btn-login');
            loginBtn.classList.remove('logout-btn');
            
            // Remove user greeting if exists
            const greeting = document.getElementById('userGreeting');
            if (greeting) {
                greeting.remove();
            }
        }
    }

    // Protect pages that require authentication
    function protectPage() {
        const protectedPages = ['apply.html', 'dashboard.html', 'processing-fee.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !isAuthenticated()) {
            // Store return URL
            try {
                sessionStorage.setItem('quickloan_return_url', window.location.href);
            } catch (e) {
                console.log('Session storage not available');
            }
            
            // Redirect to login
            window.location.href = 'login.html';
        }
    }

    // Update "Apply Now" and similar buttons based on auth state
    function updateActionButtons() {
        if (isAuthenticated()) {
            // Find all buttons that should go to apply page when logged in
            const applyButtons = document.querySelectorAll('a[href="login.html"]');
            
            applyButtons.forEach(function(btn) {
                // Only update if it's an action button (not the nav login)
                const btnText = btn.textContent.toLowerCase();
                const isActionButton = btnText.includes('apply') || 
                                      btnText.includes('start') ||
                                      btnText.includes('get started') ||
                                      btnText.includes('get loan');
                
                if (isActionButton && btn.id !== 'navLoginBtn') {
                    btn.href = 'apply.html';
                }
            });
        }
    }

    // Check if user should be redirected back after login
    function checkReturnUrl() {
        try {
            const returnUrl = sessionStorage.getItem('quickloan_return_url');
            if (returnUrl && isAuthenticated()) {
                sessionStorage.removeItem('quickloan_return_url');
                window.location.href = returnUrl;
            }
        } catch (e) {
            console.log('Session storage not available');
        }
    }

    // Initialize authentication on DOM ready
    function initialize() {
        updateNavigation();
        protectPage();
        updateActionButtons();
        checkReturnUrl();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also run on page show (for back/forward navigation)
    window.addEventListener('pageshow', function() {
        updateNavigation();
        updateActionButtons();
    });

    // Expose auth functions globally for other scripts
    window.QuickLoanAuth = {
        isAuthenticated: isAuthenticated,
        getUserData: getUserData,
        logout: function() {
            handleLogout(null);
        },
        updateNavigation: updateNavigation
    };

})();
