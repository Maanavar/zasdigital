/**
 * ZAS Digital - Services JavaScript
 * Production-ready vanilla JS for services pages
 * Version: 1.0.0 - 2025 Modern Edition
 */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize service page modules
        initFaqAccordion();
        initServiceAnimations();
        initTechStackHover();
        initProcessScroll();
        initDeviceMockupParallax();
        initSEOCharts(); // Added SEO charts initialization
        initSEOHeroAnimations(); // Added SEO hero animations
    });
    
    /**
     * FAQ ACCORDION MODULE
     * Handles FAQ accordion functionality with accessibility
     */
    function initFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.agency-faq__question');
        
        if (!faqQuestions.length) return;
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Close all other FAQ items
                faqQuestions.forEach(q => {
                    if (q !== this) {
                        q.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current FAQ item
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Update screen reader text
                const answerId = this.getAttribute('aria-controls');
                const answer = document.getElementById(answerId);
                
                if (answer) {
                    if (!isExpanded) {
                        // Focus the answer for screen readers
                        answer.setAttribute('tabindex', '-1');
                        answer.focus({ preventScroll: true });
                        
                        // Remove tabindex after blur
                        answer.addEventListener('blur', function() {
                            this.removeAttribute('tabindex');
                        }, { once: true });
                    }
                }
            });
            
            // Handle keyboard navigation
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    /**
     * SERVICE ANIMATIONS MODULE
     * Handles service-specific animations
     */
    function initServiceAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;
        
        // Animate service cards on scroll
        const serviceCards = document.querySelectorAll('.agency-service-detail-card, .agency-approach-card, .agency-seo-service, .agency-growth-service');
        
        if (serviceCards.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = entry.target.dataset.animationDelay || '0s';
                        entry.target.classList.add('agency-fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            serviceCards.forEach((card, index) => {
                card.dataset.animationDelay = `${index * 100}ms`;
                observer.observe(card);
            });
        }
    }
    
    /**
     * TECH STACK HOVER MODULE
     * Enhanced hover effects for technology stack items
     */
    function initTechStackHover() {
        const techItems = document.querySelectorAll('.agency-tech-stack__item, .agency-seo-tools__item');
        
        if (!techItems.length) return;
        
        // Check for touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // Handle touch devices
            techItems.forEach(item => {
                item.addEventListener('touchstart', function() {
                    this.classList.add('agency-tech-stack__item--active');
                });
                
                item.addEventListener('touchend', function() {
                    setTimeout(() => {
                        this.classList.remove('agency-tech-stack__item--active');
                    }, 150);
                });
            });
        }
    }
    
    /**
     * PROCESS SCROLL MODULE
     * Enhanced process timeline scroll animations
     */
    function initProcessScroll() {
        const processItems = document.querySelectorAll('.agency-process-timeline__item, .agency-seo-process__step');
        
        if (!processItems.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const phaseNumber = item.querySelector('.agency-process-timeline__phase-number, .agency-seo-process__step-number');
                        
                        // Animate phase number
                        if (phaseNumber) {
                            phaseNumber.style.animation = 'pulse 1s ease-in-out';
                            setTimeout(() => {
                                phaseNumber.style.animation = '';
                            }, 1000);
                        }
                        
                        // Add visible class for CSS animations
                        item.classList.add('agency-process-timeline__item--visible');
                        observer.unobserve(item);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '0px 0px -150px 0px'
            });
            
            processItems.forEach(item => {
                observer.observe(item);
            });
        }
    }
    
    /**
     * DEVICE MOCKUP PARALLAX MODULE
     * Subtle parallax effect for device mockups
     */
    function initDeviceMockupParallax() {
        const deviceMockups = document.querySelectorAll('.agency-hero__device-mockup');
        
        if (!deviceMockups.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;
        
        let ticking = false;
        
        function updateParallax() {
            const scrollY = window.pageYOffset;
            const heroHeight = document.querySelector('.agency-hero--service')?.offsetHeight || 600;
            const scrollPercentage = Math.min(scrollY / heroHeight, 1);
            
            deviceMockups.forEach((mockup, index) => {
                const baseRotation = index === 0 ? -15 : 15;
                const parallaxOffset = scrollPercentage * 5;
                const rotation = baseRotation + (index === 0 ? parallaxOffset : -parallaxOffset);
                
                mockup.style.transform = mockup.style.transform.replace(/rotateY\([^)]+\)/, `rotateY(${rotation}deg)`);
            });
            
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateParallax);
            }
        }
        
        // Only add parallax on larger screens
        if (window.innerWidth > 768) {
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        
        // Update on resize
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                window.removeEventListener('scroll', onScroll);
            } else {
                window.addEventListener('scroll', onScroll, { passive: true });
            }
        });
    }
    
    /**
     * SEO CHARTS MODULE
     * Animated charts for SEO results section
     */
    function initSEOCharts() {
        const chartBars = document.querySelectorAll('.agency-seo-results__chart-fill');
        
        if (!chartBars.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Set static heights for reduced motion
            chartBars.forEach(bar => {
                const parentBar = bar.closest('.agency-seo-results__chart-bar');
                const percentage = parentBar.dataset.percentage;
                if (percentage) {
                    bar.style.height = `${percentage}%`;
                }
            });
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const parentBar = bar.closest('.agency-seo-results__chart-bar');
                    const percentage = parentBar.dataset.percentage;
                    
                    if (percentage) {
                        setTimeout(() => {
                            bar.style.height = `${percentage}%`;
                        }, 300);
                    }
                    
                    observer.unobserve(bar);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        chartBars.forEach(bar => {
            observer.observe(bar);
        });
    }
    
    /**
     * SEO HERO ANIMATIONS
     * Animations for SEO hero section elements
     */
    function initSEOHeroAnimations() {
        const chartPoints = document.querySelectorAll('.agency-hero__chart-point');
        
        if (!chartPoints.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;
        
        // Stagger animation delays for chart points
        chartPoints.forEach((point, index) => {
            point.style.animationDelay = `${index * 0.2}s`;
        });
        
        // Animate metric badges
        const metricBadges = document.querySelectorAll('.agency-hero__metric-badge');
        metricBadges.forEach((badge, index) => {
            badge.style.animationDelay = `${index * 0.3}s`;
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
     * EXPOSE PUBLIC API
     */
    window.ZASServices = {
        initFaqAccordion,
        initServiceAnimations,
        initTechStackHover,
        initProcessScroll,
        initDeviceMockupParallax,
        initSEOCharts,
        initSEOHeroAnimations,
        throttle,
        debounce
    };
    
})();