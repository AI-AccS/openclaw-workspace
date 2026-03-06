# Port Scan with netcat equivalent
Write-Host "Scanning 192.168.1.148 for open ports..."

$ports = @(80, 443, 5060, 5061, 8080, 8089, 8443)
foreach ($port in $ports) {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iPEndPoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Parse("192.168.1.148"), $port)
    
    try {
        $result = $tcp.ConnectAsync($iPEndPoint).Wait(2000)
        if ($tcp.Connected) {
            Write-Host "Port ${port}: OPEN"
            $tcp.Close()
        } else {
            Write-Host "Port ${port}: CLOSED"
        }
    } catch {
        Write-Host "Port ${port}: TIMEOUT"
    }
}