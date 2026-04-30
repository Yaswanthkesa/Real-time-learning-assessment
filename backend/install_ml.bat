@echo off
echo.
echo ========================================================
echo   Installing ML dependencies for Video Learning Platform
echo ========================================================
echo.

REM Check Python installation
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo Found: %PYTHON_VERSION%
echo.

REM Check pip installation
echo Checking pip installation...
python -m pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pip is not installed
    echo Please install pip first
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python -m pip --version') do set PIP_VERSION=%%i
echo Found: %PIP_VERSION%
echo.

REM Install Python dependencies
echo Installing Python dependencies...
echo This may take 10-30 minutes for first-time installation...
echo.

python -m pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   ML dependencies installed successfully!
    echo ========================================================
    echo.
    echo Next steps:
    echo   1. Start the backend server: npm run dev
    echo   2. Upload a video via the frontend
    echo   3. Click 'Process Video' to test ML processing
    echo.
    echo NOTE: First-time model downloads will happen automatically
    echo   - Whisper base model: ~140MB
    echo   - Mistral-7B model: ~14GB
    echo.
) else (
    echo.
    echo ERROR: Installation failed
    echo Please check the error messages above
    pause
    exit /b 1
)

pause
