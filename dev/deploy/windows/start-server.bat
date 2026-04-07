@echo off
REM Owl-talk Server Startup Script
echo ========================================
echo  Starting Owl-talk Server
echo ========================================
echo.

cd /d "%~dp0.."

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if database exists
python -c "from src.models.user import db; from main import app; import sys; \
with app.app_context(): \
    try: \
        db.engine.execute('SELECT 1'); \
        print('[OK] Database connected'); \
        sys.exit(0); \
    except Exception as e: \
        print('[ERROR] Database connection failed:', e); \
        sys.exit(1)" 2>nul

if %errorLevel% neq 0 (
    echo.
    echo WARNING: Database connection failed!
    echo Please ensure PostgreSQL is running.
    echo.
    pause
)

REM Start the server
echo Starting Owl-talk server...
echo.

python main.py

pause

