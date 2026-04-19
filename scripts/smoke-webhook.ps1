param(
  [string]$Secret = $env:GITHUB_WEBHOOK_SECRET,
  [string]$RepoFullName = "owner/repo",
  [int]$PrNumber = 1,
  [string]$HeadSha = "HEAD_SHA",
  [int]$InstallationId = 0,
  [string]$ActorLogin = "smoke-user",
  [string]$Url = ""
)

if (-not $Url) {
  $baseUrl = if ($env:API_URL) { $env:API_URL } elseif ($env:DEVPILOT_API_URL) { $env:DEVPILOT_API_URL } else { "http://localhost:4000" }
  $Url = "$baseUrl/api/webhooks/github"
}

if (-not $Secret) {
  Write-Error "Set GITHUB_WEBHOOK_SECRET or pass -Secret"
  exit 1
}

$parts = $RepoFullName.Split("/")
if ($parts.Count -ne 2) {
  Write-Error "Repo full name must be owner/repo"
  exit 1
}

$deliveryId = [guid]::NewGuid().ToString()

$payloadObj = @{
  action       = "opened"
  pull_request = @{ number = $PrNumber; head = @{ sha = $HeadSha } }
  repository   = @{ id = 1; full_name = $RepoFullName; name = $parts[1]; owner = @{ login = $parts[0] } }
  installation = @{ id = $InstallationId }
  sender       = @{ login = $ActorLogin }
}

$payload = $payloadObj | ConvertTo-Json -Depth 6
$rawBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
$secretBytes = [System.Text.Encoding]::UTF8.GetBytes($Secret)
$hmac = [System.Security.Cryptography.HMACSHA256]::new($secretBytes)
$signatureBytes = $hmac.ComputeHash($rawBytes)
$signature = "sha256=" + ([BitConverter]::ToString($signatureBytes) -replace '-', '').ToLower()

$response = Invoke-RestMethod -Uri $Url -Method Post -Headers @{
    "X-GitHub-Event"     = "pull_request"
    "X-Hub-Signature-256" = $signature
    "X-GitHub-Delivery"  = $deliveryId
    "Content-Type"       = "application/json"
  } -Body $payload -ErrorAction Stop

$response | ConvertTo-Json -Depth 8
