console.log("Medical YouTube Optimizer: Content script loaded for Tamil/Ayurvedic support");

// Initialize modules for enhanced functionality
let subtitleExtractor;
let tamilTranslator;
let ayurvedicDatabase;
let sourceVerifier;

// Initialize all modules when the script loads
(async () => {
  try {
    // Load modules using dynamic imports with proper error handling
    try {
      const subtitleModule = await import(chrome.runtime.getURL('src/utils/subtitleExtractor.js'));
      subtitleExtractor = new subtitleModule.default();
      console.log('Subtitle extractor loaded successfully');
    } catch (e) {
      console.log('Subtitle extractor not available:', e.message);
    }
    
    try {
      const translatorModule = await import(chrome.runtime.getURL('src/utils/tamilTranslator.js'));
      tamilTranslator = new translatorModule.default();
      console.log('Tamil translator loaded successfully');
    } catch (e) {
      console.log('Tamil translator not available:', e.message);
    }
    
    try {
      const ayurvedaModule = await import(chrome.runtime.getURL('src/utils/ayurvedicDatabase.js'));
      ayurvedicDatabase = new ayurvedaModule.default();
      console.log('Ayurvedic database loaded successfully');
    } catch (e) {
      console.log('Ayurvedic database not available:', e.message);
    }
    
    try {
      const verifierModule = await import(chrome.runtime.getURL('src/utils/youtubeSourceVerifier.js'));
      sourceVerifier = new verifierModule.default();
      console.log('Source verifier loaded successfully');
    } catch (e) {
      console.log('Source verifier not available:', e.message);
    }
    
    console.log('All modules initialized for Tamil/Ayurvedic medical analysis');
    
    // Initialize medical content analyzer
    initializeMedicalAnalyzer();
    
  } catch (error) {
    console.error('Failed to load medical analysis modules:', error);
    // Create fallback extractors
    subtitleExtractor = {
      extractSubtitles: async () => {
        throw new Error('Subtitle extractor not available');
      },
      getVideoMetadata: () => ({
        title: 'Unknown',
        channel: 'Unknown',
        videoId: null
      })
    };
    tamilTranslator = {
      translateToEnglish: async (text) => text,
      extractMedicalEntities: () => ({ symptoms: [], diseases: [], treatments: [] })
    };
    ayurvedicDatabase = {
      analyzeAyurvedicContent: () => ({ hasAyurvedicContent: false }),
      searchAyurvedicInfo: () => ({ herbs: [], treatments: [] })
    };
    sourceVerifier = {
      findTrustedSources: async () => [],
      verifyChannel: () => ({ trusted: false })
    };
  }
})();

// Helper function to extract video ID from URL (supports both standard videos and Shorts)
function getYouTubeVideoId() {
    const url = window.location.href;
    
    // Check for standard YouTube video URL (/watch?v=)
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) {
        return standardMatch[1];
    }
    
    // Check for YouTube Shorts URL (/shorts/)
    const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
        return shortsMatch[1];
    }
    
    return null;
}

// Function to extract video metadata
function getVideoMetadata() {
    const videoId = getYouTubeVideoId();
    const title = document.querySelector('meta[property="og:title"]')?.content || 
                 document.querySelector('title')?.textContent || 'Unknown Video';
    const channelName = document.querySelector('ytd-channel-name yt-formatted-string')?.textContent || 'Unknown Channel';
    
    return { videoId, title, channelName };
}

// Extract transcript from page (will be called via executeScript)
function extractTranscriptFromPage() {
    return new Promise((resolve, reject) => {
        // Check if transcript button is already visible
        const transcriptButton = Array.from(document.querySelectorAll('button'))
            .find(button => button.textContent?.includes('Show transcript'));
            
        if (!transcriptButton) {
            // Try to access "More" dropdown first if transcript button not found
            const moreActionsButton = document.querySelector('button[aria-label="More actions"]');
            if (moreActionsButton) {
                moreActionsButton.click();
                // Wait for menu to appear
                setTimeout(() => {
                    const showTranscriptMenuItem = Array.from(document.querySelectorAll('tp-yt-paper-item'))
                        .find(item => item.textContent?.includes('Show transcript'));
                    
                    if (showTranscriptMenuItem) {
                        showTranscriptMenuItem.click();
                        // Wait for transcript to appear
                        setTimeout(extractTranscriptText, 1000);
                    } else {
                        reject("Transcript option not found in menu");
                    }
                }, 500);
            } else {
                reject("Transcript button not found and cannot access 'More' menu");
            }
        } else {
            transcriptButton.click();
            // Wait for transcript to load
            setTimeout(extractTranscriptText, 1000);
        }
        
        function extractTranscriptText() {
            const transcriptPanel = document.querySelector('ytd-transcript-renderer') || 
                                    document.querySelector('.ytd-transcript-renderer');
                                    
            if (!transcriptPanel) {
                reject("Transcript panel not found after clicking button");
                return;
            }
            
            // Extract text from transcript segments
            const segments = transcriptPanel.querySelectorAll('ytd-transcript-segment-renderer') || 
                            transcriptPanel.querySelectorAll('.ytd-transcript-segment-renderer');
                            
            if (!segments || segments.length === 0) {
                reject("No transcript segments found");
                return;
            }
            
            const transcriptText = Array.from(segments).map(segment => {
                const timeElement = segment.querySelector('.segment-timestamp') || 
                                   segment.querySelector('[class*="timestamp"]');
                const textElement = segment.querySelector('.segment-text') || 
                                   segment.querySelector('[class*="text"]');
                                   
                if (timeElement && textElement) {
                    return `[${timeElement.textContent.trim()}] ${textElement.textContent.trim()}`;
                }
                return '';
            }).filter(text => text.length > 0).join('\n');
            
            resolve(transcriptText);
            
            // Close transcript panel after extraction
            const closeButton = document.querySelector('button[aria-label="Close transcript"]') || 
                               document.querySelector('.ytd-transcript-renderer [aria-label="Close"]');
            if (closeButton) {
                closeButton.click();
            }
        }
    });
}

