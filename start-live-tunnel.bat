@echo off
title Pandey PG - Live Server + Tunnel
echo ========================================================
echo Starting Next.js Dev Server and Cloudflare Live Tunnel...
echo ========================================================

start "Next.js Dev Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo Starting Cloudflare Tunnel...
.\cloudflared.exe tunnel --url http://localhost:3000
pause
