# RateOn Mobile Setup Helper
# This script finds your local IP address and shows what you need to update

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RateOn Mobile OAuth Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to get IP address from different network adapters
$ip = $null

# Try Wi-Fi first
$wifiIP = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($wifiIP) {
    $ip = $wifiIP.IPAddress
}

# If no Wi-Fi, try Ethernet
if (-not $ip) {
    $ethernetIP = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($ethernetIP) {
        $ip = $ethernetIP.IPAddress
    }
}

# If still no IP, try any non-loopback IPv4
if (-not $ip) {
    $anyIP = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1
    if ($anyIP) {
        $ip = $anyIP.IPAddress
    }
}

if (-not $ip) {
    Write-Host "❌ Could not find your local IP address!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run 'ipconfig' manually and find your IPv4 Address" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found Your Local IP Address: " -NoNewline -ForegroundColor Green
Write-Host $ip -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Update Backend .env File" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these lines to: backend\.env" -ForegroundColor Yellow
Write-Host ""
Write-Host "BACKEND_URL=http://${ip}:1126" -ForegroundColor White
Write-Host "GOOGLE_CALLBACK_URL=http://${ip}:1126/api/v1/auth/google/callback" -ForegroundColor White
Write-Host "FRONTEND_URL=http://${ip}:5300" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: Update Google Cloud Console" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor Yellow
Write-Host "2. Navigate to: APIs & Services > Credentials" -ForegroundColor Yellow
Write-Host "3. Click your OAuth 2.0 Client ID" -ForegroundColor Yellow
Write-Host "4. Add this Authorized redirect URI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   http://${ip}:1126/api/v1/auth/google/callback" -ForegroundColor White
Write-Host ""
Write-Host "5. Click Save and wait 5 minutes for changes to take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 3: Update Frontend Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Edit: frontend/src/environments/environment.ts" -ForegroundColor Yellow
Write-Host ""
Write-Host "apiUrl: 'http://${ip}:1126/api/v1'," -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 4: Access From Mobile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open on your mobile browser:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend: http://${ip}:5300" -ForegroundColor Green
Write-Host "Backend:  http://${ip}:1126" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - Both devices must be on the SAME WiFi network" -ForegroundColor Yellow
Write-Host "   - Restart backend server after updating .env" -ForegroundColor Yellow
Write-Host "   - Your IP may change when you reconnect to WiFi" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open Windows Firewall settings
Write-Host "Need to configure Windows Firewall?" -ForegroundColor Cyan
Write-Host "Run these commands as Administrator:" -ForegroundColor Yellow
Write-Host ""
Write-Host "New-NetFirewallRule -DisplayName 'RateOn Backend' -Direction Inbound -Port 1126 -Protocol TCP -Action Allow" -ForegroundColor White
Write-Host "New-NetFirewallRule -DisplayName 'RateOn Frontend' -Direction Inbound -Port 5300 -Protocol TCP -Action Allow" -ForegroundColor White
Write-Host ""
