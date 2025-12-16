/**
 * ZAS Digital - Scroll Animations Module
 * Handles scroll-triggered animations using Intersection Observer
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { ErrorHandler } from '../core/error-handler.js';

export const ScrollAnimations = (function() {
    'use strict';
    
    let observer = null;
    const animatedElements = new Set();
    
    /**
     * Initialize scroll animations
     */
    function init() {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('Reduced motion preference detected, skipping scroll animations');
            return;
        }
        
        // Create Intersection Observer
        observer = new IntersectionObserver(
            handleIntersection,
            getObserverOptions()
        );
        
        // Start observing elements
        startObserving();
        
        // Handle dynamic content
        setupDynamicContentObserver();
        
        console.log('Scroll animations initialized');
        
        return observer;
    }
    
    /**
     * Observer options
     */
    function getObserverOptions() {
        return {
            root: null, // viewport
            rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
            threshold: 0.1 // Trigger when 10% of element is visible
        };
    }
    
    /**
     * Handle intersection events
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is in viewport
                animateElement(entry.target);
                
                // Stop observing once animated
                observer.unobserve(entry.target);
                animatedElements.delete(entry.target);
            }
        });
    }
    
    /**
     * Animate a single element
     */
    function animateElement(element) {
        // Get animation delay from data attribute
        const delay = element.getAttribute('data-animation-delay') || 
                     element.style.animationDelay || 
                     '0ms';
        
        // Parse delay (remove 'ms' if present)
        const delayMs = parseInt(delay.replace('ms', '')) || 0;
        
        // Apply animation with delay
        setTimeout(() => {
            element.classList.add('visible');
            
            // Emit custom event for other modules
            element.dispatchEvent(new CustomEvent('animationTriggered', {
                detail: { element, type: element.classList.contains('agency-fade-in') ? 'fade-in' : 'slide-in-up' }
            }));
            
        }, delayMs);
    }
    
    /**
     * Start observing all animation elements
     */
    function startObserving() {
        // Select all elements that need animation
        const elements = document.querySelectorAll(
            '.agency-fade-in, .agency-slide-in-up, [data-scroll-animate]'
        );
        
        elements.forEach(element => {
            // Skip if already visible (hero content)
            if (isInHeroSection(element)) {
                // Animate immediately
                setTimeout(() => {
                    animateElement(element);
                }, 100);
                return;
            }
            
            // Add to observer
            observer.observe(element);
            animatedElements.add(element);
        });
        
        console.log(`Observing ${elements.length} elements for scroll animations`);
    }
    
    /**
     * Check if element is in hero section (above the fold)
     */
    function isInHeroSection(element) {
        const heroSection = element.closest('.agency-hero, .agency-hero--service');
        if (!heroSection) return false;
        
        // Check if hero section is in viewport on load
        const rect = heroSection.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight * 0.8;
    }
    
    /**
     * Setup MutationObserver for dynamic content
     */
    function setupDynamicContentObserver() {
        const dynamicContainers = document.querySelectorAll(
            '[data-needs-projects], [data-needs-testimonials], [data-dynamic-content], [data-render-projects]'
        );
        
        if (dynamicContainers.length > 0) {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        // New nodes added, check for animation elements
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                const newElements = node.querySelectorAll ?
                                    node.querySelectorAll('.agency-fade-in, .agency-slide-in-up, .agency-case-study-grid') :
                                    [];
                                
                                newElements.forEach(element => {
                                    observer.observe(element);
                                    animatedElements.add(element);
                                });
                            }
                        });
                    }
                });
            });
            
            dynamicContainers.forEach(container => {
                mutationObserver.observe(container, {
                    childList: true,
                    subtree: true
                });
            });
        }
    }
    
    /**
     * Manually trigger animation for an element
     */
    function triggerAnimation(selectorOrElement) {
        const element = typeof selectorOrElement === 'string' ?
            document.querySelector(selectorOrElement) :
            selectorOrElement;
        
        if (element) {
            animateElement(element);
            return true;
        }
        
        return false;
    }
    
    /**
     * Clean up observers
     */
    function cleanup() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        animatedElements.clear();
        
        console.log('Scroll animations cleaned up');
    }
    
    /**
     * Get stats for debugging
     */
    function getStats() {
        return {
            totalObserved: animatedElements.size,
            observerActive: !!observer
        };
    }
    
    return {
        init,
        triggerAnimation,
        cleanup,
        getStats,
        
        // Public API
        animate: triggerAnimation,
        destroy: cleanup
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ZASScrollAnimations = ScrollAnimations;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimations;
}