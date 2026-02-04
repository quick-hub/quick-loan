/**
 * Processing Fee Payment Handler
 * Auto-populates with logged-in user data
 * Shows success message after payment request is sent
 * Generates unique payment codes and manages payment instructions
 */

// Fee calculation rates
const PROCESSING_FEE_RATE = 0.04; // 4%
const INSURANCE_FEE_RATE = 0.06;  // 6%

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (typeof window.QuickLoanAuth !== 'undefined' && !window.QuickLoanAuth.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    loadApplicationData();
    calculateFees();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Send Email button click handler
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSendPaymentRequest();
        });
    }
}

// Load application data from sessionStorage, localStorage, or user account
function loadApplicationData() {
    let applicantName = '';
    let applicantEmail = '';
    let loanType = '';
    let loanAmount = '';

    // Try to get data from session storage (from apply form)
    try {
        applicantName = sessionStorage.getItem('applicantName') || '';
        applicantEmail = sessionStorage.getItem('applicantEmail') || '';
        loanType = sessionStorage.getItem('loanType') || '';
        loanAmount = sessionStorage.getItem('loanAmount') || '';
    } catch (e) {
        console.log('Session storage not available');
    }

    // If no session data, try localStorage
    if (!applicantName || !applicantEmail) {
        applicantName = localStorage.getItem('applicantName') || '';
        applicantEmail = localStorage.getItem('applicantEmail') || '';
        loanType = localStorage.getItem('loanType') || '';
        loanAmount = localStorage.getItem('loanAmount') || '';
    }

    // If still no data, get from authenticated user account
    if (!applicantName || !applicantEmail) {
        if (typeof window.QuickLoanAuth !== 'undefined') {
            const userData = window.QuickLoanAuth.getUserData();
            applicantName = userData.name || 'Valued Customer';
            applicantEmail = userData.email || 'customer@example.com';
        }
    }

    // Set default values if still empty
    if (!loanType) loanType = 'Personal Loan';
    if (!loanAmount) loanAmount = '10000';

    // Parse and validate loan amount
    const parsedAmount = parseFloat(loanAmount.toString().replace(/[^0-9.-]+/g, ''));
    const validAmount = isNaN(parsedAmount) || parsedAmount <= 0 ? 10000 : parsedAmount;

    // Store data globally for use in other functions
    window.applicantData = {
        name: applicantName,
        email: applicantEmail,
        loanType: loanType,
        loanAmount: validAmount
    };

    // Display the data in summary
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryLoanType = document.getElementById('summaryLoanType');
    const summaryLoanAmount = document.getElementById('summaryLoanAmount');

    if (summaryName) summaryName.textContent = applicantName;
    if (summaryEmail) summaryEmail.textContent = applicantEmail;
    if (summaryLoanType) summaryLoanType.textContent = loanType;
    if (summaryLoanAmount) summaryLoanAmount.textContent = formatCurrency(validAmount);
}

// Calculate processing and insurance fees
function calculateFees() {
    const loanAmount = window.applicantData ? window.applicantData.loanAmount : 0;
    
    // Calculate fees
    const processingFee = loanAmount * PROCESSING_FEE_RATE;
    const insuranceFee = loanAmount * INSURANCE_FEE_RATE;
    const totalFee = processingFee + insuranceFee;
    
    // Display fees
    const processingFeeEl = document.getElementById('processingFee');
    const insuranceFeeEl = document.getElementById('insuranceFee');
    const totalFeeEl = document.getElementById('totalFee');

    if (processingFeeEl) processingFeeEl.textContent = formatCurrency(processingFee);
    if (insuranceFeeEl) insuranceFeeEl.textContent = formatCurrency(insuranceFee);
    if (totalFeeEl) totalFeeEl.textContent = formatCurrency(totalFee);
    
    // Store fees globally
    window.calculatedFees = {
        processing: processingFee,
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
    
    // Send notification email to admin
    sendPaymentCodeEmail(paymentCode);
    
    return paymentCode;
}

// Show payment instructions with generated code
function showPaymentInstructions(paymentCode) {
    // Hide summary step
    const summaryStep = document.getElementById('summaryStep');
    if (summaryStep) summaryStep.classList.remove('active');
    
    // Show instructions step
    const paymentInstructions = document.getElementById('paymentInstructions');
    if (paymentInstructions) paymentInstructions.classList.add('active');
    
    // Display payment code
    const generatedCode = document.getElementById('generatedCode');
    const summaryPaymentCode = document.getElementById('summaryPaymentCode');
    
    if (generatedCode) generatedCode.textContent = paymentCode;
    if (summaryPaymentCode) summaryPaymentCode.textContent = paymentCode;
    
    // Fill in applicant information
    const summaryPaymentName = document.getElementById('summaryPaymentName');
    const summaryPaymentAmount = document.getElementById('summaryPaymentAmount');

    if (summaryPaymentName) summaryPaymentName.textContent = window.applicantData.name;
    if (summaryPaymentAmount) summaryPaymentAmount.textContent = formatCurrency(window.calculatedFees.total);
    
    // Update mailto link
    updateMailtoLink(paymentCode);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update mailto link with payment code and details
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
    }
}

