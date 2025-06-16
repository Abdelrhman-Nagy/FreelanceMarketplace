# PowerShell Deployment Script for Freelancing Platform
# Run as Administrator

param(
    [string]$SiteName = "FreelancingPlatform",
    [string]$SourcePath = ".",
    [string]$TargetPath = "C:\inetpub\wwwroot\freelancing-platform",
    [int]$Port = 80
)

Write-Host "=== Freelancing Platform Deployment Script ===" -ForegroundColor Cyan
Write-Host "Site Name: $SiteName" -ForegroundColor White
Write-Host "Source Path: $SourcePath" -ForegroundColor White
Write-Host "Target Path: $TargetPath" -ForegroundColor White
Write-Host "Port: $Port" -ForegroundColor White
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if a Windows feature is enabled
function Test-WindowsFeature {
    param([string]$FeatureName)
    $feature = Get-WindowsOptionalFeature -Online -FeatureName $FeatureName -ErrorAction SilentlyContinue
    return $feature -and $feature.State -eq "Enabled"
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check IIS
if (Test-WindowsFeature "IIS-WebServerRole") {
    Write-Host "✓ IIS is enabled" -ForegroundColor Green
} else {
    Write-Host "✗ IIS is not enabled. Enabling IIS..." -ForegroundColor Yellow
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirection, IIS-ApplicationDevelopment, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole -All
    Write-Host "✓ IIS enabled" -ForegroundColor Green
}

# Check if iisnode is installed
$iisnodeHandler = Get-WebHandler -Name "iisnode*" -ErrorAction SilentlyContinue
if ($iisnodeHandler) {
    Write-Host "✓ iisnode is installed" -ForegroundColor Green
} else {
    Write-Host "⚠ iisnode not found. Please install iisnode from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/Azure/iisnode/releases" -ForegroundColor Yellow
}

Write-Host ""

# Stop existing site if it exists
Write-Host "Stopping existing site..." -ForegroundColor Yellow
try {
    Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
    Write-Host "✓ Site stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ Site not running or doesn't exist" -ForegroundColor Blue
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
try {
    Set-Location $SourcePath
    if (Test-Path "package.json") {
        Write-Host "Installing dependencies..."
        npm install --production
        Write-Host "Building frontend..."
        npm run build
        Write-Host "✓ Build completed" -ForegroundColor Green
    } else {
        Write-Host "⚠ No package.json found, skipping build" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create target directory
Write-Host "Preparing deployment directory..." -ForegroundColor Yellow
if (Test-Path $TargetPath) {
    Write-Host "Removing existing files..."
    Remove-Item $TargetPath -Recurse -Force
}
New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
Write-Host "✓ Directory prepared" -ForegroundColor Green

# Copy files to target
Write-Host "Copying application files..." -ForegroundColor Yellow
$excludePatterns = @('node_modules', '.git', 'logs', '*.log', 'tmp')
Get-ChildItem -Path $SourcePath -Recurse | Where-Object {
    $relativePath = $_.FullName.Substring($SourcePath.Length + 1)
    $exclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | Copy-Item -Destination {
    $dest = $_.FullName.Replace($SourcePath, $TargetPath)
    $destDir = Split-Path $dest -Parent
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    $dest
} -Force

Write-Host "✓ Files copied" -ForegroundColor Green

# Install production dependencies in target
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
Set-Location $TargetPath
if (Test-Path "package.json") {
    npm install --only=production
    Write-Host "✓ Production dependencies installed" -ForegroundColor Green
}

# Set permissions
Write-Host "Setting folder permissions..." -ForegroundColor Yellow
try {
    icacls $TargetPath /grant IIS_IUSRS:`(OI`)`(CI`)F /T /Q
    icacls $TargetPath /grant "IIS AppPool\DefaultAppPool":`(OI`)`(CI`)F /T /Q
    Write-Host "✓ Permissions set" -ForegroundColor Green
} catch {
    Write-Host "⚠ Error setting permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create or update IIS site
Write-Host "Configuring IIS site..." -ForegroundColor Yellow
try {
    # Remove existing site if it exists
    if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $SiteName
    }
    
    # Create new site
    New-Website -Name $SiteName -PhysicalPath $TargetPath -Port $Port
    Write-Host "✓ IIS site created" -ForegroundColor Green
} catch {
    Write-Host "✗ Error creating IIS site: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configure application pool
Write-Host "Configuring application pool..." -ForegroundColor Yellow
try {
    $appPool = Get-IISAppPool -Name "DefaultAppPool"
    $appPool.ManagedRuntimeVersion = ""
    $appPool.ProcessModel.LoadUserProfile = $true
    $appPool | Set-IISAppPool
    Write-Host "✓ Application pool configured" -ForegroundColor Green
} catch {
    Write-Host "⚠ Error configuring application pool: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Start the site
Write-Host "Starting IIS site..." -ForegroundColor Yellow
try {
    Start-Website -Name $SiteName
    Write-Host "✓ Site started" -ForegroundColor Green
} catch {
    Write-Host "✗ Error starting site: $($_.Exception.Message)" -ForegroundColor Red
}

# Test the deployment
Write-Host ""
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API health check passed" -ForegroundColor Green
    } else {
        Write-Host "⚠ API health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Check logs in: $TargetPath\logs\" -ForegroundColor Blue
}

# Final summary
Write-Host ""
Write-Host "=== Deployment Summary ===" -ForegroundColor Cyan
Write-Host "Site Name: $SiteName" -ForegroundColor White
Write-Host "URL: http://localhost:$Port" -ForegroundColor White
Write-Host "Physical Path: $TargetPath" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:$Port in your browser" -ForegroundColor White
Write-Host "2. Check API endpoints:" -ForegroundColor White
Write-Host "   - http://localhost:$Port/api/health" -ForegroundColor Gray
Write-Host "   - http://localhost:$Port/api/jobs" -ForegroundColor Gray
Write-Host "3. Monitor logs in: $TargetPath\logs\" -ForegroundColor White
Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green