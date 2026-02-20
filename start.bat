@echo off
REM MapLeads Quick Start Script for Windows
REM This script helps you start both PocketBase and the frontend

echo 🚀 Starting MapLeads...
echo.

REM Check if PocketBase exists
if not exist "pocketbase\pocketbase.exe" (
    echo ❌ PocketBase not found!
    echo Please download PocketBase from https://pocketbase.io/docs/
    echo and place pocketbase.exe in the ./pocketbase/ folder
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️ .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo ⚠️ Please edit .env and add your Geoapify API key
    pause
    exit /b 1
)

REM Start PocketBase in new window
echo 🗄️ Starting PocketBase...
start "PocketBase" /MIN cmd /c "cd pocketbase && pocketbase.exe serve"

REM Wait for PocketBase to start
timeout /t 2 /nobreak > nul

echo ✅ PocketBase running on http://127.0.0.1:8090
echo 📊 Admin UI: http://127.0.0.1:8090/_/
echo.

REM Start Proxy Server in new window
echo 🔄 Starting Proxy Server...
start "Proxy Server" /MIN cmd /c "node proxy-server.cjs"

REM Wait for Proxy Server to start
timeout /t 2 /nobreak > nul

echo ✅ Proxy Server running on http://localhost:3001
echo.

REM Start frontend
echo ⚛️ Starting React frontend...
call npm run dev

pause
