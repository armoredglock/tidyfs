import path from 'path';
import { Category } from './types.js';

const FINANCE_KEYWORDS = [
  'invoice', 'receipt', 'tax', 'bill', 'statement', 'salary', 'payroll',
  'gst', 'expense', 'payment', 'payslip', 'bank', 'finances', 'crypto'
];

const TRAVEL_KEYWORDS = [
  'boarding', 'flight', 'ticket', 'hotel', 'itinerary', 'booking', 
  'visa', 'passport', 'airbnb', 'boardingpass', 'airline'
];

const INSTALLER_EXTENSIONS = new Set([
  '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage', '.iso'
]);

const ARCHIVE_EXTENSIONS = new Set([
  '.zip', '.tar', '.gz', '.7z', '.rar', '.bz2', '.xz', '.tgz'
]);

const MEDIA_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp', '.ico',
  '.mp4', '.mov', '.mkv', '.avi', '.webm', '.flv',
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'
]);

const CODE_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.c', '.cpp',
  '.h', '.hpp', '.cs', '.php', '.rb', '.swift', '.kt', '.html', '.css',
  '.scss', '.json', '.yaml', '.yml', '.toml', '.xml', '.sql', '.sh', '.bash', '.ps1'
]);

const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt',
  '.md', '.rtf', '.odt', '.ods', '.odp', '.csv', '.epub', '.pages', '.key'
]);

export function classifyFile(filePath: string): { category: Category; isInstallerOrArchive: boolean } {
  const fileName = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  // 1. Installers check
  if (INSTALLER_EXTENSIONS.has(ext)) {
    return { category: 'Installers', isInstallerOrArchive: true };
  }

  // 2. Archives check
  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return { category: 'Archives', isInstallerOrArchive: true };
  }

  // 3. Semantic keyword checks (takes priority for documents/PDFs)
  const baseNameWithoutExt = fileName.replace(ext, '');
  const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => baseNameWithoutExt.includes(kw));
  if (hasFinanceKeyword && (DOCUMENT_EXTENSIONS.has(ext) || ext === '.png' || ext === '.jpg')) {
    return { category: 'Finances', isInstallerOrArchive: false };
  }

  const hasTravelKeyword = TRAVEL_KEYWORDS.some(kw => baseNameWithoutExt.includes(kw));
  if (hasTravelKeyword && (DOCUMENT_EXTENSIONS.has(ext) || ext === '.png' || ext === '.jpg' || ext === '.pkpass')) {
    return { category: 'Travel', isInstallerOrArchive: false };
  }

  // 4. Media
  if (MEDIA_EXTENSIONS.has(ext)) {
    return { category: 'Media', isInstallerOrArchive: false };
  }

  // 5. Code
  if (CODE_EXTENSIONS.has(ext)) {
    return { category: 'Code', isInstallerOrArchive: false };
  }

  // 6. General Documents
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return { category: 'Documents', isInstallerOrArchive: false };
  }

  return { category: 'Other', isInstallerOrArchive: false };
}
