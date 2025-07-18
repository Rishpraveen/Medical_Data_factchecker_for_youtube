#!/usr/bin/env pwsh

# Medical YouTube Optimizer - Setup and Build Script

Write-Host "🏥 Setting up Medical YouTube Optimizer..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required but not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the extension
Write-Host "🔨 Building extension..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Replace background.js with new version
Write-Host "🔄 Updating background script..." -ForegroundColor Yellow
Copy-Item "background_new.js" "background.js" -Force

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable 'Developer mode' (toggle in top right)" -ForegroundColor White
Write-Host "3. Click 'Load unpacked' and select this folder" -ForegroundColor White
Write-Host "4. Configure your OpenAI API key in the extension settings" -ForegroundColor White
Write-Host "5. Set up your health profile for personalized analysis" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Privacy Note: All health data is encrypted and stored locally in your browser." -ForegroundColor Green
