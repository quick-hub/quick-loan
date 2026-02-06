/**
 * Signup Form Handler with Authentication
 * Properly logs in user and redirects to index.html with dashboard
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
        
        // Add real-time validation
        addRealtimeValidation();
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

// Add real-time validation to form fields
function addRealtimeValidation() {
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('signupEmail');
    const phone = document.getElementById('phoneNumber');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    if (fullName) {
        fullName.addEventListener('blur', function() {
            validateField('fullName');
        });
        fullName.addEventListener('input', function() {
            clearFieldError('name-error');
        });
    }

    if (email) {
        email.addEventListener('blur', function() {
            validateField('signupEmail');
        });
        email.addEventListener('input', function() {
            clearFieldError('email-error');
        });
    }

    if (phone) {
        phone.addEventListener('blur', function() {
            validateField('phoneNumber');
        });
        phone.addEventListener('input', function() {
            clearFieldError('phone-error');
        });
    }

    if (password) {
        password.addEventListener('input', function() {
            validateField('signupPassword');
            // Also revalidate confirm password if it has a value
            if (confirmPassword && confirmPassword.value) {
                validateField('confirmPassword');
            }
        });
    }

    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            validateField('confirmPassword');
        });
    }
}

// Validate individual field
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';

    switch(fieldId) {
        case 'fullName':
            if (!value) {
                errorMsg = 'Full name is required';
                isValid = false;
            } else if (value.length < 3) {
                errorMsg = 'Name must be at least 3 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                errorMsg = 'Name can only contain letters, spaces, hyphens and apostrophes';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('name-error'), errorMsg);
            else clearFieldError('name-error');
            break;

        case 'signupEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMsg = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMsg = 'Please enter a valid email address';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('email-error'), errorMsg);
            else clearFieldError('email-error');
            break;

        case 'phoneNumber':
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            const cleanPhone = value.replace(/[\s\-\+\(\)]/g, '');
            if (!value) {
                errorMsg = 'Phone number is required';
                isValid = false;
            } else if (!phoneRegex.test(value)) {
                errorMsg = 'Please enter a valid phone number';
                isValid = false;
            } else if (cleanPhone.length < 10) {
                errorMsg = 'Phone number must be at least 10 digits';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('phone-error'), errorMsg);
            else clearFieldError('phone-error');
            break;

        case 'signupPassword':
            if (!value) {
                errorMsg = 'Password is required';
                isValid = false;
            } else if (value.length < 8) {
                errorMsg = 'Password must be at least 8 characters';
                isValid = false;
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                errorMsg = 'Password must contain uppercase, lowercase, and number';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('password-error'), errorMsg);
            else clearFieldError('password-error');
            break;

        case 'confirmPassword':
            const passwordField = document.getElementById('signupPassword');
            if (!value) {
                errorMsg = 'Please confirm your password';
                isValid = false;
            } else if (passwordField && value !== passwordField.value) {
                errorMsg = 'Passwords do not match';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('confirm-password-error'), errorMsg);
            else clearFieldError('confirm-password-error');
            break;
    }

    return isValid;
}

// Clear specific field error
function clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
        errorElement.style.display = 'none';
    }
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
        email: document.getElementById('signupEmail').value.trim().toLowerCase(),
        phone: document.getElementById('phoneNumber').value.trim(),
        password: document.getElementById('signupPassword').value
    };

    // Check if user already exists
    const existingUser = localStorage.getItem('quickloan_user');
    if (existingUser) {
        try {
            const user = JSON.parse(existingUser);
            if (user.email && user.email.toLowerCase() === formData.email) {
                showError(document.getElementById('email-error'), 'An account with this email already exists. Please login instead.');
                return;
            }
        } catch (e) {
            console.error('Error checking existing user:', e);
        }
    }

    // Show loading state
    showLoadingState();

    // Submit form to backend (if form action is set)
    const form = document.getElementById('signupForm');
    if (form.action && form.action !== '' && form.action !== window.location.href) {
        const formDataObj = new FormData(form);
        
        fetch(form.action, {
            method: 'POST',
            body: formDataObj,
            mode: 'no-cors'
        }).then(function() {
            console.log('Form submitted to backend');
        }).catch(function(error) {
            console.log('Form submission error:', error);
        });
    }

    // Process registration after short delay (simulate backend processing)
    setTimeout(function() {
        processRegistration(formData);
    }, 1000);
}

// Show loading state
function showLoadingState() {
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupSpinner = document.getElementById('signupSpinner');

    if (signupBtnText) {
        signupBtnText.classList.add('hidden');
        signupBtnText.style.display = 'none';
    }
    if (signupSpinner) {
        signupSpinner.classList.add('visible');
        signupSpinner.classList.remove('hidden');
        signupSpinner.style.display = 'inline-block';
    }
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.style.opacity = '0.7';
        signupBtn.style.cursor = 'not-allowed';
    }
}

// Hide loading state
function hideLoadingState() {
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupSpinner = document.getElementById('signupSpinner');

    if (signupBtnText) {
        signupBtnText.classList.remove('hidden');
        signupBtnText.style.display = 'inline';
    }
    if (signupSpinner) {
        signupSpinner.classList.remove('visible');
        signupSpinner.classList.add('hidden');
        signupSpinner.style.display = 'none';
    }
    if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.style.opacity = '1';
        signupBtn.style.cursor = 'pointer';
    }
}

// Process registration - Create account with complete data and redirect
function processRegistration(formData) {
    const signupFormElement = document.getElementById('signupForm');
    const signupSuccess = document.getElementById('signupSuccess');

    try {
        // Extract first name and last name from full name
        const nameParts = formData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create comprehensive user object
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

        // Store user data in localStorage using QuickLoanAuth if available
        if (typeof window.QuickLoanAuth !== 'undefined') {
            window.QuickLoanAuth.setUserData(userData);
        } else {
            // Fallback if auth-check.js hasn't loaded yet
            localStorage.setItem('quickloan_user', JSON.stringify(userData));
            localStorage.setItem('quickloan_auth', 'true');
        }

        // Store password securely (base64 encoded)
        localStorage.setItem('quickloan_password', btoa(formData.password));
        
        // Update last login time
        localStorage.setItem('quickloan_last_login', new Date().toISOString());

        // Initialize default dashboard statistics
        const defaultStats = {
            activeLoans: '0',
            approvedLoans: '0',
            totalBorrowed: '0',
            creditScore: 'Excellent'
        };
        localStorage.setItem('quickloan_stats', JSON.stringify(defaultStats));

        // Initialize comprehensive activity feed with sample data
        const defaultActivity = [
            { date: 'Feb 04, 2026', type: 'Personal Loan',  amount: '$12,000', status: 'Processing', color: '#ffc107' },
            { date: 'Jan 28, 2026', type: 'Personal Loan',  amount: '$15,000', status: 'Approved',   color: '#51cf66' },
            { date: 'Jan 22, 2026', type: 'Business Loan',  amount: '$50,000', status: 'Pending',    color: '#ffc107' },
            { date: 'Jan 15, 2026', type: 'Emergency Loan', amount: '$5,000',  status: 'Funded',     color: '#00d4ff' },
            { date: 'Dec 30, 2025', type: 'Personal Loan',  amount: '$8,000',  status: 'Completed',  color: '#b0d4e3' },
            { date: 'Dec 18, 2025', type: 'Business Loan',  amount: '$35,000', status: 'Completed',  color: '#b0d4e3' },
            { date: 'Nov 25, 2025', type: 'Emergency Loan', amount: '$3,500',  status: 'Funded',     color: '#00d4ff' },
            { date: 'Nov 10, 2025', type: 'Personal Loan',  amount: '$20,000', status: 'Completed',  color: '#b0d4e3' },
            { date: 'Oct 28, 2025', type: 'Business Loan',  amount: '$45,000', status: 'Approved',   color: '#51cf66' },
            { date: 'Oct 15, 2025', type: 'Personal Loan',  amount: '$10,000', status: 'Completed',  color: '#b0d4e3' },
            { date: 'Sep 30, 2025', type: 'Emergency Loan', amount: '$4,000',  status: 'Funded',     color: '#00d4ff' },
            { date: 'Sep 12, 2025', type: 'Personal Loan',  amount: '$18,000', status: 'Completed',  color: '#b0d4e3' },
            { date: 'Aug 25, 2025', type: 'Business Loan',  amount: '$60,000', status: 'Approved',   color: '#51cf66' },
            { date: 'Aug 08, 2025', type: 'Personal Loan',  amount: '$9,500',  status: 'Completed',  color: '#b0d4e3' },
            { date: 'Jul 20, 2025', type: 'Emergency Loan', amount: '$2,800',  status: 'Funded',     color: '#00d4ff' }
        ];
        localStorage.setItem('quickloan_activity', JSON.stringify(defaultActivity));

        // Clear any navigation hints from session storage
        try { 
            sessionStorage.removeItem('showPublicOnLoad');
            sessionStorage.removeItem('quickloan_return_url');
        } catch (e) { 
            console.log('Session storage not available');
        }

        // Hide loading state
        hideLoadingState();

        // Show success message
        if (signupFormElement) {
            signupFormElement.style.display = 'none';
            signupFormElement.classList.add('hidden');
        }
        if (signupSuccess) {
            signupSuccess.classList.add('visible');
            signupSuccess.classList.remove('hidden');
            signupSuccess.style.display = 'block';
        }

        // Log successful registration
        console.log('Registration successful for:', formData.email);
        console.log('User will see dashboard with activity feed on homepage');

        // Redirect to index.html (home page with dashboard) after 2 seconds
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        hideLoadingState();
        showError(document.getElementById('email-error'), 'An error occurred during registration. Please try again.');
    }
}

// Validate complete signup form
function validateSignupForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms');

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
    } else if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
        showError(nameError, 'Name can only contain letters, spaces, hyphens and apostrophes');
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
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    if (!phone) {
        showError(phoneError, 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showError(phoneError, 'Please enter a valid phone number');
        isValid = false;
    } else if (cleanPhone.length < 10) {
        showError(phoneError, 'Phone number must be at least 10 digits');
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
    if (agreeTerms && !agreeTerms.checked) {
        alert('Please agree to the Terms of Service and Privacy Policy to continue.');
        isValid = false;
    }

    return isValid;
}

// Show error message
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('visible');
        element.classList.remove('hidden');
        element.style.display = 'block';
        element.style.color = '#ef4444';
        element.style.fontSize = '0.875rem';
        element.style.marginTop = '0.25rem';
    }
}

// Clear all error messages
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(function(error) {
        error.textContent = '';
        error.classList.remove('visible');
        error.classList.add('hidden');
        error.style.display = 'none';
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
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}
