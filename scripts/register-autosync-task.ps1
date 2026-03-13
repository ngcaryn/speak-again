$ErrorActionPreference = 'Stop'

$taskName = 'SpeakAgainAutoSync'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$scriptPath = Join-Path $repoRoot 'scripts\auto-sync.ps1'

if (-not (Test-Path $scriptPath)) {
  Write-Error "Missing script: $scriptPath"
  exit 1
}

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Error 'Run this command in an elevated (Administrator) PowerShell/VS Code session.'
  exit 1
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"$scriptPath\""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description 'Auto-sync Speak Again git repo on login' -Force | Out-Null

Write-Host "Scheduled task '$taskName' is registered."
Write-Host "Run now (optional): schtasks /Run /TN $taskName"
