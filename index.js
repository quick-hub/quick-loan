/**
 * index.js — Public ↔ Dashboard swap
 *
 * This script handles the dynamic content switching between
 * the public landing page and the personalized dashboard.
 * 
 * Features:
 * - Automatic detection of authentication state
 * - Hero section personalization
 * - Public sections hiding for authenticated users
 * - Dashboard rendering with user data
 * - Activity feed with load more functionality
 * - Statistics display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Use the global auth checker
    if (typeof window.QuickLoanAuth !== 'undefined' && window.QuickLoanAuth.isAuthenticated()) {
        var user = window.QuickLoanAuth.getUserData();
        swapToDashboard(user);
    }
    // else: leave the static public page as-is
});

/* ═══════════════════════════════════════════
   ORCHESTRATOR - Main Dashboard Controller
   ═══════════════════════════════════════════ */
function swapToDashboard(user) {
    // 1. Personalize hero section
    personalizeHero(user);

    // 2. Hide the entire public landing body
    var pub = document.getElementById('publicSections');
    if (pub) pub.style.display = 'none';

    // 3. Render dashboard into the waiting anchor
    var dash = document.getElementById('dashboardSections');
    if (dash) {
        dash.innerHTML = buildDashboard();
        dash.style.display = 'block';
    }

    // 4. Hydrate dynamic parts with data
    fillStats();
    fillActivity();
    
    // 5. Update last login time
    if (window.QuickLoanAuth) {
        window.QuickLoanAuth.updateLastLoginTime();
    }
}

/* ═══════════════════════════════════════════
   HERO SECTION PERSONALIZATION
   ═══════════════════════════════════════════ */
function personalizeHero(user) {
    // Use the improved first name getter from auth-check.js
    var firstName = window.QuickLoanAuth ? window.QuickLoanAuth.getFirstName() : 'User';

    // Update title and description
    var title = document.getElementById('heroTitle');
    var desc  = document.getElementById('heroDesc');
    
    if (title) {
        title.textContent = 'Welcome Back, ' + firstName + '! 👋';
    }
    
    if (desc) {
        desc.textContent = 'Manage your loans, check your status, or start a new application.';
    }

    // Update buttons with dashboard-relevant actions
    var btns = document.getElementById('heroButtons');
    if (btns) {
        btns.innerHTML =
            '<a href="apply.html" class="btn btn-primary btn-large">Apply for New Loan</a>' +
            '<a href="#quick-actions" class="btn btn-secondary btn-large">View Services</a>';
    }

    // Hide the marketing illustration
    var img = document.getElementById('heroImageWrap');
    if (img) img.style.display = 'none';
}

/* ═══════════════════════════════════════════
   DASHBOARD HTML GENERATION
   ═══════════════════════════════════════════ */
function buildDashboard() {
    return (
        // Account Overview Section
        '<section class="stats-section">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Your Account Overview</h2>' +
        '    <div class="stats-grid">' +
        '      <div>' +
        '        <div class="stat-number" id="dashActive">0</div>' +
        '        <div class="stat-label">Active Applications</div>' +
        '      </div>' +
        '      <div>' +
        '        <div class="stat-number" id="dashApproved">0</div>' +
        '        <div class="stat-label">Approved Loans</div>' +
        '      </div>' +
        '      <div>' +
        '        <div class="stat-number" id="dashBorrowed">$0</div>' +
        '        <div class="stat-label">Total Borrowed</div>' +
        '      </div>' +
        '      <div>' +
        '        <div class="stat-number" id="dashCredit">Good</div>' +
        '        <div class="stat-label">Credit Rating</div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        // Quick Actions Section
        '<section class="services" id="quick-actions">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Quick Actions</h2>' +
        '    <div class="services-grid">' +
        '      <a href="apply.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon">🚀</div>' +
        '        <h3>New Application</h3>' +
        '        <p>Start a fresh loan application in just a few minutes.</p>' +
        '      </a>' +
        '      <a href="personal-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon">💼</div>' +
        '        <h3>Personal Loan</h3>' +
        '        <p>Flexible funds for any personal financial need.</p>' +
        '      </a>' +
        '      <a href="business-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon">🏢</div>' +
        '        <h3>Business Loan</h3>' +
        '        <p>Capital to grow or launch your venture.</p>' +
        '      </a>' +
        '      <a href="emergency-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon">🚨</div>' +
        '        <h3>Emergency Loan</h3>' +
        '        <p>Fast funds deposited within 24 hours.</p>' +
        '      </a>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        // Recent Activity Section
        '<section class="services" style="padding-top:0;">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Recent Activity</h2>' +
        '    <div class="activity-container">' +
        '      <div id="activityFeed"></div>' +
        '      <div class="activity-footer">' +
        '        <button id="loadMoreBtn" class="btn btn-secondary load-more-btn">' +
        '          Load More Activities</button>' +
        '        <a href="apply.html" class="btn btn-primary" style="padding:0.7rem 2rem;font-size:0.95rem;">' +
        '          New Application</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>'
    );
}

/* ═══════════════════════════════════════════
   STATISTICS DATA POPULATION
   ═══════════════════════════════════════════ */
function fillStats() {
    var statsData = localStorage.getItem('quickloan_stats');
    var stats = {};
    
    try {
        stats = statsData ? JSON.parse(statsData) : {};
    } catch (e) {
        console.error('Error parsing stats data:', e);
        stats = {};
    }

    // Set stat values with defaults
    setStatValue('dashActive',   stats.activeLoans   || '0');
    setStatValue('dashApproved', stats.approvedLoans || '0');
    setStatValue('dashBorrowed', stats.totalBorrowed || '$0');
    setStatValue('dashCredit',   stats.creditScore   || 'Good');
}

