Write-Host "Starting Coffee Tree Platform Demo..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Mock API Server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node frontend/api-server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node frontend/server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Demo servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Mock API: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening frontend in your browser..." -ForegroundColor Green

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"