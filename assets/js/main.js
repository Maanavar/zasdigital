/**
 * ZAS Digital - Main Entry Point
 * Initializes all modules based on page needs
 * Version: 2.0.2
 */

import { Utils } from './core/utils.js';
import { EventBus } from './core/events.js';
import { ErrorHandler } from './core/error-handler.js';

// Import modules (in production, these would be bundled)
import { Navigation } from './modules/navigation.js';
import { Theme } from './modules/theme.js';
import { Forms } from './modules/forms.js';
import { Sliders } from './modules/sliders.js';
import { Counters } from './modules/counters.js';
import { FAQ } from './modules/faq.js'; // ← ADD THIS LINE

// Import page-specific modules
import { HomePage } from './pages/home.js';
import { AboutPage } from './pages/about.js';
import { ServicesPage } from './pages/services.js';
import { CaseStudiesPage } from './pages/case-studies.js';
import { ContactPage } from './pages/contact.js';
import { ServiceProjects } from './pages/service-projects.js';

(function() {
    'use strict';
    
    // Initialize error handling first
    ErrorHandler.init();
    
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Mark page as loaded
        document.body.classList.remove('js-loading');
        document.body.classList.add('js-loaded');
        document.documentElement.classList.add('js-loaded');
        
        // Get page type from body class or data attribute
        const pageType = getPageType();
        
        // Initialize core modules (always loaded)
        initializeCoreModules();
        
        // Initialize page-specific modules
        initializePageModules(pageType);
        
        // Update active nav link
        Navigation.updateActiveNavLink();
        
        // Emit ready event
        EventBus.emit('pageReady', { pageType });
        
        console.log(`ZAS Digital initialized for ${pageType} page`);
    });
    
    /**
     * Determine page type
     */
    function getPageType() {
        // Check body classes first
        const body = document.body;
        
        if (body.classList.contains('home-page')) return 'home';
        if (body.classList.contains('about-page')) return 'about';
        if (body.classList.contains('services-page')) return 'services';
        if (body.classList.contains('case-studies-page')) return 'case-studies';
        if (body.classList.contains('contact-page')) return 'contact';
        
        // Check data attribute
        const pageAttr = body.getAttribute('data-page');
        if (pageAttr) return pageAttr;
        
        // Check URL path
        const path = window.location.pathname;
        if (path.includes('about')) return 'about';
        if (path.includes('services')) return 'services';
        if (path.includes('case-studies')) return 'case-studies';
        if (path.includes('contact')) return 'contact';
        
        return 'home'; // Default
    }
    
    /**
     * Initialize core modules (always loaded)
     */
    function initializeCoreModules() {
        // Safe initialization with error handling
        ErrorHandler.safeExecute(Navigation.init);
        ErrorHandler.safeExecute(Theme.init);
        ErrorHandler.safeExecute(Utils.initSmoothScrolling);
        
        // Initialize counters if needed
        if (document.querySelector('[data-count]')) {
            ErrorHandler.safeExecute(Counters.init);
        }
        
        // Initialize forms if needed
        if (document.querySelector('form')) {
            ErrorHandler.safeExecute(Forms.init);
        }
        
        // Initialize FAQ if needed ← ADD THIS
        if (document.querySelector('.agency-faq, .agency-faq-item')) {
            ErrorHandler.safeExecute(FAQ.init);
        }
        
        // Note: Sliders are NOT initialized here
        // They are initialized by page modules after dynamic content is loaded
        // This prevents conflicts with dynamically loaded testimonials
    }
    
    /**
     * Initialize page-specific modules
     */
    function initializePageModules(pageType) {
        switch(pageType) {
            case 'home':
                ErrorHandler.safeExecute(HomePage.init);
                break;
                
            case 'about':
                ErrorHandler.safeExecute(AboutPage.init);
                break;
                
            case 'services':
                ErrorHandler.safeExecute(ServicesPage.init);
                // Check if service projects are needed
                if (document.querySelector('[data-needs-projects]')) {
                    ErrorHandler.safeExecute(ServiceProjects.init);
                }
                break;
                
            case 'case-studies':
                ErrorHandler.safeExecute(CaseStudiesPage.init);
                break;
                
            case 'contact':
                ErrorHandler.safeExecute(ContactPage.init);
                break;
        }
        
        // Check for dynamic content needs
        const needsDynamicContent = document.querySelector(
            '[data-needs-projects], [data-needs-team], [data-needs-testimonials]'
        );
        
        if (needsDynamicContent && window.ZASData) {
            // DataLoader will emit events when loaded
            // Page modules listen for these events
        }
    }
    
    /**
     * Global error boundary for public API
     */
    window.ZASDigital = {
        // Core modules
        utils: Utils,
        events: EventBus,
        navigation: Navigation,
        theme: Theme,
        forms: Forms,
        sliders: Sliders,
        counters: Counters,
        faq: FAQ, // ← ADD THIS
        
        // Page modules
        home: HomePage,
        about: AboutPage,
        services: ServicesPage,
        caseStudies: CaseStudiesPage,
        contact: ContactPage,
        serviceProjects: ServiceProjects,
        
        // Error tracking
        trackError: function(error) {
            ErrorHandler.logError({
                type: 'tracked',
                error: error,
                timestamp: new Date().toISOString()
            });
            
            // In production, send to analytics service
            if (process.env.NODE_ENV === 'production') {
                // Example: sendToAnalytics(error);
            }
        },
        
        // Cleanup method
        cleanup: function() {
            // Clean up page modules
            if (HomePage.cleanup) HomePage.cleanup();
            if (AboutPage.cleanup) AboutPage.cleanup();
            if (ServicesPage.cleanup) ServicesPage.cleanup();
            if (CaseStudiesPage.cleanup) CaseStudiesPage.cleanup();
            if (ContactPage.cleanup) ContactPage.cleanup();
            if (ServiceProjects.cleanup) ServiceProjects.cleanup();
            
            // Clear any intervals or timeouts
            EventBus.emit('cleanup');
        }
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (window.ZASDigital && window.ZASDigital.cleanup) {
            window.ZASDigital.cleanup();
        }
    });
    
})();