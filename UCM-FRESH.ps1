# UCM6308 API Test - Fresh Script
Write-Host "Testing UCM6308 at 192.168.1.148:8080" -ForegroundColor Cyan

$username = "Brigain"
$password = "Jen!fer1"
$ip = "192.168.1.148"
$url = "http://${ip}:8080/rest/app/hitbruteforcerule/1"

Write-Host "URL to test: $url" -ForegroundColor Yellow

$credentials = "${username}:${password}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($credentials)
$base64 = [Convert]::ToBase64String($bytes)

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$response = Invoke-WebRequest -Uri $url -Method GET -Headers @{ Authorization = "Basic $base64" }
Write-Host "SUCCESS: $($response.Content)"
