import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { ScannedFile } from './types.js';

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
        // Read start and end slices for ultra fast verification of large files
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

export async function detectDuplicates(files: ScannedFile[]): Promise<Map<string, string>> {
  // Map of filePath -> originalFilePath that it is a duplicate of
  const duplicateMap = new Map<string, string>();

  // 1. Group by exact file size
  const sizeMap = new Map<number, ScannedFile[]>();
  for (const file of files) {
    if (file.size <= 0) continue;
    const group = sizeMap.get(file.size) || [];
    group.push(file);
    sizeMap.set(file.size, group);
  }

  // 2. Hash files with matching sizes
  for (const group of sizeMap.values()) {
    if (group.length < 2) continue;

    const hashMap = new Map<string, ScannedFile>();
    for (const file of group) {
      try {
        const hash = await computeFileHash(file.path);
        file.hash = hash;

        if (hashMap.has(hash)) {
          const original = hashMap.get(hash)!;
          // Determine which is original: shorter name or earlier created
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
  return / \(\d+\)\.[^.]+$/.test(fileName) || / - Copy\.[^.]+$/.test(fileName);
}

function cleanDuplicateSuffix(fileName: string): string {
  const ext = path.extname(fileName);
  const nameWithoutExt = fileName.slice(0, fileName.length - ext.length);
  const cleaned = nameWithoutExt.replace(/ \(\d+\)$/, '').replace(/ - Copy$/, '');
  return cleaned + ext;
}
