# Test UCM6308 REST API with proper SSL bypass
$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 REST API Test ===" -ForegroundColor Yellow
Write-Host "Host: $ucmHost"
Write-Host "Username: $username"
Write-Host ""

# Method 1: Simple HTTP (no SSL)
Write-Host "--- Testing HTTP (port 80) ---" -ForegroundColor Cyan
$authValue = "Basic " + [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("$($username):$($password)"))

$testUrl = "http://$ucmHost/rest/sipaccount/list"
Write-Host "URL: $testUrl" -ForegroundColor Gray

try {
    $request = [System.Net.HttpWebRequest]::Create($testUrl)
    $request.Method = "GET"
    $request.Headers.Add("Authorization", $authValue)
    
    $response = $request.GetResponse()
    $streamReader = New-Object System.IO.StreamReader($response.ResponseStream)
    $result = $streamReader.ReadToEnd()
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response length: $($result.Length) bytes" -ForegroundColor Green
    Write-Host ""
    Write-Host "First 1000 chars:" -ForegroundColor Gray
    Write-Host $result.Substring(0, [Math]::Min($result.Length, 1000))
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $_.Exception.Response.GetResponseStream() | New-Object System.IO.StreamReader -ArgumentList (_) | ForEach-Object { Write-Host $_.ReadToEnd() }
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green