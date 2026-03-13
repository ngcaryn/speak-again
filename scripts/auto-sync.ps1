$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
  Write-Error "Not inside a git repository: $repoRoot"
  exit 1
}

function Ensure-GitIdentity {
  $name = git config user.name
  $email = git config user.email

  if (-not $name -or -not $email) {
    $lastAuthor = git log -1 --pretty=format:'%an|%ae' 2>$null
    if ($lastAuthor -and $lastAuthor.Contains('|')) {
      $parts = $lastAuthor.Split('|', 2)
      git config user.name $parts[0] | Out-Null
      git config user.email $parts[1] | Out-Null
      Write-Host "Configured local git identity from latest commit author: $($parts[0]) <$($parts[1])>"
    } else {
      Write-Error "Git identity missing. Set with: git config user.name \"Your Name\" and git config user.email \"you@example.com\""
      exit 1
    }
  }
}

function Invoke-Sync {
  try {
    Set-Location $repoRoot

    $pending = git status --porcelain
    if (-not $pending) {
      return
    }

    git add -A | Out-Null
    $pendingAfterAdd = git status --porcelain
    if (-not $pendingAfterAdd) {
      return
    }

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    git commit -m "chore(sync): auto-sync $timestamp" | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Commit failed."
      return
    }

    $branch = git branch --show-current
    if (-not $branch) { $branch = 'main' }

    git pull --rebase origin $branch
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Pull/rebase failed. Resolve conflicts manually."
      git rebase --abort 2>$null | Out-Null
      return
    }

    git push origin $branch
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Push failed. Check auth/network and retry."
      return
    }

    Write-Host "Synced successfully at $(Get-Date -Format 'HH:mm:ss')."
  }
  catch {
    Write-Warning "Auto-sync error: $($_.Exception.Message)"
  }
}

Ensure-GitIdentity

Write-Host "Auto-sync loop started for $repoRoot"
Write-Host "Checks every 5 seconds. Press Ctrl+C to stop."

while ($true) {
  Invoke-Sync
  Start-Sleep -Seconds 5
}
