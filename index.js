/**
 * Index Page Handler – Dynamic Home Page
 * 
 * Logged OUT  → page renders exactly as the static index.html (no DOM changes).
 * Logged IN   → every public-marketing section between .hero and footer is
 *               removed and replaced with a single, cohesive dashboard:
 *                 • Personalised hero
 *                 • Account-overview stats
 *                 • Quick-action buttons
 *                 • Loan calculator (full amortisation math)
 *                 • Recent-activity feed
 *               Nothing in index.html, styles.css, or main.js needs to change.
 */

document.addEventListener('DOMContentLoaded', function () {
    const isAuthenticated = localStorage.getItem('quickloan_auth') === 'true';
    const user            = JSON.parse(localStorage.getItem('quickloan_user') || '{}');

    // Prevent dashboard logic if admin is logged in (separate session)
    const isAdmin = localStorage.getItem('quickloan_admin_loggedin') === 'true';
    if (isAuthenticated && user.name && !isAdmin) {
      transformToDashboard(user);
    }
    // else: static public page – do nothing
});

/* ─────────────────────────────────────────────
   ORCHESTRATOR
   ───────────────────────────────────────────── */
function transformToDashboard(user) {
    updateNav(user);
    updateHero(user);
    replaceBodySections();   // removes public sections, injects dashboard HTML
    loadUserStats();         // fills stat numbers from localStorage
    initCalculator();        // wires up the slider-based loan calculator
}

/* ─────────────────────────────────────────────
   1. NAVIGATION  –  Login  →  Logout
   ───────────────────────────────────────────── */
function updateNav() {
    const loginBtn = document.querySelector('.nav-menu .btn-login');
    if (!loginBtn) return;

    // Remove any previous event listeners by cloning
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);

    newBtn.textContent = 'Logout';
    newBtn.href        = '#';
    newBtn.id          = 'logoutBtn';
    newBtn.classList.add('btn-logout');
    newBtn.classList.remove('btn-login');
    newBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('quickloan_auth');
        localStorage.removeItem('quickloan_last_login');
        localStorage.removeItem('quickloan_user');
        window.location.reload();
      }
    });
}

/* ─────────────────────────────────────────────
   2. HERO  –  personalised welcome
   ───────────────────────────────────────────── */
function updateHero(user) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const firstName = user.name ? user.name.split(' ')[0] : 'User';

    const h1 = heroContent.querySelector('h1');
    const p  = heroContent.querySelector('p');
    if (h1) h1.textContent = 'Welcome Back, ' + firstName + '!';
    if (p)  p.textContent  = 'Manage your loans, check your status, or start a new application.';

    const heroButtons = heroContent.querySelector('.hero-buttons');
    if (heroButtons) {
        heroButtons.innerHTML =
            '<a href="apply.html"        class="btn btn-primary   btn-large">Apply for New Loan</a>' +
            '<a href="#loan-calculator"   class="btn btn-secondary btn-large">Loan Calculator</a>';
    }
}

/* ─────────────────────────────────────────────
   3. SWAP BODY  –  remove public, inject dashboard
   ───────────────────────────────────────────── */
function replaceBodySections() {
    // Selectors that cover every public section sitting between .hero and footer.
    // We target by class; the two .services sections, .features, .how-it-works,
    // .stats-section, and .cta are all removed in one pass.
    const publicSelectors = [
        '.services',
        '.features',
        '.how-it-works',
        '.stats-section',
        '.cta'
    ];

    publicSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
            el.remove();
        });
    });

    // Build the full dashboard markup and inject it right before the footer.
    const footer  = document.querySelector('.footer');
    const wrapper = document.createElement('div');
    wrapper.id    = 'dashboard-sections';
    wrapper.innerHTML = dashboardHTML();

    document.body.insertBefore(wrapper, footer);
}

/* ─────────────────────────────────────────────
   4. DASHBOARD HTML  –  single source of truth
   ───────────────────────────────────────────── */