// Extract available caption tracks from YouTube player
function getAvailableCaptionTracks() {
    return new Promise((resolve, reject) => {
        try {
            // Try to access the YouTube player's caption tracks
            const player = document.querySelector('#movie_player');
            if (!player) {
                reject("YouTube player not found");
                return;
            }

            // Look for caption/subtitle button
            const captionButton = document.querySelector('.ytp-subtitles-button') || 
                                 document.querySelector('[aria-label*="Subtitles"]') ||
                                 document.querySelector('[title*="Subtitles"]');
                                 
            if (!captionButton) {
                reject("Caption button not found in player");
                return;
            }

            // Click the caption button to open the menu
            captionButton.click();
            
            setTimeout(() => {
                // Look for the settings/gear button in the caption menu
                const settingsButton = document.querySelector('.ytp-settings-button') ||
                                      document.querySelector('[aria-label*="Settings"]');
                
                if (settingsButton) {
                    settingsButton.click();
                    
                    setTimeout(() => {
                        // Look for "Subtitles/CC" option in settings menu
                        const subtitleOption = Array.from(document.querySelectorAll('.ytp-menuitem'))
                            .find(item => item.textContent?.includes('Subtitles') || item.textContent?.includes('CC'));
                        
                        if (subtitleOption) {
                            subtitleOption.click();
                            
                            setTimeout(() => {
                                // Extract available languages
                                const languageItems = document.querySelectorAll('.ytp-menuitem');
                                const availableLanguages = [];
                                
                                languageItems.forEach(item => {
                                    const text = item.textContent?.trim();
                                    if (text && text !== 'Off' && text !== 'Subtitles/CC') {
                                        // Parse language info
                                        const langMatch = text.match(/(.+?)(?:\s*\((.+?)\))?$/);
                                        if (langMatch) {
                                            const langName = langMatch[1].trim();
                                            const langType = langMatch[2] || 'Unknown';
                                            
                                            // Try to extract language code from attributes or data
                                            const langCode = extractLanguageCode(item, langName);
                                            
                                            availableLanguages.push({
                                                name: langName,
                                                code: langCode,
                                                type: langType,
                                                element: item
                                            });
                                        }
                                    }
                                });
                                
                                // Close the menu
                                document.body.click();
                                
                                resolve(availableLanguages);
                            }, 500);
                        } else {
                            document.body.click();
                            reject("Subtitles option not found in settings");
                        }
                    }, 500);
                } else {
                    document.body.click();
                    reject("Settings button not found");
                }
            }, 500);
            
        } catch (error) {
            reject(`Error accessing caption tracks: ${error.message}`);
        }
    });
}

// Extract language code from various sources
function extractLanguageCode(element, languageName) {
    // Try to get language code from data attributes
    const dataLang = element.getAttribute('data-language-code') || 
                     element.getAttribute('data-lang') ||
                     element.getAttribute('lang');
    
    if (dataLang) return dataLang;
    
    // Map common language names to codes
    const languageMap = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Chinese': 'zh',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Portuguese': 'pt',
        'Russian': 'ru',
        'Italian': 'it',
        'Dutch': 'nl',
        'Swedish': 'sv',
        'Danish': 'da',
        'Norwegian': 'no',
        'Finnish': 'fi',
        'Turkish': 'tr',
        'Polish': 'pl',
        'Ukrainian': 'uk',
        'Tamil': 'ta',
        'Telugu': 'te',
        'Bengali': 'bn',
        'Malayalam': 'ml',
        'Kannada': 'kn',
        'Gujarati': 'gu',
        'Punjabi': 'pa',
        'Marathi': 'mr',
        'Urdu': 'ur',
        'Thai': 'th',
        'Vietnamese': 'vi',
        'Indonesian': 'id',
        'Malay': 'ms',
        'Hebrew': 'he',
        'Persian': 'fa'
    };
    
    // Try exact match first
    if (languageMap[languageName]) {
        return languageMap[languageName];
    }
    
    // Try partial match
    for (const [name, code] of Object.entries(languageMap)) {
        if (languageName.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(languageName.toLowerCase())) {
            return code;
        }
    }
    
    // If no match found, return a simplified version of the name
    return languageName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3);
}

// Extract captions for a specific language from the player
function extractCaptionsForLanguage(languageInfo) {
    return new Promise((resolve, reject) => {
        try {
            // Click the caption button to open the menu
            const captionButton = document.querySelector('.ytp-subtitles-button') || 
                                 document.querySelector('[aria-label*="Subtitles"]');
                                 
            if (!captionButton) {
                reject("Caption button not found");
                return;
            }

            captionButton.click();
            
            setTimeout(() => {
                const settingsButton = document.querySelector('.ytp-settings-button');
                
                if (settingsButton) {
                    settingsButton.click();
                    
                    setTimeout(() => {
                        const subtitleOption = Array.from(document.querySelectorAll('.ytp-menuitem'))
                            .find(item => item.textContent?.includes('Subtitles') || item.textContent?.includes('CC'));
                        
                        if (subtitleOption) {
                            subtitleOption.click();
                            
                            setTimeout(() => {
                                // Find and click the specific language
                                const targetLangItem = Array.from(document.querySelectorAll('.ytp-menuitem'))
                                    .find(item => item.textContent?.includes(languageInfo.name));
                                
                                if (targetLangItem) {
                                    targetLangItem.click();
                                    
                                    // Wait for captions to load and start extracting
                                    setTimeout(() => {
                                        startCaptionExtraction(languageInfo, resolve, reject);
                                    }, 1000);
                                } else {
                                    document.body.click();
                                    reject(`Language ${languageInfo.name} not found in menu`);
                                }
                            }, 500);
                        } else {
                            document.body.click();
                            reject("Subtitles option not found");
                        }
                    }, 500);
                } else {
                    document.body.click();
                    reject("Settings button not found");
                }
            }, 500);
            
        } catch (error) {
            reject(`Error extracting captions for ${languageInfo.name}: ${error.message}`);
        }
    });
}

