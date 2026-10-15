import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { ScannedFile, TidySettings } from './types.js';

/**
 * Computes SHA-256 hash strictly on-device without any network exposure.
 * Only executed when privacyMode is explicitly set to 'local-hash'.
 */
export async function computeFileHash(filePath: string, sampleBytes = 1024 * 1024 * 5): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const stats = fs.statSync(filePath);
      const hash = crypto.createHash('sha256');

      // Include size in the seed
      hash.update(`size:${stats.size}`);

      if (stats.size === 0) {
        return resolve('empty_file');
      }

      // If file is smaller than sample, hash the entire file
      if (stats.size <= sampleBytes) {
        const stream = fs.createReadStream(filePath);
        stream.on('data', (chunk: Buffer | string) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err: Error) => reject(err));
      } else {
        // Read start and end slices for verification of large files
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(1024 * 64);
        
        // Read head
        fs.readSync(fd, buffer, 0, buffer.length, 0);
        hash.update(buffer);

        // Read tail
        const tailOffset = Math.max(0, stats.size - buffer.length);
        fs.readSync(fd, buffer, 0, buffer.length, tailOffset);
        hash.update(buffer);

        fs.closeSync(fd);
        resolve(hash.digest('hex'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Detects duplicates with strict respect to user's privacy settings.
 * In 'strict-metadata' mode, files are NEVER opened or read.
 */
export async function detectDuplicates(
  files: ScannedFile[],
  settings?: TidySettings
): Promise<Map<string, string>> {
  // Map of filePath -> originalFilePath that it is a duplicate of
  const duplicateMap = new Map<string, string>();
  const isStrictMetadata = !settings || settings.privacyMode === 'strict-metadata';

  // 1. Group by exact file size
  const sizeMap = new Map<number, ScannedFile[]>();
  for (const file of files) {
    if (file.size <= 0) continue;
    const group = sizeMap.get(file.size) || [];
    group.push(file);
    sizeMap.set(file.size, group);
  }

  // 2. Size-matching analysis
  for (const group of sizeMap.values()) {
    if (group.length < 2) continue;

    if (isStrictMetadata) {
      // In STRICT METADATA MODE: Zero file opens.
      // Match by exact byte size AND name copy patterns or clean name collision
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const f1 = group[i];
          const f2 = group[j];
          if (duplicateMap.has(f1.path) && duplicateMap.has(f2.path)) continue;

          const isF1Copy = hasDuplicateSuffix(f1.name);
          const isF2Copy = hasDuplicateSuffix(f2.name);
          const clean1 = cleanDuplicateSuffix(f1.name).toLowerCase();
          const clean2 = cleanDuplicateSuffix(f2.name).toLowerCase();

          if (clean1 === clean2) {
            // One is a named duplicate copy of the other
            if (isF2Copy && !isF1Copy) {
              duplicateMap.set(f2.path, f1.path);
              f2.duplicateOf = f1.path;
            } else if (isF1Copy && !isF2Copy) {
              duplicateMap.set(f1.path, f2.path);
              f1.duplicateOf = f2.path;
            } else {
              // Both or neither have suffix, prefer older creation time as original
              const original = f1.createdAt <= f2.createdAt ? f1 : f2;
              const duplicate = original === f1 ? f2 : f1;
              duplicateMap.set(duplicate.path, original.path);
              duplicate.duplicateOf = original.path;
            }
          }
        }
      }
    } else {
      // In LOCAL-HASH MODE: Compute SHA-256 in memory
      const hashMap = new Map<string, ScannedFile>();
      for (const file of group) {
        try {
          const hash = await computeFileHash(file.path);
          file.hash = hash;

          if (hashMap.has(hash)) {
            const original = hashMap.get(hash)!;
            const isOriginalBetter = original.createdAt <= file.createdAt || !hasDuplicateSuffix(original.name);
            if (isOriginalBetter) {
              duplicateMap.set(file.path, original.path);
              file.duplicateOf = original.path;
            } else {
              duplicateMap.set(original.path, file.path);
              original.duplicateOf = file.path;
              hashMap.set(hash, file);
            }
          } else {
            hashMap.set(hash, file);
          }
        } catch {
          // Ignore file read error if locked
        }
      }
    }
  }

  // 3. Name-based duplicate pattern check (e.g. "report (1).pdf" vs "report.pdf")
  for (const file of files) {
    if (duplicateMap.has(file.path)) continue;
    const baseDir = path.dirname(file.path);
    const cleanedName = cleanDuplicateSuffix(file.name);
    if (cleanedName !== file.name) {
      const candidateOriginal = path.join(baseDir, cleanedName);
      const originalExists = files.find(f => f.path.toLowerCase() === candidateOriginal.toLowerCase());
      if (originalExists && originalExists.path !== file.path) {
        duplicateMap.set(file.path, originalExists.path);
        file.duplicateOf = originalExists.path;
      }
    }
  }

  return duplicateMap;
}

function hasDuplicateSuffix(fileName: string): boolean {
  return / \(\d+\)\.[^.]+$/.test(fileName) || / - Copy\.[^.]+$/.test(fileName) || /_\(\d+\)\.[^.]+$/.test(fileName);
}

function cleanDuplicateSuffix(fileName: string): string {
  const ext = path.extname(fileName);
  const nameWithoutExt = fileName.slice(0, fileName.length - ext.length);
  const cleaned = nameWithoutExt.replace(/ \(\d+\)$/, '').replace(/ - Copy$/, '').replace(/_\(\d+\)$/, '');
  return cleaned + ext;
}
