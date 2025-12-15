/**
 * ZAS Digital - About Page
 * About page specific functionality
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { Observers } from '../core/observers.js';
import { EventBus } from '../core/events.js';
import { DataLoader } from '../core/data-loader.js';

export const AboutPage = (function() {
    'use strict';
    
    /**
     * Initialize about page
     */
    function init() {
        initAboutStats();
        initTimelineAnimation();
        initTeamCards();
        initCultureCards();
        
        console.log('About page initialized');
    }
    
    /**
     * Initialize about stats animation
     */
    function initAboutStats() {
        const statNumbers = Utils.getElements('.agency-hero__stat-number, .agency-team-stats__number');
        if (!statNumbers.length) return;
        
        statNumbers.forEach(element => {
            // Store original
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', element.textContent);
            }
            
            // Reset for animation
            element.textContent = '0';
            
            // Observe element
            Observers.observeElement(element, 'counters', {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            });
            
            // Animate when visible
            element.addEventListener('elementVisible', () => {
                animateStat(element);
            });
        });
    }
    
    /**
     * Animate stat counter
     */
    function animateStat(element) {
        const targetValue = parseFloat(element.getAttribute('data-count'));
        if (isNaN(targetValue)) return;
        
        const currentText = element.getAttribute('data-original') || element.textContent;
        const suffix = currentText.replace(/[0-9.-]/g, '');
        const isFloat = targetValue % 1 !== 0;
        
        const duration = 1500;
        const startTime = performance.now();
        const startValue = 0;
        
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
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
                let finalValue;
                if (isFloat) {
                    finalValue = targetValue.toFixed(1) + suffix;
                } else {
                    finalValue = Math.round(targetValue) + suffix;
                }
                
                element.textContent = finalValue;
                Utils.addClass(element, 'agency-stat-animated');
            }
        }
        
        requestAnimationFrame(step);
    }
    
    /**
     * Timeline animation
     */
    function initTimelineAnimation() {
        const timelineItems = Utils.getElements('.agency-timeline-item');
        if (!timelineItems.length) return;
        
        timelineItems.forEach((item, index) => {
            item.setAttribute('data-delay', index * 150);
            
            Observers.observeElement(item, 'fade-in', {
                threshold: 0.2,
                rootMargin: '-100px 0px -100px 0px'
            });
            
            item.addEventListener('elementVisible', () => {
                const delay = parseInt(item.getAttribute('data-delay') || 0);
                setTimeout(() => {
                    Utils.addClass(item, 'agency-timeline-item--animated');
                }, delay);
            });
        });
    }
    
    /**
     * Team cards interaction
     */
    function initTeamCards() {
        const teamCards = Utils.getElements('.agency-team-card');
        if (!teamCards.length) return;
        
        teamCards.forEach(card => {
            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
            
            // Focus styles
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
     * Culture cards interaction
     */
    function initCultureCards() {
        const cultureCards = Utils.getElements('.agency-culture-card');
        if (!cultureCards.length) return;
        
        cultureCards.forEach(card => {
            // Mobile click to expand
            card.addEventListener('click', function(e) {
                if (window.innerWidth < 992) {
                    e.preventDefault();
                    Utils.toggleClass(this, 'agency-culture-card--expanded');
                }
            });
            
            // Focus styles
            card.addEventListener('focus', () => {
                card.style.outline = '2px solid var(--color-primary)';
                card.style.outlineOffset = '4px';
            });
            
            card.addEventListener('blur', () => {
                card.style.outline = '';
            });
        });
    }
    
    return {
        init,
        initAboutStats,
        initTimelineAnimation,
        initTeamCards,
        initCultureCards
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AboutPage;
}

// Make available globally
window.ZASAboutPage = AboutPage;