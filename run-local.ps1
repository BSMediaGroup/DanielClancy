$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "========================================="
Write-Host "DanielClancy public site local launcher"
Write-Host "Repo: $PWD"
Write-Host "========================================="

if (-not (Test-Path ".\package.json")) {
  Write-Host "package.json not found. Run this launcher from the repo root."
  exit 1
}

if (-not (Test-Path ".\node_modules")) {
  Write-Host "node_modules missing. Installing dependencies..."
  npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173"
npm run dev -- --host
