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
    exit 1
}

# Function to check if a Windows feature is enabled
function Test-WindowsFeature {
    param([string]$FeatureName)
    try {
        $feature = Get-WindowsOptionalFeature -Online -FeatureName $FeatureName -ErrorAction SilentlyContinue
        return $feature -and $feature.State -eq "Enabled"
    } catch {
        return $false
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = & node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check IIS
if (Test-WindowsFeature "IIS-WebServerRole") {
    Write-Host "✓ IIS is enabled" -ForegroundColor Green
} else {
    Write-Host "✗ IIS is not enabled. Enabling IIS..." -ForegroundColor Yellow
    try {
        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirection, IIS-ApplicationDevelopment, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole -All
        Write-Host "✓ IIS enabled" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to enable IIS: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Check if iisnode is installed
try {
    $iisnodeHandler = Get-WebHandler -Name "*iisnode*" -ErrorAction SilentlyContinue
    if ($iisnodeHandler) {
        Write-Host "✓ iisnode is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ iisnode not found. Please install iisnode from:" -ForegroundColor Yellow
        Write-Host "  https://github.com/Azure/iisnode/releases" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check iisnode installation" -ForegroundColor Yellow
}

Write-Host ""

# Stop existing site if it exists
Write-Host "Stopping existing site..." -ForegroundColor Yellow
try {
    $existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
    if ($existingSite) {
        Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
        Write-Host "✓ Site stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ Site doesn't exist yet" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ Site not running or doesn't exist" -ForegroundColor Blue
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
try {
    Set-Location $SourcePath
    if (Test-Path "package.json") {
        Write-Host "Installing dependencies..."
        & npm install --production 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Building frontend..."
            & npm run build 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Build completed" -ForegroundColor Green
            } else {
                Write-Host "⚠ Build failed, continuing with existing files" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ npm install failed, continuing with existing files" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ No package.json found, skipping build" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Build process encountered errors, continuing..." -ForegroundColor Yellow
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
} catch {
    Write-Host "✗ Failed to prepare directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Copy files to target
Write-Host "Copying application files..." -ForegroundColor Yellow
try {
    $excludePatterns = @('node_modules', '.git', 'logs', '*.log', 'tmp', '.env')
    
    # Copy all files except excluded patterns
    robocopy $SourcePath $TargetPath /E /XD node_modules .git logs tmp /XF *.log .env /NFL /NDL /NJH /NJS
    
    # Ensure required files exist
    if (Test-Path "$SourcePath\server\index.js") {
        Copy-Item "$SourcePath\server\index.js" "$TargetPath\server\" -Force
    }
    if (Test-Path "$SourcePath\web.config") {
        Copy-Item "$SourcePath\web.config" "$TargetPath\" -Force
    }
    if (Test-Path "$SourcePath\package.json") {
        Copy-Item "$SourcePath\package.json" "$TargetPath\" -Force
    }
    
    Write-Host "✓ Files copied" -ForegroundColor Green
} catch {
    Write-Host "✗ Error copying files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install production dependencies in target
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
try {
    Set-Location $TargetPath
    if (Test-Path "package.json") {
        & npm install --only=production 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Production dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "⚠ Some dependencies may not have installed correctly" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠ Error installing dependencies: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Set permissions
Write-Host "Setting folder permissions..." -ForegroundColor Yellow
try {
    & icacls $TargetPath /grant IIS_IUSRS:`(OI`)`(CI`)F /T /Q 2>$null
    & icacls $TargetPath /grant "IIS AppPool\DefaultAppPool":`(OI`)`(CI`)F /T /Q 2>$null
    Write-Host "✓ Permissions set" -ForegroundColor Green
} catch {
    Write-Host "⚠ Error setting permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create or update IIS site
Write-Host "Configuring IIS site..." -ForegroundColor Yellow
try {
    # Remove existing site if it exists
    $existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
    if ($existingSite) {
        Remove-Website -Name $SiteName
        Write-Host "Removed existing site" -ForegroundColor Blue
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
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name processModel.loadUserProfile -Value True
    Set-ItemProperty -Path "IIS:\AppPools\DefaultAppPool" -Name managedRuntimeVersion -Value ""
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
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API health check passed" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  Database: $($content.database)" -ForegroundColor Gray
        Write-Host "  Environment: $($content.environment)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ API health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Check logs in: $TargetPath\logs\" -ForegroundColor Blue
    Write-Host "Check IIS logs in: C:\inetpub\logs\LogFiles\" -ForegroundColor Blue
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