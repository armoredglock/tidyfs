import { contextBridge, ipcRenderer } from 'electron';
import { ScannedFile, TidyPlan, TidySettings, JournalEntry } from '../engine/types.js';

export interface TidyFSAPI {
  selectFolder: () => Promise<string | null>;
  getDefaultDownloads: () => Promise<string>;
  getDefaultDesktop: () => Promise<string>;
  scanFolder: (folder: string, settings: TidySettings) => Promise<ScannedFile[]>;
  createPlan: (folder: string, settings: TidySettings) => Promise<TidyPlan>;
  executePlan: (plan: TidyPlan, dryRun: boolean) => Promise<{ success: boolean; movedCount: number; errors: string[] }>;
  revertLast: (folder: string) => Promise<{ success: boolean; revertedCount: number; errors: string[] }>;
  getJournal: (folder: string) => Promise<JournalEntry[]>;
  openInExplorer: (targetPath: string) => Promise<void>;
  getSettings: () => Promise<TidySettings>;
  saveSettings: (settings: TidySettings) => Promise<void>;
}

const api: TidyFSAPI = {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  getDefaultDownloads: () => ipcRenderer.invoke('app:getDefaultDownloads'),
  getDefaultDesktop: () => ipcRenderer.invoke('app:getDefaultDesktop'),
  scanFolder: (folder, settings) => ipcRenderer.invoke('tidy:scan', folder, settings),
  createPlan: (folder, settings) => ipcRenderer.invoke('tidy:createPlan', folder, settings),
  executePlan: (plan, dryRun) => ipcRenderer.invoke('tidy:executePlan', plan, dryRun),
  revertLast: (folder) => ipcRenderer.invoke('tidy:revertLast', folder),
  getJournal: (folder) => ipcRenderer.invoke('tidy:getJournal', folder),
  openInExplorer: (targetPath) => ipcRenderer.invoke('app:openInExplorer', targetPath),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
};

contextBridge.exposeInMainWorld('tidyFS', api);
