export type Category = 
  | 'Finances' 
  | 'Travel' 
  | 'Legal'
  | 'Academic'
  | 'Media' 
  | 'Design'
  | 'Documents' 
  | 'Code' 
  | 'Archives' 
  | 'Installers' 
  | 'Other';

export type OrganizationStrategy = 
  | 'category'         // Group by semantic topic & extension
  | 'date-year-month'  // Group by timeline (e.g. 2026/10 - October)
  | 'date-year'        // Group by year (e.g. 2026/)
  | 'extension'        // Group by file extension (e.g. PDF/, PNG/, ZIP/)
  | 'size-tier'        // Group by size (Heavy >100MB, Medium 10-100MB, Small <10MB)
  | 'custom-rules';    // Group strictly by user-defined custom routing rules

export type PrivacyMode = 'strict-metadata' | 'local-hash';

export type ThreatLevel = 'safe' | 'suspicious' | 'critical';

export interface ThreatInfo {
  level: ThreatLevel;
  type: 'double_extension' | 'rtlo_obfuscation' | 'suspicious_script' | 'space_padding' | 'known_threat_ext';
  reason: string;
  recommendation: string;
}

export interface CustomRule {
  id: string;
  name: string;
  enabled: boolean;
  matchType: 'extension' | 'keyword' | 'regex' | 'min_size_mb';
  pattern: string; // e.g. ".psd, .ai", "tax, 1099, invoice", "meeting_.*"
  targetFolder: string; // e.g. "Work/Taxes", "Design/SourceFiles", "Meetings"
}

export type DecayState = 'active' | 'expiring' | 'expired' | 'exempt';

export interface ScannedFile {
  path: string;
  name: string;
  extension: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
  category: Category;
  decayState: DecayState;
  daysUntilDecay: number;
  isInstallerOrArchive: boolean;
  isHeavy?: boolean;
  ignored?: boolean;
  hash?: string;
  duplicateOf?: string; // original path if duplicate
  threat?: ThreatInfo;  // Virus / malware heuristic threat
}

export interface TidyAction {
  id: string;
  type: 'move' | 'trash' | 'delete_duplicate' | 'quarantine';
  sourcePath: string;
  targetPath: string;
  fileName: string;
  fileSize: number;
  reason: string;
  category: Category;
  threat?: ThreatInfo;
}

export interface TidyPlan {
  targetFolder: string;
  timestamp: number;
  totalFiles: number;
  totalBytes: number;
  actions: TidyAction[];
  summary: {
    categoryCounts: Record<Category, number>;
    categoryBytes: Record<Category, number>;
    decayCount: number;
    decayBytes: number;
    duplicateCount: number;
    duplicateBytes: number;
    heavyCount: number;
    heavyBytes: number;
    threatCount: number;
    threatBytes: number;
  };
}

export interface JournalAction {
  sourcePath: string;
  currentPath: string;
  type: 'move' | 'trash' | 'quarantine';
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  targetFolder: string;
  actions: JournalAction[];
  status: 'applied' | 'reverted';
}

export interface TidySettings {
  // Security & Privacy
  privacyMode: PrivacyMode; // 'strict-metadata' (0 file content reads) vs 'local-hash'
  enableSecurityScanner: boolean; // Heuristic threat detection (double extensions, RTLO, dangerous scripts)
  quarantineFolderName: string;   // 'TidyFS-Quarantine'

  // Organization Strategy
  organizationStrategy: OrganizationStrategy;
  dateSubfolders: boolean; // e.g. Documents/2026/

  // Custom User Routing Rules
  customRules: CustomRule[];

  // Decay & Deduplication
  decayDays: number;
  expiringThresholdDays: number;
  enableDecay: boolean;
  enableCategorize: boolean;
  enableDeduplicate: boolean;
  heavyFileThresholdMB: number;
  autoSchedule: 'manual' | 'hourly' | 'daily';
  ignoredExtensions: string[];
  ignoredPatterns: string[];
  categoryFolders: Record<Category, string>;
  decayFolderName: string;
}

export const DEFAULT_CUSTOM_RULES: CustomRule[] = [
  {
    id: 'rule-tax',
    name: 'Tax, Receipts & Invoices',
    enabled: true,
    matchType: 'keyword',
    pattern: 'invoice, receipt, tax, 1099, w2, payslip, gst, vat',
    targetFolder: 'Finances/Invoices_and_Tax'
  },
  {
    id: 'rule-contracts',
    name: 'Contracts & Agreements',
    enabled: true,
    matchType: 'keyword',
    pattern: 'contract, agreement, nda, terms, policy, lease',
    targetFolder: 'Legal/Agreements'
  },
  {
    id: 'rule-raw-design',
    name: 'Raw Design Assets',
    enabled: true,
    matchType: 'extension',
    pattern: '.psd, .ai, .sketch, .fig, .blend, .obj',
    targetFolder: 'Design/SourceFiles'
  },
  {
    id: 'rule-screenshots',
    name: 'Screen Captures',
    enabled: true,
    matchType: 'keyword',
    pattern: 'screenshot, screen shot, capture, snip',
    targetFolder: 'Media/Screenshots'
  }
];

export const DEFAULT_SETTINGS: TidySettings = {
  privacyMode: 'strict-metadata',
  enableSecurityScanner: true,
  quarantineFolderName: 'TidyFS-Quarantine',
  organizationStrategy: 'category',
  dateSubfolders: false,
  customRules: DEFAULT_CUSTOM_RULES,
  decayDays: 14,
  expiringThresholdDays: 3,
  enableDecay: true,
  enableCategorize: true,
  enableDeduplicate: true,
  heavyFileThresholdMB: 100,
  autoSchedule: 'manual',
  ignoredExtensions: ['.ini', '.sys', '.tmp', '.crdownload', '.part', '.lnk', '.url', '.dll'],
  ignoredPatterns: ['node_modules', '.git', '.tidyfs-decay', 'tidyfs-quarantine', 'tidyfs-recycled', '$recycle.bin', 'system volume information'],
  categoryFolders: {
    Finances: 'Finances',
    Travel: 'Travel',
    Legal: 'Legal',
    Academic: 'Academic',
    Media: 'Media',
    Design: 'Design',
    Documents: 'Documents',
    Code: 'Projects',
    Archives: 'Archives',
    Installers: 'Installers',
    Other: 'Misc'
  },
  decayFolderName: 'TidyFS-Recycled'
};
