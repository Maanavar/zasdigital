/**
 * ZAS Digital - Event Bus System
 * Centralized event management
 * Version: 2.0.0
 */

export const EventBus = (function() {
    'use strict';
    
    const events = new Map();
    
    /**
     * Subscribe to an event
     */
    function on(event, callback) {
        if (!events.has(event)) {
            events.set(event, []);
        }
        events.get(event).push(callback);
        document.addEventListener(`zas:${event}`, callback);
    }
    
    /**
     * Subscribe once to an event
     */
    function once(event, callback) {
        const onceCallback = function(e) {
            callback(e);
            off(event, onceCallback);
        };
        on(event, onceCallback);
    }
    
    /**
     * Unsubscribe from an event
     */
    function off(event, callback) {
        if (events.has(event)) {
            document.removeEventListener(`zas:${event}`, callback);
            const callbacks = events.get(event).filter(cb => cb !== callback);
            events.set(event, callbacks);
        }
    }
    
    /**
     * Emit an event
     */
    function emit(event, data = {}) {
        document.dispatchEvent(new CustomEvent(`zas:${event}`, {
            detail: data
        }));
    }
    
    /**
     * Remove all listeners for an event
     */
    function removeAll(event) {
        if (events.has(event)) {
            events.get(event).forEach(callback => {
                document.removeEventListener(`zas:${event}`, callback);
            });
            events.delete(event);
        }
    }
    
    /**
     * Get all registered events
     */
    function getEvents() {
        return Array.from(events.keys());
    }
    
    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
        events.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                document.removeEventListener(`zas:${event}`, callback);
            });
        });
        events.clear();
    });
    
    return {
        on,
        once,
        off,
        emit,
        removeAll,
        getEvents
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}

// Make available globally
window.ZASEvents = EventBus;