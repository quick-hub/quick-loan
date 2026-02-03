/**
 * index.js — Public ↔ Dashboard swap
 *
 * Logged OUT  → nothing runs; the static HTML is the page.
 * Logged IN   → hero is personalised in-place, #publicSections is hidden,
 *               and the four dashboard blocks are rendered into
 *               #dashboardSections.  Every class used here exists in
 *               styles.css; the only inline styles are on the calculator
 *               grid and the activity rows (no CSS rules for those exist).
 */

document.addEventListener('DOMContentLoaded', function () {
    var auth = localStorage.getItem('quickloan_auth') === 'true';
    var user = JSON.parse(localStorage.getItem('quickloan_user') || '{}');
    var isAdmin = localStorage.getItem('quickloan_admin_loggedin') === 'true';

    // If a regular user is authenticated (and admin is not), render dashboard.
    if (auth && !isAdmin) {
        swapToDashboard(user);
    }
    // else: leave the static public page as-is
});

/* ─── orchestrator ──────────────────────────── */
function swapToDashboard(user) {
    // 1. nav: Login → Logout
    wireLogout();

    // 2. hero: personalise text & buttons, hide the illustration
    personaliseHero(user);

    // 3. hide the entire public landing body in one shot
    var pub = document.getElementById('publicSections');
    if (pub) pub.style.display = 'none';

    // 4. render dashboard into the waiting anchor
    var dash = document.getElementById('dashboardSections');
    if (dash) dash.innerHTML = buildDashboard();

    // 5. hydrate dynamic parts
    fillStats();
    fillActivity();
    wireCalculator();
}

/* ─── 1. LOGOUT BUTTON ──────────────────────── */
function wireLogout() {
    var btn = document.getElementById('navLoginBtn');
    if (!btn) return;

    btn.textContent = 'Logout';
    btn.href        = '#';

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('quickloan_auth');
            localStorage.removeItem('quickloan_last_login');
            window.location.reload();
        }
    });
}

/* ─── 2. HERO ───────────────────────────────── */
function personaliseHero(user) {
    var first = user.name ? user.name.split(' ')[0] : 'User';

    // title & description  (IDs added in the HTML)
    var title = document.getElementById('heroTitle');
    var desc  = document.getElementById('heroDesc');
    if (title) title.textContent = 'Welcome Back, ' + first + '!';
    if (desc)  desc.textContent  = 'Manage your loans, check your status, or start a new application.';

    // buttons  — swap to dashboard-relevant actions
    var btns = document.getElementById('heroButtons');
    if (btns) {
        btns.innerHTML =
            '<a href="apply.html"      class="btn btn-primary   btn-large">Apply for New Loan</a>' +
            '<a href="#loan-calculator" class="btn btn-secondary btn-large">Loan Calculator</a>';
    }

    // hide the marketing illustration — not needed on the dashboard
    var img = document.getElementById('heroImageWrap');
    if (img) img.style.display = 'none';
}

/* ─── 3. DASHBOARD HTML ─────────────────────── */
function buildDashboard() {
    return (
        // ── Account Overview  (uses .stats-section → bg + borders from CSS)
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

        // ── Quick Actions  (uses .services + .services-grid + .service-card)
        '<section class="services">' +
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

        // ── Loan Calculator  (section padding via .services; inner layout is
        //    a two-column grid — no CSS rule exists so one targeted inline style)
        '<section class="services" id="loan-calculator">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Loan Calculator</h2>' +
        '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;' +
        '         max-width:880px;margin:0 auto;' +
        '         background:rgba(26,90,122,0.45);border:1px solid rgba(100,200,230,0.3);' +
        '         border-radius:14px;padding:2.5rem;">' +

        //   left col – sliders
        '      <div>' +
        '        <div style="margin-bottom:1.8rem;">' +
        '          <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#d0e8f2;">' +
        '            Loan Amount: <span id="lblAmount" style="color:#00d4ff;">$10,000</span></label>' +
        '          <input type="range" id="slAmount" min="1000" max="500000" step="1000" value="10000"' +
        '                 style="width:100%;accent-color:#00b4d8;cursor:pointer;">' +
        '          <div style="display:flex;justify-content:space-between;color:#7ab8d0;font-size:0.8rem;margin-top:3px;">' +
        '            <span>$1,000</span><span>$500,000</span></div>' +
        '        </div>' +
        '        <div style="margin-bottom:1.8rem;">' +
        '          <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#d0e8f2;">' +
        '            Loan Term: <span id="lblTerm" style="color:#00d4ff;">12 months</span></label>' +
        '          <input type="range" id="slTerm" min="6" max="84" step="6" value="12"' +
        '                 style="width:100%;accent-color:#00b4d8;cursor:pointer;">' +
        '          <div style="display:flex;justify-content:space-between;color:#7ab8d0;font-size:0.8rem;margin-top:3px;">' +
        '            <span>6 mo</span><span>84 mo</span></div>' +
        '        </div>' +
        '        <div>' +
        '          <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:#d0e8f2;">' +
        '            Interest Rate: <span id="lblRate" style="color:#00d4ff;">4.99%</span></label>' +
        '          <input type="range" id="slRate" min="3" max="20" step="0.1" value="4.99"' +
        '                 style="width:100%;accent-color:#00b4d8;cursor:pointer;">' +
        '          <div style="display:flex;justify-content:space-between;color:#7ab8d0;font-size:0.8rem;margin-top:3px;">' +
        '            <span>3 %</span><span>20 %</span></div>' +
        '        </div>' +
        '      </div>' +

        //   right col – results
        '      <div style="display:flex;flex-direction:column;justify-content:center;">' +
        '        <h3 style="color:#b0d4e3;font-size:1rem;text-align:center;margin-bottom:0.3rem;">Estimated Monthly Payment</h3>' +
        '        <div id="calcMonthly" style="font-size:3rem;font-weight:700;color:#00d4ff;text-align:center;margin-bottom:1.4rem;">$856</div>' +
        '        <div style="border-top:1px solid rgba(100,200,230,0.25);padding-top:1rem;">' +
        '          <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(100,200,230,0.15);">' +
        '            <span style="color:#b0d4e3;">Principal</span>' +
        '            <span id="calcPrincipal" style="color:#fff;font-weight:600;">$10,000</span></div>' +
        '          <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(100,200,230,0.15);">' +
        '            <span style="color:#b0d4e3;">Total Interest</span>' +
        '            <span id="calcInterest" style="color:#fff;font-weight:600;">$272</span></div>' +
        '          <div style="display:flex;justify-content:space-between;padding:0.5rem 0;">' +
        '            <span style="color:#b0d4e3;font-weight:600;">Total Repayment</span>' +
        '            <span id="calcTotal" style="color:#00d4ff;font-weight:700;">$10,272</span></div>' +
        '        </div>' +
        '        <a href="apply.html" class="btn btn-primary btn-full" style="margin-top:1.6rem;">Apply for This Loan</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>' +

        // ── Recent Activity
        '<section class="services" style="padding-top:0;">' +
        '  <div class="container">' +
        '    <h2 class="section-title">Recent Activity</h2>' +
        '    <div style="max-width:700px;margin:0 auto;' +
        '         background:rgba(26,90,122,0.45);border:1px solid rgba(100,200,230,0.3);' +
        '         border-radius:14px;overflow:hidden;">' +
        '      <div id="activityFeed"></div>' +
        '      <div style="text-align:center;padding:1.2rem 0 0.8rem;">' +
        '        <a href="apply.html" class="btn btn-secondary" style="padding:0.7rem 2rem;font-size:0.95rem;">' +
        '          View All Applications</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</section>'
    );
}

