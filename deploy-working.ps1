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
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-NOT $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeFound = $false
try {
    $nodeVersion = & node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
        $nodeFound = $true
    }
}
catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not $nodeFound) {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check IIS
try {
    $iisFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -ErrorAction SilentlyContinue
    if ($iisFeature -and $iisFeature.State -eq "Enabled") {
        Write-Host "✓ IIS is enabled" -ForegroundColor Green
    }
    else {
        Write-Host "✗ IIS is not enabled. Please enable IIS first." -ForegroundColor Red
        Write-Host "Run: Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "⚠ Could not check IIS status" -ForegroundColor Yellow
}

Write-Host ""

# Stop existing site if it exists
Write-Host "Stopping existing site..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    $existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
    if ($existingSite) {
        Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
        Write-Host "✓ Site stopped" -ForegroundColor Green
    }
    else {
        Write-Host "ℹ Site doesn't exist yet" -ForegroundColor Blue
    }
}
catch {
    Write-Host "ℹ No existing site to stop" -ForegroundColor Blue
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
$originalLocation = Get-Location
try {
    Set-Location $SourcePath
    if (Test-Path "package.json") {
        Write-Host "Installing dependencies..."
        $installResult = & npm install --production 2>&1
        
        Write-Host "Building frontend..."
        $buildResult = & npm run build 2>&1
        
        Write-Host "✓ Build process completed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ No package.json found, skipping build" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠ Build process encountered errors, continuing..." -ForegroundColor Yellow
}
finally {
    Set-Location $originalLocation
}

# Create target directory
Write-Host "Preparing deployment directory..." -ForegroundColor Yellow
try {
    if (Test-Path $TargetPath) {
        Write-Host "Removing existing files..."
        Remove-Item $TargetPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    Write-Host "✓ Directory prepared" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to prepare directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Copy files to target
Write-Host "Copying application files..." -ForegroundColor Yellow
try {
    # Use robocopy for reliable file copying
    $robocopyArgs = @(
        $SourcePath,
        $TargetPath,
        "/E",
        "/XD", "node_modules", ".git", "logs", "tmp",
        "/XF", "*.log", ".env", "deploy*.ps1", "deploy*.bat",
        "/NFL", "/NDL", "/NJH", "/NJS"
    )
    
    & robocopy @robocopyArgs | Out-Null
    
    # Ensure critical files are copied
    if (Test-Path "$SourcePath\server\index.js") {
        New-Item -ItemType Directory -Path "$TargetPath\server" -Force | Out-Null
        Copy-Item "$SourcePath\server\index.js" "$TargetPath\server\" -Force
    }
    
    if (Test-Path "$SourcePath\web.config") {
        Copy-Item "$SourcePath\web.config" "$TargetPath\" -Force
    }
    
    if (Test-Path "$SourcePath\package.json") {
        Copy-Item "$SourcePath\package.json" "$TargetPath\" -Force
    }
    
    Write-Host "✓ Files copied" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error copying files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install production dependencies in target
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
try {
    Set-Location $TargetPath
    if (Test-Path "package.json") {
        & npm install --only=production 2>&1 | Out-Null
        Write-Host "✓ Production dependencies installed" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠ Error installing dependencies" -ForegroundColor Yellow
}
finally {
    Set-Location $originalLocation
}

# Set permissions
Write-Host "Setting folder permissions..." -ForegroundColor Yellow
try {
    & icacls $TargetPath /grant "IIS_IUSRS:(OI)(CI)F" /T /Q 2>$null
    & icacls $TargetPath /grant "IIS AppPool\DefaultAppPool:(OI)(CI)F" /T /Q 2>$null
    Write-Host "✓ Permissions set" -ForegroundColor Green
}
catch {
    Write-Host "⚠ Error setting permissions" -ForegroundColor Yellow
}

# Create or update IIS site
Write-Host "Configuring IIS site..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration
    
    # Remove existing site if it exists
    $existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
    if ($existingSite) {
        Remove-Website -Name $SiteName
        Write-Host "Removed existing site" -ForegroundColor Blue
    }
    
    # Create new site
    New-Website -Name $SiteName -PhysicalPath $TargetPath -Port $Port
    Write-Host "✓ IIS site created" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creating IIS site: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configure application pool
Write-Host "Configuring application pool..." -ForegroundColor Yellow
try {
    Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name processModel.loadUserProfile -Value True
    Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name managedRuntimeVersion -Value ""
    Write-Host "✓ Application pool configured" -ForegroundColor Green
}
catch {
    Write-Host "⚠ Error configuring application pool" -ForegroundColor Yellow
}

# Start the site
Write-Host "Starting IIS site..." -ForegroundColor Yellow
try {
    Start-Website -Name $SiteName
    Write-Host "✓ Site started" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error starting site: $($_.Exception.Message)" -ForegroundColor Red
}

# Test the deployment
Write-Host ""
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API health check passed" -ForegroundColor Green
        try {
            $content = $response.Content | ConvertFrom-Json
            Write-Host "  Database: $($content.database)" -ForegroundColor Gray
            Write-Host "  Environment: $($content.environment)" -ForegroundColor Gray
        }
        catch {
            Write-Host "  Response received successfully" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "⚠ API health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
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

Read-Host "Press Enter to exit"