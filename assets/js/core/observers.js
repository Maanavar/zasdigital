/**
 * ZAS Digital - Shared Observers
 * Centralized Intersection Observers for performance
 * Version: 2.0.0
 */

export const Observers = (function() {
    'use strict';
    
    const observers = new Map();
    
    /**
     * Get or create an observer
     */
    function getObserver(name, options = {}) {
        if (observers.has(name)) {
            return observers.get(name);
        }
        
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerOptions = { ...defaultOptions, ...options };
        const observer = new IntersectionObserver(handleIntersection, observerOptions);
        
        observers.set(name, observer);
        return observer;
    }
    
    /**
     * Handle intersection
     */
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.dispatchEvent(new CustomEvent('elementVisible', {
                    detail: { entry, observer }
                }));
            }
        });
    }
    
    /**
     * Observe an element
     */
    function observeElement(element, observerName, options = {}) {
        const observer = getObserver(observerName, options);
        observer.observe(element);
        return () => observer.unobserve(element);
    }
    
    /**
     * Observe multiple elements
     */
    function observeElements(elements, observerName, options = {}) {
        const observer = getObserver(observerName, options);
        const unobserveCallbacks = [];
        
        elements.forEach(element => {
            observer.observe(element);
            unobserveCallbacks.push(() => observer.unobserve(element));
        });
        
        return () => unobserveCallbacks.forEach(fn => fn());
    }
    
    /**
     * Create a counter observer
     */
    function createCounterObserver() {
        return getObserver('counters', {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
    }
    
    /**
     * Create a fade-in observer
     */
    function createFadeInObserver() {
        return getObserver('fade-in', {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
    }
    
    /**
     * Cleanup all observers
     */
    function cleanup() {
        observers.forEach(observer => {
            observer.disconnect();
        });
        observers.clear();
    }
    
    return {
        getObserver,
        observeElement,
        observeElements,
        createCounterObserver,
        createFadeInObserver,
        cleanup
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Observers;
}

// Make available globally
window.ZASObservers = Observers;