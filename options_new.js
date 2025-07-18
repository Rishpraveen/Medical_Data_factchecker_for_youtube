// Enhanced Options Script for Medical YouTube Optimizer
class MedicalOptimizerOptions {
    constructor() {
        this.settings = {
            // General Settings
            extensionEnabled: true,
            autoAnalyzeEnabled: false,
            showRiskWarnings: true,
            analysisDelay: 3,
            showAnalysisButton: true,
            highlightMedicalTerms: true,

            // AI Settings
            hfApiKey: '',
            nerModel: 'distilbert-base-uncased',
            classificationModel: 'microsoft/DialoGPT-medium',
            sentimentModel: 'cardiffnlp/twitter-roberta-base-sentiment',

            // Analysis Settings
            enableNER: true,
            enableSentiment: true,
            enableClassification: true,
            enableAyurveda: true,
            riskThreshold: 70,
            strictMode: false,

            // Language Settings
            enableTamilTranslation: true,
            primaryLanguage: 'auto',
            translationProvider: 'seamlessm4t',

            // Advanced Settings
            cacheDuration: 24,
            maxAnalysisLength: 10000,
            debugMode: false,
            enableAnalytics: false
        };

        this.init();
    }

    async init() {
        try {
            // Load saved settings
            await this.loadSettings();
            
            // Setup UI
            this.setupTabs();
            this.setupEventListeners();
            this.populateUI();
            
            console.log('Medical Optimizer Options initialized');
        } catch (error) {
            console.error('Error initializing options:', error);
            this.showStatus('Error initializing settings', 'error');
        }
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // General Settings
        this.addToggleListener('extensionEnabled');
        this.addToggleListener('autoAnalyzeEnabled');
        this.addToggleListener('showRiskWarnings');
        this.addToggleListener('showAnalysisButton');
        this.addToggleListener('highlightMedicalTerms');

        // Number inputs
        this.addNumberListener('analysisDelay');

        // AI Settings
        this.addTextListener('hfApiKey');
        this.addSelectListener('nerModel');
        this.addSelectListener('classificationModel');
        this.addSelectListener('sentimentModel');

        // Analysis Settings
        this.addToggleListener('enableNER');
        this.addToggleListener('enableSentiment');
        this.addToggleListener('enableClassification');
        this.addToggleListener('enableAyurveda');
        this.addToggleListener('strictMode');

        // Risk threshold slider
        const riskThreshold = document.getElementById('riskThreshold');
        const riskThresholdValue = document.getElementById('riskThresholdValue');
        
        if (riskThreshold && riskThresholdValue) {
            riskThreshold.addEventListener('input', (e) => {
                const value = e.target.value;
                riskThresholdValue.textContent = `${value}%`;
                this.settings.riskThreshold = parseInt(value);
                this.saveSettings();
            });
        }

        // Language Settings
        this.addToggleListener('enableTamilTranslation');
        this.addSelectListener('primaryLanguage');
        this.addSelectListener('translationProvider');

        // Advanced Settings
        this.addNumberListener('cacheDuration');
        this.addNumberListener('maxAnalysisLength');
        this.addToggleListener('debugMode');
        this.addToggleListener('enableAnalytics');

        // Special buttons
        this.setupSpecialButtons();
    }

