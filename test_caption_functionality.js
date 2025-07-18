// Test script for caption fetching functionality
// This can be run in a browser console on a YouTube page

async function testCaptionFetching() {
    try {
        console.log('🧪 Testing caption fetching functionality...');
        
        // Extract video ID from current URL
        const url = window.location.href;
        const videoIdMatch = url.match(/[?&]v=([^&#]*)/);
        
        if (!videoIdMatch) {
            console.error('❌ Not on a YouTube video page');
            return;
        }
        
        const videoId = videoIdMatch[1];
        console.log(`📹 Video ID: ${videoId}`);
        
        // Test if we can access the caption bundle
        if (typeof CaptionFetcher !== 'undefined') {
            console.log('✅ CaptionFetcher is available');
            
            // Test caption fetching
            const result = await CaptionFetcher.fetchCaptionsWithFallback(videoId, 'en');
            
            if (result.success) {
                console.log('✅ Caption fetching successful!');
                console.log(`📝 Found ${result.totalSegments} caption segments`);
                console.log(`🌍 Language: ${result.language}`);
                console.log(`📄 Type: ${result.type}`);
                console.log(`📊 Preview: ${result.totalText.substring(0, 200)}...`);
                
                return result;
            } else {
                console.error('❌ Caption fetching failed:', result.error);
                return result;
            }
        } else {
            console.error('❌ CaptionFetcher not available - extension may not be loaded');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    }
}

// Test communication with background script
async function testBackgroundCommunication() {
    try {
        console.log('🧪 Testing background script communication...');
        
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('❌ Chrome extension APIs not available');
            return;
        }
        
        const url = window.location.href;
        const videoIdMatch = url.match(/[?&]v=([^&#]*)/);
        
        if (!videoIdMatch) {
            console.error('❌ Not on a YouTube video page');
            return;
        }
        
        const videoId = videoIdMatch[1];
        
        // Test caption fetching via background script
        const response = await chrome.runtime.sendMessage({
            action: 'fetchCaptions',
            videoId: videoId,
            language: 'en',
            options: {
                fallbackLanguages: ['en', 'es', 'fr']
            }
        });
        
        if (response && response.success) {
            console.log('✅ Background caption fetching successful!');
            console.log(`📝 Found ${response.totalSegments} caption segments`);
            console.log(`🌍 Language: ${response.language}`);
            console.log(`📊 Preview: ${response.fullText.substring(0, 200)}...`);
            
            return response;
        } else {
            console.error('❌ Background caption fetching failed:', response?.error);
            return response;
        }
        
    } catch (error) {
        console.error('❌ Background communication test failed:', error);
        return null;
    }
}

// Export for console testing
window.testCaptionFetching = testCaptionFetching;
window.testBackgroundCommunication = testBackgroundCommunication;

console.log('🧪 Caption testing utilities loaded. Available functions:');
console.log('- testCaptionFetching(): Test direct caption fetching');
console.log('- testBackgroundCommunication(): Test via background script');
