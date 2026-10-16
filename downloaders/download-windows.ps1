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

$candidateNames = if ($Portable) {
    @("TidyFS.$Version.exe", "TidyFS $Version.exe", "TidyFS-$Version.exe")
} else {
    @("TidyFS.Setup.$Version.exe", "TidyFS Setup $Version.exe", "TidyFS-Setup-$Version.exe")
}

$targetFile = $null

# Check local release folder if running from cloned repository
if (![string]::IsNullOrEmpty($PSScriptRoot)) {
    foreach ($name in $candidateNames) {
        $candidateLocal = Join-Path $PSScriptRoot "..\release\$name"
        if (Test-Path $candidateLocal) {
            Write-Host "[INFO] Detected local release executable at: $candidateLocal" -ForegroundColor Green
            $targetFile = $candidateLocal
            break
        }
    }
}

if (-not $targetFile) {
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
    $webClient = New-Object System.Net.WebClient
    $downloadSuccess = $false

    foreach ($name in $candidateNames) {
        $downloadUrl = "https://github.com/armoredglock/tidyfs/releases/download/v$Version/$([Uri]::EscapeDataString($name))"
        $candidateDest = Join-Path $Destination $name
        Write-Host "[INFO] Attempting download: $name" -ForegroundColor Gray
        try {
            $webClient.DownloadFile($downloadUrl, $candidateDest)
            if ((Test-Path $candidateDest) -and ((Get-Item $candidateDest).Length -gt 100000)) {
                $targetFile = $candidateDest
                $downloadSuccess = $true
                Write-Host "[SUCCESS] Download finished: $targetFile" -ForegroundColor Green
                break
            }
        } catch {
            # Try next release asset format
        }
    }

    if (-not $downloadSuccess) {
        Write-Host "[WARNING] Remote release download failed. Checking current directory..." -ForegroundColor Yellow
        if (![string]::IsNullOrEmpty($PSScriptRoot)) {
            foreach ($name in $candidateNames) {
                $sameDir = Join-Path $PSScriptRoot $name
                if (Test-Path $sameDir) {
                    $targetFile = $sameDir
                    Write-Host "[INFO] Using binary found in current directory: $targetFile" -ForegroundColor Green
                    break
                }
            }
        }
    }

    if (-not $targetFile) {
        Write-Host "[ERROR] Could not obtain installer file." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[STATUS] Executing TidyFS..." -ForegroundColor Cyan

if ($Portable) {
    Start-Process -FilePath $targetFile
    Write-Host "[SUCCESS] TidyFS Portable launched." -ForegroundColor Green
} else {
    if ($Silent) {
        Start-Process -FilePath $targetFile -ArgumentList "/S"
    } else {
        Start-Process -FilePath $targetFile
    }
    Write-Host "[SUCCESS] TidyFS Setup Wizard launched." -ForegroundColor Green
}

Write-Host ""
