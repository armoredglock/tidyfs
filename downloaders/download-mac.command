#!/usr/bin/env bash
# ==============================================================================
# TidyFS - macOS Double-Click Downloader & Installer (.command)
# Double-click this file directly in macOS Finder to install TidyFS
# ==============================================================================

set -euo pipefail

cd "$(dirname "$0")"

VERSION="1.0.0"
APP_NAME="TidyFS"
TARGET_DIR="${TMPDIR:-/tmp}/tidyfs_install"

echo "========================================================"
echo "               TidyFS - macOS Downloader"
echo "   Intelligent, Self-Cleaning File Organism for Desktop"
echo "========================================================"
echo ""

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    ARCH_TAG="arm64"
    echo "[INFO] Architecture: Apple Silicon (arm64)"
else
    ARCH_TAG="x64"
    echo "[INFO] Architecture: Intel (x86_64)"
fi

DMG_NAME="TidyFS-${VERSION}-${ARCH_TAG}.dmg"
ZIP_NAME="TidyFS-${VERSION}-mac.zip"
DOWNLOAD_URL="https://github.com/armoredglock/tidyfs/releases/download/v${VERSION}/${DMG_NAME}"
FALLBACK_ZIP_URL="https://github.com/armoredglock/tidyfs/releases/download/v${VERSION}/${ZIP_NAME}"

LOCAL_DMG="../release/${DMG_NAME}"
LOCAL_ZIP="../release/${ZIP_NAME}"

mkdir -p "$TARGET_DIR"

INSTALL_SOURCE=""

# 1. Check local release files first
if [ -f "$LOCAL_DMG" ]; then
    echo "[INFO] Found local DMG image in release directory: $LOCAL_DMG"
    INSTALL_SOURCE="$LOCAL_DMG"
elif [ -f "$LOCAL_ZIP" ]; then
    echo "[INFO] Found local Zip archive in release directory: $LOCAL_ZIP"
    INSTALL_SOURCE="$LOCAL_ZIP"
fi

# 2. Download if not found locally
if [ -z "$INSTALL_SOURCE" ]; then
    echo "[INFO] Downloading TidyFS for macOS..."
    echo "[INFO] Source URL: $DOWNLOAD_URL"
    
    DOWNLOAD_TARGET="${TARGET_DIR}/${DMG_NAME}"
    if curl -fSL --progress-bar "$DOWNLOAD_URL" -o "$DOWNLOAD_TARGET"; then
        INSTALL_SOURCE="$DOWNLOAD_TARGET"
        echo "[SUCCESS] Downloaded disk image successfully."
    else
        echo "[WARNING] DMG download failed, attempting zip release..."
        DOWNLOAD_TARGET="${TARGET_DIR}/${ZIP_NAME}"
        if curl -fSL --progress-bar "$FALLBACK_ZIP_URL" -o "$DOWNLOAD_TARGET"; then
            INSTALL_SOURCE="$DOWNLOAD_TARGET"
            echo "[SUCCESS] Downloaded application zip successfully."
        else
            echo "[ERROR] Failed to download TidyFS release package."
            echo "[INFO] Please verify your network connection or build locally with 'npm run dist:mac'."
            read -p "Press any key to exit..." -n 1 -r || true
            exit 1
        fi
    fi
fi

# 3. Installation to /Applications
echo ""
echo "[STATUS] Installing TidyFS to /Applications..."

if [[ "$INSTALL_SOURCE" == *.dmg ]]; then
    MOUNT_POINT=$(mktemp -d /tmp/tidyfs_mount.XXXXXX)
    echo "[STATUS] Mounting disk image..."
    hdiutil attach "$INSTALL_SOURCE" -mountpoint "$MOUNT_POINT" -nobrowse -quiet

    echo "[STATUS] Copying TidyFS.app to /Applications/..."
    rm -rf /Applications/TidyFS.app
    cp -R "${MOUNT_POINT}/TidyFS.app" /Applications/

    echo "[STATUS] Detaching disk image..."
    hdiutil detach "$MOUNT_POINT" -quiet
    rmdir "$MOUNT_POINT" 2>/dev/null || true
elif [[ "$INSTALL_SOURCE" == *.zip ]]; then
    echo "[STATUS] Extracting zip to /Applications/..."
    rm -rf /Applications/TidyFS.app
    unzip -q "$INSTALL_SOURCE" -d /Applications/
fi

# 4. Remove quarantine attribute for unsigned builds
if [ -d "/Applications/TidyFS.app" ]; then
    echo "[STATUS] Adjusting system gatekeeper attributes..."
    xattr -cr /Applications/TidyFS.app 2>/dev/null || xattr -dr com.apple.quarantine /Applications/TidyFS.app 2>/dev/null || true
    
    echo ""
    echo "========================================================"
    echo "[SUCCESS] TidyFS has been successfully installed!"
    echo "[INFO] Location: /Applications/TidyFS.app"
    echo "========================================================"
    echo ""

    echo "[STATUS] Launching TidyFS..."
    open /Applications/TidyFS.app
else
    echo "[ERROR] Installation failed. /Applications/TidyFS.app not found."
fi

echo ""
echo "[INFO] Setup process completed. You may now close this window."
read -p "Press Enter to exit..." || true
exit 0
