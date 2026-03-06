# Diagnose UCM6308 issue - Check if we're getting login page or API
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$username = "Brigain"
$password = "Jen!fer1"
$credentials = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("${username}:${password}"))

$req = [System.Net.HttpWebRequest]::Create("http://192.168.1.148/rest/sipaccount/list")
$req.Method = "GET"
$req.Headers.Add("Authorization", "Basic ${credentials}")
$req.Timeout = 5000

try {
    $resp = $req.GetResponse()
    Write-Host "HTTP Status: $($resp.StatusCode)"
    
    # Check response headers
    Write-Host "Content-Type: $($resp.ContentType)"
    
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $result = $reader.ReadToEnd()
    Write-Host "Response Length: $($result.Length) bytes"
    Write-Host "`n=== First 1000 chars ==="
    Write-Host $result.Substring(0, [Math]::Min(1000, $result.Length))
    
    # Check if this is HTML (login page) or JSON
    if ($result -cmatch "<html|<div|UCM") {
        Write-Host "`n\n⚠️ THIS IS AN HTML PAGE (likely login required)"
    } elseif ($result -cmatch "\{|\[|") {
        Write-Host "`n\n✅ THIS LOOKS LIKE JSON/API DATA"
    }
} catch {
    Write-Host "REQUEST FAILED: $_"
}
