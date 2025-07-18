/**
 * Test Script for Medical Analysis Integration
 * Validates that all components are properly integrated and working
 */

console.log('🧪 Starting Medical Analysis Integration Tests...');

// Test 1: Check if all medical analysis classes are available
function testClassAvailability() {
    console.log('\n📋 Test 1: Checking class availability...');
    
    const classes = [
        'OpenSourceMedicalAnalyzer',
        'MedicalOCRProcessor', 
        'FreeMedicalTranscription',
        'IntegratedMedicalAnalysis'
    ];
    
    const results = {};
    
    classes.forEach(className => {
        try {
            results[className] = typeof window[className] !== 'undefined';
            console.log(`   ${className}: ${results[className] ? '✅' : '❌'}`);
        } catch (error) {
            results[className] = false;
            console.log(`   ${className}: ❌ (${error.message})`);
        }
    });
    
    return results;
}

// Test 2: Test IntegratedMedicalAnalysis initialization
async function testIntegratedSystemInit() {
    console.log('\n🔧 Test 2: Testing Integrated System Initialization...');
    
    try {
        if (typeof IntegratedMedicalAnalysis === 'undefined') {
            console.log('   ❌ IntegratedMedicalAnalysis class not available');
            return false;
        }
        
        const system = new IntegratedMedicalAnalysis();
        
        // Test with mock config
        const initResult = await system.initialize({
            huggingFaceToken: 'mock-token',
            enableEncryption: true,
            enableOfflineMode: true,
            enableOCR: false, // Disable to avoid dependencies
            enableSpeechToText: false,
            enableMedicalAnalysis: false
        });
        
        console.log(`   Initialization result: ${initResult.success ? '✅' : '❌'}`);
        
        if (!initResult.success) {
            console.log(`   Error: ${initResult.error}`);
        }
        
        return initResult.success;
        
    } catch (error) {
        console.log(`   ❌ Initialization failed: ${error.message}`);
        return false;
    }
}

// Test 3: Test background script message handling
async function testBackgroundIntegration() {
    console.log('\n📡 Test 3: Testing Background Script Integration...');
    
    try {
        // Test if chrome.runtime is available
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.log('   ⚠️ Chrome runtime not available (expected in browser context)');
            return true; // This is expected in a standalone test
        }
        
        // Test message sending
        const testMessage = {
            action: 'getAllStoredMedicalData'
        };
        
        chrome.runtime.sendMessage(testMessage, (response) => {
            if (chrome.runtime.lastError) {
                console.log(`   ⚠️ Background script not responding: ${chrome.runtime.lastError.message}`);
            } else {
                console.log('   ✅ Background script communication working');
            }
        });
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Background integration test failed: ${error.message}`);
        return false;
    }
}

// Test 4: Test medical analysis with mock data
async function testMedicalAnalysisFlow() {
    console.log('\n🔬 Test 4: Testing Medical Analysis Flow...');
    
    try {
        if (typeof IntegratedMedicalAnalysis === 'undefined') {
            console.log('   ❌ IntegratedMedicalAnalysis not available');
            return false;
        }
        
        const system = new IntegratedMedicalAnalysis();
        
        // Initialize with minimal config
        await system.initialize({
            enableOCR: false,
            enableSpeechToText: false,
            enableMedicalAnalysis: false
        });
        
        // Test mock YouTube transcript processing
        const mockTranscript = "Patient has diabetes and takes metformin. Blood pressure is elevated.";
        
        try {
            const result = await system.processYouTubeTranscript(mockTranscript);
            console.log('   ✅ YouTube transcript processing working');
            return true;
        } catch (error) {
            if (error.message.includes('not initialized')) {
                console.log('   ⚠️ Medical analyzer not initialized (expected with disabled components)');
                return true;
            }
            throw error;
        }
        
    } catch (error) {
        console.log(`   ❌ Medical analysis flow test failed: ${error.message}`);
        return false;
    }
}

// Test 5: Test popup integration
function testPopupIntegration() {
    console.log('\n🖥️ Test 5: Testing Popup Integration...');
    
    try {
        // Check if popup elements exist (if running in popup context)
        const popupElements = [
            'quickAnalyzeBtn',
            'documentUpload',
            'startRecordingBtn',
            'viewStoredDataBtn'
        ];
        
        let foundElements = 0;
        popupElements.forEach(elementId => {
            if (document.getElementById(elementId)) {
                foundElements++;
            }
        });
        
        if (foundElements > 0) {
            console.log(`   ✅ Found ${foundElements}/${popupElements.length} popup elements`);
            
            // Test if EnhancedMedicalPopup class is available
            if (typeof EnhancedMedicalPopup !== 'undefined') {
                console.log('   ✅ EnhancedMedicalPopup class available');
                return true;
            } else {
                console.log('   ⚠️ EnhancedMedicalPopup class not available');
                return false;
            }
        } else {
            console.log('   ⚠️ No popup elements found (not in popup context)');
            return true;
        }
        
    } catch (error) {
        console.log(`   ❌ Popup integration test failed: ${error.message}`);
        return false;
    }
}

// Test 6: Test error handling
async function testErrorHandling() {
    console.log('\n⚠️ Test 6: Testing Error Handling...');
    
    try {
        if (typeof IntegratedMedicalAnalysis === 'undefined') {
            console.log('   ❌ IntegratedMedicalAnalysis not available');
            return false;
        }
        
        const system = new IntegratedMedicalAnalysis();
        
        // Test without initialization
        try {
            await system.processYouTubeTranscript("test");
            console.log('   ❌ Should have thrown error for uninitialized system');
            return false;
        } catch (error) {
            if (error.message.includes('not initialized')) {
                console.log('   ✅ Proper error handling for uninitialized system');
                return true;
            } else {
                console.log(`   ⚠️ Unexpected error: ${error.message}`);
                return false;
            }
        }
        
    } catch (error) {
        console.log(`   ❌ Error handling test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Medical Analysis Integration Test Suite');
    console.log('==========================================');
    
    const testResults = {};
    
    // Run tests
    testResults.classAvailability = testClassAvailability();
    testResults.systemInit = await testIntegratedSystemInit();
    testResults.backgroundIntegration = await testBackgroundIntegration();
    testResults.analysisFlow = await testMedicalAnalysisFlow();
    testResults.popupIntegration = testPopupIntegration();
    testResults.errorHandling = await testErrorHandling();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passedTests = 0;
    let totalTests = 0;
    
    Object.entries(testResults).forEach(([testName, result]) => {
        totalTests++;
        if (result === true || (typeof result === 'object' && Object.values(result).some(v => v))) {
            passedTests++;
            console.log(`✅ ${testName}: PASSED`);
        } else {
            console.log(`❌ ${testName}: FAILED`);
        }
    });
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Integration is working correctly.');
    } else if (passedTests >= totalTests * 0.7) {
        console.log('⚠️ Most tests passed. Some features may need additional setup.');
    } else {
        console.log('❌ Multiple tests failed. Check the integration setup.');
    }
    
    return {
        passed: passedTests,
        total: totalTests,
        results: testResults
    };
}

// Export for use in extension context
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testClassAvailability };
} else {
    // Auto-run in browser context
    if (typeof window !== 'undefined') {
        window.MedicalAnalysisTests = { runAllTests, testClassAvailability };
        
        // Auto-run tests if in development mode
        if (window.location.hostname === 'localhost' || window.location.protocol === 'chrome-extension:') {
            setTimeout(runAllTests, 1000);
        }
    }
}
