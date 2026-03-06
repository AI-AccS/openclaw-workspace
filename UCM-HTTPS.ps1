# Test on HTTPS port 8089
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "Getting challenge on HTTPS 8089"
$challengeUrl = "https://${ucmHost}:8089/api?action=challenge" + [char]38 + "user=${username}"
$client = New-Object System.Net.WebClient
try {
    $challengeResponse = $client.DownloadString($challengeUrl)
    Write-Host "Challenge response: ${challengeResponse}"
    if ($challengeResponse -match 'challenge":\s*"([^"]+)"') {
        $challenge = $matches[1]
        Write-Host "Challenge: ${challenge}"

        # MD5 of password
        $md5Pass = [System.Security.Cryptography.MD5]::Create()
        $hashBytes = $md5Pass.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
        $md5PasswordStr = ([BitConverter]::ToString($hashBytes).Replace("-", "")).ToLower()
        Write-Host "MD5 password: ${md5PasswordStr}"

        # Token
        $tokenInput = $md5PasswordStr + $challenge
        Write-Host "Token input: ${tokenInput}"
        $md5Token = [System.Security.Cryptography.MD5]::Create()
        $tokenBytes = $md5Token.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($tokenInput))
        $token = ([BitConverter]::ToString($tokenBytes).Replace("-", "")).ToLower()
        Write-Host "Final token: ${token}"

        # Login
        Write-Host "`nTrying login"
        $loginUrl = "https://${ucmHost}:8089/api?action=login" + [char]38 + "user=${username}" + [char]38 + "token=${token}"
        $req = [System.Net.HttpWebRequest]::Create($loginUrl)
        $cookies = New-Object System.Net.CookieContainer
        $req.CookieContainer = $cookies
        $resp = $req.GetResponse()
        Write-Host "Status: $($resp.StatusCode)"
        
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $res = $reader.ReadToEnd()
        Write-Host "Response: ${res}"

        if ($res -match '"status":\s*0') {
            Write-Host "`nLogin SUCCESSFUL"
        } else {
            Write-Host "`nLogin failed"
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}