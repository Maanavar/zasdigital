/**
 * ZAS Digital - About Page JavaScript
 * Production-ready vanilla JS for about page features
 * Version: 1.0.0 - 2025 Modern Edition
 */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize about page specific modules
        initAboutStats();
        initTimelineAnimation();
        initTeamCards();
        initCultureCards();
        initSmoothScrolling();
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('zas:about:ready'));
    });

    /**
     * ABOUT PAGE STATS ANIMATION
     * Animate hero stats on scroll
     */
    function initAboutStats() {
        const statNumbers = document.querySelectorAll('.agency-hero__stat-number, .agency-team-stats__number');
        
        if (!statNumbers.length) return;
        
        // Create Intersection Observer for stats
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const targetValue = parseFloat(element.getAttribute('data-count'));
                    
                    if (!isNaN(targetValue)) {
                        animateStat(element, targetValue);
                        statsObserver.unobserve(element);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe all stat elements
        statNumbers.forEach(element => {
            // Store original text
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', element.textContent);
            }
            
            // Reset to 0 for animation
            element.textContent = '0';
            
            statsObserver.observe(element);
        });
        
        function animateStat(element, targetValue) {
            const duration = 1500;
            const startTime = performance.now();
            const startValue = 0;
            const currentText = element.getAttribute('data-original') || element.textContent;
            const suffix = currentText.replace(/[0-9.-]/g, '');
            const isFloat = targetValue % 1 !== 0;
            
            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easing function for smoother animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
                
                // Format number based on type
                let formattedValue;
                if (isFloat) {
                    formattedValue = currentValue.toFixed(1) + suffix;
                } else {
                    formattedValue = Math.round(currentValue) + suffix;
                }
                
                element.textContent = formattedValue;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Ensure final value is exact
                    let finalValue;
                    if (isFloat) {
                        finalValue = targetValue.toFixed(1) + suffix;
                    } else {
                        finalValue = Math.round(targetValue) + suffix;
                    }
                    
                    element.textContent = finalValue;
                    element.classList.add('agency-stat-animated');
                }
            }
            
            requestAnimationFrame(step);
        }
    }

    /**
     * TIMELINE ANIMATION
     * Animate timeline items on scroll
     */
    function initTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.agency-timeline-item');
        
        if (!timelineItems.length) return;
        
        // Create Intersection Observer for timeline
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    
                    // Add animation class with staggered delay
                    setTimeout(() => {
                        item.classList.add('agency-timeline-item--animated');
                    }, parseInt(item.getAttribute('data-delay') || 0));
                    
                    timelineObserver.unobserve(item);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        // Observe all timeline items with staggered delay
        timelineItems.forEach((item, index) => {
            item.setAttribute('data-delay', index * 150);
            timelineObserver.observe(item);
        });
    }

    /**
     * TEAM CARDS INTERACTION
     * Enhanced team card interactions
     */
    function initTeamCards() {
        const teamCards = document.querySelectorAll('.agency-team-card');
        
        if (!teamCards.length) return;
        
        teamCards.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
            
            // Focus styles for accessibility
            card.addEventListener('focus', () => {
                card.style.outline = '2px solid var(--color-primary)';
                card.style.outlineOffset = '4px';
            });
            
            card.addEventListener('blur', () => {
                card.style.outline = '';
            });
        });
    }

    /**
     * CULTURE CARDS INTERACTION
     * Enhanced culture card interactions
     */
    function initCultureCards() {
        const cultureCards = document.querySelectorAll('.agency-culture-card');
        
        if (!cultureCards.length) return;
        
        cultureCards.forEach(card => {
            // Add click effect for mobile
            card.addEventListener('click', function(e) {
                if (window.innerWidth < 992) {
                    e.preventDefault();
                    this.classList.toggle('agency-culture-card--expanded');
                }
            });
            
            // Focus styles for accessibility
            card.addEventListener('focus', () => {
                card.style.outline = '2px solid var(--color-primary)';
                card.style.outlineOffset = '4px';
            });
            
            card.addEventListener('blur', () => {
                card.style.outline = '';
            });
        });
    }

    /**
     * SMOOTH SCROLLING
     * Custom smooth scrolling for about page
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
        console.error('About page error caught:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('About page unhandled promise rejection:', e.reason);
    });
    
    /**
     * EXPOSE PUBLIC API
     */
    window.ZASDigitalAbout = {
        initAboutStats,
        initTimelineAnimation,
        initTeamCards,
        throttle,
        debounce
    };

})();