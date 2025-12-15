/**
 * ZAS Digital - Case Studies Page
 * Case studies filtering and display
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { EventBus } from '../core/events.js';
import { DataLoader } from '../core/data-loader.js';

export const CaseStudiesPage = (function() {
    'use strict';
    
    let currentFilter = 'all';
    let currentSearch = '';
    let visibleCount = 6;
    let totalCount = 0;
    let allProjects = [];
    
    /**
     * Initialize case studies page
     */
    function init() {
        initFilters();
        initSearch();
        initLoadMore();
        initHoverEffects();
        initAccessibility();
        initProjects(); // Add project initialization
        
        console.log('Case studies page initialized');
    }
    
    /**
     * Initialize projects
     */
    function initProjects() {
        const container = Utils.getElement('#caseStudiesGrid');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="agency-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading projects...</span>
                    </div>
                    <p class="mt-2">Loading case studies...</p>
                </div>
            </div>
        `;
        
        // Listen for data
        EventBus.once('dataLoaded', renderAllProjects);
        
        // Load data if needed
        if (!DataLoader.isLoaded && !DataLoader.isLoading) {
            DataLoader.loadAllData();
        }
    }
    
    /**
     * Render all projects
     */
    function renderAllProjects() {
        const container = Utils.getElement('#caseStudiesGrid');
        if (!container) return;
        
        // Get all projects (not just featured)
        const projects = DataLoader.getProjects({});
        
        if (projects.length === 0) {
            container.innerHTML = createNoProjectsMessage();
            return;
        }
        
        // Clear loading
        container.innerHTML = '';
        
        // Render all projects
        projects.forEach((project, index) => {
            const html = createCaseStudyHTML(project, index);
            container.innerHTML += html;
        });
        
        // Store reference to all projects
        allProjects = projects;
        totalCount = projects.length;
        
        // Filter and display projects
        filterProjects();
        
        // Add animations
        setTimeout(() => {
            Utils.getElements('.agency-case-study-grid', container).forEach((card, i) => {
                card.style.animationDelay = `${(i % 3) * 100}ms`;
                Utils.addClass(card, 'agency-fade-in');
            });
        }, 100);
    }
    
    /**
     * Create case study HTML
     */
    function createCaseStudyHTML(project, index) {
        const delay = (index % 3) * 100;
        
        // Format category name for display
        const categoryDisplay = {
            'web-app': 'Web App',
            'mobile-app': 'Mobile App', 
            'product-design': 'Product Design',
            'seo-growth': 'SEO & Growth'
        }[project.category] || project.category;
        
        // Get first 3 tech stack items
        const techTags = project.techStack && project.techStack.length > 0 
            ? project.techStack.slice(0, 3).map(tech => 
                `<span class="agency-case-study-grid__tech-tag">${tech}</span>`
            ).join('')
            : '';
        
        // Get metrics if available
        let metricsHTML = '';
        if (project.metrics && Object.keys(project.metrics).length > 0) {
            const metrics = Object.entries(project.metrics).slice(0, 2);
            metricsHTML = `
                <div class="agency-case-study-grid__results">
                    ${metrics.map(([key, value]) => `
                        <div class="agency-case-study-grid__result">
                            <span class="agency-case-study-grid__result-value">${value}</span>
                            <span class="agency-case-study-grid__result-label">${formatMetricLabel(key)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="col-lg-4 col-md-6" data-category="${project.category}">
                <div class="agency-case-study-grid" style="animation-delay: ${delay}ms">
                    <div class="agency-case-study-grid__header">
                        <span class="agency-case-study-grid__category">${categoryDisplay}</span>
                        <h3 class="agency-case-study-grid__title">${project.name}</h3>
                    </div>
                    <div class="agency-case-study-grid__image">
                        <div class="agency-case-study-grid__image-placeholder">
                            <div class="agency-case-study-grid__image-text">${project.name}</div>
                        </div>
                    </div>
                    <div class="agency-case-study-grid__content">
                        <p class="agency-case-study-grid__description">${project.description || 'No description available.'}</p>
                        ${techTags ? `<div class="agency-case-study-grid__tech">${techTags}</div>` : ''}
                        ${metricsHTML}
                        <a href="${project.link || '/case-studies.html'}" class="agency-case-study-grid__link">
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
     * Create no projects message
     */
    function createNoProjectsMessage() {
        return `
            <div class="col-12">
                <div class="agency-case-no-results">
                    <div class="agency-case-no-results__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="agency-case-no-results__title">No case studies available</h3>
                    <p class="agency-case-no-results__description">
                        Check back soon for our latest projects, or 
                        <a href="/contact.html">contact us</a> to start your project.
                    </p>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize filters
     */
    function initFilters() {
        const filterButtons = Utils.getElements('.agency-case-filter__item');
        if (!filterButtons.length) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(btn => {
                    Utils.removeClass(btn, 'agency-case-filter__item--active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                Utils.addClass(this, 'agency-case-filter__item--active');
                this.setAttribute('aria-selected', 'true');
                
                // Update filter
                currentFilter = this.dataset.filter;
                
                // Filter projects
                filterProjects();
                
                // Announce for screen readers
                announceFilterChange(currentFilter);
            });
        });
        
        // Initialize from URL
        initFromURL();
    }
    
    /**
     * Initialize search
     */
    function initSearch() {
        const searchInput = Utils.getElement('#caseSearch');
        if (!searchInput) return;
        
        const performSearch = Utils.debounce(() => {
            currentSearch = searchInput.value.toLowerCase().trim();
            filterProjects();
        }, 300);
        
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                currentSearch = '';
                filterProjects();
            }
        });
    }
    
    /**
     * Initialize load more
     */
    function initLoadMore() {
        const loadMoreBtn = Utils.getElement('#loadMore');
        if (!loadMoreBtn) return;
        
        loadMoreBtn.addEventListener('click', () => {
            visibleCount = Math.min(visibleCount + 3, totalCount);
            filterProjects(true);
            
            if (visibleCount >= totalCount) {
                loadMoreBtn.style.display = 'none';
                announceLoadComplete();
            }
        });
    }
    
    /**
     * Initialize hover effects
     */
    function initHoverEffects() {
        // This will be initialized after projects are loaded
        EventBus.once('dataLoaded', () => {
            setTimeout(() => {
                const cards = Utils.getElements('.agency-case-study-grid');
                if (!cards.length) return;
                
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
            }, 100);
        });
    }
    
    /**
     * Initialize accessibility
     */
    function initAccessibility() {
        // Live region for announcements
        let liveRegion = Utils.getElement('#caseStudiesLiveRegion');
        if (!liveRegion) {
            try {
                liveRegion = document.createElement('div');
                liveRegion.id = 'caseStudiesLiveRegion';
                liveRegion.className = 'agency-live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.style.cssText = `
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                `;
                document.body.appendChild(liveRegion);
            } catch (e) {
                console.warn('Could not create live region:', e);
            }
        }
        
        // Keyboard navigation for filter tabs
        const filterList = Utils.getElement('.agency-case-filter__list');
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
    }
    
    /**
     * Filter and display projects
     */
    function filterProjects(preserveVisible = false) {
        const container = Utils.getElement('#caseStudiesGrid');
        if (!container) return;
        
        // Get all project containers
        const allContainers = Utils.getElements('.col-lg-4, .col-md-6', container);
        
        if (allContainers.length === 0) {
            console.warn('No case studies found to filter');
            return;
        }
        
        totalCount = allContainers.length;
        let visibleItems = 0;
        let hasResults = false;
        
        allContainers.forEach((container, index) => {
            const caseStudy = container.querySelector('.agency-case-study-grid');
            if (!caseStudy) return;
            
            const category = container.getAttribute('data-category') || '';
            const title = caseStudy.querySelector('.agency-case-study-grid__title')?.textContent.toLowerCase() || '';
            const description = caseStudy.querySelector('.agency-case-study-grid__description')?.textContent.toLowerCase() || '';
            const techTags = Array.from(caseStudy.querySelectorAll('.agency-case-study-grid__tech-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');
            
            // Check filters
            const matchesFilter = currentFilter === 'all' || category === currentFilter;
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
                    Utils.addClass(caseStudy, 'agency-fade-in');
                }
            } else {
                container.style.display = 'none';
            }
        });
        
        // Show/hide no results
        showNoResultsMessage(!hasResults);
        
        // Update load more button
        const loadMoreBtn = Utils.getElement('#loadMore');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasResults && visibleItems < totalCount ? '' : 'none';
        }
        
        // Update URL
        updateURLHash();
    }
    
    /**
     * Show/hide no results message
     */
    function showNoResultsMessage(show) {
        const container = Utils.getElement('#caseStudiesGrid');
        if (!container) return;
        
        let noResults = Utils.getElement('#noResultsMessage');
        
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
     * Initialize from URL hash
     */
    function initFromURL() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        if (params.has('filter')) {
            const filter = params.get('filter');
            const button = Utils.getElement(`[data-filter="${filter}"]`);
            if (button) {
                button.click();
            }
        }
        
        if (params.has('search')) {
            const search = params.get('search');
            const searchInput = Utils.getElement('#caseSearch');
            if (searchInput) {
                searchInput.value = search;
                currentSearch = search.toLowerCase();
                filterProjects();
            }
        }
    }
    
    /**
     * Update URL hash
     */
    function updateURLHash() {
        const params = new URLSearchParams();
        if (currentFilter !== 'all') params.set('filter', currentFilter);
        if (currentSearch) params.set('search', currentSearch);
        
        const newHash = params.toString() ? `#${params.toString()}` : '';
        window.history.replaceState(null, '', window.location.pathname + newHash);
    }
    
    /**
     * Announce filter change
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
        announceToScreenReader(message);
    }
    
    /**
     * Announce load complete
     */
    function announceLoadComplete() {
        announceToScreenReader('All case studies are now loaded.');
    }
    
    /**
     * Announce to screen reader
     */
    function announceToScreenReader(message) {
        const liveRegion = Utils.getElement('#caseStudiesLiveRegion');
        if (liveRegion) {
            liveRegion.textContent = '';
            setTimeout(() => {
                liveRegion.textContent = message;
            }, 100);
        }
    }
    
    /**
     * Format metric label
     */
    function formatMetricLabel(key) {
        const labels = {
            'users': 'Users',
            'uptime': 'Uptime',
            'salesIncrease': 'Sales Increase',
            'appRating': 'App Rating',
            'energySavings': 'Energy Savings',
            'pageSpeed': 'PageSpeed Score',
            'processingTime': 'Faster Processing',
            'accuracy': 'Accuracy',
            'pageViews': 'Monthly Views',
            'automation': 'Automation',
            'matches': 'Successful Matches',
            'students': 'Students',
            'engagement': 'Engagement',
            'satisfaction': 'Satisfaction',
            'features': 'Features',
            'speed': 'Speed',
            'mobileUsers': 'Mobile Users',
            'paperworkReduction': 'Paperwork Reduced',
            'vesselsTracked': 'Vessels Tracked',
            'keywords': 'Keywords Ranked',
            'bounceRate': 'Bounce Rate',
            'dataFormats': 'Data Formats',
            'chartTypes': 'Chart Types',
            'orders': 'Daily Orders',
            'inventoryAccuracy': 'Inventory Accuracy',
            'customerSatisfaction': 'Customer Satisfaction',
            'processingTime': 'Processing Time',
            'timeReduction': 'Time Reduced',
            'schools': 'Partner Schools'
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    return {
        init,
        filterProjects,
        announceFilterChange,
        announceLoadComplete
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CaseStudiesPage;
}

// Make available globally
window.ZASCaseStudiesPage = CaseStudiesPage;