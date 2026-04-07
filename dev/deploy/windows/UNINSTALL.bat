@echo off
REM Owl-talk Uninstaller
echo ========================================
echo  Owl-talk Uninstaller
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

echo This will remove Owl-talk from your system.
echo.
set /p CONFIRM="Are you sure you want to uninstall? (y/n): "
if /i "%CONFIRM%" neq "y" (
    echo Uninstall cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Stopping Owl-talk service...
call net stop "Owl-talk" >nul 2>&1
if %errorLevel% equ 0 (
    call deploy\windows\nssm.exe remove "Owl-talk" confirm
    echo [OK] Service removed
) else (
    echo [SKIP] Service not found or not running
)

echo.
echo [2/3] Cleaning up virtual environment...
cd /d "%~dp0.."
if exist "venv" (
    rmdir /s /q "venv"
    echo [OK] Virtual environment removed
)

echo.
echo [3/3] Cleaning up database...
echo.
echo NOTE: Database 'owltalkdb' will NOT be deleted.
echo To delete it manually:
echo   1. Open pgAdmin or psql
echo   2. Connect to PostgreSQL
echo   3. Run: DROP DATABASE owltalkdb;
echo.

echo.
echo ========================================
echo  Uninstall Complete!
echo ========================================
echo.
echo Owl-talk has been removed from your system.
echo Database files remain in PostgreSQL.
echo.
pause

