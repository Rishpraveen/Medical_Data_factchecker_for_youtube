/**
 * HealthGuard - Enhanced Medical Analysis Extension
 * Modern interface with comprehensive functionality
 */

class HealthGuardApp {
    constructor() {
        this.currentTab = 'home';
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingInterval = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing HealthGuard App...');
            
            // Check if we're in extension context
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                console.warn('Not running in extension context - some features may be limited');
                this.showNotification('Running in demo mode - some features limited', 'info');
            }
            
            // Wait a moment for DOM to be fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Initialize UI components
            this.setupNavigation();
            this.setupEventListeners();
            this.setupDragAndDrop();
            
            // Load user settings and data (only if in extension context)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await this.loadUserSettings();
                await this.loadStoredData();
            }
            
            // Show initial tab
            this.activateTab(window.isFullPage ? 'dashboard' : 'home');
            
            console.log('HealthGuard App initialized successfully');
            this.showNotification('HealthGuard extension ready!', 'success');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showNotification('Failed to initialize medical analysis system', 'error');
        }
    }

    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update active nav tab
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
                
                this.currentTab = tabId;
                
                // Track tab switching
                this.trackEvent('tab_switch', { tab: tabId });
            });
        });
    }

    setupEventListeners() {
        // Header actions
        this.setupElement('expandBtn', () => this.expandToWebpage());

        // Home tab actions
        this.setupElement('analyzeCurrentVideo', () => this.switchToAnalysis());
        this.setupElement('uploadDocument', () => this.switchToDocumentUpload());
        this.setupElement('recordAudio', () => this.switchToAudioRecording());
        this.setupElement('getCaptions', () => this.fetchVideoCaption());

        // Analysis tab
        this.setupElement('quickAnalyzeBtn', () => this.performQuickAnalysis());
        this.setupElement('fullAnalyzeBtn', () => this.performFullAnalysis());
        this.setupElement('translateBtn', () => this.performTranslation());

        // Document upload
        this.setupElement('documentUpload', () => document.getElementById('documentFileInput').click());
        this.setupElement('documentFileInput', (event) => this.handleDocumentUpload(event));

        // Audio recording
        this.setupElement('startRecordingBtn', () => this.startRecording());
        this.setupElement('stopRecordingBtn', () => this.stopRecording());

        // Profile form
        this.setupElement('userName', () => this.saveUserProfile(), 'input');
        this.setupElement('userEmail', () => this.saveUserProfile(), 'input');
        
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUserProfile();
            });
        }

        // Settings toggles
        this.setupSettingsToggles();

        // Settings actions
        this.setupElement('exportDataBtn', () => this.exportData());
        this.setupElement('clearDataBtn', () => this.clearAllData());
        this.setupElement('helpBtn', () => this.showHelp());

        // Event delegation for dynamically created buttons
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const videoId = target.dataset.videoId;

            switch (action) {
                case 'analyze-caption':
                    this.analyzeCaption(videoId);
                    break;
                case 'copy-caption':
                    this.copyCaption(videoId);
                    break;
            }
        });
    }

    setupElement(id, handler, event = 'click') {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    setupSettingsToggles() {
        const settingsToggles = [
            'enableExtension',
            'showRiskScores', 
            'filterHighRisk',
            'showCredibilityScores',
            'analysisNotifications',
            'riskAlerts',
            'storeHistory',
            'anonymousData'
        ];

        settingsToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', () => this.saveSettings());
            }
        });
    }

    setupDragAndDrop() {
        // Document upload drag and drop
        const documentUpload = document.getElementById('documentUpload');
        if (documentUpload) {
            documentUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                documentUpload.classList.add('dragover');
            });

            documentUpload.addEventListener('dragleave', () => {
                documentUpload.classList.remove('dragover');
            });

            documentUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                documentUpload.classList.remove('dragover');
                
                const files = Array.from(e.dataTransfer.files);
                this.processDocumentFiles(files);
            });
        }
    }

    // Navigation Functions
    switchToAnalysis() {
        this.activateTab('analysis');
    }

    switchToDocumentUpload() {
        this.activateTab('analysis');
        // Scroll to document section
        setTimeout(() => {
            const documentSection = document.querySelector('.upload-section');
            if (documentSection) {
                documentSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    switchToAudioRecording() {
        this.activateTab('analysis');
        // Scroll to audio section
        setTimeout(() => {
            const audioSection = document.querySelector('.audio-section');
            if (audioSection) {
                audioSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    activateTab(tabId) {
        // Programmatically switch tabs
        const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }

    // Expand to Webpage
    expandToWebpage() {
        try {
            // Create a full webpage version
            const webpageUrl = chrome.runtime.getURL('fullpage.html');
            
            // Try to open in new tab
            if (chrome.tabs && chrome.tabs.create) {
                chrome.tabs.create({ 
                    url: webpageUrl,
                    active: true 
                });
            } else {
                // Fallback: open in current window
                window.open(webpageUrl, '_blank');
            }
            
            this.showNotification('Opening HealthGuard in full page mode', 'success');
            this.trackEvent('expand_to_webpage');
            
            // Close popup after successful expansion
            setTimeout(() => window.close(), 500);
            
        } catch (error) {
            console.error('Failed to expand to webpage:', error);
            
            // Fallback: try direct navigation
            try {
                const webpageUrl = chrome.runtime.getURL('fullpage.html');
                window.open(webpageUrl, '_blank');
                this.showNotification('Opening in new window', 'success');
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                this.showNotification('Failed to open full page mode', 'error');
            }
        }
    }

    // Analysis Functions
    async performQuickAnalysis() {
        try {
            this.showProgress('Analyzing current YouTube video...', 10);
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('youtube.com')) {
                // Demo mode for testing
                this.showNotification('Demo mode: Simulating analysis on current page', 'info');
                this.showProgress('Simulating medical analysis...', 50);
                
                setTimeout(() => {
                    this.showProgress('Demo analysis complete!', 100);
                    this.displayAnalysisResult('Quick Analysis (Demo)', {
                        success: true,
                        analysis: 'Demo analysis completed',
                        demo: true
                    });
                    this.showNotification('Demo analysis completed! Go to YouTube for real analysis.', 'success');
                    this.hideProgress();
                }, 2000);
                
                return;
            }

            this.showProgress('Extracting video content...', 30);

            // Send message to background script
            const response = await chrome.runtime.sendMessage({
                action: 'quickAnalysis',
                options: { tabId: tab.id }
            });

            this.showProgress('Processing medical analysis...', 70);

            if (response && response.success) {
                this.showProgress('Analysis complete!', 100);
                this.displayAnalysisResult('Quick Analysis', response);
                this.trackEvent('quick_analysis_success');
                this.showNotification('Quick analysis completed successfully!', 'success');
            } else {
                const errorMsg = response?.error || 'Analysis failed - please try again';
                this.showNotification(errorMsg, 'error');
                this.trackEvent('quick_analysis_failed', { error: errorMsg });
            }

        } catch (error) {
            console.error('Quick analysis failed:', error);
            this.showNotification('Failed to analyze video - check if you\'re on a YouTube page', 'error');
            this.trackEvent('quick_analysis_error', { error: error.message });
        } finally {
            this.hideProgress();
        }
    }

    async performFullAnalysis() {
        try {
            this.showProgress('Performing comprehensive analysis...', 10);
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('youtube.com')) {
                this.showNotification('Please navigate to a YouTube video first', 'error');
                return;
            }

            this.showProgress('Extracting video metadata...', 25);
            
            const response = await chrome.runtime.sendMessage({
                action: 'fullAnalysis',
                options: { tabId: tab.id }
            });

            this.showProgress('Analyzing medical content...', 60);

            if (response && response.success) {
                this.showProgress('Generating comprehensive report...', 90);
                this.displayAnalysisResult('Comprehensive Analysis', response);
                this.trackEvent('full_analysis_success');
                this.showNotification('Comprehensive analysis completed successfully!', 'success');
            } else {
                const errorMsg = response?.error || 'Full analysis failed - please try again';
                this.showNotification(errorMsg, 'error');
                this.trackEvent('full_analysis_failed', { error: errorMsg });
            }

        } catch (error) {
            console.error('Full analysis failed:', error);
            this.showNotification('Failed to perform full analysis - check your internet connection', 'error');
            this.trackEvent('full_analysis_error', { error: error.message });
        } finally {
            this.hideProgress();
        }
    }

    async performTranslation() {
        try {
            const sourceLanguage = document.getElementById('sourceLanguage')?.value || 'en';
            const targetLanguage = document.getElementById('targetLanguage')?.value || 'ta';
            
            this.showProgress('Translating content...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const response = await chrome.runtime.sendMessage({
                action: 'translateContent',
                sourceLanguage,
                targetLanguage,
                options: { tabId: tab.id }
            });

            if (response && response.success) {
                this.displayAnalysisResult('Translation', response);
                this.trackEvent('translation_success', { 
                    from: sourceLanguage, 
                    to: targetLanguage 
                });
            } else {
                this.showNotification(response?.error || 'Translation failed', 'error');
                this.trackEvent('translation_failed');
            }

        } catch (error) {
            console.error('Translation failed:', error);
            this.showNotification('Failed to translate content', 'error');
            this.trackEvent('translation_error');
        } finally {
            this.hideProgress();
        }
    }

    // Caption Fetching Function
    async fetchVideoCaption() {
        try {
            this.showProgress('Fetching video captions...', 10);
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('youtube.com/watch')) {
                // Demo mode for testing
                this.showNotification('Demo mode: Please navigate to a YouTube video', 'info');
                this.hideProgress();
                return;
            }

            // Extract video ID from URL
            const videoId = this.extractVideoId(tab.url);
            if (!videoId) {
                this.showNotification('Could not extract video ID from URL', 'error');
                this.hideProgress();
                return;
            }

            this.showProgress('Requesting captions from server...', 30);

            // Get preferred language from settings
            const language = document.getElementById('sourceLanguage')?.value || 'en';

            // Send message to background script to fetch captions
            const response = await chrome.runtime.sendMessage({
                action: 'fetchCaptions',
                videoId: videoId,
                language: language,
                options: {
                    fallbackLanguages: ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh']
                }
            });

            this.showProgress('Processing caption data...', 70);

            if (response && response.success) {
                this.showProgress('Captions fetched successfully!', 100);
                
                // Display the captions in the results area
                this.displayCaptionResult(response);
                
                this.trackEvent('caption_fetch_success', { 
                    videoId: videoId, 
                    language: response.language,
                    segments: response.totalSegments 
                });
                
                const message = response.usedFallbackLanguage 
                    ? `Captions fetched in ${response.language} (fallback language)` 
                    : `Captions fetched in ${response.language}`;
                
                this.showNotification(message, 'success');
                
                // Switch to analysis tab to show results
                this.activateTab('analysis');
                
            } else {
                const errorMsg = response?.error || 'Failed to fetch captions';
                this.showNotification(errorMsg, 'error');
                this.trackEvent('caption_fetch_failed', { 
                    videoId: videoId, 
                    error: errorMsg 
                });
            }

        } catch (error) {
            console.error('Caption fetching failed:', error);
            this.showNotification('Failed to fetch video captions', 'error');
            this.trackEvent('caption_fetch_error', { error: error.message });
        } finally {
            this.hideProgress();
        }
    }

    // Helper method to extract video ID from YouTube URL
    extractVideoId(url) {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Display caption results in a user-friendly format
    displayCaptionResult(captionData) {
        const resultsContainer = this.ensureResultsContainer();
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card fade-in';
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-title">Video Captions (${captionData.language.toUpperCase()})</div>
                <div class="result-timestamp">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="result-content">
                <div style="margin-bottom: 12px;">
                    <strong>Video ID:</strong> ${captionData.videoId}<br>
                    <strong>Language:</strong> ${captionData.language}${captionData.usedFallbackLanguage ? ' (fallback)' : ''}<br>
                    <strong>Type:</strong> ${captionData.type}<br>
                    <strong>Segments:</strong> ${captionData.totalSegments}
                </div>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; background: var(--bg-secondary);">
                    <div style="font-size: 13px; line-height: 1.4; white-space: pre-wrap;">${captionData.fullText}</div>
                </div>
                <div style="margin-top: 12px;">
                    <button class="btn btn-primary btn-sm" data-action="analyze-caption" data-video-id="${captionData.videoId}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
                        </svg>
                        Analyze Caption Content
                    </button>
                    <button class="btn btn-secondary btn-sm" data-action="copy-caption" data-video-id="${captionData.videoId}" style="margin-left: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M184,64H40A16,16,0,0,0,24,80V216a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V80A16,16,0,0,0,184,64Zm0,152H40V80H184ZM224,40V176a8,8,0,0,1-16,0V48H72a8,8,0,0,1,0-16H208A16,16,0,0,1,224,40Z"/>
                        </svg>
                        Copy Text
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(resultCard);
        
        // Store caption data for later use
        this.currentCaptionData = captionData;
    }

    // Analyze caption content using medical analysis
    async analyzeCaption(videoId) {
        try {
            if (!this.currentCaptionData || this.currentCaptionData.videoId !== videoId) {
                this.showNotification('Caption data not available for analysis', 'error');
                return;
            }

            this.showProgress('Analyzing caption content for medical information...', 30);

            const response = await chrome.runtime.sendMessage({
                action: 'processYouTubeTranscript',
                transcript: this.currentCaptionData.fullText,
                options: {
                    enableNER: true,
                    enableSentiment: true,
                    enableClassification: true,
                    medicalFocus: true,
                    language: this.currentCaptionData.language
                }
            });

            if (response && response.success) {
                this.showProgress('Caption analysis complete!', 100);
                this.displayAnalysisResult('Caption Medical Analysis', response);
                this.showNotification('Caption content analyzed successfully!', 'success');
                this.trackEvent('caption_analysis_success', { videoId });
            } else {
                this.showNotification(response?.error || 'Caption analysis failed', 'error');
                this.trackEvent('caption_analysis_failed', { videoId });
            }

        } catch (error) {
            console.error('Caption analysis failed:', error);
            this.showNotification('Failed to analyze caption content', 'error');
            this.trackEvent('caption_analysis_error', { videoId, error: error.message });
        } finally {
            this.hideProgress();
        }
    }

    // Copy caption text to clipboard
    async copyCaption(videoId) {
        try {
            if (!this.currentCaptionData || this.currentCaptionData.videoId !== videoId) {
                this.showNotification('Caption data not available', 'error');
                return;
            }

            await navigator.clipboard.writeText(this.currentCaptionData.fullText);
            this.showNotification('Caption text copied to clipboard!', 'success');
            this.trackEvent('caption_copy_success', { videoId });

        } catch (error) {
            console.error('Failed to copy caption:', error);
            this.showNotification('Failed to copy caption text', 'error');
        }
    }

    // Document Functions
    handleDocumentUpload(event) {
        const files = Array.from(event.target.files);
        this.processDocumentFiles(files);
    }

    async processDocumentFiles(files) {
        try {
            if (files.length === 0) return;

            for (const file of files) {
                this.showProgress(`Processing document: ${file.name}`);
                
                // Convert file to base64 for sending to background script
                const fileData = await this.fileToBase64(file);
                
                const response = await chrome.runtime.sendMessage({
                    action: 'processMedicalDocument',
                    imageData: fileData,
                    documentType: 'auto',
                    options: {}
                });
                
                if (response && response.success) {
                    this.displayAnalysisResult('Document Analysis', response);
                    this.trackEvent('document_processing_success');
                } else {
                    this.showNotification(response?.error || 'Document processing failed', 'error');
                    this.trackEvent('document_processing_failed');
                }
            }

        } catch (error) {
            console.error('Document processing failed:', error);
            this.showNotification('Failed to process document', 'error');
            this.trackEvent('document_processing_error');
        } finally {
            this.hideProgress();
        }
    }

    // Audio Functions
    async startRecording() {
        try {
            // Check if we're on YouTube - if so, extract audio from video
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.includes('youtube.com')) {
                await this.extractYouTubeAudio();
                return;
            }
            
            // Otherwise, use microphone recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Update UI
            const startBtn = document.getElementById('startRecordingBtn');
            const stopBtn = document.getElementById('stopRecordingBtn');
            const indicator = document.getElementById('recordingIndicator');
            
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            if (indicator) indicator.style.display = 'flex';
            
            // Start timer
            this.updateRecordingTime();
            this.recordingInterval = setInterval(() => this.updateRecordingTime(), 1000);
            
            this.trackEvent('recording_started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showNotification('Failed to access microphone', 'error');
            this.trackEvent('recording_failed');
        }
    }

    async extractYouTubeAudio() {
        try {
            this.showProgress('Extracting audio from YouTube video...', 10);
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('youtube.com')) {
                this.showNotification('Please navigate to a YouTube video first', 'error');
                return;
            }

            this.showProgress('Accessing video audio stream...', 30);

            // Send message to background script to extract audio
            const response = await chrome.runtime.sendMessage({
                action: 'extractYouTubeAudio',
                options: { tabId: tab.id }
            });

            this.showProgress('Processing audio for medical analysis...', 60);

            if (response && response.success) {
                this.showProgress('Transcribing medical content...', 80);
                
                // Process the extracted audio
                const audioResult = await chrome.runtime.sendMessage({
                    action: 'processAudioTranscription',
                    audioData: response.audioData,
                    options: { 
                        source: 'youtube',
                        videoUrl: tab.url,
                        medicalAnalysis: true,
                        metadata: response.metadata
                    }
                });
                
                if (audioResult && audioResult.success) {
                    this.showProgress('Analysis complete!', 100);
                    this.displayAnalysisResult('YouTube Audio Analysis', audioResult);
                    this.showNotification('YouTube audio analysis completed successfully!', 'success');
                    this.trackEvent('youtube_audio_analysis_success');
                } else {
                    this.showNotification(audioResult?.error || 'Audio analysis failed', 'error');
                }
            } else {
                this.showNotification(response?.error || 'Failed to extract audio from YouTube', 'error');
            }

        } catch (error) {
            console.error('YouTube audio extraction failed:', error);
            this.showNotification('Failed to extract audio - ensure you\'re on a YouTube video page', 'error');
            this.trackEvent('youtube_audio_extraction_error', { error: error.message });
        } finally {
            this.hideProgress();
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            this.isRecording = false;
            clearInterval(this.recordingInterval);
            
            // Update UI
            const startBtn = document.getElementById('startRecordingBtn');
            const stopBtn = document.getElementById('stopRecordingBtn');
            const indicator = document.getElementById('recordingIndicator');
            
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
            if (indicator) indicator.style.display = 'none';
            
            this.trackEvent('recording_stopped');
        }
    }

    updateRecordingTime() {
        if (this.recordingStartTime) {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            const timeElement = document.getElementById('recordingTime');
            if (timeElement) {
                timeElement.textContent = `${minutes}:${seconds}`;
            }
        }
    }

    async processRecording() {
        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
            
            this.showProgress('Transcribing audio...');
            
            const audioData = await this.fileToBase64(audioFile);
            
            const response = await chrome.runtime.sendMessage({
                action: 'processAudioTranscription',
                audioData,
                options: {}
            });
            
            if (response && response.success) {
                this.displayAnalysisResult('Audio Transcription', response);
                this.trackEvent('audio_transcription_success');
            } else {
                this.showNotification(response?.error || 'Transcription failed', 'error');
                this.trackEvent('audio_transcription_failed');
            }
            
        } catch (error) {
            console.error('Recording processing failed:', error);
            this.showNotification('Failed to process recording', 'error');
            this.trackEvent('audio_transcription_error');
        } finally {
            this.hideProgress();
        }
    }

    // Profile & Settings Functions
    async saveUserProfile() {
        try {
            const profileData = {
                name: document.getElementById('userName')?.value || '',
                email: document.getElementById('userEmail')?.value || '',
                gender: document.getElementById('userGender')?.value || '',
                ageGroup: document.getElementById('userAge')?.value || '',
                healthConditions: Array.from(document.getElementById('healthConditions')?.selectedOptions || [])
                    .map(option => option.value),
                medications: document.getElementById('medications')?.value || ''
            };

            await chrome.storage.local.set({ userProfile: profileData });
            this.showNotification('Profile saved successfully', 'success');
            this.trackEvent('profile_saved');

        } catch (error) {
            console.error('Failed to save profile:', error);
            this.showNotification('Failed to save profile', 'error');
        }
    }

    async saveSettings() {
        try {
            const settings = {
                enableExtension: document.getElementById('enableExtension')?.checked || false,
                showRiskScores: document.getElementById('showRiskScores')?.checked || false,
                filterHighRisk: document.getElementById('filterHighRisk')?.checked || false,
                showCredibilityScores: document.getElementById('showCredibilityScores')?.checked || false,
                analysisNotifications: document.getElementById('analysisNotifications')?.checked || false,
                riskAlerts: document.getElementById('riskAlerts')?.checked || false,
                storeHistory: document.getElementById('storeHistory')?.checked || false,
                anonymousData: document.getElementById('anonymousData')?.checked || false
            };

            await chrome.storage.local.set({ userSettings: settings });
            this.showNotification('Settings saved', 'success');
            this.trackEvent('settings_saved');

        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    // Data Management Functions
    async exportData() {
        try {
            this.showProgress('Exporting data...');
            
            const allData = await chrome.storage.local.get(null);
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: allData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `healthguard-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully', 'success');
            this.trackEvent('data_exported');

        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export data', 'error');
        } finally {
            this.hideProgress();
        }
    }

    async clearAllData() {
        if (confirm('Are you sure you want to clear all stored medical data? This action cannot be undone.')) {
            try {
                this.showProgress('Clearing data...');
                
                // Clear all chrome storage
                await chrome.storage.local.clear();
                
                this.showNotification('All data cleared successfully', 'success');
                this.trackEvent('data_cleared');
                
                // Reload to reset UI
                setTimeout(() => window.location.reload(), 1000);

            } catch (error) {
                console.error('Failed to clear data:', error);
                this.showNotification('Failed to clear data', 'error');
            } finally {
                this.hideProgress();
            }
        }
    }

    showHelp() {
        // Create help modal or redirect to help page
        const helpUrl = chrome.runtime.getURL('README.md');
        chrome.tabs.create({ url: helpUrl });
        this.trackEvent('help_opened');
    }

    // Display Functions
    // Helper method to ensure results container exists
    ensureResultsContainer() {
        // Try fullpage container first, then popup container
        let resultsContainer = document.getElementById('fullAnalysisResults') || 
                              document.getElementById('analysisResults');
        
        if (!resultsContainer) {
            console.warn('Results container not found, creating one');
            
            // Try to find the analysis tab content
            const analysisTab = document.getElementById('analysis-tab');
            if (analysisTab) {
                resultsContainer = document.createElement('div');
                resultsContainer.id = 'analysisResults';
                resultsContainer.className = 'results-container';
                analysisTab.appendChild(resultsContainer);
            } else {
                // Fallback: create a temporary container
                resultsContainer = document.createElement('div');
                resultsContainer.id = 'analysisResults';
                resultsContainer.className = 'results-container';
                resultsContainer.style.cssText = 'margin-top: 16px; max-height: 300px; overflow-y: auto;';
                document.body.appendChild(resultsContainer);
            }
        }
        
        return resultsContainer;
    }

    displayAnalysisResult(title, result) {
        // Try fullpage container first, then popup container
        const resultsContainer = document.getElementById('fullAnalysisResults') || 
                                 document.getElementById('analysisResults');
        
        if (!resultsContainer) {
            console.warn('Results container not found');
            this.showNotification(`${title} completed - check console for details`, 'success');
            return;
        }

        const resultCard = this.createResultCard(title, result);
        resultsContainer.appendChild(resultCard);
        
        // Scroll to show new result
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Make sure the analysis tab is visible
        this.activateTab('analysis');
        
        // Store in history
        this.storeAnalysisInHistory(title, result);
    }

    async storeAnalysisInHistory(title, result) {
        try {
            const { analysisHistory = [] } = await chrome.storage.local.get('analysisHistory');
            
            const historyItem = {
                title,
                timestamp: Date.now(),
                summary: typeof result === 'string' ? result : 
                        result.analysis ? 'Medical analysis completed' :
                        result.success ? 'Operation completed successfully' :
                        'Analysis processed'
            };
            
            analysisHistory.push(historyItem);
            
            // Keep only last 50 items
            if (analysisHistory.length > 50) {
                analysisHistory.splice(0, analysisHistory.length - 50);
            }
            
            await chrome.storage.local.set({ analysisHistory });
            
            // Update recent activity if on fullpage
            if (window.isFullPage) {
                this.loadRecentActivity();
            }
            
        } catch (error) {
            console.error('Failed to store analysis in history:', error);
        }
    }

    createResultCard(title, result) {
        const card = document.createElement('div');
        card.className = 'result-card fade-in';
        
        const timestamp = new Date().toLocaleString();
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-title">${title}</div>
                <div class="result-timestamp">${timestamp}</div>
            </div>
            <div class="result-content">
                ${this.formatResultContent(result)}
            </div>
        `;
        
        return card;
    }

    formatResultContent(result) {
        if (result.error) {
            return `<div style="color: var(--danger-color); padding: 8px; background: #fef2f2; border-radius: 4px;">
                <strong>Error:</strong> ${result.error}
            </div>`;
        }

        if (typeof result === 'string') {
            return `<div style="color: var(--text-primary); line-height: 1.5;">${result}</div>`;
        }

        if (result.analysis) {
            return `<div style="color: var(--accent-color); padding: 8px; background: #f0fdf4; border-radius: 4px;">
                <strong>✅ Analysis completed successfully</strong>
                <div style="margin-top: 4px; font-size: 13px; color: var(--text-secondary);">
                    Medical content analysis has been processed. Check the detailed results below.
                </div>
            </div>`;
        }
        
        if (result.report) {
            return `<div style="color: var(--accent-color); padding: 8px; background: #f0fdf4; border-radius: 4px;">
                <strong>📊 Report generated successfully</strong>
                <div style="margin-top: 4px; font-size: 13px; color: var(--text-secondary);">
                    Medical report has been generated and is ready for review.
                </div>
            </div>`;
        }

        if (result.success) {
            return `<div style="color: var(--accent-color); padding: 8px; background: #f0fdf4; border-radius: 4px;">
                <strong>✅ Operation completed successfully</strong>
                <div style="margin-top: 4px; font-size: 13px; color: var(--text-secondary);">
                    The medical analysis operation has been completed.
                </div>
            </div>`;
        }

        return `<div style="color: var(--text-secondary); padding: 8px; background: var(--bg-secondary); border-radius: 4px;">
            <strong>ℹ️ Processing completed</strong>
            <div style="margin-top: 4px; font-size: 13px;">
                The operation has finished processing.
            </div>
        </div>`;
    }

    // Utility Functions
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async loadUserSettings() {
        try {
            if (typeof chrome === 'undefined' || !chrome.storage) {
                console.log('Chrome storage not available - skipping settings load');
                return;
            }
            
            const { userSettings, userProfile } = await chrome.storage.local.get(['userSettings', 'userProfile']);
            
            if (userSettings) {
                Object.entries(userSettings).forEach(([key, value]) => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                    }
                });
            }
            
            if (userProfile) {
                // Load profile data
                Object.entries(userProfile).forEach(([key, value]) => {
                    const element = document.getElementById(`user${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (element) {
                        if (key === 'healthConditions' && Array.isArray(value)) {
                            // Handle multi-select
                            Array.from(element.options).forEach(option => {
                                option.selected = value.includes(option.value);
                            });
                        } else {
                            element.value = value;
                        }
                    }
                });
            }
            
        } catch (error) {
            console.error('Failed to load user settings:', error);
        }
    }

    async loadStoredData() {
        try {
            const response = await chrome.storage.local.get(null);
            console.log('Loaded stored data:', Object.keys(response).length, 'items');
        } catch (error) {
            console.error('Failed to load stored data:', error);
        }
    }

    // UI Helper Functions
    showProgress(message, percentage = null) {
        const progressContainer = document.getElementById('progressContainer');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        
        if (progressText) {
            progressText.textContent = message;
        } else {
            console.log('Progress:', message);
        }
        
        if (progressFill && percentage !== null) {
            progressFill.style.width = `${percentage}%`;
        }
        
        // Also show a notification for user feedback
        this.showNotification(message, 'info');
    }

    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles for notification (adapted for popup)
        notification.style.cssText = `
            position: fixed;
            top: 8px;
            left: 8px;
            right: 8px;
            padding: 12px 16px;
            border-radius: 6px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideDown 0.3s ease-out;
            background: ${type === 'error' ? 'var(--danger-color)' : 
                        type === 'success' ? 'var(--accent-color)' : 
                        'var(--primary-color)'};
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });
        }
    }

    trackEvent(eventName, eventData = {}) {
        // Track usage events for analytics (if enabled)
        try {
            const settings = document.getElementById('anonymousData')?.checked;
            if (settings) {
                console.log('Event:', eventName, eventData);
                // Send to analytics if configured
            }
        } catch (error) {
            console.warn('Failed to track event:', error);
        }
    }

    // Fullpage-specific methods
    async syncData() {
        try {
            this.showNotification('Syncing data with extension...', 'info');
            
            // Get all data from storage
            const data = await chrome.storage.local.get(null);
            
            // Update recent activity
            this.loadRecentActivity();
            
            this.showNotification('Data synchronized successfully', 'success');
        } catch (error) {
            console.error('Sync failed:', error);
            this.showNotification('Failed to sync data', 'error');
        }
    }

    async loadRecentActivity() {
        try {
            const { analysisHistory } = await chrome.storage.local.get('analysisHistory');
            const activityContainer = document.getElementById('recentActivity');
            
            if (!activityContainer) return;
            
            if (analysisHistory && analysisHistory.length > 0) {
                const recent = analysisHistory.slice(-3).reverse();
                activityContainer.innerHTML = recent.map(item => `
                    <div style="padding: 8px 0; border-bottom: 1px solid var(--border-light);">
                        <div style="font-weight: 500; font-size: 13px;">${item.title}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleDateString()}</div>
                    </div>
                `).join('');
            } else {
                activityContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">No recent activity</p>';
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }

    async loadAnalysisHistory() {
        try {
            const { analysisHistory } = await chrome.storage.local.get('analysisHistory');
            const historyContainer = document.getElementById('analysisHistory');
            
            if (!historyContainer) return;
            
            if (analysisHistory && analysisHistory.length > 0) {
                historyContainer.innerHTML = analysisHistory.reverse().map(item => `
                    <div class="dashboard-card" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${item.title}</h4>
                            <span style="font-size: 12px; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                            ${item.summary || 'Analysis completed successfully'}
                        </div>
                    </div>
                `).join('');
            } else {
                historyContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No analysis history available</p>';
            }
        } catch (error) {
            console.error('Failed to load analysis history:', error);
        }
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear analysis history? This action cannot be undone.')) {
            try {
                await chrome.storage.local.remove('analysisHistory');
                this.showNotification('Analysis history cleared', 'success');
                this.loadAnalysisHistory();
            } catch (error) {
                console.error('Failed to clear history:', error);
                this.showNotification('Failed to clear history', 'error');
            }
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                await chrome.storage.local.remove('userSettings');
                this.showNotification('Settings reset to defaults', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('Failed to reset settings:', error);
                this.showNotification('Failed to reset settings', 'error');
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new HealthGuardApp();
    
    // Make app available globally for both popup and fullpage
    window.healthGuardAppInstance = app;
    
    if (window.isFullPage) {
        console.log('✅ HealthGuard fullpage app initialized');
    } else {
        console.log('✅ HealthGuard popup app initialized');
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);
