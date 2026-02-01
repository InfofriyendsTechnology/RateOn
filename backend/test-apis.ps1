# RateOn API Testing Script
# Make sure the server is running (npm start) before running this script

$baseUrl = "http://localhost:1126/api/v1"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RateOn API Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Register User
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "johndoe"
    email = "john@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType 'application/json'
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Token: $($registerData.data.token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "User ID: $($registerData.data.user._id)" -ForegroundColor Gray
    $token = $registerData.data.token
    $userId = $registerData.data.user._id
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login User
Write-Host "2. Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    login = "johndoe"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User Type: $($loginData.data.userType)" -ForegroundColor Gray
    $token = $loginData.data.token
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Own Profile
Write-Host "3. Testing Get Own Profile..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/users/profile" -Method GET -Headers $headers
    $profileData = $profileResponse.Content | ConvertFrom-Json
    Write-Host "✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "Username: $($profileData.data.username)" -ForegroundColor Gray
    Write-Host "Trust Score: $($profileData.data.trustScore)" -ForegroundColor Gray
    Write-Host "Level: $($profileData.data.level)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Update Profile
Write-Host "4. Testing Update Profile..." -ForegroundColor Yellow
$updateBody = @{
    bio = "I love exploring new restaurants and sharing my experiences!"
    location = "New York, USA"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $updateResponse = Invoke-WebRequest -Uri "$baseUrl/users/profile" -Method PUT -Body $updateBody -ContentType 'application/json' -Headers $headers
    $updateData = $updateResponse.Content | ConvertFrom-Json
    Write-Host "✅ Profile updated!" -ForegroundColor Green
    Write-Host "Bio: $($updateData.data.profile.bio)" -ForegroundColor Gray
    Write-Host "Location: $($updateData.data.profile.location)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get Public Profile
Write-Host "5. Testing Get Public Profile..." -ForegroundColor Yellow
try {
    $publicProfileResponse = Invoke-WebRequest -Uri "$baseUrl/users/$userId" -Method GET
    $publicProfileData = $publicProfileResponse.Content | ConvertFrom-Json
    Write-Host "✅ Public profile retrieved!" -ForegroundColor Green
    Write-Host "Username: $($publicProfileData.data.username)" -ForegroundColor Gray
    Write-Host "Level: $($publicProfileData.data.level)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get public profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Logout
Write-Host "6. Testing Logout..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $logoutResponse = Invoke-WebRequest -Uri "$baseUrl/auth/logout" -Method POST -Headers $headers
    $logoutData = $logoutResponse.Content | ConvertFrom-Json
    Write-Host "✅ Logout successful!" -ForegroundColor Green
    Write-Host "$($logoutData.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