function dashboardHTML() {
    return /* html */ `
    <!-- ── Account Overview ── -->
    <section class="dashboard-stats">
      <div class="container">
        <h2 class="section-title">Your Account Overview</h2>
        <div class="stats-grid">

          <div class="stat-item">
            <div class="stat-icon-wrap">💼</div>
            <div class="stat-number" id="dashActiveLoans">0</div>
            <div class="stat-label">Active Applications</div>
          </div>

          <div class="stat-item">
            <div class="stat-icon-wrap">✓</div>
            <div class="stat-number" id="dashApprovedLoans">0</div>
            <div class="stat-label">Approved Loans</div>
          </div>

          <div class="stat-item">
            <div class="stat-icon-wrap">📊</div>
            <div class="stat-number" id="dashTotalBorrowed">$0</div>
            <div class="stat-label">Total Borrowed</div>
          </div>

          <div class="stat-item">
            <div class="stat-icon-wrap">⭐</div>
            <div class="stat-number" id="dashCreditScore">Good</div>
            <div class="stat-label">Credit Rating</div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── Quick Actions ── -->
    <section class="services">
      <div class="container">
        <h2 class="section-title">Quick Actions</h2>
        <div class="services-grid">

          <a href="apply.html" class="service-card" style="text-decoration:none; color:inherit;">
            <div class="service-icon">🚀</div>
            <h3>New Application</h3>
            <p>Start a fresh loan application in just a few minutes.</p>
          </a>

          <a href="personal-loan.html" class="service-card" style="text-decoration:none; color:inherit;">
            <div class="service-icon">💼</div>
            <h3>Personal Loan</h3>
            <p>Flexible funds for any personal financial need.</p>
          </a>

          <a href="business-loan.html" class="service-card" style="text-decoration:none; color:inherit;">
            <div class="service-icon">🏢</div>
            <h3>Business Loan</h3>
            <p>Capital to grow or launch your venture.</p>
          </a>

          <a href="emergency-loan.html" class="service-card" style="text-decoration:none; color:inherit;">
            <div class="service-icon">🚨</div>
            <h3>Emergency Loan</h3>
            <p>Fast funds deposited within 24 hours.</p>
          </a>

        </div>
      </div>
    </section>

    <!-- ── Loan Calculator ── -->
    <section class="loan-calculator" id="loan-calculator" style="padding:5rem 0;">
      <div class="container">
        <h2 class="section-title">Loan Calculator</h2>

        <div class="calculator-wrapper" style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:3rem;
            max-width:900px;
            margin:0 auto;
            background:rgba(26,90,122,0.45);
            border:1px solid rgba(100,200,230,0.3);
            border-radius:14px;
            padding:2.5rem;
        ">
          <!-- inputs -->
          <div class="calculator-inputs-section">

            <div style="margin-bottom:1.8rem;">
              <label style="display:block; margin-bottom:0.6rem; font-weight:600; color:#d0e8f2;">
                Loan Amount: <span id="calcAmountLabel" style="color:#00d4ff;">$10,000</span>
              </label>
              <input type="range" id="calcAmount" min="1000" max="500000" step="1000" value="10000"
                     style="width:100%; accent-color:#00b4d8; cursor:pointer;">
              <div style="display:flex; justify-content:space-between; color:#7ab8d0; font-size:0.82rem; margin-top:4px;">
                <span>$1,000</span><span>$500,000</span>
              </div>
            </div>

            <div style="margin-bottom:1.8rem;">
              <label style="display:block; margin-bottom:0.6rem; font-weight:600; color:#d0e8f2;">
                Loan Term: <span id="calcTermLabel" style="color:#00d4ff;">12 months</span>
              </label>
              <input type="range" id="calcTerm" min="6" max="84" step="6" value="12"
                     style="width:100%; accent-color:#00b4d8; cursor:pointer;">
              <div style="display:flex; justify-content:space-between; color:#7ab8d0; font-size:0.82rem; margin-top:4px;">
                <span>6 mo</span><span>84 mo</span>
              </div>
            </div>

            <div style="margin-bottom:0.5rem;">
              <label style="display:block; margin-bottom:0.6rem; font-weight:600; color:#d0e8f2;">
                Interest Rate: <span id="calcRateLabel" style="color:#00d4ff;">4.99%</span>
              </label>
              <input type="range" id="calcRate" min="3" max="20" step="0.1" value="4.99"
                     style="width:100%; accent-color:#00b4d8; cursor:pointer;">
              <div style="display:flex; justify-content:space-between; color:#7ab8d0; font-size:0.82rem; margin-top:4px;">
                <span>3%</span><span>20%</span>
              </div>
            </div>

          </div>

          <!-- results -->
          <div class="calculator-results-section" style="display:flex; flex-direction:column; justify-content:center;">
            <h3 style="color:#b0d4e3; font-size:1rem; margin-bottom:0.4rem; text-align:center;">Estimated Monthly Payment</h3>
            <div id="calcMonthly" style="
                font-size:3rem; font-weight:700; color:#00d4ff; text-align:center; margin-bottom:1.5rem;
            ">$856</div>

            <div style="border-top:1px solid rgba(100,200,230,0.25); padding-top:1.2rem;">
              <div style="display:flex; justify-content:space-between; padding:0.55rem 0; border-bottom:1px solid rgba(100,200,230,0.15);">
                <span style="color:#b0d4e3;">Principal</span>
                <span id="calcPrincipal" style="color:#fff; font-weight:600;">$10,000</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:0.55rem 0; border-bottom:1px solid rgba(100,200,230,0.15);">
                <span style="color:#b0d4e3;">Total Interest</span>
                <span id="calcInterest" style="color:#fff; font-weight:600;">$272</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:0.55rem 0;">
                <span style="color:#b0d4e3; font-weight:600;">Total Repayment</span>
                <span id="calcTotal" style="color:#00d4ff; font-weight:700;">$10,272</span>
              </div>
            </div>

            <a href="apply.html" class="btn btn-primary btn-full" style="margin-top:1.8rem;">Apply for This Loan</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Recent Activity ── -->
    <section class="services" style="padding-top:0;">
      <div class="container">
        <h2 class="section-title">Recent Activity</h2>

        <div style="
            max-width:700px; margin:0 auto;
            background:rgba(26,90,122,0.45);
            border:1px solid rgba(100,200,230,0.3);
            border-radius:14px; overflow:hidden;
        ">
          <!-- each row -->
          <div id="activityFeed"></div>

          <div style="text-align:center; padding:1.4rem 0 0.6rem;">
            <a href="apply.html" class="btn btn-secondary" style="padding:0.7rem 2rem; font-size:0.95rem;">
              View All Applications
            </a>
          </div>
        </div>
      </div>
    </section>
    `;
}

