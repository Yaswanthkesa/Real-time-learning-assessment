@echo off
REM IntelliSense Learning Platform - Deployment Setup Script (Windows)
REM This script helps you prepare your project for deployment

echo ========================================
echo IntelliSense Learning Platform
echo Deployment Setup
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [SETUP] Git not initialized. Initializing...
    git init
    echo [OK] Git initialized
) else (
    echo [OK] Git already initialized
)

REM Check if remote exists
git remote | findstr /C:"origin" >nul
if errorlevel 1 (
    echo.
    echo [SETUP] Adding GitHub remote...
    git remote add origin https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
    echo [OK] Remote added
) else (
    echo [OK] Remote already exists
)

REM Check for uncommitted changes
git status --short | findstr /R "." >nul
if not errorlevel 1 (
    echo.
    echo [SETUP] You have uncommitted changes. Committing...
    git add .
    git commit -m "Prepare for deployment"
    echo [OK] Changes committed
) else (
    echo [OK] No uncommitted changes
)

REM Rename branch to main
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo.
    echo [SETUP] Renaming branch to main...
    git branch -M main
    echo [OK] Branch renamed to main
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Push to GitHub:
echo    git push -u origin main
echo.
echo 2. Setup MongoDB Atlas:
echo    https://www.mongodb.com/cloud/atlas/register
echo.
echo 3. Get Groq API Key:
echo    https://console.groq.com
echo.
echo 4. Deploy Backend to Railway:
echo    https://railway.app
echo.
echo 5. Deploy Frontend to Vercel:
echo    https://vercel.com
echo.
echo See QUICK_DEPLOY.md for detailed instructions
echo.
pause
