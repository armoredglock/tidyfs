import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  Clock,
  Copy,
  History,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { ScannedFile, TidyPlan, TidySettings, JournalEntry, DEFAULT_SETTINGS, TidyAction, Category, OrganizationStrategy, OSTheme } from './types.js';
import { Header } from './components/Header.js';
import { StatsCards } from './components/StatsCards.js';
import { StorageBar } from './components/StorageBar.js';
import { PlanView } from './components/PlanView.js';
import { DecayView } from './components/DecayView.js';
import { DuplicatesView } from './components/DuplicatesView.js';
import { HeavyFilesView } from './components/HeavyFilesView.js';
import { JournalView } from './components/JournalView.js';
import { SettingsModal } from './components/SettingsModal.js';
import { DownloadersModal } from './components/DownloadersModal.js';
import { MOCK_FILES, MOCK_PLAN, MOCK_JOURNAL } from './mockService.js';

type Tab = 'plan' | 'decay' | 'duplicates' | 'heavy' | 'journal';

export const App: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string>('C:\\Users\\User\\Downloads');
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [plan, setPlan] = useState<TidyPlan | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<TidySettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [dryRun, setDryRun] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDownloadersOpen, setIsDownloadersOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tidyfs_theme') as 'light' | 'dark') || 'light';
  });
  const [osTheme, setOsTheme] = useState<OSTheme>(() => {
    const saved = localStorage.getItem('tidyfs_os_theme') as OSTheme;
    if (saved && (saved === 'windows' || saved === 'mac' || saved === 'linux')) {
      return saved;
    }
    const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
    const plat = typeof navigator !== 'undefined' ? ((navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '') : '';
    if (/Mac|iPhone|iPad|iPod/i.test(ua) || /Mac/i.test(plat)) {
      return 'mac';
    }
    if (/Linux|X11/i.test(ua) || /Linux/i.test(plat)) {
      return 'linux';
    }
    return 'windows';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tidyfs_theme', theme);
  }, [theme]);

  // Sync OS-specific root CSS classes
  useEffect(() => {
    document.documentElement.classList.remove('os-windows', 'os-mac', 'os-linux');
    document.documentElement.classList.add(`os-${osTheme}`);
    localStorage.setItem('tidyfs_os_theme', osTheme);
  }, [osTheme]);

  // Auto-detect native host OS from Electron IPC if available
  useEffect(() => {
    async function detectPlatform() {
      const saved = localStorage.getItem('tidyfs_os_theme') as OSTheme;
      if (!saved) {
        try {
          if (window.tidyFS && window.tidyFS.getPlatform) {
            const detected = await window.tidyFS.getPlatform();
            setOsTheme(detected);
          }
        } catch {
          // preserve detected theme
        }
      }
    }
    detectPlatform();
  }, []);

  // Hotkeys: Ctrl+1 (Win), Ctrl+2 (Mac), Ctrl+3 (Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          setOsTheme('windows');
          showToast('Switched to Windows UI: Subtle, Bold, Functional', 'info');
        } else if (e.key === '2') {
          setOsTheme('mac');
          showToast('Switched to macOS UI: Liquid Glassmorphism & Spring Motion', 'info');
        } else if (e.key === '3') {
          setOsTheme('linux');
          showToast('Switched to Linux UI: Techy & Punchy Hacker Terminal', 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        if (window.tidyFS) {
          const savedSettings = await window.tidyFS.getSettings();
          setSettings(savedSettings);

          const defaultFolder = await window.tidyFS.getDefaultDownloads();
          if (defaultFolder) {
            setCurrentFolder(defaultFolder);
            runScan(defaultFolder, savedSettings);
          }
        } else {
          // Graceful fallback for browser preview mode
          setFiles(MOCK_FILES);
          setPlan(MOCK_PLAN);
          setJournal(MOCK_JOURNAL);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  const runScan = async (folder: string, customSettings = settings) => {
    if (!folder) return;
    setIsScanning(true);
    try {
      if (window.tidyFS) {
        const scannedFiles = await window.tidyFS.scanFolder(folder, customSettings);
        setFiles(scannedFiles);

        const generatedPlan = await window.tidyFS.createPlan(folder, customSettings);
        setPlan(generatedPlan);

        const journalHistory = await window.tidyFS.getJournal(folder);
        setJournal(journalHistory);

        showToast(`Analyzed ${scannedFiles.length} files successfully`, 'info');
      } else {
        setTimeout(() => {
          setFiles(MOCK_FILES);
          setPlan(MOCK_PLAN);
          setJournal(MOCK_JOURNAL);
          showToast(`Analyzed ${MOCK_FILES.length} files`, 'info');
          setIsScanning(false);
        }, 400);
        return;
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || '';
      if (msg.includes('SAFETY_BLOCKED')) {
        const cleanMsg = msg.replace(/.*\[SAFETY_BLOCKED\]\s*/, '');
        showToast(`SAFETY GUARD: ${cleanMsg}`, 'error');
        setPlan(null);
        setFiles([]);
      } else {
        showToast(`Scan issue: ${msg}`, 'error');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectFolder = async () => {
    if (!window.tidyFS) {
      showToast('Select folder dialog available in desktop app.', 'info');
      return;
    }
    const selected = await window.tidyFS.selectFolder();
    if (selected) {
      setCurrentFolder(selected);
      runScan(selected);
    }
  };

  const handleSelectDownloads = async () => {
    if (window.tidyFS) {
      const dl = await window.tidyFS.getDefaultDownloads();
      setCurrentFolder(dl);
      runScan(dl);
    } else {
      setCurrentFolder('C:\\Users\\User\\Downloads');
      runScan('C:\\Users\\User\\Downloads');
    }
  };

  const handleSelectDesktop = async () => {
    if (window.tidyFS) {
      const desk = await window.tidyFS.getDefaultDesktop();
      setCurrentFolder(desk);
      runScan(desk);
    } else {
      setCurrentFolder('C:\\Users\\User\\Desktop');
      runScan('C:\\Users\\User\\Desktop');
    }
  };

  const handleExecute = async (selectedActions: TidyAction[]) => {
    if (!plan) return;
    setIsExecuting(true);

    try {
      if (window.tidyFS) {
        const customPlan: TidyPlan = {
          ...plan,
          actions: selectedActions
        };

        const result = await window.tidyFS.executePlan(customPlan, dryRun);

        if (dryRun) {
          showToast(`Dry Run: ${result.movedCount} files would be organized.`, 'info');
        } else {
          showToast(`Organized ${result.movedCount} files. Journal updated.`, 'success');
          runScan(currentFolder);
        }
      } else {
        setTimeout(() => {
          if (dryRun) {
            showToast(`Dry Run: ${selectedActions.length} files previewed with 0 changes.`, 'info');
          } else {
            showToast(`Organized ${selectedActions.length} files.`, 'success');
            setPlan({ ...plan, actions: [] });
          }
          setIsExecuting(false);
        }, 400);
        return;
      }
    } catch (err: unknown) {
      showToast(`Execution issue: ${(err as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRevertLast = async () => {
    if (!currentFolder) return;
    setIsExecuting(true);
    try {
      if (window.tidyFS) {
        const result = await window.tidyFS.revertLast(currentFolder);
        if (result.success) {
          showToast(`Reverted ${result.revertedCount} files back to original spots.`, 'success');
          runScan(currentFolder);
        } else {
          showToast(`Rollback issue: ${result.errors.join(', ')}`, 'error');
        }
      } else {
        showToast('Rollback completed. Files restored.', 'success');
      }
    } catch (err: unknown) {
      showToast(`Revert issue: ${(err as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRevertEntry = async (_entryId: string) => {
    handleRevertLast();
  };

  const handleSaveSettings = async (newSettings: TidySettings) => {
    setSettings(newSettings);
    if (window.tidyFS) {
      await window.tidyFS.saveSettings(newSettings);
    }
    showToast('Preferences saved.', 'success');
    runScan(currentFolder, newSettings);
  };

  const handleRevealFile = (filePath: string) => {
    if (window.tidyFS) {
      window.tidyFS.openInExplorer(filePath);
    } else {
      showToast(`Revealing item: ${filePath.split(/[\\/]/).pop()}`, 'info');
    }
  };

  const handleExportReport = () => {
    if (!plan || files.length === 0) {
      showToast('No files to export. Run a scan first.', 'info');
      return;
    }

    try {
      const headers = ['File Name', 'Relative Path', 'Category', 'Size (Bytes)', 'Age (Days)', 'Is Duplicate', 'Is Heavy', 'Action Reason', 'Suggested Folder'];
      const rows = files.map(f => {
        const action = plan.actions.find(a => a.sourcePath === f.path);
        const ageDays = Math.max(0, Math.floor((Date.now() - f.modifiedAt) / (1000 * 60 * 60 * 24)));
        return [
          `"${(f.name || '').replace(/"/g, '""')}"`,
          `"${(f.path || '').replace(/"/g, '""')}"`,
          f.category,
          f.size,
          ageDays,
          f.duplicateOf ? 'YES' : 'NO',
          f.isHeavy ? 'YES' : 'NO',
          `"${(action?.reason || '').replace(/"/g, '""')}"`,
          `"${(action?.targetPath ? action.targetPath.replace(/"/g, '""') : '')}"`
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `tidyfs-audit-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Audit report exported to CSV.', 'success');
    } catch (err: unknown) {
      showToast(`Export failed: ${(err as Error).message}`, 'error');
    }
  };

  const handleStrategyChange = async (strategy: OrganizationStrategy) => {
    const updatedSettings = { ...settings, organizationStrategy: strategy };
    setSettings(updatedSettings);
    if (window.tidyFS) {
      await window.tidyFS.saveSettings(updatedSettings);
    }
    showToast(`Segregation strategy: ${strategy.replace(/-/g, ' ').toUpperCase()}`, 'info');
    runScan(currentFolder, updatedSettings);
  };

  const handleQuickCleanDecay = () => {
    const decayActions = plan?.actions.filter(a => a.reason.toLowerCase().includes('decay') || a.reason.toLowerCase().includes('installer') || a.category === 'Installers') || [];
    if (decayActions.length > 0) {
      handleExecute(decayActions);
    } else {
      setActiveTab('decay');
      showToast('No expired installers to organize.', 'info');
    }
  };

  const handleQuickCleanDuplicates = () => {
    setActiveTab('duplicates');
    const dupCount = files.filter(f => f.duplicateOf).length;
    showToast(`Showing ${dupCount} duplicate copies. Review and reclaim storage.`, 'info');
  };

  const hasHistory = journal.some(j => j.status === 'applied');

  return (
    <div className={`min-h-screen w-full ${
      osTheme === 'mac'
        ? 'bg-[#ebedf2] dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100'
        : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    } flex flex-col font-sans select-none transition-colors relative overflow-x-hidden`}>
      {/* macOS Professional Neutral Vignette (Clean & Monochrome) */}
      {osTheme === 'mac' && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-gradient-to-b from-white/40 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-black/30" />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`glass-surface px-4 py-2.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2.5 border ${
              toast.type === 'success'
                ? 'border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'border-rose-300 dark:border-rose-700/80 text-rose-800 dark:text-rose-300'
                : 'border-blue-300 dark:border-blue-700/80 text-blue-800 dark:text-blue-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="font-mono tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Normal Full-Width Application Header */}
      <Header
        currentFolder={currentFolder}
        onSelectFolder={handleSelectFolder}
        onSelectDownloads={handleSelectDownloads}
        onSelectDesktop={handleSelectDesktop}
        onScan={() => runScan(currentFolder)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDownloaders={() => setIsDownloadersOpen(true)}
        onRevertLast={handleRevertLast}
        hasHistory={hasHistory}
        isScanning={isScanning}
        theme={theme}
        onToggleTheme={toggleTheme}
        osTheme={osTheme}
        onSelectOSTheme={setOsTheme}
      />

      {/* Main Full-Width Content Container */}
      <main className="relative z-10 flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 flex flex-col space-y-5">
        {/* Top 4 Metrics Cards */}
        <StatsCards plan={plan} files={files} />

        {/* Proportional Storage Distribution & Quick Action Presets */}
        <StorageBar
          plan={plan}
          activeCategory={activeCategory}
          onFilterCategory={(cat) => {
            setActiveCategory(cat);
            setActiveTab('plan');
          }}
          onQuickCleanDecay={handleQuickCleanDecay}
          onQuickCleanDuplicates={handleQuickCleanDuplicates}
          onExportReport={handleExportReport}
        />

        {/* Industrial / Platform-Adaptive Tab Switcher Bar */}
        <div className={`flex items-center gap-2 border-b ${
          osTheme === 'linux'
            ? 'border-emerald-600/40 bg-black/25 p-1.5 rounded-none font-mono'
            : osTheme === 'mac'
            ? 'border-white/20 dark:border-white/10 pb-3 bg-white/20 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-full'
            : 'border-slate-200 dark:border-slate-800/80 pb-2.5 font-mono'
        } overflow-x-auto`}>
          <button
            onClick={() => setActiveTab('plan')}
            className={`btn-brute px-4 py-2 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-emerald-500' : 'rounded-md'
            } text-xs sm:text-[13px] font-black flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
              activeTab === 'plan'
                ? osTheme === 'linux'
                  ? 'bg-emerald-500 text-black border-emerald-400 font-mono shadow-xs'
                  : osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : osTheme === 'mac'
                ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/35 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 backdrop-blur-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-850/70 border border-slate-300 dark:border-slate-700/70'
            }`}
          >
            <FolderSync className="h-4 w-4 text-emerald-500" />
            <span>{osTheme === 'linux' ? '[01:ORGANIZE]' : '01 // ORGANIZE'}</span>
            {plan && plan.actions.length > 0 && (
              <span className={`px-2 py-0.5 ${
                osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none' : 'rounded'
              } bg-emerald-500 text-slate-950 text-[11px] font-black`}>
                {plan.actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('decay')}
            className={`btn-brute px-4 py-2 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-amber-500' : 'rounded-md'
            } text-xs sm:text-[13px] font-black flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
              activeTab === 'decay'
                ? osTheme === 'linux'
                  ? 'bg-amber-500 text-black border-amber-400 font-mono shadow-xs'
                  : osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : osTheme === 'mac'
                ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/35 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 backdrop-blur-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-850/70 border border-slate-300 dark:border-slate-700/70'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-500" />
            <span>{osTheme === 'linux' ? '[02:DECAY]' : '02 // DECAY'}</span>
            {files.filter(f => f.isInstallerOrArchive).length > 0 && (
              <span className={`px-2 py-0.5 ${
                osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none' : 'rounded'
              } bg-amber-500 text-slate-950 text-[11px] font-black`}>
                {files.filter(f => f.isInstallerOrArchive).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`btn-brute px-4 py-2 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-rose-500' : 'rounded-md'
            } text-xs sm:text-[13px] font-black flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
              activeTab === 'duplicates'
                ? osTheme === 'linux'
                  ? 'bg-rose-500 text-white border-rose-400 font-mono shadow-xs'
                  : osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : osTheme === 'mac'
                ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/35 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 backdrop-blur-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-850/70 border border-slate-300 dark:border-slate-700/70'
            }`}
          >
            <Copy className="h-4 w-4 text-rose-500" />
            <span>{osTheme === 'linux' ? '[03:DEDUP]' : '03 // DEDUP'}</span>
            {files.filter(f => f.duplicateOf).length > 0 && (
              <span className={`px-2 py-0.5 ${
                osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none' : 'rounded'
              } bg-rose-500 text-slate-950 text-[11px] font-black`}>
                {files.filter(f => f.duplicateOf).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('heavy')}
            className={`btn-brute px-4 py-2 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-cyan-500' : 'rounded-md'
            } text-xs sm:text-[13px] font-black flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
              activeTab === 'heavy'
                ? osTheme === 'linux'
                  ? 'bg-cyan-500 text-black border-cyan-400 font-mono shadow-xs'
                  : osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : osTheme === 'mac'
                ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/35 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 backdrop-blur-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-850/70 border border-slate-300 dark:border-slate-700/70'
            }`}
          >
            <HardDrive className="h-4 w-4 text-blue-500" />
            <span>{osTheme === 'linux' ? '[04:HEAVY]' : '04 // HEAVY_FILES'}</span>
            {plan && (plan.summary.heavyCount || 0) > 0 && (
              <span className={`px-2 py-0.5 ${
                osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none' : 'rounded'
              } bg-blue-500 text-slate-950 text-[11px] font-black`}>
                {plan.summary.heavyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`btn-brute px-4 py-2 ${
              osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none border border-slate-500' : 'rounded-md'
            } text-xs sm:text-[13px] font-black flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
              activeTab === 'journal'
                ? osTheme === 'linux'
                  ? 'bg-slate-700 text-emerald-300 border-slate-500 font-mono shadow-xs'
                  : osTheme === 'mac'
                  ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
                : osTheme === 'mac'
                ? 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white/35 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 backdrop-blur-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-850/70 border border-slate-300 dark:border-slate-700/70'
            }`}
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>{osTheme === 'linux' ? '[05:JOURNAL]' : '05 // JOURNAL'}</span>
            {journal.length > 0 && (
              <span className={`px-2 py-0.5 ${
                osTheme === 'mac' ? 'rounded-full' : osTheme === 'linux' ? 'rounded-none' : 'rounded'
              } bg-slate-700 text-white text-[11px] font-black`}>
                {journal.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab View Section */}
        <div className="flex-1">
          {activeTab === 'plan' && (
            <PlanView
              plan={plan}
              dryRun={dryRun}
              setDryRun={setDryRun}
              onExecute={handleExecute}
              isExecuting={isExecuting}
              onRevealFile={handleRevealFile}
              filterCategory={activeCategory}
              currentStrategy={settings.organizationStrategy}
              onChangeStrategy={handleStrategyChange}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'decay' && (
            <DecayView
              files={files}
              decayDays={settings.decayDays}
              onRevealFile={handleRevealFile}
            />
          )}

          {activeTab === 'duplicates' && (
            <DuplicatesView
              files={files}
              onRevealFile={handleRevealFile}
            />
          )}

          {activeTab === 'heavy' && (
            <HeavyFilesView
              files={files}
              thresholdMB={settings.heavyFileThresholdMB || 50}
              onRevealFile={handleRevealFile}
              onThresholdChange={(mb) => {
                handleSaveSettings({ ...settings, heavyFileThresholdMB: mb });
              }}
            />
          )}

          {activeTab === 'journal' && (
            <JournalView
              journal={journal}
              onRevert={handleRevertEntry}
              isReverting={isExecuting}
            />
          )}
        </div>
      </main>

      {/* Industrial / Platform Status Bar */}
      <footer className={`w-full ${
        osTheme === 'mac'
          ? 'bg-white/80 dark:bg-[#0c101c]/80 backdrop-blur-md border-t border-black/5 dark:border-white/10'
          : osTheme === 'linux'
          ? 'bg-black text-emerald-400 border-t-2 border-emerald-600 font-mono'
          : 'bg-slate-100 dark:bg-[#0b0f19] border-t border-slate-300 dark:border-slate-800'
      } px-6 py-1.5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono select-none text-slate-600 dark:text-slate-400`}>
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            {osTheme === 'linux' ? 'CWD // ' : 'PATH // '}
            <span className="text-slate-600 dark:text-slate-400 font-bold">{currentFolder || 'UNDEFINED'}</span>
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            MONITORED: <strong className="text-slate-900 dark:text-white">{files.length} ITEMS</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0 font-bold">
          <span>
            MODE: <strong className={osTheme === 'linux' ? 'text-cyan-400' : osTheme === 'mac' ? 'text-teal-400' : 'text-blue-500'}>
              {osTheme === 'mac' ? 'MACOS LIQUID GLASS' : osTheme === 'linux' ? 'LINUX PUNCHY TECH' : 'WINDOWS FLUENT BOLD'}
            </strong>
          </span>
          <span>|</span>
          <span>
            JOURNAL: <strong className="text-slate-900 dark:text-white">{journal.length} COMMITS</strong>
          </span>
          <span>|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-black">
            STATUS: {osTheme === 'linux' ? '[DAEMON_OK]' : 'READY'}
          </span>
        </div>
      </footer>

      {/* Settings Modal Sheet */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Platform Downloaders Modal */}
      <DownloadersModal
        isOpen={isDownloadersOpen}
        onClose={() => setIsDownloadersOpen(false)}
      />
    </div>
  );
};
