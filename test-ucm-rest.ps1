# Test UCM6308 REST API Connection
# Credentials: cdrapi / cdrapi123

$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 REST API Test ==="
Write-Host "Host: $ucmHost"
Write-Host "Username: $username"
Write-Host ""

# Disable SSL certificate validation for self-signed cert
[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Create Basic Auth header
$credentials = "$($username):$($password)"
$byteCredentials = [System.Text.Encoding]::ASCII.GetBytes($credentials)
$authHeader = @{
    "Authorization" = "Basic " + [Convert]::ToBase64String($byteCredentials)
}

# Test 1: SIP Account List
Write-Host "[TEST 1] GET /rest/sipaccount/list" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://$ucmHost/rest/sipaccount/list" -Headers $authHeader -Method Get -UseBasicParsing
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Content type: $($response.GetType().Name)"
    Write-Host ""
    
    if ($response -is [array]) {
        Write-Host "Found $($response.Count) SIP account(s):" -ForegroundColor Cyan
        $response | Select-Object -First 3 | Format-List
    } else {
        Write-Host "Response data:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $_.Exception.Response.StatusCode | ForEach-Object { Write-Host "HTTP Status: $_" -ForegroundColor Yellow }
    }
}

Write-Host ""
Write-Host "=" * 60
Write-Host ""

# Test 2: Fail2Ban Status
Write-Host "[TEST 2] GET /rest/app/hitbruteforcerule/1" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://$ucmHost/rest/app/hitbruteforcerule/1" -Headers $authHeader -Method Get -UseBasicParsing
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60
Write-Host ""

# Test 3: CDR Records
Write-Host "[TEST 3] GET /rest/record/list (last 5 records)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://$ucmHost/rest/record/list?limit=5" -Headers $authHeader -Method Get -UseBasicParsing
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    if ($response -is [array]) {
        Write-Host "Found $($response.Count) CDR record(s):" -ForegroundColor Cyan
        $response | Select-Object -First 5 |
            ForEach-Object { 
                [PSCustomObject]@{
                    From = $_.from
                    To = $_.to
                    Duration = $_.duration
                    Time = $_.time
                }
            } | Format-Table
    } else {
        $response | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green