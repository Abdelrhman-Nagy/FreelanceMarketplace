# IIS Deployment for Hapi.js Freelancing Platform
# Run as Administrator

param(
    [string]$SiteName = "FreelancingPlatform",
    [string]$TargetPath = "C:\inetpub\wwwroot\freelancing-platform",
    [int]$Port = 80
)

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Deploying Hapi.js Freelancing Platform" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check Administrator privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Must run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and 'Run as administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Site: $SiteName" -ForegroundColor Yellow
Write-Host "Target: $TargetPath" -ForegroundColor Yellow
Write-Host "Port: $Port" -ForegroundColor Yellow
Write-Host ""

# Stop IIS
Write-Host "Stopping IIS..." -ForegroundColor Yellow
try {
    iisreset /stop
    Write-Host "IIS stopped successfully" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not stop IIS" -ForegroundColor Yellow
}

# Remove old deployment
Write-Host "Removing old deployment..." -ForegroundColor Yellow
if (Test-Path $TargetPath) {
    Remove-Item -Path $TargetPath -Recurse -Force
    Write-Host "Old deployment removed" -ForegroundColor Green
}

# Create deployment directory
Write-Host "Creating deployment directory..." -ForegroundColor Yellow
New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null

# Copy files
Write-Host "Copying application files..." -ForegroundColor Yellow
try {
    Copy-Item -Path ".\*" -Destination $TargetPath -Recurse -Force
    Write-Host "Files copied successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to copy files - $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Set permissions
Write-Host "Setting IIS permissions..." -ForegroundColor Yellow
icacls $TargetPath /grant IIS_IUSRS:`(OI`)`(CI`)F /T

# Import IIS module
Write-Host "Configuring IIS..." -ForegroundColor Yellow
Import-Module WebAdministration

# Remove existing site if present
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Host "Removing existing website..." -ForegroundColor Yellow
    Remove-Website -Name $SiteName
}

# Remove existing app pool if present
if (Get-IISAppPool -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Host "Removing existing application pool..." -ForegroundColor Yellow
    Remove-IISAppPool -Name $SiteName
}

# Create application pool
Write-Host "Creating application pool..." -ForegroundColor Yellow
New-IISAppPool -Name $SiteName -Force
Set-IISAppPool -Name $SiteName -ProcessModel @{identityType='ApplicationPoolIdentity'} -ManagedRuntimeVersion ""
Write-Host "Application pool created" -ForegroundColor Green

# Create website
Write-Host "Creating IIS website..." -ForegroundColor Yellow
New-IISSite -Name $SiteName -PhysicalPath $TargetPath -Port $Port -ApplicationPool $SiteName
Write-Host "Website created" -ForegroundColor Green

# Start IIS
Write-Host "Starting IIS..." -ForegroundColor Yellow
iisreset /start
Write-Host "IIS started" -ForegroundColor Green

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test URLs:" -ForegroundColor Cyan
Write-Host "Main App: http://localhost/" -ForegroundColor White
Write-Host "API Health: http://localhost/api/health" -ForegroundColor White
Write-Host "Jobs API: http://localhost/api/jobs" -ForegroundColor White
Write-Host ""
Write-Host "Database: postgresql://app_user:Xman@123@localhost:5432/freelancing_platform" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"