/**
 * Helper function to set stat value with animation
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 */
function setStatValue(id, value) {
    var element = document.getElementById(id);
    if (element) {
        // Add fade-in animation
        element.style.opacity = '0';
        element.textContent = value;
        
        setTimeout(function() {
            element.style.transition = 'opacity 0.5s ease';
            element.style.opacity = '1';
        }, 100);
    }
}

/* ═══════════════════════════════════════════
   ACTIVITY FEED WITH LOAD MORE
   ═══════════════════════════════════════════ */
var currentActivityCount = 4; // Start by showing 4 activities

function fillActivity() {
    var feed = document.getElementById('activityFeed');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!feed) return;

    // Fetch activity data from localStorage or use demo data
    var storedActivity = getActivityData();
    var allActivities = storedActivity || getDefaultActivityData();

    /**
     * Render activities to the feed
     */
    function renderActivities() {
        var activitiesToShow = allActivities.slice(0, currentActivityCount);
        
        feed.innerHTML = activitiesToShow.map(function(activity) {
            return createActivityItem(activity);
        }).join('');

        // Update Load More button visibility
        if (loadMoreBtn) {
            if (currentActivityCount >= allActivities.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    /**
     * Create HTML for a single activity item
     * @param {Object} activity - Activity data
     * @returns {string} HTML string
     */
    function createActivityItem(activity) {
        return '<div class="activity-item">' +
                 '<div class="activity-info">' +
                   '<div class="activity-type">' + sanitize(activity.type) + '</div>' +
                   '<div class="activity-date">' + sanitize(activity.date) + '</div>' +
                 '</div>' +
                 '<div class="activity-details">' +
                   '<div class="activity-amount">' + sanitize(activity.amount) + '</div>' +
                   '<span class="activity-status" style="color:' + sanitize(activity.color) + ';">' + 
                     sanitize(activity.status) + '</span>' +
                 '</div>' +
               '</div>';
    }

    /**
     * Sanitize string to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    function sanitize(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initial render
    renderActivities();

    // Wire up "Load More" button
    if (loadMoreBtn) {
        // Remove existing listeners by cloning
        var newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        loadMoreBtn = newBtn;

        loadMoreBtn.addEventListener('click', function() {
            currentActivityCount += 5; // Load 5 more activities
            renderActivities();
            
            // Smooth scroll to show new activities
            setTimeout(function() {
                var lastItem = feed.lastElementChild;
                if (lastItem) {
                    lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        });
    }
}

/**
 * Get activity data from localStorage
 * @returns {Array|null} Activity data or null
 */
function getActivityData() {
    try {
        var storedData = localStorage.getItem('quickloan_activity');
        return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
        console.error('Error parsing activity data:', e);
        return null;
    }
}

/**
 * Get default demo activity data
 * @returns {Array} Default activity data
 */
function getDefaultActivityData() {
    return [
        { date: 'Feb 03, 2025', type: 'Personal Loan',  amount: '$12,000', status: 'Processing', color: '#ffc107' },
        { date: 'Jan 28, 2025', type: 'Personal Loan',  amount: '$15,000', status: 'Approved',   color: '#51cf66' },
        { date: 'Jan 22, 2025', type: 'Business Loan',  amount: '$50,000', status: 'Pending',    color: '#ffc107' },
        { date: 'Jan 15, 2025', type: 'Emergency Loan', amount: '$5,000',  status: 'Funded',     color: '#00d4ff' },
        { date: 'Dec 30, 2024', type: 'Personal Loan',  amount: '$8,000',  status: 'Completed',  color: '#b0d4e3' },
        { date: 'Dec 18, 2024', type: 'Business Loan',  amount: '$35,000', status: 'Completed',  color: '#b0d4e3' },
        { date: 'Nov 25, 2024', type: 'Emergency Loan', amount: '$3,500',  status: 'Funded',     color: '#00d4ff' },
        { date: 'Nov 10, 2024', type: 'Personal Loan',  amount: '$20,000', status: 'Completed',  color: '#b0d4e3' },
        { date: 'Oct 28, 2024', type: 'Business Loan',  amount: '$45,000', status: 'Approved',   color: '#51cf66' },
        { date: 'Oct 15, 2024', type: 'Personal Loan',  amount: '$10,000', status: 'Completed',  color: '#b0d4e3' },
        { date: 'Sep 30, 2024', type: 'Emergency Loan', amount: '$4,000',  status: 'Funded',     color: '#00d4ff' },
        { date: 'Sep 12, 2024', type: 'Personal Loan',  amount: '$18,000', status: 'Completed',  color: '#b0d4e3' },
        { date: 'Aug 25, 2024', type: 'Business Loan',  amount: '$60,000', status: 'Approved',   color: '#51cf66' },
        { date: 'Aug 08, 2024', type: 'Personal Loan',  amount: '$9,500',  status: 'Completed',  color: '#b0d4e3' },
        { date: 'Jul 20, 2024', type: 'Emergency Loan', amount: '$2,800',  status: 'Funded',     color: '#00d4ff' }
    ];
}

// Export functions for external use if needed
if (typeof window !== 'undefined') {
    window.QuickLoanDashboard = {
        refreshStats: fillStats,
        refreshActivity: fillActivity,
        swapToDashboard: swapToDashboard
    };
}
