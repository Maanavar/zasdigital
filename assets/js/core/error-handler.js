/**
 * ZAS Digital - Error Handler
 * Centralized error tracking and handling
 * Version: 2.0.0
 */

export const ErrorHandler = (function() {
    'use strict';
    
    let isInitialized = false;
    const errors = [];
    
    /**
     * Initialize error handling
     */
    function init() {
        if (isInitialized) return;
        
        // Global error handler
        window.addEventListener('error', handleError);
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', handlePromiseRejection);
        
        // Console error wrapper
        wrapConsoleErrors();
        
        isInitialized = true;
        console.log('Error handler initialized');
    }
    
    /**
     * Handle JavaScript errors
     */
    function handleError(event) {
        const error = {
            type: 'error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
            timestamp: new Date().toISOString()
        };
        
        logError(error);
        
        // Dispatch event for other components
        if (window.ZASEvents) {
            ZASEvents.emit('error', error);
        }
        
        // Don't prevent default browser error handling
        return false;
    }
    
    /**
     * Handle promise rejections
     */
    function handlePromiseRejection(event) {
        const error = {
            type: 'promise',
            reason: event.reason,
            promise: event.promise,
            timestamp: new Date().toISOString()
        };
        
        logError(error);
        
        if (window.ZASEvents) {
            ZASEvents.emit('promiseError', error);
        }
    }
    
    /**
     * Log error to console and internal storage
     */
    function logError(error) {
        errors.push(error);
        
        // Keep only last 100 errors
        if (errors.length > 100) {
            errors.shift();
        }
        
        // Console logging in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ZAS Error:', error);
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && window.ZASDigital?.trackError) {
            window.ZASDigital.trackError(error);
        }
    }
    
    /**
     * Wrap console errors for better tracking
     */
    function wrapConsoleErrors() {
        const originalError = console.error;
        console.error = function(...args) {
            const error = {
                type: 'console',
                message: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '),
                timestamp: new Date().toISOString()
            };
            
            logError(error);
            originalError.apply(console, args);
        };
    }
    
    /**
     * Safe function execution with error handling
     */
    function safeExecute(fn, context, ...args) {
        try {
            return fn.apply(context, args);
        } catch (error) {
            logError({
                type: 'function',
                functionName: fn.name || 'anonymous',
                error: error,
                timestamp: new Date().toISOString()
            });
            
            // Return null or default value
            return null;
        }
    }
    
    /**
     * Get all logged errors
     */
    function getErrors() {
        return [...errors];
    }
    
    /**
     * Clear all errors
     */
    function clearErrors() {
        errors.length = 0;
    }
    
    /**
     * Create error boundary for components
     */
    function createErrorBoundary(componentName, fallbackHTML = '') {
        return function(target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            
            descriptor.value = function(...args) {
                try {
                    return originalMethod.apply(this, args);
                } catch (error) {
                    logError({
                        type: 'component',
                        component: componentName,
                        error: error,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Show fallback if element exists
                    if (fallbackHTML && this.element) {
                        this.element.innerHTML = fallbackHTML;
                    }
                    
                    return null;
                }
            };
            
            return descriptor;
        };
    }
    
    return {
        init,
        handleError,
        handlePromiseRejection,
        logError,
        safeExecute,
        getErrors,
        clearErrors,
        createErrorBoundary
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

// Make available globally
window.ZASErrorHandler = ErrorHandler;