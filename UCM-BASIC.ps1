# UCM6308 Port Test
Write-Host "Testing ports on 192.168.1.148..."

# Use a simple TCP test for port 80
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $iPEndPoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Parse("192.168.1.148"), 80)
    $tcp.ConnectAsync($iPEndPoint).Wait(5000)
    if ($tcp.Connected) {
        Write-Host "Port 80: OPEN"
    }
    $tcp.Close()
} catch {
    Write-Host "Port 80: CLOSED or TIMEOUT"
}

# Test port 8080
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $iPEndPoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Parse("192.168.1.148"), 8080)
    $tcp.ConnectAsync($iPEndPoint).Wait(5000)
    if ($tcp.Connected) {
        Write-Host "Port 8080: OPEN"
    }
    $tcp.Close()
} catch {
    Write-Host "Port 8080: CLOSED or TIMEOUT"
}

# Test port 5060 (SIP)
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $iPEndPoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Parse("192.168.1.148"), 5060)
    $tcp.ConnectAsync($iPEndPoint).Wait(5000)
    if ($tcp.Connected) {
        Write-Host "Port 5060: OPEN"
    }
    $tcp.Close()
} catch {
    Write-Host "Port 5060: CLOSED or TIMEOUT"
}
