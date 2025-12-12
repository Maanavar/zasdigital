/**
 * ZAS Digital - Services Page
 * Services pages functionality
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { Observers } from '../core/observers.js';
import { EventBus } from '../core/events.js';

export const ServicesPage = (function() {
    'use strict';
    
    /**
     * Initialize services page
     */
    function init() {
        initServiceAnimations();
        initTechStackHover();
        initProcessScroll();
        initDeviceMockupParallax();
        initSEOCharts();
        initSEOHeroAnimations();
        
        console.log('Services page initialized');
    }
    
    
    
    /**
     * Service animations
     */
    function initServiceAnimations() {
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        // Animate service cards
        const serviceCards = Utils.getElements('.agency-service-detail-card, .agency-approach-card, .agency-seo-service, .agency-growth-service');
        if (!serviceCards.length) return;
        
        serviceCards.forEach((card, index) => {
            card.dataset.animationDelay = `${index * 100}ms`;
            
            Observers.observeElement(card, 'fade-in', {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            card.addEventListener('elementVisible', () => {
                card.style.animationDelay = card.dataset.animationDelay || '0s';
                Utils.addClass(card, 'agency-fade-in');
            });
        });
    }
    
    /**
     * Tech stack hover effects
     */
    function initTechStackHover() {
        const techItems = Utils.getElements('.agency-tech-stack__item, .agency-seo-tools__item');
        if (!techItems.length) return;
        
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            techItems.forEach(item => {
                item.addEventListener('touchstart', function() {
                    Utils.addClass(this, 'agency-tech-stack__item--active');
                });
                
                item.addEventListener('touchend', function() {
                    setTimeout(() => {
                        Utils.removeClass(this, 'agency-tech-stack__item--active');
                    }, 150);
                });
            });
        }
    }
    
    /**
     * Process scroll animations
     */
    function initProcessScroll() {
        const processItems = Utils.getElements('.agency-process-timeline__item, .agency-seo-process__step');
        if (!processItems.length) return;
        
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        processItems.forEach(item => {
            Observers.observeElement(item, 'process', {
                threshold: 0.3,
                rootMargin: '0px 0px -150px 0px'
            });
            
            item.addEventListener('elementVisible', () => {
                const phaseNumber = item.querySelector('.agency-process-timeline__phase-number, .agency-seo-process__step-number');
                
                if (phaseNumber) {
                    phaseNumber.style.animation = 'pulse 1s ease-in-out';
                    setTimeout(() => {
                        phaseNumber.style.animation = '';
                    }, 1000);
                }
                
                Utils.addClass(item, 'agency-process-timeline__item--visible');
            });
        });
    }
    
    /**
     * Device mockup parallax
     */
    function initDeviceMockupParallax() {
        const deviceMockups = Utils.getElements('.agency-hero__device-mockup');
        if (!deviceMockups.length) return;
        
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        let ticking = false;
        
        function updateParallax() {
            const scrollY = window.pageYOffset;
            const heroHeight = Utils.getElement('.agency-hero--service')?.offsetHeight || 600;
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
        
        // Only on larger screens
        if (window.innerWidth > 768) {
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        
        // Update on resize
        window.addEventListener('resize', Utils.throttle(function() {
            if (window.innerWidth <= 768) {
                window.removeEventListener('scroll', onScroll);
            } else {
                window.addEventListener('scroll', onScroll, { passive: true });
            }
        }, 250));
    }
    
    /**
     * SEO charts
     */
    function initSEOCharts() {
        const chartBars = Utils.getElements('.agency-seo-results__chart-fill');
        if (!chartBars.length) return;
        
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            chartBars.forEach(bar => {
                const parentBar = bar.closest('.agency-seo-results__chart-bar');
                const percentage = parentBar?.dataset.percentage;
                if (percentage) {
                    bar.style.height = `${percentage}%`;
                }
            });
            return;
        }
        
        chartBars.forEach(bar => {
            Observers.observeElement(bar, 'charts', {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            });
            
            bar.addEventListener('elementVisible', () => {
                const parentBar = bar.closest('.agency-seo-results__chart-bar');
                const percentage = parentBar?.dataset.percentage;
                
                if (percentage) {
                    setTimeout(() => {
                        bar.style.height = `${percentage}%`;
                    }, 300);
                }
            });
        });
    }
    
    /**
     * SEO hero animations
     */
    function initSEOHeroAnimations() {
        const chartPoints = Utils.getElements('.agency-hero__chart-point');
        if (!chartPoints.length) return;
        
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        // Stagger animations
        chartPoints.forEach((point, index) => {
            point.style.animationDelay = `${index * 0.2}s`;
        });
        
        const metricBadges = Utils.getElements('.agency-hero__metric-badge');
        metricBadges.forEach((badge, index) => {
            badge.style.animationDelay = `${index * 0.3}s`;
        });
    }
    
    return {
        init,
        initServiceAnimations,
        initTechStackHover,
        initProcessScroll,
        initDeviceMockupParallax,
        initSEOCharts,
        initSEOHeroAnimations
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServicesPage;
}

// Make available globally
window.ZASServicesPage = ServicesPage;