@echo off
title Nestoria Remote Tunnel
cd /d "%~dp0"

echo ========================================
echo  Nestoria - Remote Access Setup
echo ========================================
echo.

:: Kill any existing processes
echo [1/7] Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1
timeout /t 3 /nobreak >nul

:: Start backend
echo [2/7] Starting backend (port 5000)...
start "Nestoria Backend" cmd /c "cd /d backend && node server.js"
timeout /t 4 /nobreak >nul

:: Start frontend
echo [3/7] Starting frontend (port 5173)...
start "Nestoria Frontend" cmd /c "cd /d frontend && node node_modules\vite\bin\vite.js --host --port 5173"
timeout /t 6 /nobreak >nul

:: Verify servers
echo [4/7] Verifying servers...
node -e "require('http').get('http://localhost:5000/api/health',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log('  Backend:',JSON.parse(d).ok?'OK':'FAIL'))}).on('error',()=>console.log('  Backend: FAIL'))"
node -e "require('http').get('http://localhost:5173',r=>console.log('  Frontend: HTTP',r.statusCode)).on('error',()=>console.log('  Frontend: FAIL'))"
timeout /t 3 /nobreak >nul

:: Start proxy (combines frontend + backend on single port)
echo [5/7] Starting proxy (port 8000)...
start "Nestoria Proxy" cmd /c "cd /d . && node proxy.js"
timeout /t 3 /nobreak >nul

:: Start ngrok
echo [6/7] Starting ngrok tunnel...
start "Nestoria ngrok" cmd /c "ngrok http 8000 --host-header=rewrite"
timeout /t 6 /nobreak >nul

:: Get ngrok URL
echo [7/7] Getting tunnel URL...
for /f "tokens=*" %%a in ('curl -s http://127.0.0.1:4040/api/tunnels 2^>nul') do set TUNNEL_JSON=%%a
if defined TUNNEL_JSON (
    for /f "tokens=*" %%b in ('node -e "try{const j=JSON.parse('%TUNNEL_JSON%'.replace(/'/g,'\"'));console.log(j.tunnels[0].public_url)}catch(e){}"') do set TUNNEL_URL=%%b
)

echo.
echo ========================================
if defined TUNNEL_URL (
    echo  READY! Share this URL:
    echo  %TUNNEL_URL%
) else (
    echo  Tunnel URL: Check the ngrok window
    echo  (wait a moment and refresh)
)
echo ========================================
echo.
echo  Your friend opens: %TUNNEL_URL%
echo  API: %TUNNEL_URL%/api/health
echo.
echo  Press Ctrl+C in this window to stop.
echo.
pause
