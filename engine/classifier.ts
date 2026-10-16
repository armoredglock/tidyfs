import path from 'path';
import { Category, CustomRule } from './types.js';

// High-precision semantic vocabularies
const FINANCE_KEYWORDS = [
  'invoice', 'receipt', 'tax', 'bill', 'statement', 'salary', 'payroll',
  'gst', 'vat', 'expense', 'payment', 'payslip', 'bank', 'finances', 'crypto',
  '1099', 'w2', 'w-2', 'w9', 'w-9', 'ledger', 'audit', 'dividend', 'wire',
  'reimbursement', 'remittance', 'quotation', 'deposit', 'withdrawal',
  'balance_sheet', 'pnl', 'profit_loss', 'accounting', 'pricing', 'paycheck'
];

const TRAVEL_KEYWORDS = [
  'boarding', 'flight', 'ticket', 'hotel', 'itinerary', 'booking', 
  'visa', 'passport', 'airbnb', 'boardingpass', 'airline', 'transit',
  'train', 'bus', 'reservation', 'confirmation', 'trip', 'voyage',
  'travel', 'expedia', 'tripadvisor', 'booking_com'
];

const LEGAL_KEYWORDS = [
  'contract', 'agreement', 'nda', 'terms', 'lease', 'deed', 'policy',
  'compliance', 'license', 'addendum', 'settlement', 'bylaws', 'resolution',
  'trademark', 'patent', 'waiver', 'affidavit', 'power_of_attorney',
  'court', 'memorandum', 'consent', 'arbitration', 'privacy_policy'
];

const ACADEMIC_KEYWORDS = [
  'thesis', 'dissertation', 'syllabus', 'assignment', 'homework', 'lecture',
  'coursework', 'curriculum', 'quiz', 'exam', 'midterm', 'final_exam',
  'study_guide', 'lab_report', 'essay', 'bibliography', 'citation', 'abstract',
  'research_paper', 'transcript', 'degree', 'certificate', 'diploma'
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
      return (
        words.includes(kw) ||
        text.toLowerCase().includes(`_${kw}`) ||
        text.toLowerCase().includes(`${kw}_`) ||
        text.toLowerCase().includes(`-${kw}`) ||
        text.toLowerCase().includes(`${kw}-`)
      );
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
  const upperBase = fileName.toUpperCase();

  // 1. Handle common extensionless files
  if (!ext || ext === '') {
    if (upperBase === 'LICENSE' || upperBase === 'COPYING' || upperBase === 'PATENTS') {
      return { category: 'Legal', isInstallerOrArchive: false };
    }
    if (upperBase === 'DOCKERFILE' || upperBase === 'MAKEFILE' || upperBase === 'PROCFILE' || upperBase === 'GEMFILE') {
      return { category: 'Code', isInstallerOrArchive: false };
    }
    if (upperBase === 'README') {
      return { category: 'Documents', isInstallerOrArchive: false };
    }
  }

  // 2. Installers check (Highest priority for system hygiene)
  if (INSTALLER_EXTENSIONS.has(ext)) {
    return { category: 'Installers', isInstallerOrArchive: true };
  }

  // 3. Archives check
  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return { category: 'Archives', isInstallerOrArchive: true };
  }

  // 4. Code & Engineering formats take precedence over keyword matches
  // (e.g. tax_calculator.py belongs to Code, not Finances)
  if (CODE_EXTENSIONS.has(ext)) {
    return { category: 'Code', isInstallerOrArchive: false };
  }

  // 5. Raw Creative & Design formats
  if (DESIGN_EXTENSIONS.has(ext)) {
    return { category: 'Design', isInstallerOrArchive: false };
  }

  // 6. Specialized domain extensions
  if (ext === '.ofx' || ext === '.qfx' || ext === '.qbo') {
    return { category: 'Finances', isInstallerOrArchive: false };
  }
  if (ext === '.pkpass' || ext === '.gpx' || ext === '.kml') {
    return { category: 'Travel', isInstallerOrArchive: false };
  }

  // 7. Semantic contextual analysis for documents and receipt/ticket image formats
  const isDocumentOrReceipt =
    DOCUMENT_EXTENSIONS.has(ext) ||
    ext === '.png' ||
    ext === '.jpg' ||
    ext === '.jpeg' ||
    ext === '.webp' ||
    ext === '.heic';

  if (isDocumentOrReceipt) {
    if (matchesKeyword(fileName, FINANCE_KEYWORDS)) {
      return { category: 'Finances', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, TRAVEL_KEYWORDS)) {
      return { category: 'Travel', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, LEGAL_KEYWORDS)) {
      return { category: 'Legal', isInstallerOrArchive: false };
    }
    if (matchesKeyword(fileName, ACADEMIC_KEYWORDS)) {
      return { category: 'Academic', isInstallerOrArchive: false };
    }
  }

  // 8. General Media (Audio, Video, Images)
  if (MEDIA_EXTENSIONS.has(ext)) {
    return { category: 'Media', isInstallerOrArchive: false };
  }

  // 9. General Documents
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return { category: 'Documents', isInstallerOrArchive: false };
  }

  return { category: 'Other', isInstallerOrArchive: false };
}
