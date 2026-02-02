/**
 * Admin Login Handler
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
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
        loginError.style.display = 'none';
        
        // Show loading
        loginBtnText.style.display = 'none';
        loginSpinner.style.display = 'inline-block';
        loginBtn.disabled = true;
        
        // Simulate authentication (In production, verify against database)
        setTimeout(function() {
            // Admin credentials
            const validUsername = 'ojecgrv@gmail.com';
            const validPassword = 'Admin1';
            
            if (username === validUsername && password === validPassword) {
                // Set login status
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUsername', username);
                
                // Redirect to dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                // Show error
                loginError.style.display = 'flex';
                loginBtnText.style.display = 'inline';
                loginSpinner.style.display = 'none';
                loginBtn.disabled = false;
                
                // Clear password field
                document.getElementById('adminPassword').value = '';
            }
        }, 1000);
    });
});