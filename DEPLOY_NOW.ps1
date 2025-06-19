# FreelancingPlatform PowerShell Deployment Script
Write-Host "FreelancingPlatform Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Yellow
} catch {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Building the application..." -ForegroundColor Cyan
npm run build

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
NODE_ENV=production
PORT=5000
# Add your DATABASE_URL here
# DATABASE_URL=postgresql://username:password@localhost:5432/freelancing_platform
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host ""
Write-Host "IMPORTANT: Configure your database connection!" -ForegroundColor Red
Write-Host "Edit web.config and update the DATABASE_URL in the environmentVariables section:" -ForegroundColor Yellow
Write-Host '  <add name="DATABASE_URL" value="postgresql://username:password@localhost:5432/freelancing_platform" />' -ForegroundColor White

Write-Host "Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your database connection string" -ForegroundColor White
Write-Host "2. Ensure Node.js is installed on your server" -ForegroundColor White
Write-Host "3. Configure IIS with iisnode module" -ForegroundColor White
Write-Host "4. Set up application pool for Node.js" -ForegroundColor White
Write-Host "5. Deploy files to your IIS website directory" -ForegroundColor White
Write-Host ""
Write-Host "For IIS deployment:" -ForegroundColor Yellow
Write-Host "- Copy all files to your website directory" -ForegroundColor White
Write-Host "- Ensure iisnode is installed and configured" -ForegroundColor White
Write-Host "- Set application pool to 'No Managed Code'" -ForegroundColor White
Write-Host "- Verify web.config permissions" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..."