# Medical YouTube Optimizer - Setup Script
# PowerShell script to help set up the extension

Write-Host "🏥 Medical YouTube Optimizer - Setup Script" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n🔧 Setting up your Medical YouTube Optimizer extension..." -ForegroundColor Yellow

# Check if Chrome is installed
$chromeInstalled = Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe" -Or Test-Path "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if (-not $chromeInstalled) {
    Write-Host "❌ Google Chrome is not detected. Please install Chrome first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Google Chrome detected" -ForegroundColor Green

# Check if extension files exist
$requiredFiles = @(
    "manifest.json",
    "background.js", 
    "content.js",
    "popup.html",
    "popup.js",
    "popup.css",
    "options_new.html",
    "options_new.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Check AI integration files
$aiFiles = @(
    "src/ai/seamlessM4T.js",
    "src/ai/medicalAnalyzer.js"
)

$missingAiFiles = @()
foreach ($file in $aiFiles) {
    if (-not (Test-Path $file)) {
        $missingAiFiles += $file
    }
}

if ($missingAiFiles.Count -gt 0) {
    Write-Host "⚠️ Some AI integration files are missing:" -ForegroundColor Yellow
    $missingAiFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host "The extension will work with limited functionality." -ForegroundColor Yellow
} else {
    Write-Host "✅ AI integration files found" -ForegroundColor Green
}

Write-Host "`n📋 Installation Instructions:" -ForegroundColor Cyan
Write-Host "1. Open Google Chrome" -ForegroundColor White
Write-Host "2. Navigate to chrome://extensions/" -ForegroundColor White
Write-Host "3. Enable 'Developer mode' (toggle in top-right)" -ForegroundColor White
Write-Host "4. Click 'Load unpacked' button" -ForegroundColor White
Write-Host "5. Select this folder: $PWD" -ForegroundColor White
Write-Host "6. The extension should now appear in your extensions list" -ForegroundColor White

Write-Host "`n🔑 API Setup (Required for AI features):" -ForegroundColor Cyan
Write-Host "1. Go to https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "2. Create a new access token (free account required)" -ForegroundColor White
Write-Host "3. Copy the token (starts with 'hf_')" -ForegroundColor White
Write-Host "4. Open the extension's options page" -ForegroundColor White
Write-Host "5. Paste your API key in the AI Settings tab" -ForegroundColor White

Write-Host "`n🌟 Features Overview:" -ForegroundColor Cyan
Write-Host "• 🤖 AI-powered medical content analysis" -ForegroundColor White
Write-Host "• 🔬 Medical entity recognition and extraction" -ForegroundColor White
Write-Host "• ⚠️ Risk assessment and safety warnings" -ForegroundColor White
Write-Host "• 🕉️ Ayurvedic medicine detection and analysis" -ForegroundColor White
Write-Host "• 🌍 Tamil language support and translation" -ForegroundColor White
Write-Host "• 📊 Sentiment analysis of medical content" -ForegroundColor White
Write-Host "• 🎯 Content classification and categorization" -ForegroundColor White

Write-Host "`n⚡ Quick Start:" -ForegroundColor Cyan
Write-Host "1. Install the extension (follow steps above)" -ForegroundColor White
Write-Host "2. Add your Hugging Face API key in settings" -ForegroundColor White
Write-Host "3. Go to any YouTube medical video" -ForegroundColor White
Write-Host "4. Click the AI Analysis button or use Ctrl+Shift+M" -ForegroundColor White
Write-Host "5. View comprehensive medical content analysis" -ForegroundColor White

Write-Host "`n🛡️ Privacy & Security:" -ForegroundColor Cyan
Write-Host "• All analysis is performed via secure API calls" -ForegroundColor White
Write-Host "• No personal data is stored or transmitted" -ForegroundColor White
Write-Host "• Medical content analysis is anonymous" -ForegroundColor White
Write-Host "• API key is stored locally and encrypted" -ForegroundColor White

Write-Host "`n📞 Support & Issues:" -ForegroundColor Cyan
Write-Host "• Enable Debug Mode in Advanced Settings for detailed logs" -ForegroundColor White
Write-Host "• Check Chrome Developer Console for error messages" -ForegroundColor White
Write-Host "• Verify API key is valid and has sufficient quota" -ForegroundColor White
Write-Host "• Ensure YouTube videos have English/Tamil captions available" -ForegroundColor White

Write-Host "`n✨ You're all set! Happy analyzing! ✨" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Optional: Open Chrome extensions page
$openChrome = Read-Host "`nWould you like to open Chrome extensions page now? (y/n)"
if ($openChrome -eq 'y' -or $openChrome -eq 'Y') {
    Start-Process "chrome://extensions/"
    Write-Host "✅ Chrome extensions page opened" -ForegroundColor Green
}

Write-Host "`nSetup complete! 🎉" -ForegroundColor Green
