@echo off
setlocal EnableDelayedExpansion

title TidyFS - Windows Downloader & Installer
color 0F

echo ========================================================
echo               TidyFS - Windows Downloader
echo   Intelligent, Self-Cleaning File Organism for Desktop
echo ========================================================
echo.

set "APP_NAME=TidyFS"
set "VERSION=1.0.0"
set "INSTALLER_EXE=TidyFS Setup %VERSION%.exe"
set "PORTABLE_EXE=TidyFS %VERSION%.exe"
set "DOWNLOAD_URL=https://github.com/armoredglock/tidyfs/releases/download/v%VERSION%/%INSTALLER_EXE%"
set "TARGET_DIR=%TEMP%\TidyFS_Installer"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: Check if local release installer already exists in project/parent directory
if exist "%~dp0..\release\%INSTALLER_EXE%" (
    echo [INFO] Found local installer in release folder.
    set "LOCAL_SOURCE=%~dp0..\release\%INSTALLER_EXE%"
    goto LaunchLocal
)

if exist "%~dp0%INSTALLER_EXE%" (
    echo [INFO] Found installer in current folder.
    set "LOCAL_SOURCE=%~dp0%INSTALLER_EXE%"
    goto LaunchLocal
)

echo [INFO] Fetching latest TidyFS Windows installer...
echo [INFO] Target destination: %TARGET_DIR%\%INSTALLER_EXE%
echo.

where curl >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [STATUS] Downloading with curl...
    curl -L --fail --progress-bar "%DOWNLOAD_URL%" -o "%TARGET_DIR%\%INSTALLER_EXE%"
) else (
    echo [STATUS] Downloading with PowerShell...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TARGET_DIR%\%INSTALLER_EXE%'"
)

if not exist "%TARGET_DIR%\%INSTALLER_EXE%" (
    echo [ERROR] Download failed or internet connection unavailable.
    echo [INFO] If you have the installer locally, place %INSTALLER_EXE% in this directory.
    pause
    exit /b 1
)

echo [SUCCESS] Download completed successfully.
set "LOCAL_SOURCE=%TARGET_DIR%\%INSTALLER_EXE%"

:LaunchLocal
echo.
echo [STATUS] Starting TidyFS Windows Setup...
start "" "%LOCAL_SOURCE%"
echo [SUCCESS] Installer launched. You can complete the setup wizard on screen.
echo.
timeout /t 3 >nul
exit /b 0
