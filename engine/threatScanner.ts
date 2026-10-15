import path from 'path';
import { ThreatInfo } from './types.js';

// Suspicious executable & script extensions commonly used in malware
const DANGEROUS_EXTENSIONS = new Set([
  '.scr',  // Windows screensaver (PE executable)
  '.vbs',  // VBScript
  '.vbe',  // Encoded VBScript
  '.wsf',  // Windows Script File
  '.wsh',  // Windows Script Host
  '.hta',  // HTML Application (executes mshta.exe)
  '.cpl',  // Control Panel applet (DLL/PE)
  '.pif',  // Shortcut/PIF executable
  '.reg',  // Windows Registry modification
  '.gadget' // Windows Desktop Gadget
]);

// Innocent document and media extensions commonly used as bait in double extensions
const BAIT_EXTENSIONS = new Set([
  'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
  'jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'txt', 'csv'
]);

// Final executable extensions targeted in double extension attacks
const EXECUTABLE_EXTENSIONS = new Set([
  'exe', 'scr', 'vbs', 'bat', 'cmd', 'ps1', 'hta', 'msi', 'cpl', 'pif', 'com', 'jar'
]);

/**
 * Scans a file's metadata, filename, and path for malware heuristics and deception techniques.
 * Runs 100% locally and strictly analyzes metadata without opening file bytes.
 */
export function analyzeThreat(fileName: string, fileSize: number): ThreatInfo | null {
  // 1. Right-to-Left Override (RTLO) & Zero-Width Obfuscation
  // Malicious actors use \u202E to make "document[RTLO]exe.pdf" render visually as "documentfdp.exe"
  if (/[\u202E\u202B\u202D\u200B\u200C\u200D\uFEFF]/.test(fileName)) {
    return {
      level: 'critical',
      type: 'rtlo_obfuscation',
      reason: 'Unicode Character Spoofing: Uses Right-to-Left Override or Zero-Width characters to reverse the visual extension.',
      recommendation: 'Quarantine immediately. Do not launch or double-click this file.'
    };
  }

  // 2. Space Padding Deception (e.g. "Invoice_2026.pdf          .exe")
  // Pads filename with excessive spaces so the real executable extension is pushed out of view in Explorer/Finder
  if (/^.+\.[a-zA-Z0-9]{3,4}\s{10,}\.[a-zA-Z0-9]+$/i.test(fileName)) {
    return {
      level: 'critical',
      type: 'space_padding',
      reason: 'Space Padding Deception: Contains excessive whitespace to hide the real executable extension.',
      recommendation: 'Quarantine immediately. This is a common malware delivery technique.'
    };
  }

  // 3. Double Extension Spoofing (e.g. "Payment_Receipt.pdf.exe", "Photo.jpg.vbs")
  const parts = fileName.split('.');
  if (parts.length >= 3) {
    const finalExt = parts[parts.length - 1].toLowerCase();
    const secondLastExt = parts[parts.length - 2].toLowerCase();

    if (EXECUTABLE_EXTENSIONS.has(finalExt) && BAIT_EXTENSIONS.has(secondLastExt)) {
      return {
        level: 'critical',
        type: 'double_extension',
        reason: `Double Extension Spoofing: Disguised as .${secondLastExt.toUpperCase()} but actually executes as .${finalExt.toUpperCase()}.`,
        recommendation: 'Quarantine immediately. Executing this file will run binary code rather than opening a document.'
      };
    }
  }

  // 4. Known High-Risk Direct Script Containers (e.g. .scr, .hta, .vbs, .cpl in downloads)
  const ext = path.extname(fileName).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      level: 'suspicious',
      type: 'known_threat_ext',
      reason: `High-Risk Script / Binary Format (${ext.toUpperCase()}): Format frequently exploited for stealth payload execution.`,
      recommendation: 'Quarantine or verify file provenance before execution.'
    };
  }

  // 5. Zero-byte executable deception or micro-dropper (e.g. < 500 bytes .exe)
  if ((ext === '.exe' || ext === '.msi' || ext === '.scr') && fileSize > 0 && fileSize < 1024) {
    return {
      level: 'suspicious',
      type: 'known_threat_ext',
      reason: 'Suspiciously Small Executable: Binary size under 1 KB, characteristic of malicious download stagers or droppers.',
      recommendation: 'Verify the source of this executable.'
    };
  }

  return null;
}
