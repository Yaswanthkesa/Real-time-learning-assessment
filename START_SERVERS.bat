@echo off
echo Starting IntelliSense Platform...
echo.

REM Start Backend
start "IntelliSense Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds
timeout /t 3 /nobreak > nul

REM Start Frontend
start "IntelliSense Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