/* ─────────────────────────────────────────────
   5. POPULATE STATS  –  from localStorage
   ───────────────────────────────────────────── */
function loadUserStats() {
    const stats = JSON.parse(localStorage.getItem('quickloan_stats') || '{}');

    setText('dashActiveLoans',  stats.activeLoans   || '0');
    setText('dashApprovedLoans', stats.approvedLoans || '0');
    setText('dashTotalBorrowed', stats.totalBorrowed || '$0');
    setText('dashCreditScore',   stats.creditScore   || 'Good');

    // Populate the recent-activity feed from stored data (or show placeholder rows)
    populateActivity(stats.recentActivity);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* ─────────────────────────────────────────────
   6. ACTIVITY FEED  –  sample rows (or real data)
   ───────────────────────────────────────────── */
function populateActivity(activityArray) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    // Fall back to demo rows when no real data is stored yet
    const items = (activityArray && activityArray.length)
        ? activityArray
        : [
            { date: 'Jan 28, 2025', type: 'Personal Loan',  amount: '$15,000', status: 'Approved',   statusColor: '#51cf66' },
            { date: 'Jan 22, 2025', type: 'Business Loan',  amount: '$50,000', status: 'Pending',    statusColor: '#ffc107' },
            { date: 'Jan 15, 2025', type: 'Emergency Loan', amount: '$5,000',  status: 'Funded',     statusColor: '#00d4ff' },
            { date: 'Dec 30, 2024', type: 'Personal Loan',  amount: '$8,000',  status: 'Completed',  statusColor: '#b0d4e3' }
          ];

    feed.innerHTML = items.map(function (item) {
        return '<div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.8rem; border-bottom:1px solid rgba(100,200,230,0.15);">' +
            '<div>' +
                '<div style="font-weight:600; color:#fff; margin-bottom:2px;">' + item.type + '</div>' +
                '<div style="font-size:0.82rem; color:#7ab8d0;">' + item.date + '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
                '<div style="font-weight:700; color:#fff; margin-bottom:2px;">' + item.amount + '</div>' +
                '<span style="font-size:0.78rem; font-weight:600; color:' + item.statusColor + ';">' + item.status + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

/* ─────────────────────────────────────────────
   7. LOAN CALCULATOR  –  real amortisation math
   ───────────────────────────────────────────── */
function initCalculator() {
    const amountSlider = document.getElementById('calcAmount');
    const termSlider   = document.getElementById('calcTerm');
    const rateSlider   = document.getElementById('calcRate');

    if (!amountSlider || !termSlider || !rateSlider) return;

    function recalc() {
        const amount = parseInt(amountSlider.value, 10);
        const term   = parseInt(termSlider.value, 10);
        const rate   = parseFloat(rateSlider.value);

        // live labels
        document.getElementById('calcAmountLabel').textContent = '$' + amount.toLocaleString();
        document.getElementById('calcTermLabel').textContent   = term + ' months';
        document.getElementById('calcRateLabel').textContent   = rate.toFixed(2) + '%';

        // standard amortisation formula
        const r       = rate / 100 / 12;                                          // monthly rate
        const n       = term;                                                     // number of payments
        const monthly = r === 0 ? amount / n                                      // edge-case: 0 %
                                : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const total   = monthly * n;
        const interest = total - amount;

        document.getElementById('calcMonthly').textContent  = '$' + Math.round(monthly).toLocaleString();
        document.getElementById('calcPrincipal').textContent = '$' + amount.toLocaleString();
        document.getElementById('calcInterest').textContent  = '$' + Math.round(interest).toLocaleString();
        document.getElementById('calcTotal').textContent     = '$' + Math.round(total).toLocaleString();
    }

    amountSlider.addEventListener('input', recalc);
    termSlider.addEventListener('input', recalc);
    rateSlider.addEventListener('input', recalc);

    recalc(); // initial render
}
