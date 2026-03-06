#!/usr/bin/env pwsh
# UCM6308 API Test Script
# Run this ONCE on your MSI machine to verify API access

$ip = "192.168.1.148"
$username = "Brigain"
$password = "Jen!fer1"

# Create Base64 auth header
$credentials = "${username}:${password}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($credentials)
$base64 = [Convert]::ToBase64String($bytes)
$headers = @{ Authorization = "Basic $base64" }

Write-Host "=== UCM6308 API Test ===`n"

# Test 1: Fail2Ban status
Write-Host "[1/3] Checking Fail2Ban configuration..."
try {
    $f2b = Invoke-WebRequest -Uri "http://$ip:8080/rest/app/hitbruteforcerule/1" -Headers $headers -Method GET
    Write-Host "✅ FAIL2BAN RESPONSE:"
    Write-Host ($f2b.Content | Out-String)
} catch {
    Write-Host "❌ Fail2Ban check failed: $_"
}

# Test 2: SIP extensions list
Write-Host "`n[2/3] Listing SIP extensions..."
try {
    $extensions = Invoke-WebRequest -Uri "http://$ip:8080/rest/sipaccount/list" -Headers $headers -Method GET
    Write-Host "✅ EXTENSIONS RESPONSE:"
    Write-Host ($extensions.Content | Out-String)
} catch {
    Write-Host "❌ Extensions check failed: $_"
}

# Test 3: Recent CDR records
Write-Host "`n[3/3] Fetching recent call records..."
try {
    $cdr = Invoke-WebRequest -Uri "http://$ip:8080/rest/record/list" -Headers $headers -Method GET
    Write-Host "✅ CDR RESPONSE (first 500 chars):"
    $content = $cdr.Content.Substring(0, [Math]::Min(500, $cdr.Content.Length))
    Write-Host $content
} catch {
    Write-Host "❌ CDR check failed: $_"
}

Write-Host "`n=== Test Complete ===" 
