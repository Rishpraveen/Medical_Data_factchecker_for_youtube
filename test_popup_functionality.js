// Quick test to verify popup functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Testing popup functionality...');
    
    // Test 1: Check if all required elements exist
    const requiredElements = [
        'expandBtn',
        'analyzeCurrentVideo', 
        'uploadDocument',
        'recordAudio',
        'quickAnalyzeBtn',
        'fullAnalyzeBtn', 
        'translateBtn',
        'documentUpload',
        'documentFileInput',
        'startRecordingBtn',
        'stopRecordingBtn',
        'recordingIndicator',
        'recordingTime',
        'userName',
        'userEmail',
        'userGender',
        'userAge',
        'healthConditions',
        'medications',
        'sourceLanguage',
        'targetLanguage',
        'progressContainer',
        'progressText',
        'progressFill',
        'analysisResults'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('Missing elements:', missingElements);
    } else {
        console.log('All required elements found!');
    }
    
    // Test 2: Check tab navigation
    const navTabs = document.querySelectorAll('.nav-tab');
    console.log('Found navigation tabs:', navTabs.length);
    
    // Test 3: Check settings toggles
    const settingsToggles = document.querySelectorAll('.toggle-label input[type="checkbox"]');
    console.log('Found settings toggles:', settingsToggles.length);
});
