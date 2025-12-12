/**
 * ZAS Digital - Forms Module
 * Handles form validation, submission, and interactions
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { EventBus } from '../core/events.js';
import { ErrorHandler } from '../core/error-handler.js';

export const Forms = (function() {
    'use strict';
    
    const forms = new Map();
    
    /**
     * Initialize all forms on page
     */
    function init() {
        initContactForm();
        initFileUpload();
        
        console.log('Forms module initialized');
    }
    
    /**
     * Initialize contact form
     */
    function initContactForm() {
        const contactForm = Utils.getElement('#contactForm');
        if (!contactForm) return;
        
        const formId = Utils.generateId('form');
        forms.set(formId, {
            element: contactForm,
            submitted: false
        });
        
        // Character counter
        const messageTextarea = Utils.getElement('#message');
        const charCount = Utils.getElement('#charCount');
        
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
                
                // Add warning when approaching limit
                if (this.value.length > 1800) {
                    charCount.style.color = '#ef4444';
                    charCount.style.fontWeight = 'bold';
                } else if (this.value.length > 1500) {
                    charCount.style.color = '#f59e0b';
                    charCount.style.fontWeight = 'bold';
                } else {
                    charCount.style.color = '';
                    charCount.style.fontWeight = '';
                }
            });
            
            // Initialize
            charCount.textContent = messageTextarea.value.length;
        }
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                submitForm(this, formId);
            }
        });
        
        // Real-time validation
        const requiredFields = Utils.getElements('[required]', contactForm);
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError(this);
                }
            });
        });
        
        // Email validation
        const emailField = Utils.getElement('#email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                if (this.value.trim() && !Utils.isValidEmail(this.value)) {
                    showFieldError(this, 'Please enter a valid email address');
                }
            });
        }
        
        // Phone validation
        const phoneField = Utils.getElement('#phone');
        if (phoneField) {
            phoneField.addEventListener('blur', function() {
                if (this.value.trim() && !Utils.isValidPhone(this.value)) {
                    showFieldError(this, 'Please enter a valid phone number');
                }
            });
        }
    }
    
    /**
     * Validate entire form
     */
    function validateForm(form) {
        let isValid = true;
        const requiredFields = Utils.getElements('[required]', form);
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Email validation
        const emailField = Utils.getElement('#email', form);
        if (emailField && emailField.value.trim() && !Utils.isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation
        const phoneField = Utils.getElement('#phone', form);
        if (phoneField && phoneField.value.trim() && !Utils.isValidPhone(phoneField.value)) {
            showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Message length
        const messageField = Utils.getElement('#message', form);
        if (messageField && messageField.value.length > 2000) {
            showFieldError(messageField, 'Message must be less than 2000 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate single field
     */
    function validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }
        
        if (isValid && value) {
            switch (fieldId) {
                case 'email':
                    if (!Utils.isValidEmail(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;
                case 'phone':
                    if (!Utils.isValidPhone(value)) {
                        errorMessage = 'Please enter a valid phone number';
                        isValid = false;
                    }
                    break;
                case 'message':
                    if (value.length > 2000) {
                        errorMessage = 'Message must be less than 2000 characters';
                        isValid = false;
                    }
                    break;
            }
        }
        
        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    }
    
    /**
     * Show field error
     */
    function showFieldError(field, message) {
        const fieldGroup = field.closest('.agency-form-group');
        const errorElement = Utils.getElement(`#${field.id}Error`);
        
        if (fieldGroup) {
            Utils.addClass(fieldGroup, 'has-error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'flex';
        }
        
        // Focus first error field
        if (!field.hasAttribute('data-focused')) {
            field.setAttribute('data-focused', 'true');
            field.focus();
            
            // Scroll to error
            const header = Utils.getElement('.agency-header');
            const headerHeight = header ? header.offsetHeight : 0;
            const fieldPosition = field.getBoundingClientRect().top + window.pageYOffset;
            
            Utils.smoothScroll(field, { offset: headerHeight + 20 });
        }
    }
    
    /**
     * Clear field error
     */
    function clearFieldError(field) {
        const fieldGroup = field.closest('.agency-form-group');
        const errorElement = Utils.getElement(`#${field.id}Error`);
        
        if (fieldGroup) {
            Utils.removeClass(fieldGroup, 'has-error');
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        field.removeAttribute('data-focused');
    }
    
    /**
     * Submit form
     */
    async function submitForm(form, formId) {
        const submitBtn = Utils.getElement('button[type="submit"]', form);
        const originalText = submitBtn?.textContent;
        const formData = new FormData(form);
        
        // Update button state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            Utils.addClass(submitBtn, 'agency-btn--loading');
        }
        
        try {
            // Simulate API call (replace with real API)
            const response = await mockSubmitForm(formData);
            
            // Success
            forms.get(formId).submitted = true;
            EventBus.emit('formSubmitted', { formId, data: response });
            
            // Show success message
            showFormSuccess(form);
            
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Show error
            showFormError(form, error);
            
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                Utils.removeClass(submitBtn, 'agency-btn--loading');
            }
        }
    }
    
    /**
     * Mock form submission (replace with real API)
     */
    function mockSubmitForm(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = Object.fromEntries(formData.entries());
                resolve({
                    success: true,
                    data,
                    message: 'Form submitted successfully',
                    timestamp: new Date().toISOString()
                });
            }, 1500);
        });
    }
    
    /**
     * Show form success
     */
    function showFormSuccess(form) {
        const successElement = Utils.getElement('#formSuccess');
        if (successElement) {
            form.style.display = 'none';
            Utils.addClass(successElement, 'active');
        }
    }
    
    /**
     * Show form error
     */
    function showFormError(form, error) {
        const errorElement = Utils.getElement('#formError');
        if (errorElement) {
            errorElement.textContent = error.message || 'There was an error submitting the form. Please try again.';
            Utils.addClass(errorElement, 'active');
            
            setTimeout(() => {
                Utils.removeClass(errorElement, 'active');
            }, 5000);
        }
    }
    
    /**
     * File upload handling
     */
    function initFileUpload() {
        const fileInput = Utils.getElement('#file');
        const filePreview = Utils.getElement('#filePreview');
        
        if (!fileInput || !filePreview) return;
        
        fileInput.addEventListener('change', function() {
            const files = this.files;
            
            if (files.length > 0) {
                const file = files[0];
                const maxSize = 10 * 1024 * 1024; // 10MB
                
                // Validate file
                if (file.size > maxSize) {
                    alert('File size must be less than 10MB');
                    this.value = '';
                    Utils.removeClass(filePreview, 'active');
                    filePreview.innerHTML = '';
                    return;
                }
                
                // Check file type
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg',
                    'image/png',
                    'application/zip'
                ];
                
                if (!allowedTypes.includes(file.type)) {
                    alert('Please upload PDF, DOC, DOCX, JPG, PNG, or ZIP files only');
                    this.value = '';
                    Utils.removeClass(filePreview, 'active');
                    filePreview.innerHTML = '';
                    return;
                }
                
                // Create preview
                createFilePreview(file, filePreview);
                
            } else {
                Utils.removeClass(filePreview, 'active');
                filePreview.innerHTML = '';
            }
        });
        
        // Drag and drop
        const fileLabel = Utils.getElement('.agency-form-file__label');
        if (fileLabel) {
            fileLabel.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = 'var(--color-primary)';
                this.style.background = 'color-mix(in srgb, var(--color-primary) 10%, var(--color-background))';
            });
            
            fileLabel.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.borderColor = '';
                this.style.background = '';
            });
            
            fileLabel.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '';
                this.style.background = '';
                
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        }
    }
    
    /**
     * Create file preview
     */
    function createFilePreview(file, container) {
        const preview = document.createElement('div');
        preview.className = 'agency-file-preview';
        
        const fileIcon = getFileIcon(file.type);
        const fileSize = Utils.formatFileSize(file.size);
        
        preview.innerHTML = `
            <div class="agency-file-preview__info">
                <div class="agency-file-preview__icon">
                    ${fileIcon}
                </div>
                <div class="agency-file-preview__details">
                    <div class="agency-file-preview__name">${file.name}</div>
                    <div class="agency-file-preview__size">${fileSize}</div>
                </div>
                <button type="button" class="agency-file-preview__remove" aria-label="Remove file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        container.innerHTML = '';
        container.appendChild(preview);
        Utils.addClass(container, 'active');
        
        // Remove button
        const removeBtn = preview.querySelector('.agency-file-preview__remove');
        removeBtn.addEventListener('click', function() {
            const fileInput = Utils.getElement('#file');
            if (fileInput) fileInput.value = '';
            Utils.removeClass(container, 'active');
            container.innerHTML = '';
        });
    }
    
    /**
     * Get file icon
     */
    function getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('zip')) return '📦';
        return '📎';
    }
    
    
    /**
     * Reset form
     */
    function resetForm(formId) {
        const formData = forms.get(formId);
        if (formData) {
            const { element } = formData;
            element.reset();
            forms.set(formId, { ...formData, submitted: false });
            
            // Clear errors
            Utils.getElements('.has-error', element).forEach(el => {
                Utils.removeClass(el, 'has-error');
            });
            
            Utils.getElements('.agency-form-error', element).forEach(el => {
                el.style.display = 'none';
            });
            
            // Reset character count
            const charCount = Utils.getElement('#charCount');
            if (charCount) {
                charCount.textContent = '0';
                charCount.style.color = '';
                charCount.style.fontWeight = '';
            }
            
            // Show form, hide success
            element.style.display = '';
            const successElement = Utils.getElement('#formSuccess');
            if (successElement) {
                Utils.removeClass(successElement, 'active');
            }
        }
    }
    
    return {
        init,
        validateForm,
        validateField,
        showFieldError,
        clearFieldError,
        submitForm,
        resetForm,
        getFileIcon,
        createFilePreview
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Forms;
}

// Make available globally
window.ZASForms = Forms;