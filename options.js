// Medical YouTube Optimizer - Options Page
// Enhanced configuration interface with tab navigation and settings management

// Tab navigation setup
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Settings Manager Class
class SettingsManager {
    constructor() {
        this.settings = {
            // Extension Core Settings
            extensionEnabled: true,
            autoAnalyzeEnabled: false,
            showRiskWarnings: true,
            analysisDelay: 3,
            showAnalysisButton: true,
            highlightMedicalTerms: true,
            browserExtractionEnabled: true,
            maxComments: 100,
            chunkSizeInput: 1000,
            
            // AI & API Settings
            hfApiKey: '',
            nerModel: 'distilbert-base-uncased',
            classificationModel: 'microsoft/DialoGPT-medium',
            sentimentModel: 'cardiffnlp/twitter-roberta-base-sentiment',
            apiProviderSelect: 'huggingface',
            manualModeToggle: false,
            
            // Analysis Features
            enableNER: true,
            enableSentiment: true,
            enableClassification: true,
            enableAyurveda: true,
            riskThreshold: 70,
            strictMode: false,
            
            // Language & Translation
            enableTamilTranslation: true,
            primaryLanguage: 'auto',
            translationProvider: 'seamlessm4t',
            fetchAllLanguages: false,
            autoTranslateCaptions: false,
            
            // Advanced Settings
            cacheDuration: 24,
            maxAnalysisLength: 10000,
            batchSize: 25,
            debugMode: false,
            enableAnalytics: false,
            youtubeApiKey: ''
        };
        
        this.formElements = {};
    }

    async initialize() {
        console.log('Initializing Settings Manager...');
        
        // Setup tabs first
        setupTabs();
        
        // Cache form elements
        this.cacheFormElements();
        
        // Load saved settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Populate UI with loaded settings
        this.populateUI();
        
        console.log('Settings Manager initialized successfully');
    }

