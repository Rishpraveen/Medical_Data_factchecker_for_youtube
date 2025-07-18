// HealthGuard Debug Test - Run this in browser console

console.log('🧪 HealthGuard Debug Test Starting...');
console.log('==========================================');

// Test 1: Check if we're on the fullpage
console.log('📍 Current URL:', window.location.href);
console.log('📍 Page type:', window.isFullPage ? 'Fullpage' : 'Other');

// Test 2: Check what's available on window
console.log('\n🔍 Window objects related to HealthGuard:');
Object.keys(window).forEach(key => {
    if (key.toLowerCase().includes('health') || key.toLowerCase().includes('guard')) {
        console.log(`- ${key}:`, typeof window[key], window[key]);
    }
});

// Test 3: Check for HealthGuardApp class
console.log('\n🏗️ HealthGuardApp class check:');
console.log('- HealthGuardApp defined:', typeof HealthGuardApp !== 'undefined');

// Test 4: Check app instances
console.log('\n🚀 App instances:');
console.log('- window.healthGuardApp:', !!window.healthGuardApp);
console.log('- window.healthGuardAppInstance:', !!window.healthGuardAppInstance);

// Test 5: Check specific methods if app exists
if (window.healthGuardApp) {
    console.log('\n🔧 Available methods:');
    ['performQuickAnalysis', 'switchToAudioRecording', 'syncData', 'activateTab'].forEach(method => {
        console.log(`- ${method}:`, typeof window.healthGuardApp[method]);
    });
}

// Test 6: Check DOM elements
console.log('\n🏗️ Key DOM elements:');
const checkElements = [
    'syncDataBtn', 'newAnalysisBtn', 
    'quickAnalyzeBtn', 'startRecordingBtn', 
    'dashboard-tab', 'analysis-tab'
];

checkElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`- ${id}:`, !!element, element?.tagName);
});

// Test 7: Check for JavaScript errors
console.log('\n❌ Recent errors (if any):');
// This would show recent console errors

// Test 8: Try calling a simple method
console.log('\n🧪 Function test:');
if (window.healthGuardApp && window.healthGuardApp.showNotification) {
    try {
        window.healthGuardApp.showNotification('Debug test notification', 'info');
        console.log('✅ showNotification works!');
    } catch (error) {
        console.log('❌ showNotification failed:', error.message);
    }
} else {
    console.log('❌ showNotification not available');
}

console.log('\n🎯 Debug Test Complete!');
console.log('==========================================');

// Instructions
console.log('\n📝 Next steps:');
console.log('1. Check for any red errors above');
console.log('2. Try clicking a button and watch console');
console.log('3. Run: window.healthGuardApp?.performQuickAnalysis()');
console.log('4. Check Network tab for failed script loads');
