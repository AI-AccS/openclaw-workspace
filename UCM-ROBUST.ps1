# Robust UCM6308 test
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$client = New-Object System.Net.WebClient
Write-Host "Testing HTTP (port 80)..."
try {
    $response = $client.DownloadString("http://192.168.1.148")
    Write-Host "✅ Got ${$response.Length} bytes"
    if ($response -cmatch ">UCM|Grandstream|login|Login") {
        Write-Host "Content looks like: UCM web page or login"
    }
} catch {
    Write-Host "❌ HTTP failed: $_"
}

Write-Host "\nTesting HTTPS (port 443)..."
try {
    $response = $client.DownloadString("https://192.168.1.148")
    Write-Host "✅ Got ${$response.Length} bytes"
} catch {
    Write-Host "❌ HTTPS failed: $_"
}