# Test UCM6308 REST API with proper SSL bypass
$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "=== UCM6308 REST API Test ===" -ForegroundColor Yellow
Write-Host "Host: $ucmHost"
Write-Host "Username: $username"
Write-Host ""

# Create custom handler that ignores SSL errors
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.ServerCertificateCustomValidationCallback = {[Net.Messaging.RemoteCertificateValidationOptions]::All}
$client = New-Object System.Net.Http.HttpClient($handler)

# Set credentials
$credentials = "$($username):$($password)"
$byteCredentials = [System.Text.Encoding]::ASCII.GetBytes($credentials)
$authValue = "Basic " + [Convert]::ToBase64String($byteCredentials)
$client.DefaultRequestHeaders.Add("Authorization", $authValue)

# Test endpoints
$endpoints = @(
    "/rest/sipaccount/list",
    "/rest/app/hitbruteforcerule/1",
    "/rest/record/list?limit=3"
)

foreach ($endpoint in $endpoints) {
    Write-Host "[TEST] GET $endpoint" -ForegroundColor Cyan
    try {
        $url = "http://$($ucmHost)$($endpoint)"
        $response = $client.GetAsync($url).Result
        
        if ($response.IsSuccessStatusCode) {
            Write-Host "✅ SUCCESS (HTTP $($response.StatusCode))" -ForegroundColor Green
            $content = $response.Content.ReadAsStringAsync().Result
            Write-Host "$content" -ForegroundColor Gray
        } else {
            Write-Host "❌ HTTP $($response.StatusCode): $($response.ReasonPhrase)" -ForegroundColor Red
            $content = $response.Content.ReadAsStringAsync().Result
            if ($content.Length -lt 500) { Write-Host "$content" -ForegroundColor DarkGray }
        }
    } catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "$($_.InnerException.Message)" -ForegroundColor DarkRed
    }
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Green