    cacheFormElements() {
        console.log('Caching form elements...');
        
        // Extension Settings
        this.formElements.extensionEnabled = document.getElementById('extensionEnabled');
        this.formElements.autoAnalyzeEnabled = document.getElementById('autoAnalyzeEnabled');
        this.formElements.showRiskWarnings = document.getElementById('showRiskWarnings');
        this.formElements.analysisDelay = document.getElementById('analysisDelay');
        this.formElements.showAnalysisButton = document.getElementById('showAnalysisButton');
        this.formElements.highlightMedicalTerms = document.getElementById('highlightMedicalTerms');
        this.formElements.browserExtractionEnabled = document.getElementById('browserExtractionEnabled');
        this.formElements.maxComments = document.getElementById('maxComments');
        this.formElements.chunkSizeInput = document.getElementById('chunkSizeInput');
        
        // AI Settings
        this.formElements.hfApiKey = document.getElementById('hfApiKey');
        this.formElements.nerModel = document.getElementById('nerModel');
        this.formElements.classificationModel = document.getElementById('classificationModel');
        this.formElements.sentimentModel = document.getElementById('sentimentModel');
        this.formElements.apiProviderSelect = document.getElementById('apiProviderSelect');
        this.formElements.manualModeToggle = document.getElementById('manualModeToggle');
        
        // Analysis Settings
        this.formElements.enableNER = document.getElementById('enableNER');
        this.formElements.enableSentiment = document.getElementById('enableSentiment');
        this.formElements.enableClassification = document.getElementById('enableClassification');
        this.formElements.enableAyurveda = document.getElementById('enableAyurveda');
        this.formElements.riskThreshold = document.getElementById('riskThreshold');
        this.formElements.riskThresholdValue = document.getElementById('riskThresholdValue');
        this.formElements.strictMode = document.getElementById('strictMode');
        
        // Language Settings
        this.formElements.enableTamilTranslation = document.getElementById('enableTamilTranslation');
        this.formElements.primaryLanguage = document.getElementById('primaryLanguage');
        this.formElements.translationProvider = document.getElementById('translationProvider');
        this.formElements.fetchAllLanguages = document.getElementById('fetchAllLanguages');
        this.formElements.autoTranslateCaptions = document.getElementById('autoTranslateCaptions');
        
        // Advanced Settings
        this.formElements.cacheDuration = document.getElementById('cacheDuration');
        this.formElements.maxAnalysisLength = document.getElementById('maxAnalysisLength');
        this.formElements.batchSize = document.getElementById('batchSize');
        this.formElements.debugMode = document.getElementById('debugMode');
        this.formElements.enableAnalytics = document.getElementById('enableAnalytics');
        this.formElements.youtubeApiKey = document.getElementById('youtubeApiInput');
        
        // Button elements
        this.formElements.testApiBtn = document.getElementById('testYoutubeApiBtn');
        this.formElements.showHfKeyBtn = document.getElementById('showHfKeyBtn');
        this.formElements.testYoutubeApiBtn = document.getElementById('testYoutubeApiBtn');
        this.formElements.showYoutubeKeyBtn = document.getElementById('showYoutubeKeyBtn');
        this.formElements.clearCacheBtn = document.getElementById('clearCache');
        this.formElements.resetBtn = document.getElementById('resetSettings');
        this.formElements.exportSettings = document.getElementById('exportSettings');
        this.formElements.importSettings = document.getElementById('importSettings');
        this.formElements.importFile = document.getElementById('importFile');
        this.formElements.saveButton = document.getElementById('saveButton');
        this.formElements.resetButton = document.getElementById('resetButton');
        
        // Status elements
        this.formElements.apiStatus = document.getElementById('apiStatus');
        this.formElements.youtubeApiStatus = document.getElementById('youtubeApiStatus');
        this.formElements.statusMessage = document.getElementById('statusMessage');
        this.formElements.status = document.getElementById('status');
        
        // Log missing elements for debugging
        const missingElements = [];
        Object.keys(this.formElements).forEach(key => {
            if (!this.formElements[key]) {
                missingElements.push(key);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('Missing elements:', missingElements);
        } else {
            console.log('All form elements cached successfully');
        }
    }

    setupEventListeners() {
        // Toggle switches
        this.addToggleListener('extensionEnabled');
        this.addToggleListener('autoAnalyzeEnabled');
        this.addToggleListener('showRiskWarnings');
        this.addToggleListener('showAnalysisButton');
        this.addToggleListener('highlightMedicalTerms');
        this.addToggleListener('browserExtractionEnabled');
        this.addToggleListener('manualModeToggle');
        this.addToggleListener('enableNER');
        this.addToggleListener('enableSentiment');
        this.addToggleListener('enableClassification');
        this.addToggleListener('enableAyurveda');
        this.addToggleListener('strictMode');
        this.addToggleListener('enableTamilTranslation');
        this.addToggleListener('fetchAllLanguages');
        this.addToggleListener('autoTranslateCaptions');
        this.addToggleListener('debugMode');
        this.addToggleListener('enableAnalytics');

        // Text inputs
        this.addTextListener('hfApiKey');
        this.addTextListener('youtubeApiKey');

        // Number inputs
        this.addNumberListener('analysisDelay');
        this.addNumberListener('maxComments');
        this.addNumberListener('chunkSizeInput');
        this.addNumberListener('riskThreshold');
        this.addNumberListener('cacheDuration');
        this.addNumberListener('maxAnalysisLength');
        this.addNumberListener('batchSize');

        // Select inputs
        this.addSelectListener('nerModel');
        this.addSelectListener('classificationModel');
        this.addSelectListener('sentimentModel');
        this.addSelectListener('apiProviderSelect');
        this.addSelectListener('primaryLanguage');
        this.addSelectListener('translationProvider');

        // Range slider for risk threshold
        if (this.formElements.riskThreshold) {
            this.formElements.riskThreshold.addEventListener('input', (e) => {
                this.settings.riskThreshold = parseInt(e.target.value);
                if (this.formElements.riskThresholdValue) {
                    this.formElements.riskThresholdValue.textContent = `${this.settings.riskThreshold}%`;
                }
                this.saveSettings();
            });
        }

        // Button event listeners
        if (this.formElements.testApiBtn) {
            this.formElements.testApiBtn.addEventListener('click', () => this.testApiConnection());
        }
        
        if (this.formElements.showHfKeyBtn) {
            this.formElements.showHfKeyBtn.addEventListener('click', () => this.togglePasswordVisibility('hfApiKey'));
        }
        
        if (this.formElements.testYoutubeApiBtn) {
            this.formElements.testYoutubeApiBtn.addEventListener('click', () => this.testYoutubeApi());
        }
        
        if (this.formElements.showYoutubeKeyBtn) {
            this.formElements.showYoutubeKeyBtn.addEventListener('click', () => this.togglePasswordVisibility('youtubeApiKey'));
        }
        
        if (this.formElements.clearCacheBtn) {
            this.formElements.clearCacheBtn.addEventListener('click', () => this.clearCache());
        }
        
        if (this.formElements.resetBtn) {
            this.formElements.resetBtn.addEventListener('click', () => this.resetToDefaults());
        }
        
        if (this.formElements.saveButton) {
            this.formElements.saveButton.addEventListener('click', () => this.saveSettings());
        }
        
        if (this.formElements.resetButton) {
            this.formElements.resetButton.addEventListener('click', () => this.resetToDefaults());
        }
        
        if (this.formElements.exportSettings) {
            this.formElements.exportSettings.addEventListener('click', () => this.exportSettings());
        }
        
        if (this.formElements.importSettings && this.formElements.importFile) {
            this.formElements.importSettings.addEventListener('click', () => this.formElements.importFile.click());
            this.formElements.importFile.addEventListener('change', (e) => this.importSettings(e));
        }
    }

    addToggleListener(settingKey) {
        const element = this.formElements[settingKey];
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.checked;
                this.saveSettings();
            });
        }
    }

    addTextListener(settingKey) {
        const element = this.formElements[settingKey];
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
        const element = this.formElements[settingKey];
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = parseInt(e.target.value) || 0;
                this.saveSettings();
            });
        }
    }

    addSelectListener(settingKey) {
        const element = this.formElements[settingKey];
        if (element) {
            element.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.value;
                this.saveSettings();
            });
        }
    }

    togglePasswordVisibility(fieldKey) {
        const inputElement = this.formElements[fieldKey];
        const buttonElement = fieldKey === 'hfApiKey' ? this.formElements.showHfKeyBtn : this.formElements.showYoutubeKeyBtn;
        
        if (inputElement && buttonElement) {
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                buttonElement.textContent = '🙈';
                buttonElement.title = 'Hide Key';
            } else {
                inputElement.type = 'password';
                buttonElement.textContent = '👁️';
                buttonElement.title = 'Show Key';
            }
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
            if (chrome.runtime?.sendMessage) {
                chrome.runtime.sendMessage({
                    type: 'SETTINGS_UPDATED',
                    settings: this.settings
                });
            }
            
            this.showStatus('Settings saved successfully', 'success');
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    populateUI() {
        // Populate all form elements with current settings
        Object.keys(this.settings).forEach(key => {
            const element = this.formElements[key];
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
        if (this.formElements.riskThresholdValue) {
            this.formElements.riskThresholdValue.textContent = `${this.settings.riskThreshold}%`;
        }

        // Update API status
        this.updateApiStatus();
    }

    updateApiStatus() {
        if (this.formElements.apiStatus) {
            if (this.settings.hfApiKey && this.settings.hfApiKey.length > 10) {
                this.formElements.apiStatus.textContent = 'Connected';
                this.formElements.apiStatus.className = 'api-status connected';
            } else {
                this.formElements.apiStatus.textContent = 'Disconnected';
                this.formElements.apiStatus.className = 'api-status disconnected';
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

            if (response && response.success) {
                this.showStatus('API connection successful!', 'success');
                this.updateApiStatus();
            } else {
                this.showStatus(`API test failed: ${response?.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('API test error:', error);
            this.showStatus('API test failed: Network error', 'error');
        }
    }

    async testYoutubeApi() {
        // Get the current API key from the input field
        const apiKey = this.formElements.youtubeApiKey ? this.formElements.youtubeApiKey.value.trim() : '';
        
        if (!apiKey) {
            this.showStatus('Please enter your YouTube API key first', 'error');
            return;
        }

        this.showStatus('Testing YouTube API...', 'info');

        try {
            // Test YouTube API with a known video ID
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`);
            const data = await response.json();
            
            if (response.ok && data.items && data.items.length > 0) {
                this.showStatus('YouTube API connection successful!', 'success');
                if (this.formElements.youtubeApiStatus) {
                    this.formElements.youtubeApiStatus.textContent = 'Connected';
                    this.formElements.youtubeApiStatus.className = 'api-status connected';
                }
            } else if (response.status === 403) {
                throw new Error('API key is invalid or has insufficient permissions');
            } else if (response.status === 400) {
                throw new Error('Bad request - check your API key format');
            } else {
                throw new Error(`HTTP ${response.status}: ${data.error?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('YouTube API test error:', error);
            this.showStatus(`YouTube API test failed: ${error.message}`, 'error');
            if (this.formElements.youtubeApiStatus) {
                this.formElements.youtubeApiStatus.textContent = 'Disconnected';
                this.formElements.youtubeApiStatus.className = 'api-status disconnected';
            }
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
                    browserExtractionEnabled: true,
                    maxComments: 100,
                    chunkSizeInput: 1000,
                    hfApiKey: '',
                    nerModel: 'distilbert-base-uncased',
                    classificationModel: 'microsoft/DialoGPT-medium',
                    sentimentModel: 'cardiffnlp/twitter-roberta-base-sentiment',
                    apiProviderSelect: 'huggingface',
                    manualModeToggle: false,
                    enableNER: true,
                    enableSentiment: true,
                    enableClassification: true,
                    enableAyurveda: true,
                    riskThreshold: 70,
                    strictMode: false,
                    enableTamilTranslation: true,
                    primaryLanguage: 'auto',
                    translationProvider: 'seamlessm4t',
                    fetchAllLanguages: false,
                    autoTranslateCaptions: false,
                    cacheDuration: 24,
                    maxAnalysisLength: 10000,
                    batchSize: 25,
                    debugMode: false,
                    enableAnalytics: false,
                    youtubeApiKey: ''
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
        // Try multiple status elements
        const statusElements = [
            this.formElements.statusMessage,
            this.formElements.status,
            document.getElementById('statusMessage'),
            document.getElementById('status')
        ].filter(el => el);

        statusElements.forEach(statusElement => {
            statusElement.textContent = message;
            statusElement.className = type === 'success' ? 'success' : (type === 'error' ? 'error' : '');
            statusElement.style.display = 'block';
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElements.forEach(statusElement => {
                statusElement.style.display = 'none';
            });
        }, 5000);
        
        console.log(`Status: ${message} (${type})`);
    }
}

// Initialize the extension options when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing options page...');
    const settingsManager = new SettingsManager();
    await settingsManager.initialize();
});
