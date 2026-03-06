# Try accessing UCM6308 via different methods
Write-Host "Trying HTTP on port 80..."
Invoke-RestMethod -Uri "http://192.168.1.148" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
Write-Host "Trying HTTPS on port 443..."
Invoke-RestMethod -Uri "https://192.168.1.148" -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-String
Write-Host "Done"