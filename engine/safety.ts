import path from 'path';
import os from 'os';

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  code?: 'DRIVE_ROOT' | 'SYSTEM_FOLDER' | 'USER_ROOT' | 'VIRTUAL_NAMESPACE' | 'INVALID_PATH';
}

// System files that must never be moved or touched under any circumstances
export const PRESERVED_SYSTEM_FILES = new Set([
  'desktop.ini',
  'thumbs.db',
  '.ds_store',
  'ntuser.dat',
  'ntuser.dat.log',
  'ntuser.ini',
  'bootmgr',
  'pagefile.sys',
  'swapfile.sys',
  'hiberfil.sys',
  'dumpstack.log.tmp',
  '.tidyfs-journal.json'
]);

// Extensions that represent OS shortcuts and application links that should not be scattered into categories
export const PRESERVED_SYSTEM_EXTENSIONS = new Set([
  '.lnk', // Windows application shortcuts
  '.url', // Internet shortcuts
  '.sys', // System driver files
  '.dll', // Dynamic link libraries
  '.ini'  // Configuration/folder settings
]);

/**
 * Validates whether a target directory is safe for TidyFS to monitor and organize.
 * Strictly prevents selection of drive roots, "This PC", OS system directories,
 * and root user profile paths.
 */
export function validateMonitoredDirectory(dirPath: string): SafetyCheckResult {
  if (!dirPath || typeof dirPath !== 'string' || dirPath.trim().length === 0) {
    return {
      safe: false,
      code: 'INVALID_PATH',
      reason: 'Directory path cannot be empty.'
    };
  }

  const cleanPath = dirPath.trim();

  // 1. Virtual Namespaces ("This PC", CLSIDs, shell paths)
  const lowerClean = cleanPath.toLowerCase();
  if (
    lowerClean === 'this pc' ||
    lowerClean === 'my computer' ||
    lowerClean === 'computer' ||
    lowerClean === 'network' ||
    lowerClean.startsWith('::{') ||
    lowerClean.startsWith('shell:')
  ) {
    return {
      safe: false,
      code: 'VIRTUAL_NAMESPACE',
      reason: '"This PC" is a virtual operating system namespace and cannot be organized. Please select a specific folder (such as Downloads, Desktop, or a dedicated workspace folder).'
    };
  }

  // Normalize absolute path
  let resolved: string;
  try {
    resolved = path.resolve(cleanPath);
  } catch {
    return {
      safe: false,
      code: 'INVALID_PATH',
      reason: `Invalid path: ${cleanPath}`
    };
  }

  const parsed = path.parse(resolved);
  const normalizedResolved = resolved.replace(/[\\/]+$/, '').toLowerCase();
  const normalizedRoot = parsed.root.replace(/[\\/]+$/, '').toLowerCase();

  // 2. Drive Roots (e.g., C:\, D:\, /)
  if (normalizedResolved === normalizedRoot || resolved === parsed.root) {
    return {
      safe: false,
      code: 'DRIVE_ROOT',
      reason: `Drive root (${parsed.root}) cannot be organized directly. Organizing an entire drive will disrupt system files and volume tables. Please choose a specific subfolder (e.g., ${path.join(parsed.root, 'Workspace')}).`
    };
  }

  // 3. User Home Directory Root (e.g., C:\Users\Username or /Users/username)
  const homeDir = os.homedir();
  if (homeDir) {
    const normalizedHome = path.resolve(homeDir).replace(/[\\/]+$/, '').toLowerCase();
    if (normalizedResolved === normalizedHome) {
      return {
        safe: false,
        code: 'USER_ROOT',
        reason: 'Your root user profile directory contains sensitive application state, settings, and hidden configuration files. Please select a specific subfolder, such as Downloads, Desktop, Documents, or a dedicated folder.'
      };
    }

    // AppData or macOS Library
    const appData = path.join(homeDir, 'AppData').toLowerCase();
    const macLib = path.join(homeDir, 'Library').toLowerCase();
    if (normalizedResolved.startsWith(appData) || normalizedResolved.startsWith(macLib)) {
      return {
        safe: false,
        code: 'SYSTEM_FOLDER',
        reason: 'Application configuration and data directories (AppData/Library) contain active software state and are protected from reorganization.'
      };
    }
  }

  // 4. Windows System Folders
  const winDir = process.env.WINDIR || process.env.SystemRoot || 'C:\\Windows';
  const progFiles = process.env.ProgramFiles || 'C:\\Program Files';
  const progFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const progData = process.env.ProgramData || 'C:\\ProgramData';

  const protectedWindowsPaths = [
    winDir,
    progFiles,
    progFilesX86,
    progData,
    path.join(parsed.root, 'Users'),
    path.join(parsed.root, 'Recovery'),
    path.join(parsed.root, '$Recycle.Bin'),
    path.join(parsed.root, 'System Volume Information'),
    path.join(parsed.root, 'WindowsApps')
  ].map(p => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase());

  for (const p of protectedWindowsPaths) {
    if (normalizedResolved === p || (normalizedResolved.startsWith(p + path.sep.toLowerCase()) && p.endsWith('windows'))) {
      return {
        safe: false,
        code: 'SYSTEM_FOLDER',
        reason: `Target "${dirPath}" is a protected operating system directory. Organizing system folders will cause system instability.`
      };
    }
  }

  // 5. Unix / macOS System Folders
  const protectedUnixPaths = [
    '/bin', '/sbin', '/usr', '/etc', '/var', '/dev', '/proc', '/sys',
    '/boot', '/lib', '/lib64', '/opt', '/root', '/private',
    '/System', '/Library', '/Applications', '/Users', '/home'
  ];

  for (const up of protectedUnixPaths) {
    if (normalizedResolved === up.toLowerCase()) {
      return {
        safe: false,
        code: 'SYSTEM_FOLDER',
        reason: `"${up}" is a critical system directory and cannot be monitored or organized.`
      };
    }
  }

  return { safe: true };
}

/**
 * Checks if a specific file name or path is a protected OS/system file
 */
export function isProtectedSystemFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  if (PRESERVED_SYSTEM_FILES.has(lower)) return true;
  if (lower.startsWith('~$')) return true; // Temporary office lock file
  if (lower.startsWith('.tidyfs')) return true;
  return false;
}
