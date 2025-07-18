// Medical YouTube Optimizer - Enhanced Background Script
// Integrates SeamlessM4T and Medical Analysis with Chrome Extension

// Import modules using importScripts for service worker compatibility
try {
    importScripts('./src/ai/seamlessM4T.js');
    importScripts('./src/ai/medicalAnalyzer.js');
    // Import new free medical analysis modules
    importScripts('./src/medicalAnalysis/openSourceMedical.js');
    importScripts('./src/medicalAnalysis/medicalOCR.js');
    importScripts('./src/medicalAnalysis/freeSpeechToText.js');
    importScripts('./src/medicalAnalysis/integratedMedicalAnalysis.js');
    // Import caption fetcher bundle
    importScripts('./caption-fetcher-bundle.js');
} catch (error) {
    console.log('Note: AI modules will be loaded dynamically when needed');
}

class MedicalOptimizerBackground {
    constructor() {
        this.seamlessM4T = null;
        this.medicalAnalyzer = null;
        this.integratedMedicalAnalysis = null; // New integrated system
        this.currentVideoData = null;
        this.analysisCache = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Setup installation handler
            this.setupInstallationHandler();
            
            // Initialize AI components
            await this.initializeAI();
            
            // Setup message listeners
            this.setupMessageHandlers();
            
            // Setup context menu
            this.setupContextMenu();
            
            // Setup tab listeners
            this.setupTabListeners();
            
            this.isInitialized = true;
            console.log('Medical Optimizer Background Script initialized successfully');
        } catch (error) {
            console.error('Failed to initialize background script:', error);
        }
    }

    setupInstallationHandler() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('Medical YouTube Optimizer installed');
                
                // Open options page on first install
                chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
                
                // Set default settings
                chrome.storage.sync.set({
                    medicalOptimizerSettings: {
                        autoAnalyzeEnabled: true,
                        showSafeIndicator: true,
                        analysisDelay: 3000,
                        interfaceLanguage: 'en',
                        defaultSourceLanguage: 'en',
                        defaultTargetLanguage: 'ta',
                        huggingFaceApiKey: ''
                    }
                });
            }
        });
    }

    async initializeAI() {
        try {
            // Get API keys from storage
            const settings = await this.getSettings();
            
            // Initialize SeamlessM4T if available
            if (typeof SeamlessM4TCore !== 'undefined') {
                this.seamlessM4T = new SeamlessM4TCore({
                    apiKey: settings.huggingFaceApiKey,
                    cacheEnabled: true
                });
            } else {
                console.log('SeamlessM4T module not available, will use fallback methods');
            }

            // Initialize Medical Analyzer if available
            if (typeof MedicalContentAnalyzer !== 'undefined') {
                this.medicalAnalyzer = new MedicalContentAnalyzer({
                    apiKey: settings.huggingFaceApiKey,
                    seamlessM4T: this.seamlessM4T,
                    cacheEnabled: true
                });
            } else {
                console.log('Medical Analyzer module not available, will use fallback methods');
            }

            // Initialize Integrated Medical Analysis System
            if (typeof IntegratedMedicalAnalysis !== 'undefined') {
                this.integratedMedicalAnalysis = new IntegratedMedicalAnalysis();
                
                const initResult = await this.integratedMedicalAnalysis.initialize({
                    huggingFaceToken: settings.huggingFaceApiKey,
                    enableEncryption: true,
                    enableOfflineMode: false,
                    enableOCR: true,
                    enableSpeechToText: true,
                    enableMedicalAnalysis: true
                });

                if (initResult.success) {
                    console.log('Integrated Medical Analysis System initialized:', initResult.components);
                    
                    // Setup event handlers
                    this.integratedMedicalAnalysis.setEventHandlers({
                        onProgress: (event) => this.broadcastProgress(event),
                        onResult: (event) => this.broadcastResult(event),
                        onError: (event) => this.broadcastError(event)
                    });
                } else {
                    console.error('Failed to initialize Integrated Medical Analysis:', initResult.error);
                }
            } else {
                console.log('Integrated Medical Analysis module not available');
            }

            console.log('AI components initialized');
        } catch (error) {
            console.error('Error initializing AI components:', error);
            // Don't throw error - extension should work without AI components
            console.log('Extension will continue with basic functionality');
        }
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Will respond asynchronously
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            switch (message.action) {
                case 'quickAnalysis':
                    const quickAnalysisResult = await this.performQuickAnalysis(message.options);
                    sendResponse(quickAnalysisResult);
                    break;

                case 'quickTranslation':
                    const quickTranslationResult = await this.performQuickTranslation(
                        message.sourceLanguage,
                        message.targetLanguage,
                        message.options
                    );
                    sendResponse(quickTranslationResult);
                    break;

                case 'quickRiskAssessment':
                    const quickRiskResult = await this.performQuickRiskAssessment(message.options);
                    sendResponse(quickRiskResult);
                    break;

                case 'fullAnalysis':
                    const analysisResult = await this.performFullAnalysis(message.options);
                    sendResponse(analysisResult);
                    break;

                case 'translateContent':
                    const translationResult = await this.translateContent(
                        message.sourceLanguage,
                        message.targetLanguage,
                        message.options
                    );
                    sendResponse(translationResult);
                    break;

                case 'analyzeAyurveda':
                    const ayurvedaResult = await this.analyzeAyurveda(message.options);
                    sendResponse(ayurvedaResult);
                    break;

                case 'verifySources':
                    const sourceResult = await this.verifySources(message.options);
                    sendResponse(sourceResult);
                    break;

                case 'assessRisk':
                    const riskResult = await this.assessRisk(message.options);
                    sendResponse(riskResult);
                    break;

                // New Integrated Medical Analysis actions
                case 'processYouTubeTranscript':
                    const transcriptResult = await this.processYouTubeTranscript(message.transcript, message.options);
                    sendResponse(transcriptResult);
                    break;

                case 'processMedicalDocument':
                    const documentResult = await this.processMedicalDocument(message.imageData, message.documentType, message.options);
                    sendResponse(documentResult);
                    break;

                case 'processAudioTranscription':
                    const audioResult = await this.processAudioTranscription(message.audioData, message.options);
                    sendResponse(audioResult);
                    break;

                case 'extractYouTubeAudio':
                    const extractionResult = await this.extractYouTubeAudio(message.options);
                    sendResponse(extractionResult);
                    break;

                case 'getAllStoredMedicalData':
                    const storedData = await this.getAllStoredMedicalData();
                    sendResponse(storedData);
                    break;

                case 'searchMedicalData':
                    const searchResults = await this.searchMedicalData(message.query, message.options);
                    sendResponse(searchResults);
                    break;

                case 'exportMedicalData':
                    const exportResult = await this.exportMedicalData(message.format, message.filterOptions);
                    sendResponse(exportResult);
                    break;

                case 'fetchCaptions':
                    const captionResult = await this.fetchVideoCaption(message.videoId, message.language, message.options);
                    sendResponse(captionResult);
                    break;

                // Legacy compatibility
                case 'UPDATE_BADGE':
                    this.updateBadge(sender.tab.id, message.riskLevel);
                    sendResponse({ success: true });
                    break;

                case 'ANALYSIS_COMPLETE':
                    console.log('Analysis completed:', message.analysis);
                    if (message.analysis && message.analysis.riskAssessment) {
                        this.updateBadge(sender.tab.id, message.analysis.riskAssessment.level);
                    }
                    sendResponse({ success: true });
                    break;

                case 'GET_HEALTH_PROFILE':
                    const healthProfile = await chrome.storage.local.get(['encryptedHealthProfile']);
                    sendResponse(healthProfile);
                    break;

                case 'ERROR_OCCURRED':
                    console.error('Extension error:', message.error);
                    sendResponse({ success: true });
                    break;

                case 'MANUAL_ANALYSIS_REQUESTED':
                    const manualResult = await this.performQuickAnalysis({
                        enableNER: true,
                        enableSentiment: true,
                        enableClassification: true,
                        medicalFocus: true
                    });
                    sendResponse(manualResult);
                    break;

                default:
                    sendResponse({ error: 'Unknown action: ' + message.action });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async performQuickAnalysis(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for analysis');
            }

            // Quick analysis with basic medical content detection
            const quickResult = await this.medicalAnalyzer.quickAnalysis(
                videoData.title + ' ' + videoData.description,
                {
                    language: options.analysisLanguage || 'en',
                    enableNER: options.enableNER,
                    enableSentiment: options.enableSentiment
                }
            );

            return {
                success: true,
                ...quickResult,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Quick analysis failed:', error);
            return { success: false, error: error.message };
        }
    }

    async performQuickTranslation(sourceLanguage, targetLanguage, options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for translation');
            }

            // Quick translation of title and description
            const textToTranslate = `${videoData.title}\n\n${videoData.description}`;
            
            const translationResult = await this.seamlessM4T.translateText(
                textToTranslate,
                sourceLanguage,
                targetLanguage,
                {
                    preserveMedicalTerminology: options.preserveTerminology,
                    formalTone: options.formalTone
                }
            );

            return {
                success: true,
                sourceText: textToTranslate,
                translatedText: translationResult.translatedText,
                sourceLanguage,
                targetLanguage,
                preservedTerms: translationResult.preservedTerms,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Quick translation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async performQuickRiskAssessment(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for risk assessment');
            }

            const riskResult = await this.medicalAnalyzer.assessRisk(
                videoData.title + ' ' + videoData.description,
                {
                    category: options.riskCategory || 'general',
                    enableDrugInteraction: options.enableDrugInteraction,
                    checkContraindications: options.checkContraindications
                }
            );

            return {
                success: true,
                ...riskResult,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Quick risk assessment failed:', error);
            return { success: false, error: error.message };
        }
    }

    async performFullAnalysis(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for analysis');
            }

            // Comprehensive analysis
            const fullContent = `${videoData.title}\n${videoData.description}\n${videoData.transcript || ''}`;
            
            const analysisResult = await this.medicalAnalyzer.comprehensiveAnalysis(
                fullContent,
                {
                    language: options.analysisLanguage || 'en',
                    enableNER: options.enableNER,
                    enableSentiment: options.enableSentiment,
                    enableClassification: options.enableClassification,
                    medicalFocus: options.medicalFocus
                }
            );

            // Cache the results
            const cacheKey = `analysis_${videoData.videoId}_${JSON.stringify(options)}`;
            this.analysisCache.set(cacheKey, analysisResult);

            return {
                success: true,
                ...analysisResult,
                videoId: videoData.videoId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Full analysis failed:', error);
            return { success: false, error: error.message };
        }
    }

    async translateContent(sourceLanguage, targetLanguage, options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for translation');
            }

            // Prepare content for translation
            const contentSections = {
                title: videoData.title,
                description: videoData.description,
                transcript: videoData.transcript || ''
            };

            const translationResults = {};

            // Translate each section
            for (const [section, content] of Object.entries(contentSections)) {
                if (content) {
                    try {
                        const result = await this.seamlessM4T.translateText(
                            content,
                            sourceLanguage,
                            targetLanguage,
                            {
                                preserveMedicalTerminology: options.preserveTerminology,
                                formalTone: options.formalTone,
                                context: 'medical'
                            }
                        );
                        translationResults[section] = result;
                    } catch (error) {
                        console.error(`Translation failed for ${section}:`, error);
                        translationResults[section] = { error: error.message };
                    }
                }
            }

            // Audio translation if requested
            if (options.audioTranslation && videoData.audioUrl) {
                try {
                    const audioResult = await this.seamlessM4T.speechToText(
                        videoData.audioUrl,
                        sourceLanguage,
                        {
                            targetLanguage,
                            medicalTerminology: true
                        }
                    );
                    translationResults.audioTranslation = audioResult;
                } catch (error) {
                    console.error('Audio translation failed:', error);
                    translationResults.audioTranslation = { error: error.message };
                }
            }

            return {
                success: true,
                sourceLanguage,
                targetLanguage,
                translations: translationResults,
                videoId: videoData.videoId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Content translation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async analyzeAyurveda(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for Ayurveda analysis');
            }

            const fullContent = `${videoData.title}\n${videoData.description}\n${videoData.transcript || ''}`;
            
            const ayurvedaResult = await this.medicalAnalyzer.analyzeAyurvedicContent(
                fullContent,
                {
                    doshaFocus: options.doshaFocus || 'all',
                    detectConcepts: options.detectConcepts,
                    analyzeBalance: options.analyzeBalance,
                    traditionalTerms: options.traditionalTerms,
                    modernMapping: options.modernMapping
                }
            );

            return {
                success: true,
                ...ayurvedaResult,
                videoId: videoData.videoId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ayurveda analysis failed:', error);
            return { success: false, error: error.message };
        }
    }

    async verifySources(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for source verification');
            }

            const sourceResult = await this.medicalAnalyzer.verifyMedicalSources(
                videoData,
                {
                    checkCredibility: options.checkCredibility,
                    verifyMedical: options.verifyMedical,
                    checkConsistency: options.checkConsistency,
                    crossReference: options.crossReference
                }
            );

            return {
                success: true,
                ...sourceResult,
                videoId: videoData.videoId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Source verification failed:', error);
            return { success: false, error: error.message };
        }
    }

    async assessRisk(options) {
        try {
            const videoData = await this.getCurrentVideoContent();
            if (!videoData) {
                throw new Error('No video content available for risk assessment');
            }

            const fullContent = `${videoData.title}\n${videoData.description}\n${videoData.transcript || ''}`;
            
            const riskResult = await this.medicalAnalyzer.comprehensiveRiskAssessment(
                fullContent,
                {
                    category: options.riskCategory || 'general',
                    enableDrugInteraction: options.enableDrugInteraction,
                    checkContraindications: options.checkContraindications,
                    assessSafety: options.assessSafety,
                    flagMisinformation: options.flagMisinformation
                }
            );

            return {
                success: true,
                ...riskResult,
                videoId: videoData.videoId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Risk assessment failed:', error);
            return { success: false, error: error.message };
        }
    }

    async testSeamlessM4T() {
        try {
            if (!this.seamlessM4T) {
                await this.initializeAI();
            }

            // Test basic functionality
            const testText = "This is a medical test for diabetes management.";
            const testResult = await this.seamlessM4T.translateText(
                testText,
                'en',
                'ta',
                { preserveMedicalTerminology: true }
            );

            return {
                success: true,
                message: 'SeamlessM4T is working correctly',
                testResult: testResult.translatedText,
                preservedTerms: testResult.preservedTerms
            };
        } catch (error) {
            console.error('SeamlessM4T test failed:', error);
            return {
                success: false,
                message: 'SeamlessM4T test failed: ' + error.message
            };
        }
    }

    async testMedicalAnalyzer() {
        try {
            if (!this.medicalAnalyzer) {
                await this.initializeAI();
            }

            // Test basic functionality
            const testContent = "Diabetes is a chronic disease that affects blood sugar levels. Regular monitoring and medication are essential for management.";
            const testResult = await this.medicalAnalyzer.quickAnalysis(testContent, {
                language: 'en',
                enableNER: true,
                enableSentiment: true
            });

            return {
                success: true,
                message: 'Medical Analyzer is working correctly',
                testResult: {
                    entities: testResult.entities?.length || 0,
                    medicalTerms: testResult.medicalTerms?.length || 0,
                    confidence: testResult.confidence
                }
            };
        } catch (error) {
            console.error('Medical Analyzer test failed:', error);
            return {
                success: false,
                message: 'Medical Analyzer test failed: ' + error.message
            };
        }
    }

    async getCurrentVideoContent() {
        try {
            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url || !tab.url.includes('youtube.com/watch')) {
                throw new Error('Not on a YouTube video page');
            }

            // Extract video ID from URL
            const videoId = this.extractVideoId(tab.url);
            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            // Check cache first
            if (this.currentVideoData && this.currentVideoData.videoId === videoId) {
                return this.currentVideoData;
            }

            // Extract content from the page
            const videoData = await this.extractVideoContent(tab.id);
            videoData.videoId = videoId;
            
            // Attempt to fetch captions automatically
            try {
                console.log('Attempting to fetch captions for current video...');
                const captionResult = await this.fetchVideoCaption(videoId, 'en', {
                    fallbackLanguages: ['en', 'es', 'fr', 'de', 'it']
                });
                
                if (captionResult.success) {
                    // Merge caption data into video data
                    videoData.captions = captionResult.captions;
                    videoData.transcript = captionResult.fullText;
                    videoData.captionLanguage = captionResult.language;
                    videoData.captionType = captionResult.type;
                    videoData.hasCaptions = true;
                    
                    console.log(`Enhanced video data with ${captionResult.totalSegments} caption segments`);
                } else {
                    console.log('No captions available for this video');
                    videoData.hasCaptions = false;
                    videoData.captionError = captionResult.error;
                }
            } catch (captionError) {
                console.warn('Failed to fetch captions automatically:', captionError);
                videoData.hasCaptions = false;
                videoData.captionError = captionError.message;
            }
            
            this.currentVideoData = videoData;
            return videoData;
        } catch (error) {
            console.error('Error getting current video content:', error);
            throw error;
        }
    }

    async extractVideoContent(tabId) {
        try {
            // Inject content script to extract video data
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                function: this.extractVideoDataFromPage
            });

            if (results && results[0] && results[0].result) {
                return results[0].result;
            } else {
                throw new Error('Failed to extract video content');
            }
        } catch (error) {
            console.error('Error extracting video content:', error);
            throw error;
        }
    }

    // This function runs in the content script context
    extractVideoDataFromPage() {
        try {
            const videoData = {
                title: '',
                description: '',
                transcript: '',
                captions: [],
                metadata: {}
            };

            // Extract title with multiple fallback selectors
            const titleSelectors = [
                'h1.ytd-video-primary-info-renderer',
                'h1.title yt-formatted-string', 
                '#title h1',
                'h1[class*="title"]',
                '.ytd-video-primary-info-renderer h1'
            ];
            
            for (const selector of titleSelectors) {
                const titleElement = document.querySelector(selector);
                if (titleElement && titleElement.textContent.trim()) {
                    videoData.title = titleElement.textContent.trim();
                    break;
                }
            }

            // Extract description with multiple fallback selectors
            const descriptionSelectors = [
                '#description-text',
                '#meta-contents #description',
                '.description-text',
                'ytd-expandable-video-description-body-renderer',
                '[data-content="description"]'
            ];
            
            for (const selector of descriptionSelectors) {
                const descriptionElement = document.querySelector(selector);
                if (descriptionElement && descriptionElement.textContent.trim()) {
                    videoData.description = descriptionElement.textContent.trim();
                    break;
                }
            }

            // Extract captions/subtitles if available
            const captionSelectors = [
                '.caption-line',
                '.ytp-caption-segment',
                '.captions-text',
                '[class*="caption"]'
            ];
            
            for (const selector of captionSelectors) {
                const captionElements = document.querySelectorAll(selector);
                if (captionElements.length > 0) {
                    videoData.captions = Array.from(captionElements).map(el => el.textContent.trim()).filter(text => text);
                    videoData.transcript = videoData.captions.join(' ');
                    break;
                }
            }

            // Extract metadata
            const channelSelectors = [
                '#channel-name a',
                '.ytd-channel-name a',
                '[class*="channel-name"] a',
                'a[href*="/channel/"], a[href*="/@"]'
            ];
            
            for (const selector of channelSelectors) {
                const channelElement = document.querySelector(selector);
                if (channelElement && channelElement.textContent.trim()) {
                    videoData.metadata.channel = channelElement.textContent.trim();
                    break;
                }
            }

            const viewsSelectors = [
                '#count .style-scope.ytd-video-view-count-renderer',
                '.view-count',
                '[class*="view-count"]',
                '#info-contents #count'
            ];
            
            for (const selector of viewsSelectors) {
                const viewsElement = document.querySelector(selector);
                if (viewsElement && viewsElement.textContent.trim()) {
                    videoData.metadata.views = viewsElement.textContent.trim();
                    break;
                }
            }

            const dateSelectors = [
                '#date .style-scope.ytd-video-primary-info-renderer',
                '.upload-date',
                '[class*="upload-date"]',
                '#info-contents #date'
            ];
            
            for (const selector of dateSelectors) {
                const dateElement = document.querySelector(selector);
                if (dateElement && dateElement.textContent.trim()) {
                    videoData.metadata.uploadDate = dateElement.textContent.trim();
                    break;
                }
            }

            // Get video URL
            videoData.metadata.url = window.location.href;
            
            // Get video ID
            const urlParams = new URLSearchParams(window.location.search);
            videoData.metadata.videoId = urlParams.get('v') || 
                window.location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/)?.[1] || null;

            // Ensure we have at least some content
            if (!videoData.title && !videoData.description && !videoData.transcript) {
                // Fallback: try to get page title at least
                videoData.title = document.title || 'Unknown Video';
            }

            return videoData;
        } catch (error) {
            console.error('Error in extractVideoDataFromPage:', error);
            return { 
                error: error.message,
                title: document.title || 'Unknown Video',
                description: '',
                transcript: '',
                captions: [],
                metadata: {
                    url: window.location.href,
                    videoId: new URLSearchParams(window.location.search).get('v') || null
                }
            };
        }
    }

    extractVideoId(url) {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    setupContextMenu() {
        // Remove all existing context menus first to prevent duplicates
        chrome.contextMenus.removeAll(() => {
            // Medical analysis context menu
            chrome.contextMenus.create({
                id: 'analyze-medical-content',
                title: 'Analyze Medical Content',
                contexts: ['page'],
                documentUrlPatterns: ['*://*.youtube.com/*']
            });

            chrome.contextMenus.create({
                id: 'analyzeSelection',
                title: 'Analyze Selected Medical Content',
                contexts: ['selection']
            });

            chrome.contextMenus.create({
                id: 'translateSelection',
                title: 'Translate Medical Text',
                contexts: ['selection']
            });
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenu(info, tab);
        });
    }

    async handleContextMenu(info, tab) {
        try {
            if (info.menuItemId === 'analyze-medical-content') {
                // Send message to content script to perform analysis
                chrome.tabs.sendMessage(tab.id, {
                    type: 'MANUAL_ANALYSIS_REQUESTED'
                });
            } else if (info.menuItemId === 'analyzeSelection' && info.selectionText) {
                const result = await this.medicalAnalyzer.quickAnalysis(info.selectionText, {
                    language: 'en',
                    enableNER: true,
                    enableSentiment: true
                });

                // Show notification with results
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon48.png',
                    title: 'Medical Analysis Complete',
                    message: `Found ${result.medicalTerms?.length || 0} medical terms with ${Math.round((result.confidence || 0) * 100)}% confidence`
                });
            } else if (info.menuItemId === 'translateSelection' && info.selectionText) {
                const result = await this.seamlessM4T.translateText(
                    info.selectionText,
                    'en',
                    'ta',
                    { preserveMedicalTerminology: true }
                );

                // Show notification with translation
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon48.png',
                    title: 'Translation Complete',
                    message: result.translatedText.substring(0, 100) + '...'
                });
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Action Failed',
                message: error.message
            });
        }
    }

    setupTabListeners() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
                // Clear cache when navigating to new video
                const videoId = this.extractVideoId(tab.url);
                if (this.currentVideoData && this.currentVideoData.videoId !== videoId) {
                    this.currentVideoData = null;
                }
                
                // Auto-analyze if enabled
                this.autoAnalyzeVideo(tabId, tab.url);
            }
        });

        // Badge management for risk levels
        chrome.tabs.onActivated.addListener((activeInfo) => {
            // Clear badge when switching tabs
            chrome.action.setBadgeText({ text: "", tabId: activeInfo.tabId });
        });
    }

    // Update badge based on risk level
    updateBadge(tabId, riskLevel) {
        const badges = {
            'SAFE': { text: '✓', color: '#4CAF50' },
            'CAUTION': { text: '!', color: '#FF9800' },
            'WARNING': { text: '⚠', color: '#FF5722' },
            'DANGEROUS': { text: '✗', color: '#F44336' }
        };
        
        const badge = badges[riskLevel] || badges['CAUTION'];
        chrome.action.setBadgeText({ text: badge.text, tabId });
        chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId });
    }

    // Auto-analyze video content
    async autoAnalyzeVideo(tabId, url) {
        try {
            const settings = await this.getSettings();
            if (!settings.autoAnalyzeEnabled) return;

            // Wait for page to load
            setTimeout(async () => {
                try {
                    const videoData = await this.extractVideoContent(tabId);
                    if (videoData && !videoData.error) {
                        // Quick risk assessment
                        const riskResult = await this.performQuickRiskAssessment({
                            riskCategory: 'general',
                            enableDrugInteraction: true,
                            checkContraindications: true,
                            assessSafety: true,
                            flagMisinformation: true
                        });

                        if (riskResult.success) {
                            this.updateBadge(tabId, riskResult.riskLevel);
                            
                            // Store results for popup
                            await chrome.storage.local.set({
                                [`analysis_${this.extractVideoId(url)}`]: {
                                    timestamp: Date.now(),
                                    riskAssessment: riskResult,
                                    videoData
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error('Auto-analysis failed:', error);
                }
            }, settings.analysisDelay || 3000);
        } catch (error) {
            console.error('Error in auto-analyze:', error);
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get('medicalOptimizerSettings');
            return result.medicalOptimizerSettings || {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    async saveSettings(settings) {
        try {
            await chrome.storage.sync.set({ medicalOptimizerSettings: settings });
            
            // Reinitialize AI components with new settings
            if (settings.huggingFaceApiKey) {
                await this.initializeAI();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }

    async handleTranscriptRequest(message, sender) {
        try {
            console.log('Handling transcript request for video:', message.videoId);
            
            // Send progress update to popup
            chrome.runtime.sendMessage({
                action: 'updateProgress',
                type: 'transcript',
                progress: 30,
                statusText: 'Extracting transcript...'
            });

            // Extract transcript from the page
            const result = await chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                function: () => {
                    // Check if captions are available
                    const captionButtons = document.querySelectorAll('[aria-label*="captions"], [aria-label*="subtitles"], .ytp-subtitles-button');
                    
                    // Try to get transcript from YouTube's built-in transcript feature
                    const transcriptButtons = document.querySelectorAll('[aria-label*="transcript"], [aria-label*="Show transcript"]');
                    
                    // Extract video title and basic info
                    const title = document.querySelector('h1.ytd-video-primary-info-renderer, #container h1')?.textContent?.trim() || 'Unknown Title';
                    const channel = document.querySelector('#text-container yt-formatted-string, #upload-info #channel-name')?.textContent?.trim() || 'Unknown Channel';
                    
                    return {
                        title,
                        channel,
                        hasCaptions: captionButtons.length > 0,
                        hasTranscript: transcriptButtons.length > 0,
                        url: window.location.href
                    };
                }
            });

            const videoInfo = result[0].result;
            
            // Update progress to popup
            chrome.runtime.sendMessage({
                action: 'updateProgress',
                type: 'transcript',
                progress: 60,
                statusText: 'Processing video information...'
            });

            if (videoInfo.hasCaptions || videoInfo.hasTranscript) {
                // Simulate transcript extraction (in a real implementation, you'd extract actual captions)
                const mockTranscript = `This is a sample transcript for: ${videoInfo.title}\n\nChannel: ${videoInfo.channel}\n\nTranscript content would appear here if captions are available.\n\nThis extension can extract and analyze medical content from YouTube videos.`;
                
                // Update progress to popup
                chrome.runtime.sendMessage({
                    action: 'updateProgress',
                    type: 'transcript',
                    progress: 90,
                    statusText: 'Finalizing transcript...'
                });

                // Send success result to popup
                chrome.runtime.sendMessage({
                    action: 'displayTranscript',
                    data: {
                        type: 'single-language',
                        content: mockTranscript,
                        language: 'en',
                        title: videoInfo.title,
                        channel: videoInfo.channel
                    }
                });
            } else {
                // No captions available - send to popup
                chrome.runtime.sendMessage({
                    action: 'displayTranscript',
                    error: 'No captions or transcript available for this video. Please try a video with captions enabled.'
                });
            }
        } catch (error) {
            console.error('Transcript extraction failed:', error);
            chrome.runtime.sendMessage({
                action: 'displayTranscript',
                error: `Failed to extract transcript: ${error.message}`
            });
        }
    }

    async handleCommentsAnalysis(message, sender) {
        try {
            console.log('Handling comments analysis for video:', message.videoId);
            
            // Send progress updates
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'updateProgress',
                type: 'comments',
                progress: 20,
                statusText: 'Fetching comments...'
            });

            // Simulate comment analysis
            setTimeout(() => {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'updateProgress',
                    type: 'comments',
                    progress: 60,
                    statusText: 'Analyzing sentiment...'
                });

                setTimeout(() => {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'displayCommentAnalysis',
                        data: {
                            totalAnalyzed: 50,
                            totalFetched: 100,
                            sentiment: {
                                positive: 30,
                                negative: 10,
                                neutral: 10
                            },
                            sampleAnalyzedComments: [
                                { text: "This is very helpful medical information!", sentiment: "positive" },
                                { text: "Great explanation of the treatment", sentiment: "positive" },
                                { text: "Not sure about this advice", sentiment: "negative" }
                            ]
                        }
                    });
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error('Comments analysis failed:', error);
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'displayCommentAnalysis',
                error: `Failed to analyze comments: ${error.message}`
            });
        }
    }

    async handleRagAnalysis(message, sender) {
        try {
            console.log('Handling RAG analysis for query:', message.query);
            
            // Send progress updates
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'updateProgress',
                type: 'rag',
                progress: 30,
                statusText: 'Processing question...'
            });

            // Simulate RAG analysis
            setTimeout(() => {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'updateProgress',
                    type: 'rag',
                    progress: 70,
                    statusText: 'Generating response...'
                });

                setTimeout(() => {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'displayRagAnalysis',
                        data: {
                            answer: `Based on the video content, here's the answer to your question: "${message.query}"\n\nThis is a simulated response. In a full implementation, this would analyze the actual video transcript and provide relevant medical information.`,
                            sources: [
                                "Video transcript content",
                                "Medical knowledge base",
                                "Verified medical sources"
                            ],
                            provider: 'huggingface'
                        }
                    });
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error('RAG analysis failed:', error);
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'displayRagAnalysis',
                error: `Failed to perform RAG analysis: ${error.message}`
            });
        }
    }

    // New Integrated Medical Analysis Methods

    async processYouTubeTranscript(transcript, options = {}) {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            return await this.integratedMedicalAnalysis.processYouTubeTranscript(transcript, options);
        } catch (error) {
            console.error('YouTube transcript processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async processMedicalDocument(imageData, documentType = 'auto', options = {}) {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            // Convert base64 image data to File object if needed
            let imageFile = imageData;
            if (typeof imageData === 'string') {
                const response = await fetch(imageData);
                const blob = await response.blob();
                imageFile = new File([blob], 'medical-document.jpg', { type: 'image/jpeg' });
            }

            return await this.integratedMedicalAnalysis.processMedicalDocument(imageFile, documentType, options);
        } catch (error) {
            console.error('Medical document processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async extractYouTubeAudio(options = {}) {
        try {
            console.log('Extracting YouTube audio...', options);

            if (!options.tabId) {
                return {
                    success: false,
                    error: 'Tab ID required for YouTube audio extraction'
                };
            }

            // Inject content script to extract audio from YouTube
            const audioExtractionScript = `
                (async function() {
                    try {
                        // Find the YouTube video element
                        const video = document.querySelector('video');
                        if (!video) {
                            throw new Error('No video element found on page');
                        }

                        // Get video URL and metadata
                        const videoUrl = window.location.href;
                        const videoTitle = document.querySelector('h1.title')?.textContent || 
                                         document.querySelector('#watch-title')?.textContent || 
                                         document.querySelector('.title')?.textContent || 
                                         'YouTube Video';

                        // Create audio context for processing
                        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        
                        // Create media element source
                        const source = audioContext.createMediaElementSource(video);
                        
                        // Create script processor for audio capture
                        const processor = audioContext.createScriptProcessor(4096, 1, 1);
                        
                        let audioData = [];
                        let duration = 0;
                        const maxDuration = 300; // 5 minutes max
                        
                        processor.onaudioprocess = function(e) {
                            const inputData = e.inputBuffer.getChannelData(0);
                            audioData.push(new Float32Array(inputData));
                            duration += inputData.length / audioContext.sampleRate;
                            
                            // Stop after max duration
                            if (duration > maxDuration) {
                                processor.disconnect();
                                source.disconnect();
                            }
                        };
                        
                        // Connect the nodes
                        source.connect(processor);
                        processor.connect(audioContext.destination);
                        
                        // Wait for some audio data
                        await new Promise(resolve => {
                            setTimeout(resolve, 3000); // Capture 3 seconds
                        });
                        
                        // Disconnect to stop capturing
                        processor.disconnect();
                        source.disconnect();
                        
                        // Convert to WAV format
                        const audioBuffer = audioContext.createBuffer(1, audioData.length * 4096, audioContext.sampleRate);
                        const channelData = audioBuffer.getChannelData(0);
                        
                        let offset = 0;
                        for (let i = 0; i < audioData.length; i++) {
                            channelData.set(audioData[i], offset);
                            offset += audioData[i].length;
                        }
                        
                        // Create WAV blob
                        const wavBlob = audioBufferToWav(audioBuffer);
                        
                        // Convert to base64
                        const reader = new FileReader();
                        return new Promise((resolve) => {
                            reader.onload = function() {
                                resolve({
                                    success: true,
                                    audioData: reader.result,
                                    videoTitle: videoTitle,
                                    videoUrl: videoUrl,
                                    duration: Math.min(duration, maxDuration)
                                });
                            };
                            reader.readAsDataURL(wavBlob);
                        });
                        
                    } catch (error) {
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                    
                    // Helper function to convert AudioBuffer to WAV
                    function audioBufferToWav(buffer) {
                        const length = buffer.length;
                        const arrayBuffer = new ArrayBuffer(44 + length * 2);
                        const view = new DataView(arrayBuffer);
                        
                        // WAV header
                        const writeString = (offset, string) => {
                            for (let i = 0; i < string.length; i++) {
                                view.setUint8(offset + i, string.charCodeAt(i));
                            }
                        };
                        
                        writeString(0, 'RIFF');
                        view.setUint32(4, 36 + length * 2, true);
                        writeString(8, 'WAVE');
                        writeString(12, 'fmt ');
                        view.setUint32(16, 16, true);
                        view.setUint16(20, 1, true);
                        view.setUint16(22, 1, true);
                        view.setUint32(24, buffer.sampleRate, true);
                        view.setUint32(28, buffer.sampleRate * 2, true);
                        view.setUint16(32, 2, true);
                        view.setUint16(34, 16, true);
                        writeString(36, 'data');
                        view.setUint32(40, length * 2, true);
                        
                        // Convert float samples to 16-bit PCM
                        const channelData = buffer.getChannelData(0);
                        let offset = 44;
                        for (let i = 0; i < length; i++) {
                            const sample = Math.max(-1, Math.min(1, channelData[i]));
                            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                            offset += 2;
                        }
                        
                        return new Blob([arrayBuffer], { type: 'audio/wav' });
                    }
                })();
            `;

            // Execute the audio extraction script
            const results = await chrome.scripting.executeScript({
                target: { tabId: options.tabId },
                func: new Function('return ' + audioExtractionScript)()
            });

            if (results && results[0] && results[0].result) {
                const result = results[0].result;
                
                if (result.success) {
                    console.log('YouTube audio extracted successfully');
                    return {
                        success: true,
                        audioData: result.audioData,
                        metadata: {
                            title: result.videoTitle,
                            url: result.videoUrl,
                            duration: result.duration,
                            source: 'youtube'
                        }
                    };
                } else {
                    return {
                        success: false,
                        error: result.error || 'Failed to extract audio from YouTube'
                    };
                }
            } else {
                return {
                    success: false,
                    error: 'No response from audio extraction script'
                };
            }

        } catch (error) {
            console.error('YouTube audio extraction failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async processAudioTranscription(audioData, options = {}) {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            // Convert audio data to File object if needed
            let audioFile = audioData;
            if (typeof audioData === 'string') {
                const response = await fetch(audioData);
                const blob = await response.blob();
                audioFile = new File([blob], 'medical-audio.mp3', { type: 'audio/mpeg' });
            }

            return await this.integratedMedicalAnalysis.processAudioTranscription(audioFile, options);
        } catch (error) {
            console.error('Audio transcription processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAllStoredMedicalData() {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            const data = await this.integratedMedicalAnalysis.getAllStoredData();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Failed to get stored medical data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async searchMedicalData(query, options = {}) {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            const results = await this.integratedMedicalAnalysis.searchMedicalData(query, options);
            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('Medical data search failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async exportMedicalData(format = 'json', filterOptions = {}) {
        try {
            if (!this.integratedMedicalAnalysis) {
                return {
                    success: false,
                    error: 'Integrated Medical Analysis not available'
                };
            }

            const exportData = await this.integratedMedicalAnalysis.exportData(format, filterOptions);
            return {
                success: true,
                data: exportData,
                format
            };
        } catch (error) {
            console.error('Medical data export failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Fetch video captions using youtube-captions-scraper
    async fetchVideoCaption(videoId, language = 'en', options = {}) {
        try {
            console.log(`Fetching captions for video: ${videoId}, language: ${language}`);

            // Ensure caption fetcher is available
            if (typeof CaptionFetcher === 'undefined') {
                throw new Error('Caption fetcher not available');
            }

            const { fetchCaptionsWithFallback } = CaptionFetcher;
            
            // Extract fallback languages from options or use defaults
            const fallbackLangs = options.fallbackLanguages || ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'];
            
            // Fetch captions with fallback
            const captionResult = await fetchCaptionsWithFallback(videoId, language, fallbackLangs);
            
            if (captionResult.success) {
                // Store captions in cache for future use
                const cacheKey = `captions_${videoId}_${captionResult.language}`;
                this.analysisCache.set(cacheKey, {
                    ...captionResult,
                    timestamp: Date.now()
                });

                console.log(`Successfully fetched ${captionResult.totalSegments} caption segments for video ${videoId}`);
                
                return {
                    success: true,
                    videoId,
                    language: captionResult.language,
                    usedFallbackLanguage: captionResult.usedFallbackLanguage,
                    captions: captionResult.captions,
                    totalSegments: captionResult.totalSegments,
                    fullText: captionResult.totalText,
                    type: captionResult.type,
                    timestamp: new Date().toISOString()
                };
            } else {
                console.warn(`Failed to fetch captions for video ${videoId}:`, captionResult.error);
                
                return {
                    success: false,
                    videoId,
                    language,
                    error: captionResult.error,
                    triedLanguages: captionResult.triedLanguages,
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error(`Caption fetching failed for video ${videoId}:`, error);
            
            return {
                success: false,
                videoId,
                language,
                error: `Caption fetching failed: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Broadcast methods for real-time updates
    broadcastProgress(event) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'medicalAnalysisProgress',
                    event
                });
            }
        });
    }

    broadcastResult(event) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'medicalAnalysisResult',
                    event
                });
            }
        });
    }

    broadcastError(event) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'medicalAnalysisError',
                    event
                });
            }
        });
    }
}

// Initialize the background script
const medicalOptimizerBackground = new MedicalOptimizerBackground();
