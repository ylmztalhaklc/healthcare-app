@echo off
chcp 65001 >nul
title Healthcare App Launcher

echo.
echo ================================================
echo   Healthcare App - Backend + Emulator Starter
echo ================================================
echo.

:: --- Backend ---
echo [1/2] Backend başlatılıyor (port 8000)...
cd /d "%~dp0backend"
start "Backend - FastAPI" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Backend'in ayağa kalkmasını bekle
echo     Bekliyor (5 saniye)...
timeout /t 5 /nobreak >nul

:: Backend ayağa kalktı mı kontrol et
curl -s -o nul -w "%%{http_code}" http://localhost:8000/health >nul 2>&1

echo     Backend hazır.
echo.

:: --- Expo / Emulator ---
echo [2/2] Expo baslatiliyor (Android emulator)...
cd /d "%~dp0mobile"
start "Expo - Android Emulator" cmd /k "npx expo start --android --clear"

:: Emulator boot bekleniyor, sonra saat dilimi Istanbul olarak ayarlaniyor
echo     Emulator aciliyor, saat dilimi ayari icin 30 saniye bekleniyor...
timeout /t 30 /nobreak >nul
adb shell settings put global time_zone Europe/Istanbul >nul 2>&1
adb shell am broadcast -a android.intent.action.TIME_SET >nul 2>&1
echo     Saat dilimi Europe/Istanbul olarak ayarlandi.

echo.
echo ================================================
echo   Her iki pencere de acildi.
echo   Emulator backend'e 10.0.2.2:8000 uzerinden ulasir.
echo   Kapatmak icin her iki pencereyi ayri ayri kapatin.
echo ================================================
echo.
pause
