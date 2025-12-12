/**
 * ZAS Digital - Counters Module
 * Handles animated number counters
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { Observers } from '../core/observers.js';

export const Counters = (function() {
    'use strict';
    
    let counterObserver = null;
    const counters = new Map();
    
    /**
     * Initialize counters
     */
    function init() {
        if (!counterObserver) {
            counterObserver = Observers.createCounterObserver();
        }
        
        // Find all counter elements
        const counterElements = Utils.getElements('[data-count]');
        
        counterElements.forEach(element => {
            // Store original value
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', element.textContent);
            }
            
            // Reset to 0 for animation
            const currentText = element.textContent;
            const suffix = getSuffix(currentText);
            element.textContent = suffix.includes('%') ? '0%' : 
                                 suffix.includes('★') ? '0★' :
                                 currentText.startsWith('-') ? '-0' : '0';
            
            // Observe element
            Observers.observeElement(element, 'counters', {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            });
            
            // Add event listener for when element becomes visible
            element.addEventListener('elementVisible', () => {
                animateCounter(element);
            });
        });
        
        console.log('Counters module initialized');
    }
    
    /**
     * Animate a single counter
     */
    function animateCounter(element) {
        const targetValue = parseFloat(element.getAttribute('data-count'));
        if (isNaN(targetValue)) return;
        
        const currentText = element.getAttribute('data-original') || element.textContent;
        const suffix = getSuffix(currentText);
        const isNegative = targetValue < 0;
        const absTarget = Math.abs(targetValue);
        
        const duration = 1500;
        const startTime = performance.now();
        const startValue = 0;
        
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (absTarget - startValue) * easeOutQuart;
            
            // Format based on suffix
            let formattedValue = formatNumber(currentValue, suffix);
            
            // Add negative sign if needed
            if (isNegative) {
                formattedValue = '-' + formattedValue;
            }
            
            element.textContent = formattedValue;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Ensure final value is exact
                let finalValue = formatNumber(absTarget, suffix);
                if (isNegative) finalValue = '-' + finalValue;
                element.textContent = finalValue;
                
                Utils.addClass(element, 'agency-counter-animated');
                
                // Store in map for reference
                counters.set(element, {
                    target: targetValue,
                    animated: true,
                    timestamp: Date.now()
                });
            }
        }
        
        requestAnimationFrame(step);
    }
    
    /**
     * Format number with suffix
     */
    function formatNumber(value, suffix) {
        if (suffix.includes('%')) {
            return Math.round(value) + '%';
        } else if (suffix.includes('★')) {
            return value.toFixed(1) + '★';
        } else if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M' + suffix.replace(/[0-9.-]/g, '');
        } else if (Math.abs(value) >= 1000) {
            return (value / 1000).toFixed(1) + 'K' + suffix.replace(/[0-9.-]/g, '');
        }
        return Math.round(value) + suffix;
    }
    
    /**
     * Extract suffix from text
     */
    function getSuffix(text) {
        return text.replace(/[0-9.-]/g, '');
    }
    
    /**
     * Animate specific element immediately
     */
    function animateElement(element) {
        if (typeof element === 'string') {
            element = Utils.getElement(element);
        }
        
        if (element && element.hasAttribute('data-count')) {
            animateCounter(element);
        }
    }
    
    /**
     * Reset counter to initial state
     */
    function resetCounter(element) {
        if (typeof element === 'string') {
            element = Utils.getElement(element);
        }
        
        if (element && element.hasAttribute('data-original')) {
            element.textContent = element.getAttribute('data-original');
            Utils.removeClass(element, 'agency-counter-animated');
            counters.delete(element);
        }
    }
    
    /**
     * Get all animated counters
     */
    function getAnimatedCounters() {
        return Array.from(counters.keys());
    }
    
    /**
     * Check if counter has been animated
     */
    function isAnimated(element) {
        return counters.has(element);
    }
    
    return {
        init,
        animateCounter,
        animateElement,
        resetCounter,
        getAnimatedCounters,
        isAnimated
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Counters;
}

// Make available globally
window.ZASCounters = Counters;