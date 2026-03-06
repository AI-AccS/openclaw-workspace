# Try both uppercase and lowercase tokens
Add-Type -AssemblyName System
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$ucmHost = "192.168.1.148"
$username = "cdrapi"
$password = "cdrapi123"

Write-Host "Getting challenge..."
$challengeUrl = "http://${ucmHost}/api?action=challenge" + [char]38 + "user=${username}"
$client = New-Object System.Net.WebClient
$challengeResponse = $client.DownloadString($challengeUrl)
if ($challengeResponse -match '"challenge":\s*"([^"]+)"') {
    $challenge = $matches[1]
    Write-Host "Challenge: ${challenge}"
}

# Calculate MD5 of password (uppercase)
$md5Pass = [System.Security.Cryptography.MD5]::Create()
$hashBytes = $md5Pass.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
$md5PasswordStr = [BitConverter]::ToString($hashBytes).Replace("-", "")

# Token input
$tokenInput = $md5PasswordStr + $challenge
Write-Host "MD5(password): ${md5PasswordStr}"
Write-Host "Token input (MD5+challenge): ${tokenInput}"

# Calculate final token (uppercase)
$md5Token = [System.Security.Cryptography.MD5]::Create()
$tokenBytes = $md5Token.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($tokenInput))
$tokenUpper = [BitConverter]::ToString($tokenBytes).Replace("-", "")
$tokenLower = $tokenUpper.ToLower()

Write-Host "`nTrying UPPERCASE token: ${tokenUpper}"
$loginUrl = "http://${ucmHost}/api?action=login" + [char]38 + "user=${username}" + [char]38 + "token=${tokenUpper}"
$req1 = [System.Net.HttpWebRequest]::Create($loginUrl)
$req1.Method = "GET"
$resp1 = $req1.GetResponse()
$reader1 = New-Object System.IO.StreamReader($resp1.GetResponseStream())
$res1 = $reader1.ReadToEnd()
Write-Host "Response: ${res1}" -ForegroundColor "Gray"

Write-Host "`nTrying LOWERCASE token: ${tokenLower}"
$loginUrl2 = "http://${ucmHost}/api?action=login" + [char]38 + "user=${username}" + [char]38 + "token=${tokenLower}"
$req2 = [System.Net.HttpWebRequest]::Create($loginUrl2)
$req2.Method = "GET"
$resp2 = $req2.GetResponse()
$reader2 = New-Object System.IO.StreamReader($resp2.GetResponseStream())
$res2 = $reader2.ReadToEnd()
Write-Host "Response: ${res2}" -ForegroundColor "Gray"

# Check if either succeeded
if ($res1 -match '"status":\s*0') { Write-Host "`n✓ UPPERCASE WORKED!" }
if ($res2 -match '"status":\s*0') { Write-Host "`n✓ LOWERCASE WORKED!" }