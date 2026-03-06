# Test UCM6308 WebSocket API Connection
# Credentials: cdrapi / cdrapi123

$ucmHost = "192.168.1.148"
$websocketUrl = "wss://$($ucmHost):8089/websockify"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 WebSocket API Test ==="
Write-Host "Connecting to: $websocketUrl"
Write-Host "Username: $username"
Write-Host ""

# Step 1: Challenge Request
Write-Host "[STEP 1] Sending challenge request..." -ForegroundColor Yellow

$challengePayload = @{
    type = "request"
    message = @{
        transactionid = ([guid]::NewGuid().ToString())
        action = "challenge"
        username = $username
        version = "1"
    }
} | ConvertTo-Json -Depth 3

Write-Host "Payload: $challengePayload" -ForegroundColor Gray

# WebSocket connection requires JavaScript runtime or node.js
# PowerShell has limited WebSocket support, so we'll test via REST API first

Write-Host ""
Write-Host "=== Testing REST API instead (PowerShell native) ==="
Write-Host ""

# Test Basic Auth with new credentials
$authHeader = @{
    "Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($username):$($password)"))
}

# Disable SSL certificate validation for self-signed cert
[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

try {
    $response = Invoke-RestMethod -Uri "http://$($ucmHost)/rest/sipaccount/list" -Headers $authHeader -Method Get -UseBasicParsing
    
    Write-Host "[SUCCESS] REST API responded with data!" -ForegroundColor Green
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
    Write-Host "[ERROR] REST API test failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try alternative endpoints
    Write-Host ""
    Write-Host "Trying /api/v1 endpoint..." -ForegroundColor Yellow
    try {
        $altResponse = Invoke-RestMethod -Uri "http://$($ucmHost)/api/v1/status" -Headers $authHeader -Method Get -UseBasicParsing
        Write-Host "[SUCCESS] Alternative endpoint worked!" -ForegroundColor Green
        $altResponse | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "[ERROR] Alternative also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ==="
