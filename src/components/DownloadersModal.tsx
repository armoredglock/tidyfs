import React, { useState } from 'react';
import { X, Download, Terminal, Copy, Check, ExternalLink, HardDrive, Shield } from 'lucide-react';

interface DownloadersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadersModal: React.FC<DownloadersModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const WINDOWS_BAT_SNIPPET = `@echo off
set "VERSION=1.0.0"
set "INSTALLER=TidyFS Setup %VERSION%.exe"
echo [STATUS] Launching TidyFS Windows Installer...
if exist "..\\release\\%INSTALLER%" (
    start "" "..\\release\\%INSTALLER%"
) else (
    echo [INFO] Downloading %INSTALLER%...
    curl -L -O "https://github.com/armoredglock/tidyfs/releases/download/v%VERSION%/%INSTALLER%"
    start "" "%INSTALLER%"
)
exit /b 0`;

  const MAC_COMMAND_SNIPPET = `#!/usr/bin/env bash
VERSION="1.0.0"
echo "========================================================"
echo "               TidyFS - macOS Downloader"
echo "========================================================"
ARCH=$(uname -m)
DMG="TidyFS-\${VERSION}-\${ARCH}.dmg"
echo "[STATUS] Installing TidyFS to /Applications..."
if [ -f "../release/\${DMG}" ]; then
    hdiutil attach "../release/\${DMG}" -mountpoint /tmp/tidyfs_mount -quiet
    cp -R /tmp/tidyfs_mount/TidyFS.app /Applications/
    hdiutil detach /tmp/tidyfs_mount -quiet
    open /Applications/TidyFS.app
else
    curl -fSL "https://github.com/armoredglock/tidyfs/releases/download/v\${VERSION}/\${DMG}" -o "/tmp/\${DMG}"
    hdiutil attach "/tmp/\${DMG}" -mountpoint /tmp/tidyfs_mount -quiet
    cp -R /tmp/tidyfs_mount/TidyFS.app /Applications/
    hdiutil detach /tmp/tidyfs_mount -quiet
    open /Applications/TidyFS.app
fi
exit 0`;

  const LINUX_SH_SNIPPET = `#!/usr/bin/env bash
VERSION="1.0.0"
echo "[STATUS] Installing TidyFS on Linux..."
BIN_DIR="\${HOME}/.local/bin"
mkdir -p "\${BIN_DIR}"
if [ -f "../release/TidyFS-\${VERSION}-x86_64.AppImage" ]; then
    cp "../release/TidyFS-\${VERSION}-x86_64.AppImage" "\${BIN_DIR}/tidyfs"
else
    curl -fSL "https://github.com/armoredglock/tidyfs/releases/download/v\${VERSION}/TidyFS-\${VERSION}-x86_64.AppImage" -o "\${BIN_DIR}/tidyfs"
fi
chmod +x "\${BIN_DIR}/tidyfs"
echo "[SUCCESS] TidyFS installed at \${BIN_DIR}/tidyfs"
"\${BIN_DIR}/tidyfs" &`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Platform Downloaders & Installers
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Standalone installer files for Windows, macOS, and Linux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-normal text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-[13px]">
          {/* Windows Platform Section */}
          <div className="card-normal p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                  Windows
                </span>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  PowerShell / Command Line & Setup Wizard (.exe)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">v1.0.0 (x64)</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Install and launch TidyFS instantly using PowerShell or download the standalone NSIS setup wizard with full desktop integration.
            </p>

            {/* Terminal One-Liner Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                POWERSHELL TERMINAL COMMAND:
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs">
                <code className="text-blue-700 dark:text-blue-300 truncate font-bold select-all">
                  irm https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-windows.ps1 | iex
                </code>
                <button
                  onClick={() => handleCopy('irm https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-windows.ps1 | iex', 'win-ps')}
                  className="btn-normal flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedIndex === 'win-ps' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedIndex === 'win-ps' ? 'Copied' : 'Copy Command'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => handleDownloadFile('download-windows.bat', WINDOWS_BAT_SNIPPET)}
                className="btn-normal flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download Windows Script (.bat)
              </button>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300 flex-1 min-w-[280px]">
                <span className="text-xs truncate flex-1 font-bold">release\TidyFS Setup 1.0.0.exe</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded">
                  Built (84.7 MB)
                </span>
              </div>
            </div>
          </div>

          {/* macOS Platform Section */}
          <div className="card-normal p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                  macOS
                </span>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Terminal Curl One-Liner & Finder Installer (.command)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">Apple Silicon & Intel</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Downloads the DMG, mounts it silently, installs <code className="font-mono font-bold text-slate-800 dark:text-slate-200">TidyFS.app</code> into <code className="font-mono font-bold text-slate-800 dark:text-slate-200">/Applications</code>, and removes quarantine flags.
            </p>

            {/* Terminal One-Liner Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                MACOS TERMINAL (CURL) COMMAND:
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs">
                <code className="text-purple-700 dark:text-purple-300 truncate font-bold select-all">
                  curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-mac.sh | bash
                </code>
                <button
                  onClick={() => handleCopy('curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-mac.sh | bash', 'mac')}
                  className="btn-normal flex items-center gap-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedIndex === 'mac' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedIndex === 'mac' ? 'Copied' : 'Copy Command'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => handleDownloadFile('download-mac.command', MAC_COMMAND_SNIPPET)}
                className="btn-normal flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download Mac Script (.command)
              </button>
            </div>
          </div>

          {/* Linux Platform Section */}
          <div className="card-normal p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                  Linux
                </span>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Terminal Curl One-Liner & AppImage Integrator (.sh)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">Universal .AppImage</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Fetches the universal Linux AppImage, grants executable permissions, and installs <code className="font-mono font-bold text-slate-800 dark:text-slate-200">tidyfs.desktop</code> into the user application menu.
            </p>

            {/* Terminal One-Liner Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                LINUX TERMINAL (CURL) COMMAND:
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs">
                <code className="text-amber-700 dark:text-amber-300 truncate font-bold select-all">
                  curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-linux.sh | bash
                </code>
                <button
                  onClick={() => handleCopy('curl -fsSL https://raw.githubusercontent.com/armoredglock/tidyfs/main/downloaders/download-linux.sh | bash', 'linux')}
                  className="btn-normal flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedIndex === 'linux' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedIndex === 'linux' ? 'Copied' : 'Copy Command'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => handleDownloadFile('download-linux.sh', LINUX_SH_SNIPPET)}
                className="btn-normal flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download Linux Script (.sh)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Downloader scripts are located in <code className="font-mono font-bold text-slate-700 dark:text-slate-300">downloaders/</code>
          </span>
          <button
            onClick={onClose}
            className="btn-normal px-4 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
