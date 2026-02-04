/**
 * main.js — Global utilities
 * - Hamburger menu toggle
 * - Smooth scrolling for anchor links
 * - Active link highlighting
 */

document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initSmoothScrolling();
    highlightActiveLink();
});

// ════════════════════════════════════════
// HAMBURGER MENU
// ════════════════════════════════════════
function initHamburgerMenu() {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu when clicking a link
    var navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    function toggleMenu() {
        var isActive = navMenu.classList.toggle('active');
        animateHamburger(isActive);
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        animateHamburger(false);
    }

    function animateHamburger(isActive) {
        var spans = hamburger.querySelectorAll('span');
        if (isActive) {
            // Transform to X
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            // Back to hamburger
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// ════════════════════════════════════════
// SMOOTH SCROLLING
// ════════════════════════════════════════
function initSmoothScrolling() {
    var smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            
            // Only smooth scroll if it's an actual anchor (not just "#")
            if (!href || href === '#' || href.length <= 1) {
                return;
            }

            var targetId = href.substring(1);
            var targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Calculate offset accounting for fixed navbar
                var navbarHeight = 80;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ════════════════════════════════════════
// ACTIVE LINK HIGHLIGHTING
// ════════════════════════════════════════
function highlightActiveLink() {
    var currentPage = window.location.pathname.split('/').pop();
    
    // Default to index.html if no page specified
    if (!currentPage || currentPage === '') {
        currentPage = 'index.html';
    }
    
    var navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(function(link) {
        var linkPage = link.getAttribute('href');
        
        // Remove active class from all links first
        link.classList.remove('active');
        
        // Add active class to matching link
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
        
        // Special case for home page
        if ((currentPage === 'index.html' || currentPage === '') && 
            (linkPage === 'index.html' || linkPage === '/' || linkPage === '')) {
            link.classList.add('active');
        }
    });
}

// ════════════════════════════════════════
// FORM UTILITIES (if needed globally)
// ════════════════════════════════════════

// Show validation error
function showValidationError(elementId, message) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('visible', 'show');
    }
}

// Clear validation error
function clearValidationError(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.classList.remove('visible', 'show');
    }
}

// Clear all errors
function clearAllErrors() {
    var errors = document.querySelectorAll('.error-message');
    errors.forEach(function(error) {
        error.textContent = '';
        error.classList.remove('visible', 'show');
    });
}

// ════════════════════════════════════════
// SCROLL TO TOP BUTTON (optional)
// ════════════════════════════════════════
function initScrollToTop() {
    var scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date
function formatDate(dateString) {
    var date = new Date(dateString);
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Debounce function for performance
function debounce(func, wait) {
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
}

// Export utility functions globally if needed
if (typeof window !== 'undefined') {
    window.QuickLoanUtils = {
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        debounce: debounce,
        showValidationError: showValidationError,
        clearValidationError: clearValidationError,
        clearAllErrors: clearAllErrors
    };
}
