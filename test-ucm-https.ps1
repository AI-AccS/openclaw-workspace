# Test UCM6308 REST API - HTTPS version
$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 REST API Test (HTTPS) ===" -ForegroundColor Yellow
Write-Host "Host: $ucmHost"
Write-Host "Username: $username"
Write-Host ""

# SSL certificate bypass for self-signed certs
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Ssl3

$authValue = "Basic " + [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("$($username):$($password)"))

$testUrl = "https://$ucmHost/rest/sipaccount/list"
Write-Host "URL: $testUrl" -ForegroundColor Gray
Write-Host "Auth: $authValue.Substring(0,15)..." -ForegroundColor Gray
Write-Host ""

try {
    $request = [System.Net.HttpWebRequest]::Create($testUrl)
    $request.Method = "GET"
    $request.Headers.Add("Authorization", $authValue)
    $request.ProtocolVersion = [System.Net.HttpVersion]::Version11
    
    Write-Host "Sending request..." -ForegroundColor Gray
    $response = $request.GetResponse()
    
    Write-Host "✅ SUCCESS! HTTP $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "Content-Type: $($response.ContentType)" -ForegroundColor Green
    Write-Host "Content-Length: $($response.ContentLength) bytes" -ForegroundColor Green
    Write-Host ""
    
    $streamReader = New-Object System.IO.StreamReader($response.ResponseStream)
    $result = $streamReader.ReadToEnd()
    $streamReader.Close()
    $response.Close()
    
    Write-Host "Response (first 2000 chars):" -ForegroundColor Cyan
    Write-Host $result.Substring(0, [Math]::Min($result.Length, 2000))
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "Inner: $($_.Exception.InnerException.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green