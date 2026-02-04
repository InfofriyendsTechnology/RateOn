# Mobile OAuth Setup Guide

## Problem
Google OAuth redirects to `localhost:1126` which doesn't work on mobile devices because mobile phones cannot access `localhost` on your computer.

## Solution Options

### Option 1: Use Local Network IP (For Development/Testing)

#### Step 1: Find Your Computer's Local IP Address

**On Windows (PowerShell):**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually something like `192.168.1.x` or `192.168.0.x`)

**Example Output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

#### Step 2: Update Backend `.env` File

Replace `localhost` with your IP address in these variables:

```env
# Use your computer's local IP instead of localhost
BACKEND_URL=http://192.168.1.100:1126
GOOGLE_CALLBACK_URL=http://192.168.1.100:1126/api/v1/auth/google/callback
FRONTEND_URL=http://192.168.1.100:5300
```

**Important Notes:**
- Both your computer and mobile device must be on the **same WiFi network**
- Replace `192.168.1.100` with YOUR actual IP address
- Your IP may change when you reconnect to WiFi, so check it regularly

#### Step 3: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   http://192.168.1.100:1126/api/v1/auth/google/callback
   ```
   (Replace with your IP address)
5. Keep the localhost URI for desktop development:
   ```
   http://localhost:1126/api/v1/auth/google/callback
   ```
6. Click **Save**

#### Step 4: Update Frontend Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.100:1126/api/v1',  // Use your IP
  appName: 'RateOn',
  tokenKey: 'rateon_token',
  userKey: 'rateon_user',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE'
};
```

#### Step 5: Restart Backend Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
npm start
```

#### Step 6: Access from Mobile

On your mobile device, access:
- Frontend: `http://192.168.1.100:5300`
- Backend: `http://192.168.1.100:1126`

---

### Option 2: Deploy to Production (Recommended for Real Use)

#### Step 1: Deploy Backend
Deploy your backend to a hosting service:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

You'll get a URL like: `https://rateon-backend.railway.app`

#### Step 2: Update Backend `.env` File

```env
BACKEND_URL=https://rateon-backend.railway.app
GOOGLE_CALLBACK_URL=https://rateon-backend.railway.app/api/v1/auth/google/callback
FRONTEND_URL=https://rateon-frontend.vercel.app
```

#### Step 3: Update Google Cloud Console

Add the production callback URL:
```
https://rateon-backend.railway.app/api/v1/auth/google/callback
```

#### Step 4: Deploy Frontend
Deploy your frontend to:
- **Vercel**: https://vercel.com (recommended for Angular)
- **Netlify**: https://netlify.com
- **Firebase Hosting**: https://firebase.google.com

You'll get a URL like: `https://rateon-frontend.vercel.app`

---

## Quick Setup Script (Windows)

Create a file `setup-mobile.ps1`:

```powershell
# Get local IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Select-Object -First 1).IPAddress

Write-Host "================================"
Write-Host "Your Local IP: $ip"
Write-Host "================================"
Write-Host ""
Write-Host "Update your .env file with:"
Write-Host "BACKEND_URL=http://${ip}:1126"
Write-Host "GOOGLE_CALLBACK_URL=http://${ip}:1126/api/v1/auth/google/callback"
Write-Host "FRONTEND_URL=http://${ip}:5300"
Write-Host ""
Write-Host "Add this to Google Cloud Console:"
Write-Host "http://${ip}:1126/api/v1/auth/google/callback"
Write-Host ""
Write-Host "Access frontend from mobile:"
Write-Host "http://${ip}:5300"
```

Run with: `powershell -ExecutionPolicy Bypass -File setup-mobile.ps1`

---

## Troubleshooting

### Mobile Can't Connect
- Ensure both devices are on the same WiFi network
- Check Windows Firewall settings (allow ports 1126 and 5300)
- Verify your IP address hasn't changed

### Google OAuth Still Redirects to Localhost
- Clear browser cache on mobile
- Wait 5-10 minutes after updating Google Cloud Console
- Verify the callback URL in `.env` matches Google Cloud Console exactly

### "Invalid Redirect URI" Error
- The callback URL in `.env` MUST match one of the authorized URIs in Google Cloud Console
- URLs are case-sensitive and must match exactly (including http/https)

---

## Current Configuration Status

Check your current `.env` file:
- ❌ `GOOGLE_CALLBACK_URL=http://localhost:1126/api/v1/auth/google/callback` (Won't work on mobile)
- ✅ Should be: `http://YOUR_IP:1126/api/v1/auth/google/callback`

---

## Windows Firewall Configuration

If mobile still can't connect, allow the ports through Windows Firewall:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "RateOn Backend" -Direction Inbound -Port 1126 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RateOn Frontend" -Direction Inbound -Port 5300 -Protocol TCP -Action Allow
```
