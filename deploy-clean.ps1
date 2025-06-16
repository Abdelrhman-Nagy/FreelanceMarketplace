# Simple PowerShell Deployment Script
# Run as Administrator

param(
    [string]$SiteName = "FreelancingPlatform",
    [string]$TargetPath = "C:\inetpub\wwwroot\freelancing-platform",
    [int]$Port = 80
)

Write-Host "=== Deploying Freelancing Platform ===" -ForegroundColor Cyan

# Check Administrator privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Run as Administrator!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "ERROR: Node.js not found. Install from nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}
Write-Host "Node.js found" -ForegroundColor Green

# Stop existing site
Write-Host "Stopping existing site..." -ForegroundColor Yellow
Import-Module WebAdministration -ErrorAction SilentlyContinue
$site = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if ($site) {
    Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install --production
    npm run build
}

# Prepare target directory
Write-Host "Preparing target directory..." -ForegroundColor Yellow
if (Test-Path $TargetPath) {
    Remove-Item $TargetPath -Recurse -Force
}
New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null

# Copy files
Write-Host "Copying files..." -ForegroundColor Yellow
robocopy . $TargetPath /E /XD node_modules .git logs tmp /XF *.log .env deploy*.* /NFL /NDL /NJH /NJS

# Copy essential files
if (Test-Path "server\index.js") {
    New-Item -ItemType Directory -Path "$TargetPath\server" -Force | Out-Null
    Copy-Item "server\index.js" "$TargetPath\server\" -Force
}
if (Test-Path "web.config") {
    Copy-Item "web.config" "$TargetPath\" -Force
}
if (Test-Path "package.json") {
    Copy-Item "package.json" "$TargetPath\" -Force
}

# Install dependencies
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
Push-Location $TargetPath
npm install --only=production
Pop-Location

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
icacls $TargetPath /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls $TargetPath /grant "IIS AppPool\DefaultAppPool:(OI)(CI)F" /T /Q

# Configure IIS site
Write-Host "Configuring IIS site..." -ForegroundColor Yellow
if ($site) {
    Remove-Website -Name $SiteName
}
New-Website -Name $SiteName -PhysicalPath $TargetPath -Port $Port

# Configure application pool
Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name processModel.loadUserProfile -Value True
Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name managedRuntimeVersion -Value ""

# Start site
Write-Host "Starting site..." -ForegroundColor Yellow
Start-Website -Name $SiteName

# Test deployment
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$testUrl = "http://localhost:$Port/api/health"
$response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue

if ($response -and $response.StatusCode -eq 200) {
    Write-Host "SUCCESS: Site is running!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Site may not be responding correctly" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "Site URL: http://localhost:$Port" -ForegroundColor White
Write-Host "API Health: $testUrl" -ForegroundColor White
Write-Host "Path: $TargetPath" -ForegroundColor White

Read-Host "Press Enter to exit"