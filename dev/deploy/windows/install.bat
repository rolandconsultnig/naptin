@echo off
REM Owl-talk Windows Deployment Package
REM This script will automatically install and configure everything needed to run Owl-talk
echo ========================================
echo  Owl-talk Windows Deployment Setup
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

echo [1/7] Checking system requirements...
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Python...
    echo Please download and install Python from: https://www.python.org/downloads/
    echo After installation, run this script again.
    pause
    exit /b 1
) else (
    echo [OK] Python is installed
)

REM Check Node.js installation
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo Installing Node.js...
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed
)

REM Check PostgreSQL installation
psql --version >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [2/7] Installing PostgreSQL...
    echo Please download and install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo During installation, remember the 'postgres' user password!
    echo Default password is: Samolan123
    echo After installation, run this script again.
    pause
    exit /b 1
) else (
    echo [OK] PostgreSQL is installed
)

echo.
echo ========================================
echo Starting Owl-talk Installation...
echo ========================================
echo.

cd /d "%~dp0.."

echo [3/7] Setting up Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

echo.
echo [4/7] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
)
echo [OK] Python dependencies installed

echo.
echo [5/7] Setting up PostgreSQL database...
echo Please enter PostgreSQL password for 'postgres' user (Default: Samolan123)
set /p DB_PASSWORD="Password [Samolan123]: "
if "%DB_PASSWORD%"=="" set DB_PASSWORD=Samolan123

call venv\Scripts\python.exe deploy\windows\setup_database.py "%DB_PASSWORD%"
if %errorLevel% neq 0 (
    echo WARNING: Database setup failed. You may need to create it manually.
    echo.
)

echo.
echo [6/7] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    if %errorLevel% neq 0 (
        echo ERROR: Failed to install Node dependencies!
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [OK] Frontend dependencies already installed
)
cd ..

echo.
echo [7/7] Setting up SSL certificates for HTTPS...
if not exist "ssl\cert.pem" (
    echo Creating SSL certificates...
    call deploy\windows\setup_https.bat
) else (
    echo [OK] SSL certificates already exist
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Owl-talk is ready to use!
echo.
echo To start the server, run: start-server.bat
echo.
echo Default credentials:
echo   Username: admin
echo   Password: admin123
echo.
pause

