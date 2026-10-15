# TidyFS — The Intelligent, Self-Cleaning File Organism

A high-performance desktop application for Windows, macOS, and Linux that systematically cleans and organizes unmanaged directories, decays obsolete installers, isolates duplicate clutter, and guarantees safety through one-click atomic transaction rollbacks.

---

## Direct Installers (For End Users)

End users **do not need Node.js, npm, or terminal commands**. Standalone production binaries bundle all necessary runtimes into a single installable package.

Download the installer for your operating system from the [Latest GitHub Release](https://github.com/tidyfs/tidyfs/releases/latest):

| Operating System | Recommended Package | Description |
| :--- | :--- | :--- |
| **Windows** | `TidyFS Setup 1.0.0.exe` | Standard Windows NSIS Setup wizard with Start Menu and Desktop shortcuts. |
| **Windows Portable** | `TidyFS 1.0.0.exe` | Standalone executable requiring zero installation. Double-click and run. |
| **macOS** | `TidyFS-1.0.0-arm64.dmg` / `x64.dmg` | Native Apple disk image. Drag to `/Applications`. Compatible with Apple Silicon and Intel. |
| **Linux** | `TidyFS-1.0.0-x86_64.AppImage` | Universal binary executable on Ubuntu, Debian, Fedora, Arch, etc. |
| **Linux (Debian/Ubuntu)** | `tidyfs_1.0.0_amd64.deb` | Native Debian package for `apt` / `dpkg` package management. |

### Quick Installation Instructions

#### Windows
1. Download `TidyFS Setup 1.0.0.exe`.
2. Double-click the file to open the installation wizard.
3. Choose your installation path and complete setup. Launch TidyFS directly from your Desktop or Start menu.

#### macOS
1. Download `TidyFS-1.0.0-arm64.dmg` (M1/M2/M3/M4) or `TidyFS-1.0.0-x64.dmg` (Intel).
2. Double-click the DMG and drag **TidyFS** into your **Applications** folder.
3. Launch TidyFS from Spotlight or Launchpad.

#### Linux
1. Download `TidyFS-1.0.0-x86_64.AppImage`.
2. Open terminal and enable executable permissions:
   ```bash
   chmod +x TidyFS-1.0.0-x86_64.AppImage
   ./TidyFS-1.0.0-x86_64.AppImage
   ```
   *(Alternatively, run `./downloaders/download-linux.sh` to automatically install the binary to `~/.local/bin` and create desktop menu launchers).*

---

## Automated Platform Downloaders

For users and system administrators preferring automated command-line installation, pre-built scripts are provided in the `downloaders/` directory:

- **Windows:** Double-click `downloaders/download-windows.bat` or run `downloaders/download-windows.ps1` via PowerShell.
- **macOS:** Double-click `downloaders/download-mac.command` in Finder or run `downloaders/download-mac.sh`.
- **Linux:** Run `bash downloaders/download-linux.sh` for automatic architecture detection and desktop menu shortcut generation.

---

## Core Capabilities

- **Semantic & Extension Categorization:**
  - Finances: Tax invoices, payroll receipts, account statements (`.pdf`, `.xlsx`, `.csv`)
  - Travel: Flight boarding passes, ticket bookings, hotel reservations (`.pdf`, `.pkpass`)
  - Media: Photography, wallpapers, audio recordings, screen captures (`.png`, `.jpg`, `.mp4`, `.mov`)
  - Documents: Academic papers, reports, presentations (`.docx`, `.pptx`, `.md`)
  - Code & Engineering: Scripts, datasets, repositories (`.ts`, `.py`, `.json`, `.sql`)
- **Lifecycle Decay Engine:**
  - Tracks transient installation files (`.exe`, `.msi`, `.dmg`) and download archives (`.zip`, `.tar.gz`).
  - Flags aging temporary files past configurable retention windows (e.g., 14 days).
  - Recycles expired installers to dedicated staging folders.
- **SHA-256 Duplicate Hunter:**
  - Evaluates byte-level cryptographic hashes and naming anomalies (e.g. `file (1).pdf`).
  - Accurately computes reclaimed disk space.
- **Atomic Journal & Zero Directory Litter:**
  - All operations are backed by an internal transactional journal.
  - Journal entries are stored centrally in OS app data paths (`%APPDATA%\TidyFS\journals` or `~/.tidyfs/journals`), ensuring **zero metadata or JSON files are ever dropped inside user folders**.
  - One-click rollback restores directories to their exact prior state.
- **Industrial Brutalist Desktop UI:**
  - High-density telemetry interface with live system metrics and responsive dark and light modes.
  - Zero unnecessary visual fluff or generative artifacts.

---

## Architecture & Distribution Pipeline

TidyFS is engineered as a decoupled architecture:

```
+-------------------------------------------------------------+
|                        TidyFS App                           |
|                                                             |
|  +---------------------------+  +------------------------+  |
|  |     Frontend (React 19)   |  |   Core Engine (Node)   |  |
|  |  Tailwind CSS v4 Brute UI |  | Scanner, SHA-256 Hashing|  |
|  |   Live Metric Telemetry   |  | Transactional Journal  |  |
|  +-------------+-------------+  +-----------+------------+  |
|                |                            |               |
|                +------------+---------------+               |
|                             |                               |
|                  Electron IPC Security Bridge               |
+-----------------------------+-------------------------------+
                              |
                     Packaged Executable
      [ Windows .exe | macOS .dmg | Linux .AppImage / .deb ]
```

When built for release, Electron packages the frontend bundle and runtime engine into a signed ASAR archive. The executable boots directly without starting external HTTP services or requiring developer dependencies.

### Multi-Platform GitHub CI/CD

The automated workflow located at `.github/workflows/release.yml` triggers on version tags (`v*`). When a tag is pushed, GitHub Actions compiles:
1. Windows: NSIS Installer (`.exe`) + Portable standalone (`.exe`)
2. macOS: Disk Image (`.dmg`) + App Zip archive
3. Linux: Universal AppImage + Debian package (`.deb`)

All release assets and download scripts are automatically published to the GitHub Release portal.

---

## Developer Guide (Contributing & Source Builds)

If you are contributing to TidyFS or building from source, the following developer workflows apply:

### Prerequisites
- Node.js 20 or higher
- npm 9 or higher

### Local Development Mode
```bash
# Clone the repository
git clone https://github.com/tidyfs/tidyfs.git
cd tidyfs

# Install dependencies
npm install

# Run the local development environment (Vite + Electron)
npm run app
```

### Running Automated Test Suite
```bash
npx tsx test-engine.ts
```

### Building Platform Binaries Locally
```bash
# Compile current platform binary
npm run dist

# Specific platform targets:
npm run dist:win    # Outputs to release/TidyFS Setup 1.0.0.exe
npm run dist:mac    # Outputs to release/TidyFS-1.0.0.dmg
npm run dist:linux  # Outputs to release/TidyFS-1.0.0.AppImage
```

---

## License

MIT License. Distributed freely for personal and enterprise file management.
