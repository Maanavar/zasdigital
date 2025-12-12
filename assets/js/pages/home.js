/**
 * ZAS Digital - Home Page
 * Homepage specific functionality
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { DataLoader } from '../core/data-loader.js';
import { EventBus } from '../core/events.js';
import { Observers } from '../core/observers.js';

export const HomePage = (function() {
    'use strict';
    
    /**
     * Initialize home page
     */
    function init() {
        initHomeProjects();
        initHomeTestimonials();
        initHomeAnimations();
        
        console.log('Home page initialized');
    }
    
    /**
     * Initialize home projects
     */
    function initHomeProjects() {
        const container = Utils.getElement('#homeProjectsGrid');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = `
            <div class="agency-loading">
                <div class="agency-loading__spinner"></div>
                <p>Loading featured projects...</p>
            </div>
        `;
        
        // Listen for data
        EventBus.once('dataLoaded', renderHomeProjects);
        
        // Load data if not already loading
        if (!DataLoader.isLoaded && !DataLoader.isLoading) {
            DataLoader.loadAllData();
        }
    }
    
    /**
     * Render home projects
     */
    function renderHomeProjects() {
        const container = Utils.getElement('#homeProjectsGrid');
        if (!container) return;
        
        // Get number of projects to show
        const count = parseInt(container.getAttribute('data-random')) || 3;
        
        // Get random featured projects
        const projects = DataLoader.getRandomProjects(count);
        
        if (projects.length === 0) {
            container.innerHTML = createNoProjectsMessage();
            return;
        }
        
        // Clear loading
        container.innerHTML = '';
        
        // Render projects
        projects.forEach((project, index) => {
            const html = createHomeProjectHTML(project, index);
            container.innerHTML += html;
        });
        
        // Add animations
        setTimeout(() => {
            Utils.getElements('.agency-case-study-card', container).forEach((card, i) => {
                card.style.animationDelay = `${i * 100}ms`;
                Utils.addClass(card, 'agency-fade-in');
            });
        }, 100);
        
        // Emit event
        EventBus.emit('homeProjectsRendered', { count: projects.length });
    }
    
    /**
     * Create home project HTML
     */
    function createHomeProjectHTML(project, index) {
        const delay = index * 100;
        
        // Get metrics
        let metricsHTML = '';
        if (project.metrics && Object.keys(project.metrics).length > 0) {
            const metrics = Object.entries(project.metrics).slice(0, 2);
            metricsHTML = metrics.map(([key, value]) => {
                return `
                    <div class="agency-case-study-card__result">
                        <span class="agency-case-study-card__result-value" data-count="${value}">${value}</span>
                        <span class="agency-case-study-card__result-label">${formatMetricLabel(key)}</span>
                    </div>
                `;
            }).join('');
        }
        
        return `
            <div class="col-lg-4">
                <div class="agency-case-study-card agency-fade-in" style="animation-delay: ${delay}ms">
                    <div class="agency-case-study-card__image">
                        <div class="agency-case-study-card__placeholder">
                            <div class="agency-case-study-card__placeholder-text">${project.name}</div>
                        </div>
                    </div>
                    <div class="agency-case-study-card__content">
                        <span class="agency-case-study-card__category">${getCategoryLabel(project.category)}</span>
                        <h3 class="agency-case-study-card__title">${project.name}</h3>
                        <p class="agency-case-study-card__description">${project.description}</p>
                        ${metricsHTML ? `
                        <div class="agency-case-study-card__results">
                            ${metricsHTML}
                        </div>
                        ` : ''}
                        <a href="${project.link || '/case-studies.html'}" class="agency-case-study-card__link">
                            View case study
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 8H15M8 1L15 8L8 15"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize home testimonials
     */
function initHomeTestimonials() {
    const sliderContainer = Utils.getElement('#homeTestimonialsSlider');
    if (!sliderContainer) return;
    
    // Show loading state
    sliderContainer.innerHTML = `
        <div class="agency-loading">
            <div class="agency-loading__spinner"></div>
            <p>Loading testimonials...</p>
        </div>
    `;
    
    // Check if data is already loaded
    if (DataLoader.isLoaded) {
        renderHomeTestimonials();
        return;
    }
    
    // Listen for data using the correct event
    const onDataLoaded = () => {
        renderHomeTestimonials();
    };
    
    // Listen for data loaded events
    if (window.ZASEvents) {
        ZASEvents.once('dataLoaded', onDataLoaded);
    } else {
        document.addEventListener('zas:dataLoaded', onDataLoaded, { once: true });
    }
    
    // Load data if needed
    if (!DataLoader.isLoading) {
        DataLoader.loadAllData();
    }
}
    
   /**
 * Render home testimonials
 */
    function renderHomeTestimonials() {
        const sliderContainer = Utils.getElement('#homeTestimonialsSlider');
        if (!sliderContainer) return;
        
        const testimonials = DataLoader.getTestimonials({ limit: 5 });
        
        if (testimonials.length === 0) {
            sliderContainer.innerHTML = createNoTestimonialsMessage();
            return;
        }
        
        // Create the full slider HTML structure
        const slidesHTML = testimonials.map((testimonial, index) => {
            const isActive = index === 0 ? 'data-active="true"' : '';
            const ratingStars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
            
            return `
                <div class="agency-testimonial-slider__slide" ${isActive}>
                    <div class="agency-testimonial">
                        <div class="agency-testimonial__content">
                            <p class="agency-testimonial__quote">"${testimonial.quote}"</p>
                            <div class="agency-testimonial__rating" aria-label="Rating: ${testimonial.rating} out of 5 stars">
                                ${ratingStars}
                            </div>
                        </div>
                        <div class="agency-testimonial__author">
                            <div class="agency-testimonial__avatar">
                                <div class="agency-testimonial__avatar-placeholder">${testimonial.avatar || Utils.getInitials(testimonial.name)}</div>
                            </div>
                            <div class="agency-testimonial__info">
                                <h4 class="agency-testimonial__name">${testimonial.name}</h4>
                                <p class="agency-testimonial__role">${testimonial.role}, ${testimonial.company}</p>
                                <div class="agency-testimonial__project">Project: ${testimonial.project}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update the slider container with full structure
        sliderContainer.innerHTML = `
            <div class="agency-testimonial-slider__track" id="testimonialTrack">
                ${slidesHTML}
            </div>
            ${testimonials.length > 1 ? `
                <div class="agency-testimonial-slider__controls">
                    <button class="agency-testimonial-slider__prev" id="testimonialPrev" aria-label="Previous testimonial">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 1L1 8L15 15"/>
                        </svg>
                    </button>
                    <div class="agency-testimonial-slider__dots" id="testimonialDots"></div>
                    <button class="agency-testimonial-slider__next" id="testimonialNext" aria-label="Next testimonial">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 1L15 8L1 15"/>
                        </svg>
                    </button>
                </div>
               
            ` : ''}
        `;
        
        // Initialize the slider AFTER the HTML is rendered
        setTimeout(() => {
            if (window.ZASSliders && typeof ZASSliders.initTestimonialSlider === 'function') {
                ZASSliders.initTestimonialSlider();
            } else if (window.Sliders && typeof Sliders.initTestimonialSlider === 'function') {
                Sliders.initTestimonialSlider();
            }
        }, 100);
    }
    
    /**
     * Initialize home animations
     */
    function initHomeAnimations() {
        // Parallax effects
        initParallaxEffects();
        
        // Stagger animations
        initStaggerAnimations();
    }
    
    /**
     * Parallax effects
     */
    function initParallaxEffects() {
        const deviceMockups = Utils.getElements('.agency-hero__device-mockup');
        if (!deviceMockups.length) return;
        
        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
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
     * Stagger animations
     */
    function initStaggerAnimations() {
        const staggerElements = Utils.getElements('.agency-hero__chart-point, .agency-hero__metric-badge');
        
        staggerElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }
    
    /**
     * Helper functions
     */
    function createNoProjectsMessage() {
        return `
            <div class="agency-no-projects">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 class="mt-3">No Featured Projects Available</h3>
                <p>Check back soon for our latest success stories.</p>
            </div>
        `;
    }
    
    function createNoTestimonialsMessage() {
        return `
            <div class="agency-no-testimonials">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 class="mt-3">No Testimonials Available</h3>
                <p>Check back soon for client success stories.</p>
            </div>
        `;
    }
    
    function formatMetricLabel(key) {
        const labels = {
            'users': 'Active Users',
            'uptime': 'Uptime',
            'salesIncrease': 'Sales Increase',
            'appRating': 'App Store Rating',
            'energySavings': 'Energy Savings',
            'pageSpeed': 'PageSpeed Score',
            'processingTime': 'Faster Processing',
            'accuracy': 'Accuracy',
            'pageViews': 'Monthly Views',
            'automation': 'Automation',
            'matches': 'Successful Matches'
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    function getCategoryLabel(category) {
        const labels = {
            'web-app': 'Web App Development',
            'mobile-app': 'Mobile App Development',
            'product-design': 'Product Design',
            'seo-growth': 'SEO & Growth'
        };
        return labels[category] || category;
    }
    
    return {
        init,
        renderHomeProjects,
        renderHomeTestimonials
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomePage;
}

// Make available globally
window.ZASHomePage = HomePage;