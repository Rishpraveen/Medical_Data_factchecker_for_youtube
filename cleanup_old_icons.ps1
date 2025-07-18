# Cleanup old PNG icons and prepare for new SVG-based Tamil Ayurveda icons

Write-Host "Cleaning up old PNG icon files..." -ForegroundColor Yellow

# List of old PNG icons to remove
$oldIcons = @("icon16.png", "icon32.png", "icon48.png", "icon128.png")

foreach ($icon in $oldIcons) {
    if (Test-Path $icon) {
        Remove-Item $icon -Force
        Write-Host "Removed: $icon" -ForegroundColor Red
    } else {
        Write-Host "Not found: $icon" -ForegroundColor Gray
    }
}

Write-Host "`nNew SVG icons available:" -ForegroundColor Green
$newIcons = @("icon16.svg", "icon32.svg", "icon48.svg", "icon128.svg")

foreach ($icon in $newIcons) {
    if (Test-Path $icon) {
        Write-Host "✓ $icon" -ForegroundColor Green
    } else {
        Write-Host "✗ $icon (missing)" -ForegroundColor Red
    }
}

Write-Host "`nIcon cleanup completed!" -ForegroundColor Cyan
Write-Host "The extension now uses SVG icons with Tamil and Ayurvedic medical themes." -ForegroundColor Cyan
