import fs from 'fs';
import path from 'path';
import { ScannedFile, TidyAction, TidyPlan, TidySettings, Category } from './types.js';
import { scanFolder } from './scanner.js';
import { detectDuplicates } from './dedup.js';
import { JournalManager } from './journal.js';

export async function createTidyPlan(targetFolder: string, settings: TidySettings): Promise<TidyPlan> {
  const files = scanFolder(targetFolder, settings);
  const duplicates = settings.enableDeduplicate ? await detectDuplicates(files) : new Map<string, string>();

  const actions: TidyAction[] = [];
  const categoryCounts: Record<Category, number> = {
    Finances: 0,
    Travel: 0,
    Media: 0,
    Documents: 0,
    Code: 0,
    Archives: 0,
    Installers: 0,
    Other: 0
  };

  const categoryBytes: Record<Category, number> = {
    Finances: 0,
    Travel: 0,
    Media: 0,
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

  for (const file of files) {
    categoryCounts[file.category]++;
    categoryBytes[file.category] += file.size;

    if (file.isHeavy) {
      heavyCount++;
      heavyBytes += file.size;
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

    // 3. Categorize into designated subfolder
    if (settings.enableCategorize && file.category !== 'Other') {
      const subFolderName = settings.categoryFolders[file.category] || file.category;
      const categoryFolder = path.join(targetFolder, subFolderName);
      const targetPath = getUniqueDestination(categoryFolder, file.name);

      // Only move if not already in that category folder
      if (path.dirname(file.path) !== categoryFolder) {
        actions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'move',
          sourcePath: file.path,
          targetPath,
          fileName: file.name,
          fileSize: file.size,
          reason: `Organized into ${subFolderName} by semantic rule`,
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
      heavyBytes
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
  const journalActions: { sourcePath: string; currentPath: string; type: 'move' | 'trash' }[] = [];
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
        type: action.type === 'trash' ? 'trash' : 'move'
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
