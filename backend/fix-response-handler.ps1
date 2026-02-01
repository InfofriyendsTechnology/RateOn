# Fix all responseHandler syntax errors in controllers

$controllersPath = "C:\Users\dell i7\Desktop\project\RateOn\backend\src\controllers"

# Get all JS files in controllers
$files = Get-ChildItem -Path $controllersPath -Recurse -Filter "*.js"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    
    # Fix pattern: responseHandler.success(res, propertyName: value
    # Should be: responseHandler.success(res, 'Message', { propertyName: value
    
    # Fix users:
    $content = $content -replace "responseHandler\.success\(res,\s+users:\s*\{", "responseHandler.success(res, 'Platform stats fetched', { users: {"
    
    # Fix message: 'text',\n user:
    $content = $content -replace "responseHandler\.success\(res,\s+message:\s*'([^']+)',\s*\n\s*user:", "responseHandler.success(res, '`$1', { user:"
    
    # Fix message: 'text',\n report
    $content = $content -replace "responseHandler\.success\(res,\s+message:\s*'([^']+)',\s*\n\s*report", "responseHandler.success(res, '`$1', { report"
    
    # Fix user: { without message before
    $content = $content -replace "responseHandler\.success\(res,\s+user:\s*\{", "responseHandler.success(res, 'Success', { user: {"
    
    # Save the file
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "`nAll files processed!"
