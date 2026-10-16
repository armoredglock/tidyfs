# TidyFS Platform Downloaders & Installers

This directory provides dedicated downloader and installation scripts for Windows, macOS, and Linux.

---

## One-Line Terminal Prompts

Run these directly in your system terminal for immediate automated installation:

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-windows.ps1 | iex
```

### macOS (Terminal)
```bash
curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-mac.sh | bash
```

### Linux (Terminal)
```bash
curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-linux.sh | bash
```

---

## 1. Windows Downloader

### Option A: Double-Click Batch File
- File: `download-windows.bat`
- How to run: Double-click `download-windows.bat` in Windows Explorer.
- What it does: Automatically locates or downloads `TidyFS Setup 1.0.0.exe`, verifies file integrity, and launches the Windows Setup wizard.

### Option B: PowerShell Script
- File: `download-windows.ps1`
- How to run:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\download-windows.ps1
  ```
- Optional flags:
  - `-Portable`: Downloads the standalone portable `.exe` without installing.
  - `-Silent`: Runs the NSIS installer silently in the background.

### Option C: Direct Executables (in `release/` folder)
- Installer Setup: `release/TidyFS Setup 1.0.0.exe`
- Standalone Portable: `release/TidyFS 1.0.0.exe`

---

## 2. macOS Downloader

### Option A: Double-Click Command File
- File: `download-mac.command`
- How to run: Double-click `download-mac.command` directly in macOS Finder.
- What it does:
  1. Detects Apple Silicon (`arm64`) vs Intel (`x86_64`).
  2. Downloads and mounts the release DMG.
  3. Installs `TidyFS.app` directly into `/Applications`.
  4. Removes quarantine flags and prompts to launch the application.

### Option B: Terminal Script
- File: `download-mac.sh`
- How to run:
  ```bash
  chmod +x download-mac.sh
  ./download-mac.sh
  ```

---

## 3. Linux Downloader

### Universal AppImage Installer
- File: `download-linux.sh`
- How to run:
  ```bash
  chmod +x download-linux.sh
  ./download-linux.sh
  ```
- What it does:
  1. Detects system architecture (`x86_64` / `aarch64`).
  2. Downloads the universal Linux AppImage to `~/.local/bin/tidyfs`.
  3. Sets executable permissions (`chmod +x`).
  4. Automatically integrates into your desktop environment with a `.desktop` file at `~/.local/share/applications/tidyfs.desktop` so TidyFS appears in your application dock and start menu.
  5. Launches the app.
