import fs from 'fs';
import path from 'path';
import { ScannedFile, TidyAction, TidyPlan, TidySettings, Category, OrganizationStrategy } from './types.js';
import { scanFolder } from './scanner.js';
import { detectDuplicates } from './dedup.js';
import { evaluateCustomRules, getCompoundExtension } from './classifier.js';
import { JournalManager } from './journal.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Resolves the target relative path based on the user's chosen organization strategy
 */
function resolveStrategyPath(
  file: ScannedFile,
  settings: TidySettings
): { relativeFolder: string; reason: string } {
  // 1. Check custom user rules first (Highest priority override)
  if (settings.customRules && settings.customRules.length > 0) {
    const customMatch = evaluateCustomRules(file.name, file.size, settings.customRules);
    if (customMatch && customMatch.matched) {
      return {
        relativeFolder: customMatch.targetFolder,
        reason: customMatch.reason
      };
    }
  }

  const d = new Date(file.modifiedAt || file.createdAt);
  const year = d.getFullYear().toString();
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const monthName = MONTH_NAMES[d.getMonth()] || 'Unknown';

  switch (settings.organizationStrategy) {
    case 'date-year-month':
      return {
        relativeFolder: path.join(year, `${monthNum} - ${monthName}`),
        reason: `Timeline segregation (${year}/${monthName})`
      };

    case 'date-year':
      return {
        relativeFolder: year,
        reason: `Yearly segregation (${year})`
      };

    case 'extension': {
      const ext = getCompoundExtension(file.name).replace('.', '').toUpperCase() || 'NO_EXT';
      return {
        relativeFolder: ext,
        reason: `File format segregation (${ext})`
      };
    }

    case 'size-tier': {
      if (file.size >= 100 * 1024 * 1024) {
        return { relativeFolder: 'Heavy (>100MB)', reason: 'Size tier segregation (Heavy files)' };
      } else if (file.size >= 10 * 1024 * 1024) {
        return { relativeFolder: 'Medium (10MB-100MB)', reason: 'Size tier segregation (Medium files)' };
      }
      return { relativeFolder: 'Standard (<10MB)', reason: 'Size tier segregation (Standard files)' };
    }

    case 'custom-rules':
      // If user strictly selected custom rules and none matched, route to Unmatched
      return {
        relativeFolder: 'Unmatched_Rules',
        reason: 'Unmatched by custom rules'
      };

    case 'category':
    default: {
      const baseCategoryFolder = settings.categoryFolders[file.category] || file.category;
      if (settings.dateSubfolders) {
        return {
          relativeFolder: path.join(baseCategoryFolder, year),
          reason: `Organized into ${baseCategoryFolder} (${year}) by semantic rule`
        };
      }
      return {
        relativeFolder: baseCategoryFolder,
        reason: `Organized into ${baseCategoryFolder} by semantic rule`
      };
    }
  }
}

