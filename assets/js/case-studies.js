/**
 * ZAS Digital - Case Studies JavaScript
 * Modern 2025-2026 implementation with filtering, search, and smooth animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize case studies functionality
    initCaseStudies();
    
    // Initialize animations
    initAnimations();
    
    // Initialize accessibility features
    initAccessibility();
});

/**
 * Main case studies initialization
 */
function initCaseStudies() {
    const filterButtons = document.querySelectorAll('.agency-case-filter__item');
    const caseStudies = document.querySelectorAll('[data-category]');
    const searchInput = document.getElementById('caseSearch');
    const loadMoreBtn = document.getElementById('loadMore');
    
    let currentFilter = 'all';
    let currentSearch = '';
    let visibleCount = 6;
    const totalCount = caseStudies.length;
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('agency-case-filter__item--active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            button.classList.add('agency-case-filter__item--active');
            button.setAttribute('aria-selected', 'true');
            
            // Update filter
            currentFilter = button.dataset.filter;
            
            // Filter and show case studies
            filterCaseStudies();
            
            // Announce filter change for screen readers
            announceFilterChange(currentFilter);
        });
    });
    
    // Search functionality
    if (searchInput) {
        // Debounced search function
        const performSearch = debounce(() => {
            currentSearch = searchInput.value.toLowerCase().trim();
            filterCaseStudies();
        }, 300);
        
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                currentSearch = '';
                filterCaseStudies();
            }
        });
    }
    
    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount = Math.min(visibleCount + 3, totalCount);
            filterCaseStudies(true);
            
            // Update button text or hide if all loaded
            if (visibleCount >= totalCount) {
                loadMoreBtn.style.display = 'none';
                announceLoadComplete();
            }
        });
    }
    
    /**
     * Filter and display case studies based on current filter and search
     * @param {boolean} preserveVisible - Whether to preserve current visible state
     */
    function filterCaseStudies(preserveVisible = false) {
        let visibleItems = 0;
        let hasResults = false;
        
        caseStudies.forEach((caseStudy, index) => {
            const category = caseStudy.dataset.category;
            const title = caseStudy.querySelector('.agency-case-study-grid__title').textContent.toLowerCase();
            const description = caseStudy.querySelector('.agency-case-study-grid__description').textContent.toLowerCase();
            
            // Check if case study matches filter
            const matchesFilter = currentFilter === 'all' || category === currentFilter;
            
            // Check if case study matches search
            const matchesSearch = !currentSearch || 
                title.includes(currentSearch) || 
                description.includes(currentSearch) ||
                category.includes(currentSearch);
            
            // Determine visibility
            const shouldShow = matchesFilter && matchesSearch && 
                (preserveVisible ? true : index < visibleCount);
            
            if (shouldShow) {
                caseStudy.style.display = '';
                visibleItems++;
                hasResults = true;
                
                // Add animation delay for staggered reveal
                if (!preserveVisible) {
                    caseStudy.style.animationDelay = `${(index % 3) * 100}ms`;
                    caseStudy.classList.add('agency-fade-in');
                }
            } else {
                caseStudy.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        showNoResultsMessage(!hasResults);
        
        // Update load more button visibility
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasResults && visibleItems < totalCount ? '' : 'none';
        }
        
        // Update URL hash for filter state
        updateURLHash();
    }
    
    /**
     * Show or hide no results message
     * @param {boolean} show - Whether to show the message
     */
    function showNoResultsMessage(show) {
        let noResults = document.getElementById('noResultsMessage');
        
        if (show) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.id = 'noResultsMessage';
                noResults.className = 'agency-case-no-results';
                noResults.innerHTML = `
                    <div class="agency-case-no-results__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                            <line x1="8" y1="8" x2="16" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="agency-case-no-results__title">No Case Studies Found</h3>
                    <p class="agency-case-no-results__description">
                        Try adjusting your filter or search criteria to find what you're looking for.
                    </p>
                `;
                document.getElementById('caseStudiesGrid').appendChild(noResults);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }
    
    /**
     * Update URL hash with current filter state
     */
    function updateURLHash() {
        const params = new URLSearchParams();
        if (currentFilter !== 'all') params.set('filter', currentFilter);
        if (currentSearch) params.set('search', currentSearch);
        
        const newHash = params.toString() ? `#${params.toString()}` : '';
        window.history.replaceState(null, '', window.location.pathname + newHash);
    }
    
    /**
     * Initialize from URL hash
     */
    function initFromURL() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        if (params.has('filter')) {
            const filter = params.get('filter');
            const button = document.querySelector(`[data-filter="${filter}"]`);
            if (button) {
                button.click();
            }
        }
        
        if (params.has('search')) {
            const search = params.get('search');
            if (searchInput) {
                searchInput.value = search;
                currentSearch = search.toLowerCase();
                filterCaseStudies();
            }
        }
    }
    
    // Initialize from URL on page load
    initFromURL();
}

