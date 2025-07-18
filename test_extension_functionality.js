/**
 * HealthGuard Extension - Quick Test Script
 * Run this in the browser console to test basic functionality
 */

console.log('🧪 HealthGuard Extension Test Script');
console.log('=====================================');

// Test 1: Check if files are loaded
console.log('📁 File Check:');
console.log('- popup_enhanced.css:', document.querySelector('link[href*="popup_enhanced.css"]') ? '✅' : '❌');
console.log('- HealthGuardApp class:', typeof HealthGuardApp !== 'undefined' ? '✅' : '❌');

// Test 2: Check if DOM elements exist
console.log('\n🏗️ DOM Elements Check:');
const elements = [
    'nav-tabs', 'home-tab', 'analysis-tab', 'profile-tab', 'settings-tab',
    'quickAnalyzeBtn', 'fullAnalyzeBtn', 'startRecordingBtn',
    'documentUpload', 'userName', 'userEmail'
];

elements.forEach(id => {
    const exists = document.getElementById(id) !== null;
    console.log(`- ${id}:`, exists ? '✅' : '❌');
});

// Test 3: Check Chrome APIs
console.log('\n🔧 Chrome APIs Check:');
console.log('- chrome object:', typeof chrome !== 'undefined' ? '✅' : '❌');
console.log('- chrome.storage:', chrome?.storage ? '✅' : '❌');
console.log('- chrome.runtime:', chrome?.runtime ? '✅' : '❌');
console.log('- chrome.tabs:', chrome?.tabs ? '✅' : '❌');

// Test 4: Check if app instance exists
console.log('\n🚀 App Instance Check:');
if (window.healthGuardAppInstance) {
    console.log('- App instance: ✅');
    console.log('- Current tab:', window.healthGuardAppInstance.currentTab);
    console.log('- Is fullpage:', window.isFullPage || false);
} else {
    console.log('- App instance: ❌ (may still be loading)');
}

// Test 5: Navigation test
console.log('\n🧭 Navigation Test:');
try {
    const navTabs = document.querySelectorAll('.nav-tab');
    console.log(`- Found ${navTabs.length} navigation tabs`);
    
    if (navTabs.length > 0) {
        console.log('- Navigation structure: ✅');
    } else {
        console.log('- Navigation structure: ❌');
    }
} catch (error) {
    console.log('- Navigation test failed:', error.message);
}

console.log('\n🎯 Test Complete!');
console.log('=====================================');

// Quick functionality test
if (window.healthGuardAppInstance) {
    console.log('\n🧪 Quick Functionality Test:');
    console.log('Try running: window.healthGuardAppInstance.showNotification("Test notification", "success")');
}
