/**
 * Index Page Handler - Dynamic Home Page
 * Modifies content on the same page based on authentication status
 */

document.addEventListener('DOMContentLoaded', function() {
    checkAndUpdatePageContent();
});

// Check authentication and update page content
function checkAndUpdatePageContent() {
    const isAuthenticated = localStorage.getItem('quickloan_auth') === 'true';
    const user = JSON.parse(localStorage.getItem('quickloan_user') || '{}');
    
    if (isAuthenticated && user.name) {
        // User is logged in - transform the page
        transformPageForAuthenticatedUser(user);
    } else {
        // User is not logged in - keep default public page
        ensurePublicPageState();
    }
}

// Transform page for authenticated user
function transformPageForAuthenticatedUser(user) {
    // Update navigation
    updateNavigationForAuth(user);
    
    // Update hero section
    updateHeroForAuth(user);
    
    // Add dashboard statistics section
    addDashboardStatsSection();
    
    // Add loan calculator
    addLoanCalculatorSection();
}

// Update navigation for authenticated users
function updateNavigationForAuth(user) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Replace Login button with Logout
    const loginBtn = navMenu.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.id = 'logoutBtn';
        
        // Setup logout handler
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Update hero section for authenticated users
function updateHeroForAuth(user) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;
    
    const firstName = user.name ? user.name.split(' ')[0] : 'User';
    
    // Update hero heading and text
    const h1 = heroContent.querySelector('h1');
    const p = heroContent.querySelector('p');
    
    if (h1) h1.textContent = `Welcome Back, ${firstName}!`;
    if (p) p.textContent = 'Manage your loans and explore new financial opportunities.';
    
    // Update hero buttons
    const heroButtons = heroContent.querySelector('.hero-buttons');
    if (heroButtons) {
        heroButtons.innerHTML = `
            <a href="apply.html" class="btn btn-primary btn-large">Apply for New Loan</a>
            <a href="#loan-calculator" class="btn btn-secondary btn-large">Loan Calculator</a>
        `;
    }
}

// Add dashboard statistics section
function addDashboardStatsSection() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Check if dashboard stats already exist
    if (document.querySelector('.dashboard-stats')) return;
    
    const dashboardSection = document.createElement('section');
    dashboardSection.className = 'dashboard-stats';
    dashboardSection.innerHTML = `
        <div class="container">
            <h2 class="section-title">Your Account Overview</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">💼</div>
                    <div class="stat-number" id="userActiveLoans">0</div>
                    <div class="stat-label">Active Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✓</div>
                    <div class="stat-number" id="userApprovedLoans">0</div>
                    <div class="stat-label">Approved Loans</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-number" id="userTotalBorrowed">$0</div>
                    <div class="stat-label">Total Borrowed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-number" id="userCreditScore">Good</div>
                    <div class="stat-label">Credit Rating</div>
                </div>
            </div>
        </div>
    `;
    
    // Insert after hero section
    hero.parentNode.insertBefore(dashboardSection, hero.nextSibling);
    
    // Load user statistics
    loadUserStatistics();
}

// Load user statistics from localStorage
function loadUserStatistics() {
    const userStats = JSON.parse(localStorage.getItem('quickloan_stats') || '{}');
    
    const activeLoansEl = document.getElementById('userActiveLoans');
    const approvedLoansEl = document.getElementById('userApprovedLoans');
    const totalBorrowedEl = document.getElementById('userTotalBorrowed');
    const creditScoreEl = document.getElementById('userCreditScore');
    
    if (activeLoansEl) activeLoansEl.textContent = userStats.activeLoans || 0;
    if (approvedLoansEl) approvedLoansEl.textContent = userStats.approvedLoans || 0;
    if (totalBorrowedEl) totalBorrowedEl.textContent = userStats.totalBorrowed || '$0';
    if (creditScoreEl) creditScoreEl.textContent = userStats.creditScore || 'Good';
}

