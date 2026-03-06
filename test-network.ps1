# Network connectivity test
$targetIp = "192.168.1.148"

Write-Host "=== Testing Network Connectivity ===" -ForegroundColor Yellow
Write-Host "Target: $targetIp"
Write-Host ""

# Test 1: Ping
Write-Host "[TEST 1] PING" -ForegroundColor Cyan
try {
    $ping = New-Object System.Net.NetworkInformation.Ping
    $pingOptions = New-Object System.Net.NetworkInformation.PingOptions
    $pingOptions.DontFragment = $false
    $buffer = [byte[]](0..100)
    $reply = $ping.Send($targetIp, 5000, $buffer, $pingOptions)
    
    if ($reply.Status -eq "Success") {
        Write-Host "✅ PING SUCCESSFUL" -ForegroundColor Green
        Write-Host "   RoundTripTime: $($reply.RoundTripTime)ms"
        Write-Host "   TTL: $($reply.Options.Ttl)"
    } else {
        Write-Host "❌ PING FAILED: $($reply.Status)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PING ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Local network interface info
Write-Host "[TEST 2] LOCAL NETWORK CONFIGURATION" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.AddressState -eq "Preferred"} |
    Select-Object InterfaceAlias, IPAddress, PrefixLength | Format-Table

Write-Host ""

# Test 3: Try curl with http:// on port 80 (should work per MEMORY.md)
Write-Host "[TEST 3] HTTP GET via Invoke-WebRequest" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://$targetIp/" -Method Get -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ HTTP Response: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Content.Headers.ContentType)"
    Write-Host "   Content Length: $($response.Content.Length) bytes"
} catch {
    Write-Host "❌ HTTP FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green