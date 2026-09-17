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

    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMenu();
        }
    });

    var navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

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
        hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        animateHamburger(isActive);

        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        animateHamburger(false);
        document.body.style.overflow = '';
    }

    function animateHamburger(isActive) {
        var spans = hamburger.querySelectorAll('span');
        if (isActive) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
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

            if (!href || href === '#' || href.length <= 1) {
                return;
            }

            var targetId = href.substring(1);
            var targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                var navbarHeight = 80;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

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

    if (!currentPage || currentPage === '') {
        currentPage = 'index.html';
    }

    var navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(function(link) {
        var linkPage = link.getAttribute('href');

        if (link.classList.contains('logout-btn') ||
            link.classList.contains('btn-login') ||
            link.id === 'navLoginBtn') {
            return;
        }

        link.classList.remove('active');

        if (linkPage === currentPage) {
            link.classList.add('active');
        }

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
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    var animatedElements = document.querySelectorAll('.service-card, .feature-item, .step-item');
    animatedElements.forEach(function(el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transitionDelay = (index % 6 * 0.08) + 's';
        observer.observe(el);
    });
}

// ════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════

function formatCurrency(amount) {
    if (isNaN(amount)) return '$0.00';
    return '$' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

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

function showValidationError(elementId, message) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.setAttribute('role', 'alert');
    }
}

function clearValidationError(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        element.removeAttribute('role');
    }
}

function clearAllErrors() {
    var errors = document.querySelectorAll('.error-message');
    errors.forEach(function(error) {
        error.textContent = '';
        error.style.display = 'none';
        error.removeAttribute('role');
    });
}

function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    var phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

// Toast colors now match the site's navy/teal design tokens instead of
// the old stock green/red gradients.
function showToast(message, type) {
    var toast = document.createElement('div');
    var bgColor = type === 'success'
        ? 'linear-gradient(135deg, #257a4d, #1f6b41)'
        : 'linear-gradient(135deg, #b03a2e, #942f25)';

    toast.setAttribute('role', 'status');
    toast.style.cssText =
        'position: fixed; top: 20px; right: 20px; ' +
        'background: ' + bgColor + '; ' +
        'color: #ffffff; padding: 1rem 1.5rem; border-radius: 8px; ' +
        'box-shadow: 0 8px 24px rgba(11, 32, 54, 0.22); ' +
        'z-index: 10000; font-weight: 600; max-width: 300px; ' +
        'font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; ' +
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

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showSuccessMessage('Copied to clipboard!');
        }).catch(function(err) {
            console.error('Failed to copy:', err);
        });
    } else {
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

function sanitizeHTML(html) {
    var temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

// NOTE: the slideInRight / slideOutRight keyframes used by showToast()
// are already defined once in styles.css (section 21 — Animations), so
// this script no longer injects a duplicate <style> tag for them.

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
