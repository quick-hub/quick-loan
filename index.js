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
        title.textContent = 'Welcome back, ' + firstName;
    }

    if (desc) {
        desc.textContent = 'Manage your loans, check your status, or start a new application.';
    }

    // Update buttons with dashboard-relevant actions
    var btns = document.getElementById('heroButtons');
    if (btns) {
        btns.innerHTML =
            '<a href="apply.html" class="btn btn-primary btn-large">Apply for new loan</a>' +
            '<a href="#quick-actions" class="btn btn-secondary btn-large">View services</a>';
    }

    // Hide the public-only trust indicators (not relevant when logged in)
    var trust = document.querySelector('.hero-trust');
    if (trust) trust.style.display = 'none';

    // Hide the marketing illustration (kept for backward compatibility)
    var img = document.getElementById('heroImageWrap');
    if (img) img.style.display = 'none';
}

/* ═══════════════════════════════════════════
   DASHBOARD HTML GENERATION
   Icons reference the inline <svg> sprite defined once in index.html,
   matching the icon set used across the public page (no emoji).
   ═══════════════════════════════════════════ */
function buildDashboard() {
    return (
        // Quick Actions Section
        '<section class="services" id="quick-actions">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Quick actions</h2>' +
        '    <div class="services-grid">' +
        '      <a href="apply.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon"><svg class="icon"><use href="#icon-rocket"/></svg></div>' +
        '        <h3>New application</h3>' +
        '        <p>Start a fresh loan application in just a few minutes.</p>' +
        '      </a>' +
        '      <a href="personal-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon"><svg class="icon"><use href="#icon-briefcase"/></svg></div>' +
        '        <h3>Personal loan</h3>' +
        '        <p>Flexible funds for any personal financial need.</p>' +
        '      </a>' +
        '      <a href="business-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon"><svg class="icon"><use href="#icon-building"/></svg></div>' +
        '        <h3>Business loan</h3>' +
        '        <p>Capital to grow or launch your venture.</p>' +
        '      </a>' +
        '      <a href="emergency-loan.html" class="service-card" style="text-decoration:none;color:inherit;">' +
        '        <div class="service-icon"><svg class="icon"><use href="#icon-bolt"/></svg></div>' +
        '        <h3>Emergency loan</h3>' +
        '        <p>Fast funds deposited within 24 hours.</p>' +
        '      </a>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        // Recent Activity Section
        '<section class="services" style="padding-top:0;">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Recent activity</h2>' +
        '    <div class="activity-container">' +
        '      <div id="activityFeed"></div>' +
        '      <div class="activity-footer">' +
        '        <button id="loadMoreBtn" class="btn btn-secondary load-more-btn">' +
        '          Load more activities</button>' +
        '        <a href="apply.html" class="btn btn-primary" style="padding:0.7rem 2rem;font-size:0.95rem;">' +
        '          New application</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>'
    );
}

/* ═══════════════════════════════════════════
   ACTIVITY FEED WITH LOAD MORE
   ═══════════════════════════════════════════ */
var currentActivityCount = 4;

function fillActivity() {
    var feed = document.getElementById('activityFeed');
    var loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!feed) return;

    var storedActivity = getActivityData();
    var allActivities = storedActivity || getDefaultActivityData();

    function renderActivities() {
        var activitiesToShow = allActivities.slice(0, currentActivityCount);

        feed.innerHTML = activitiesToShow.map(function(activity) {
            return createActivityItem(activity);
        }).join('');

        if (loadMoreBtn) {
            if (currentActivityCount >= allActivities.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

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

    function sanitize(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderActivities();

    if (loadMoreBtn) {
        var newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        loadMoreBtn = newBtn;

        loadMoreBtn.addEventListener('click', function() {
            currentActivityCount += 5;
            renderActivities();

            setTimeout(function() {
                var lastItem = feed.lastElementChild;
                if (lastItem) {
                    lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        });
    }
}

function getActivityData() {
    try {
        var storedData = localStorage.getItem('quickloan_activity');
        return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
        console.error('Error parsing activity data:', e);
        return null;
    }
}

// Status colors now use the site's navy/teal/gold token palette
// (previously hardcoded stock amber/green/cyan) so they read
// consistently with the rest of the page and keep solid contrast
// against the light activity-status pill background.
function getDefaultActivityData() {
    return [
        { date: 'Feb 03, 2025', type: 'Personal Loan',  amount: '$12,000', status: 'Processing', color: '#a9670a' },
        { date: 'Jan 28, 2025', type: 'Personal Loan',  amount: '$15,000', status: 'Approved',   color: '#257a4d' },
        { date: 'Jan 22, 2025', type: 'Business Loan',  amount: '$50,000', status: 'Pending',    color: '#a9670a' },
        { date: 'Jan 15, 2025', type: 'Emergency Loan', amount: '$5,000',  status: 'Funded',     color: '#0d7873' },
        { date: 'Dec 30, 2024', type: 'Personal Loan',  amount: '$8,000',  status: 'Completed',  color: '#6c8294' },
        { date: 'Dec 18, 2024', type: 'Business Loan',  amount: '$35,000', status: 'Completed',  color: '#6c8294' },
        { date: 'Nov 25, 2024', type: 'Emergency Loan', amount: '$3,500',  status: 'Funded',     color: '#0d7873' },
        { date: 'Nov 10, 2024', type: 'Personal Loan',  amount: '$20,000', status: 'Completed',  color: '#6c8294' },
        { date: 'Oct 28, 2024', type: 'Business Loan',  amount: '$45,000', status: 'Approved',   color: '#257a4d' },
        { date: 'Oct 15, 2024', type: 'Personal Loan',  amount: '$10,000', status: 'Completed',  color: '#6c8294' },
        { date: 'Sep 30, 2024', type: 'Emergency Loan', amount: '$4,000',  status: 'Funded',     color: '#0d7873' },
        { date: 'Sep 12, 2024', type: 'Personal Loan',  amount: '$18,000', status: 'Completed',  color: '#6c8294' },
        { date: 'Aug 25, 2024', type: 'Business Loan',  amount: '$60,000', status: 'Approved',   color: '#257a4d' },
        { date: 'Aug 08, 2024', type: 'Personal Loan',  amount: '$9,500',  status: 'Completed',  color: '#6c8294' },
        { date: 'Jul 20, 2024', type: 'Emergency Loan', amount: '$2,800',  status: 'Funded',     color: '#0d7873' }
    ];
}

// Export functions for external use if needed
if (typeof window !== 'undefined') {
    window.QuickLoanDashboard = {
        refreshActivity: fillActivity,
        swapToDashboard: swapToDashboard
    };
}
