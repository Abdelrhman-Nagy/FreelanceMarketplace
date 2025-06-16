# Updated IIS Deployment Script for Freelancing Platform
# Matches new web.config structure with server/index.js and public/ directory

param(
    [string]$SiteName = "FreelancingPlatform",
    [string]$SitePath = "C:\inetpub\wwwroot\FreelancingPlatform",
    [string]$Port = 80
)

Write-Host "🚀 Starting IIS Deployment for Freelancing Platform" -ForegroundColor Green
Write-Host "Site Name: $SiteName" -ForegroundColor Cyan
Write-Host "Site Path: $SitePath" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Cyan

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Error: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Import WebAdministration module
try {
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "✅ WebAdministration module loaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: WebAdministration module not available" -ForegroundColor Red
    Write-Host "Install IIS Management Tools: Enable-WindowsOptionalFeature -Online -FeatureName IIS-ManagementConsole" -ForegroundColor Yellow
    exit 1
}

# Create site directory
Write-Host "📁 Creating site directory..." -ForegroundColor Yellow
if (!(Test-Path $SitePath)) {
    New-Item -Path $SitePath -ItemType Directory -Force
    Write-Host "✅ Created directory: $SitePath" -ForegroundColor Green
} else {
    Write-Host "✅ Directory exists: $SitePath" -ForegroundColor Green
}

# Copy application files
Write-Host "📄 Copying application files..." -ForegroundColor Yellow

# Core files
$filesToCopy = @(
    @{ Source = "web.config"; Dest = "$SitePath\web.config" },
    @{ Source = "index.js"; Dest = "$SitePath\index.js" },
    @{ Source = "package.json"; Dest = "$SitePath\package.json" },
    @{ Source = "iisnode.yml"; Dest = "$SitePath\iisnode.yml" }
)

# Server directory
if (Test-Path "server") {
    $serverPath = "$SitePath\server"
    if (!(Test-Path $serverPath)) { New-Item -Path $serverPath -ItemType Directory -Force }
    Copy-Item "server\*" $serverPath -Recurse -Force
    Write-Host "✅ Copied server files" -ForegroundColor Green
}

# Public directory
if (Test-Path "public") {
    $publicPath = "$SitePath\public"
    if (!(Test-Path $publicPath)) { New-Item -Path $publicPath -ItemType Directory -Force }
    Copy-Item "public\*" $publicPath -Recurse -Force
    Write-Host "✅ Copied public files" -ForegroundColor Green
}

# Built application files (if they exist)
if (Test-Path "dist") {
    Copy-Item "dist\*" $SitePath -Recurse -Force
    Write-Host "✅ Copied dist files" -ForegroundColor Green
}

# Copy individual files
foreach ($file in $filesToCopy) {
    if (Test-Path $file.Source) {
        Copy-Item $file.Source $file.Dest -Force
        Write-Host "✅ Copied $($file.Source)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: $($file.Source) not found" -ForegroundColor Yellow
    }
}

# Set directory permissions
Write-Host "🔐 Setting directory permissions..." -ForegroundColor Yellow
try {
    $acl = Get-Acl $SitePath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $SitePath -AclObject $acl
    Write-Host "✅ Permissions set for IIS_IUSRS" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not set permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location $SitePath
try {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install --production
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: npm not found. Install Node.js from nodejs.org" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: npm install failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Remove existing site if it exists
Write-Host "🗑️  Removing existing site..." -ForegroundColor Yellow
try {
    if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $SiteName
        Write-Host "✅ Removed existing site" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ No existing site to remove" -ForegroundColor Green
}

# Create new website
Write-Host "🌐 Creating IIS website..." -ForegroundColor Yellow
try {
    New-Website -Name $SiteName -Port $Port -PhysicalPath $SitePath
    Write-Host "✅ Website created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating website: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configure Application Pool
Write-Host "⚙️  Configuring Application Pool..." -ForegroundColor Yellow
try {
    $appPoolName = $SiteName
    if (Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue) {
        Remove-WebAppPool -Name $appPoolName
    }
    
    New-WebAppPool -Name $appPoolName
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "enable32BitAppOnWin64" -Value $false
    
    Set-ItemProperty -Path "IIS:\Sites\$SiteName" -Name "applicationPool" -Value $appPoolName
    Write-Host "✅ Application Pool configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Application Pool configuration failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 3
    $testUrl = "http://localhost:$Port"
    $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Website is responding correctly" -ForegroundColor Green
        Write-Host "🌍 Access your site at: $testUrl" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Warning: Website test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This may be normal for first deployment. Check manually." -ForegroundColor Gray
}

# Test API endpoints
Write-Host "🔍 Testing API endpoints..." -ForegroundColor Yellow
$apiEndpoints = @("/api/test", "/api/health", "/api/jobs")
foreach ($endpoint in $apiEndpoints) {
    try {
        $apiUrl = "http://localhost:$Port$endpoint"
        $apiResponse = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5
        if ($apiResponse.StatusCode -eq 200) {
            Write-Host "✅ $endpoint - OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  $endpoint - Failed" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Browse to http://localhost:$Port to test your application" -ForegroundColor White
Write-Host "2. Check IIS logs if there are any issues: $SitePath\logs\" -ForegroundColor White
Write-Host "3. Verify API endpoints are returning JSON responses" -ForegroundColor White
Write-Host "4. Configure SQL Server connection string in web.config if needed" -ForegroundColor White

Write-Host "`n📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "• Site Name: $SiteName" -ForegroundColor White
Write-Host "• Site Path: $SitePath" -ForegroundColor White
Write-Host "• Port: $Port" -ForegroundColor White
Write-Host "• Structure: server/index.js + public/ directory" -ForegroundColor White
Write-Host "• Database: SQL Server (configured in web.config)" -ForegroundColor White