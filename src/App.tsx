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
import { ScannedFile, TidyPlan, TidySettings, JournalEntry, DEFAULT_SETTINGS, TidyAction, Category, OrganizationStrategy } from './types.js';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tidyfs_theme', theme);
  }, [theme]);

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
      showToast(`Scan issue: ${(err as Error).message}`, 'error');
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-150">
          <div
            className={`px-4 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-2 border ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/90 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <span>{toast.message}</span>
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
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-5 flex flex-col space-y-4">
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

        {/* Industrial Tab Switcher Bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-300 dark:border-slate-800 pb-2 overflow-x-auto font-mono">
          <button
            onClick={() => setActiveTab('plan')}
            className={`btn-brute px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'plan'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <FolderSync className="h-3.5 w-3.5 text-emerald-500" />
            <span>01 // ORGANIZE</span>
            {plan && plan.actions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded text-[10px] font-black">
                {plan.actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('decay')}
            className={`btn-brute px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'decay'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>02 // DECAY</span>
            {files.filter(f => f.isInstallerOrArchive).length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[10px] font-black">
                {files.filter(f => f.isInstallerOrArchive).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`btn-brute px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'duplicates'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Copy className="h-3.5 w-3.5 text-rose-500" />
            <span>03 // DEDUP</span>
            {files.filter(f => f.duplicateOf).length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-slate-950 rounded text-[10px] font-black">
                {files.filter(f => f.duplicateOf).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('heavy')}
            className={`btn-brute px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'heavy'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5 text-blue-500" />
            <span>04 // HEAVY_FILES</span>
            {plan && (plan.summary.heavyCount || 0) > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-500 text-slate-950 rounded text-[10px] font-black">
                {plan.summary.heavyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`btn-brute px-3 py-1 rounded text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'journal'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>05 // JOURNAL</span>
            {journal.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-700 text-white rounded text-[10px] font-black">
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

      {/* Industrial Telemetry Bottom Status Bar */}
      <footer className="w-full bg-slate-100 dark:bg-[#070b14] border-t border-slate-300 dark:border-slate-800 px-6 py-1.5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono select-none text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            PATH // <span className="text-slate-600 dark:text-slate-400 font-bold">{currentFolder || 'UNDEFINED'}</span>
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            MONITORED: <strong className="text-slate-900 dark:text-white">{files.length} ITEMS</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0 font-bold">
          <span>
            JOURNAL: <strong className="text-slate-900 dark:text-white">{journal.length} COMMITS</strong>
          </span>
          <span>|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-black">
            STATUS: READY
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
