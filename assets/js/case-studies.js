/**
 * ZAS Digital - Case Studies JavaScript
 * Modern 2025-2026 implementation with filtering, search, and smooth animations
 */

// Wait for both DOM and dynamic content to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to wait for dynamic content
    if (document.getElementById('caseStudiesGrid').children.length === 0) {
        // Wait for dynamic content to be loaded
        document.addEventListener('zas:dataLoaded', () => {
            setTimeout(() => {
                initCaseStudies();
                initAnimations();
                initAccessibility();
            }, 100); // Small delay to ensure rendering is complete
        });
    } else {
        // Content already exists, initialize immediately
        initCaseStudies();
        initAnimations();
        initAccessibility();
    }
    
    // Initialize animations that don't depend on dynamic content
    initStaticAnimations();
});

/**
 * Main case studies initialization
 */
function initCaseStudies() {
    const filterButtons = document.querySelectorAll('.agency-case-filter__item');
    const searchInput = document.getElementById('caseSearch');
    const loadMoreBtn = document.getElementById('loadMore');
    
    // ========== EFFICIENT FIX: Get ALL project containers ==========
    // Store references to ALL project containers (including hidden ones)
    const allProjectContainers = Array.from(document.querySelectorAll('.col-lg-4, .col-md-6'));
    
    // Filter out any empty containers (just in case)
    const validContainers = allProjectContainers.filter(container => 
        container.querySelector('.agency-case-study-grid')
    );
    
    if (validContainers.length === 0) {
        console.warn('No case studies found to filter. Waiting for dynamic content...');
        return;
    }
    // ========== END EFFICIENT FIX ==========
    
    let currentFilter = 'all';
    let currentSearch = '';
    let visibleCount = 6;
    const totalCount = validContainers.length;
    
    // Filter functionality
    filterButtons.forEach(button => {
        // Remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Re-select buttons after cloning
    const refreshedButtons = document.querySelectorAll('.agency-case-filter__item');
    
    refreshedButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            refreshedButtons.forEach(btn => {
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
        // Remove existing event listeners
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        // Re-select
        const refreshedSearchInput = document.getElementById('caseSearch');
        
        // Debounced search function
        const performSearch = debounce(() => {
            currentSearch = refreshedSearchInput.value.toLowerCase().trim();
            filterCaseStudies();
        }, 300);
        
        refreshedSearchInput.addEventListener('input', performSearch);
        refreshedSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                refreshedSearchInput.value = '';
                currentSearch = '';
                filterCaseStudies();
            }
        });
    }
    
    // Load more functionality
    if (loadMoreBtn) {
        // Remove existing event listeners
        const newLoadMoreBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newLoadMoreBtn, loadMoreBtn);
        
        // Re-select
        const refreshedLoadMoreBtn = document.getElementById('loadMore');
        
        refreshedLoadMoreBtn.addEventListener('click', () => {
            visibleCount = Math.min(visibleCount + 3, totalCount);
            filterCaseStudies(true);
            
            // Update button text or hide if all loaded
            if (visibleCount >= totalCount) {
                refreshedLoadMoreBtn.style.display = 'none';
                announceLoadComplete();
            }
        });
        
        // Initially hide load more if less than visible count
        if (totalCount <= visibleCount) {
            refreshedLoadMoreBtn.style.display = 'none';
        }
    }
    
    /**
     * Filter and display case studies based on current filter and search
     * @param {boolean} preserveVisible - Whether to preserve current visible state
     */
    function filterCaseStudies(preserveVisible = false) {
        let visibleItems = 0;
        let hasResults = false;
        
        // ========== UPDATED: Loop through ALL containers ==========
        validContainers.forEach((container, index) => {
            const caseStudy = container.querySelector('.agency-case-study-grid');
            if (!caseStudy) return;
            
            const parentDiv = caseStudy.closest('[data-category]');
            const category = parentDiv ? parentDiv.getAttribute('data-category') : '';
            const title = caseStudy.querySelector('.agency-case-study-grid__title')?.textContent.toLowerCase() || '';
            const description = caseStudy.querySelector('.agency-case-study-grid__description')?.textContent.toLowerCase() || '';
            const techTags = Array.from(caseStudy.querySelectorAll('.agency-case-study-grid__tech-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');
            
            // Check if case study matches filter
            const matchesFilter = currentFilter === 'all' || category === currentFilter;
            
            // Check if case study matches search
            const matchesSearch = !currentSearch || 
                title.includes(currentSearch) || 
                description.includes(currentSearch) ||
                category.includes(currentSearch) ||
                techTags.includes(currentSearch);
            
            // Determine visibility
            const shouldShow = matchesFilter && matchesSearch && 
                (preserveVisible ? true : index < visibleCount);
            
            if (shouldShow) {
                container.style.display = '';
                visibleItems++;
                hasResults = true;
                
                // Add animation for newly shown items
                if (!preserveVisible) {
                    container.style.animationDelay = `${(index % 3) * 100}ms`;
                    container.classList.add('agency-fade-in');
                }
            } else {
                container.style.display = 'none';
            }
        });
        // ========== END UPDATED ==========
        
        // Show/hide no results message
        showNoResultsMessage(!hasResults);
        
        // Update load more button visibility
        const refreshedLoadMoreBtn = document.getElementById('loadMore');
        if (refreshedLoadMoreBtn) {
            refreshedLoadMoreBtn.style.display = hasResults && visibleItems < totalCount ? '' : 'none';
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
        const container = document.getElementById('caseStudiesGrid');
        
        if (show) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.id = 'noResultsMessage';
                noResults.className = 'agency-case-no-results col-12';
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
                container.appendChild(noResults);
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
            const searchInput = document.getElementById('caseSearch');
            if (searchInput) {
                searchInput.value = search;
                currentSearch = search.toLowerCase();
                filterCaseStudies();
            }
        }
    }
    
    // Initialize from URL on page load
    initFromURL();
    
    // Initial filter
    filterCaseStudies();
}

/**
 * Initialize static animations (those that don't depend on dynamic content)
 */
function initStaticAnimations() {
    // Animate number counting for static elements
    const staticNumberElements = document.querySelectorAll('[data-count]:not(.agency-case-study-grid *)');
    
    const animateNumbers = () => {
        staticNumberElements.forEach(element => {
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
    
    // Initialize when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const statsSection = document.querySelector('.agency-case-impact');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

/**
 * Initialize animations and interactions for dynamic content
 */
function initAnimations() {
    // Hover effects for case study cards
    const initHoverEffects = () => {
        const cards = document.querySelectorAll('.agency-case-study-grid');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.zIndex = '10';
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.zIndex = '';
                card.style.transform = '';
            });
        });
    };
    
    // Initialize hover effects
    initHoverEffects();
    
    // Add scroll animations for newly loaded content
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
    
    initScrollAnimations();
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
    let liveRegion = document.getElementById('caseStudiesLiveRegion');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'caseStudiesLiveRegion';
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
    }
    
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

// Initialize lazy loading for any images in case studies
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

// Initialize view transitions if supported
function initViewTransitions() {
    if ('startViewTransition' in document) {
        const filterButtons = document.querySelectorAll('.agency-case-filter__item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                if (!document.startViewTransition) {
                    return;
                }
                
                const transition = document.startViewTransition(async () => {
                    // Filtering will happen inside the transition
                });
                
                try {
                    await transition.ready;
                } catch (err) {
                    console.error('View transition failed:', err);
                }
            });
        });
    }
}

// Initialize these features
initLazyLoading();
initViewTransitions();