/* ─── 4a. FILL STATS FROM localStorage ──────── */
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

/* ─── 4b. FILL ACTIVITY ROWS ────────────────── */
function fillActivity() {
    var feed = document.getElementById('activityFeed');
    if (!feed) return;

    // pull from localStorage; fall back to realistic demo data
    var stored = JSON.parse(localStorage.getItem('quickloan_activity') || 'null');
    var rows   = stored || [
        { date:'Jan 28, 2025', type:'Personal Loan',  amount:'$15,000', status:'Approved',  color:'#51cf66' },
        { date:'Jan 22, 2025', type:'Business Loan',  amount:'$50,000', status:'Pending',   color:'#ffc107' },
        { date:'Jan 15, 2025', type:'Emergency Loan', amount:'$5,000',  status:'Funded',    color:'#00d4ff' },
        { date:'Dec 30, 2024', type:'Personal Loan',  amount:'$8,000',  status:'Completed', color:'#b0d4e3' }
    ];

    feed.innerHTML = rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;' +
               'padding:1rem 1.6rem;border-bottom:1px solid rgba(100,200,230,0.15);">' +
                 '<div>' +
                   '<div style="font-weight:600;color:#fff;margin-bottom:2px;">'  + r.type   + '</div>' +
                   '<div style="font-size:0.82rem;color:#7ab8d0;">'               + r.date   + '</div>' +
                 '</div>' +
                 '<div style="text-align:right;">' +
                   '<div style="font-weight:700;color:#fff;margin-bottom:2px;">'  + r.amount + '</div>' +
                   '<span style="font-size:0.78rem;font-weight:600;color:'        + r.color  + ';">' + r.status + '</span>' +
                 '</div>' +
               '</div>';
    }).join('');
}

/* ─── 4c. CALCULATOR LOGIC ──────────────────── */
function wireCalculator() {
    var slAmt  = document.getElementById('slAmount');
    var slTerm = document.getElementById('slTerm');
    var slRate = document.getElementById('slRate');
    if (!slAmt || !slTerm || !slRate) return;

    function calc() {
        var amount   = parseInt(slAmt.value, 10);
        var term     = parseInt(slTerm.value, 10);
        var rate     = parseFloat(slRate.value);

        // live labels
        set('lblAmount', '$' + amount.toLocaleString());
        set('lblTerm',   term + ' months');
        set('lblRate',   rate.toFixed(2) + ' %');

        // standard amortisation  (handles 0 % edge-case)
        var r       = rate / 100 / 12;
        var monthly = r === 0
                    ? amount / term
                    : (amount * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
        var total    = monthly * term;
        var interest = total - amount;

        set('calcMonthly',  '$' + Math.round(monthly).toLocaleString());
        set('calcPrincipal','$' + amount.toLocaleString());
        set('calcInterest', '$' + Math.round(interest).toLocaleString());
        set('calcTotal',    '$' + Math.round(total).toLocaleString());
    }

    slAmt.addEventListener('input', calc);
    slTerm.addEventListener('input', calc);
    slRate.addEventListener('input', calc);

    calc(); // initial render
}
