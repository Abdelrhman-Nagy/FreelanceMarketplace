# IIS Deployment Script for Freelancing Platform
# Production build with SQL Server integration

param(
    [string]$SiteName = "FreelancingPlatform",
    [string]$SitePath = "C:\inetpub\wwwroot\FreelancingPlatform",
    [string]$Port = 80
)

Write-Host "Deploying Freelancing Platform to IIS" -ForegroundColor Green
Write-Host "Site: $SiteName | Path: $SitePath | Port: $Port" -ForegroundColor Cyan

# Check Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Run as Administrator" -ForegroundColor Red
    exit 1
}

# Import WebAdministration
try {
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "✓ WebAdministration loaded" -ForegroundColor Green
} catch {
    Write-Host "✗ WebAdministration not available" -ForegroundColor Red
    exit 1
}

# Create site directory
Write-Host "Creating site directory..." -ForegroundColor Yellow
if (!(Test-Path $SitePath)) {
    New-Item -Path $SitePath -ItemType Directory -Force
}

# Copy files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item "*.js" $SitePath -Force
Copy-Item "*.json" $SitePath -Force
Copy-Item "*.yml" $SitePath -Force
Copy-Item "web.config" $SitePath -Force

# Copy server directory
if (Test-Path "server") {
    $serverDest = "$SitePath\server"
    if (!(Test-Path $serverDest)) { New-Item -Path $serverDest -ItemType Directory -Force }
    Copy-Item "server\*" $serverDest -Recurse -Force
}

# Copy public directory  
if (Test-Path "public") {
    $publicDest = "$SitePath\public"
    if (!(Test-Path $publicDest)) { New-Item -Path $publicDest -ItemType Directory -Force }
    Copy-Item "public\*" $publicDest -Recurse -Force
}

Write-Host "✓ Files copied" -ForegroundColor Green

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
try {
    $acl = Get-Acl $SitePath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $SitePath -AclObject $acl
    Write-Host "✓ Permissions set" -ForegroundColor Green
} catch {
    Write-Host "! Permission warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location $SitePath
try {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install --production --no-audit
        Write-Host "✓ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "! npm not found - install Node.js" -ForegroundColor Yellow
    }
} catch {
    Write-Host "! npm install failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Remove existing site
Write-Host "Configuring IIS..." -ForegroundColor Yellow
try {
    if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $SiteName
    }
} catch { }

# Create website
try {
    New-Website -Name $SiteName -Port $Port -PhysicalPath $SitePath
    Write-Host "✓ Website created" -ForegroundColor Green
} catch {
    Write-Host "✗ Website creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configure Application Pool
try {
    $appPoolName = $SiteName
    if (Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue) {
        Remove-WebAppPool -Name $appPoolName
    }
    
    New-WebAppPool -Name $appPoolName
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "enable32BitAppOnWin64" -Value $false
    Set-ItemProperty -Path "IIS:\Sites\$SiteName" -Name "applicationPool" -Value $appPoolName
    Write-Host "✓ Application Pool configured" -ForegroundColor Green
} catch {
    Write-Host "! App Pool warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test deployment
Write-Host "Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Website responding" -ForegroundColor Green
    }
} catch {
    Write-Host "! Website test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test API endpoints
$endpoints = @("/api/health", "/api/test", "/api/users", "/api/jobs", "/api/stats")
Write-Host "Testing API endpoints..." -ForegroundColor Yellow
foreach ($endpoint in $endpoints) {
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:$Port$endpoint" -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "! $endpoint failed" -ForegroundColor Yellow
    }
}

Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "Access your application: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Check SQL Server connectivity in the diagnostic page" -ForegroundColor White