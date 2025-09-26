Write-Host "=== Starting Project Health Check ===" -ForegroundColor Cyan

# Root Directory Check
Write-Host "`n[ROOT DIRECTORY CHECK]" -ForegroundColor Yellow
$rootPath = Get-Location
Write-Host "Current Path: $rootPath" -ForegroundColor Green

# Check root package.json
if (Test-Path "package.json") {
    Write-Host "[OK] Root package.json exists" -ForegroundColor Green
    try {
        $rootPackage = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "   Name: $($rootPackage.name)" -ForegroundColor Cyan
        Write-Host "   Version: $($rootPackage.version)" -ForegroundColor Cyan
    } catch {
        Write-Host "[ERROR] Root package.json is corrupted!" -ForegroundColor Red
    }
} else {
    Write-Host "[WARNING] Root package.json missing" -ForegroundColor Yellow
}

# Check root node_modules
if (Test-Path "node_modules") {
    $rootModulesCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host ("[OK] Root node_modules exists (" + $rootModulesCount + " packages)") -ForegroundColor Green
} else {
    Write-Host "[WARNING] Root node_modules missing" -ForegroundColor Yellow
}

# CLIENT Directory Check
Write-Host "`n[CLIENT DIRECTORY CHECK]" -ForegroundColor Yellow
if (Test-Path "client") {
    Set-Location "client"
    
    # Check client package.json
    if (Test-Path "package.json") {
        Write-Host "[OK] Client package.json exists" -ForegroundColor Green
        try {
            $clientPackage = Get-Content "package.json" | ConvertFrom-Json
            Write-Host "   Name: $($clientPackage.name)" -ForegroundColor Cyan
            Write-Host "   Version: $($clientPackage.version)" -ForegroundColor Cyan
            Write-Host "   React Version: $($clientPackage.dependencies.react)" -ForegroundColor Cyan
            
            # Check for essential React dependencies
            $essentialDeps = @("react", "react-dom", "react-scripts")
            foreach ($dep in $essentialDeps) {
                if ($clientPackage.dependencies.PSObject.Properties.Name -contains $dep) {
                    $version = $clientPackage.dependencies.$dep
                    Write-Host "   [OK] $dep : $version" -ForegroundColor Green
                } else {
                    Write-Host "   [ERROR] Missing essential dependency: $dep" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "[ERROR] Client package.json is corrupted!" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Client package.json missing!" -ForegroundColor Red
    }
    
    # Check client node_modules
    if (Test-Path "node_modules") {
        $clientModulesCount = (Get-ChildItem "node_modules" -Directory).Count
        Write-Host ("[OK] Client node_modules exists (" + $clientModulesCount + " packages)") -ForegroundColor Green
        
        # Check essential folders in node_modules
        $essentialModules = @("react", "react-dom", "react-scripts")
        foreach ($module in $essentialModules) {
            if (Test-Path "node_modules\$module") {
                Write-Host "   [OK] $module installed" -ForegroundColor Green
            } else {
                Write-Host "   [ERROR] $module missing!" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[ERROR] Client node_modules missing!" -ForegroundColor Red
    }
    
    # Check build capability (OPTIONAL - comment out if takes too long)
    Write-Host "`n[TESTING BUILD CAPABILITY]" -ForegroundColor Cyan
    $userChoice = Read-Host "Run build test? (y/n - can take several minutes)"
    if ($userChoice -eq 'y') {
        try {
            Write-Host "Building... This may take a few minutes..." -ForegroundColor Yellow
            $process = Start-Process -FilePath "npm" -ArgumentList "run build" -Wait -PassThru -NoNewWindow
            if ($process.ExitCode -eq 0) {
                Write-Host "[OK] Client build successful!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Client build failed!" -ForegroundColor Red
            }
        } catch {
            Write-Host "[ERROR] Cannot run build test!" -ForegroundColor Red
        }
    } else {
        Write-Host "[SKIPPED] Build test skipped by user" -ForegroundColor Yellow
    }
    
    Set-Location ".."
} else {
    Write-Host "[ERROR] Client directory missing!" -ForegroundColor Red
}

# API Directory Check
Write-Host "`n[API DIRECTORY CHECK]" -ForegroundColor Yellow
if (Test-Path "api") {
    Set-Location "api"
    
    # Check api package.json
    if (Test-Path "package.json") {
        Write-Host "[OK] API package.json exists" -ForegroundColor Green
        try {
            $apiPackage = Get-Content "package.json" | ConvertFrom-Json
            Write-Host "   Name: $($apiPackage.name)" -ForegroundColor Cyan
            Write-Host "   Version: $($apiPackage.version)" -ForegroundColor Cyan
        } catch {
            Write-Host "[ERROR] API package.json is corrupted!" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] API package.json missing!" -ForegroundColor Red
    }
    
    # Check api node_modules
    if (Test-Path "node_modules") {
        $apiModulesCount = (Get-ChildItem "node_modules" -Directory).Count
        Write-Host ("[OK] API node_modules exists (" + $apiModulesCount + " packages)") -ForegroundColor Green
    } else {
        Write-Host "[ERROR] API node_modules missing!" -ForegroundColor Red
    }
    
    Set-Location ".."
} else {
    Write-Host "[ERROR] API directory missing!" -ForegroundColor Red
}

# GitHub Actions Check
Write-Host "`n[GITHUB ACTIONS CHECK]" -ForegroundColor Yellow
if (Test-Path ".github/workflows") {
    $workflowFiles = Get-ChildItem ".github/workflows/*.yml"
    Write-Host "[OK] Workflow directory exists" -ForegroundColor Green
    foreach ($workflow in $workflowFiles) {
        Write-Host "   Found: $($workflow.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "[WARNING] GitHub Actions directory missing!" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n=== HEALTH CHECK COMPLETE ===" -ForegroundColor Green
Write-Host "Check the results above and fix any [ERROR] items." -ForegroundColor White