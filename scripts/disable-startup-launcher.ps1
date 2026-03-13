$ErrorActionPreference = 'Stop'

$launcher = Join-Path (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup') 'SpeakAgainAutoSync.cmd'
if (Test-Path $launcher) {
  Remove-Item $launcher -Force
  Write-Host "Removed startup launcher: $launcher"
} else {
  Write-Host 'No startup launcher found.'
}
