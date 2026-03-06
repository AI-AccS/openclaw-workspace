# UCM6308 API test
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$cookies = New-Object System.Net.CookieContainer
Write-Host "=== UCM6308 Login + API Test ==="

# Step 1: Login
Write-Host "`nStep 1: Sending login..."
$req = [System.Net.HttpWebRequest]::Create("http://192.168.1.148/cgi-bin/api.cgi")
$req.Method = "POST"
$req.ContentType = "application/x-www-form-urlencoded"
$req.CookieContainer = $cookies
$req.Timeout = 5000

$formData = "username=Brigain&password=Jen%21fer1"
$formBytes = [System.Text.Encoding]::UTF8.GetBytes($formData)
$req.ContentLength = $formBytes.Length
$req.GetRequestStream().Write($formBytes, 0, $formBytes.Length)

try {
    $resp = $req.GetResponse()
    Write-Host "Login status: $($resp.StatusCode)"
} catch {
    Write-Host "Login sent - continuing anyway"
}

# Step 2: API call
Write-Host "`nStep 2: Fetching SIP accounts..."
$req2 = [System.Net.HttpWebRequest]::Create("http://192.168.1.148/rest/sipaccount/list")
$req2.Method = "GET"
$req2.CookieContainer = $cookies
$req2.Timeout = 5000

try {
    $resp2 = $req2.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp2.GetResponseStream())
    $result = $reader.ReadToEnd()
    Write-Host "`nAPI RESULT:"
    Write-Host $result.Substring(0, [Math]::Min(1000, $result.Length))
} catch {
    Write-Host "API call failed - $_"
}

Write-Host "`nDone."