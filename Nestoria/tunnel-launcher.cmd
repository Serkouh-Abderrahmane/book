@echo off
REM Tunnel launcher for Nestoria
REM Run this from the Nestoria directory

echo Starting Nestoria tunnel...
echo.

REM Start backend
start "Nestoria Backend" cmd /c "cd /d %cd%\backend && node server.js"

REM Start frontend
start "Nestoria Frontend" cmd /c "cd /d %cd%\frontend && node node_modules\vite\bin\vite.js --host --port 5173"

echo Waiting for servers... (10 seconds)
ping -n 10 127.0.0.1 > nul

REM Start tunnels using the Node.js script
echo Starting tunnels...
start "Nestoria Tunnels" cmd /c "cd /d %cd% && node -e "const lt=require('localtunnel');Promise.all([lt({port:5173}),lt({port:5000})]).then(([fe,be])=>{console.log('Frontend: '+fe.url);console.log('Backend: '+be.url);console.log('');console.log('Give your friend this URL:');console.log(fe.url);console.log('');console.log('IMPORTANT: Visit both URLs to accept the prompt.');console.log('Press Ctrl+C in this window to stop.');setInterval(()=>{},60000)})""

echo.
echo Tunnels starting... check the "Nestoria Tunnels" window for URLs.
echo.
