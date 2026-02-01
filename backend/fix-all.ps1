# Comprehensive fix for all responseHandler syntax errors

$controllersPath = "C:\Users\dell i7\Desktop\project\RateOn\backend\src\controllers"

Write-Host "Finding and fixing all responseHandler syntax errors..."

# Get all JS files
$files = Get-ChildItem -Path $controllersPath -Recurse -Filter "*.js"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Pattern 1: responseHandler.success(res, 'Success', propertyName:
    # Should be: responseHandler.success(res, 'Message', { propertyName:
    if ($content -match "responseHandler\.success\(res,\s+'Success',\s+\w+:") {
        $content = $content -replace "responseHandler\.success\(res,\s+'Success',\s+(\w+):", "responseHandler.success(res, 'Success', { `$1:"
        $modified = $true
        Write-Host "  Fixed pattern 1 in: $($file.Name)"
    }
    
    # Pattern 2: responseHandler.success(res, propertyName:
    # Should be: responseHandler.success(res, 'Message', { propertyName:
    if ($content -match "responseHandler\.success\(res,\s+\w+:") {
        $content = $content -replace "responseHandler\.success\(res,\s+(\w+):", "responseHandler.success(res, 'Success', { `$1:"
        $modified = $true
        Write-Host "  Fixed pattern 2 in: $($file.Name)"
    }
    
    # Pattern 3: Ensure closing braces match for objects
    # Count opening and closing braces after responseHandler.success
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
    }
}

Write-Host "`nAll files processed!"
Write-Host "Please verify the changes manually."
