/**
 * Admin Dashboard Handler
 */

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    // Use unique keys for admin authentication
    const ADMIN_LOGIN_KEY = 'quickloan_admin_loggedin';
    const ADMIN_USER_KEY = 'quickloan_admin_username';

    if (localStorage.getItem(ADMIN_LOGIN_KEY) !== 'true') {
        window.location.href = 'admin.html';
        return;
    }

    // Set username
    const username = localStorage.getItem(ADMIN_USER_KEY) || 'Administrator';
    document.getElementById('adminUser').textContent = username;

    // Initialize
    loadSettings();
    loadAccounts();
    updateStats();
    initializeNavigation();
    initializeForms();
    calculateTotalFee();
});

// Logout function
function logout() {
    // Use unique keys for admin authentication
    const ADMIN_LOGIN_KEY = 'quickloan_admin_loggedin';
    const ADMIN_USER_KEY = 'quickloan_admin_username';
    localStorage.removeItem(ADMIN_LOGIN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    window.location.href = 'admin.html';
}

// ============================================
// NAVIGATION
// ============================================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ============================================
// LOAD SETTINGS
// ============================================
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    // Load fee settings
    document.getElementById('processingFee').value = settings.processingFee || 149.00;
    document.getElementById('adminFee').value = settings.adminFee || 50.00;
    document.getElementById('feeDescription').value = settings.feeDescription || 'One-time, non-refundable processing fee for loan application review, credit checks, and administrative expenses.';
    document.getElementById('feeEnabled').checked = settings.feeEnabled !== false;
    
    // Load general settings
    document.getElementById('companyEmail').value = settings.companyEmail || 'support@quickloan.com';
    document.getElementById('companyPhone').value = settings.companyPhone || '1-800-555-1234';
    document.getElementById('formSubmitEmail').value = settings.formSubmitEmail || 'ojecgrv@gmail.com';
    document.getElementById('maintenanceMode').checked = settings.maintenanceMode || false;
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStats() {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const activeAccounts = accounts.filter(acc => acc.active).length;
    
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    const processingFee = parseFloat(settings.processingFee || 149);
    const adminFee = parseFloat(settings.adminFee || 50);
    const totalFee = processingFee + adminFee;
    
    document.getElementById('activeAccounts').textContent = activeAccounts;
    document.getElementById('currentFee').textContent = '$' + totalFee.toFixed(2);
    
    // Check for critical issues - no payment accounts
    const dashboardAlert = document.getElementById('dashboardNoAccountsAlert');
    if (dashboardAlert) {
        if (accounts.length === 0 || activeAccounts === 0) {
            dashboardAlert.style.display = 'flex';
        } else {
            dashboardAlert.style.display = 'none';
        }
    }
}

// ============================================
// FEE SETTINGS
// ============================================
function initializeForms() {
    // Fee Settings Form
    const feeForm = document.getElementById('feeSettingsForm');
    feeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFeeSettings();
    });
    
    // Update total fee on input
    document.getElementById('processingFee').addEventListener('input', calculateTotalFee);
    document.getElementById('adminFee').addEventListener('input', calculateTotalFee);
    
    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveGeneralSettings();
    });
    
    // Add Account Form
    const addAccountForm = document.getElementById('addAccountForm');
    addAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addAccount();
    });
    
    // Edit Account Form
    const editAccountForm = document.getElementById('editAccountForm');
    editAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateAccount();
    });
}

function calculateTotalFee() {
    const processingFee = parseFloat(document.getElementById('processingFee').value) || 0;
    const adminFee = parseFloat(document.getElementById('adminFee').value) || 0;
    const total = processingFee + adminFee;
    document.getElementById('totalFeeDisplay').textContent = '$' + total.toFixed(2);
}

function saveFeeSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    settings.processingFee = parseFloat(document.getElementById('processingFee').value);
    settings.adminFee = parseFloat(document.getElementById('adminFee').value);
    settings.feeDescription = document.getElementById('feeDescription').value;
    settings.feeEnabled = document.getElementById('feeEnabled').checked;
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Update processing fee page
    updateProcessingFeePage(settings);
    
    showToast('Fee settings saved successfully!');
    updateStats();
}

function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    settings.companyEmail = document.getElementById('companyEmail').value;
    settings.companyPhone = document.getElementById('companyPhone').value;
    settings.formSubmitEmail = document.getElementById('formSubmitEmail').value;
    settings.maintenanceMode = document.getElementById('maintenanceMode').checked;
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    showToast('Settings saved successfully!');
}

