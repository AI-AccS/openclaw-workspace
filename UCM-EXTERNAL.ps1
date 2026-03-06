# Test via external IP
Write-Host "Testing external BT IP 81.137.249.200..."

$externalIp = "81.137.249.200"
if (Test-Connection -ComputerName $externalIp -Count 1 -Quiet) {
    Write-Host "External IP reachable"
} else {
    Write-Host "External IP NOT reachable"
}

# Try HTTP on external port 8080
try {
    $response = Invoke-WebRequest -Uri "http://$externalIp:8080" -TimeoutSec 5
    Write-Host "Port 8080 OPEN"
} catch {
    Write-Host "Port 8080 BLOCKED"
}
