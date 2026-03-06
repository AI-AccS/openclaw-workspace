# Try using C# WebClient which handles redirects better
Add-Type -AssemblyName System

$client = New-Object System.Net.WebClient
$client.Headers["Authorization"] = "Basic $( [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("Brigain:Jen!fer1"))) )"

# Try multiple URLs to test
$urls = @(
    "http://192.168.1.148",
    "https://192.168.1.148",
    "http://192.168.1.148:8080",
    "https://192.168.1.148:8080"
)

foreach ($url in $urls) {
    Write-Host "`nTrying: $url"
    try {
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
        $response = $client.DownloadString($url)
        Write-Host "✅ SUCCESS - Response length: $($response.Length)"
        Write-Host "First 200 chars: $($response.Substring(0, [Math]::Min(200, $response.Length)))"
        break
    } catch {
        Write-Host "❌ FAILED"
    }
}