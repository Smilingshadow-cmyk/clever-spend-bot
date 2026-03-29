@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo    SpendGuard AI - Development Server
echo ==========================================
echo.

:: 1. Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm.cmd install
    if !errorlevel! neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection or Node.js installation.
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Starting development server and opening browser...
echo.

:: 2. Start the Vite server with the --open flag to launch the browser automatically
call npm.cmd run dev -- --open

if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Failed to start development server.
    pause
)

ENDLOCAL
