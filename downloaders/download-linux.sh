#!/usr/bin/env bash
# ==============================================================================
# TidyFS - Linux Downloader & Desktop Integrator
# Compatible with Ubuntu, Debian, Fedora, Arch, and all major distributions
# ==============================================================================

set -euo pipefail

VERSION="1.0.0"
APP_NAME="TidyFS"
INSTALL_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"

echo "========================================================"
echo "               TidyFS - Linux Downloader"
echo "   Intelligent, Self-Cleaning File Organism for Desktop"
echo "========================================================"
echo ""

ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH_TAG="x86_64"
elif [ "$ARCH" = "aarch64" ]; then
    ARCH_TAG="arm64"
else
    ARCH_TAG="x86_64"
fi

APPIMAGE_NAME="TidyFS-${VERSION}-${ARCH_TAG}.AppImage"
DEB_NAME="tidyfs_${VERSION}_amd64.deb"
DOWNLOAD_URL="https://github.com/tidyfs/tidyfs/releases/download/v${VERSION}/${APPIMAGE_NAME}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_APPIMAGE="${SCRIPT_DIR}/../release/${APPIMAGE_NAME}"
LOCAL_DEB="${SCRIPT_DIR}/../release/${DEB_NAME}"

mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

TARGET_BIN="${INSTALL_DIR}/tidyfs"

# 1. Check local release files
if [ -f "$LOCAL_APPIMAGE" ]; then
    echo "[INFO] Found local AppImage in release directory: $LOCAL_APPIMAGE"
    cp "$LOCAL_APPIMAGE" "$TARGET_BIN"
elif [ -f "$LOCAL_DEB" ] && command -v dpkg >/dev/null 2>&1; then
    echo "[INFO] Found local Debian package: $LOCAL_DEB"
    read -p "Install system-wide via dpkg? (sudo required) (Y/n): " -n 1 -r || true
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo dpkg -i "$LOCAL_DEB" || sudo apt-get install -f -y
        echo "[SUCCESS] Installed TidyFS via package manager."
        exit 0
    fi
    cp "$LOCAL_DEB" /tmp/
fi

# 2. Download AppImage if not present locally
if [ ! -f "$TARGET_BIN" ]; then
    echo "[INFO] Downloading universal Linux AppImage..."
    echo "[INFO] Source URL: $DOWNLOAD_URL"
    
    if curl -fSL --progress-bar "$DOWNLOAD_URL" -o "$TARGET_BIN"; then
        echo "[SUCCESS] Download completed."
    else
        echo "[ERROR] Download failed. Check your internet connection."
        echo "[INFO] If building from source, run 'npm run dist:linux' inside the repository."
        exit 1
    fi
fi

# 3. Permissions & Desktop Integration
chmod +x "$TARGET_BIN"
echo "[STATUS] Binary permissions updated: chmod +x $TARGET_BIN"

# Generate desktop launcher entry
DESKTOP_FILE="${DESKTOP_DIR}/tidyfs.desktop"
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=TidyFS
GenericName=File Organizer
Comment=The Intelligent, Self-Cleaning File Organism for Desktop
Exec=${TARGET_BIN} %U
Terminal=false
Type=Application
Categories=Utility;FileManager;Core;
StartupNotify=true
EOF

chmod +x "$DESKTOP_FILE"
echo "[STATUS] Desktop entry installed: $DESKTOP_FILE"

# Update desktop database if available
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo ""
echo "========================================================"
echo "[SUCCESS] TidyFS has been successfully installed!"
echo "[INFO] Executable: $TARGET_BIN"
echo "[INFO] Desktop Launcher: Available in your Application menu"
echo "========================================================"
echo ""

read -p "Launch TidyFS now? (Y/n): " -n 1 -r || true
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "[STATUS] Launching TidyFS..."
    nohup "$TARGET_BIN" >/dev/null 2>&1 &
fi
