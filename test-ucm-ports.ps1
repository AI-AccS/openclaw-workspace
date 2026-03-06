# Simple TCP port test
$host = "192.168.1.148"

Write-Host "=== Testing UCM6308 Ports ===" -ForegroundColor Yellow
Write-Host ""

$ports = @(80, 443, 8080, 8089)

foreach ($port in $ports) {
    Write-Host "Testing port $port..." -NoNewline -ForegroundColor Cyan
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ConnectAsync($host, $port).Wait(5000)
        
        if ($tcpClient.Connected) {
            Write-Host " ✅ OPEN" -ForegroundColor Green
            $tcpClient.Close()
        } else {
            Write-Host " ❌ Not connected" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ CLOSED/REFUSED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Port Test Complete ===" -ForegroundColor Green