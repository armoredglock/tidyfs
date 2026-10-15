import React from 'react';
import { Folder, RotateCcw, Settings, RefreshCw, FolderSearch, Sun, Moon, Download, Terminal, Layers } from 'lucide-react';

interface HeaderProps {
  currentFolder: string;
  onSelectFolder: () => void;
  onSelectDownloads: () => void;
  onSelectDesktop: () => void;
  onScan: () => void;
  onOpenSettings: () => void;
  onOpenDownloaders: () => void;
  onRevertLast: () => void;
  hasHistory: boolean;
  isScanning: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFolder,
  onSelectFolder,
  onSelectDownloads,
  onSelectDesktop,
  onScan,
  onOpenSettings,
  onOpenDownloaders,
  onRevertLast,
  hasHistory,
  isScanning,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="w-full bg-white dark:bg-[#070b14] border-b border-slate-300 dark:border-slate-800 px-6 py-2.5 select-none transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Engine Telemetry Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black tracking-tighter text-sm shadow-2xs">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                TIDYFS
              </span>
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                v1.0.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="telemetry-tag text-slate-500 dark:text-slate-400">
                {isScanning ? 'SCANNING_FS' : 'ENGINE_READY'}
              </span>
            </div>
          </div>
        </div>

        {/* Directory Selector Bar (Industrial Breadcrumb) */}
        <div className="flex flex-1 max-w-2xl items-center gap-2 bg-slate-50 dark:bg-[#0c1222] border border-slate-300 dark:border-slate-700/80 rounded px-3 py-1.5 transition-colors">
          <Folder className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span
            className="truncate text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex-1 select-all"
            title={currentFolder}
          >
            {currentFolder || 'C:\\Users\\User\\Downloads'}
          </span>

          <div className="flex items-center gap-1 shrink-0 font-mono">
            <button
              onClick={onSelectDownloads}
              className="btn-brute px-2 py-0.5 rounded text-[11px] font-extrabold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs"
            >
              DOWNLOADS
            </button>
            <button
              onClick={onSelectDesktop}
              className="btn-brute px-2 py-0.5 rounded text-[11px] font-extrabold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs"
            >
              DESKTOP
            </button>
            <button
              onClick={onSelectFolder}
              className="btn-brute px-2.5 py-0.5 rounded border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <FolderSearch className="h-3 w-3 text-slate-600 dark:text-slate-300" />
              BROWSE
            </button>
          </div>
        </div>

        {/* Actions Control Deck */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Scan Action */}
          <button
            onClick={onScan}
            disabled={isScanning || !currentFolder}
            className="btn-brute flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-2xs disabled:opacity-50 border border-emerald-700 dark:border-emerald-400"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'SCANNING' : 'SCAN'}
          </button>

          {/* Rollback / Undo */}
          <button
            onClick={onRevertLast}
            disabled={!hasHistory || isScanning}
            className="btn-brute flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 text-xs font-bold cursor-pointer shadow-2xs"
            title="Rollback the last batch transaction"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            UNDO
          </button>

          {/* Downloaders Modal Trigger */}
          <button
            onClick={onOpenDownloaders}
            className="btn-brute flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer shadow-2xs"
            title="Download Installers & Scripts (Windows / macOS / Linux)"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            INSTALLERS
          </button>

          {/* Rules / Settings */}
          <button
            onClick={onOpenSettings}
            className="btn-brute p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
            title="Preferences & Rules"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="btn-brute p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
            title={`Toggle Theme (Current: ${theme})`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
