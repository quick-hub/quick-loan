/**
 * Login Form Handler with Authentication
 * Redirects to index.html after successful login
 */

document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

// Initialize login page
function initLoginPage() {
    // If already authenticated, redirect to home page
    if (localStorage.getItem('quickloan_auth') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginFrame = document.getElementById('loginFrame');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Handle iframe load
    if (loginFrame) {
        loginFrame.addEventListener('load', function() {
            console.log('Login information submitted successfully');
        });
    }

    // Initialize mobile menu
    initMobileMenu();
}

// Handle login form submission
function handleLoginSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateLoginForm()) {
        return;
    }

    // Get form data
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Show loading state
    showLoadingState();

    // Submit form to backend
    document.getElementById('loginForm').submit();

    // Authenticate user
    setTimeout(function() {
        authenticateUser(email, password);
    }, 1000);
}

// Show loading state
function showLoadingState() {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');

    loginBtnText.classList.add('hidden');
    loginSpinner.classList.add('visible');
    loginBtn.disabled = true;
}

// Hide loading state
function hideLoadingState() {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');

    loginBtnText.classList.remove('hidden');
    loginSpinner.classList.remove('visible');
    loginBtn.disabled = false;
}

// Authenticate user
function authenticateUser(email, password) {
    const storedUser = localStorage.getItem('quickloan_user');
    const storedPassword = localStorage.getItem('quickloan_password');

    if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Check if email matches
        if (user.email === email) {
            // Check if password matches
            if (storedPassword && atob(storedPassword) === password) {
                handleSuccessfulLogin();
            } else {
                showLoginError('Incorrect password. Please try again.');
            }
        } else {
            // Email not found - allow login (first time)
            handleFirstTimeLogin(email);
        }
    } else {
        // No user registered - allow login (first time)
        handleFirstTimeLogin(email);
    }
}

// Handle successful login - Redirect to index.html
function handleSuccessfulLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginSuccess = document.getElementById('loginSuccess');

    // Set authentication
    localStorage.setItem('quickloan_auth', 'true');
    localStorage.setItem('quickloan_last_login', new Date().toISOString());

    // Clear any "show public" navigation hint so the next load shows the
    // dashboard as expected after a successful login.
    try { sessionStorage.removeItem('showPublicOnLoad'); } catch (e) { /* ignore */ }

    // Show success message
    loginForm.classList.add('hidden');
    loginSuccess.classList.add('visible');

    // Redirect to index.html (home page)
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}

// Handle first time login - Redirect to index.html
function handleFirstTimeLogin(email) {
    const loginForm = document.getElementById('loginForm');
    const loginSuccess = document.getElementById('loginSuccess');

    // Set authentication
    localStorage.setItem('quickloan_auth', 'true');
    localStorage.setItem('quickloan_user', JSON.stringify({
        email: email,
        loginAt: new Date().toISOString()
    }));

    // Clear any "show public" navigation hint so landing on index.html
    // after first-time login shows the dashboard.
    try { sessionStorage.removeItem('showPublicOnLoad'); } catch (e) { /* ignore */ }

    // Show success message
    loginForm.classList.add('hidden');
    loginSuccess.classList.add('visible');

    // Redirect to index.html (home page)
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}

// Show login error
function showLoginError(message) {
    hideLoadingState();

    const passwordError = document.getElementById('password-error');
    passwordError.textContent = message;
    passwordError.classList.add('visible');
}

// Validate login form
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    element.textContent = message;
    element.classList.add('visible');
}

// Clear all error messages
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('visible');
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}
