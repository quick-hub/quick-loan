/**
 * Login Form Handler with Persistent Authentication
 *
 * Fixes:
 * - Only logs in users with a REGISTERED account
 * - Verifies the entered password against the stored one
 * - Spinner is shown only during the actual submit attempt
 *   and is always reset on success OR failure
 */

document.addEventListener('DOMContentLoaded', function () {
    initLoginPage();
});

// Initialize login page
function initLoginPage() {
    if (window.QuickLoanAuth && window.QuickLoanAuth.isAuthenticated()) {
        window.location.href = getReturnUrl();
        return;
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

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

    clearErrors();

    // 1. Validate first. If invalid, do NOT show the spinner.
    if (!validateLoginForm()) {
        return;
    }

    var email = document.getElementById('loginEmail').value.trim().toLowerCase();
    var password = document.getElementById('loginPassword').value;

    // 2. Only now show the spinner.
    showLoadingState();

    // 3. Fire-and-forget backend submission
    submitToBackend(e.target);

    // 4. Authenticate against the stored account
    setTimeout(function () {
        authenticateUser(email, password);
    }, 700);
}

// Submit form to backend (does NOT affect local auth outcome)
function submitToBackend(form) {
    if (!form || !form.action || form.action === window.location.href) return;
    try {
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            mode: 'no-cors'
        }).catch(function (error) {
            console.log('Backend submission:', error);
        });
    } catch (err) {
        console.log('Backend submission failed:', err);
    }
}

// Loading state
function showLoadingState() {
    var loginBtn = document.getElementById('loginBtn');
    var loginBtnText = document.getElementById('loginBtnText');
    var loginSpinner = document.getElementById('loginSpinner');

    if (loginBtnText) {
        loginBtnText.classList.add('hidden');
        loginBtnText.style.display = 'none';
    }
    if (loginSpinner) {
        loginSpinner.classList.add('visible');
        loginSpinner.classList.remove('hidden');
        loginSpinner.style.display = 'inline-block';
    }
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.7';
        loginBtn.style.cursor = 'not-allowed';
    }
}

function hideLoadingState() {
    var loginBtn = document.getElementById('loginBtn');
    var loginBtnText = document.getElementById('loginBtnText');
    var loginSpinner = document.getElementById('loginSpinner');

    if (loginBtnText) {
        loginBtnText.classList.remove('hidden');
        loginBtnText.style.display = 'inline';
    }
    if (loginSpinner) {
        loginSpinner.classList.remove('visible');
        loginSpinner.classList.add('hidden');
        loginSpinner.style.display = 'none';
    }
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
        loginBtn.style.cursor = 'pointer';
    }
}

/**
 * Authenticate ONLY against a registered account.
 * Never creates an account on the fly.
 */
function authenticateUser(email, password) {
    var storedUserRaw = localStorage.getItem('quickloan_user');

    // ❌ No account registered at all
    if (!storedUserRaw) {
        failLogin('No account found with this email. Please sign up first.');
        return;
    }

    var storedUser;
    try {
        storedUser = JSON.parse(storedUserRaw);
    } catch (e) {
        failLogin('Account data is corrupted. Please sign up again.');
        return;
    }

    // ❌ Email does not match any registered account
    if (!storedUser || !storedUser.email ||
        storedUser.email.toLowerCase() !== email) {
        failLogin('No account found with this email. Please sign up first.');
        return;
    }

    // ❌ Account exists but has no stored password (legacy)
    var storedPasswordEncoded = localStorage.getItem('quickloan_password');
    if (!storedPasswordEncoded) {
        failLogin('This account has no password set. Please sign up again.');
        return;
    }

    // ✅ Verify the password
    var storedPassword;
    try {
        storedPassword = atob(storedPasswordEncoded);
    } catch (e) {
        failLogin('Unable to verify credentials. Please sign up again.');
        return;
    }

    if (storedPassword !== password) {
        failLogin('Incorrect password. Please try again.');
        return;
    }

    // ✅ Success — persist auth state
    performLogin(storedUser);
}

/**
 * Centralized failure handler — always resets the spinner
 * and displays the error.
 */
function failLogin(message) {
    hideLoadingState();
    showLoginError(message);
}

/**
 * Perform successful login using QuickLoanAuth.
 */
function performLogin(userData) {
    if (!window.QuickLoanAuth) {
        failLogin('Authentication system not loaded. Please refresh the page.');
        return;
    }

    // QuickLoanAuth.login generates a token, sets auth flags,
    // and (with password) stores the password.
    var ok = window.QuickLoanAuth.login(userData, null);
    if (!ok) {
        failLogin('Login failed. Please try again.');
        return;
    }

    // Update success UI
    var loginForm = document.getElementById('loginForm');
    var loginSuccess = document.getElementById('loginSuccess');

    if (loginForm) loginForm.classList.add('hidden');
    if (loginSuccess) {
        loginSuccess.classList.add('visible');
        loginSuccess.style.display = 'block';

        var firstName = userData.firstName || userData.name || 'User';
        var messageText = loginSuccess.querySelector('p');
        if (messageText) {
            messageText.textContent = 'Welcome back, ' + firstName + '! Redirecting...';
        }
    }

    var returnUrl = getReturnUrl();
    setTimeout(function () {
        window.location.href = returnUrl;
    }, 1200);
}

// Display a login error under the password field and reset spinner
function showLoginError(message) {
    hideLoadingState();
    var passwordError = document.getElementById('password-error');
    if (passwordError) {
        passwordError.textContent = message;
        passwordError.classList.add('visible');
        passwordError.style.display = 'block';
    }
}

// Validate login form (does NOT show the spinner)
function validateLoginForm() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');

    var isValid = true;

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
    }

    if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
    }

    return isValid;
}

function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('visible');
    element.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(function (error) {
        error.textContent = '';
        error.classList.remove('visible');
        error.style.display = 'none';
    });
}

// Mobile menu toggle
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
    }
}
