import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { DEFAULT_SETTINGS, TidySettings, TidyPlan } from '../engine/types.js';
import { scanFolder } from '../engine/scanner.js';
import { createTidyPlan, executeTidyPlan } from '../engine/organizer.js';
import { JournalManager } from '../engine/journal.js';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'tidyfs-settings.json');
}

function loadSavedSettings(): TidySettings {
  try {
    const p = getSettingsPath();
    if (fs.existsSync(p)) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(p, 'utf8')) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

function saveUserSettings(settings: TidySettings): void {
  try {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

function getAppIcon(): string | undefined {
  const possiblePaths = [
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../public/icon.png'),
    path.join(app.getAppPath(), 'build/icon.ico'),
    path.join(app.getAppPath(), 'dist/icon.png'),
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(process.resourcesPath, 'icon.png')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function createWindow(): void {
  const appIcon = getAppIcon();
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 980,
    minHeight: 650,
    backgroundColor: '#030712', // slate-950
    title: 'TidyFS — The Intelligent File Organism',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  setupIPCHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Setup IPC handlers
function setupIPCHandlers(): void {
  ipcMain.handle('dialog:selectFolder', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Folder for TidyFS to Monitor'
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('app:getDefaultDownloads', () => {
    return app.getPath('downloads');
  });

  ipcMain.handle('app:getDefaultDesktop', () => {
    return app.getPath('desktop');
  });

  ipcMain.handle('app:openInExplorer', (_event, targetPath: string) => {
    if (fs.existsSync(targetPath)) {
      shell.showItemInFolder(targetPath);
    } else {
      const dir = path.dirname(targetPath);
      if (fs.existsSync(dir)) {
        shell.openPath(dir);
      }
    }
  });

  ipcMain.handle('settings:get', () => {
    return loadSavedSettings();
  });

  ipcMain.handle('settings:save', (_event, settings: TidySettings) => {
    saveUserSettings(settings);
    return true;
  });

  ipcMain.handle('tidy:scan', (_event, folder: string, settings: TidySettings) => {
    return scanFolder(folder, settings);
  });

  ipcMain.handle('tidy:createPlan', async (_event, folder: string, settings: TidySettings) => {
    return await createTidyPlan(folder, settings);
  });

  ipcMain.handle('tidy:executePlan', (_event, plan: TidyPlan, dryRun: boolean) => {
    return executeTidyPlan(plan, dryRun);
  });

  ipcMain.handle('tidy:revertLast', (_event, folder: string) => {
    const journal = new JournalManager(folder);
    return journal.revertTransaction();
  });

  ipcMain.handle('tidy:getJournal', (_event, folder: string) => {
    const journal = new JournalManager(folder);
    return journal.getHistory();
  });
}
