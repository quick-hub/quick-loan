/**
 * Login Form Handler with Persistent Authentication
 * Integrates with QuickLoanAuth for seamless login experience
 */

document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

// Initialize login page
function initLoginPage() {
    // If already authenticated, redirect based on return URL or to index
    if (window.QuickLoanAuth && window.QuickLoanAuth.isAuthenticated()) {
        var returnUrl = getReturnUrl();
        window.location.href = returnUrl;
        return;
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Initialize mobile menu if function exists
    if (typeof initMobileMenu === 'function') {
        initMobileMenu();
    }
}

// Get return URL from session storage or default to index.html
function getReturnUrl() {
    try {
        var returnUrl = sessionStorage.getItem('quickloan_return_url');
        sessionStorage.removeItem('quickloan_return_url');
        return returnUrl || 'index.html';
    } catch (e) {
        return 'index.html';
    }
}

// Handle login form submission
function handleLoginSubmit(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validate form
    if (!validateLoginForm()) {
        return;
    }

    // Get form data
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;

    // Show loading state
    showLoadingState();

    // Submit form to backend (FormSubmit)
    submitToBackend(e.target, email, password);

    // Authenticate user after short delay
    setTimeout(function() {
        authenticateUser(email, password);
    }, 1000);
}

// Submit form to backend
function submitToBackend(form, email, password) {
    var formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    }).then(function() {
        console.log('Login data submitted to backend');
    }).catch(function(error) {
        console.log('Backend submission:', error);
    });
}

// Show loading state
function showLoadingState() {
    var loginBtn = document.getElementById('loginBtn');
    var loginBtnText = document.getElementById('loginBtnText');
    var loginSpinner = document.getElementById('loginSpinner');

    if (loginBtnText) loginBtnText.classList.add('hidden');
    if (loginSpinner) loginSpinner.classList.add('visible');
    if (loginBtn) loginBtn.disabled = true;
}

// Hide loading state
function hideLoadingState() {
    var loginBtn = document.getElementById('loginBtn');
    var loginBtnText = document.getElementById('loginBtnText');
    var loginSpinner = document.getElementById('loginSpinner');

    if (loginBtnText) loginBtnText.classList.remove('hidden');
    if (loginSpinner) loginSpinner.classList.remove('visible');
    if (loginBtn) loginBtn.disabled = false;
}

// Authenticate user using QuickLoanAuth
function authenticateUser(email, password) {
    var storedUser = localStorage.getItem('quickloan_user');
    var storedPassword = localStorage.getItem('quickloan_password');

    // Check if this is an existing user
    if (storedUser) {
        var user = JSON.parse(storedUser);
        
        // Verify email matches
        if (user.email === email) {
            // Verify password if stored
            if (storedPassword) {
                try {
                    if (atob(storedPassword) === password) {
                        performLogin(user, password);
                    } else {
                        showLoginError('Incorrect password. Please try again.');
                    }
                } catch (e) {
                    // If password decode fails, allow login and reset password
                    performLogin(user, password);
                }
            } else {
                // No password stored, set it and login
                performLogin(user, password);
            }
        } else {
            // Different email - this is a new user
            createNewUser(email, password);
        }
    } else {
        // No existing user - create new one
        createNewUser(email, password);
    }
}

// Create new user and login
function createNewUser(email, password) {
    // Extract name from email
    var emailParts = email.split('@');
    var username = emailParts[0];
    var nameParts = username.split('.');
    var firstName = nameParts[0] ? capitalize(nameParts[0]) : 'User';
    var lastName = nameParts[1] ? capitalize(nameParts[1]) : '';
    
    // Create user data object
    var userData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        name: firstName + (lastName ? ' ' + lastName : ''),
        fullName: firstName + (lastName ? ' ' + lastName : ''),
        createdAt: new Date().toISOString()
    };
    
    performLogin(userData, password);
}

// Perform login using QuickLoanAuth
function performLogin(userData, password) {
    if (!window.QuickLoanAuth) {
        console.error('QuickLoanAuth not available');
        showLoginError('Authentication system not loaded. Please refresh the page.');
        hideLoadingState();
        return;
    }

    // Use QuickLoanAuth.login for persistent authentication
    var loginSuccess = window.QuickLoanAuth.login(userData, password);
    
    if (loginSuccess) {
        handleSuccessfulLogin(userData);
    } else {
        showLoginError('Login failed. Please try again.');
        hideLoadingState();
    }
}

// Handle successful login - Show success and redirect
function handleSuccessfulLogin(user) {
    var loginForm = document.getElementById('loginForm');
    var loginSuccess = document.getElementById('loginSuccess');

    // Show success message
    if (loginForm) loginForm.classList.add('hidden');
    if (loginSuccess) {
        loginSuccess.classList.add('visible');
        
        // Update success message with user's name
        var firstName = user.firstName || user.name || 'User';
        var messageText = loginSuccess.querySelector('p');
        if (messageText) {
            messageText.textContent = 'Welcome back, ' + firstName + '! Redirecting...';
        }
    }

    // Get return URL
    var returnUrl = getReturnUrl();

    // Redirect after showing success message
    setTimeout(function() {
        window.location.href = returnUrl;
    }, 1500);
}

// Show login error
function showLoginError(message) {
    hideLoadingState();

    var passwordError = document.getElementById('password-error');
    if (passwordError) {
        passwordError.textContent = message;
        passwordError.classList.add('visible');
    }
}

// Validate login form
function validateLoginForm() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');
    
    var isValid = true;

    // Validate email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordError, 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

// Show error message
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('visible');
    }
}

// Clear all error messages
function clearErrors() {
    var errors = document.querySelectorAll('.error-message');
    errors.forEach(function(error) {
        error.textContent = '';
        error.classList.remove('visible');
    });
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Mobile menu toggle (if not already defined in main.js)
function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        var navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Auto-fill demo credentials (for development/testing only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.fillDemoCredentials = function() {
        document.getElementById('loginEmail').value = 'demo@quickloan.com';
        document.getElementById('loginPassword').value = 'password123';
    };
}
