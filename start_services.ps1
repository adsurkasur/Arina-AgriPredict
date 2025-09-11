# AgriPredict Service Manager (PowerShell)
# Run both frontend and backend with dynamic port detection

param(
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 7860,
    [string]$Hostname = "localhost",
    [switch]$FrontendOnly,
    [switch]$BackendOnly
)

Write-Host "🚀 AgriPredict Service Manager (PowerShell)" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

# Build arguments for Python script
$pyArgs = @()

if ($FrontendOnly) { $pyArgs += "--frontend-only" }
if ($BackendOnly) { $pyArgs += "--backend-only" }
if ($FrontendPort -ne 3000) { $pyArgs += "--frontend-port"; $pyArgs += $FrontendPort }
if ($BackendPort -ne 7860) { $pyArgs += "--backend-port"; $pyArgs += $BackendPort }
if ($Hostname -ne "localhost") { $pyArgs += "--hostname"; $pyArgs += $Hostname }

# Run the Python service manager
& python start_services.py @pyArgs
