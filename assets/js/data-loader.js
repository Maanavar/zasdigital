/**
 * ZAS Digital - Data Loader Module
 * Loads and manages JSON data for projects, team, and testimonials
 * Version: 1.0.0
 */

const ZASData = (function() {
    'use strict';
    
    let projects = [];
    let team = [];
    let testimonials = [];
    let isLoading = false;
    
    /**
     * Load all data from JSON files
     * @returns {Promise} Promise that resolves when all data is loaded
     */
    async function loadAllData() {
        if (isLoading) {
            return Promise.reject('Data is already loading');
        }
        
        isLoading = true;
        
        try {
            // Load all data in parallel
            const [projectsData, teamData, testimonialsData] = await Promise.all([
                fetch('/assets/js/projects.json').then(r => r.json()),
                fetch('/assets/js/team.json').then(r => r.json()),
                fetch('/assets/js/testimonials.json').then(r => r.json())
            ]);
            
            projects = projectsData.projects || [];
            team = teamData.team || [];
            testimonials = testimonialsData.testimonials || [];
            
            // Store in session storage for faster subsequent loads
            sessionStorage.setItem('zas-projects', JSON.stringify(projects));
            sessionStorage.setItem('zas-team', JSON.stringify(team));
            sessionStorage.setItem('zas-testimonials', JSON.stringify(testimonials));
            
            isLoading = false;
            
            // Dispatch custom event when data is loaded
            document.dispatchEvent(new CustomEvent('zas:dataLoaded', {
                detail: { projects, team, testimonials }
            }));
            
            return { projects, team, testimonials };
            
        } catch (error) {
            console.error('Error loading data:', error);
            isLoading = false;
            
            // Try to load from session storage as fallback
            return loadFromSessionStorage();
        }
    }
    
    /**
     * Load data from session storage as fallback
     */
    function loadFromSessionStorage() {
        try {
            const storedProjects = sessionStorage.getItem('zas-projects');
            const storedTeam = sessionStorage.getItem('zas-team');
            const storedTestimonials = sessionStorage.getItem('zas-testimonials');
            
            if (storedProjects) projects = JSON.parse(storedProjects);
            if (storedTeam) team = JSON.parse(storedTeam);
            if (storedTestimonials) testimonials = JSON.parse(storedTestimonials);
            
            return { projects, team, testimonials };
        } catch (error) {
            console.error('Error loading from session storage:', error);
            return { projects: [], team: [], testimonials: [] };
        }
    }
    
    /**
     * Get projects with optional filtering
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered projects
     */
    function getProjects(filters = {}) {
        let filtered = [...projects];
        
        // Apply filters
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }
        
        if (filters.featured !== undefined) {
            filtered = filtered.filter(p => p.featured === filters.featured);
        }
        
        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.client.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }
    
    /**
     * Get a specific project by ID
     * @param {number} id - Project ID
     * @returns {Object|null} Project object or null
     */
    function getProjectById(id) {
        return projects.find(p => p.id === id) || null;
    }
    
    /**
     * Get projects by category
     * @param {string} category - Project category
     * @returns {Array} Projects in category
     */
    function getProjectsByCategory(category) {
        return projects.filter(p => p.category === category);
    }
    
    /**
     * Get all team members
     * @returns {Array} Team members
     */
    function getTeam() {
        return [...team].sort((a, b) => a.order - b.order);
    }
    
    /**
     * Get team statistics
     * @returns {Object} Team stats
     */
    function getTeamStats() {
        return {
            teamSize: team.length,
            yearsExperience: Math.max(...team.map(m => parseInt(m.experience) || 0)),
            projectsDelivered: projects.length,
            clientSatisfaction: "4.9★"
        };
    }
    
    /**
     * Get testimonials with optional filtering
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered testimonials
     */
    function getTestimonials(filters = {}) {
        let filtered = [...testimonials];
        
        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }
        
        if (filters.category) {
            filtered = filtered.filter(t => t.category === filters.category);
        }
        
        if (filters.rating) {
            filtered = filtered.filter(t => t.rating >= filters.rating);
        }
        
        return filtered;
    }
    
    /**
     * Get testimonials for a specific project
     * @param {string} projectName - Project name
     * @returns {Array} Testimonials for project
     */
    function getTestimonialsForProject(projectName) {
        return testimonials.filter(t => t.project === projectName);
    }
    
    /**
     * Get all client names
     * @returns {Array} Client names
     */
    function getClients() {
        const clients = new Set();
        projects.forEach(p => {
            if (p.client && !p.client.includes('Internal') && !p.client.includes('Confidential')) {
                clients.add(p.company || p.client.split(',')[0]);
            }
        });
        return Array.from(clients);
    }
    
    /**
     * Get project categories with counts
     * @returns {Object} Category counts
     */
    function getCategoryStats() {
        const stats = {};
        projects.forEach(p => {
            stats[p.category] = (stats[p.category] || 0) + 1;
        });
        return stats;
    }
    
    /**
     * Search across all data
     * @param {string} query - Search query
     * @returns {Object} Search results
     */
    function search(query) {
        const searchTerm = query.toLowerCase();
        
        const projectResults = projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.client.toLowerCase().includes(searchTerm) ||
            p.techStack.some(tech => tech.toLowerCase().includes(searchTerm))
        );
        
        const testimonialResults = testimonials.filter(t =>
            t.name.toLowerCase().includes(searchTerm) ||
            t.quote.toLowerCase().includes(searchTerm) ||
            t.company.toLowerCase().includes(searchTerm)
        );
        
        return {
            projects: projectResults,
            testimonials: testimonialResults,
            total: projectResults.length + testimonialResults.length
        };
    }
    
    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        // Load data immediately for pages that need it
        const needsData = document.querySelector('[data-needs-projects], [data-needs-team], [data-needs-testimonials]');
        if (needsData) {
            loadAllData();
        }
    });
    
    // Public API
    return {
        loadAllData,
        getProjects,
        getProjectById,
        getProjectsByCategory,
        getTeam,
        getTeamStats,
        getTestimonials,
        getTestimonialsForProject,
        getClients,
        getCategoryStats,
        search,
        
        // Current data state
        get currentProjects() { return projects; },
        get currentTeam() { return team; },
        get currentTestimonials() { return testimonials; },
        get isLoaded() { return projects.length > 0 && team.length > 0; }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZASData;
}

// Make available globally
window.ZASData = ZASData;