// Start extracting caption text as it appears
function startCaptionExtraction(languageInfo, resolve, reject) {
    const captionTexts = [];
    const extractedTexts = new Set(); // Avoid duplicates
    let extractionStartTime = Date.now();
    const maxExtractionTime = 30000; // 30 seconds max
    let lastCaptionTime = Date.now();
    
    const captionExtractor = setInterval(() => {
        const currentTime = Date.now();
        
        // Stop if we've been extracting too long without new content
        if (currentTime - lastCaptionTime > 5000 || currentTime - extractionStartTime > maxExtractionTime) {
            clearInterval(captionExtractor);
            
            if (captionTexts.length > 0) {
                const transcript = captionTexts.join('\n');
                resolve({
                    language: languageInfo,
                    transcript: transcript,
                    extractedSegments: captionTexts.length
                });
            } else {
                reject(`No captions found for ${languageInfo.name} after ${(currentTime - extractionStartTime) / 1000}s`);
            }
            return;
        }
        
        // Look for caption elements
        const captionElements = document.querySelectorAll('.caption-window .captions-text') ||
                               document.querySelectorAll('.ytp-caption-segment') ||
                               document.querySelectorAll('.captions-text') ||
                               document.querySelectorAll('[class*="caption"]');
        
        captionElements.forEach(element => {
            const text = element.textContent?.trim();
            if (text && !extractedTexts.has(text)) {
                extractedTexts.add(text);
                
                // Try to get timestamp from video player
                const player = document.querySelector('#movie_player');
                let timestamp = 'Unknown';
                
                if (player && typeof player.getCurrentTime === 'function') {
                    const seconds = Math.floor(player.getCurrentTime());
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    timestamp = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                }
                
                captionTexts.push(`[${timestamp}] ${text}`);
                lastCaptionTime = currentTime;
            }
        });
        
    }, 100); // Check every 100ms for new captions
    
    // Auto-resolve if no captions appear after 10 seconds
    setTimeout(() => {
        if (captionTexts.length === 0) {
            clearInterval(captionExtractor);
            reject(`No captions detected for ${languageInfo.name} after 10 seconds`);
        }
    }, 10000);
}

// Extract multiple language captions from browser player
function extractMultiLanguageCaptionsFromPlayer(preferredLanguages = []) {
    return new Promise(async (resolve, reject) => {
        try {
            // First, get all available caption tracks
            const availableLanguages = await getAvailableCaptionTracks();
            
            if (availableLanguages.length === 0) {
                reject("No caption tracks found in player");
                return;
            }
            
            const results = {
                availableLanguages: availableLanguages,
                extractedCaptions: {},
                errors: []
            };
            
            // Determine which languages to extract
            let languagesToExtract = availableLanguages;
            
            if (preferredLanguages.length > 0) {
                languagesToExtract = availableLanguages.filter(lang => 
                    preferredLanguages.some(prefLang => 
                        lang.code === prefLang || 
                        lang.name.toLowerCase().includes(prefLang.toLowerCase())
                    )
                );
                
                // If no preferred languages found, fall back to first available
                if (languagesToExtract.length === 0) {
                    languagesToExtract = [availableLanguages[0]];
                }
            }
            
            // Extract captions for each language
            for (const langInfo of languagesToExtract) {
                try {
                    const captionData = await extractCaptionsForLanguage(langInfo);
                    results.extractedCaptions[langInfo.code] = captionData;
                } catch (error) {
                    results.errors.push({
                        language: langInfo.name,
                        code: langInfo.code,
                        error: error.toString()
                    });
                }
                
                // Small delay between language extractions
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            resolve(results);
            
        } catch (error) {
            reject(`Error extracting multi-language captions: ${error.message}`);
        }
    });
}

// Medical Content Analyzer for Tamil/Ayurvedic content with AI integration
function initializeMedicalAnalyzer() {
    // Create medical overlay container
    createMedicalOverlay();
    
    // Setup AI integration listener
    setupAIMessageListener();
    
    // Monitor for video changes
    observeVideoChanges();
    
    // Setup enhanced UI features
    setupEnhancedUI();
    
    // Auto-analyze if enabled
    chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings?.autoAnalyzeEnabled) {
            setTimeout(analyzeMedicalContent, 3000);
        }
    });
}

// Setup AI integration message listener
function setupAIMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        handleAIMessage(message, sender, sendResponse);
        return true; // Will respond asynchronously
    });
}

// Handle AI-related messages
async function handleAIMessage(message, sender, sendResponse) {
    try {
        switch (message.type) {
            case 'EXTRACT_VIDEO_DATA':
                const videoData = await extractCompleteVideoData();
                sendResponse(videoData);
                break;

            case 'PERFORM_AI_ANALYSIS':
                const analysisResult = await performAIAnalysis(message.options);
                sendResponse(analysisResult);
                break;

            case 'HIGHLIGHT_MEDICAL_TERMS':
                highlightMedicalTerms(message.terms);
                sendResponse({ success: true });
                break;

            case 'SHOW_RISK_WARNING':
                showRiskWarning(message.riskData);
                sendResponse({ success: true });
                break;

            case 'UPDATE_ANALYSIS_STATUS':
                updateAnalysisStatus(message.status);
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ error: 'Unknown message type' });
        }
    } catch (error) {
        console.error('Error handling AI message:', error);
        sendResponse({ error: error.message });
    }
}

