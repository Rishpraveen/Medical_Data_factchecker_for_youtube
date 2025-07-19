/**
 * Lazy Loading Utility for Medical YouTube Optimizer
 * Optimizes performance by loading modules only when needed
 */

class LazyLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.moduleCache = new Map();
    }

    /**
     * Lazy load a module with caching
     * @param {string} moduleName - Name of the module to load
     * @param {Function} loader - Function that returns a promise resolving to the module
     * @param {Object} options - Loading options
     * @returns {Promise} Promise resolving to the loaded module
     */
    async loadModule(moduleName, loader, options = {}) {
        const { cache = true, timeout = 10000, retries = 3 } = options;

        // Return cached module if available
        if (cache && this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Return existing loading promise if module is currently being loaded
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Create loading promise with timeout and retry logic
        const loadingPromise = this.loadWithRetry(loader, retries, timeout);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;
            
            if (cache) {
                this.loadedModules.set(moduleName, module);
            }
            
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            console.error(`Failed to load module ${moduleName}:`, error);
            throw new Error(`Module ${moduleName} failed to load: ${error.message}`);
        }
    }

    /**
     * Load module with retry logic
     */
    async loadWithRetry(loader, retries, timeout) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await Promise.race([
                    loader(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), timeout)
                    )
                ]);
            } catch (error) {
                if (attempt === retries) throw error;
                
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Preload modules during idle time
     */
    preloadModules(moduleConfigs) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                this.loadModulesInBackground(moduleConfigs);
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => this.loadModulesInBackground(moduleConfigs), 100);
        }
    }

    async loadModulesInBackground(moduleConfigs) {
        for (const { name, loader, priority = 0 } of moduleConfigs) {
            try {
                await this.loadModule(name, loader);
            } catch (error) {
                console.warn(`Background loading failed for ${name}:`, error);
            }
        }
    }

    /**
     * Clear module cache
     */
    clearCache(moduleName = null) {
        if (moduleName) {
            this.loadedModules.delete(moduleName);
            this.moduleCache.delete(moduleName);
        } else {
            this.loadedModules.clear();
            this.moduleCache.clear();
        }
    }

    /**
     * Get loading status
     */
    getStatus(moduleName) {
        return {
            loaded: this.loadedModules.has(moduleName),
            loading: this.loadingPromises.has(moduleName),
            cached: this.moduleCache.has(moduleName)
        };
    }
}

// Module loader factories for common components
const ModuleLoaders = {
    // AI Module Loaders
    seamlessM4T: () => import('../ai/seamlessM4T.js'),
    medicalAnalyzer: () => import('../ai/medicalAnalyzer.js'),
    
    // Medical Analysis Module Loaders
    openSourceMedical: () => import('../medicalAnalysis/openSourceMedical.js'),
    medicalOCR: () => import('../medicalAnalysis/medicalOCR.js'),
    freeSpeechToText: () => import('../medicalAnalysis/freeSpeechToText.js'),
    integratedMedicalAnalysis: () => import('../medicalAnalysis/integratedMedicalAnalysis.js'),
    
    // Utility Module Loaders
    subtitleExtractor: () => import('./subtitleExtractor.js'),
    tamilTranslator: () => import('./tamilTranslator.js'),
    ayurvedicDatabase: () => import('./ayurvedicDatabase.js'),
    youtubeSourceVerifier: () => import('./youtubeSourceVerifier.js'),
    
    // Caption Fetcher
    captionFetcher: () => import('../../caption-fetcher-bundle.js')
};

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }

    startTiming(operation) {
        this.metrics.set(operation, performance.now());
    }

    endTiming(operation) {
        const startTime = this.metrics.get(operation);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`⚡ ${operation} completed in ${duration.toFixed(2)}ms`);
            this.metrics.delete(operation);
            return duration;
        }
        return null;
    }

    measureAsync(operation, asyncFunction) {
        return async (...args) => {
            this.startTiming(operation);
            try {
                const result = await asyncFunction(...args);
                this.endTiming(operation);
                return result;
            } catch (error) {
                this.endTiming(operation);
                throw error;
            }
        };
    }
}

// Create global instances
const lazyLoader = new LazyLoader();
const performanceMonitor = new PerformanceMonitor();

// Enhanced module loading with performance monitoring
const loadModuleOptimized = (moduleName, options = {}) => {
    const loader = ModuleLoaders[moduleName];
    if (!loader) {
        throw new Error(`Unknown module: ${moduleName}`);
    }

    return performanceMonitor.measureAsync(
        `Load ${moduleName}`,
        () => lazyLoader.loadModule(moduleName, loader, options)
    )();
};

// Batch loading for related modules
const loadModuleBatch = async (moduleNames, options = {}) => {
    const { concurrent = 3 } = options;
    const results = new Map();
    const errors = new Map();

    // Load modules in batches to avoid overwhelming the system
    for (let i = 0; i < moduleNames.length; i += concurrent) {
        const batch = moduleNames.slice(i, i + concurrent);
        const promises = batch.map(async (moduleName) => {
            try {
                const module = await loadModuleOptimized(moduleName);
                results.set(moduleName, module);
            } catch (error) {
                errors.set(moduleName, error);
            }
        });

        await Promise.allSettled(promises);
    }

    return { results, errors };
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        lazyLoader,
        performanceMonitor,
        loadModuleOptimized,
        loadModuleBatch,
        ModuleLoaders
    };
} else if (typeof window !== 'undefined') {
    window.LazyLoader = {
        lazyLoader,
        performanceMonitor,
        loadModuleOptimized,
        loadModuleBatch,
        ModuleLoaders
    };
}