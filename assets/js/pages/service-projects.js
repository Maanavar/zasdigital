/**
 * ZAS Digital - Service Projects Loader
 * Loads projects for individual service pages
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { DataLoader } from '../core/data-loader.js';
import { EventBus } from '../core/events.js';

export const ServiceProjects = (function() {
    'use strict';
    
    /**
     * Initialize service projects
     */
    function init() {
        const serviceContainers = Utils.getElements('[data-needs-projects]');
        if (!serviceContainers.length) return;
        
        // Listen for data
        EventBus.once('dataLoaded', renderServiceProjects);
        
        // Load data if needed
        if (!DataLoader.isLoaded && !DataLoader.isLoading) {
            DataLoader.loadAllData();
        }
        
        console.log('Service projects module initialized');
    }
    
    /**
     * Render service projects
     */
    function renderServiceProjects() {
        const serviceContainers = Utils.getElements('[data-needs-projects]');
        
        serviceContainers.forEach(container => {
            const category = container.getAttribute('data-service-category');
            if (!category) return;
            
            // Clear loading
            const loadingElement = container.querySelector('.agency-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Get projects
            const projects = DataLoader.getProjects({ 
                category: category,
                featured: true,
                limit: 3
            });
            
            if (projects.length === 0) {
                container.innerHTML = createNoProjectsMessage(category);
                return;
            }
            
            // Clear and render
            container.innerHTML = '';
            projects.forEach((project, index) => {
                const html = createServiceProjectHTML(project, index);
                container.innerHTML += html;
            });
            
            // Add animations
            setTimeout(() => {
                Utils.getElements('.agency-case-study-grid', container).forEach((card, i) => {
                    card.style.animationDelay = `${i * 100}ms`;
                    Utils.addClass(card, 'agency-fade-in');
                });
            }, 100);
        });
    }
    
    /**
     * Create HTML for a project on service page - USING CASE STUDY CLASSES
     */
    function createServiceProjectHTML(project, index) {
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
            <div class="col-lg-4">
                <div class="agency-case-study-grid agency-fade-in" style="animation-delay: ${delay}ms" data-category="${project.category}">
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
                <div class="agency-case-no-results">
                    <div class="agency-case-no-results__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="agency-case-no-results__title">No ${name} projects yet</h3>
                    <p class="agency-case-no-results__description">
                        Check back soon for our latest ${name} success stories, or 
                        <a href="/contact.html">contact us</a> to start your project.
                    </p>
                </div>
            </div>
        `;
    }
    
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
    
    function getCategoryLabel(category) {
        return category === 'web-app' ? 'Web App' : 
               category === 'mobile-app' ? 'Mobile App' : 
               category === 'product-design' ? 'Product Design' : 
               'SEO & Growth';
    }
    
    return {
        init,
        renderServiceProjects
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceProjects;
}

// Make available globally
window.ZASServiceProjects = ServiceProjects;