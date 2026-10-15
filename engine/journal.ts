import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { JournalEntry } from './types.js';

export function getJournalStorageDir(): string {
  if (process.env.TIDYFS_JOURNAL_DIR) {
    const custom = process.env.TIDYFS_JOURNAL_DIR;
    if (!fs.existsSync(custom)) fs.mkdirSync(custom, { recursive: true });
    return custom;
  }

  let baseDir: string;
  if (process.platform === 'win32') {
    baseDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  } else if (process.platform === 'darwin') {
    baseDir = path.join(os.homedir(), 'Library', 'Application Support');
  } else {
    baseDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  }

  const dir = path.join(baseDir, 'TidyFS', 'journals');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getJournalPathForFolder(targetFolder: string): string {
  const normalized = path.resolve(targetFolder).toLowerCase();
  const folderHash = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  const safeBase = path.basename(targetFolder).replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(getJournalStorageDir(), `journal_${safeBase}_${folderHash}.json`);
}

export class JournalManager {
  private journalPath: string;
  private targetFolder: string;

  constructor(targetFolder: string) {
    this.targetFolder = targetFolder;
    this.journalPath = getJournalPathForFolder(targetFolder);

    // Migration & cleanup: if old .tidyfs-journal.json is present in the monitored folder, clean it up!
    this.cleanLegacyFolderJournal();
  }

  private cleanLegacyFolderJournal(): void {
    try {
      const legacyPath = path.join(this.targetFolder, '.tidyfs-journal.json');
      if (fs.existsSync(legacyPath)) {
        const raw = fs.readFileSync(legacyPath, 'utf8');
        const legacyEntries = JSON.parse(raw) as JournalEntry[];
        if (Array.isArray(legacyEntries) && legacyEntries.length > 0) {
          const currentHistory = this.getHistory();
          const merged = [...legacyEntries, ...currentHistory];
          // Remove duplicates by ID
          const uniqueMap = new Map<string, JournalEntry>();
          for (const item of merged) {
            if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
          }
          fs.writeFileSync(this.journalPath, JSON.stringify(Array.from(uniqueMap.values()), null, 2), 'utf8');
        }
        // Remove the unwanted JSON file completely from user folder
        fs.unlinkSync(legacyPath);
      }
    } catch {
      // Ignored: silent cleanup
    }
  }

  public getHistory(): JournalEntry[] {
    try {
      if (!fs.existsSync(this.journalPath)) {
        return [];
      }
      const raw = fs.readFileSync(this.journalPath, 'utf8');
      return JSON.parse(raw) as JournalEntry[];
    } catch {
      return [];
    }
  }

  public recordTransaction(entry: JournalEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    // Keep last 50 transactions
    const trimmed = history.slice(0, 50);
    fs.writeFileSync(this.journalPath, JSON.stringify(trimmed, null, 2), 'utf8');
  }

  public revertTransaction(entryId?: string): { success: boolean; revertedCount: number; errors: string[] } {
    const history = this.getHistory();
    if (history.length === 0) {
      return { success: false, revertedCount: 0, errors: ['No transaction history found to revert.'] };
    }

    // Default to the most recent applied entry
    const entry = entryId 
      ? history.find(e => e.id === entryId && e.status === 'applied')
      : history.find(e => e.status === 'applied');

    if (!entry) {
      return { success: false, revertedCount: 0, errors: ['No active transaction found to revert.'] };
    }

    let revertedCount = 0;
    const errors: string[] = [];

    // Reverse actions in opposite order
    for (const action of [...entry.actions].reverse()) {
      try {
        if (fs.existsSync(action.currentPath)) {
          const originalDir = path.dirname(action.sourcePath);
          if (!fs.existsSync(originalDir)) {
            fs.mkdirSync(originalDir, { recursive: true });
          }
          fs.renameSync(action.currentPath, action.sourcePath);
          revertedCount++;
        } else {
          errors.push(`File missing at ${action.currentPath}; could not restore to original location.`);
        }
      } catch (err: unknown) {
        errors.push(`Failed to move ${action.currentPath}: ${(err as Error).message}`);
      }
    }

    entry.status = 'reverted';
    fs.writeFileSync(this.journalPath, JSON.stringify(history, null, 2), 'utf8');

    return {
      success: errors.length === 0,
      revertedCount,
      errors
    };
  }
}
