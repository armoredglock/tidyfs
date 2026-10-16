import fs from 'fs';
import path from 'path';
import { ScannedFile, TidySettings } from './types.js';
import { classifyFile } from './classifier.js';
import { calculateDecay } from './decay.js';
import { analyzeThreat } from './threatScanner.js';
import { validateMonitoredDirectory, isProtectedSystemFile, PRESERVED_SYSTEM_EXTENSIONS } from './safety.js';

export function scanFolder(folderPath: string, settings: TidySettings): ScannedFile[] {
  // 1. Strict Operating System & Drive Safety Guardrail
  const safety = validateMonitoredDirectory(folderPath);
  if (!safety.safe) {
    throw new Error(`[SAFETY_BLOCKED] ${safety.reason}`);
  }

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

    // Skip hidden files, system files, and protected files
    if (fileName.startsWith('.') || fileName.startsWith('~$')) continue;
    if (isProtectedSystemFile(fileName)) continue;
    if (PRESERVED_SYSTEM_EXTENSIONS.has(ext)) continue;
    if (settings.ignoredExtensions.includes(ext)) continue;
    if (settings.ignoredPatterns.some(p => fileName.toLowerCase().includes(p.toLowerCase()))) continue;

    try {
      const stats = fs.statSync(filePath);
      const fileAgeMs = now - Math.min(stats.birthtimeMs || stats.mtimeMs, stats.mtimeMs);

      // Threat Analysis (Double extension spoofing, RTLO, dangerous scripts)
      const threat = settings.enableSecurityScanner !== false 
        ? analyzeThreat(fileName, stats.size) || undefined 
        : undefined;

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
        isHeavy,
        threat
      });
    } catch {
      // File could be locked or transient
    }
  }

  return results;
}
