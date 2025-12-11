/**
 * ZAS Digital - Service Projects Loader
 * Loads and displays projects for individual service pages
 * Version: 1.1.0 (Fixed)
 */

(function() {
    'use strict';
    
    // Wait for DOM and data to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if this is a service page that needs projects
        const serviceContainers = document.querySelectorAll('[data-needs-projects]');
        
        if (!serviceContainers.length) return;
        
        // Use event listener instead of directly calling loadAllData
        document.addEventListener('zas:dataLoaded', handleDataLoaded);
        
        // Also check if data is already loaded
        setTimeout(() => {
            if (window.ZASData && ZASData.isLoaded) {
                handleDataLoaded();
            } else {
                // If data is not loaded after 1 second, show loading state
                setTimeout(() => {
                    if (!ZASData || !ZASData.isLoaded) {
                        console.log('Waiting for data to load...');
                    }
                }, 1000);
            }
        }, 100);
    });
    
    /**
     * Handle data loaded event
     */
    function handleDataLoaded() {
        if (!window.ZASData || !ZASData.isLoaded) {
            console.error('ZASData not available');
            showErrorMessages();
            return;
        }
        
        renderServiceProjects();
    }
    
    /**
     * Render projects for service pages
     */
    function renderServiceProjects() {
        // Get all service containers that need projects
        const serviceContainers = document.querySelectorAll('[data-needs-projects]');
        
        serviceContainers.forEach(container => {
            const category = container.getAttribute('data-service-category');
            if (!category) return;
            
            // Clear loading indicator
            const loadingElement = container.querySelector('.agency-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Get projects filtered by category
            const projects = ZASData.getProjects({ 
                category: category,
                featured: true,
                limit: 3 // Show only 3 projects on service pages
            });
            
            if (projects.length === 0) {
                container.innerHTML = createNoProjectsMessage(category);
                return;
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Render each project
            projects.forEach((project, index) => {
                const html = createServiceProjectHTML(project, index);
                container.innerHTML += html;
            });
            
            // Add animations
            setTimeout(() => {
                container.querySelectorAll('.agency-service-project-card').forEach((card, i) => {
                    card.style.animationDelay = `${i * 100}ms`;
                    card.classList.add('agency-fade-in');
                });
            }, 100);
        });
    }
    

    /**
     * Create HTML for a project on service page - USING CASE STUDY CLASSES
     */
    function createServiceProjectHTML(project, index) {
        const delay = (index % 3) * 100;
        
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
            <div class="col-lg-4">
                <div class="agency-case-study-grid agency-fade-in" style="animation-delay: ${delay}ms" data-category="${project.category}">
                    <div class="agency-case-study-grid__header">
                        <span class="agency-case-study-grid__category">${project.category === 'web-app' ? 'Web App' : 
                        project.category === 'mobile-app' ? 'Mobile App' : 
                        project.category === 'product-design' ? 'Product Design' : 
                        'SEO & Growth'}</span>
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
                        <a href="${project.link || '#'}" class="agency-case-study-grid__link">
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
     * Create message when no projects are found
     */
    function createNoProjectsMessage(category) {
        const categoryNames = {
            'web-app': 'web application',
            'mobile-app': 'mobile application',
            'product-design': 'product design',
            'seo-growth': 'SEO & growth'
        };
        
        const name = categoryNames[category] || category;
        
        return `
            <div class="col-12">
                <div class="agency-no-projects">
                    <div class="agency-no-projects__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="agency-no-projects__title">No ${name} projects yet</h3>
                    <p class="agency-no-projects__description">
                        Check back soon for our latest ${name} success stories, or 
                        <a href="/contact.html">contact us</a> to start your project.
                    </p>
                </div>
            </div>
        `;
    }
    
    /**
     * Show error messages if data fails to load
     */
    function showErrorMessages() {
        const serviceContainers = document.querySelectorAll('[data-needs-projects]');
        
        serviceContainers.forEach(container => {
            const loadingElement = container.querySelector('.agency-loading');
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <div class="agency-data-error">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p class="mt-2">Unable to load projects. Please refresh the page.</p>
                    </div>
                `;
            }
        });
    }
    
    /**
     * Format metric labels for display
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
            'chartTypes': 'Chart Types'
        };
        return labels[key] || key;
    }
    
})();