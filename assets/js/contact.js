/**
 * ZAS Digital - Contact Page JavaScript
 * Production-ready vanilla JS for contact page features
 * Version: 1.0.1 - 2025 Modern Edition - Fixed header overlap
 */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize contact page specific modules
        initContactForm();
        initFAQAccordion();
        initFileUpload();
        initTimelineSlider();
        initContactMethods();
        initSmoothScrolling();
        fixHeaderOverlap(); // Added: Fix header overlap
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('zas:contact:ready'));
    });

    /**
     * FIX HEADER OVERLAP ISSUE
     * This ensures the header doesn't overlap with content
     */
    function fixHeaderOverlap() {
        const header = document.getElementById('mainHeader');
        const hero = document.querySelector('.agency-hero--contact');
        
        if (!header || !hero) return;
        
        // Ensure proper z-index layering
        header.style.zIndex = '1000';
        hero.style.zIndex = '1';
        
        // Update hero padding based on header height
        function updateHeroPadding() {
            const headerHeight = header.offsetHeight;
            const isScrolled = header.classList.contains('is-scrolled');
            const scrolledHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height-scrolled')) || 72;
            
            if (isScrolled) {
                hero.style.paddingTop = scrolledHeight + 'px';
            } else {
                hero.style.paddingTop = headerHeight + 'px';
            }
        }
        
        // Initial update
        updateHeroPadding();
        
        // Update on scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateHeroPadding, 100);
        });
        
        // Update on resize
        window.addEventListener('resize', updateHeroPadding);
    }

    /**
     * ENHANCED CONTACT FORM
     * Advanced form validation and submission
     */
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const submitButton = document.getElementById('submitButton');
        const formSuccess = document.getElementById('formSuccess');
        const submitAnotherBtn = document.getElementById('submitAnother');
        const timelineSlider = document.getElementById('timeline');
        const timelineValue = document.getElementById('timelineValue');
        const messageTextarea = document.getElementById('message');
        const charCount = document.getElementById('charCount');
        
        if (!contactForm) return;
        
        // Character counter for message textarea
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
                
                // Add warning class when approaching limit
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
            
            // Initialize counter
            charCount.textContent = messageTextarea.value.length;
        }
        
        // Timeline slider value display
        if (timelineSlider && timelineValue) {
            timelineSlider.addEventListener('input', function() {
                const months = parseInt(this.value);
                timelineValue.textContent = months === 12 ? '12+ Months' : `${months} Month${months > 1 ? 's' : ''}`;
            });
            
            // Initialize value
            const initialMonths = parseInt(timelineSlider.value);
            timelineValue.textContent = initialMonths === 12 ? '12+ Months' : `${initialMonths} Month${initialMonths > 1 ? 's' : ''}`;
        }
        
        // Form validation
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearFormErrors();
            
            // Validate form
            if (validateForm()) {
                submitForm();
            }
        });
        
        // Real-time validation for required fields
        const requiredFields = contactForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                // Remove error state when user starts typing
                if (this.value.trim()) {
                    removeFieldError(this);
                }
            });
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                if (this.value.trim() && !isValidEmail(this.value)) {
                    showFieldError(this, 'Please enter a valid email address');
                }
            });
        }
        
        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('blur', function() {
                if (this.value.trim() && !isValidPhone(this.value)) {
                    showFieldError(this, 'Please enter a valid phone number');
                }
            });
        }
        
        // Reset form for another submission
        if (submitAnotherBtn) {
            submitAnotherBtn.addEventListener('click', function() {
                formSuccess.classList.remove('active');
                contactForm.reset();
                clearFormErrors();
                
                // Reset character count
                if (charCount) {
                    charCount.textContent = '0';
                    charCount.style.color = '';
                    charCount.style.fontWeight = '';
                }
                
                // Reset timeline display
                if (timelineValue) {
                    timelineValue.textContent = '6 Months';
                }
                
                // Focus on first field
                const firstField = contactForm.querySelector('input, select, textarea');
                if (firstField) {
                    firstField.focus();
                }
            });
        }
        
        function validateForm() {
            let isValid = true;
            
            // Validate required fields
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            // Validate email format
            if (emailField && emailField.value.trim() && !isValidEmail(emailField.value)) {
                showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate phone format if provided
            if (phoneField && phoneField.value.trim() && !isValidPhone(phoneField.value)) {
                showFieldError(phoneField, 'Please enter a valid phone number');
                isValid = false;
            }
            
            // Validate message length
            if (messageTextarea && messageTextarea.value.length > 2000) {
                showFieldError(messageTextarea, 'Message must be less than 2000 characters');
                isValid = false;
            }
            
            return isValid;
        }
        
        function validateField(field) {
            const value = field.value.trim();
            const fieldId = field.id;
            let isValid = true;
            let errorMessage = '';
            
            // Check if field is required and empty
            if (field.hasAttribute('required') && !value) {
                errorMessage = 'This field is required';
                isValid = false;
            }
            
            // Field-specific validations
            if (isValid && value) {
                switch (fieldId) {
                    case 'email':
                        if (!isValidEmail(value)) {
                            errorMessage = 'Please enter a valid email address';
                            isValid = false;
                        }
                        break;
                    case 'phone':
                        if (!isValidPhone(value)) {
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
                removeFieldError(field);
            }
            
            return isValid;
        }
        
        function showFieldError(field, message) {
            const fieldGroup = field.closest('.agency-form-group');
            const errorElement = document.getElementById(`${field.id}Error`);
            
            if (fieldGroup) {
                fieldGroup.classList.add('has-error');
            }
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'flex';
            }
            
            // Focus on first error field
            if (!field.hasAttribute('data-focused')) {
                field.setAttribute('data-focused', 'true');
                field.focus();
                
                // Scroll to error field with offset for header
                const headerHeight = document.querySelector('.agency-header')?.offsetHeight || 0;
                const fieldPosition = field.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: fieldPosition - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        }
        
        function removeFieldError(field) {
            const fieldGroup = field.closest('.agency-form-group');
            const errorElement = document.getElementById(`${field.id}Error`);
            
            if (fieldGroup) {
                fieldGroup.classList.remove('has-error');
            }
            
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            
            field.removeAttribute('data-focused');
        }
        
        function clearFormErrors() {
            const errorGroups = contactForm.querySelectorAll('.agency-form-group.has-error');
            const errorElements = contactForm.querySelectorAll('.agency-form-error');
            
            errorGroups.forEach(group => {
                group.classList.remove('has-error');
            });
            
            errorElements.forEach(element => {
                element.style.display = 'none';
            });
            
            const focusedFields = contactForm.querySelectorAll('[data-focused]');
            focusedFields.forEach(field => {
                field.removeAttribute('data-focused');
            });
        }
        
        async function submitForm() {
            // Show loading state
            contactForm.classList.add('agency-form-loading');
            submitButton.disabled = true;
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());
            
            // Add additional data
            formObject.timeline = timelineValue?.textContent || '6 Months';
            formObject.submittedAt = new Date().toISOString();
            formObject.userAgent = navigator.userAgent;
            formObject.referrer = document.referrer;
            
            try {
                // In production, replace with your actual API endpoint
                const response = await mockSubmitForm(formObject);
                
                // Show success message
                contactForm.style.display = 'none';
                formSuccess.classList.add('active');
                
                // Set confirmation email
                const confirmationEmail = document.getElementById('confirmationEmail');
                if (confirmationEmail && formObject.email) {
                    confirmationEmail.textContent = formObject.email;
                }
                
                // Send to analytics (if consented)
                if (window.ZASDigital && window.ZASDigital.trackEvent) {
                    window.ZASDigital.trackEvent('contact_form_submitted', {
                        project_type: formObject.projectType,
                        budget: formObject.budget
                    });
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                alert('There was an error submitting your form. Please try again or contact us directly at hello@zasdigital.in');
            } finally {
                // Reset loading state
                contactForm.classList.remove('agency-form-loading');
                submitButton.disabled = false;
            }
        }
        
        function mockSubmitForm(data) {
            return new Promise((resolve) => {
                // Simulate API delay
                setTimeout(() => {
                    console.log('Form submitted:', data);
                    resolve({
                        success: true,
                        message: 'Form submitted successfully',
                        data: data
                    });
                }, 1500);
            });
        }
        
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        function isValidPhone(phone) {
            // Simple phone validation - accepts various formats
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
            return phoneRegex.test(cleanedPhone);
        }
    }

    /**
     * FAQ ACCORDION
     * Interactive FAQ section with smooth animations
     */
    function initFAQAccordion() {
        const faqQuestions = document.querySelectorAll('.agency-faq-item__question');
        
        if (!faqQuestions.length) return;
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const answer = this.nextElementSibling;
                
                // Close all other FAQ items
                if (!isExpanded) {
                    document.querySelectorAll('.agency-faq-item__question[aria-expanded="true"]').forEach(otherQuestion => {
                        const otherAnswer = otherQuestion.nextElementSibling;
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherAnswer.setAttribute('aria-hidden', 'true');
                    });
                }
                
                // Toggle current FAQ item
                this.setAttribute('aria-expanded', !isExpanded);
                answer.setAttribute('aria-hidden', isExpanded);
                
                // Focus management for accessibility
                if (!isExpanded) {
                    setTimeout(() => {
                        answer.querySelector('a')?.focus();
                    }, 300);
                }
            });
            
            // Keyboard navigation
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
                
                // Arrow key navigation between FAQ items
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const items = Array.from(document.querySelectorAll('.agency-faq-item__question'));
                    const currentIndex = items.indexOf(this);
                    let nextIndex;
                    
                    if (e.key === 'ArrowDown') {
                        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    } else {
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    }
                    
                    items[nextIndex].focus();
                }
            });
        });
        
        // Open first FAQ item by default on mobile
        if (window.innerWidth < 768 && faqQuestions.length > 0) {
            const firstQuestion = faqQuestions[0];
            const firstAnswer = firstQuestion.nextElementSibling;
            
            firstQuestion.setAttribute('aria-expanded', 'true');
            firstAnswer.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * FILE UPLOAD
     * Enhanced file upload with preview
     */
    function initFileUpload() {
        const fileInput = document.getElementById('file');
        const filePreview = document.getElementById('filePreview');
        
        if (!fileInput || !filePreview) return;
        
        fileInput.addEventListener('change', function() {
            const files = this.files;
            
            if (files.length > 0) {
                const file = files[0];
                
                // Check file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size > maxSize) {
                    alert('File size must be less than 10MB');
                    this.value = '';
                    filePreview.classList.remove('active');
                    filePreview.innerHTML = '';
                    return;
                }
                
                // Check file type
                const allowedTypes = ['application/pdf', 'application/msword', 
                                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                     'image/jpeg', 'image/png', 'application/zip'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Please upload PDF, DOC, DOCX, JPG, PNG, or ZIP files only');
                    this.value = '';
                    filePreview.classList.remove('active');
                    filePreview.innerHTML = '';
                    return;
                }
                
                // Create preview
                const preview = document.createElement('div');
                preview.className = 'agency-file-preview';
                preview.innerHTML = `
                    <div class="agency-file-preview__info">
                        <div class="agency-file-preview__icon">
                            ${getFileIcon(file.type)}
                        </div>
                        <div class="agency-file-preview__details">
                            <div class="agency-file-preview__name">${file.name}</div>
                            <div class="agency-file-preview__size">${formatFileSize(file.size)}</div>
                        </div>
                        <button type="button" class="agency-file-preview__remove" aria-label="Remove file">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                `;
                
                filePreview.innerHTML = '';
                filePreview.appendChild(preview);
                filePreview.classList.add('active');
                
                // Add remove functionality
                const removeBtn = preview.querySelector('.agency-file-preview__remove');
                removeBtn.addEventListener('click', function() {
                    fileInput.value = '';
                    filePreview.classList.remove('active');
                    filePreview.innerHTML = '';
                });
            } else {
                filePreview.classList.remove('active');
                filePreview.innerHTML = '';
            }
        });
        
        // Drag and drop support
        const fileLabel = document.querySelector('.agency-form-file__label');
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
        
        function getFileIcon(fileType) {
            if (fileType.includes('pdf')) {
                return '📄';
            } else if (fileType.includes('word') || fileType.includes('document')) {
                return '📝';
            } else if (fileType.includes('image')) {
                return '🖼️';
            } else if (fileType.includes('zip')) {
                return '📦';
            }
            return '📎';
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }

    /**
     * TIMELINE SLIDER ENHANCEMENTS
     */
    function initTimelineSlider() {
        const timelineSlider = document.getElementById('timeline');
        
        if (!timelineSlider) return;
        
        // Add visual feedback on interaction
        timelineSlider.addEventListener('input', function() {
            const value = (this.value - this.min) / (this.max - this.min) * 100;
            this.style.background = `linear-gradient(to right, 
                var(--color-primary) 0%, 
                var(--color-primary) ${value}%, 
                var(--color-border) ${value}%, 
                var(--color-border) 100%)`;
        });
        
        // Initialize gradient
        const initialValue = (timelineSlider.value - timelineSlider.min) / (timelineSlider.max - timelineSlider.min) * 100;
        timelineSlider.style.background = `linear-gradient(to right, 
            var(--color-primary) 0%, 
            var(--color-primary) ${initialValue}%, 
            var(--color-border) ${initialValue}%, 
            var(--color-border) 100%)`;
    }

    /**
     * CONTACT METHODS INTERACTION
     */
    function initContactMethods() {
        const contactMethods = document.querySelectorAll('.agency-contact-method');
        
        if (!contactMethods.length) return;
        
        contactMethods.forEach(method => {
            method.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            method.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            // Focus styles for accessibility
            method.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--color-primary)';
                this.style.outlineOffset = '4px';
            });
            
            method.addEventListener('blur', function() {
                this.style.outline = '';
            });
        });
    }

    /**
     * SMOOTH SCROLLING
     */
    function initSmoothScrolling() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Skip empty or javascript links
            if (anchor.getAttribute('href') === '#' || anchor.getAttribute('href') === '#!') return;
            
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    // Calculate scroll position
                    const header = document.querySelector('.agency-header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight - 20;
                    
                    // Smooth scroll or instant jump based on preference
                    if (prefersReducedMotion) {
                        window.scrollTo({
                            top: offsetPosition
                        });
                    } else {
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                    
                    // Focus the target for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                    
                    // Remove tabindex after blur
                    target.addEventListener('blur', function() {
                        this.removeAttribute('tabindex');
                    }, { once: true });
                }
            });
        });
    }

    /**
     * UTILITY FUNCTIONS
     */
    
    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        let lastResult;
        
        return function(...args) {
            const context = this;
            
            if (!inThrottle) {
                inThrottle = true;
                lastResult = func.apply(context, args);
                
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
            
            return lastResult;
        };
    }
    
    // Debounce function for performance
    function debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * GLOBAL ERROR HANDLING
     */
    window.addEventListener('error', function(e) {
        console.error('Contact page error caught:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Contact page unhandled promise rejection:', e.reason);
    });
    
    /**
     * EXPOSE PUBLIC API
     */
    window.ZASDigitalContact = {
        initContactForm,
        initFAQAccordion,
        initFileUpload,
        throttle,
        debounce,
        fixHeaderOverlap
    };

})();