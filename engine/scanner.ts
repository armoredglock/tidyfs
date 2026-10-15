import fs from 'fs';
import path from 'path';
import { ScannedFile, TidySettings } from './types.js';
import { classifyFile } from './classifier.js';
import { calculateDecay } from './decay.js';

export function scanFolder(folderPath: string, settings: TidySettings): ScannedFile[] {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Directory does not exist: ${folderPath}`);
  }

  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  const results: ScannedFile[] = [];
  const now = Date.now();
  const heavyThresholdBytes = (settings.heavyFileThresholdMB || 100) * 1024 * 1024;

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const fileName = entry.name;
    const filePath = path.join(folderPath, fileName);
    const ext = path.extname(fileName).toLowerCase();

    // Skip hidden files, system files, and ignored files
    if (fileName.startsWith('.') || fileName.startsWith('~$')) continue;
    if (fileName === 'desktop.ini' || fileName === 'Thumbs.db' || fileName === '.DS_Store') continue;
    if (fileName === '.tidyfs-journal.json') continue;
    if (settings.ignoredExtensions.includes(ext)) continue;
    if (settings.ignoredPatterns.some(p => fileName.toLowerCase().includes(p.toLowerCase()))) continue;

    try {
      const stats = fs.statSync(filePath);
      const fileAgeMs = now - Math.min(stats.birthtimeMs || stats.mtimeMs, stats.mtimeMs);

      const { category, isInstallerOrArchive } = classifyFile(filePath);
      const { decayState, daysUntilDecay } = calculateDecay(fileAgeMs, isInstallerOrArchive, settings);
      const isHeavy = stats.size >= heavyThresholdBytes;

      results.push({
        path: filePath,
        name: fileName,
        extension: ext,
        size: stats.size,
        createdAt: stats.birthtimeMs || stats.mtimeMs,
        modifiedAt: stats.mtimeMs,
        category,
        decayState,
        daysUntilDecay,
        isInstallerOrArchive,
        isHeavy
      });
    } catch {
      // File could be locked or transient
    }
  }

  return results;
}
