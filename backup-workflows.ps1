# backup-workflows.ps1
# Script to export all workflows from running n8n container and split them for git tracking

$containerId = (docker ps --filter "name=n8n" --format "{{.ID}}")
if (-not $containerId) {
    Write-Host "Error: No running n8n container found." -ForegroundColor Red
    exit 1
}

Write-Host "Found n8n container with ID: $containerId" -ForegroundColor Green

# 1. Run export inside the container
docker exec $containerId n8n export:workflow --all --output=/home/node/exported-workflows.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to export workflows inside the container." -ForegroundColor Red
    exit 1
}

# 2. Ensure workflows directory exists on host
if (-not (Test-Path ./workflows)) {
    New-Item -ItemType Directory -Path ./workflows | Out-Null
}

# 3. Copy to host temporary file
docker cp "${containerId}:/home/node/exported-workflows.json" ./workflows_temp.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to copy exported workflows from container." -ForegroundColor Red
    exit 1
}

# 4. Split into individual files using PowerShell
$workflowsJson = Get-Content -Raw -Path ./workflows_temp.json
$workflows = ConvertFrom-Json $workflowsJson

# Delete old json files to remove deleted workflows
if (Test-Path ./workflows/*.json) {
    Get-ChildItem ./workflows/*.json | Remove-Item
}

foreach ($w in $workflows) {
    # Sanitize name for filename
    $safeName = $w.name -replace '[\\\/:*?"<>|]', '_'
    $wJson = ConvertTo-Json $w -Depth 100
    $fullPath = Resolve-Path ./workflows
    [System.IO.File]::WriteAllText("${fullPath}/${safeName}.json", $wJson, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Exported workflow: ${safeName}.json" -ForegroundColor Cyan
}

# Remove temporary file
Remove-Item ./workflows_temp.json

Write-Host "Workflows successfully backed up to ./workflows/ !" -ForegroundColor Green
