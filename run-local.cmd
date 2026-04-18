@echo off
setlocal
cd /d "%~dp0"

echo =========================================
echo DanielClancy public site local launcher
echo Repo: %CD%
echo =========================================

if not exist package.json (
  echo package.json not found. Run this launcher from the repo root.
  exit /b 1
)

if not exist node_modules (
  echo node_modules missing. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency install failed.
    exit /b 1
  )
)

echo Starting Vite dev server on http://localhost:5173
call npm run dev -- --host
