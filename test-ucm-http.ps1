# Test UCM6308 REST API - HTTP (no SSL)
$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 REST API Test (HTTP Port 80) ===" -ForegroundColor Yellow
Write-Host "Host: $ucmHost"
Write-Host "Username: $username"
Write-Host ""

$authValue = "Basic " + [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("$($username):$($password)"))

$testUrl = "http://$ucmHost/rest/sipaccount/list"
Write-Host "URL: $testUrl" -ForegroundColor Gray
Write-Host "Auth: Basic + base64 creds" -ForegroundColor Gray
Write-Host ""
Write-Host "Sending request..." -ForegroundColor Gray

try {
    $request = [System.Net.HttpWebRequest]::Create($testUrl)
    $request.Method = "GET"
    $request.Headers.Add("Authorization", $authValue)
    $request.ProtocolVersion = [System.Net.HttpVersion]::Version11
    $request.Timeout = 10000
    
    $response = $request.GetResponse()
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "HTTP Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "Content-Type: $($response.ContentType)" -ForegroundColor Green
    Write-Host "Content-Length: $($response.ContentLength) bytes" -ForegroundColor Green
    Write-Host ""
    
    $streamReader = New-Object System.IO.StreamReader($response.ResponseStream)
    $result = $streamReader.ReadToEnd()
    $streamReader.Close()
    $response.Close()
    
    # Check if JSON or HTML
    if ($result -match '<!DOCTYPE|<html|<body') {
        Write-Host "⚠️ WARNING: Received HTML (likely web UI, not API data)" -ForegroundColor Yellow
        Write-Host "This suggests authentication failed and the server returned login page instead of JSON"
    } else {
        Write-Host "✅ Appears to be valid API response (JSON/text)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Response content:" -ForegroundColor Cyan
    Write-Host $result.Substring(0, [Math]::Min($result.Length, 3000))
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "Inner error: $($_.Exception.InnerException.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green