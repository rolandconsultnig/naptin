@echo off
REM Create Windows Service for Owl-talk
REM This allows the server to run automatically at startup

echo ========================================
echo  Owl-talk Windows Service Setup
echo ========================================
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires administrator privileges!
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo This will create a Windows service to run Owl-talk automatically.
echo.
set /p CREATE="Create service? (y/n): "
if /i "%CREATE%" neq "y" (
    echo Service creation cancelled.
    pause
    exit /b 0
)

REM Get project path
cd /d "%~dp0.."
set PROJECT_PATH=%CD%
set SCRIPT_PATH=%PROJECT_PATH%\deploy\windows\service_start.bat

echo.
echo Creating Windows service...
echo Project path: %PROJECT_PATH%
echo.

REM Create service start script
echo @echo off > "%SCRIPT_PATH%"
echo cd /d "%PROJECT_PATH%" >> "%SCRIPT_PATH%"
echo call venv\Scripts\activate.bat >> "%SCRIPT_PATH%"
echo python main.py >> "%SCRIPT_PATH%"

REM Install NSSM (Non-Sucking Service Manager)
if not exist "deploy\windows\nssm.exe" (
    echo Downloading NSSM (service manager)...
    echo Please download NSSM from: https://nssm.cc/download
    echo Place nssm.exe in: deploy\windows\
    echo Then run this script again.
    pause
    exit /b 1
)

echo Creating Owl-talk service...
call deploy\windows\nssm.exe install "Owl-talk" "%SCRIPT_PATH%"

echo.
echo [OK] Service created successfully!
echo.
echo Service name: Owl-talk
echo Service status: Use "services.msc" to manage
echo.
echo To start the service:
echo   net start "Owl-talk"
echo.
echo To stop the service:
echo   net stop "Owl-talk"
echo.
pause

