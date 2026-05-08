@echo off
echo.
echo ===============================================================
echo                    QUICK CLEANUP SCRIPT
echo ===============================================================
echo.
echo WARNING: This will delete ALL data and files!
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Step 1: Clearing database...
echo ---------------------------------------------------------------
node clear-database.js

echo.
echo Step 2: Clearing uploaded files...
echo ---------------------------------------------------------------
node clear-uploads.js

echo.
echo ===============================================================
echo                  CLEANUP COMPLETE!
echo ===============================================================
echo.
pause