    setupSpecialButtons() {
        // Test API Connection
        const testApiBtn = document.getElementById('testApiConnection');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => this.testApiConnection());
        }

        // Danger Zone buttons
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        const resetSettingsBtn = document.getElementById('resetSettings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetToDefaults());
        }

        const exportSettingsBtn = document.getElementById('exportSettings');
        if (exportSettingsBtn) {
            exportSettingsBtn.addEventListener('click', () => this.exportSettings());
        }

        const importSettingsBtn = document.getElementById('importSettings');
        const importFileInput = document.getElementById('importFile');
        if (importSettingsBtn && importFileInput) {
            importSettingsBtn.addEventListener('click', () => importFileInput.click());
            importFileInput.addEventListener('change', (e) => this.importSettings(e));
        }
    }

    addToggleListener(settingKey) {
        const element = document.getElementById(settingKey);
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.checked;
                this.saveSettings();
            });
        }
    }

    addTextListener(settingKey) {
        const element = document.getElementById(settingKey);
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.value;
                this.saveSettings();
                
                // Special handling for API key
                if (settingKey === 'hfApiKey') {
                    this.updateApiStatus();
                }
            });
        }
    }

    addNumberListener(settingKey) {
        const element = document.getElementById(settingKey);
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = parseInt(e.target.value) || 0;
                this.saveSettings();
            });
        }
    }

    addSelectListener(settingKey) {
        const element = document.getElementById(settingKey);
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.value;
                this.saveSettings();
            });
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['medicalOptimizerSettings']);
            if (result.medicalOptimizerSettings) {
                this.settings = { ...this.settings, ...result.medicalOptimizerSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({ 
                medicalOptimizerSettings: this.settings 
            });
            
            // Send update message to background script
            chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                settings: this.settings
            });
            
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    populateUI() {
        // Populate all form elements with current settings
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else if (element.type === 'number' || element.type === 'range') {
                    element.value = this.settings[key];
                } else if (element.tagName === 'SELECT') {
                    element.value = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });

        // Update risk threshold display
        const riskThresholdValue = document.getElementById('riskThresholdValue');
        if (riskThresholdValue) {
            riskThresholdValue.textContent = `${this.settings.riskThreshold}%`;
        }

        // Update API status
        this.updateApiStatus();
    }

    updateApiStatus() {
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            if (this.settings.hfApiKey && this.settings.hfApiKey.length > 10) {
                apiStatus.textContent = 'Connected';
                apiStatus.className = 'api-status connected';
            } else {
                apiStatus.textContent = 'Disconnected';
                apiStatus.className = 'api-status disconnected';
            }
        }
    }

    async testApiConnection() {
        if (!this.settings.hfApiKey) {
            this.showStatus('Please enter your Hugging Face API key first', 'error');
            return;
        }

        this.showStatus('Testing API connection...', 'info');

        try {
            // Send test request to background script
            const response = await chrome.runtime.sendMessage({
                action: 'testApiConnection',
                apiKey: this.settings.hfApiKey
            });

            if (response.success) {
                this.showStatus('API connection successful!', 'success');
                this.updateApiStatus();
            } else {
                this.showStatus(`API test failed: ${response.error}`, 'error');
            }
        } catch (error) {
            console.error('API test error:', error);
            this.showStatus('API test failed: Network error', 'error');
        }
    }

    async clearCache() {
        if (confirm('Are you sure you want to clear all cached analysis data? This action cannot be undone.')) {
            try {
                await chrome.storage.local.clear();
                this.showStatus('Cache cleared successfully', 'success');
            } catch (error) {
                console.error('Error clearing cache:', error);
                this.showStatus('Error clearing cache', 'error');
            }
        }
    }

    async resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                // Reset to default settings
                this.settings = {
                    extensionEnabled: true,
                    autoAnalyzeEnabled: false,
                    showRiskWarnings: true,
                    analysisDelay: 3,
                    showAnalysisButton: true,
                    highlightMedicalTerms: true,
                    hfApiKey: '',
                    nerModel: 'distilbert-base-uncased',
                    classificationModel: 'microsoft/DialoGPT-medium',
                    sentimentModel: 'cardiffnlp/twitter-roberta-base-sentiment',
                    enableNER: true,
                    enableSentiment: true,
                    enableClassification: true,
                    enableAyurveda: true,
                    riskThreshold: 70,
                    strictMode: false,
                    enableTamilTranslation: true,
                    primaryLanguage: 'auto',
                    translationProvider: 'seamlessm4t',
                    cacheDuration: 24,
                    maxAnalysisLength: 10000,
                    debugMode: false,
                    enableAnalytics: false
                };

                await this.saveSettings();
                this.populateUI();
                this.showStatus('Settings reset to defaults', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showStatus('Error resetting settings', 'error');
            }
        }
    }

    exportSettings() {
        try {
            const settingsJson = JSON.stringify(this.settings, null, 2);
            const blob = new Blob([settingsJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `medical-optimizer-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showStatus('Settings exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting settings:', error);
            this.showStatus('Error exporting settings', 'error');
        }
    }

    async importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedSettings = JSON.parse(text);
            
            // Validate imported settings
            if (typeof importedSettings === 'object' && importedSettings !== null) {
                // Merge with existing settings, keeping valid values only
                Object.keys(importedSettings).forEach(key => {
                    if (key in this.settings) {
                        this.settings[key] = importedSettings[key];
                    }
                });
                
                await this.saveSettings();
                this.populateUI();
                this.showStatus('Settings imported successfully', 'success');
            } else {
                throw new Error('Invalid settings file format');
            }
        } catch (error) {
            console.error('Error importing settings:', error);
            this.showStatus('Error importing settings: Invalid file format', 'error');
        }
        
        // Clear the file input
        event.target.value = '';
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            statusElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize options when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MedicalOptimizerOptions();
});

// Handle extension context invalidation
chrome.runtime.onConnect.addListener(() => {
    // Extension context is still valid
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalOptimizerOptions;
}
