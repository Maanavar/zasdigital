/**
 * ZAS Digital - Core Utilities
 * Shared utility functions across the site
 * Version: 2.0.0
 */

export const Utils = (function() {
    'use strict';
    
    /**
     * Throttle function for performance
     */
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
    
    /**
     * Debounce function for performance
     */
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
     * Smooth scrolling with accessibility support
     */
    function smoothScroll(target, options = {}) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const header = document.querySelector('.agency-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const offset = options.offset || headerHeight + 20;
        
        const targetEl = typeof target === 'string' 
            ? document.querySelector(target)
            : target;
        
        if (!targetEl) return;
        
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - offset;
        
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
        
        // Focus for accessibility
        if (options.focus !== false) {
            targetEl.setAttribute('tabindex', '-1');
            targetEl.focus({ preventScroll: true });
            
            targetEl.addEventListener('blur', function() {
                this.removeAttribute('tabindex');
            }, { once: true });
        }
    }
    
    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                smoothScroll(href);
            });
        });
    }
    
    /**
     * Get initials from name
     */
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    /**
     * Format file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Validate email
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate phone
     */
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(cleanedPhone);
    }
    
    /**
     * Safe element query with error handling
     */
    function getElement(selector, context = document) {
        try {
            const element = context.querySelector(selector);
            if (!element) {
                console.warn(`Element not found: ${selector}`);
            }
            return element;
        } catch (error) {
            console.error(`Error querying ${selector}:`, error);
            return null;
        }
    }
    
    /**
     * Get all elements with safe handling
     */
    function getElements(selector, context = document) {
        try {
            return Array.from(context.querySelectorAll(selector));
        } catch (error) {
            console.error(`Error querying ${selector}:`, error);
            return [];
        }
    }
    
    /**
     * Safe initialization wrapper
     */
    function safeInit(initFunction, context = window) {
        try {
            initFunction.call(context);
        } catch (error) {
            console.error(`Error in ${initFunction.name}:`, error);
        }
    }
    
    /**
     * Add CSS class with vendor prefix support
     */
    function addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }
    
    /**
     * Remove CSS class
     */
    function removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }
    
    /**
     * Toggle CSS class
     */
    function toggleClass(element, className, force) {
        if (element && element.classList) {
            element.classList.toggle(className, force);
        }
    }
    
    /**
     * Generate unique ID
     */
    function generateId(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= (windowHeight - threshold) &&
            rect.left <= (windowWidth - threshold) &&
            rect.bottom >= threshold &&
            rect.right >= threshold
        );
    }
    
    return {
        throttle,
        debounce,
        smoothScroll,
        initSmoothScrolling,
        getInitials,
        formatFileSize,
        isValidEmail,
        isValidPhone,
        getElement,
        getElements,
        safeInit,
        addClass,
        removeClass,
        toggleClass,
        generateId,
        isInViewport
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.ZASUtils = Utils;