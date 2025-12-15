/**
 * ZAS Digital - Theme Module
 * Handles dark/light mode switching
 * Version: 2.0.0
 */

import { Utils } from '../core/utils.js';
import { EventBus } from '../core/events.js';

export const Theme = (function() {
    'use strict';
    
    const STORAGE_KEY = 'agency-theme';
    let currentTheme = 'light';
    
    /**
     * Initialize theme toggle
     */
    function init() {
        const themeToggle = Utils.getElement('#themeToggle');
        if (!themeToggle) return;
        
        // Get saved preference or system preference
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (systemPrefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
        
        // Toggle theme on button click
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        console.log('Theme module initialized');
    }
    
    /**
     * Set theme
     */
    function setTheme(theme) {
        const htmlElement = document.documentElement;
        const themeToggle = Utils.getElement('#themeToggle');
        
        // Remove both theme classes
        Utils.removeClass(htmlElement, 'agency-theme-dark');
        Utils.removeClass(htmlElement, 'agency-theme-light');
        
        // Add new theme class
        Utils.addClass(htmlElement, `agency-theme-${theme}`);
        
        // Update localStorage
        localStorage.setItem(STORAGE_KEY, theme);
        
        // Update button aria-label
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        
        currentTheme = theme;
        
        // Emit event
        EventBus.emit('themeChanged', { theme });
    }
    
    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    /**
     * Get current theme
     */
    function getCurrentTheme() {
        return currentTheme;
    }
    
    /**
     * Check if dark mode is active
     */
    function isDarkMode() {
        return currentTheme === 'dark';
    }
    
    /**
     * Reset to system preference
     */
    function resetToSystem() {
        localStorage.removeItem(STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }
    
    return {
        init,
        setTheme,
        toggleTheme,
        getCurrentTheme,
        isDarkMode,
        resetToSystem
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Theme;
}

// Make available globally
window.ZASTheme = Theme;