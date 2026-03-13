$ErrorActionPreference = 'Stop'

$taskName = 'SpeakAgainAutoSync'

function Get-ResultMessage([int]$code) {
  switch ($code) {
    0 { 'Success' }
    267009 { 'Task is currently running' }
    2147942402 { 'File not found / action path invalid' }
    2147943726 { 'Logon failure: unknown user or bad password' }
    2147750687 { 'Task has not run yet' }
    default { "Code $code" }
  }
}

try {
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
  $info = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction Stop

  Write-Host "TaskName: $($task.TaskName)"
  Write-Host "State: $($task.State)"
  Write-Host "Enabled: $($task.Settings.Enabled)"
  Write-Host "LastRunTime: $($info.LastRunTime)"
  Write-Host "NextRunTime: $($info.NextRunTime)"
  Write-Host "LastTaskResult: $($info.LastTaskResult) ($(Get-ResultMessage -code $info.LastTaskResult))"
}
catch {
  Write-Host "TaskName: $taskName"
  Write-Host "Status: Not found"
  Write-Host "Hint: Open VS Code as Administrator, then run: npm run sync:task:register"
}