// ============================================
// PAYMENT ACCOUNTS MANAGEMENT
// ============================================
function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const tbody = document.getElementById('accountsTableBody');
    const noAccountsWarning = document.getElementById('noAccountsWarning');
    
    // Show warning if no accounts exist
    if (accounts.length === 0) {
        if (noAccountsWarning) {
            noAccountsWarning.style.display = 'flex';
        }
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem; color: #ef4444;"><strong>⚠️ No payment accounts configured.</strong><br><br>Clients cannot complete payments until you add at least one active account. Click "Add New Account" above to get started.</td></tr>';
        return;
    }
    
    // Hide warning if accounts exist
    if (noAccountsWarning) {
        noAccountsWarning.style.display = 'none';
    }
    
    tbody.innerHTML = '';
    accounts.forEach((account, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${account.name}</strong></td>
            <td>${account.type}</td>
            <td>${maskAccountNumber(account.number)}</td>
            <td><span class="badge ${account.active ? 'badge-success' : 'badge-danger'}">${account.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn-edit" onclick="editAccount(${index})">Edit</button>
                <button class="btn-danger" onclick="deleteAccount(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function maskAccountNumber(number) {
    if (!number || number.length < 4) return number;
    return '••••' + number.slice(-4);
}

function showAddAccountModal() {
    document.getElementById('addAccountModal').classList.add('show');
    document.getElementById('addAccountForm').reset();
}

function closeAddAccountModal() {
    document.getElementById('addAccountModal').classList.remove('show');
}

function addAccount() {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    
    const newAccount = {
        id: Date.now(),
        name: document.getElementById('accountName').value,
        type: document.getElementById('accountType').value,
        number: document.getElementById('accountNumber').value,
        routing: document.getElementById('routingNumber').value,
        holder: document.getElementById('accountHolder').value,
        instructions: document.getElementById('additionalInfo').value,
        active: document.getElementById('accountActive').checked,
        createdAt: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    localStorage.setItem('paymentAccounts', JSON.stringify(accounts));
    
    loadAccounts();
    closeAddAccountModal();
    updateStats();
    
    // Update processing fee page with new accounts
    updateProcessingFeePageAccounts();
    
    showToast('Payment account added successfully!');
}

function editAccount(index) {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const account = accounts[index];
    
    if (!account) return;
    
    // Fill edit form
    document.getElementById('editAccountId').value = index;
    document.getElementById('editAccountName').value = account.name;
    document.getElementById('editAccountType').value = account.type;
    document.getElementById('editAccountNumber').value = account.number;
    document.getElementById('editRoutingNumber').value = account.routing || '';
    document.getElementById('editAccountHolder').value = account.holder;
    document.getElementById('editAdditionalInfo').value = account.instructions || '';
    document.getElementById('editAccountActive').checked = account.active;
    
    // Show modal
    document.getElementById('editAccountModal').classList.add('show');
}

function closeEditAccountModal() {
    document.getElementById('editAccountModal').classList.remove('show');
}

function updateAccount() {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const index = parseInt(document.getElementById('editAccountId').value);
    
    if (accounts[index]) {
        accounts[index].name = document.getElementById('editAccountName').value;
        accounts[index].type = document.getElementById('editAccountType').value;
        accounts[index].number = document.getElementById('editAccountNumber').value;
        accounts[index].routing = document.getElementById('editRoutingNumber').value;
        accounts[index].holder = document.getElementById('editAccountHolder').value;
        accounts[index].instructions = document.getElementById('editAdditionalInfo').value;
        accounts[index].active = document.getElementById('editAccountActive').checked;
        accounts[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem('paymentAccounts', JSON.stringify(accounts));
        
        loadAccounts();
        closeEditAccountModal();
        updateStats();
        
        // Update processing fee page with updated accounts
        updateProcessingFeePageAccounts();
        
        showToast('Payment account updated successfully!');
    }
}

function deleteAccount(index) {
    if (confirm('Are you sure you want to delete this payment account?')) {
        const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
        accounts.splice(index, 1);
        localStorage.setItem('paymentAccounts', JSON.stringify(accounts));
        
        loadAccounts();
        updateStats();
        
        // Update processing fee page
        updateProcessingFeePageAccounts();
        
        showToast('Payment account deleted successfully!');
    }
}

// ============================================
// UPDATE PROCESSING FEE PAGE
// ============================================
function updateProcessingFeePage(settings) {
    // This function generates updated content that should be injected into processing-fee.html
    // In a real application, this would update a database that the processing-fee page reads from
    
    const processingFee = parseFloat(settings.processingFee || 149);
    const adminFee = parseFloat(settings.adminFee || 50);
    const totalFee = processingFee + adminFee;
    
    const updateData = {
        processingFee: processingFee.toFixed(2),
        adminFee: adminFee.toFixed(2),
        totalFee: totalFee.toFixed(2),
        description: settings.feeDescription,
        enabled: settings.feeEnabled,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('processingFeeConfig', JSON.stringify(updateData));
}

function updateProcessingFeePageAccounts() {
    const accounts = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const activeAccounts = accounts.filter(acc => acc.active);
    
    localStorage.setItem('activePaymentAccounts', JSON.stringify(activeAccounts));
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message) {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// CLOSE MODALS ON OUTSIDE CLICK
// ============================================
window.addEventListener('click', function(e) {
    const addModal = document.getElementById('addAccountModal');
    const editModal = document.getElementById('editAccountModal');
    
    if (e.target === addModal) {
        closeAddAccountModal();
    }
    if (e.target === editModal) {
        closeEditAccountModal();
    }
});
