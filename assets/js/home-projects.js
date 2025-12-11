/**
 * ZAS Digital - Home Projects Loader
 * Loads and displays random projects on homepage
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Wait for DOM and data to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if homepage needs random projects
        const homeContainer = document.getElementById('homeProjectsGrid');
        if (!homeContainer) return;
        
        // Use event listener for data loading
        document.addEventListener('zas:dataLoaded', handleDataLoaded);
        
        // Also check if data is already loaded
        setTimeout(() => {
            if (window.ZASData && ZASData.isLoaded) {
                handleDataLoaded();
            } else {
                // Load data if not already loading
                if (ZASData && !ZASData.isLoading) {
                    ZASData.loadAllData();
                }
            }
        }, 100);
    });
    
    /**
     * Handle data loaded event
     */
    function handleDataLoaded() {
        if (!window.ZASData || !ZASData.isLoaded) {
            console.error('ZASData not available');
            showErrorMessage();
            return;
        }
        
        renderRandomProjects();
    }
    
    /**
     * Render random projects on homepage
     */
    function renderRandomProjects() {
        const container = document.getElementById('homeProjectsGrid');
        if (!container) return;
        
        // Get number of random projects to display (default 3)
        const count = parseInt(container.getAttribute('data-random')) || 3;
        
        // Get all featured projects
        const allProjects = ZASData.getProjects({ featured: true });
        
        if (allProjects.length === 0) {
            showNoProjectsMessage();
            return;
        }
        
        // Select random projects
        const randomProjects = getRandomItems(allProjects, Math.min(count, allProjects.length));
        
        // Clear loading indicator
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Render each random project
        randomProjects.forEach((project, index) => {
            const html = createHomeProjectHTML(project, index);
            container.innerHTML += html;
        });
        
        // Add animations
        setTimeout(() => {
            container.querySelectorAll('.agency-case-study-card').forEach((card, i) => {
                card.style.animationDelay = `${i * 100}ms`;
                card.classList.add('agency-fade-in');
            });
            
            // Animate counters
            initAnimatedCounters();
        }, 100);
    }
    
    /**
     * Get random items from array
     */
    function getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    /**
     * Create HTML for a project on homepage
     */
    function createHomeProjectHTML(project, index) {
        const delay = index * 100;
        
        // Get 2 metrics for display
        let metricsHTML = '';
        if (project.metrics && Object.keys(project.metrics).length > 0) {
            const metrics = Object.entries(project.metrics).slice(0, 2);
            metricsHTML = metrics.map(([key, value], i) => {
                const percentage = key.includes('rating') || key.includes('satisfaction') 
                    ? Math.min(parseFloat(value) * 20, 100) 
                    : key.includes('bounceRate') || key.includes('processingTime')
                    ? Math.min(parseFloat(value) * 1.5, 100)
                    : Math.min(parseFloat(value), 100);
                
                return `
                    <div class="agency-case-study-card__result">
                        <span class="agency-case-study-card__result-value" data-count="${value}">${value}</span>
                        <span class="agency-case-study-card__result-label">${formatMetricLabel(key)}</span>
                        <div class="agency-case-study-card__chart">
                            <div class="agency-case-study-card__chart-fill" style="width: ${percentage}%"></div>
                        </div>
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
                        <p class="agency-case-study-card__description">${project.description || 'No description available.'}</p>
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
     * Format metric labels for display
     */
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
            'matches': 'Successful Matches',
            'students': 'Students Impacted',
            'engagement': 'User Engagement',
            'satisfaction': 'Satisfaction',
            'features': 'Features Delivered',
            'speed': 'Speed Improvement',
            'mobileUsers': 'Mobile Users',
            'paperworkReduction': 'Paperwork Reduced',
            'vesselsTracked': 'Vessels Tracked',
            'keywords': 'Keywords Ranked',
            'bounceRate': 'Bounce Rate Reduction',
            'dataFormats': 'Data Formats',
            'chartTypes': 'Chart Types'
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Get category label
     */
    function getCategoryLabel(category) {
        const labels = {
            'web-app': 'Web App Development',
            'mobile-app': 'Mobile App Development',
            'product-design': 'Product Design',
            'seo-growth': 'SEO & Growth'
        };
        return labels[category] || category;
    }
    
    /**
     * Show error message
     */
    function showErrorMessage() {
        const container = document.getElementById('homeProjectsGrid');
        if (!container) return;
        
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="agency-data-error">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p class="mt-2">Unable to load featured projects. Please refresh the page.</p>
                </div>
            `;
        }
    }
    
    /**
     * Show no projects message
     */
    function showNoProjectsMessage() {
        const container = document.getElementById('homeProjectsGrid');
        if (!container) return;
        
        const loadingElement = container.querySelector('.agency-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
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
    }
    
    /**
     * Initialize animated counters for metrics
     */
    function initAnimatedCounters() {
        const counterElements = document.querySelectorAll('.agency-case-study-card__result-value[data-count]');
        
        counterElements.forEach(element => {
            const targetValue = element.getAttribute('data-count');
            const suffix = element.textContent.replace(/[0-9.-]/g, '');
            
            if (suffix.includes('★')) {
                element.textContent = targetValue;
            } else {
                // Simple counter animation
                const isNegative = targetValue.startsWith('-');
                const numValue = targetValue.replace(/[^0-9.]/g, '');
                
                if (!isNaN(numValue)) {
                    element.textContent = isNegative ? `-${numValue}` : numValue;
                }
            }
        });
    }
    
})();