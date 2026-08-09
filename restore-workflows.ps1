# restore-workflows.ps1
# Script to merge split workflows from git and import them into the running n8n container

$containerId = (docker ps --filter "name=n8n" --format "{{.ID}}")
if (-not $containerId) {
    Write-Host "Error: No running n8n container found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ./workflows)) {
    Write-Host "Error: No ./workflows folder found to restore from." -ForegroundColor Red
    exit 1
}

Write-Host "Found n8n container with ID: $containerId" -ForegroundColor Green

# 1. Merge files back into a single JSON array
$workflows = @()
$files = Get-ChildItem ./workflows/*.json
if ($files.Count -eq 0) {
    Write-Host "Warning: No workflows found in ./workflows/" -ForegroundColor Yellow
    exit 0
}

foreach ($file in $files) {
    $w = Get-Content -Raw -Path $file.FullName | ConvertFrom-Json
    $workflows += $w
    Write-Host "Merging: $($file.Name)" -ForegroundColor Cyan
}

$mergedJson = ConvertTo-Json $workflows -Depth 100
$fullPath = Resolve-Path ./workflows
[System.IO.File]::WriteAllText("${fullPath}/all_workflows.json", $mergedJson, (New-Object System.Text.UTF8Encoding($false)))

# 2. Copy the merged file to the container
docker cp ./workflows/all_workflows.json "${containerId}:/home/node/imported-workflows.json"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to copy workflows to container." -ForegroundColor Red
    Remove-Item ./workflows/all_workflows.json
    exit 1
}

# Remove temp file
Remove-Item ./workflows/all_workflows.json

# 3. Import workflows inside container
docker exec $containerId n8n import:workflow --input=/home/node/imported-workflows.json
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to import workflows in container." -ForegroundColor Red
    exit 1
}

Write-Host "Workflows successfully imported/restored into n8n!" -ForegroundColor Green
