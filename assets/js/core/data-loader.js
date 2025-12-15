/**
 * ZAS Digital - Enhanced Data Loader
 * Cached, efficient data loading with event-driven updates
 * Version: 2.0.0
 */

export const DataLoader = (function() {
    'use strict';
    
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const STORAGE_KEY = 'zas-data-cache';
    
    let projects = [];
    let team = [];
    let testimonials = [];
    let isLoading = false;
    let loadCallbacks = [];
    
    /**
     * Load all data with caching
     */
    async function loadAllData(forceRefresh = false) {
        if (isLoading) {
            return new Promise((resolve) => {
                loadCallbacks.push(resolve);
            });
        }
        
        isLoading = true;
        
        try {
            // Check cache first
            if (!forceRefresh) {
                const cached = getCachedData();
                if (cached) {
                    projects = cached.projects;
                    team = cached.team;
                    testimonials = cached.testimonials;
                    finishLoading();
                    return { projects, team, testimonials };
                }
            }
            
            // Load fresh data
            const [projectsData, teamData, testimonialsData] = await Promise.all([
                fetchData('/assets/js/projects.json'),
                fetchData('/assets/js/team.json'),
                fetchData('/assets/js/testimonials.json')
            ]);
            
            projects = projectsData.projects || [];
            team = teamData.team || [];
            testimonials = testimonialsData.testimonials || [];
            
            // Cache the data
            cacheData({ projects, team, testimonials });
            
            finishLoading();
            return { projects, team, testimonials };
            
        } catch (error) {
            console.error('Error loading data:', error);
            isLoading = false;
            
            // Try session storage as fallback
            const sessionData = loadFromSessionStorage();
            if (sessionData) {
                projects = sessionData.projects;
                team = sessionData.team;
                testimonials = sessionData.testimonials;
                finishLoading();
                return sessionData;
            }
            
            throw error;
        }
    }
    
    /**
     * Fetch data with retry logic
     */
    async function fetchData(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    /**
     * Cache data with timestamp
     */
    function cacheData(data) {
        const cache = {
            timestamp: Date.now(),
            data
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
    
    /**
     * Get cached data if valid
     */
    function getCachedData() {
        try {
            const cache = sessionStorage.getItem(STORAGE_KEY);
            if (!cache) return null;
            
            const { timestamp, data } = JSON.parse(cache);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
            
            // Cache expired
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Load from session storage (legacy)
     */
    function loadFromSessionStorage() {
        try {
            const storedProjects = sessionStorage.getItem('zas-projects');
            const storedTeam = sessionStorage.getItem('zas-team');
            const storedTestimonials = sessionStorage.getItem('zas-testimonials');
            
            if (storedProjects && storedTeam && storedTestimonials) {
                return {
                    projects: JSON.parse(storedProjects),
                    team: JSON.parse(storedTeam),
                    testimonials: JSON.parse(storedTestimonials)
                };
            }
        } catch (error) {
            console.error('Error loading from session storage:', error);
        }
        return null;
    }
    
    /**
     * Finish loading and notify callbacks
     */
    function finishLoading() {
        isLoading = false;
        
        // Emit event
        if (window.ZASEvents) {
            ZASEvents.emit('dataLoaded', { projects, team, testimonials });
        } else {
            document.dispatchEvent(new CustomEvent('zas:dataLoaded', {
                detail: { projects, team, testimonials }
            }));
        }
        
        // Resolve pending callbacks
        loadCallbacks.forEach(callback => callback({ projects, team, testimonials }));
        loadCallbacks = [];
    }
    
    /**
     * Get projects with filtering
     */
    function getProjects(filters = {}) {
        let filtered = [...projects];
        
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
                (p.techStack || []).some(tech => tech.toLowerCase().includes(searchTerm))
            );
        }
        
        return filtered;
    }
    
    /**
     * Get random projects
     */
    function getRandomProjects(count = 3) {
        const shuffled = [...projects].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, projects.length));
    }
    
    /**
     * Get project by ID
     */
    function getProjectById(id) {
        return projects.find(p => p.id === id) || null;
    }
    
    /**
     * Get team members
     */
    function getTeam() {
        return [...team].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    /**
     * Get team member by ID
     */
    function getTeamMemberById(id) {
        return team.find(m => m.id === id) || null;
    }
    
    /**
     * Get testimonials
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
     * Get testimonials by project
     */
    function getTestimonialsByProject(projectName) {
        return testimonials.filter(t => t.project === projectName);
    }
    
    /**
     * Get unique clients
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
     * Get category statistics
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
     */
    function search(query) {
        const searchTerm = query.toLowerCase();
        
        const projectResults = projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.client.toLowerCase().includes(searchTerm) ||
            (p.techStack || []).some(tech => tech.toLowerCase().includes(searchTerm))
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
    
    /**
     * Clear cache
     */
    function clearCache() {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('zas-projects');
        sessionStorage.removeItem('zas-team');
        sessionStorage.removeItem('zas-testimonials');
    }
    
    return {
        loadAllData,
        getProjects,
        getRandomProjects,
        getProjectById,
        getTeam,
        getTeamMemberById,
        getTestimonials,
        getTestimonialsByProject,
        getClients,
        getCategoryStats,
        search,
        clearCache,
        
        // Current state
        get currentProjects() { return projects; },
        get currentTeam() { return team; },
        get currentTestimonials() { return testimonials; },
        get isLoaded() { return projects.length > 0 && team.length > 0; },
        get isLoading() { return isLoading; }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}

// Make available globally
window.ZASData = DataLoader;