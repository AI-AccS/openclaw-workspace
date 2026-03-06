# Check local network config
Write-Host "=== Local Network Configuration ==="
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.AddressState -eq 'Preferred'} | Select-Object IPAddress, InterfaceAlias, PrefixLength