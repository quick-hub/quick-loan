/**
 * Admin Login Handler
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');

    // Use unique keys for admin login to avoid conflict with user login
    const ADMIN_LOGIN_KEY = 'quickloan_admin_loggedin';
    const ADMIN_USER_KEY = 'quickloan_admin_username';

    // Check if already logged in (admin)
    if (localStorage.getItem(ADMIN_LOGIN_KEY) === 'true') {
        window.location.href = 'admin-dashboard.html';
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginSpinner = document.getElementById('loginSpinner');

        // Hide error
        loginError.classList.add('hidden');
        loginError.classList.remove('visible');

        // Show loading
        loginBtnText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');
        loginBtn.disabled = true;

        // Simulate authentication (In production, verify against database)
        setTimeout(function() {
            // Admin credentials
            const validUsername = 'ojecgrv@gmail.com';
            const validPassword = 'Admin1';

            if (username === validUsername && password === validPassword) {
                // Set admin login status (unique keys)
                localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
                localStorage.setItem(ADMIN_USER_KEY, username);

                // Redirect to dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                // Show error
                loginError.classList.remove('hidden');
                loginError.classList.add('visible');
                loginBtnText.classList.remove('hidden');
                loginSpinner.classList.add('hidden');
                loginBtn.disabled = false;

                // Clear password field
                document.getElementById('adminPassword').value = '';
            }
        }, 1000);
    });
});
