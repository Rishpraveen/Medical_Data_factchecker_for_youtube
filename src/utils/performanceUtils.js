/**
 * Performance Utilities for Medical YouTube Optimizer
 * Includes debouncing, throttling, caching, and memory management
 */

class PerformanceUtils {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.requestCache = new Map();
        this.maxCacheSize = 100;
    }

    /**
     * Debounce function calls to prevent excessive API requests
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @param {string} key - Unique key for this debounced function
     * @returns {Function} Debounced function
     */
    debounce(func, delay, key = 'default') {
        return (...args) => {
            clearTimeout(this.debounceTimers.get(key));
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Throttle function calls to limit execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} delay - Minimum delay between calls
     * @param {string} key - Unique key for this throttled function
     * @returns {Function} Throttled function
     */
    throttle(func, delay, key = 'default') {
        return (...args) => {
            if (!this.throttleTimers.has(key)) {
                func.apply(this, args);
                
                const timer = setTimeout(() => {
                    this.throttleTimers.delete(key);
                }, delay);
                
                this.throttleTimers.set(key, timer);
            }
        };
    }

    /**
     * Memoization with LRU cache for expensive computations
     * @param {Function} func - Function to memoize
     * @param {Function} keyGenerator - Function to generate cache key
     * @returns {Function} Memoized function
     */
    memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
        return (...args) => {
            const key = keyGenerator(...args);
            
            if (this.cache.has(key)) {
                // Move to end (most recently used)
                const value = this.cache.get(key);
                this.cache.delete(key);
                this.cache.set(key, value);
                return value;
            }

            const result = func.apply(this, args);
            
            // Implement LRU eviction
            if (this.cache.size >= this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            this.cache.set(key, result);
            return result;
        };
    }

    /**
     * Async memoization with expiration
     * @param {Function} asyncFunc - Async function to memoize
     * @param {number} ttl - Time to live in milliseconds
     * @param {Function} keyGenerator - Function to generate cache key
     * @returns {Function} Memoized async function
     */
    memoizeAsync(asyncFunc, ttl = 300000, keyGenerator = (...args) => JSON.stringify(args)) {
        const cache = new Map();
        
        return async (...args) => {
            const key = keyGenerator(...args);
            const now = Date.now();
            
            if (cache.has(key)) {
                const { value, timestamp } = cache.get(key);
                if (now - timestamp < ttl) {
                    return value;
                }
                cache.delete(key);
            }

            try {
                const result = await asyncFunc.apply(this, args);
                cache.set(key, { value: result, timestamp: now });
                return result;
            } catch (error) {
                // Don't cache errors
                throw error;
            }
        };
    }

    /**
     * Request deduplication for identical API calls
     * @param {Function} requestFunc - Function that makes the request
     * @param {Function} keyGenerator - Function to generate request key
     * @returns {Function} Deduplicated request function
     */
    deduplicateRequests(requestFunc, keyGenerator = (...args) => JSON.stringify(args)) {
        return async (...args) => {
            const key = keyGenerator(...args);
            
            if (this.requestCache.has(key)) {
                return this.requestCache.get(key);
            }

            const promise = requestFunc.apply(this, args);
            this.requestCache.set(key, promise);
            
            try {
                const result = await promise;
                this.requestCache.delete(key);
                return result;
            } catch (error) {
                this.requestCache.delete(key);
                throw error;
            }
        };
    }

    /**
     * Batch multiple operations for efficiency
     * @param {Function} batchFunc - Function to handle batched operations
     * @param {number} delay - Delay before executing batch
     * @param {number} maxBatchSize - Maximum batch size
     * @returns {Function} Batched function
     */
    batchOperations(batchFunc, delay = 100, maxBatchSize = 10) {
        let batch = [];
        let timer = null;

        const executeBatch = () => {
            if (batch.length > 0) {
                const currentBatch = [...batch];
                batch = [];
                batchFunc(currentBatch);
            }
            timer = null;
        };

        return (operation) => {
            batch.push(operation);
            
            if (batch.length >= maxBatchSize) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                executeBatch();
            } else if (!timer) {
                timer = setTimeout(executeBatch, delay);
            }
        };
    }

    /**
     * Lazy loading with intersection observer
     * @param {Element} element - Element to observe
     * @param {Function} loadFunction - Function to execute when element is visible
     * @param {Object} options - IntersectionObserver options
     */
    lazyLoad(element, loadFunction, options = { threshold: 0.1 }) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadFunction();
                        observer.unobserve(element);
                    }
                });
            }, options);
            
            observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            loadFunction();
        }
    }

    /**
     * Memory cleanup utilities
     */
    cleanup() {
        // Clear all timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        
        // Clear caches
        this.cache.clear();
        this.requestCache.clear();
        this.debounceTimers.clear();
        this.throttleTimers.clear();
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.requestCache.size,
            activeDebounces: this.debounceTimers.size,
            activeThrottles: this.throttleTimers.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage (approximate)
     */
    estimateMemoryUsage() {
        let estimate = 0;
        
        this.cache.forEach((value, key) => {
            estimate += this.sizeof(key) + this.sizeof(value);
        });
        
        return estimate;
    }

    /**
     * Rough sizeof implementation
     */
    sizeof(obj) {
        let bytes = 0;
        
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    try {
                        bytes += JSON.stringify(obj).length * 2;
                    } catch (e) {
                        bytes += 100; // Fallback estimate
                    }
                    break;
            }
        }
        
        return bytes;
    }
}

