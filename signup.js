/**
 * Signup Form Handler with Authentication
 * Registers a user, persists credentials via QuickLoanAuth,
 * and redirects to the dashboard.
 */

document.addEventListener('DOMContentLoaded', function () {
    initSignupPage();
});

// Initialize signup page
function initSignupPage() {
    if (window.QuickLoanAuth && window.QuickLoanAuth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    var signupForm = document.getElementById('signupForm');
    var signupFrame = document.getElementById('signupFrame');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
        addRealtimeValidation();
    }

    if (signupFrame) {
        signupFrame.addEventListener('load', function () {
            console.log('Registration info submitted to backend');
        });
    }

    initMobileMenu();
}

// Real-time validation wiring
function addRealtimeValidation() {
    var fullName = document.getElementById('fullName');
    var email = document.getElementById('signupEmail');
    var phone = document.getElementById('phoneNumber');
    var password = document.getElementById('signupPassword');
    var confirmPassword = document.getElementById('confirmPassword');

    if (fullName) {
        fullName.addEventListener('blur', function () { validateField('fullName'); });
        fullName.addEventListener('input', function () { clearFieldError('name-error'); });
    }
    if (email) {
        email.addEventListener('blur', function () { validateField('signupEmail'); });
        email.addEventListener('input', function () { clearFieldError('email-error'); });
    }
    if (phone) {
        phone.addEventListener('blur', function () { validateField('phoneNumber'); });
        phone.addEventListener('input', function () { clearFieldError('phone-error'); });
    }
    if (password) {
        password.addEventListener('input', function () {
            validateField('signupPassword');
            if (confirmPassword && confirmPassword.value) {
                validateField('confirmPassword');
            }
        });
    }
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function () {
            validateField('confirmPassword');
        });
    }
}

// Validate a single field
function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return true;

    var value = field.value.trim();
    var isValid = true;
    var errorMsg = '';

    switch (fieldId) {
        case 'fullName':
            if (!value) { errorMsg = 'Full name is required'; isValid = false; }
            else if (value.length < 3) { errorMsg = 'Name must be at least 3 characters'; isValid = false; }
            else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                errorMsg = 'Name can only contain letters, spaces, hyphens and apostrophes';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('name-error'), errorMsg);
            else clearFieldError('name-error');
            break;

        case 'signupEmail': {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) { errorMsg = 'Email is required'; isValid = false; }
            else if (!emailRegex.test(value)) { errorMsg = 'Please enter a valid email address'; isValid = false; }
            if (!isValid) showError(document.getElementById('email-error'), errorMsg);
            else clearFieldError('email-error');
            break;
        }

        case 'phoneNumber': {
            var phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            var cleanPhone = value.replace(/[\s\-\+\(\)]/g, '');
            if (!value) { errorMsg = 'Phone number is required'; isValid = false; }
            else if (!phoneRegex.test(value)) { errorMsg = 'Please enter a valid phone number'; isValid = false; }
            else if (cleanPhone.length < 10) {
                errorMsg = 'Phone number must be at least 10 digits';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('phone-error'), errorMsg);
            else clearFieldError('phone-error');
            break;
        }

        case 'signupPassword':
            if (!value) { errorMsg = 'Password is required'; isValid = false; }
            else if (value.length < 8) { errorMsg = 'Password must be at least 8 characters'; isValid = false; }
            else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                errorMsg = 'Password must contain uppercase, lowercase, and number';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('password-error'), errorMsg);
            else clearFieldError('password-error');
            break;

        case 'confirmPassword': {
            var passwordField = document.getElementById('signupPassword');
            if (!value) { errorMsg = 'Please confirm your password'; isValid = false; }
            else if (passwordField && value !== passwordField.value) {
                errorMsg = 'Passwords do not match';
                isValid = false;
            }
            if (!isValid) showError(document.getElementById('confirm-password-error'), errorMsg);
            else clearFieldError('confirm-password-error');
            break;
        }
    }

    return isValid;
}

// Clear a single field error
function clearFieldError(errorId) {
    var errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
        errorElement.style.display = 'none';
    }
}

// Handle signup submit
function handleSignupSubmit(e) {
    e.preventDefault();

    if (!validateSignupForm()) return;

    var formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('signupEmail').value.trim().toLowerCase(),
        phone: document.getElementById('phoneNumber').value.trim(),
        password: document.getElementById('signupPassword').value
    };

    // Reject duplicate email
    var existingUser = localStorage.getItem('quickloan_user');
    if (existingUser) {
        try {
            var user = JSON.parse(existingUser);
            if (user.email && user.email.toLowerCase() === formData.email) {
                showError(
                    document.getElementById('email-error'),
                    'An account with this email already exists. Please login instead.'
                );
                return;
            }
        } catch (err) {
            console.error('Error checking existing user:', err);
        }
    }

    showLoadingState();

    // Optional backend submission (fire-and-forget)
    var form = document.getElementById('signupForm');
    if (form.action && form.action !== '' && form.action !== window.location.href) {
        try {
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                mode: 'no-cors'
            }).catch(function (error) {
                console.log('Form submission error:', error);
            });
        } catch (err) {
            console.log('Form submission failed:', err);
        }
    }

    setTimeout(function () {
        processRegistration(formData);
    }, 900);
}

