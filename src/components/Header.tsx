import React from 'react';
import { Folder, RotateCcw, Settings, RefreshCw, FolderSearch, Sun, Moon, Download, ShieldCheck, Terminal, Monitor, Apple } from 'lucide-react';
import iconImg from '../assets/icon.png';
import { OSTheme } from '../types.js';

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
  osTheme: OSTheme;
  onSelectOSTheme: (theme: OSTheme) => void;
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
  onToggleTheme,
  osTheme,
  onSelectOSTheme
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full transition-colors ${
      osTheme === 'mac'
        ? 'bg-white/45 dark:bg-[#0a0e1c]/45 backdrop-blur-3xl saturate-[190%] border-b border-white/60 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] px-6 py-2.5'
        : osTheme === 'linux'
        ? 'bg-[#e6ebef] dark:bg-[#020508] border-b-2 border-slate-800 dark:border-emerald-600/70 px-5 py-2 font-mono'
        : 'bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 px-6 py-2.5'
    } select-none`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Engine Telemetry Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* macOS Traffic Lights Simulation */}
          {osTheme === 'mac' && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
          )}

          <div className="relative group flex items-center justify-center shrink-0">
            <div className={`absolute -inset-1 rounded-full ${
              osTheme === 'linux'
                ? 'bg-emerald-500/30 blur-[2px]'
                : osTheme === 'mac'
                ? 'bg-gradient-to-tr from-teal-400/50 to-indigo-500/50 blur-[5px]'
                : 'bg-blue-500/30 blur-[3px]'
            } opacity-75 group-hover:opacity-100 transition duration-300`} />
            <img
              src={iconImg}
              alt="TidyFS"
              className={`relative h-8 w-8 object-cover shadow-sm ${
                osTheme === 'linux' ? 'rounded-xs border border-emerald-500' : 'rounded-full ring-1 ring-emerald-500/40'
              }`}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black uppercase ${
                osTheme === 'linux' ? 'text-emerald-600 dark:text-emerald-400 font-mono tracking-widest' : 'text-slate-900 dark:text-white font-mono tracking-wider'
              }`}>
                {osTheme === 'linux' ? 'usr@tidyfs:~#' : 'TIDYFS'}
              </span>
              <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 ${
                osTheme === 'linux'
                  ? 'rounded-none bg-slate-900 text-emerald-400 border border-emerald-600'
                  : osTheme === 'mac'
                  ? 'rounded-full bg-white/50 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10 backdrop-blur-sm'
                  : 'rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}>
                v1.0.0
              </span>
              <button
                onClick={onOpenSettings}
                className={`btn-brute hidden sm:flex items-center gap-1 text-[10px] font-mono font-extrabold px-1.5 py-0.2 ${
                  osTheme === 'linux'
                    ? 'rounded-none bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : osTheme === 'mac'
                    ? 'rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-sm'
                    : 'rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                } cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors`}
                title="100% Air-Gapped // Strict Metadata Only // Zero Content Scanning"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>AIR-GAPPED // ZERO CONTENT SCAN</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block ${osTheme === 'linux' ? 'w-1.5 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 rounded-full'} ${
                isScanning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`} />
              <span className={`telemetry-tag ${
                osTheme === 'linux' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {isScanning ? (osTheme === 'linux' ? '[SCAN:IN_PROGRESS]' : 'SCANNING_FS') : (osTheme === 'linux' ? '[ENGINE:DAEMON_READY]' : 'ENGINE_READY')}
              </span>
            </div>
          </div>
        </div>

        {/* Directory Selector Bar (Industrial Breadcrumb / macOS Capsule) */}
        <div className={`flex flex-1 max-w-2xl items-center gap-2 ${
          osTheme === 'mac'
            ? 'bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-full shadow-inner'
            : 'bg-slate-50 dark:bg-[#0c1222] border border-slate-300 dark:border-slate-700/80 rounded'
        } px-3.5 py-1.5 transition-colors`}>
          <Folder className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span
            className="truncate text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex-1 select-all"
            title={currentFolder}
          >
            {currentFolder || 'Select a folder to organize...'}
          </span>

          <div className="flex items-center gap-1.5 shrink-0 font-mono">
            <button
              onClick={onSelectDownloads}
              className={`btn-brute px-2.5 py-0.5 ${
                osTheme === 'mac'
                  ? 'rounded-full bg-white/60 dark:bg-white/15 border border-white/60 dark:border-white/20'
                  : 'rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
              } text-[11px] font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs`}
            >
              DOWNLOADS
            </button>
            <button
              onClick={onSelectDesktop}
              className={`btn-brute px-2.5 py-0.5 ${
                osTheme === 'mac'
                  ? 'rounded-full bg-white/60 dark:bg-white/15 border border-white/60 dark:border-white/20'
                  : 'rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
              } text-[11px] font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs`}
            >
              DESKTOP
            </button>
            <button
              onClick={onSelectFolder}
              className={`btn-brute px-2.5 py-0.5 ${
                osTheme === 'mac'
                  ? 'rounded-full bg-[#0071e3] text-white border border-blue-400/40 shadow-xs'
                  : 'rounded border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
              } hover:brightness-105 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-2xs`}
            >
              <FolderSearch className={`h-3 w-3 ${osTheme === 'mac' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
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
            className={`btn-brute flex items-center gap-1.5 px-3.5 py-1.5 ${
              osTheme === 'mac'
                ? 'rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold shadow-md shadow-blue-500/25 border border-blue-400/40'
                : osTheme === 'linux'
                ? 'rounded-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border border-emerald-300'
                : 'rounded bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-slate-950 font-black border border-emerald-700 dark:border-emerald-400'
            } text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? (osTheme === 'linux' ? '[SCANNING...]' : 'SCANNING') : (osTheme === 'linux' ? '[EXEC_SCAN]' : 'SCAN')}
          </button>

          {/* Rollback / Undo */}
          <button
            onClick={onRevertLast}
            disabled={!hasHistory || isScanning}
            className={`btn-brute flex items-center gap-1.5 px-3 py-1.5 ${
              osTheme === 'mac'
                ? 'rounded-full bg-white/45 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/60 dark:border-white/15 backdrop-blur-md'
                : osTheme === 'linux'
                ? 'rounded-none border border-slate-700 bg-white dark:bg-slate-800'
                : 'rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
            } text-slate-800 dark:text-slate-200 disabled:opacity-40 text-xs font-bold cursor-pointer shadow-2xs`}
            title="Rollback the last batch transaction"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {osTheme === 'linux' ? '[UNDO]' : 'UNDO'}
          </button>

          {/* Downloaders Modal Trigger */}
          <button
            onClick={onOpenDownloaders}
            className={`btn-brute flex items-center gap-1.5 px-3 py-1.5 ${
              osTheme === 'mac'
                ? 'rounded-full bg-white/45 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/60 dark:border-white/15 backdrop-blur-md'
                : osTheme === 'linux'
                ? 'rounded-none border border-slate-700 bg-white dark:bg-slate-800'
                : 'rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
            } text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer shadow-2xs`}
            title="Download Installers & Scripts (Windows / macOS / Linux)"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            {osTheme === 'linux' ? '[PKGS]' : 'INSTALLERS'}
          </button>

          {/* Rules / Settings */}
          <button
            onClick={onOpenSettings}
            className={`btn-brute p-1.5 ${
              osTheme === 'mac'
                ? 'rounded-full bg-white/45 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/60 dark:border-white/15 backdrop-blur-md'
                : osTheme === 'linux'
                ? 'rounded-none border border-slate-700 bg-white dark:bg-slate-800'
                : 'rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
            } text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs`}
            title="Preferences & Rules"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* OS Persona Mode Switcher */}
          <div className={`flex items-center gap-0.5 p-0.5 border ${
            osTheme === 'linux'
              ? 'rounded-none border-emerald-500 bg-black text-emerald-400'
              : osTheme === 'mac'
              ? 'rounded-full border-white/50 dark:border-white/15 bg-white/40 dark:bg-black/30 backdrop-blur-xl shadow-inner'
              : 'rounded-md border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
          } text-[10px] font-mono font-black select-none`}>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 px-1 font-bold hidden sm:inline">OS:</span>
            <button
              onClick={() => onSelectOSTheme('windows')}
              className={`flex items-center gap-1 px-2 py-0.5 transition-all cursor-pointer ${
                osTheme === 'windows'
                  ? 'bg-blue-600 text-white rounded font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="Windows Theme (Ctrl+1): Subtle, Bold, Functional"
            >
              <Monitor className="h-3 w-3" />
              <span>WIN</span>
            </button>
            <button
              onClick={() => onSelectOSTheme('mac')}
              className={`flex items-center gap-1 px-2.5 py-0.5 transition-all cursor-pointer ${
                osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white rounded-full font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="macOS Theme (Ctrl+2): Liquid Glassmorphism & Spring Motion"
            >
              <Apple className="h-3 w-3" />
              <span>MAC</span>
            </button>
            <button
              onClick={() => onSelectOSTheme('linux')}
              className={`flex items-center gap-1 px-2 py-0.5 transition-all cursor-pointer ${
                osTheme === 'linux'
                  ? 'bg-cyan-500 text-black font-black rounded-none shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="Linux Theme (Ctrl+3): Techy & Punchy Hacker Terminal"
            >
              <Terminal className="h-3 w-3" />
              <span>LNX</span>
            </button>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className={`btn-brute p-1.5 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-slate-700' : 'rounded'
            } bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs`}
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
