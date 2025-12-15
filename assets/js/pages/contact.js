/**
 * ZAS Digital - Contact Page
 * Contact page specific functionality
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { Forms } from '../modules/forms.js';
import { Navigation } from '../modules/navigation.js';
import { EventBus } from '../core/events.js';

export const ContactPage = (function() {
    'use strict';
    
    /**
     * Initialize contact page
     */
    function init() {
        // Fix header overlap first
        Navigation.fixHeaderOverlap();
        
        // Initialize forms (file upload, etc.)
        Forms.init();
        
        // Initialize contact methods
        initContactMethods();
        
        // Initialize timeline slider (already in forms module)
        initTimelineSlider();
        
        console.log('Contact page initialized');
        
        // Emit ready event
        EventBus.emit('contactPageReady');
    }
    
    /**
     * Initialize contact methods interaction
     */
    function initContactMethods() {
        const contactMethods = Utils.getElements('.agency-contact-method');
        if (!contactMethods.length) return;
        
        contactMethods.forEach(method => {
            method.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            method.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            // Focus styles
            method.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--color-primary)';
                this.style.outlineOffset = '4px';
            });
            
            method.addEventListener('blur', function() {
                this.style.outline = '';
            });
        });
    }
    
    /**
     * Initialize timeline slider enhancements
     */
    function initTimelineSlider() {
        const timelineSlider = Utils.getElement('#timeline');
        if (!timelineSlider) return;
        
        // Already initialized in forms module, just ensure it's styled
        const value = (timelineSlider.value - timelineSlider.min) / (timelineSlider.max - timelineSlider.min) * 100;
        timelineSlider.style.background = `linear-gradient(to right, 
            var(--color-primary) 0%, 
            var(--color-primary) ${value}%, 
            var(--color-border) ${value}%, 
            var(--color-border) 100%)`;
    }
    
    return {
        init,
        initContactMethods
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactPage;
}

// Make available globally
window.ZASContactPage = ContactPage;