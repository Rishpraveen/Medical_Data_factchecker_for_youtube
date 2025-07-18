# Convert SVG icons to PNG for Chrome Extension
# This script converts all SVG icons to PNG format for the Medical Tamil Ayurveda YouTube Optimizer

Write-Host "Converting SVG icons to PNG format..." -ForegroundColor Green

# Check if Inkscape is installed (alternative conversion method)
$inkscapeExists = Get-Command "inkscape" -ErrorAction SilentlyContinue
$convertExists = Get-Command "convert" -ErrorAction SilentlyContinue

if ($inkscapeExists) {
    Write-Host "Using Inkscape for conversion..." -ForegroundColor Yellow
    
    # Convert each icon size
    inkscape --export-type=png --export-width=16 --export-height=16 --export-filename="icon16.png" "icon16.svg"
    inkscape --export-type=png --export-width=32 --export-height=32 --export-filename="icon32.png" "icon32.svg"
    inkscape --export-type=png --export-width=48 --export-height=48 --export-filename="icon48.png" "icon48.svg"
    inkscape --export-type=png --export-width=128 --export-height=128 --export-filename="icon128.png" "icon128.svg"
    
} elseif ($convertExists) {
    Write-Host "Using ImageMagick for conversion..." -ForegroundColor Yellow
    
    # Convert each icon size
    convert -background transparent -size 16x16 "icon16.svg" "icon16.png"
    convert -background transparent -size 32x32 "icon32.svg" "icon32.png"
    convert -background transparent -size 48x48 "icon48.svg" "icon48.png"
    convert -background transparent -size 128x128 "icon128.svg" "icon128.png"
    
} else {
    Write-Host "Neither Inkscape nor ImageMagick found. Installing via Chocolatey..." -ForegroundColor Red
    
    # Check if Chocolatey is installed
    $chocoExists = Get-Command "choco" -ErrorAction SilentlyContinue
    
    if ($chocoExists) {
        Write-Host "Installing Inkscape via Chocolatey..." -ForegroundColor Yellow
        choco install inkscape -y
        
        # After installation, try conversion again
        inkscape --export-type=png --export-width=16 --export-height=16 --export-filename="icon16.png" "icon16.svg"
        inkscape --export-type=png --export-width=32 --export-height=32 --export-filename="icon32.png" "icon32.svg"
        inkscape --export-type=png --export-width=48 --export-height=48 --export-filename="icon48.png" "icon48.svg"
        inkscape --export-type=png --export-width=128 --export-height=128 --export-filename="icon128.png" "icon128.svg"
    } else {
        Write-Host "Please install either Inkscape or ImageMagick to convert SVG to PNG:" -ForegroundColor Red
        Write-Host "Option 1: Install Chocolatey and run: choco install inkscape" -ForegroundColor Cyan
        Write-Host "Option 2: Install ImageMagick from https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
        Write-Host "Option 3: Use online converter like https://convertio.co/svg-png/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Alternatively, Chrome extensions can also use SVG icons in manifest v3" -ForegroundColor Green
    }
}

Write-Host "Icon conversion process completed!" -ForegroundColor Green
