# Robust UCM6308 test
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$client = New-Object System.Net.WebClient
Write-Host "Testing HTTP port 80..."
try {
    $response = $client.DownloadString("http://192.168.1.148")
    Write-Host "SUCCESS Got $($response.Length) bytes"
    Write-Host "First 300 chars: $($response.Substring(0, [Math]::Min(300, $response.Length)))"
} catch {
    Write-Host "FAILED HTTP error $_"
}

Write-Host "\nTesting HTTPS port 443..."
try {
    $response2 = $client.DownloadString("https://192.168.1.148")
    Write-Host "SUCCESS Got $($response2.Length) bytes"
} catch {
    Write-Host "FAILED HTTPS error $_"
}