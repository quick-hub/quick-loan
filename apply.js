/**
 * apply.js — Multi-step form with validation
 * Professional loan application form handler
 * Fixed value parsing and data storage
 */

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentStep = 1;
const totalSteps = 4;

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
                // Get clean value from data attribute
                const cleanLoanAmount = field.getAttribute('data-clean-value') || field.value.replace(/,/g, '');
                const amount = parseFloat(cleanLoanAmount);
                if (isNaN(amount) || amount < 1000 || amount > 500000) {
                    isValid = false;
                    errorMessage = 'Loan amount must be between $1,000 and $500,000';
                }
                break;
                
            case 'income':
                // Get clean value from data attribute
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
        // Change input type from number to text to allow commas
        loanAmountInput.setAttribute('type', 'text');
        loanAmountInput.setAttribute('inputmode', 'numeric');
        
        loanAmountInput.addEventListener('input', function(e) {
            // Get cursor position
            let cursorPosition = e.target.selectionStart;
            
            // Get the value and remove all non-numeric characters
            let value = e.target.value.replace(/[^\d]/g, '');
            
            // Store clean value
            e.target.setAttribute('data-clean-value', value);
            
            // Format with commas
            if (value) {
                const formatted = parseInt(value, 10).toLocaleString('en-US');
                const oldLength = e.target.value.length;
                e.target.value = formatted;
                const newLength = formatted.length;
                
                // Adjust cursor position if commas were added/removed
                const diff = newLength - oldLength;
                cursorPosition = Math.max(cursorPosition + diff, 0);
                e.target.setSelectionRange(cursorPosition, cursorPosition);
            } else {
                e.target.value = '';
            }
        });
        
        // Validate on blur
        loanAmountInput.addEventListener('blur', function(e) {
            const cleanValue = e.target.getAttribute('data-clean-value') || '';
            const numValue = parseInt(cleanValue, 10) || 0;
            
            if (numValue > 0) {
                e.target.value = numValue.toLocaleString('en-US');
            } else {
                e.target.value = '';
            }
        });
    }
    
    // Format income with live comma formatting
    const incomeInput = document.getElementById('income');
    if (incomeInput) {
        // Change input type from number to text to allow commas
        incomeInput.setAttribute('type', 'text');
        incomeInput.setAttribute('inputmode', 'numeric');
        
        incomeInput.addEventListener('input', function(e) {
            // Get cursor position
            let cursorPosition = e.target.selectionStart;
            
            // Get the value and remove all non-numeric characters
            let value = e.target.value.replace(/[^\d]/g, '');
            
            // Store clean value
            e.target.setAttribute('data-clean-value', value);
            
            // Format with commas
            if (value) {
                const formatted = parseInt(value, 10).toLocaleString('en-US');
                const oldLength = e.target.value.length;
                e.target.value = formatted;
                const newLength = formatted.length;
                
                // Adjust cursor position if commas were added/removed
                const diff = newLength - oldLength;
                cursorPosition = Math.max(cursorPosition + diff, 0);
                e.target.setSelectionRange(cursorPosition, cursorPosition);
            } else {
                e.target.value = '';
            }
        });
        
        // Validate on blur
        incomeInput.addEventListener('blur', function(e) {
            const cleanValue = e.target.getAttribute('data-clean-value') || '';
            const numValue = parseInt(cleanValue, 10) || 0;
            
            if (numValue > 0) {
                e.target.value = numValue.toLocaleString('en-US');
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
        
        // Get raw values and clean them
        const loanAmountInput = document.getElementById('loanAmount');
        const incomeInput = document.getElementById('income');
        
        let loanAmount = '';
        let income = '';
        
        // Get loan amount - check data attribute first, then clean the value
        if (loanAmountInput) {
            const dataValue = loanAmountInput.getAttribute('data-clean-value');
            loanAmount = dataValue || loanAmountInput.value || '';
        }
        
        // Get income - check data attribute first, then clean the value
        if (incomeInput) {
            const dataValue = incomeInput.getAttribute('data-clean-value');
            income = dataValue || incomeInput.value || '';
        }
        
        // Parse numeric values (remove any commas that might still be there)
        const parsedLoanAmount = parseFloat(String(loanAmount).replace(/,/g, '')) || 0;
        const parsedIncome = parseFloat(String(income).replace(/,/g, '')) || 0;
        
        console.log('Storing form data:', {
            name: fullname,
            email: email,
            loanType: loanType,
            loanAmount: parsedLoanAmount,
            annualIncome: parsedIncome
        });
        
        // Store in sessionStorage for processing-fee.html
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
// FORM SUBMISSION
// ============================================
document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Final validation
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Get references to inputs that might have formatted values
    const loanAmountInput = document.getElementById('loanAmount');
    const incomeInput = document.getElementById('income');
    
    // Store original formatted values
    const originalLoanAmount = loanAmountInput ? loanAmountInput.value : '';
    const originalIncome = incomeInput ? incomeInput.value : '';
    
    // Temporarily set clean values for form submission
    if (loanAmountInput && loanAmountInput.value) {
        loanAmountInput.value = loanAmountInput.value.replace(/,/g, '');
    }
    
    if (incomeInput && incomeInput.value) {
        incomeInput.value = incomeInput.value.replace(/,/g, '');
    }
    
    // Store form data before submission
    storeFormData();
    
    // Disable submit button
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = true;
    }
    
    // Show loading overlay
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('show');
    }
    
    // Create form data with cleaned values
    const formData = new FormData(this);
    
    // Submit via fetch
    fetch(this.action, {
        method: 'POST',
        body: formData
    }).then(() => {
        // Show success after delay
        setTimeout(function() {
            // Hide loading
            if (loading) {
                loading.classList.remove('show');
            }
            
            // Hide form
            document.getElementById('applicationForm').style.display = 'none';
            
            // Hide progress indicator
            const progressWrapper = document.querySelector('.progress-wrapper');
            if (progressWrapper) {
                progressWrapper.style.display = 'none';
            }
            
            // Show success message
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.add('show');
            }
            
            // Scroll to top
            scrollToTop();
            
            // Store submission timestamp
            storeSubmissionData();
            
            // Redirect to processing fee page after 3 seconds
            setTimeout(function() {
                window.location.href = 'processing-fee.html';
            }, 3000);
            
        }, 2000);
    }).catch((error) => {
        console.error('Submission error:', error);
        // Still proceed to processing fee page even if email fails
        setTimeout(function() {
            if (loading) {
                loading.classList.remove('show');
            }
            window.location.href = 'processing-fee.html';
        }, 2000);
    });
});

// ============================================
// STORAGE FUNCTIONS
// ============================================
function storeSubmissionData() {
    const submissionData = {
        timestamp: new Date().toISOString(),
        loanType: document.getElementById('loanType')?.value || '',
        loanAmount: parseFloat(document.getElementById('loanAmount')?.value.replace(/,/g, '') || '0'),
        submitted: true
    };
    
    try {
        localStorage.setItem('quickloan_last_application', JSON.stringify(submissionData));
    } catch (e) {
        console.log('Could not save to localStorage:', e);
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', function(e) {
    // Enter key on non-textarea fields should go to next step
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
        e.preventDefault();
        
        const nextButton = document.querySelector('.form-step.active .btn-next');
        if (nextButton) {
            nextButton.click();
        }
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

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
    if (formModified && currentStep < totalSteps) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// ============================================
// ANALYTICS & TRACKING (Optional)
// ============================================
function trackStepCompletion(stepNumber) {
    // Add your analytics tracking here
    console.log(`Step ${stepNumber} completed`);
}

function trackFormSubmission() {
    // Add your analytics tracking here
    console.log('Form submitted successfully');
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%cQuick Loan Application Form', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
console.log('%cForm initialized successfully', 'color: #51cf66; font-size: 14px;');