// Handle send payment request
function handleSendPaymentRequest() {
    // Get mailto link
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const mailtoLink = sendEmailBtn ? sendEmailBtn.getAttribute('data-mailto') : '';
    
    // Open mailto link
    if (mailtoLink) {
        window.location.href = mailtoLink;
    }
    
    // Show success message after a short delay
    setTimeout(function() {
        showSuccessMessage();
    }, 500);
}

// Show success message
function showSuccessMessage() {
    // Hide payment instructions
    const paymentInstructions = document.getElementById('paymentInstructions');
    if (paymentInstructions) paymentInstructions.classList.remove('active');
    
    // Show success message
    const paymentSuccess = document.getElementById('paymentSuccess');
    if (paymentSuccess) {
        paymentSuccess.classList.add('show');
        paymentSuccess.style.display = 'block';
    }
    
    // Send confirmation email
    sendPaymentRequestConfirmation();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Copy payment code to clipboard
function copyPaymentCode() {
    const generatedCode = document.getElementById('generatedCode');
    if (!generatedCode) return;
    
    const paymentCode = generatedCode.textContent;
    
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(paymentCode).then(function() {
            showCopySuccess('Payment code copied to clipboard!');
        }).catch(function(err) {
            console.error('Failed to copy:', err);
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
    tempInput.style.top = '0';
    tempInput.style.left = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess('Payment code copied to clipboard!');
        } else {
            showCopySuccess('Failed to copy. Please copy manually.');
        }
    } catch (err) {
        console.error('Failed to copy:', err);
        showCopySuccess('Failed to copy. Please copy manually.');
    }
    
    document.body.removeChild(tempInput);
}

// Show copy success message
function showCopySuccess(message) {
    // Remove any existing toast
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Send payment code notification email to admin
function sendPaymentCodeEmail(paymentCode) {
    // Create hidden form to submit notification
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/quickloanz@zohomail.com';
    form.method = 'POST';
    form.target = 'paymentFrame';
    form.style.display = 'none';
    
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
        'Processing Fee': formatCurrency(window.calculatedFees.processing),
        'Insurance Fee': formatCurrency(window.calculatedFees.insurance),
        'Total Fee Due': formatCurrency(window.calculatedFees.total),
        'Generated At': new Date().toLocaleString(),
        'Status': 'Payment Code Generated - Awaiting Payment Request',
        'Next Step': 'Applicant will send payment request email to receive account details'
    };
    
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    
    // Submit form
    try {
        form.submit();
        console.log('Payment code email sent successfully');
    } catch (e) {
        console.error('Error sending payment code email:', e);
    }
    
    // Remove form after submission
    setTimeout(() => {
        if (form.parentNode) {
            form.parentNode.removeChild(form);
        }
    }, 1000);
}

// Send payment request confirmation email
function sendPaymentRequestConfirmation() {
    // Create hidden form to submit confirmation
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/quickloanz@zohomail.com';
    form.method = 'POST';
    form.target = 'paymentFrame';
    form.style.display = 'none';
    
    // Add form fields
    const fields = {
        '_subject': `Payment Request Sent - Code: ${window.paymentCode}`,
        '_template': 'table',
        '_captcha': 'false',
        '_cc': window.applicantData.email,
        'Payment Code': window.paymentCode,
        'Applicant Name': window.applicantData.name,
        'Applicant Email': window.applicantData.email,
        'Loan Type': window.applicantData.loanType,
        'Loan Amount': formatCurrency(window.applicantData.loanAmount),
        'Total Fee Due': formatCurrency(window.calculatedFees.total),
        'Request Sent At': new Date().toLocaleString(),
        'Status': 'Payment Request Email Sent',
        'Action': 'Applicant has requested payment account details via email'
    };
    
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    
    // Submit form
    try {
        form.submit();
        console.log('Payment request confirmation sent successfully');
    } catch (e) {
        console.error('Error sending payment request confirmation:', e);
    }
    
    // Remove form after submission
    setTimeout(() => {
        if (form.parentNode) {
            form.parentNode.removeChild(form);
        }
    }, 1000);
}

// Back to summary (if needed)
function backToSummary() {
    const paymentInstructions = document.getElementById('paymentInstructions');
    const summaryStep = document.getElementById('summaryStep');
    
    if (paymentInstructions) paymentInstructions.classList.remove('active');
    if (summaryStep) summaryStep.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