export async function createTidyPlan(targetFolder: string, settings: TidySettings): Promise<TidyPlan> {
  const files = scanFolder(targetFolder, settings);
  const duplicates = settings.enableDeduplicate 
    ? await detectDuplicates(files, settings) 
    : new Map<string, string>();

  const actions: TidyAction[] = [];
  const categoryCounts: Record<Category, number> = {
    Finances: 0,
    Travel: 0,
    Legal: 0,
    Academic: 0,
    Media: 0,
    Design: 0,
    Documents: 0,
    Code: 0,
    Archives: 0,
    Installers: 0,
    Other: 0
  };

  const categoryBytes: Record<Category, number> = {
    Finances: 0,
    Travel: 0,
    Legal: 0,
    Academic: 0,
    Media: 0,
    Design: 0,
    Documents: 0,
    Code: 0,
    Archives: 0,
    Installers: 0,
    Other: 0
  };

  let decayCount = 0;
  let decayBytes = 0;
  let duplicateCount = 0;
  let duplicateBytes = 0;
  let heavyCount = 0;
  let heavyBytes = 0;
  let threatCount = 0;
  let threatBytes = 0;

  for (const file of files) {
    categoryCounts[file.category]++;
    categoryBytes[file.category] += file.size;

    if (file.isHeavy) {
      heavyCount++;
      heavyBytes += file.size;
    }

    // 0. PRIORITY 0: Threat quarantine (Virus / deception heuristics)
    if (file.threat && settings.enableSecurityScanner !== false) {
      threatCount++;
      threatBytes += file.size;

      const quarantineFolder = path.join(targetFolder, settings.quarantineFolderName || 'TidyFS-Quarantine');
      const targetPath = getUniqueDestination(quarantineFolder, file.name);

      actions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'quarantine',
        sourcePath: file.path,
        targetPath,
        fileName: file.name,
        fileSize: file.size,
        reason: `[SECURITY QUARANTINE] ${file.threat.reason}`,
        category: file.category,
        threat: file.threat
      });
      continue;
    }

    // 1. Is it a duplicate?
    if (duplicates.has(file.path)) {
      const originalPath = duplicates.get(file.path)!;
      duplicateCount++;
      duplicateBytes += file.size;

      const dupFolder = path.join(targetFolder, 'Duplicates');
      const targetPath = getUniqueDestination(dupFolder, file.name);

      actions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'delete_duplicate',
        sourcePath: file.path,
        targetPath,
        fileName: file.name,
        fileSize: file.size,
        reason: `Duplicate of ${path.basename(originalPath)}`,
        category: file.category
      });
      continue;
    }

    // 2. Is it expired and ready for decay?
    if (settings.enableDecay && file.decayState === 'expired') {
      decayCount++;
      decayBytes += file.size;

      const decayFolder = path.join(targetFolder, settings.decayFolderName);
      const targetPath = getUniqueDestination(decayFolder, file.name);

      actions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'trash',
        sourcePath: file.path,
        targetPath,
        fileName: file.name,
        fileSize: file.size,
        reason: `Expired temporary installer/archive (${settings.decayDays}+ days old)`,
        category: file.category
      });
      continue;
    }

    // 3. Organization Strategy Routing
    if (settings.enableCategorize) {
      const { relativeFolder, reason } = resolveStrategyPath(file, settings);
      const destinationFolder = path.join(targetFolder, relativeFolder);
      const targetPath = getUniqueDestination(destinationFolder, file.name);

      // Only move if not already in that exact folder
      if (path.dirname(file.path) !== destinationFolder) {
        actions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'move',
          sourcePath: file.path,
          targetPath,
          fileName: file.name,
          fileSize: file.size,
          reason,
          category: file.category
        });
      }
    }
  }

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return {
    targetFolder,
    timestamp: Date.now(),
    totalFiles: files.length,
    totalBytes,
    actions,
    summary: {
      categoryCounts,
      categoryBytes,
      decayCount,
      decayBytes,
      duplicateCount,
      duplicateBytes,
      heavyCount,
      heavyBytes,
      threatCount,
      threatBytes
    }
  };
}

export function executeTidyPlan(
  plan: TidyPlan,
  dryRun = false
): { success: boolean; movedCount: number; errors: string[] } {
  if (dryRun) {
    return {
      success: true,
      movedCount: plan.actions.length,
      errors: []
    };
  }

  const errors: string[] = [];
  const journalActions: { sourcePath: string; currentPath: string; type: 'move' | 'trash' | 'quarantine' }[] = [];
  let movedCount = 0;

  for (const action of plan.actions) {
    try {
      if (!fs.existsSync(action.sourcePath)) {
        continue;
      }

      const targetDir = path.dirname(action.targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const safeTarget = getUniqueDestination(targetDir, path.basename(action.targetPath));
      fs.renameSync(action.sourcePath, safeTarget);

      movedCount++;
      journalActions.push({
        sourcePath: action.sourcePath,
        currentPath: safeTarget,
        type: action.type === 'trash' ? 'trash' : action.type === 'quarantine' ? 'quarantine' : 'move'
      });
    } catch (err: unknown) {
      errors.push(`Error moving ${action.fileName}: ${(err as Error).message}`);
    }
  }

  if (journalActions.length > 0) {
    const journal = new JournalManager(plan.targetFolder);
    journal.recordTransaction({
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      targetFolder: plan.targetFolder,
      actions: journalActions,
      status: 'applied'
    });
  }

  return {
    success: errors.length === 0,
    movedCount,
    errors
  };
}

function getUniqueDestination(targetDir: string, originalName: string): string {
  let targetPath = path.join(targetDir, originalName);
  if (!fs.existsSync(targetPath)) return targetPath;

  const ext = path.extname(originalName);
  const base = originalName.slice(0, originalName.length - ext.length);
  let counter = 1;

  while (fs.existsSync(targetPath)) {
    targetPath = path.join(targetDir, `${base}_${counter}${ext}`);
    counter++;
  }

  return targetPath;
}