// Extract complete video data for AI analysis
async function extractCompleteVideoData() {
    try {
        const videoData = {
            videoId: getYouTubeVideoId(),
            metadata: getVideoMetadata(),
            transcript: null,
            captions: null,
            description: null,
            comments: null
        };

        // Extract description
        const descriptionElement = document.querySelector('#description-text, #meta-contents #description');
        if (descriptionElement) {
            videoData.description = descriptionElement.textContent.trim();
        }

        // Try to extract transcript
        try {
            videoData.transcript = await extractTranscriptFromPage();
        } catch (error) {
            console.log('Transcript extraction failed:', error.message);
        }

        // Try to extract captions
        try {
            videoData.captions = await extractMultiLanguageCaptionsFromPlayer(['en', 'ta', 'hi']);
        } catch (error) {
            console.log('Caption extraction failed:', error.message);
        }

        // Extract top comments
        const commentElements = document.querySelectorAll('#content-text');
        if (commentElements.length > 0) {
            videoData.comments = Array.from(commentElements)
                .slice(0, 10) // Top 10 comments
                .map(el => el.textContent.trim())
                .filter(comment => comment.length > 0);
        }

        return videoData;
    } catch (error) {
        console.error('Error extracting complete video data:', error);
        return { error: error.message };
    }
}

// Perform AI analysis with enhanced options
async function performAIAnalysis(options = {}) {
    try {
        updateAnalysisStatus('Extracting video data...');
        
        const videoData = await extractCompleteVideoData();
        if (videoData.error) {
            throw new Error(videoData.error);
        }

        updateAnalysisStatus('Analyzing content with AI...');

        // Send to background for AI processing
        const analysisResult = await chrome.runtime.sendMessage({
            action: 'aiAnalysis',
            videoData: videoData,
            options: {
                enableNER: true,
                enableSentiment: true,
                enableClassification: true,
                medicalFocus: true,
                ayurvedicAnalysis: true,
                tamilTranslation: true,
                ...options
            }
        });

        if (analysisResult.success) {
            // Display results in overlay
            displayAIAnalysisResults(analysisResult);
            
            // Update badge
            chrome.runtime.sendMessage({
                type: 'UPDATE_BADGE',
                riskLevel: analysisResult.riskLevel || 'CAUTION'
            });

            updateAnalysisStatus('Analysis complete');
        } else {
            throw new Error(analysisResult.error || 'Analysis failed');
        }

        return analysisResult;
    } catch (error) {
        console.error('AI analysis failed:', error);
        updateAnalysisStatus(`Analysis failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Setup enhanced UI features
function setupEnhancedUI() {
    // Add AI analysis button to YouTube interface
    addAIAnalysisButton();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Add context menu integration
    setupContextMenuIntegration();
}

// Add AI analysis button to YouTube controls
function addAIAnalysisButton() {
    // Check if button already exists
    if (document.getElementById('ai-analysis-btn')) return;

    // Wait for YouTube controls to load
    const checkForControls = setInterval(() => {
        const controlsContainer = document.querySelector('#top-level-buttons-computed, #menu-container #top-level-buttons');
        
        if (controlsContainer) {
            clearInterval(checkForControls);
            
            const analysisBtn = document.createElement('button');
            analysisBtn.id = 'ai-analysis-btn';
            analysisBtn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">🤖</span>
                    <span>AI Analysis</span>
                </div>
            `;
            analysisBtn.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 18px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                margin-left: 8px;
                transition: all 0.3s ease;
            `;
            
            analysisBtn.addEventListener('click', () => {
                performAIAnalysis();
                showMedicalOverlay();
            });

            analysisBtn.addEventListener('mouseenter', () => {
                analysisBtn.style.transform = 'translateY(-2px)';
                analysisBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            });

            analysisBtn.addEventListener('mouseleave', () => {
                analysisBtn.style.transform = 'translateY(0)';
                analysisBtn.style.boxShadow = 'none';
            });

            controlsContainer.appendChild(analysisBtn);
        }
    }, 1000);

    // Clear interval after 10 seconds if controls not found
    setTimeout(() => clearInterval(checkForControls), 10000);
}

// Create medical information overlay
function createMedicalOverlay() {
    // Remove existing overlay
    const existing = document.getElementById('medical-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'medical-overlay';
    overlay.innerHTML = `
        <div class="medical-header">
            <span class="medical-icon">🏥</span>
            <span class="medical-title">Medical Content Analysis</span>
            <button class="medical-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
        </div>
        <div class="medical-content">
            <div class="analysis-status">Ready for analysis...</div>
            <div class="risk-indicator" style="display:none;">
                <span class="risk-level"></span>
                <span class="risk-text"></span>
            </div>
            <div class="ayurvedic-info" style="display:none;"></div>
            <div class="trusted-sources" style="display:none;"></div>
            <div class="translation-info" style="display:none;"></div>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 350px;
        max-height: 500px;
        background: linear-gradient(135deg, #ffffff, #f8f9ff);
        border: 2px solid #e1e8ff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #333;
        overflow: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        display: none;
    `;
    
    // Add CSS for overlay components
    const style = document.createElement('style');
    style.textContent = `
        #medical-overlay .medical-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
        }
        
        #medical-overlay .medical-icon {
            font-size: 18px;
            margin-right: 8px;
        }
        
        #medical-overlay .medical-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        
        #medical-overlay .medical-close:hover {
            background: rgba(255,255,255,0.2);
        }
        
        #medical-overlay .medical-content {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        #medical-overlay .analysis-status {
            padding: 8px 12px;
            background: #f0f4ff;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 4px solid #667eea;
        }
        
        #medical-overlay .risk-indicator {
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        #medical-overlay .risk-indicator.safe {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            color: #2e7d32;
        }
        
        #medical-overlay .risk-indicator.caution {
            background: #fff3e0;
            border: 1px solid #ff9800;
            color: #f57c00;
        }
        
        #medical-overlay .risk-indicator.unsafe {
            background: #ffebee;
            border: 1px solid #f44336;
            color: #c62828;
        }
        
        #medical-overlay .risk-level {
            font-size: 18px;
            margin-right: 8px;
        }
        
        #medical-overlay .ayurvedic-info {
            background: #f3e5f5;
            border: 1px solid #9c27b0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }
        
        #medical-overlay .ayurvedic-info h4 {
            margin: 0 0 8px 0;
            color: #7b1fa2;
            font-size: 14px;
        }
        
        #medical-overlay .herb-item, .treatment-item {
            background: white;
            padding: 8px;
            margin: 4px 0;
            border-radius: 4px;
            border-left: 3px solid #9c27b0;
        }
        
        #medical-overlay .trusted-sources {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }
        
        #medical-overlay .trusted-sources h4 {
            margin: 0 0 8px 0;
            color: #2e7d32;
            font-size: 14px;
        }
        
        #medical-overlay .source-item {
            background: white;
            padding: 8px;
            margin: 4px 0;
            border-radius: 4px;
            border-left: 3px solid #4caf50;
        }
        
        #medical-overlay .doctor-name {
            font-weight: 600;
            color: #1976d2;
        }
        
        #medical-overlay .doctor-credentials {
            font-size: 12px;
            color: #666;
        }
        
        #medical-overlay .doctor-quote {
            font-style: italic;
            margin-top: 4px;
            padding: 6px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 12px;
        }
        
        #medical-overlay .translation-info {
            background: #fff8e1;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
        }
        
        #medical-overlay .translation-info h4 {
            margin: 0 0 8px 0;
            color: #f57c00;
            font-size: 14px;
        }
        
        #medical-overlay .original-text, .translated-text {
            padding: 6px;
            margin: 4px 0;
            border-radius: 4px;
            font-size: 12px;
        }
        
        #medical-overlay .original-text {
            background: #fff3e0;
            border-left: 3px solid #ff9800;
        }
        
        #medical-overlay .translated-text {
            background: #e8f5e8;
            border-left: 3px solid #4caf50;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(overlay);
}

