/**
 * main.js — Global utilities and UI interactions
 * 
 * Features:
 * - Hamburger menu toggle with animations
 * - Smooth scrolling for anchor links
 * - Active link highlighting
 * - Utility functions for formatting
 * - Form validation helpers
 * 
 * IMPORTANT: This script works alongside auth-check.js
 * Make sure auth-check.js is loaded BEFORE this script
 */

document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initSmoothScrolling();
    highlightActiveLink();
    initScrollAnimations();
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

    // Handle window resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 968) {
                closeMenu();
            }
        }, 250);
    });

    function toggleMenu() {
        var isActive = navMenu.classList.toggle('active');
        animateHamburger(isActive);
        
        // Toggle body scroll
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        animateHamburger(false);
        document.body.style.overflow = '';
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
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
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
        
        // Skip logout button and user greeting
        if (link.classList.contains('logout-btn') || 
            link.classList.contains('btn-login') ||
            link.id === 'navLoginBtn') {
            return;
        }
        
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
// SCROLL ANIMATIONS
// ════════════════════════════════════════
function initScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        return;
    }

    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    var animatedElements = document.querySelectorAll('.service-card, .feature-item, .step-item');
    animatedElements.forEach(function(el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transitionDelay = (index * 0.1) + 's';
        observer.observe(el);
    });
}

// ════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (isNaN(amount)) return '$0.00';
    return '$' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format date string
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time string
 */
function formatDateTime(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    var options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() { inThrottle = false; }, limit);
        }
    };
}

/**
 * Show validation error message
 * @param {string} elementId - ID of error element
 * @param {string} message - Error message to display
 */
function showValidationError(elementId, message) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.setAttribute('role', 'alert');
    }
}

/**
 * Clear validation error message
 * @param {string} elementId - ID of error element
 */
function clearValidationError(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        element.removeAttribute('role');
    }
}

/**
 * Clear all error messages on the page
 */
function clearAllErrors() {
    var errors = document.querySelectorAll('.error-message');
    errors.forEach(function(error) {
        error.textContent = '';
        error.style.display = 'none';
        error.removeAttribute('role');
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    var phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Show success message toast
 * @param {string} message - Message to display
 */
function showSuccessMessage(message) {
    showToast(message, 'success');
}

/**
 * Show error message toast
 * @param {string} message - Message to display
 */
function showErrorMessage(message) {
    showToast(message, 'error');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success' or 'error')
 */
function showToast(message, type) {
    var toast = document.createElement('div');
    var bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #51cf66, #40c057)' 
        : 'linear-gradient(135deg, #ff6b6b, #ff5252)';
    
    toast.style.cssText = 
        'position: fixed; top: 20px; right: 20px; ' +
        'background: ' + bgColor + '; ' +
        'color: white; padding: 1rem 1.5rem; border-radius: 8px; ' +
        'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); ' +
        'z-index: 10000; font-weight: 600; max-width: 300px; ' +
        'animation: slideInRight 0.3s ease;';
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showSuccessMessage('Copied to clipboard!');
        }).catch(function(err) {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccessMessage('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        document.body.removeChild(textArea);
    }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHTML(html) {
    var temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

// Add CSS animations
var style = document.createElement('style');
style.textContent = 
    '@keyframes slideInRight { ' +
    '  from { transform: translateX(100%); opacity: 0; } ' +
    '  to { transform: translateX(0); opacity: 1; } ' +
    '} ' +
    '@keyframes slideOutRight { ' +
    '  from { transform: translateX(0); opacity: 1; } ' +
    '  to { transform: translateX(100%); opacity: 0; } ' +
    '}';
document.head.appendChild(style);

// Export utility functions globally
if (typeof window !== 'undefined') {
    window.QuickLoanUtils = {
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        debounce: debounce,
        throttle: throttle,
        showValidationError: showValidationError,
        clearValidationError: clearValidationError,
        clearAllErrors: clearAllErrors,
        isValidEmail: isValidEmail,
        isValidPhone: isValidPhone,
        showSuccessMessage: showSuccessMessage,
        showErrorMessage: showErrorMessage,
        copyToClipboard: copyToClipboard,
        sanitizeHTML: sanitizeHTML
    };
}
