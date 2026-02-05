/**
 * Signup Form Handler with Authentication
 * Redirects to index.html after successful registration
 */

document.addEventListener('DOMContentLoaded', function() {
    initSignupPage();
});

// Initialize signup page
function initSignupPage() {
    // If already authenticated, redirect to home page
    if (localStorage.getItem('quickloan_auth') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const signupForm = document.getElementById('signupForm');
    const signupFrame = document.getElementById('signupFrame');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    // Handle iframe load
    if (signupFrame) {
        signupFrame.addEventListener('load', function() {
            console.log('Registration information submitted successfully');
        });
    }

    // Initialize mobile menu
    initMobileMenu();
}

// Handle signup form submission
function handleSignupSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateSignupForm()) {
        return;
    }

    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('signupEmail').value.trim(),
        phone: document.getElementById('phoneNumber').value.trim(),
        password: document.getElementById('signupPassword').value
    };

    // Check if user already exists
    const existingUser = localStorage.getItem('quickloan_user');
    if (existingUser) {
        const user = JSON.parse(existingUser);
        if (user.email === formData.email) {
            showError(document.getElementById('email-error'), 'An account with this email already exists. Please login instead.');
            return;
        }
    }

    // Show loading state
    showLoadingState();

    // Submit form to backend
    const form = document.getElementById('signupForm');
    const formDataObj = new FormData(form);
    
    // Submit using fetch to avoid page reload
    fetch(form.action, {
        method: 'POST',
        body: formDataObj,
        mode: 'no-cors'
    }).then(function() {
        console.log('Form submitted to backend');
    }).catch(function(error) {
        console.log('Form submission:', error);
    });

    // Process registration after short delay
    setTimeout(function() {
        processRegistration(formData);
    }, 1000);
}

// Show loading state
function showLoadingState() {
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupSpinner = document.getElementById('signupSpinner');

    if (signupBtnText) signupBtnText.classList.add('hidden');
    if (signupSpinner) signupSpinner.classList.add('visible');
    if (signupBtn) signupBtn.disabled = true;
}

// Hide loading state
function hideLoadingState() {
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupSpinner = document.getElementById('signupSpinner');

    if (signupBtnText) signupBtnText.classList.remove('hidden');
    if (signupSpinner) signupSpinner.classList.remove('visible');
    if (signupBtn) signupBtn.disabled = false;
}

// Process registration - Redirect to index.html
function processRegistration(formData) {
    const signupForm = document.getElementById('signupForm');
    const signupSuccess = document.getElementById('signupSuccess');

    // Extract first name from full name
    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user object with all details
    const userData = {
        name: formData.fullName,
        fullName: formData.fullName,
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phone: formData.phone,
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Store user data
    localStorage.setItem('quickloan_user', JSON.stringify(userData));

    // Set authentication token
    localStorage.setItem('quickloan_auth', 'true');
    localStorage.setItem('quickloan_password', btoa(formData.password));
    localStorage.setItem('quickloan_last_login', new Date().toISOString());

    // Initialize default stats
    const defaultStats = {
        activeLoans: '0',
        approvedLoans: '0',
        totalBorrowed: '$0',
        creditScore: 'Good'
    };
    localStorage.setItem('quickloan_stats', JSON.stringify(defaultStats));

    // Clear any navigation hints
    try { 
        sessionStorage.removeItem('showPublicOnLoad'); 
    } catch (e) { 
        console.log('Session storage not available'); 
    }

    // Show success message
    if (signupForm) signupForm.classList.add('hidden');
    if (signupSuccess) signupSuccess.classList.add('visible');

    // Redirect to index.html (home page)
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 2000);
}

// Validate signup form
function validateSignupForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Validate full name
    if (!fullName) {
        showError(nameError, 'Full name is required');
        isValid = false;
    } else if (fullName.length < 3) {
        showError(nameError, 'Name must be at least 3 characters');
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phone) {
        showError(phoneError, 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showError(phoneError, 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (password.length < 8) {
        showError(passwordError, 'Password must be at least 8 characters');
        isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showError(passwordError, 'Password must contain uppercase, lowercase, and number');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError(confirmPasswordError, 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError(confirmPasswordError, 'Passwords do not match');
        isValid = false;
    }

    // Validate terms agreement
    if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
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

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}
