/**
 * Login Form Handler with Authentication
 */

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    // If already authenticated, redirect to apply page
    if (localStorage.getItem('quickloan_auth') === 'true') {
        window.location.href = 'apply.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginSuccess = document.getElementById('loginSuccess');
    const loginFrame = document.getElementById('loginFrame');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            if (!validateLoginForm()) {
                return;
            }

            // Get form data
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            // Show loading state
            loginBtnText.style.display = 'none';
            loginSpinner.style.display = 'inline-block';
            loginBtn.disabled = true;

            // Submit form to backend
            loginForm.submit();

            // Authenticate user
            setTimeout(function() {
                const storedUser = localStorage.getItem('quickloan_user');
                const storedPassword = localStorage.getItem('quickloan_password');

                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    
                    // Check if email matches
                    if (user.email === email) {
                        // Check if password matches (simple validation)
                        if (storedPassword && atob(storedPassword) === password) {
                            // Successful login
                            localStorage.setItem('quickloan_auth', 'true');
                            localStorage.setItem('quickloan_last_login', new Date().toISOString());

                            // Show success message
                            loginForm.style.display = 'none';
                            loginSuccess.style.display = 'block';

                            // Redirect to application page
                            setTimeout(function() {
                                window.location.href = 'apply.html';
                            }, 1500);
                        } else {
                            // Wrong password
                            showLoginError('Incorrect password. Please try again.');
                        }
                    } else {
                        // Email not found - but still allow login (first time)
                        localStorage.setItem('quickloan_auth', 'true');
                        localStorage.setItem('quickloan_user', JSON.stringify({
                            email: email,
                            loginAt: new Date().toISOString()
                        }));

                        loginForm.style.display = 'none';
                        loginSuccess.style.display = 'block';

                        setTimeout(function() {
                            window.location.href = 'apply.html';
                        }, 1500);
                    }
                } else {
                    // No user registered - allow login anyway (first time)
                    localStorage.setItem('quickloan_auth', 'true');
                    localStorage.setItem('quickloan_user', JSON.stringify({
                        email: email,
                        loginAt: new Date().toISOString()
                    }));

                    loginForm.style.display = 'none';
                    loginSuccess.style.display = 'block';

                    setTimeout(function() {
                        window.location.href = 'apply.html';
                    }, 1500);
                }
            }, 1000);
        });
    }

    // Handle iframe load
    if (loginFrame) {
        loginFrame.addEventListener('load', function() {
            console.log('Login information submitted successfully');
        });
    }
});

// Show login error
function showLoginError(message) {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    const passwordError = document.getElementById('password-error');

    loginBtnText.style.display = 'inline';
    loginSpinner.style.display = 'none';
    loginBtn.disabled = false;

    passwordError.textContent = message;
    passwordError.style.display = 'block';
}

// Validate login form
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    let isValid = true;

    // Clear previous errors
    emailError.textContent = '';
    passwordError.textContent = '';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        emailError.textContent = 'Email is required';
        emailError.style.display = 'block';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        isValid = false;
    }

    // Validate password
    if (!password) {
        passwordError.textContent = 'Password is required';
        passwordError.style.display = 'block';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordError.style.display = 'block';
        isValid = false;
    }

    return isValid;
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
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});