param(
  [string]$ApiUrl = $(if ($env:API_URL) { $env:API_URL } elseif ($env:DEVPILOT_API_URL) { $env:DEVPILOT_API_URL } else { "http://localhost:4000" }),
  [string]$ApiToken = $env:API_TOKEN
)

if (-not $ApiToken) { throw "API_TOKEN is required" }
$headers = @{ Authorization = "Bearer $ApiToken" }

Write-Host "[smoke] checking /health" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$ApiUrl/health" -Headers $headers -Method Get | Out-Null

Write-Host "[smoke] listing jobs" -ForegroundColor Cyan
$jobs = Invoke-RestMethod -Uri "$ApiUrl/api/jobs" -Headers $headers -Method Get
$jobId = $jobs.data.jobs[0].id
if (-not $jobId) { throw "No jobs returned" }

Write-Host "[smoke] fetching job $jobId" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$ApiUrl/api/jobs/$jobId" -Headers $headers -Method Get | Out-Null

Write-Host "[smoke] checking workers" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$ApiUrl/api/workers" -Headers $headers -Method Get | Out-Null

Write-Host "[smoke] phase1 ok" -ForegroundColor Green