// Observe video changes to trigger analysis
function observeVideoChanges() {
    let currentVideoId = getYouTubeVideoId();
    
    // Check for URL changes
    const observer = new MutationObserver(() => {
        const newVideoId = getYouTubeVideoId();
        if (newVideoId && newVideoId !== currentVideoId) {
            currentVideoId = newVideoId;
            setTimeout(analyzeMedicalContent, 2000);
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// Main medical content analysis function
async function analyzeMedicalContent() {
    const overlay = document.getElementById('medical-overlay');
    if (!overlay) return;
    
    overlay.style.display = 'block';
    
    const statusElement = overlay.querySelector('.analysis-status');
    statusElement.textContent = 'Analyzing medical content...';
    
    try {
        // Get video transcript
        const transcript = await extractVideoTranscript();
        if (!transcript) {
            statusElement.textContent = 'No transcript available for analysis';
            return;
        }
        
        // Translate Tamil content if detected
        const translationResult = await translateTamilContent(transcript);
        
        // Analyze for Ayurvedic content
        const ayurvedicAnalysis = ayurvedicDatabase.analyzeAyurvedicContent(translationResult.finalText);
        
        // Get trusted source recommendations
        const videoMetadata = getVideoMetadata();
        const trustedSources = await findTrustedSources(videoMetadata.title, ayurvedicAnalysis);
        
        // Assess overall risk
        const riskAssessment = assessMedicalRisk(ayurvedicAnalysis, translationResult);
        
        // Display results
        displayAnalysisResults({
            translation: translationResult,
            ayurvedicAnalysis,
            trustedSources,
            riskAssessment
        });
        
        // Update browser badge
        chrome.runtime.sendMessage({
            type: 'UPDATE_BADGE',
            riskLevel: riskAssessment.level
        });
        
        statusElement.textContent = 'Analysis complete';
        
    } catch (error) {
        console.error('Medical analysis error:', error);
        statusElement.textContent = 'Analysis failed: ' + error.message;
    }
}

// Extract video transcript with enhanced error handling
async function extractVideoTranscript() {
    try {
        // Try to get existing subtitles first
        const subtitles = await subtitleExtractor.extractSubtitles();
        if (subtitles && subtitles.length > 0) {
            return subtitles.map(s => s.text).join(' ');
        }
        
        // Fallback to other extraction methods
        return await extractFromVideoPlayer();
        
    } catch (error) {
        console.error('Transcript extraction failed:', error);
        return null;
    }
}

// Translate Tamil content to English
async function translateTamilContent(text) {
    const result = {
        originalText: text,
        translatedText: text,
        finalText: text,
        hasTamilContent: false,
        medicalEntities: { symptoms: [], diseases: [], treatments: [], ayurvedicTerms: [] }
    };
    
    try {
        // Check if text contains Tamil characters
        const tamilRegex = /[\u0B80-\u0BFF]/;
        result.hasTamilContent = tamilRegex.test(text);
        
        if (result.hasTamilContent) {
            result.translatedText = await tamilTranslator.translateToEnglish(text);
            result.finalText = result.translatedText;
            result.medicalEntities = tamilTranslator.extractMedicalEntities(text);
        }
        
    } catch (error) {
        console.error('Translation error:', error);
    }
    
    return result;
}

// Find trusted medical sources for the topic
async function findTrustedSources(videoTitle, ayurvedicAnalysis) {
    try {
        let searchTopic = videoTitle;
        
        // Enhance search topic with detected Ayurvedic terms
        if (ayurvedicAnalysis.hasAyurvedicContent) {
            const detectedTerms = [
                ...ayurvedicAnalysis.detectedHerbs.map(h => h.name),
                ...ayurvedicAnalysis.detectedTreatments.map(t => t.name)
            ].join(' ');
            searchTopic += ' ' + detectedTerms;
        }
        
        return await sourceVerifier.findTrustedSources(searchTopic, 'english');
        
    } catch (error) {
        console.error('Error finding trusted sources:', error);
        return [];
    }
}

// Assess medical risk based on analysis
function assessMedicalRisk(ayurvedicAnalysis, translationResult) {
    let riskLevel = 'safe';
    let riskFactors = [];
    
    // Check for contraindications in Ayurvedic herbs
    if (ayurvedicAnalysis.detectedHerbs) {
        const hasContraindications = ayurvedicAnalysis.detectedHerbs.some(herb => 
            herb.contraindications && herb.contraindications.length > 0
        );
        
        if (hasContraindications) {
            riskLevel = 'caution';
            riskFactors.push('Contains herbs with known contraindications');
        }
    }
    
    // Check for medical claims without proper disclaimers
    const medicalTermCount = Object.values(translationResult.medicalEntities).flat().length;
    if (medicalTermCount > 5) {
        if (riskLevel === 'safe') riskLevel = 'caution';
        riskFactors.push('Contains significant medical content');
    }
    
    return {
        level: riskLevel,
        factors: riskFactors,
        confidence: ayurvedicAnalysis.confidence || 0.5
    };
}

// Display analysis results in overlay
function displayAnalysisResults(results) {
    const overlay = document.getElementById('medical-overlay');
    
    // Display risk indicator
    const riskIndicator = overlay.querySelector('.risk-indicator');
    const riskLevel = overlay.querySelector('.risk-level');
    const riskText = overlay.querySelector('.risk-text');
    
    riskIndicator.className = `risk-indicator ${results.riskAssessment.level}`;
    riskIndicator.style.display = 'flex';
    
    const riskEmojis = { safe: '✅', caution: '⚠️', unsafe: '❌' };
    riskLevel.textContent = riskEmojis[results.riskAssessment.level];
    riskText.textContent = `Risk Level: ${results.riskAssessment.level.toUpperCase()}`;
    
    // Display translation info
    if (results.translation.hasTamilContent) {
        const translationInfo = overlay.querySelector('.translation-info');
        translationInfo.innerHTML = `
            <h4>🔤 Tamil Translation</h4>
            <div class="original-text"><strong>Original:</strong> ${results.translation.originalText.substring(0, 100)}...</div>
            <div class="translated-text"><strong>English:</strong> ${results.translation.translatedText.substring(0, 100)}...</div>
        `;
        translationInfo.style.display = 'block';
    }
    
    // Display Ayurvedic information
    if (results.ayurvedicAnalysis.hasAyurvedicContent) {
        const ayurvedicInfo = overlay.querySelector('.ayurvedic-info');
        let herbsHtml = '';
        let treatmentsHtml = '';
        
        if (results.ayurvedicAnalysis.detectedHerbs.length > 0) {
            herbsHtml = '<h5>🌿 Detected Herbs:</h5>';
            results.ayurvedicAnalysis.detectedHerbs.forEach(herb => {
                herbsHtml += `
                    <div class="herb-item">
                        <strong>${herb.name}</strong> (${herb.scientificName})
                        <div class="herb-benefits">${herb.benefits.slice(0, 2).join(', ')}</div>
                        ${herb.contraindications.length > 0 ? 
                            `<div class="herb-warnings">⚠️ ${herb.contraindications.join(', ')}</div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        if (results.ayurvedicAnalysis.detectedTreatments.length > 0) {
            treatmentsHtml = '<h5>🏥 Detected Treatments:</h5>';
            results.ayurvedicAnalysis.detectedTreatments.forEach(treatment => {
                treatmentsHtml += `
                    <div class="treatment-item">
                        <strong>${treatment.name}</strong>
                        <div class="treatment-desc">${treatment.description}</div>
                    </div>
                `;
            });
        }
        
        ayurvedicInfo.innerHTML = `
            <h4>🕉️ Ayurvedic Content Analysis</h4>
            ${herbsHtml}
            ${treatmentsHtml}
        `;
        ayurvedicInfo.style.display = 'block';
    }
    
    // Display trusted sources
    if (results.trustedSources.length > 0) {
        const trustedSources = overlay.querySelector('.trusted-sources');
        let sourcesHtml = '<h4>🔍 Trusted Medical Sources</h4>';
        results.trustedSources.forEach(source => {
            sourcesHtml += `
                <div class="source-item">
                    <a href="${source.url}" target="_blank">${source.title}</a>
                    <div class="source-desc">${source.description}</div>
                </div>
            `;
        });
        trustedSources.innerHTML = sourcesHtml;
        trustedSources.style.display = 'block';
    }
    
    // Show the overlay
    overlay.style.display = 'block';
}

// Enhanced helper functions for AI integration
function updateAnalysisStatus(status) {
    const overlay = document.getElementById('medical-overlay');
    if (overlay) {
        const statusElement = overlay.querySelector('.analysis-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}

function showMedicalOverlay() {
    const overlay = document.getElementById('medical-overlay');
    if (overlay) {
        overlay.style.display = 'block';
    }
}

function displayAIAnalysisResults(results) {
    const overlay = document.getElementById('medical-overlay');
    if (!overlay) return;

    // Update status
    updateAnalysisStatus('Analysis complete');

    // Show risk assessment
    if (results.riskAssessment) {
        const riskIndicator = overlay.querySelector('.risk-indicator');
        const riskLevel = overlay.querySelector('.risk-level');
        const riskText = overlay.querySelector('.risk-text');
        
        if (riskIndicator && riskLevel && riskText) {
            const riskEmojis = { 
                SAFE: '✅', 
                CAUTION: '⚠️', 
                WARNING: '🚨', 
                DANGEROUS: '❌' 
            };
            
            riskLevel.textContent = riskEmojis[results.riskLevel] || '⚠️';
            riskText.textContent = `Risk Level: ${results.riskLevel || 'UNKNOWN'}`;
            riskIndicator.style.display = 'block';
        }
    }

    // Show medical entities if found
    if (results.medicalEntities && results.medicalEntities.length > 0) {
        const content = overlay.querySelector('.medical-content');
        if (content) {
            const entitiesDiv = document.createElement('div');
            entitiesDiv.className = 'medical-entities';
            entitiesDiv.innerHTML = `
                <h4>🔬 Medical Terms Found</h4>
                <div class="entities-list">
                    ${results.medicalEntities.map(entity => `
                        <span class="entity-tag">${entity.text}</span>
                    `).join('')}
                </div>
            `;
            content.appendChild(entitiesDiv);
        }
    }

    // Show warnings if any
    if (results.warnings && results.warnings.length > 0) {
        const content = overlay.querySelector('.medical-content');
        if (content) {
            const warningsDiv = document.createElement('div');
            warningsDiv.className = 'warnings-section';
            warningsDiv.innerHTML = `
                <h4>⚠️ Warnings</h4>
                <ul>
                    ${results.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
            `;
            content.appendChild(warningsDiv);
        }
    }

    showMedicalOverlay();
}

function highlightMedicalTerms(terms) {
    if (!terms || terms.length === 0) return;

    const contentSelectors = [
        '#description-text',
        'h1.title',
        '.ytd-video-primary-info-renderer h1',
        '.caption-line'
    ];

    contentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element) return;
            
            let html = element.innerHTML;
            
            terms.forEach(term => {
                const regex = new RegExp(`\\b${term.text}\\b`, 'gi');
                html = html.replace(regex, 
                    `<span class="medical-term-highlight" title="${term.definition || 'Medical term'}">${term.text}</span>`
                );
            });
            
            element.innerHTML = html;
        });
    });

    // Add highlighting styles
    if (!document.getElementById('medical-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'medical-highlight-styles';
        style.textContent = `
            .medical-term-highlight {
                background: rgba(76, 175, 80, 0.2);
                border-bottom: 2px solid #4CAF50;
                cursor: help;
                padding: 1px 2px;
                border-radius: 3px;
            }
            
            .medical-term-highlight:hover {
                background: rgba(76, 175, 80, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

function showRiskWarning(riskData) {
    // Create or update risk warning banner
    let warningBanner = document.getElementById('medical-risk-banner');
    
    if (!warningBanner) {
        warningBanner = document.createElement('div');
        warningBanner.id = 'medical-risk-banner';
        warningBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #f44336, #d32f2f);
            color: white;
            padding: 12px 20px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            z-index: 10001;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(warningBanner);
    }

    // Update content based on risk level
    const riskMessages = {
        SAFE: { bg: '#4CAF50', text: '✅ This content appears to be safe medical information' },
        CAUTION: { bg: '#FF9800', text: '⚠️ Please verify this medical information with healthcare professionals' },
        WARNING: { bg: '#F44336', text: '🚨 This content may contain unverified medical claims' },
        DANGEROUS: { bg: '#B71C1C', text: '❌ WARNING: This content may promote harmful medical practices' }
    };

    const riskInfo = riskMessages[riskData.level] || riskMessages.WARNING;
    warningBanner.style.background = riskInfo.bg;
    warningBanner.textContent = riskInfo.text;

    // Show banner
    setTimeout(() => {
        warningBanner.style.transform = 'translateY(0)';
    }, 100);

    // Auto-hide for safe content
    if (riskData.level === 'SAFE') {
        setTimeout(() => {
            warningBanner.style.transform = 'translateY(-100%)';
        }, 5000);
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+M for manual analysis
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
            event.preventDefault();
            performAIAnalysis();
            showMedicalOverlay();
        }
        
        // Ctrl+Shift+H to toggle medical overlay
        if (event.ctrlKey && event.shiftKey && event.key === 'H') {
            event.preventDefault();
            const overlay = document.getElementById('medical-overlay');
            if (overlay) {
                overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
}

function setupContextMenuIntegration() {
    // Handle text selection for medical term analysis
    document.addEventListener('mouseup', (event) => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 3 && selectedText.length < 100) {
            // Send selected text to background for analysis
            chrome.runtime.sendMessage({
                action: 'analyzeSelectedText',
                text: selectedText,
                context: 'youtube_video'
            });
        }
    });
}

// Enhanced video change observer
function observeVideoChanges() {
    let currentVideoId = getYouTubeVideoId();
    
    // Watch for URL changes
    const observer = new MutationObserver(() => {
        const newVideoId = getYouTubeVideoId();
        if (newVideoId && newVideoId !== currentVideoId) {
            currentVideoId = newVideoId;
            
            // Reset analysis state
            const overlay = document.getElementById('medical-overlay');
            if (overlay) {
                overlay.style.display = 'none';
                updateAnalysisStatus('Ready for analysis...');
            }
            
            // Auto-analyze if enabled
            chrome.storage.sync.get(['settings'], (result) => {
                if (result.settings?.autoAnalyzeEnabled) {
                    setTimeout(() => {
                        performAIAnalysis();
                    }, 3000);
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also listen for popstate events
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            const newVideoId = getYouTubeVideoId();
            if (newVideoId && newVideoId !== currentVideoId) {
                currentVideoId = newVideoId;
                
                // Reset and potentially auto-analyze
                chrome.storage.sync.get(['settings'], (result) => {
                    if (result.settings?.autoAnalyzeEnabled) {
                        setTimeout(() => {
                            performAIAnalysis();
                        }, 3000);
                    }
                });
            }
        }, 1000);
    });
}

// Initialize enhanced functionality when script loads
console.log('Medical YouTube Optimizer: Enhanced AI content script loaded');
    if (results.trustedSources.length > 0) {
        const trustedSources = overlay.querySelector('.trusted-sources');
        let sourcesHtml = '<h4>👨‍⚕️ Trusted Medical Sources</h4>';
        
        results.trustedSources.slice(0, 3).forEach(source => {
            if (source.doctor) {
                sourcesHtml += `
                    <div class="source-item">
                        <div class="doctor-name">${source.doctor.name}</div>
                        <div class="doctor-credentials">${source.doctor.credentials} - ${source.doctor.specialization.join(', ')}</div>
                        <div class="doctor-quote">${source.quote}</div>
                        <a href="https://youtube.com/${source.doctor.youtubeChannel}" target="_blank" style="font-size: 12px; color: #1976d2;">View Channel</a>
                    </div>
                `;
            }
        });
        
        trustedSources.innerHTML = sourcesHtml;
        trustedSources.style.display = 'block';
    }

// Note: extractFromVideoPlayer function is implemented later in the file

// Message handlers for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.type);
    
    switch (message.type) {
        case 'EXTRACT_TRANSCRIPT':
            handleTranscriptExtraction(sendResponse);
            break;
            
        case 'TRANSLATE_TAMIL':
            handleTamilTranslation(message.transcript, sendResponse);
            break;
            
        case 'ANALYZE_AYURVEDA':
            handleAyurvedicAnalysis(message.text, sendResponse);
            break;
            
        case 'FIND_TRUSTED_SOURCES':
            handleTrustedSourcesSearch(message.topic, message.language, sendResponse);
            break;
            
        case 'ANALYZE_RISK':
            handleRiskAnalysis(message, sendResponse);
            break;
            
        case 'VERIFY_CHANNEL':
            handleChannelVerification(sendResponse);
            break;
            
        case 'GET_VIDEO_TITLE':
            handleGetVideoTitle(sendResponse);
            break;
            
        case 'MANUAL_ANALYSIS_REQUESTED':
            analyzeMedicalContent();
            break;
            
        default:
            sendResponse({ success: false, error: 'Unknown message type' });
    }
    
    return true; // Keep the message channel open for async responses
});

// Handle transcript extraction
async function handleTranscriptExtraction(sendResponse) {
    try {
        const transcript = await extractVideoTranscript();
        if (transcript) {
            sendResponse({ success: true, transcript: transcript });
        } else {
            sendResponse({ success: false, error: 'No transcript available' });
        }
    } catch (error) {
        console.error('Transcript extraction error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle Tamil translation
async function handleTamilTranslation(transcript, sendResponse) {
    try {
        const translation = await translateTamilContent(transcript);
        sendResponse({ success: true, translation: translation });
    } catch (error) {
        console.error('Translation error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle Ayurvedic analysis
async function handleAyurvedicAnalysis(text, sendResponse) {
    try {
        const analysis = ayurvedicDatabase.analyzeAyurvedicContent(text);
        sendResponse({ success: true, analysis: analysis });
    } catch (error) {
        console.error('Ayurvedic analysis error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle trusted sources search
async function handleTrustedSourcesSearch(topic, language, sendResponse) {
    try {
        const sources = await sourceVerifier.findTrustedSources(topic, language);
        sendResponse({ success: true, sources: sources });
    } catch (error) {
        console.error('Trusted sources error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle risk analysis
async function handleRiskAnalysis(messageData, sendResponse) {
    try {
        const assessment = assessMedicalRisk(
            messageData.ayurvedicAnalysis || {},
            messageData.translation || {}
        );
        sendResponse({ success: true, assessment: assessment });
    } catch (error) {
        console.error('Risk analysis error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle channel verification
async function handleChannelVerification(sendResponse) {
    try {
        const channelName = getChannelName();
        const verification = sourceVerifier.verifyChannel(channelName);
        sendResponse({ success: true, verification: verification });
    } catch (error) {
        console.error('Channel verification error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle get video title
async function handleGetVideoTitle(sendResponse) {
    try {
        const title = getVideoTitle();
        sendResponse({ success: true, title: title });
    } catch (error) {
        console.error('Get video title error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Get channel name from page
function getChannelName() {
    try {
        // Try different selectors for channel name
        const channelLink = document.querySelector('a[href*="/channel/"], a[href*="/@"]');
        if (channelLink) {
            return channelLink.textContent.trim();
        }
        
        const channelElement = document.querySelector('#channel-name a, #text a, .ytd-channel-name a');
        if (channelElement) {
            return channelElement.textContent.trim();
        }
        
        return 'Unknown Channel';
    } catch (error) {
        console.error('Error getting channel name:', error);
        return 'Unknown Channel';
    }
}

// Get video title from page
function getVideoTitle() {
    try {
        const titleElement = document.querySelector('h1.title, .ytd-video-primary-info-renderer h1, #title h1');
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        
        // Fallback to meta title
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) {
            return metaTitle.content;
        }
        
        return document.title || 'Unknown Video';
    } catch (error) {
        console.error('Error getting video title:', error);
        return 'Unknown Video';
    }
}

// Enhanced fallback transcript extraction from video player
async function extractFromVideoPlayer() {
    try {
        // Look for closed captions
        const ccButton = document.querySelector('button[aria-label*="Captions"], .ytp-subtitles-button');
        if (ccButton && !ccButton.classList.contains('ytp-subtitles-button-active')) {
            ccButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Try to extract from subtitle track
        const subtitleContainer = document.querySelector('.caption-window, .ytp-caption-window-container');
        if (subtitleContainer) {
            return subtitleContainer.textContent.trim();
        }
        
        return null;
    } catch (error) {
        console.error('Player extraction error:', error);
        return null;
    }
}
