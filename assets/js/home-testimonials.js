/**
 * ZAS Digital - Home Testimonials Loader
 * Loads and displays random testimonials on homepage
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Wait for DOM and data to be ready
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('homeTestimonialsSlider');
        if (!container) return;
        
        document.addEventListener('zas:dataLoaded', handleDataLoaded);
        
        setTimeout(() => {
            if (window.ZASData && ZASData.isLoaded) {
                handleDataLoaded();
            } else if (ZASData && !ZASData.isLoading) {
                ZASData.loadAllData();
            }
        }, 100);
    });
    
    function handleDataLoaded() {
        if (!window.ZASData || !ZASData.isLoaded) {
            showErrorMessage();
            return;
        }
        
        renderRandomTestimonials();
    }
    
    function renderRandomTestimonials() {
        const container = document.getElementById('homeTestimonialsSlider');
        const count = parseInt(container.getAttribute('data-random')) || 3;
        const allTestimonials = ZASData.getTestimonials();
        
        if (allTestimonials.length === 0) {
            showNoTestimonialsMessage();
            return;
        }
        
        const randomTestimonials = getRandomItems(allTestimonials, Math.min(count, allTestimonials.length));
        
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) loadingElement.remove();
        
        const testimonialsHTML = randomTestimonials.map((testimonial, index) => 
            createTestimonialSlideHTML(testimonial, index)
        ).join('');
        
        const dotsHTML = randomTestimonials.map((_, index) => 
            `<button class="agency-testimonial-slider__dot ${index === 0 ? 'agency-testimonial-slider__dot--active' : ''}" 
                     aria-label="Go to testimonial ${index + 1}" 
                     aria-selected="${index === 0}"></button>`
        ).join('');
        
        container.innerHTML = `
            <div class="agency-testimonial-slider__live" id="testimonialLive" aria-live="polite" aria-atomic="true">
                Testimonial 1 of ${randomTestimonials.length}
            </div>
            
            <div class="agency-testimonial-slider__track" id="testimonialTrack">
                ${testimonialsHTML}
            </div>
            
            <div class="agency-testimonial-slider__controls">
                <button class="agency-testimonial-slider__prev" id="testimonialPrev" aria-label="Previous testimonial">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 1L1 8L15 15"/>
                    </svg>
                </button>
                <div class="agency-testimonial-slider__dots" id="testimonialDots">
                    ${dotsHTML}
                </div>
                <button class="agency-testimonial-slider__next" id="testimonialNext" aria-label="Next testimonial">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 1L15 8L1 15"/>
                    </svg>
                </button>
            </div>
        `;
        
        setTimeout(() => {
            if (typeof window.initTestimonialSlider === 'function') {
                window.initTestimonialSlider();
            }
        }, 100);
    }
    
    function createTestimonialSlideHTML(testimonial, index) {
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
                            <div class="agency-testimonial__avatar-placeholder">${testimonial.avatar || getInitials(testimonial.name)}</div>
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
    }
    
    function getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    function showErrorMessage() {
        const container = document.getElementById('homeTestimonialsSlider');
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="agency-data-error">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p class="mt-2">Unable to load testimonials. Please refresh the page.</p>
                </div>
            `;
        }
    }
    
    function showNoTestimonialsMessage() {
        const container = document.getElementById('homeTestimonialsSlider');
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
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
    }
    
})();