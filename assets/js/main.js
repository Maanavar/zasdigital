/**
 * ZAS Digital - Main JavaScript
 * Production-ready vanilla JS for premium tech agency website
 * Version: 2.1.0 - 2025 Modern Edition
 */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Mark page as loading JS
        document.body.classList.remove('js-loading');
        document.body.classList.add('js-loaded');
        
        // Add JS-loaded class to html for CSS targeting
        document.documentElement.classList.add('js-loaded');
        
        // Initialize all modules in order of priority
        initHeaderHeight();
        initDynamicContent();
        initNavigation();
        initThemeToggle();
        initScrollHeader();
        initTestimonialSlider();
        initAnimatedCounters();
        initCookieConsent();
        initForms();
        initSmoothScrolling();
        initAccessibility();
        initLazyLoading();
        initParallaxEffects();
        
        // Update active nav link
        updateActiveNavLink();
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('zas:ready'));
    });

    /**
     * HEADER HEIGHT MANAGEMENT (FIXED)
     * Critical: Prevents hero content from hiding under navbar
     */
    function initHeaderHeight() {
        const header = document.querySelector('.agency-header');
        if (!header) return;
        
        // Initial calculation
        updateHeaderHeight();
        
        // Update on resize (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateHeaderHeight, 150);
        });
        
        // Update after fonts load
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setTimeout(updateHeaderHeight, 100);
            });
        }
        
        // Update on load (images, etc.)
        window.addEventListener('load', () => {
            setTimeout(updateHeaderHeight, 50);
        });
        
        function updateHeaderHeight() {
            const headerRect = header.getBoundingClientRect();
            const fullHeight = headerRect.height;
            
            // Calculate scrolled height (min 72px)
            let scrolledHeight = Math.max(72, fullHeight - 16);
            
            // Set CSS custom properties
            document.documentElement.style.setProperty('--header-height', `${fullHeight}px`);
            document.documentElement.style.setProperty('--header-height-scrolled', `${scrolledHeight}px`);
            
            // Update hero padding
            const hero = document.querySelector('.agency-hero');
            if (hero) {
                hero.style.paddingTop = `${fullHeight}px`;
                hero.style.scrollMarginTop = `${fullHeight}px`;
            }
            
            // Update scroll padding for anchor links
            document.documentElement.style.scrollPaddingTop = `${fullHeight}px`;
            
            // Update all anchor targets
            document.querySelectorAll('.anchor-target').forEach(el => {
                el.style.scrollMarginTop = `${fullHeight + 12}px`;
            });
            
            // Update scroll behavior
            updateScrollHeader();
        }
    }

    // Add this function to your existing main.js
    function initDynamicContent() {
        // Check if we need to load dynamic content
        const needsDynamicContent = document.querySelector('[data-needs-projects], [data-needs-team], [data-needs-testimonials]');
        
        if (needsDynamicContent && window.ZASData) {
            // Check if data is already loaded
            if (!ZASData.isLoaded && !ZASData.isLoading) {
                ZASData.loadAllData().then(data => {
                    console.log('Dynamic content loaded:', data);
                    
                    // Update statistics if they exist on page
                    const statElements = document.querySelectorAll('[data-count]');
                    statElements.forEach(element => {
                        const value = element.getAttribute('data-count');
                        if (value) {
                            // Trigger counter animation
                            if (typeof initAnimatedCounters === 'function') {
                                setTimeout(() => {
                                    element.textContent = value;
                                }, 500);
                            }
                        }
                    });
                }).catch(error => {
                    console.error('Failed to load dynamic content:', error);
                });
            }
        }
    }

    /**
     * NAVIGATION MODULE (FIXED)
     * Handles mobile menu, dropdowns, and scroll behavior
     */
    function initNavigation() {
        const menuToggle = document.getElementById('menuToggle');
        const mainMenu = document.getElementById('mainMenu');
        const navLinks = document.querySelectorAll('.agency-nav__link');
        
        if (!menuToggle || !mainMenu) return;
        
        // Mobile menu toggle
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu visibility
            mainMenu.classList.toggle('agency-nav__menu--open');
            this.classList.toggle('agency-nav__toggle--open');
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle body scroll
            if (mainMenu.classList.contains('agency-nav__menu--open')) {
                document.body.style.overflow = 'hidden';
                menuToggle.setAttribute('aria-label', 'Close mobile menu');
                
                // Focus first link for keyboard users
                setTimeout(() => {
                    const firstLink = mainMenu.querySelector('.agency-nav__link');
                    if (firstLink) firstLink.focus();
                }, 100);
            } else {
                document.body.style.overflow = '';
                menuToggle.setAttribute('aria-label', 'Open mobile menu');
            }
        });
        
        // Handle dropdowns on mobile
        navLinks.forEach(link => {
            const dropdown = link.nextElementSibling;
            
            if (dropdown && dropdown.classList.contains('agency-nav__dropdown')) {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth < 992) {
                        e.preventDefault();
                        const isOpen = dropdown.classList.contains('agency-nav__dropdown--open');
                        
                        // Close all other dropdowns
                        document.querySelectorAll('.agency-nav__dropdown--open').forEach(d => {
                            if (d !== dropdown) d.classList.remove('agency-nav__dropdown--open');
                        });
                        
                        // Toggle this dropdown
                        dropdown.classList.toggle('agency-nav__dropdown--open');
                        this.setAttribute('aria-expanded', dropdown.classList.contains('agency-nav__dropdown--open'));
                    }
                });
            } else {
                // Regular links on mobile - close menu
                link.addEventListener('click', function() {
                    if (window.innerWidth < 992 && mainMenu.classList.contains('agency-nav__menu--open')) {
                        closeMobileMenu();
                    }
                });
            }
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(event) {
            if (window.innerWidth < 992 && 
                !mainMenu.contains(event.target) && 
                !menuToggle.contains(event.target) &&
                mainMenu.classList.contains('agency-nav__menu--open')) {
                closeMobileMenu();
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mainMenu.classList.contains('agency-nav__menu--open')) {
                closeMobileMenu();
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 992) {
                    closeMobileMenu();
                }
            }, 250);
        });
        
        function closeMobileMenu() {
            mainMenu.classList.remove('agency-nav__menu--open');
            menuToggle.classList.remove('agency-nav__toggle--open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open mobile menu');
            document.body.style.overflow = '';
            
            // Close all dropdowns
            document.querySelectorAll('.agency-nav__dropdown--open').forEach(dropdown => {
                dropdown.classList.remove('agency-nav__dropdown--open');
            });
        }
    }

    /**
     * SCROLL HEADER BEHAVIOR
     * Shrinks header on scroll with proper height management
     */
    function initScrollHeader() {
        const header = document.getElementById('mainHeader');
        if (!header) return;
        
        let lastScrollTop = 0;
        const scrollThreshold = 20;
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class based on scroll position
            if (scrollTop > scrollThreshold) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
            
            lastScrollTop = scrollTop;
        }
        
        // Throttle scroll events for performance
        const throttledScroll = throttle(handleScroll, 100);
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Initial check
        handleScroll();
    }
    
    function updateScrollHeader() {
        const header = document.getElementById('mainHeader');
        if (!header) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollThreshold = 20;
        
        if (scrollTop > scrollThreshold) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    /**
     * THEME TOGGLE MODULE (FIXED)
     * Handles dark/light mode switching with SVG icons
     */
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const htmlElement = document.documentElement;
        
        if (!themeToggle) return;
        
        // Get saved theme preference or use system preference
        const savedTheme = localStorage.getItem('agency-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme) {
            htmlElement.classList.toggle('agency-theme-dark', savedTheme === 'dark');
            htmlElement.classList.toggle('agency-theme-light', savedTheme === 'light');
        } else if (systemPrefersDark) {
            htmlElement.classList.add('agency-theme-dark');
        } else {
            htmlElement.classList.add('agency-theme-light');
        }
        
        // Toggle theme on button click
        themeToggle.addEventListener('click', function() {
            const isDark = htmlElement.classList.contains('agency-theme-dark');
            
            if (isDark) {
                htmlElement.classList.remove('agency-theme-dark');
                htmlElement.classList.add('agency-theme-light');
                localStorage.setItem('agency-theme', 'light');
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            } else {
                htmlElement.classList.remove('agency-theme-light');
                htmlElement.classList.add('agency-theme-dark');
                localStorage.setItem('agency-theme', 'dark');
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
            
            // Dispatch event for other components to react
            document.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: isDark ? 'light' : 'dark' }
            }));
        });
        
        // Set initial aria-label
        const isDark = htmlElement.classList.contains('agency-theme-dark');
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('agency-theme')) {
                if (e.matches) {
                    htmlElement.classList.remove('agency-theme-light');
                    htmlElement.classList.add('agency-theme-dark');
                } else {
                    htmlElement.classList.remove('agency-theme-dark');
                    htmlElement.classList.add('agency-theme-light');
                }
            }
        });
    }

    /**
     * TESTIMONIAL SLIDER MODULE
     * Vanilla JS carousel with full accessibility support
     */
    function initTestimonialSlider() {
        const track = document.getElementById('testimonialTrack');
        const prevBtn = document.getElementById('testimonialPrev');
        const nextBtn = document.getElementById('testimonialNext');
        const dotsContainer = document.getElementById('testimonialDots');
        const liveRegion = document.getElementById('testimonialLive');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        const slides = Array.from(track.children);
        const slideCount = slides.length;
        let currentSlide = 0;
        let autoSlideInterval = null;
        
        // Create dots and set up initial state
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
                    dot.classList.toggle('agency-testimonial-slider__dot--active', isActive);
                    dot.setAttribute('aria-selected', isActive);
                });
            }
            
            // Update live region for screen readers
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
        
        // Pause auto-slide on hover/focus
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);
        track.addEventListener('focusin', stopAutoSlide);
        track.addEventListener('focusout', () => {
            setTimeout(startAutoSlide, 3000);
        });
    }

    /**
     * ANIMATED COUNTERS MODULE
     * Animate number counters for stats/KPIs
     */
    function initAnimatedCounters() {
        const counterElements = document.querySelectorAll('[data-count]');
        
        if (!counterElements.length) return;
        
        // Create Intersection Observer for counters
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const targetValue = parseFloat(element.getAttribute('data-count'));
                    
                    if (!isNaN(targetValue)) {
                        animateCounter(element, targetValue);
                        counterObserver.unobserve(element);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe all counter elements
        counterElements.forEach(element => {
            // Store original text as fallback
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', element.textContent);
            }
            
            // Reset to 0 for animation
            const currentText = element.textContent;
            if (currentText.includes('%')) {
                element.textContent = '0%';
            } else if (currentText.includes('★')) {
                element.textContent = '0★';
            } else if (currentText.startsWith('-')) {
                element.textContent = '-0';
            } else {
                element.textContent = '0';
            }
            
            counterObserver.observe(element);
        });
        
        function animateCounter(element, targetValue) {
            const duration = 1500;
            const startTime = performance.now();
            const startValue = 0;
            const currentText = element.getAttribute('data-original') || element.textContent;
            const suffix = currentText.replace(/[0-9.-]/g, '');
            const isNegative = targetValue < 0;
            const absTarget = Math.abs(targetValue);
            
            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easing function for smoother animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = startValue + (absTarget - startValue) * easeOutQuart;
                
                // Format number based on type
                let formattedValue;
                if (suffix.includes('%')) {
                    formattedValue = Math.round(currentValue) + '%';
                } else if (suffix.includes('★')) {
                    formattedValue = currentValue.toFixed(1) + '★';
                } else if (absTarget > 1000) {
                    formattedValue = formatLargeNumber(currentValue) + suffix;
                } else {
                    formattedValue = Math.round(currentValue) + suffix;
                }
                
                // Add negative sign if needed
                if (isNegative) {
                    formattedValue = '-' + formattedValue;
                }
                
                element.textContent = formattedValue;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Ensure final value is exact
                    let finalValue;
                    if (suffix.includes('%')) {
                        finalValue = Math.round(absTarget) + '%';
                    } else if (suffix.includes('★')) {
                        finalValue = absTarget.toFixed(1) + '★';
                    } else {
                        finalValue = Math.round(absTarget) + suffix;
                    }
                    
                    if (isNegative) finalValue = '-' + finalValue;
                    element.textContent = finalValue;
                    
                    // Add animation complete class
                    element.classList.add('agency-counter-animated');
                }
            }
            
            requestAnimationFrame(step);
        }
        
        function formatLargeNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return Math.round(num).toString();
        }
    }

    /**
     * COOKIE CONSENT MODULE (FIXED)
     * Full cookie management with proper accessibility
     */
    function initCookieConsent() {
        const cookieBanner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('acceptCookies');
        const rejectBtn = document.getElementById('rejectCookies');
        const manageBtn = document.getElementById('manageCookies');
        const saveBtn = document.getElementById('saveCookiePreferences');
        const closeBtn = document.getElementById('closeCookieBanner');
        const closeSettingsBtn = document.getElementById('closeCookieSettings');
        const cookieOverlay = document.getElementById('cookieOverlay');
        const cookieSettings = document.getElementById('cookieSettings');
        const analyticsCheckbox = document.getElementById('analyticsCookies');
        const marketingCheckbox = document.getElementById('marketingCookies');
        
        if (!cookieBanner || !acceptBtn) return;
        
        // Check if consent was already given
        const consentGiven = localStorage.getItem('agency-cookie-consent');
        const consentPreferences = JSON.parse(localStorage.getItem('agency-cookie-preferences') || '{}');
        
        // Apply saved preferences to checkboxes
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = consentPreferences.analytics !== false;
        }
        if (marketingCheckbox) {
            marketingCheckbox.checked = consentPreferences.marketing !== false;
        }
        
        if (!consentGiven) {
            // Show banner after a short delay
            setTimeout(() => {
                cookieBanner.classList.add('agency-cookie-banner--visible');
                document.body.style.paddingBottom = `${cookieBanner.offsetHeight}px`;
            }, 1000);
        } else {
            // Initialize analytics based on preferences
            initAnalytics(consentPreferences);
        }
        
        // Handle accept button
        acceptBtn.addEventListener('click', function() {
            const preferences = {
                essential: true,
                analytics: analyticsCheckbox?.checked ?? true,
                marketing: marketingCheckbox?.checked ?? true
            };
            
            saveCookiePreferences(preferences, 'accepted');
        });
        
        // Handle reject button
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function() {
                const preferences = {
                    essential: true,
                    analytics: false,
                    marketing: false
                };
                
                saveCookiePreferences(preferences, 'rejected');
            });
        }
        
        // Handle manage preferences button
        if (manageBtn) {
            manageBtn.addEventListener('click', function() {
                showCookieSettings();
            });
        }
        
        // Handle save preferences button
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                const preferences = {
                    essential: true,
                    analytics: analyticsCheckbox?.checked ?? false,
                    marketing: marketingCheckbox?.checked ?? false
                };
                
                saveCookiePreferences(preferences, 'custom');
            });
        }
        
        // Handle close banner button
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideCookieBanner();
            });
        }
        
        // Handle close settings button
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', function() {
                hideCookieSettings();
            });
        }
        
        // Close settings when clicking overlay
        if (cookieOverlay) {
            cookieOverlay.addEventListener('click', function() {
                hideCookieSettings();
            });
        }
        
        // Close settings with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && cookieSettings?.classList.contains('agency-cookie-settings--visible')) {
                hideCookieSettings();
            }
        });
        
        // Trap focus in cookie settings modal
        if (cookieSettings) {
            cookieSettings.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' && this.classList.contains('agency-cookie-settings--visible')) {
                    const focusableElements = this.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    
                    if (focusableElements.length === 0) return;
                    
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
        
        function saveCookiePreferences(preferences, status) {
            // Save to localStorage
            localStorage.setItem('agency-cookie-consent', status);
            localStorage.setItem('agency-cookie-preferences', JSON.stringify(preferences));
            
            // Initialize analytics based on preferences
            initAnalytics(preferences);
            
            // Hide banner and settings
            hideCookieBanner();
            hideCookieSettings();
            
            // Show confirmation message
            showCookieConfirmation(status, preferences);
        }
        
        function showCookieSettings() {
            if (cookieOverlay && cookieSettings) {
                cookieOverlay.hidden = false;
                cookieSettings.hidden = false;
                
                setTimeout(() => {
                    cookieOverlay.classList.add('agency-cookie-settings__overlay--visible');
                    cookieSettings.classList.add('agency-cookie-settings--visible');
                    
                    // Focus first interactive element
                    const firstFocusable = cookieSettings.querySelector('button, input');
                    if (firstFocusable) firstFocusable.focus();
                }, 10);
            }
        }
        
        function hideCookieSettings() {
            if (cookieOverlay && cookieSettings) {
                cookieOverlay.classList.remove('agency-cookie-settings__overlay--visible');
                cookieSettings.classList.remove('agency-cookie-settings--visible');
                
                setTimeout(() => {
                    cookieOverlay.hidden = true;
                    cookieSettings.hidden = true;
                    
                    // Return focus to manage button
                    if (manageBtn) manageBtn.focus();
                }, 300);
            }
        }
        
        function hideCookieBanner() {
            cookieBanner.classList.remove('agency-cookie-banner--visible');
            document.body.style.paddingBottom = '0';
        }
        
        function showCookieConfirmation(status, preferences) {
            // Create and show a confirmation message
            const confirmation = document.createElement('div');
            confirmation.className = 'agency-cookie-confirmation';
            confirmation.setAttribute('role', 'status');
            confirmation.setAttribute('aria-live', 'polite');
            confirmation.innerHTML = `
                <p>Your cookie preferences have been saved. 
                ${status === 'rejected' ? 'Only essential cookies are enabled.' : 
                  status === 'custom' ? 'Selected cookie types are enabled.' : 
                  'All cookies are enabled.'}
                </p>
                <button class="agency-cookie-confirmation__close" aria-label="Close confirmation">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M1 1L15 15M15 1L1 15"/>
                    </svg>
                </button>
            `;
            
            document.body.appendChild(confirmation);
            
            // Animate in
            setTimeout(() => {
                confirmation.classList.add('agency-cookie-confirmation--visible');
            }, 100);
            
            // Remove on close button click
            const closeBtn = confirmation.querySelector('.agency-cookie-confirmation__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    confirmation.classList.remove('agency-cookie-confirmation--visible');
                    setTimeout(() => confirmation.remove(), 300);
                });
            }
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.classList.remove('agency-cookie-confirmation--visible');
                    setTimeout(() => confirmation.remove(), 300);
                }
            }, 5000);
        }
    }

    /**
     * ANALYTICS INITIALIZATION
     * Privacy-friendly analytics with consent checking
     */
    function initAnalytics(preferences) {
        console.log('Analytics initialized with preferences:', preferences);
        
        // Only load analytics if consent was given
        if (!preferences.analytics) {
            console.log('Analytics disabled based on user preferences');
            return;
        }
        
        // Track page views
        trackEvent('page_view', {
            url: window.location.pathname,
            referrer: document.referrer || 'direct'
        });
        
        function trackEvent(eventName, eventData) {
            // In production, send to your analytics endpoint
            console.log('Track event:', eventName, eventData);
        }
    }

    /**
     * FORMS MODULE
     * Handles form validation and submission
     */
    function initForms() {
        const forms = document.querySelectorAll('.agency-contact-form');
        
        if (!forms.length) return;
        
        forms.forEach(form => {
            form.setAttribute('novalidate', '');
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simple form submission for demo
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                // Simulate API call
                setTimeout(() => {
                    alert('Thank you for your message! We\'ll get back to you soon.');
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 1500);
            });
        });
    }

    /**
     * SMOOTH SCROLLING MODULE
     * Accessibility-focused smooth scrolling
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
     * ACCESSIBILITY MODULE
     * Comprehensive accessibility improvements
     */
    function initAccessibility() {
        // Add focus-visible support
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('using-keyboard');
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });
        
        // Ensure all images have alt text
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', '');
            }
        });
        
        // Add accessible descriptions for icon buttons
        document.querySelectorAll('.agency-btn:not([aria-label])').forEach(button => {
            if (button.textContent.trim() === '' && button.querySelector('svg')) {
                const context = button.closest('.agency-service-card, .agency-case-study-card');
                if (context) {
                    const title = context.querySelector('h3, h4')?.textContent;
                    if (title) {
                        button.setAttribute('aria-label', `Learn more about ${title}`);
                    }
                }
            }
        });
    }

    /**
     * LAZY LOADING MODULE
     * Modern lazy loading with Intersection Observer
     */
    function initLazyLoading() {
        // Check if browser supports native lazy loading
        const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;
        
        // Get all lazy-loadable elements
        const lazyElements = document.querySelectorAll('[data-src], [data-srcset], [data-bg]');
        
        if (!supportsNativeLazyLoading && 'IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        if (element.tagName === 'IMG') {
                            if (element.dataset.src) {
                                element.src = element.dataset.src;
                                delete element.dataset.src;
                            }
                            if (element.dataset.srcset) {
                                element.srcset = element.dataset.srcset;
                                delete element.dataset.srcset;
                            }
                            
                            element.addEventListener('load', function() {
                                this.classList.add('agency-image-loaded');
                            });
                        } else if (element.dataset.bg) {
                            element.style.backgroundImage = `url(${element.dataset.bg})`;
                            delete element.dataset.bg;
                            element.classList.add('agency-bg-loaded');
                        }
                        
                        lazyObserver.unobserve(element);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            lazyElements.forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }

    /**
     * PARALLAX EFFECTS MODULE (OPTIMIZED)
     * Subtle parallax effects for hero elements
     */
    function initParallaxEffects() {
        const heroSection = document.querySelector('.agency-hero');
        if (!heroSection) return;
        
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const floatingElements = document.querySelectorAll('.agency-hero__element');
        if (!floatingElements.length) return;
        
        // Use CSS animations for performance (already defined in CSS)
        // No JavaScript needed for basic float animations
    }

    /**
     * UPDATE ACTIVE NAVIGATION LINK
     */
    function updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const navLinks = document.querySelectorAll('.agency-nav__link');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // Remove active class from all links
            link.classList.remove('agency-nav__link--active');
            link.removeAttribute('aria-current');
            
            // Check if this link matches current page or hash
            if (currentPath === linkHref || 
                (linkHref === currentHash && currentHash) ||
                (linkHref === '/' && currentPath === '/')) {
                link.classList.add('agency-nav__link--active');
                link.setAttribute('aria-current', 'page');
            }
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
        console.error('Global error caught:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
    /**
     * EXPOSE PUBLIC API
     */
    window.ZASDigital = {
        initHeaderHeight,
        initNavigation,
        initThemeToggle,
        updateActiveNavLink,
        throttle,
        debounce
    };

})();