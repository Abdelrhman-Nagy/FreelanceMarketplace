# IIS Deployment Script for Freelancing Platform
# Run this PowerShell script as Administrator on your IIS server

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteName = "FreelancingPlatform",
    
    [Parameter(Mandatory=$true)]
    [string]$SitePath = "C:\inetpub\wwwroot\FreelancingPlatform",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 80
)

Write-Host "Deploying Freelancing Platform to IIS..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator!"
    exit 1
}

# Install required IIS features
Write-Host "Installing IIS features..." -ForegroundColor Yellow
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ASPNET45 -All

# Create site directory
Write-Host "Creating site directory: $SitePath" -ForegroundColor Yellow
if (!(Test-Path $SitePath)) {
    New-Item -ItemType Directory -Path $SitePath -Force
}

# Import WebAdministration module
Import-Module WebAdministration

# Remove default website if it exists
if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
    Write-Host "Removing Default Web Site..." -ForegroundColor Yellow
    Remove-Website -Name "Default Web Site"
}

# Create new website
Write-Host "Creating IIS website: $SiteName" -ForegroundColor Yellow
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Remove-Website -Name $SiteName
}

New-Website -Name $SiteName -Port $Port -PhysicalPath $SitePath

# Create application pool
Write-Host "Creating application pool..." -ForegroundColor Yellow
if (Get-IISAppPool -Name $SiteName -ErrorAction SilentlyContinue) {
    Remove-WebAppPool -Name $SiteName
}

New-WebAppPool -Name $SiteName
Set-ItemProperty -Path "IIS:\AppPools\$SiteName" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\$SiteName" -Name managedRuntimeVersion -Value ""

# Assign application pool to website
Set-ItemProperty -Path "IIS:\Sites\$SiteName" -Name applicationPool -Value $SiteName

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
$acl = Get-Acl $SitePath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IUSR", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
Set-Acl -Path $SitePath -AclObject $acl

Write-Host "IIS configuration complete!" -ForegroundColor Green
Write-Host "Site URL: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Site Path: $SitePath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy your built application files to: $SitePath"
Write-Host "2. Install Node.js and iisnode on the server"
Write-Host "3. Configure your database connection in web.config"
Write-Host "4. Install npm dependencies in the site directory"