// Loading state
function showLoadingState() {
    var signupBtn = document.getElementById('signupBtn');
    var signupBtnText = document.getElementById('signupBtnText');
    var signupSpinner = document.getElementById('signupSpinner');

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

function hideLoadingState() {
    var signupBtn = document.getElementById('signupBtn');
    var signupBtnText = document.getElementById('signupBtnText');
    var signupSpinner = document.getElementById('signupSpinner');

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

// Process registration
function processRegistration(formData) {
    var signupFormElement = document.getElementById('signupForm');
    var signupSuccess = document.getElementById('signupSuccess');

    try {
        var nameParts = formData.fullName.trim().split(/\s+/);
        var firstName = nameParts[0];
        var lastName = nameParts.slice(1).join(' ') || '';

        var userData = {
            name: formData.fullName,
            fullName: formData.fullName,
            firstName: firstName,
            lastName: lastName,
            email: formData.email,
            phone: formData.phone,
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Persist via QuickLoanAuth so the password is stored for later verification
        if (window.QuickLoanAuth && typeof window.QuickLoanAuth.login === 'function') {
            window.QuickLoanAuth.login(userData, formData.password);
        } else {
            // Fallback if auth-check.js wasn't loaded
            localStorage.setItem('quickloan_user', JSON.stringify(userData));
            localStorage.setItem('quickloan_auth', 'true');
            localStorage.setItem('quickloan_token', btoa(formData.email + '|' + Date.now()));
            localStorage.setItem('quickloan_password', btoa(formData.password));
        }

        // Seed default dashboard data
        var defaultStats = {
            activeLoans: '0',
            approvedLoans: '0',
            totalBorrowed: '0',
            creditScore: 'Excellent'
        };
        localStorage.setItem('quickloan_stats', JSON.stringify(defaultStats));

        var defaultActivity = [
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

        try {
            sessionStorage.removeItem('showPublicOnLoad');
            sessionStorage.removeItem('quickloan_return_url');
        } catch (err) { /* ignore */ }

        hideLoadingState();

        if (signupFormElement) {
            signupFormElement.style.display = 'none';
            signupFormElement.classList.add('hidden');
        }
        if (signupSuccess) {
            signupSuccess.classList.add('visible');
            signupSuccess.classList.remove('hidden');
            signupSuccess.style.display = 'block';
        }

        console.log('Registration successful for:', formData.email);

        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1800);

    } catch (error) {
        console.error('Registration error:', error);
        hideLoadingState();
        showError(
            document.getElementById('email-error'),
            'An error occurred during registration. Please try again.'
        );
    }
}

// Validate full signup form
function validateSignupForm() {
    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var phone = document.getElementById('phoneNumber').value.trim();
    var password = document.getElementById('signupPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var agreeTerms = document.getElementById('agreeTerms');

    var nameError = document.getElementById('name-error');
    var emailError = document.getElementById('email-error');
    var phoneError = document.getElementById('phone-error');
    var passwordError = document.getElementById('password-error');
    var confirmPasswordError = document.getElementById('confirm-password-error');

    var isValid = true;
    clearErrors();

    if (!fullName) { showError(nameError, 'Full name is required'); isValid = false; }
    else if (fullName.length < 3) { showError(nameError, 'Name must be at least 3 characters'); isValid = false; }
    else if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
        showError(nameError, 'Name can only contain letters, spaces, hyphens and apostrophes');
        isValid = false;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { showError(emailError, 'Email is required'); isValid = false; }
    else if (!emailRegex.test(email)) { showError(emailError, 'Please enter a valid email address'); isValid = false; }

    var phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    var cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    if (!phone) { showError(phoneError, 'Phone number is required'); isValid = false; }
    else if (!phoneRegex.test(phone)) { showError(phoneError, 'Please enter a valid phone number'); isValid = false; }
    else if (cleanPhone.length < 10) {
        showError(phoneError, 'Phone number must be at least 10 digits');
        isValid = false;
    }

    if (!password) { showError(passwordError, 'Password is required'); isValid = false; }
    else if (password.length < 8) { showError(passwordError, 'Password must be at least 8 characters'); isValid = false; }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showError(passwordError, 'Password must contain uppercase, lowercase, and number');
        isValid = false;
    }

    if (!confirmPassword) { showError(confirmPasswordError, 'Please confirm your password'); isValid = false; }
    else if (password !== confirmPassword) {
        showError(confirmPasswordError, 'Passwords do not match');
        isValid = false;
    }

    if (agreeTerms && !agreeTerms.checked) {
        alert('Please agree to the Terms of Service and Privacy Policy to continue.');
        isValid = false;
    }

    return isValid;
}

// Show / clear error helpers
function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('visible');
    element.classList.remove('hidden');
    element.style.display = 'block';
    element.style.color = '#ef4444';
    element.style.fontSize = '0.875rem';
    element.style.marginTop = '0.25rem';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(function (error) {
        error.textContent = '';
        error.classList.remove('visible');
        error.classList.add('hidden');
        error.style.display = 'none';
    });
}

// Mobile menu
function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}