// Console logging optimization
const optimizeConsoleLogging = () => {
    if (typeof console !== 'undefined' && process.env.NODE_ENV === 'production') {
        // Disable console.log in production, keep errors and warnings
        const originalLog = console.log;
        console.log = () => {}; // No-op in production
        
        // Keep important logs but throttle them
        const throttledError = performanceUtils.throttle(console.error.bind(console), 1000, 'console-error');
        const throttledWarn = performanceUtils.throttle(console.warn.bind(console), 1000, 'console-warn');
        
        console.error = throttledError;
        console.warn = throttledWarn;
    }
};

// DOM optimization utilities
const DOMUtils = {
    /**
     * Efficient DOM queries with caching
     */
    querySelector: (() => {
        const cache = new Map();
        return (selector, useCache = true) => {
            if (useCache && cache.has(selector)) {
                const element = cache.get(selector);
                if (document.contains(element)) {
                    return element;
                }
                cache.delete(selector);
            }
            
            const element = document.querySelector(selector);
            if (useCache && element) {
                cache.set(selector, element);
            }
            return element;
        };
    })(),

    /**
     * Batch DOM operations
     */
    batchDOMUpdates: (operations) => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            operations.forEach(operation => {
                try {
                    operation();
                } catch (error) {
                    console.error('DOM operation failed:', error);
                }
            });
        });
    },

    /**
     * Virtual scrolling for large lists
     */
    createVirtualScroller: (container, items, renderItem, itemHeight = 50) => {
        const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 1;
        let startIndex = 0;
        
        const updateView = () => {
            const fragment = document.createDocumentFragment();
            const endIndex = Math.min(startIndex + visibleCount, items.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const element = renderItem(items[i], i);
                element.style.transform = `translateY(${i * itemHeight}px)`;
                fragment.appendChild(element);
            }
            
            container.innerHTML = '';
            container.appendChild(fragment);
        };
        
        const onScroll = performanceUtils.throttle(() => {
            const newStartIndex = Math.floor(container.scrollTop / itemHeight);
            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;
                updateView();
            }
        }, 16, 'virtual-scroll'); // ~60fps
        
        container.addEventListener('scroll', onScroll);
        updateView();
        
        return { updateView, destroy: () => container.removeEventListener('scroll', onScroll) };
    }
};

// Create global instance
const performanceUtils = new PerformanceUtils();

// Initialize console optimization
optimizeConsoleLogging();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceUtils,
        performanceUtils,
        DOMUtils
    };
} else if (typeof window !== 'undefined') {
    window.PerformanceUtils = {
        PerformanceUtils,
        performanceUtils,
        DOMUtils
    };
}