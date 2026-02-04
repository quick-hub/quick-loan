/**
 * index.js — Public ↔ Dashboard swap
 *
 * Logged OUT  → nothing runs; the static HTML is the page.
 * Logged IN   → hero is personalised in-place, #publicSections is hidden,
 *               and the dashboard blocks are rendered into #dashboardSections.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Use the global auth checker
    if (typeof window.QuickLoanAuth !== 'undefined' && window.QuickLoanAuth.isAuthenticated()) {
        var user = window.QuickLoanAuth.getUserData();
        swapToDashboard(user);
    }
    // else: leave the static public page as-is
});

/* ─── orchestrator ──────────────────────────── */
function swapToDashboard(user) {
    // 1. hero: personalise text & buttons, hide the illustration
    personaliseHero(user);

    // 2. hide the entire public landing body in one shot
    var pub = document.getElementById('publicSections');
    if (pub) pub.style.display = 'none';

    // 3. render dashboard into the waiting anchor
    var dash = document.getElementById('dashboardSections');
    if (dash) dash.innerHTML = buildDashboard();

    // 4. hydrate dynamic parts
    fillStats();
    fillActivity();
}

/* ─── HERO ───────────────────────────────── */
function personaliseHero(user) {
    var first = user.name ? user.name.split(' ')[0] : 'User';

    // title & description
    var title = document.getElementById('heroTitle');
    var desc  = document.getElementById('heroDesc');
    if (title) title.textContent = 'Welcome Back, ' + first + '!';
    if (desc)  desc.textContent  = 'Manage your loans, check your status, or start a new application.';

    // buttons — swap to dashboard-relevant actions
    var btns = document.getElementById('heroButtons');
    if (btns) {
        btns.innerHTML =
            '<a href="apply.html" class="btn btn-primary btn-large">Apply for New Loan</a>' +
            '<a href="#quick-actions" class="btn btn-secondary btn-large">View Services</a>';
    }

    // hide the marketing illustration
    var img = document.getElementById('heroImageWrap');
    if (img) img.style.display = 'none';
}

/* ─── DASHBOARD HTML ─────────────────────── */
function buildDashboard() {
    return (
        // ── Account Overview
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

        // ── Quick Actions
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

        // ── Recent Activity
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

/* ─── FILL STATS FROM localStorage ──────── */
function fillStats() {
    var s = JSON.parse(localStorage.getItem('quickloan_stats') || '{}');

    set('dashActive',   s.activeLoans   || '0');
    set('dashApproved', s.approvedLoans || '0');
    set('dashBorrowed', s.totalBorrowed || '$0');
    set('dashCredit',   s.creditScore   || 'Good');
}

function set(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ─── FILL ACTIVITY ROWS WITH LOAD MORE ─── */
var currentActivityCount = 4; // Start by showing 4 activities

function fillActivity() {
    var feed = document.getElementById('activityFeed');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!feed) return;

    // pull from localStorage; fall back to extended demo data
    var stored = JSON.parse(localStorage.getItem('quickloan_activity') || 'null');
    var allRows = stored || [
        { date:'Feb 03, 2025', type:'Personal Loan',    amount:'$12,000', status:'Processing', color:'#ffc107' },
        { date:'Jan 28, 2025', type:'Personal Loan',    amount:'$15,000', status:'Approved',    color:'#51cf66' },
        { date:'Jan 22, 2025', type:'Business Loan',    amount:'$50,000', status:'Pending',     color:'#ffc107' },
        { date:'Jan 15, 2025', type:'Emergency Loan',   amount:'$5,000',  status:'Funded',      color:'#00d4ff' },
        { date:'Dec 30, 2024', type:'Personal Loan',    amount:'$8,000',  status:'Completed',   color:'#b0d4e3' },
        { date:'Dec 18, 2024', type:'Business Loan',    amount:'$35,000', status:'Completed',   color:'#b0d4e3' },
        { date:'Nov 25, 2024', type:'Emergency Loan',   amount:'$3,500',  status:'Funded',      color:'#00d4ff' },
        { date:'Nov 10, 2024', type:'Personal Loan',    amount:'$20,000', status:'Completed',   color:'#b0d4e3' },
        { date:'Oct 28, 2024', type:'Business Loan',    amount:'$45,000', status:'Approved',    color:'#51cf66' },
        { date:'Oct 15, 2024', type:'Personal Loan',    amount:'$10,000', status:'Completed',   color:'#b0d4e3' },
        { date:'Sep 30, 2024', type:'Emergency Loan',   amount:'$4,000',  status:'Funded',      color:'#00d4ff' },
        { date:'Sep 12, 2024', type:'Personal Loan',    amount:'$18,000', status:'Completed',   color:'#b0d4e3' },
        { date:'Aug 25, 2024', type:'Business Loan',    amount:'$60,000', status:'Approved',    color:'#51cf66' },
        { date:'Aug 08, 2024', type:'Personal Loan',    amount:'$9,500',  status:'Completed',   color:'#b0d4e3' },
        { date:'Jul 20, 2024', type:'Emergency Loan',   amount:'$2,800',  status:'Funded',      color:'#00d4ff' }
    ];

    function renderActivities() {
        var rowsToShow = allRows.slice(0, currentActivityCount);
        
        feed.innerHTML = rowsToShow.map(function (r) {
            return '<div class="activity-item">' +
                     '<div class="activity-info">' +
                       '<div class="activity-type">' + r.type + '</div>' +
                       '<div class="activity-date">' + r.date + '</div>' +
                     '</div>' +
                     '<div class="activity-details">' +
                       '<div class="activity-amount">' + r.amount + '</div>' +
                       '<span class="activity-status" style="color:' + r.color + ';">' + r.status + '</span>' +
                     '</div>' +
                   '</div>';
        }).join('');

        // Hide "Load More" button if all activities are shown
        if (loadMoreBtn) {
            if (currentActivityCount >= allRows.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    // Initial render
    renderActivities();

    // Wire up "Load More" button
    if (loadMoreBtn) {
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
