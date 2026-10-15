import path from 'path';
import { Category, CustomRule } from './types.js';

// High-precision semantic vocabularies
const FINANCE_KEYWORDS = [
  'invoice', 'receipt', 'tax', 'bill', 'statement', 'salary', 'payroll',
  'gst', 'vat', 'expense', 'payment', 'payslip', 'bank', 'finances', 'crypto',
  '1099', 'w2', 'ledger', 'audit', 'dividend', 'wire', 'reimbursement', 'remittance',
  'quotation', 'invoice_', 'receipt_'
];

const TRAVEL_KEYWORDS = [
  'boarding', 'flight', 'ticket', 'hotel', 'itinerary', 'booking', 
  'visa', 'passport', 'airbnb', 'boardingpass', 'airline', 'transit',
  'train', 'bus', 'reservation', 'confirmation', 'trip', 'voyage'
];

const LEGAL_KEYWORDS = [
  'contract', 'agreement', 'nda', 'terms', 'lease', 'deed', 'policy',
  'compliance', 'license', 'addendum', 'settlement', 'bylaws', 'resolution',
  'trademark', 'patent', 'waiver', 'affidavit', 'power_of_attorney'
];

const ACADEMIC_KEYWORDS = [
  'thesis', 'dissertation', 'syllabus', 'assignment', 'homework', 'lecture',
  'coursework', 'curriculum', 'quiz', 'exam', 'midterm', 'final_exam',
  'study_guide', 'lab_report', 'essay', 'bibliography', 'citation', 'abstract'
];

const INSTALLER_EXTENSIONS = new Set([
  '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage', '.iso', '.msix', '.appx'
]);

const ARCHIVE_EXTENSIONS = new Set([
  '.zip', '.tar', '.gz', '.7z', '.rar', '.bz2', '.xz', '.tgz', '.tar.gz', '.tar.bz2'
]);

const DESIGN_EXTENSIONS = new Set([
  '.psd', '.ai', '.eps', '.sketch', '.fig', '.xd', '.blend', '.fbx', '.obj',
  '.stl', '.3ds', '.c4d', '.otf', '.ttf', '.woff', '.woff2', '.indd', '.cdr'
]);

const MEDIA_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp', '.ico', '.tiff', '.tif',
  '.raw', '.cr2', '.nef', '.heic', '.heif',
  '.mp4', '.mov', '.mkv', '.avi', '.webm', '.flv', '.wmv', '.m4v',
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.mid'
]);

const CODE_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.c', '.cpp',
  '.h', '.hpp', '.cs', '.php', '.rb', '.swift', '.kt', '.html', '.css',
  '.scss', '.sass', '.less', '.json', '.yaml', '.yml', '.toml', '.xml',
  '.sql', '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd', '.env', '.dockerfile',
  '.r', '.dart', '.lua', '.scala', '.vue', '.svelte'
]);

const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt',
  '.md', '.rtf', '.odt', '.ods', '.odp', '.csv', '.tsv', '.epub',
  '.pages', '.key', '.numbers', '.tex', '.log'
]);

/**
 * Normalizes and extracts compound extensions like .tar.gz or .tar.bz2
 */
export function getCompoundExtension(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.tar.gz')) return '.tar.gz';
  if (lower.endsWith('.tar.bz2')) return '.tar.bz2';
  if (lower.endsWith('.tar.xz')) return '.tar.xz';
  if (lower.endsWith('.d.ts')) return '.d.ts';
  return path.extname(fileName).toLowerCase();
}

/**
 * Checks for keyword match with word-boundary or delimiter awareness
 */
function matchesKeyword(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase().replace(/[-_.]/g, ' ');
  const words = normalized.split(/\s+/);
  return keywords.some(kw => {
    if (normalized.includes(kw)) {
      // Check as separate token or prefix/suffix with underscore/hyphen
      return words.includes(kw) || text.toLowerCase().includes(`_${kw}`) || text.toLowerCase().includes(`${kw}_`) || text.toLowerCase().includes(`-${kw}`) || text.toLowerCase().includes(`${kw}-`);
    }
    return false;
  });
}

