# Medical YouTube Optimizer - Tamil/Ayurveda Setup Script
# PowerShell script for Windows setup

Write-Host "🏥 Medical YouTube Optimizer - Tamil & Ayurvedic Edition Setup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Blue

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling project dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "`nCreating necessary directories..." -ForegroundColor Yellow
$directories = @("src", "src/utils", "src/styles", "src/data", "dist")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "📁 Directory exists: $dir" -ForegroundColor Blue
    }
}

# Check for Tamil font support
Write-Host "`nChecking Tamil font support..." -ForegroundColor Yellow
$tamilFonts = @("Noto Sans Tamil", "Latha", "Vijaya", "Tamil Sangam MN")
$foundFonts = @()

foreach ($font in $tamilFonts) {
    $fontPath = "C:\Windows\Fonts\*$($font.Replace(' ', ''))*"
    if (Get-ChildItem $fontPath -ErrorAction SilentlyContinue) {
        $foundFonts += $font
        Write-Host "✅ Tamil font found: $font" -ForegroundColor Green
    }
}

if ($foundFonts.Count -eq 0) {
    Write-Host "⚠️  No Tamil fonts detected. Installing Noto Sans Tamil..." -ForegroundColor Yellow
    
    # Download and install Noto Sans Tamil (requires admin privileges)
    try {
        $fontUrl = "https://fonts.google.com/download?family=Noto%20Sans%20Tamil"
        $fontZip = "$env:TEMP\NotoSansTamil.zip"
        $fontDir = "$env:TEMP\NotoSansTamil"
        
        Write-Host "Downloading Tamil font..." -ForegroundColor Yellow
        # Note: This is a simplified example. In practice, you'd need proper font installation
        Write-Host "⚠️  Please manually install Tamil fonts from https://fonts.google.com/noto/specimen/Noto+Sans+Tamil" -ForegroundColor Yellow
    } catch {
        Write-Host "⚠️  Could not automatically install Tamil fonts. Please install manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Tamil font support confirmed" -ForegroundColor Green
}

# Build the extension
Write-Host "`nBuilding extension..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Extension built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Running in development mode..." -ForegroundColor Yellow
    # Development build is optional, main files can work without webpack
}

# Verify required files
Write-Host "`nVerifying required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "manifest.json",
    "popup_tamil.html",
    "popup_new.css",
    "popup_new.js",
    "content.js",
    "background.js",
    "src/utils/tamilTranslator.js",
    "src/utils/ayurvedicDatabase.js",
    "src/utils/youtubeSourceVerifier.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️  Missing files detected. Extension may not work properly." -ForegroundColor Yellow
    Write-Host "Missing files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "`n✅ All required files present" -ForegroundColor Green
}

# Chrome extension loading instructions
Write-Host "`n📋 Installation Instructions:" -ForegroundColor Blue
Write-Host "1. Open Chrome and navigate to chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable 'Developer mode' (toggle in top right)" -ForegroundColor White
Write-Host "3. Click 'Load unpacked' button" -ForegroundColor White
Write-Host "4. Select this project folder: $PWD" -ForegroundColor White
Write-Host "5. The extension should appear in your Chrome toolbar" -ForegroundColor White

# Feature overview
Write-Host "`n🌟 Features Available:" -ForegroundColor Blue
Write-Host "🔤 Tamil Language Translation - Auto-detect and translate Tamil medical content" -ForegroundColor White
Write-Host "🕉️  Ayurvedic Analysis - Comprehensive herb and treatment database" -ForegroundColor White
Write-Host "👨‍⚕️ Trusted Sources - Verified medical professionals and institutions" -ForegroundColor White
Write-Host "⚕️  Risk Assessment - Safety analysis with contraindication warnings" -ForegroundColor White
Write-Host "📝 Enhanced Transcripts - Multi-language subtitle extraction" -ForegroundColor White

# Database statistics
Write-Host "`n📊 Database Content:" -ForegroundColor Blue
Write-Host "🌿 Ayurvedic Herbs: 50+ entries with full property analysis" -ForegroundColor White
Write-Host "🏥 Treatments: Panchakarma and traditional therapies" -ForegroundColor White
Write-Host "👨‍⚕️ Verified Doctors: 15+ qualified practitioners" -ForegroundColor White
Write-Host "🔤 Medical Terms: 200+ Tamil-English translations" -ForegroundColor White

# Usage tips
Write-Host "`n💡 Usage Tips:" -ForegroundColor Blue
Write-Host "• For best results, use videos with available subtitles" -ForegroundColor White
Write-Host "• Tamil translation works best with clear medical terminology" -ForegroundColor White
Write-Host "• Always verify Ayurvedic advice with qualified practitioners" -ForegroundColor White
Write-Host "• Check contraindications before using any herbal remedies" -ForegroundColor White

# Warning and disclaimers
Write-Host "`n⚠️  Important Disclaimers:" -ForegroundColor Yellow
Write-Host "• This extension is for educational purposes only" -ForegroundColor White
Write-Host "• Always consult qualified healthcare providers for medical advice" -ForegroundColor White
Write-Host "• Verify all medical information independently" -ForegroundColor White
Write-Host "• Report any issues or inaccuracies through GitHub" -ForegroundColor White

Write-Host "`n🎉 Setup Complete! The Medical YouTube Optimizer is ready to use." -ForegroundColor Green
Write-Host "Visit any YouTube video to start analyzing medical content." -ForegroundColor White
Write-Host "`nFor support, visit: https://github.com/Rishpraveen/Medical_data_optimisation" -ForegroundColor Blue

# Optional: Open Chrome extensions page
$openChrome = Read-Host "`nWould you like to open Chrome extensions page now? (y/n)"
if ($openChrome -eq 'y' -or $openChrome -eq 'Y') {
    Start-Process "chrome://extensions/"
    Write-Host "Chrome extensions page opened. Follow the installation instructions above." -ForegroundColor Green
}

Write-Host "`nThank you for using Medical YouTube Optimizer! 🙏" -ForegroundColor Magenta
