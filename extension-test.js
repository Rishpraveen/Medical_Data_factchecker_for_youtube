// Extension Testing & Debug Script
// Use this to test the extension functionality and debug issues

console.log('🧪 HealthGuard Extension Test Script Loading...');

// Test 1: Check if extension context is available
function testExtensionContext() {
    console.log('\n=== Testing Extension Context ===');
    
    if (typeof chrome !== 'undefined') {
        console.log('✅ Chrome APIs available');
        
        if (chrome.runtime) {
            console.log('✅ Chrome runtime available');
            console.log(`📋 Extension ID: ${chrome.runtime.id}`);
        } else {
            console.log('❌ Chrome runtime not available');
        }
        
        if (chrome.storage) {
            console.log('✅ Chrome storage available');
        } else {
            console.log('❌ Chrome storage not available');
        }
        
        if (chrome.tabs) {
            console.log('✅ Chrome tabs API available');
        } else {
            console.log('❌ Chrome tabs API not available');
        }
    } else {
        console.log('❌ Chrome APIs not available - not in extension context');
    }
}

// Test 2: Check if popup elements exist
function testPopupElements() {
    console.log('\n=== Testing Popup Elements ===');
    
    const requiredElements = [
        'expandBtn',
        'analyzeCurrentVideo', 
        'uploadDocument',
        'recordAudio',
        'getCaptions',
        'quickAnalyzeBtn',
        'fullAnalyzeBtn',
        'translateBtn',
        'documentUpload',
        'documentFileInput',
        'startRecordingBtn',
        'stopRecordingBtn',
        'userName',
        'userEmail',
        'exportDataBtn',
        'clearDataBtn',
        'helpBtn',
        'analysisResults'
    ];
    
    let foundElements = 0;
    let missingElements = [];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            foundElements++;
            console.log(`✅ Found element: ${id}`);
        } else {
            missingElements.push(id);
            console.log(`❌ Missing element: ${id}`);
        }
    });
    
    console.log(`\n📊 Results: ${foundElements}/${requiredElements.length} elements found`);
    
    if (missingElements.length > 0) {
        console.log(`❌ Missing elements: ${missingElements.join(', ')}`);
    } else {
        console.log('✅ All required elements found!');
    }
    
    return missingElements.length === 0;
}

// Test 3: Check if app instance is available
function testAppInstance() {
    console.log('\n=== Testing App Instance ===');
    
    if (typeof window.healthGuardAppInstance !== 'undefined') {
        console.log('✅ HealthGuard app instance available');
        
        const instance = window.healthGuardAppInstance;
        
        // Test key methods
        const keyMethods = [
            'fetchVideoCaption',
            'performQuickAnalysis', 
            'performFullAnalysis',
            'showProgress',
            'hideProgress',
            'showNotification',
            'activateTab'
        ];
        
        keyMethods.forEach(method => {
            if (typeof instance[method] === 'function') {
                console.log(`✅ Method available: ${method}`);
            } else {
                console.log(`❌ Method missing: ${method}`);
            }
        });
        
        return true;
    } else {
        console.log('❌ HealthGuard app instance not available');
        return false;
    }
}

// Test 4: Check if caption fetcher is available
async function testCaptionFetcher() {
    console.log('\n=== Testing Caption Fetcher ===');
    
    try {
        // Check if background script is responsive
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            const response = await chrome.runtime.sendMessage({
                action: 'fetchCaptions',
                videoId: 'dQw4w9WgXcQ', // Rick Roll video ID for testing
                language: 'en',
                options: {}
            });
            
            if (response) {
                console.log('✅ Background script responsive');
                console.log('📋 Caption fetcher response:', response);
            } else {
                console.log('❌ No response from background script');
            }
        } else {
            console.log('⚠️  Cannot test caption fetcher - no Chrome APIs');
        }
    } catch (error) {
        console.log('❌ Caption fetcher test failed:', error.message);
    }
}

// Test 5: Check CSP compliance
function testCSPCompliance() {
    console.log('\n=== Testing CSP Compliance ===');
    
    // Check for inline scripts
    const scripts = document.querySelectorAll('script');
    let inlineScripts = 0;
    
    scripts.forEach(script => {
        if (!script.src && script.innerHTML.trim()) {
            inlineScripts++;
            console.log('❌ Found inline script:', script.innerHTML.substring(0, 50) + '...');
        }
    });
    
    // Check for inline event handlers
    const elementsWithHandlers = document.querySelectorAll('[onclick], [onload], [onerror]');
    
    if (inlineScripts === 0) {
        console.log('✅ No inline scripts found');
    } else {
        console.log(`❌ Found ${inlineScripts} inline scripts`);
    }
    
    if (elementsWithHandlers.length === 0) {
        console.log('✅ No inline event handlers found');
    } else {
        console.log(`❌ Found ${elementsWithHandlers.length} inline event handlers`);
        elementsWithHandlers.forEach(el => {
            console.log(`❌ Element with handler: ${el.tagName} - ${el.id || el.className}`);
        });
    }
    
    return inlineScripts === 0 && elementsWithHandlers.length === 0;
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting HealthGuard Extension Tests...');
    
    const results = {
        extensionContext: testExtensionContext(),
        popupElements: testPopupElements(), 
        appInstance: testAppInstance(),
        cspCompliance: testCSPCompliance()
    };
    
    // Async test
    await testCaptionFetcher();
    
    console.log('\n=== Test Summary ===');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Extension should be working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the issues above.');
    }
    
    return results;
}

// Export for manual testing
window.healthGuardTests = {
    runAllTests,
    testExtensionContext,
    testPopupElements,
    testAppInstance,
    testCaptionFetcher,
    testCSPCompliance
};

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000); // Wait for app to initialize
    });
} else {
    setTimeout(runAllTests, 1000);
}

console.log('✅ Extension test script loaded. Run window.healthGuardTests.runAllTests() to test manually.');
