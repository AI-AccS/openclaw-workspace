# model-watchdog.ps1
# Runs every 5 minutes as a Windows Scheduled Task.
# Detects Anthropic rate limit cooldown and switches primary model to OpenAI.
# When cooldown clears, switches back to Claude (preferred model).
# No LLM involvement needed - runs at gateway/config level.

$logFile = "$env:USERPROFILE\.openclaw\workspace\memory\watchdog.log"
$stateFile = "$env:USERPROFILE\.openclaw\workspace\memory\watchdog-state.json"
$primaryModel = "anthropic/claude-sonnet-4-6"
$backupModel = "openai/gpt-4o"
$lastResortModel = "ollama/llama3.3:latest"

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts  $msg" | Add-Content -Path $logFile
}

function Get-State {
    if (Test-Path $stateFile) {
        return Get-Content $stateFile | ConvertFrom-Json
    }
    return @{ usingBackup = $false }
}

function Save-State($state) {
    $state | ConvertTo-Json | Set-Content $stateFile
}

try {
    $statusJson = & openclaw models status --json 2>$null | Where-Object { $_ -notmatch "Failed to discover" } | Out-String
    $status = $statusJson | ConvertFrom-Json

    $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $state = Get-State

    # Check if Anthropic is in cooldown
    $anthropicCooldown = $false
    $anthropicProfile = $status.auth.oauth.profiles | Where-Object { $_.provider -eq "anthropic" }

    # Also check auth-profiles.json directly for cooldownUntil
    $profilesFile = "$env:USERPROFILE\.openclaw\agents\main\agent\auth-profiles.json"
    if (Test-Path $profilesFile) {
        $profiles = Get-Content $profilesFile | ConvertFrom-Json
        $anthropicStats = $profiles.usageStats."anthropic:default"
        if ($anthropicStats -and $anthropicStats.cooldownUntil -and ($anthropicStats.cooldownUntil -gt $now)) {
            $anthropicCooldown = $true
            $cooldownSecsLeft = [math]::Round(($anthropicStats.cooldownUntil - $now) / 1000)
            Write-Log "Anthropic in cooldown for ${cooldownSecsLeft}s more"
        }
    }

    if ($anthropicCooldown -and -not $state.usingBackup) {
        # Switch to backup
        Write-Log "Rate limit detected — switching primary to $backupModel"
        & openclaw config set agents.defaults.model.primary $backupModel 2>$null
        & openclaw gateway restart 2>$null
        Save-State @{ usingBackup = $true; switchedAt = $now }
        Write-Log "Switched to $backupModel and restarted gateway"

    } elseif (-not $anthropicCooldown -and $state.usingBackup) {
        # Cooldown cleared — switch back to Claude
        Write-Log "Anthropic cooldown cleared — switching back to $primaryModel"
        & openclaw config set agents.defaults.model.primary $primaryModel 2>$null
        & openclaw gateway restart 2>$null
        Save-State @{ usingBackup = $false; restoredAt = $now }
        Write-Log "Restored to $primaryModel and restarted gateway"

    } else {
        Write-Log "OK — using $(if ($state.usingBackup) { $backupModel } else { $primaryModel })"
    }

} catch {
    Write-Log "ERROR: $_"
}
