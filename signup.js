/**
 * Signup Form Handler with Authentication
 */

// Initialize signup form
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupSpinner = document.getElementById('signupSpinner');
    const signupSuccess = document.getElementById('signupSuccess');
    const signupFrame = document.getElementById('signupFrame');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
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

            // Show loading state
            signupBtnText.style.display = 'none';
            signupSpinner.style.display = 'inline-block';
            signupBtn.disabled = true;

            // Submit form to backend
            signupForm.submit();

            // Save user credentials to localStorage (simulate registration)
            setTimeout(function() {
                // Store user data
                localStorage.setItem('quickloan_user', JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    registeredAt: new Date().toISOString()
                }));

                // Set authentication token
                localStorage.setItem('quickloan_auth', 'true');
                localStorage.setItem('quickloan_password', btoa(formData.password)); // Simple encoding

                // Show success message
                signupForm.style.display = 'none';
                signupSuccess.style.display = 'block';

                // Redirect to application page after 2 seconds
                setTimeout(function() {
                    window.location.href = 'apply.html';
                }, 2000);
            }, 1000);
        });
    }

    // Handle iframe load
    if (signupFrame) {
        signupFrame.addEventListener('load', function() {
            console.log('Registration information submitted successfully');
        });
    }
});

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

// Helper function to show error
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Helper function to clear all errors
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}

// Mobile menu toggle
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
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});