/**
 * Evaluates custom user routing rules against a file
 */
export function evaluateCustomRules(
  fileName: string,
  fileSize: number,
  customRules: CustomRule[]
): { matched: boolean; targetFolder: string; reason: string } | null {
  if (!customRules || customRules.length === 0) return null;

  const ext = getCompoundExtension(fileName);
  const nameWithoutExt = fileName.slice(0, fileName.length - ext.length).toLowerCase();

  for (const rule of customRules) {
    if (!rule.enabled) continue;

    if (rule.matchType === 'extension') {
      const allowedExts = rule.pattern.split(',').map(e => e.trim().toLowerCase());
      if (allowedExts.includes(ext) || allowedExts.includes(ext.replace('.', ''))) {
        return {
          matched: true,
          targetFolder: rule.targetFolder,
          reason: `Matched custom rule: "${rule.name}" (Extension: ${ext})`
        };
      }
    }

    if (rule.matchType === 'keyword') {
      const keywords = rule.pattern.split(',').map(k => k.trim().toLowerCase());
      if (matchesKeyword(fileName, keywords)) {
        return {
          matched: true,
          targetFolder: rule.targetFolder,
          reason: `Matched custom rule: "${rule.name}" (Keyword)`
        };
      }
    }

    if (rule.matchType === 'regex') {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(fileName)) {
          return {
            matched: true,
            targetFolder: rule.targetFolder,
            reason: `Matched custom rule: "${rule.name}" (Regex)`
          };
        }
      } catch {
        // Skip invalid regex pattern
      }
    }

    if (rule.matchType === 'min_size_mb') {
      const minBytes = parseFloat(rule.pattern) * 1024 * 1024;
      if (!isNaN(minBytes) && fileSize >= minBytes) {
        return {
          matched: true,
          targetFolder: rule.targetFolder,
          reason: `Matched custom rule: "${rule.name}" (Size >= ${rule.pattern}MB)`
        };
      }
    }
  }

  return null;
}

/**
 * Classifies a file using multi-tier semantic categorization
 */
export function classifyFile(filePath: string): { category: Category; isInstallerOrArchive: boolean } {
  const fileName = path.basename(filePath);
  const ext = getCompoundExtension(fileName);

  // 1. Installers check (Highest priority for system hygiene)
  if (INSTALLER_EXTENSIONS.has(ext)) {
    return { category: 'Installers', isInstallerOrArchive: true };
  }

  // 2. Archives check
  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return { category: 'Archives', isInstallerOrArchive: true };
  }

  // 3. Raw Creative & Design formats
  if (DESIGN_EXTENSIONS.has(ext)) {
    return { category: 'Design', isInstallerOrArchive: false };
  }

  // 4. Semantic contextual analysis for documents/media
  const isDocumentOrImage = DOCUMENT_EXTENSIONS.has(ext) || ext === '.png' || ext === '.jpg' || ext === '.jpeg';

  if (isDocumentOrImage) {
    if (matchesKeyword(fileName, FINANCE_KEYWORDS)) {
      return { category: 'Finances', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, TRAVEL_KEYWORDS) || ext === '.pkpass') {
      return { category: 'Travel', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, LEGAL_KEYWORDS)) {
      return { category: 'Legal', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, ACADEMIC_KEYWORDS)) {
      return { category: 'Academic', isInstallerOrArchive: false };
    }
  }

  // 5. Code & Engineering
  if (CODE_EXTENSIONS.has(ext)) {
    return { category: 'Code', isInstallerOrArchive: false };
  }

  // 6. Media (Audio, Video, Images)
  if (MEDIA_EXTENSIONS.has(ext)) {
    return { category: 'Media', isInstallerOrArchive: false };
  }

  // 7. General Documents
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return { category: 'Documents', isInstallerOrArchive: false };
  }

  return { category: 'Other', isInstallerOrArchive: false };
}