/**
 * Initialize animations and interactions
 */
function initAnimations() {
    // Animate number counting
    const animateNumbers = () => {
        const numberElements = document.querySelectorAll('[data-count]');
        
        numberElements.forEach(element => {
            const target = parseInt(element.dataset.count);
            const suffix = element.textContent.replace(/\d+/g, '');
            const duration = 1500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                const currentValue = Math.floor(easeOutQuart * target);
                element.textContent = currentValue + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            // Start animation when element is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(element);
        });
    };
    
    // Initialize scroll animations
    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observe all case study cards
        document.querySelectorAll('.agency-case-study-grid').forEach(card => {
            observer.observe(card);
        });
    };
    
    // Hover effects for case study cards
    const initHoverEffects = () => {
        const cards = document.querySelectorAll('.agency-case-study-grid');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.zIndex = '';
            });
        });
    };
    
    // Initialize all animations
    animateNumbers();
    initScrollAnimations();
    initHoverEffects();
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Keyboard navigation for filter tabs
    const filterList = document.querySelector('.agency-case-filter__list');
    
    if (filterList) {
        filterList.addEventListener('keydown', (e) => {
            const items = Array.from(filterList.querySelectorAll('.agency-case-filter__item'));
            const currentIndex = items.indexOf(document.activeElement);
            let nextIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].focus();
                    break;
                    
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    items[nextIndex].focus();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    items[0].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    items[items.length - 1].focus();
                    break;
                    
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    document.activeElement.click();
                    break;
            }
        });
    }
    
    // Live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.className = 'agency-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
    
    window.announceToScreenReader = (message) => {
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    };
}

/**
 * Announce filter change to screen readers
 * @param {string} filter - Current filter
 */
function announceFilterChange(filter) {
    const filterNames = {
        'all': 'All projects',
        'web-app': 'Web applications',
        'mobile-app': 'Mobile applications',
        'product-design': 'Product design',
        'seo-growth': 'SEO and growth'
    };
    
    const message = `Now showing ${filterNames[filter] || filter}. Use search to find specific case studies.`;
    window.announceToScreenReader?.(message);
}

/**
 * Announce load complete to screen readers
 */
function announceLoadComplete() {
    window.announceToScreenReader?.('All case studies are now loaded.');
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Lazy load images
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Initialize view transitions (2025 feature)
 */
function initViewTransitions() {
    if ('startViewTransition' in document) {
        // Enhance filter transitions
        const filterButtons = document.querySelectorAll('.agency-case-filter__item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                if (!document.startViewTransition) {
                    return;
                }
                
                // Start view transition
                const transition = document.startViewTransition(() => {
                    // The actual filter change happens here
                });
                
                try {
                    await transition.ready;
                    // Optional: Add custom animations during transition
                } catch (err) {
                    // Fallback if transition fails
                    console.error('View transition failed:', err);
                }
            });
        });
    }
}

// Initialize lazy loading
initLazyLoading();

// Initialize view transitions if supported
initViewTransitions();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initCaseStudies,
        initAnimations,
        initAccessibility
    };
}