/**
 * ZAS Digital - Sliders Module
 * Handles all carousels and sliders
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { Observers } from '../core/observers.js';
import { EventBus } from '../core/events.js';

export const Sliders = (function() {
    'use strict';
    
    const sliders = new Map();
    
    /**
     * Initialize all sliders on page
     */
    function init() {
        initTestimonialSlider();
        initTimelineSlider();
        
        console.log('Sliders module initialized');
    }
    
    /**
     * Testimonial slider
     */
    function initTestimonialSlider() {
        const track = Utils.getElement('#testimonialTrack');
        const prevBtn = Utils.getElement('#testimonialPrev');
        const nextBtn = Utils.getElement('#testimonialNext');
        const dotsContainer = Utils.getElement('#testimonialDots');
        const liveRegion = Utils.getElement('#testimonialLive');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        const slides = Array.from(track.children);
        const slideCount = slides.length;
        
        // Don't initialize if no slides or only one slide
        if (slideCount <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        }
        
        let currentSlide = 0;
        let autoSlideInterval = null;
        const sliderId = Utils.generateId('testimonial-slider');
        
        // Create dots
        if (dotsContainer && slideCount > 1) {
            slides.forEach((slide, index) => {
                const dot = document.createElement('button');
                dot.className = 'agency-testimonial-slider__dot';
                dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
                dot.setAttribute('aria-selected', index === 0);
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }
        
        // Set initial ARIA attributes
        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== 0);
            slide.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        // Previous button
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            currentSlide = currentSlide === 0 ? slideCount - 1 : currentSlide - 1;
            updateSlider();
            startAutoSlide();
        });
        
        // Next button
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            currentSlide = currentSlide === slideCount - 1 ? 0 : currentSlide + 1;
            updateSlider();
            startAutoSlide();
        });
        
        // Update slider function
        function updateSlider() {
            // Move track with reduced motion support
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                track.style.transition = 'none';
            } else {
                track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update ARIA attributes
            slides.forEach((slide, index) => {
                const isActive = index === currentSlide;
                slide.setAttribute('aria-hidden', !isActive);
                slide.setAttribute('tabindex', isActive ? '0' : '-1');
                
                if (isActive) {
                    slide.setAttribute('data-active', 'true');
                } else {
                    slide.removeAttribute('data-active');
                }
            });
            
            // Update dots
            if (dotsContainer) {
                const dots = Array.from(dotsContainer.children);
                dots.forEach((dot, index) => {
                    const isActive = index === currentSlide;
                    Utils.toggleClass(dot, 'agency-testimonial-slider__dot--active', isActive);
                    dot.setAttribute('aria-selected', isActive);
                });
            }
            
            // Update live region
            if (liveRegion) {
                const quote = slides[currentSlide].querySelector('.agency-testimonial__quote');
                const name = slides[currentSlide].querySelector('.agency-testimonial__name');
                const text = quote ? quote.textContent.substring(0, 100) + '...' : '';
                const author = name ? name.textContent : '';
                
                liveRegion.textContent = `Testimonial ${currentSlide + 1} of ${slideCount}. ${text} By ${author}.`;
            }
        }
        
        function goToSlide(index) {
            stopAutoSlide();
            currentSlide = index;
            updateSlider();
            startAutoSlide();
        }
        
        function startAutoSlide() {
            if (slideCount <= 1) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                currentSlide = currentSlide === slideCount - 1 ? 0 : currentSlide + 1;
                updateSlider();
            }, 5000);
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }
        
        // Initialize slider
        updateSlider();
        startAutoSlide();
        
        // Pause on hover/focus
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);
        track.addEventListener('focusin', stopAutoSlide);
        track.addEventListener('focusout', () => {
            setTimeout(startAutoSlide, 3000);
        });
        
        // Store slider instance
        sliders.set(sliderId, {
            goToSlide,
            startAutoSlide,
            stopAutoSlide,
            updateSlider
        });
        
        // Emit event
        EventBus.emit('testimonialSliderReady', { sliderId });
    }
    
    /**
     * Timeline slider (contact page)
     */
    function initTimelineSlider() {
        const timelineSlider = Utils.getElement('#timeline');
        const timelineValue = Utils.getElement('#timelineValue');
        
        if (!timelineSlider || !timelineValue) return;
        
        // Update value display
        function updateTimelineValue() {
            const months = parseInt(timelineSlider.value);
            timelineValue.textContent = months === 12 ? '12+ Months' : `${months} Month${months > 1 ? 's' : ''}`;
            
            // Update gradient
            const value = (months - timelineSlider.min) / (timelineSlider.max - timelineSlider.min) * 100;
            timelineSlider.style.background = `linear-gradient(to right, 
                var(--color-primary) 0%, 
                var(--color-primary) ${value}%, 
                var(--color-border) ${value}%, 
                var(--color-border) 100%)`;
        }
        
        timelineSlider.addEventListener('input', updateTimelineValue);
        
        // Initialize
        updateTimelineValue();
    }
    
    /**
     * Create a custom slider
     */
    function createSlider(containerId, options = {}) {
        const container = Utils.getElement(containerId);
        if (!container) return null;
        
        const sliderId = Utils.generateId('custom-slider');
        const defaults = {
            autoPlay: true,
            interval: 5000,
            loop: true,
            showDots: true,
            showArrows: true
        };
        
        const config = { ...defaults, ...options };
        
        // Implementation would go here...
        
        return sliderId;
    }
    
    /**
     * Get slider by ID
     */
    function getSlider(sliderId) {
        return sliders.get(sliderId) || null;
    }
    
    /**
     * Destroy slider
     */
    function destroySlider(sliderId) {
        const slider = sliders.get(sliderId);
        if (slider) {
            slider.stopAutoSlide();
            sliders.delete(sliderId);
        }
    }
    
    return {
        init,
        initTestimonialSlider,
        initTimelineSlider,
        createSlider,
        getSlider,
        destroySlider
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sliders;
}

// Make available globally
window.ZASSliders = Sliders;