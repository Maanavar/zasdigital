/**
 * ZAS Digital - FAQ Module
 * Unified FAQ accordion functionality for all pages
 * Version: 1.0.0
 */

import { Utils } from '../core/utils.js';

export const FAQ = (function() {
    'use strict';
    
    let faqInstances = [];
    
    /**
     * Initialize all FAQs on page
     */
    function init() {
        // Clear previous instances
        faqInstances = [];
        
        // Find all FAQ containers (try both selectors for compatibility)
        const faqContainers = Utils.getElements('.agency-faq');
        
        faqContainers.forEach(container => {
            // Try new structure first (.agency-faq__item)
            let faqItems = Utils.getElements('.agency-faq__item', container);
            
            // If no items found with new structure, try old structure (.agency-faq-item)
            if (faqItems.length === 0) {
                faqItems = Utils.getElements('.agency-faq-item', container);
            }
            
            faqItems.forEach((item, index) => {
                // Try to find question in both structures
                let question = item.querySelector('.agency-faq__question');
                if (!question) question = item.querySelector('.agency-faq-item__question');
                
                // Try to find answer in both structures
                let answer = item.querySelector('.agency-faq__answer');
                if (!answer) answer = item.querySelector('.agency-faq-item__answer');
                
                if (question && answer) {
                    // Set ARIA attributes
                    const questionId = question.id || `faq-q-${Date.now()}-${index}`;
                    const answerId = answer.id || `faq-a-${Date.now()}-${index}`;
                    
                    if (!question.id) question.id = questionId;
                    if (!answer.id) answer.id = answerId;
                    
                    question.setAttribute('aria-controls', answerId);
                    question.setAttribute('aria-expanded', 'false');
                    answer.setAttribute('aria-labelledby', questionId);
                    answer.setAttribute('aria-hidden', 'true');
                    
                    // Add click handler
                    question.addEventListener('click', (e) => {
                        e.preventDefault();
                        toggleFAQ(question, answer, container);
                    });
                    
                    // Add keyboard support
                    question.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleFAQ(question, answer, container);
                        }
                    });
                    
                    // Store instance
                    faqInstances.push({ question, answer, container: item });
                    
                    // Add CSS class for styling
                    Utils.addClass(item, 'fas-faq-initialized');
                }
            });
        });
        
        console.log(`FAQ module initialized with ${faqInstances.length} FAQs`);
        return faqInstances.length;
    }
    
    /**
     * Toggle FAQ open/close state
     */
    function toggleFAQ(question, answer, container) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const shouldOpen = !isExpanded;
        
        // If opening, close others in the same container
        if (shouldOpen && !question.hasAttribute('data-allow-multiple')) {
            const allQuestions = Utils.getElements('.agency-faq__question, .agency-faq-item__question', container.closest('.agency-faq'));
            
            allQuestions.forEach(q => {
                if (q !== question && q.getAttribute('aria-expanded') === 'true') {
                    const aId = q.getAttribute('aria-controls');
                    const a = Utils.getElement(`#${aId}`);
                    if (a) {
                        closeFAQ(q, a);
                    }
                }
            });
        }
        
        if (shouldOpen) {
            openFAQ(question, answer);
        } else {
            closeFAQ(question, answer);
        }
    }
    
    /**
     * Open specific FAQ
     */
    function openFAQ(question, answer) {
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
        
        // Add active class
        const item = question.closest('.agency-faq__item, .agency-faq-item');
        if (item) {
            Utils.addClass(item, 'fas-faq-active');
        }
        
        // Smooth scroll if needed
        if (!isElementInViewport(answer)) {
            setTimeout(() => {
                answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
    
    /**
     * Close specific FAQ
     */
    function closeFAQ(question, answer) {
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
        
        const item = question.closest('.agency-faq__item, .agency-faq-item');
        if (item) {
            Utils.removeClass(item, 'fas-faq-active');
        }
    }
    
    /**
     * Open FAQ by index
     */
    function openByIndex(index) {
        if (faqInstances[index]) {
            const { question, answer } = faqInstances[index];
            openFAQ(question, answer);
        }
    }
    
    /**
     * Close all FAQs
     */
    function closeAll() {
        faqInstances.forEach(({ question, answer }) => {
            closeFAQ(question, answer);
        });
    }
    
    /**
     * Check if element is in viewport
     */
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Get FAQ instances
     */
    function getInstances() {
        return faqInstances;
    }
    
    return {
        init,
        openByIndex,
        closeAll,
        getInstances
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQ;
}

// Make available globally
window.ZASFAQ = FAQ;