// Add loan calculator section
function addLoanCalculatorSection() {
    // Find the last services section
    const services = document.querySelectorAll('.services');
    if (!services.length || document.querySelector('.loan-calculator')) return;
    
    const lastService = services[services.length - 1];
    
    const calculatorSection = document.createElement('section');
    calculatorSection.className = 'loan-calculator';
    calculatorSection.id = 'loan-calculator';
    calculatorSection.innerHTML = `
        <div class="container">
            <h2 class="section-title">Loan Calculator</h2>
            <div class="calculator-wrapper">
                <div class="calculator-inputs-section">
                    <div class="calc-input-group">
                        <label for="calcLoanAmount">Loan Amount: <span id="loanAmountDisplay">$10,000</span></label>
                        <input type="range" id="calcLoanAmount" min="1000" max="500000" step="1000" value="10000">
                    </div>
                    
                    <div class="calc-input-group">
                        <label for="calcLoanTerm">Loan Term: <span id="loanTermDisplay">12 months</span></label>
                        <input type="range" id="calcLoanTerm" min="6" max="84" step="6" value="12">
                    </div>
                    
                    <div class="calc-input-group">
                        <label for="calcInterestRate">Interest Rate: <span id="interestRateDisplay">4.99%</span></label>
                        <input type="range" id="calcInterestRate" min="3" max="20" step="0.1" value="4.99">
                    </div>
                </div>
                
                <div class="calculator-results-section">
                    <h3>Estimated Monthly Payment</h3>
                    <div class="monthly-payment-display" id="monthlyPayment">$856</div>
                    
                    <div class="results-breakdown">
                        <div class="result-row">
                            <span>Total Interest:</span>
                            <span id="totalInterest">$272</span>
                        </div>
                        <div class="result-row">
                            <span>Total Amount:</span>
                            <span id="totalAmount">$10,272</span>
                        </div>
                    </div>
                    
                    <a href="apply.html" class="btn btn-primary btn-full">Apply for This Loan</a>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the last services section
    lastService.parentNode.insertBefore(calculatorSection, lastService.nextSibling);
    
    // Initialize calculator functionality
    initializeLoanCalculator();
}

// Initialize loan calculator functionality
function initializeLoanCalculator() {
    const loanAmountSlider = document.getElementById('calcLoanAmount');
    const loanTermSlider = document.getElementById('calcLoanTerm');
    const interestRateSlider = document.getElementById('calcInterestRate');
    
    if (!loanAmountSlider || !loanTermSlider || !interestRateSlider) return;
    
    // Update displays and calculate
    function updateCalculator() {
        const amount = parseInt(loanAmountSlider.value);
        const term = parseInt(loanTermSlider.value);
        const rate = parseFloat(interestRateSlider.value);
        
        // Update display labels
        document.getElementById('loanAmountDisplay').textContent = `$${amount.toLocaleString()}`;
        document.getElementById('loanTermDisplay').textContent = `${term} months`;
        document.getElementById('interestRateDisplay').textContent = `${rate}%`;
        
        // Calculate loan payments
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                              (Math.pow(1 + monthlyRate, term) - 1);
        const totalAmount = monthlyPayment * term;
        const totalInterest = totalAmount - amount;
        
        // Update results
        document.getElementById('monthlyPayment').textContent = `$${Math.round(monthlyPayment).toLocaleString()}`;
        document.getElementById('totalInterest').textContent = `$${Math.round(totalInterest).toLocaleString()}`;
        document.getElementById('totalAmount').textContent = `$${Math.round(totalAmount).toLocaleString()}`;
    }
    
    // Add event listeners
    loanAmountSlider.addEventListener('input', updateCalculator);
    loanTermSlider.addEventListener('input', updateCalculator);
    interestRateSlider.addEventListener('input', updateCalculator);
    
    // Initial calculation
    updateCalculator();
}

// Ensure public page state (no changes needed for logged out users)
function ensurePublicPageState() {
    // Page is already in public state by default
    // No changes needed
}

// Handle user logout
function handleLogout() {
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('quickloan_auth');
        localStorage.removeItem('quickloan_last_login');
        
        // Optionally keep user data for easier re-login
        // localStorage.removeItem('quickloan_user');
        // localStorage.removeItem('quickloan_password');
        
        // Reload page to show public version
        window.location.reload();
    }
}