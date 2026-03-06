# Simple UCM API test using basic auth header
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
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $result = $reader.ReadToEnd()
    Write-Host "SUCCESS!"
    Write-Host $result.Substring(0, [Math]::Min(1000, $result.Length))
} catch {
    Write-Host "FAILED: $_"
}