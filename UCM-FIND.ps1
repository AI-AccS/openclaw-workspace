# Find the correct login endpoint
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$client = New-Object System.Net.WebClient
$html = $client.DownloadString("http://192.168.1.148")
Write-Host "=== Page Content ==="
Write-Host $html.Substring(0, [Math]::Min(2000, $html.Length))