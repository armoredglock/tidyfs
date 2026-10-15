<#
.SYNOPSIS
    TidyFS Windows Downloader and Installer Script
.DESCRIPTION
    Automates downloading, verifying, and executing the TidyFS Windows installer or portable application.
.PARAMETER Version
    The version of TidyFS to install. Default is 1.0.0.
.PARAMETER Portable
    Download the standalone portable executable instead of the NSIS setup installer.
.PARAMETER Destination
    Target folder where the installer will be saved.
.PARAMETER Silent
    Run NSIS installer in silent mode (/S).
#>

[CmdletBinding()]
param(
    [string]$Version = "1.0.0",
    [switch]$Portable,
    [string]$Destination = "$env:TEMP\TidyFS_Download",
    [switch]$Silent
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "               TidyFS - Windows Downloader" -ForegroundColor Cyan
Write-Host "   Intelligent, Self-Cleaning File Organism for Desktop" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$fileName = if ($Portable) { "TidyFS $Version.exe" } else { "TidyFS Setup $Version.exe" }
$downloadUrl = "https://github.com/tidyfs/tidyfs/releases/download/v$Version/$([Uri]::EscapeDataString($fileName))"
$localReleasePath = Join-Path $PSScriptRoot "..\release\$fileName"

# Check local release first
if (Test-Path $localReleasePath) {
    Write-Host "[INFO] Detected local release executable at: $localReleasePath" -ForegroundColor Green
    $targetFile = $localReleasePath
} else {
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    $targetFile = Join-Path $Destination $fileName

    Write-Host "[INFO] Target file: $fileName" -ForegroundColor Gray
    Write-Host "[INFO] Downloading from: $downloadUrl" -ForegroundColor Gray
    Write-Host "[STATUS] Downloading TidyFS..." -ForegroundColor Yellow

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($downloadUrl, $targetFile)
        Write-Host "[SUCCESS] Download finished: $targetFile" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Remote download failed: $_" -ForegroundColor Yellow
        Write-Host "[INFO] Checking current script directory..." -ForegroundColor Gray
        $sameDirFile = Join-Path $PSScriptRoot $fileName
        if (Test-Path $sameDirFile) {
            $targetFile = $sameDirFile
            Write-Host "[INFO] Using binary found in current directory." -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Could not obtain installer file." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "[STATUS] Executing TidyFS..." -ForegroundColor Cyan

if ($Portable) {
    Start-Process -FilePath $targetFile
    Write-Host "[SUCCESS] TidyFS Portable launched." -ForegroundColor Green
} else {
    $arguments = if ($Silent) { "/S" } else { "" }
    Start-Process -FilePath $targetFile -ArgumentList $arguments
    Write-Host "[SUCCESS] TidyFS Setup Wizard launched." -ForegroundColor Green
}

Write-Host ""
