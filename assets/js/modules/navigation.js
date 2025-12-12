/**
 * ZAS Digital - Navigation Module
 * Handles header, mobile menu, and navigation
 * Version: 2.0.1
 */

import { Utils } from '../core/utils.js';
import { EventBus } from '../core/events.js';
import { ErrorHandler } from '../core/error-handler.js';

export const Navigation = (function() {
    'use strict';
    
    let isInitialized = false;
    let headerHeight = 0;
    let resizeTimeout = null;
    let scrollTimeout = null;
    const RESIZE_DELAY = 150;
    const SCROLL_DELAY = 100;
    
    /**
     * Initialize navigation
     */
    function init() {
        if (isInitialized) return;
        
        ErrorHandler.safeExecute(initMobileMenu);
        ErrorHandler.safeExecute(initHeaderHeight);
        ErrorHandler.safeExecute(initScrollHeader);
        ErrorHandler.safeExecute(updateActiveNavLink);
        
        isInitialized = true;
        
        // Emit ready event
        EventBus.emit('navigationReady');
        
        console.log('Navigation module initialized');
    }
    
    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const menuToggle = Utils.getElement('#menuToggle');
        const mainMenu = Utils.getElement('#mainMenu');
        
        if (!menuToggle || !mainMenu) return;
        
        // Mobile menu toggle
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu
            Utils.toggleClass(mainMenu, 'agency-nav__menu--open');
            Utils.toggleClass(this, 'agency-nav__toggle--open');
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle body scroll
            if (mainMenu.classList.contains('agency-nav__menu--open')) {
                document.body.style.overflow = 'hidden';
                menuToggle.setAttribute('aria-label', 'Close mobile menu');
                
                // Focus first link
                setTimeout(() => {
                    const firstLink = mainMenu.querySelector('.agency-nav__link');
                    if (firstLink) firstLink.focus();
                }, 100);
            } else {
                document.body.style.overflow = '';
                menuToggle.setAttribute('aria-label', 'Open mobile menu');
                closeAllDropdowns();
            }
        });
        
        // Handle dropdowns
        const navLinks = Utils.getElements('.agency-nav__link');
        navLinks.forEach(link => {
            const dropdown = link.nextElementSibling;
            
            if (dropdown && dropdown.classList.contains('agency-nav__dropdown')) {
                link.setAttribute('aria-haspopup', 'true');
                link.setAttribute('aria-expanded', 'false');
                
                link.addEventListener('click', function(e) {
                    if (window.innerWidth < 992) {
                        e.preventDefault();
                        const isOpen = dropdown.classList.contains('agency-nav__dropdown--open');
                        
                        // Close other dropdowns
                        Utils.getElements('.agency-nav__dropdown--open').forEach(d => {
                            if (d !== dropdown) {
                                Utils.removeClass(d, 'agency-nav__dropdown--open');
                                d.previousElementSibling?.setAttribute('aria-expanded', 'false');
                            }
                        });
                        
                        // Toggle this dropdown
                        Utils.toggleClass(dropdown, 'agency-nav__dropdown--open');
                        this.setAttribute('aria-expanded', dropdown.classList.contains('agency-nav__dropdown--open'));
                    }
                });
                
                // Desktop hover
                if (window.innerWidth >= 992) {
                    link.addEventListener('mouseenter', () => {
                        Utils.addClass(dropdown, 'agency-nav__dropdown--open');
                        link.setAttribute('aria-expanded', 'true');
                    });
                    
                    link.addEventListener('mouseleave', () => {
                        setTimeout(() => {
                            if (!dropdown.matches(':hover')) {
                                Utils.removeClass(dropdown, 'agency-nav__dropdown--open');
                                link.setAttribute('aria-expanded', 'false');
                            }
                        }, 100);
                    });
                    
                    dropdown.addEventListener('mouseleave', () => {
                        Utils.removeClass(dropdown, 'agency-nav__dropdown--open');
                        link.setAttribute('aria-expanded', 'false');
                    });
                }
            } else {
                // Regular links - close menu on mobile
                link.addEventListener('click', function() {
                    if (window.innerWidth < 992 && mainMenu.classList.contains('agency-nav__menu--open')) {
                        closeMobileMenu();
                    }
                });
            }
        });
        
        // Close menu on outside click (mobile)
        document.addEventListener('click', function(event) {
            if (window.innerWidth < 992 && 
                !mainMenu.contains(event.target) && 
                !menuToggle.contains(event.target) &&
                mainMenu.classList.contains('agency-nav__menu--open')) {
                closeMobileMenu();
            }
        });
        
        // Close on Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                if (mainMenu.classList.contains('agency-nav__menu--open')) {
                    closeMobileMenu();
                } else {
                    closeAllDropdowns();
                }
            }
        });
        
        // Handle resize
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth >= 992) {
                    closeMobileMenu();
                }
            }, RESIZE_DELAY);
        });
        
        function closeMobileMenu() {
            Utils.removeClass(mainMenu, 'agency-nav__menu--open');
            Utils.removeClass(menuToggle, 'agency-nav__toggle--open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open mobile menu');
            document.body.style.overflow = '';
            closeAllDropdowns();
            
            // Return focus to toggle button
            menuToggle.focus();
        }
        
        function closeAllDropdowns() {
            Utils.getElements('.agency-nav__dropdown--open').forEach(dropdown => {
                Utils.removeClass(dropdown, 'agency-nav__dropdown--open');
                dropdown.previousElementSibling?.setAttribute('aria-expanded', 'false');
            });
        }
    }
    
    /**
     * Initialize and manage header height
     */
    function initHeaderHeight() {
        const header = Utils.getElement('.agency-header');
        if (!header) return;
        
        function updateHeaderHeight() {
            const headerRect = header.getBoundingClientRect();
            headerHeight = headerRect.height;
            
            // Calculate scrolled height
            const scrolledHeight = Math.max(72, headerHeight - 16);
            
            // Set CSS variables
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            document.documentElement.style.setProperty('--header-height-scrolled', `${scrolledHeight}px`);
            
            // Update hero padding if exists
            const hero = Utils.getElement('.agency-hero');
            if (hero) {
                hero.style.paddingTop = `${headerHeight}px`;
                hero.style.scrollMarginTop = `${headerHeight}px`;
            }
            
            // Update scroll padding
            document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
            
            // Update any elements with data-header-offset
            Utils.getElements('[data-header-offset]').forEach(element => {
                element.style.marginTop = `${headerHeight}px`;
            });
        }
        
        // Initial calculation
        updateHeaderHeight();
        
        // Update on resize (debounced)
        window.addEventListener('resize', Utils.throttle(updateHeaderHeight, RESIZE_DELAY));
        
        // Update after fonts load
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setTimeout(updateHeaderHeight, 100);
            });
        }
        
        // Update on load
        window.addEventListener('load', () => {
            setTimeout(updateHeaderHeight, 50);
        });
        
        // Store function for external use
        window.updateHeaderHeight = updateHeaderHeight;
    }
    
    /**
     * Handle scroll effects on header
     */
    function initScrollHeader() {
        const header = Utils.getElement('#mainHeader');
        if (!header) return;
        
        let lastScrollTop = 0;
        const scrollThreshold = 20;
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > scrollThreshold) {
                Utils.addClass(header, 'is-scrolled');
            } else {
                Utils.removeClass(header, 'is-scrolled');
            }
            
            lastScrollTop = scrollTop;
        }
        
        // Throttle scroll events
        const throttledScroll = Utils.throttle(handleScroll, SCROLL_DELAY);
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Initial check
        handleScroll();
    }
    
    /**
     * Update active navigation link
     */
    function updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const navLinks = Utils.getElements('.agency-nav__link');
        
        let foundActive = false;
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // Remove active class
            Utils.removeClass(link, 'agency-nav__link--active');
            link.removeAttribute('aria-current');
            
            // Check if active (exact match)
            if (currentPath === linkHref || 
                (linkHref === currentHash && currentHash) ||
                (linkHref === '/' && currentPath === '/')) {
                Utils.addClass(link, 'agency-nav__link--active');
                link.setAttribute('aria-current', 'page');
                foundActive = true;
            }
        });
        
        // If no exact match found, check for partial matches
        if (!foundActive) {
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref && linkHref !== '/' && currentPath.includes(linkHref.replace(/\.html$/, ''))) {
                    Utils.addClass(link, 'agency-nav__link--active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
    }
    
    /**
     * Fix header overlap issues
     */
    function fixHeaderOverlap() {
        const header = Utils.getElement('#mainHeader');
        const hero = Utils.getElement('.agency-hero');
        
        if (!header || !hero) return;
        
        // Ensure proper z-index
        header.style.zIndex = '1000';
        hero.style.zIndex = '1';
        
        function updateHeroPadding() {
            const headerHeight = header.offsetHeight;
            const isScrolled = header.classList.contains('is-scrolled');
            const scrolledHeight = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--header-height-scrolled')) || 72;
            
            if (isScrolled) {
                hero.style.paddingTop = scrolledHeight + 'px';
            } else {
                hero.style.paddingTop = headerHeight + 'px';
            }
        }
        
        // Initial update
        updateHeroPadding();
        
        // Update on scroll
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateHeroPadding, SCROLL_DELAY);
        });
        
        // Update on resize
        window.addEventListener('resize', updateHeroPadding);
    }
    
    /**
     * Smooth scroll to section with header offset
     */
    function scrollToSection(selector) {
        const element = Utils.getElement(selector);
        if (!element) return;
        
        const header = Utils.getElement('#mainHeader');
        const offset = header ? header.offsetHeight + 20 : 100;
        
        Utils.smoothScroll(element, { offset: offset });
    }
    
    /**
     * Cleanup method
     */
    function cleanup() {
        // Clear timeouts
        clearTimeout(resizeTimeout);
        clearTimeout(scrollTimeout);
        
        // Reset state
        isInitialized = false;
        headerHeight = 0;
        resizeTimeout = null;
        scrollTimeout = null;
        
        // Remove global function
        delete window.updateHeaderHeight;
    }
    
    return {
        init,
        initMobileMenu,
        initHeaderHeight,
        initScrollHeader,
        updateActiveNavLink,
        fixHeaderOverlap,
        scrollToSection,
        cleanup,
        getHeaderHeight: () => headerHeight
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}

// Make available globally
window.ZASNavigation = Navigation;