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
        return JSON.parse(localStorage.getItem('quickloan_user') || '{}');
    }

    // Handle logout
    function handleLogout(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('quickloan_auth');
            localStorage.removeItem('quickloan_user');
            localStorage.removeItem('quickloan_last_login');
            window.location.href = 'index.html';
        }
    }

    // Update navigation based on auth state
    function updateNavigation() {
        var loginBtn = document.getElementById('navLoginBtn');
        if (!loginBtn) return;

        if (isAuthenticated()) {
            // User is logged in - show Logout button
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.classList.add('logout-btn');
            
            // Remove old event listeners by cloning
            var newBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newBtn, loginBtn);
            
            // Add logout event listener
            newBtn.addEventListener('click', handleLogout);
        } else {
            // User is logged out - show Login button
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
            loginBtn.classList.remove('logout-btn');
        }
    }

    // Protect pages that require authentication
    function protectPage() {
        var protectedPages = ['apply.html', 'dashboard.html'];
        var currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !isAuthenticated()) {
            // Redirect to login with return URL
            localStorage.setItem('quickloan_return_url', window.location.href);
            window.location.href = 'login.html';
        }
    }

    // Update "Apply Now" and similar buttons based on auth state
    function updateActionButtons() {
        if (isAuthenticated()) {
            // Change all "Login" action buttons to go to apply page
            var applyButtons = document.querySelectorAll('a[href="login.html"]');
            applyButtons.forEach(function(btn) {
                // Only update if it's an action button (not the nav login)
                if (btn.id !== 'navLoginBtn' && 
                    (btn.textContent.includes('Apply') || 
                     btn.textContent.includes('Start') ||
                     btn.textContent.includes('Get Started'))) {
                    btn.href = 'apply.html';
                }
            });
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        updateNavigation();
        protectPage();
        updateActionButtons();
    });

    // Also run immediately for elements that exist
    if (document.readyState === 'loading') {
        // Still loading, wait for DOMContentLoaded
    } else {
        // DOM is ready, run now
        updateNavigation();
        protectPage();
        updateActionButtons();
    }

    // Expose auth check function globally for other scripts
    window.QuickLoanAuth = {
        isAuthenticated: isAuthenticated,
        getUserData: getUserData,
        logout: function() {
            localStorage.removeItem('quickloan_auth');
            localStorage.removeItem('quickloan_user');
            localStorage.removeItem('quickloan_last_login');
            window.location.href = 'index.html';
        }
    };

})();