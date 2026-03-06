# UCM6308 Challenge/Response Auth Test
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "Step 1: Get Challenge"
try {
    $challengeUrl = "http://${ucmHost}/api?action=challenge" + [char]38 + "user=${username}"
    Write-Host "URL: ${challengeUrl}"
    
    $client = New-Object System.Net.WebClient
    $challengeResponse = $client.DownloadString($challengeUrl)
    Write-Host "Challenge response: ${challengeResponse}"
    
    if ($challengeResponse -match '"challenge":\s*"([^"]+)"') {
        $challenge = $matches[1]
        Write-Host "Challenge extracted: ${challenge}"
    } else {
        Write-Host "Could not extract challenge"
        exit
    }
} catch {
    Write-Host "Failed to get challenge: $_"
    exit
}

Write-Host "`nStep 2: Calculate Token"
$md5Pass = [System.Security.Cryptography.MD5]::Create()
$hashBytes = $md5Pass.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
$md5PasswordStr = [BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()
Write-Host "MD5 password: ${md5PasswordStr}"

$tokenInput = $md5PasswordStr + $challenge
Write-Host "Token input: ${tokenInput}"

$md5Token = [System.Security.Cryptography.MD5]::Create()
$tokenBytes = $md5Token.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($tokenInput))
$token = [BitConverter]::ToString($tokenBytes).Replace("-", "")
Write-Host "Final token (uppercase): ${token}"

# Also try lowercase version as backup
$tokenLower = $token.ToLower()
Write-Host "Token (lowercase): ${tokenLower}"

Write-Host "`nStep 3: Login"
try {
    $loginUrl = "http://${ucmHost}/api?action=login" + [char]38 + "user=${username}" + [char]38 + "token=${token}"
    Write-Host "Login URL: ${loginUrl}"
    
    $req = [System.Net.HttpWebRequest]::Create($loginUrl)
    $cookies = New-Object System.Net.CookieContainer
    $req.CookieContainer = $cookies
    $resp = $req.GetResponse()
    Write-Host "Status: $($resp.StatusCode)"
    
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $loginResponse = $reader.ReadToEnd()
    Write-Host "Response: ${loginResponse}"
    
    if ($loginResponse -match '"status"\s*:\s*(\d+)') {
        $status = [int]$matches[1]
        if ($status -eq 0) { Write-Host "Login successful!" }
        else { Write-Host "Failed status ${status}" }
    }
} catch {
    Write-Host "Login error: $_"
}

Write-Host "`nDone"