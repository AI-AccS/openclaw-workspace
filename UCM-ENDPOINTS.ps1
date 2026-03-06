# Test common UCM6308 API endpoints
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$endpoints = @(
    "http://192.168.1.148/rest/sipaccount/list",
    "http://192.168.1.148/cgi-bin/api.cgi?cmd=get_sip_account_list",
    "http://192.168.1.148/json/get_sip_account_list"
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTrying: $endpoint"
    try {
        $client = New-Object System.Net.WebClient
        $result = $client.DownloadString($endpoint)
        Write-Host "SUCCESS - Length: $($result.Length)"
        Write-Host "Preview: $($result.Substring(0, [Math]::Min(200, $result.Length)))"
        break
    } catch {
        Write-Host "FAILED: $_"
    }
}