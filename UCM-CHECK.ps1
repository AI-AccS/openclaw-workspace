# Test with actual HTML inspection
Add-Type -AssemblyName System

$client = New-Object System.Net.WebClient
$response = $client.DownloadString("http://192.168.1.148")
Write-Host "Response type check:"
if ($response -match "login" -or $response -match "Login") {
    Write-Host "This is a LOGIN PAGE"
} elseif ($response -match "UCM" -or $response -match "Grandstream") {
    Write-Host "This is UCM6308 page"
}
Write-Host "`nFirst 500 chars:"
Write-Host $response.Substring(0, [Math]::Min(500, $response.Length))