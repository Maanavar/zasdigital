/**
 * ZAS Digital - Dynamic Content Renderer
 * Renders projects, team, and testimonials dynamically
 * Version: 1.0.0
 */

const ZASRenderer = (function() {
    'use strict';
    
    /**
     * Render projects to a container
     * @param {string} containerId - Container element ID
     * @param {Object} options - Render options
     */
    function renderProjects(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return;
        }
        
        const projects = ZASData.getProjects(options.filters || {});
        
        if (projects.length === 0) {
            container.innerHTML = createNoResultsMessage();
            return;
        }
        
        const template = options.template || 'grid';
        const html = projects.map((project, index) => 
            createProjectHTML(project, template, index)
        ).join('');
        
        container.innerHTML = html;
        
        // Add animations
        setTimeout(() => {
            container.querySelectorAll('.agency-project-card').forEach((card, i) => {
                card.style.animationDelay = `${i * 100}ms`;
                card.classList.add('agency-fade-in');
            });
        }, 100);
        
        // Dispatch event when rendered
        document.dispatchEvent(new CustomEvent('zas:projectsRendered', {
            detail: { containerId, count: projects.length }
        }));
    }
    
    /**
     * Create project HTML based on template
     */
    function createProjectHTML(project, template, index) {
        const delay = (index % 3) * 100;
        
        switch(template) {
            case 'grid':
                return `
                    <div class="col-lg-4 col-md-6" data-category="${project.category}">
                        <div class="agency-case-study-grid agency-fade-in" style="animation-delay: ${delay}ms">
                            <div class="agency-case-study-grid__header">
                                <span class="agency-case-study-grid__category">${getCategoryLabel(project.category)}</span>
                                <h3 class="agency-case-study-grid__title">${project.name}</h3>
                            </div>
                            <div class="agency-case-study-grid__image">
                                <div class="agency-case-study-grid__image-placeholder">
                                    <div class="agency-case-study-grid__image-text">${project.name}</div>
                                </div>
                            </div>
                            <div class="agency-case-study-grid__content">
                                <p class="agency-case-study-grid__description">${project.description}</p>
                                <div class="agency-case-study-grid__tech">
                                    ${project.techStack.slice(0, 3).map(tech => 
                                        `<span class="agency-case-study-grid__tech-tag">${tech}</span>`
                                    ).join('')}
                                </div>
                                <div class="agency-case-study-grid__results">
                                    ${Object.entries(project.metrics || {}).slice(0, 2).map(([key, value]) => `
                                        <div class="agency-case-study-grid__result">
                                            <span class="agency-case-study-grid__result-value">${value}</span>
                                            <span class="agency-case-study-grid__result-label">${formatMetricLabel(key)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <a href="${project.link}" class="agency-case-study-grid__link">
                                    View Case Study
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 8H15M8 1L15 8L8 15"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'list':
                return `
                    <div class="agency-project-list-item" data-category="${project.category}">
                        <div class="agency-project-list-item__content">
                            <div class="agency-project-list-item__header">
                                <span class="agency-project-list-item__category">${getCategoryLabel(project.category)}</span>
                                <h3 class="agency-project-list-item__title">${project.name}</h3>
                                <span class="agency-project-list-item__client">${project.client}</span>
                            </div>
                            <p class="agency-project-list-item__description">${project.description}</p>
                            <div class="agency-project-list-item__footer">
                                <div class="agency-project-list-item__tech">
                                    ${project.techStack.slice(0, 4).map(tech => 
                                        `<span class="agency-project-list-item__tech-tag">${tech}</span>`
                                    ).join('')}
                                </div>
                                <a href="${project.link}" class="agency-project-list-item__link">View Details</a>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                return '';
        }
    }
    
    /**
     * Render team members to a container
     */
    function renderTeam(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const team = ZASData.getTeam();
        
        const html = team.map((member, index) => `
            <div class="col-md-4">
                <div class="agency-team-card agency-fade-in" style="animation-delay: ${index * 100}ms">
                    <div class="agency-team-card__image">
                        <div class="agency-team-card__avatar">
                            <div class="agency-team-card__avatar-placeholder">
                                ${getInitials(member.name)}
                            </div>
                        </div>
                    </div>
                    <div class="agency-team-card__content">
                        <h3 class="agency-team-card__name">${member.name}</h3>
                        <p class="agency-team-card__role">${member.role}</p>
                        <p class="agency-team-card__bio">${member.bio}</p>
                        <div class="agency-team-card__expertise">
                            ${member.expertise.slice(0, 3).map(exp => 
                                `<span class="agency-team-card__expertise-tag">${exp}</span>`
                            ).join('')}
                        </div>
                        ${member.linkedin ? `
                            <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" 
                               class="agency-team-card__linkedin" aria-label="${member.name}'s LinkedIn profile">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                    <rect x="2" y="9" width="4" height="12"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    /**
     * Render testimonials to a container
     */
    function renderTestimonials(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const testimonials = ZASData.getTestimonials(options);
        
        if (testimonials.length === 0) {
            container.innerHTML = '<p class="agency-no-testimonials">No testimonials available.</p>';
            return;
        }
        
        const template = options.template || 'slider';
        
        if (template === 'slider') {
            renderTestimonialSlider(container, testimonials);
        } else {
            renderTestimonialGrid(container, testimonials);
        }
    }
    
    /**
     * Render testimonial slider
     */
    function renderTestimonialSlider(container, testimonials) {
        const slides = testimonials.map((testimonial, index) => `
            <div class="agency-testimonial-slider__slide" ${index === 0 ? 'data-active="true"' : ''}>
                <div class="agency-testimonial">
                    <div class="agency-testimonial__content">
                        <p class="agency-testimonial__quote">"${testimonial.quote}"</p>
                    </div>
                    <div class="agency-testimonial__author">
                        <div class="agency-testimonial__avatar">
                            <div class="agency-testimonial__avatar-placeholder">${testimonial.avatar}</div>
                        </div>
                        <div class="agency-testimonial__info">
                            <h4 class="agency-testimonial__name">${testimonial.name}</h4>
                            <p class="agency-testimonial__role">${testimonial.role}, ${testimonial.company}</p>
                            <div class="agency-testimonial__project">Project: ${testimonial.project}</div>
                            <div class="agency-testimonial__rating">
                                ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div class="agency-testimonial-slider__track" id="testimonialTrack">
                ${slides}
            </div>
            ${testimonials.length > 1 ? `
                <div class="agency-testimonial-slider__controls">
                    <button class="agency-testimonial-slider__prev" id="testimonialPrev" aria-label="Previous testimonial">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 1L1 8L15 15"/>
                        </svg>
                    </button>
                    <div class="agency-testimonial-slider__dots" id="testimonialDots"></div>
                    <button class="agency-testimonial-slider__next" id="testimonialNext" aria-label="Next testimonial">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 1L15 8L1 15"/>
                        </svg>
                    </button>
                </div>
            ` : ''}
        `;
        
        // Initialize slider if multiple testimonials
        if (testimonials.length > 1 && typeof initTestimonialSlider === 'function') {
            setTimeout(() => initTestimonialSlider(), 100);
        }
    }
    
    /**
     * Render testimonial grid
     */
    function renderTestimonialGrid(container, testimonials) {
        const html = testimonials.map(testimonial => `
            <div class="agency-testimonial-card">
                <div class="agency-testimonial-card__content">
                    <p class="agency-testimonial-card__quote">"${testimonial.quote}"</p>
                </div>
                <div class="agency-testimonial-card__author">
                    <div class="agency-testimonial-card__avatar">
                        ${testimonial.avatar}
                    </div>
                    <div class="agency-testimonial-card__info">
                        <div class="agency-testimonial-card__name">${testimonial.name}</div>
                        <div class="agency-testimonial-card__role">${testimonial.role}</div>
                        <div class="agency-testimonial-card__company">${testimonial.company}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    /**
     * Update statistics on the page
     */
    function updateStatistics() {
        const stats = ZASData.getTeamStats();
        
        // Update stats elements
        const statElements = {
            'teamSize': document.querySelector('[data-stat="team-size"]'),
            'projectsDelivered': document.querySelector('[data-stat="projects-delivered"]'),
            'yearsExperience': document.querySelector('[data-stat="years-experience"]'),
            'clientSatisfaction': document.querySelector('[data-stat="client-satisfaction"]')
        };
        
        Object.entries(statElements).forEach(([key, element]) => {
            if (element && stats[key]) {
                element.textContent = stats[key];
                if (element.hasAttribute('data-count')) {
                    element.setAttribute('data-count', stats[key].toString().replace(/[^0-9.]/g, ''));
                }
            }
        });
    }
    
    /**
     * Render client logos
     */
    function renderClientLogos(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const clients = ZASData.getClients();
        
        const html = clients.map(client => `
            <div class="agency-client-logo">
                <div class="agency-client-logo__placeholder">
                    ${client.split(' ').map(word => word[0]).join('')}
                </div>
                <span class="agency-client-logo__name">${client}</span>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    /**
     * Helper functions
     */
    function getCategoryLabel(category) {
        const labels = {
            'web-app': 'Web Application',
            'mobile-app': 'Mobile Application',
            'product-design': 'Product Design',
            'seo-growth': 'SEO & Growth'
        };
        return labels[category] || category;
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
            'matches': 'Successful Matches'
        };
        return labels[key] || key;
    }
    
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    function createNoResultsMessage() {
        return `
            <div class="agency-no-results">
                <div class="agency-no-results__icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                </div>
                <h3 class="agency-no-results__title">No Projects Found</h3>
                <p class="agency-no-results__description">
                    Try adjusting your filters or search criteria.
                </p>
            </div>
        `;
    }
    
    // Auto-initialize based on data attributes
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for data to be loaded
        document.addEventListener('zas:dataLoaded', () => {
            // Render projects
            document.querySelectorAll('[data-render-projects]').forEach(container => {
                const containerId = container.id || container.dataset.renderProjects;
                const filters = container.dataset.filters ? JSON.parse(container.dataset.filters) : {};
                const template = container.dataset.template || 'grid';
                
                renderProjects(containerId, { filters, template });
            });
            
            // Render team
            document.querySelectorAll('[data-render-team]').forEach(container => {
                renderTeam(container.id || container.dataset.renderTeam);
            });
            
            // Render testimonials
            document.querySelectorAll('[data-render-testimonials]').forEach(container => {
                const options = container.dataset.options ? JSON.parse(container.dataset.options) : {};
                renderTestimonials(container.id || container.dataset.renderTestimonials, options);
            });
            
            // Update statistics
            if (document.querySelector('[data-stat]')) {
                updateStatistics();
            }
            
            // Render client logos
            document.querySelectorAll('[data-render-clients]').forEach(container => {
                renderClientLogos(container.id || container.dataset.renderClients);
            });
        });
        
        // Load data if any render elements exist
        if (document.querySelector('[data-render-projects], [data-render-team], [data-render-testimonials]')) {
            ZASData.loadAllData();
        }
    });
    
    // Public API
    return {
        renderProjects,
        renderTeam,
        renderTestimonials,
        updateStatistics,
        renderClientLogos
    };
})();

// Make available globally
window.ZASRenderer = ZASRenderer;