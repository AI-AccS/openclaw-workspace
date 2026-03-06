# Quick Network Check
Write-Host "Quick network scan..."

$targets = @("192.168.1.1", "192.168.1.148", "192.168.1.254", "10.0.0.1", "172.16.0.1")

foreach ($ip in $targets) {
    if (Test-Connection -ComputerName $ip -Count 1 -Quiet -ErrorAction SilentlyContinue) {
        Write-Host "${ip}: REACHABLE"
    } else {
        Write-Host "${ip}: not reachable"
    }
}