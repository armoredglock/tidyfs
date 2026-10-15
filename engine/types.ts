export type Category = 
  | 'Finances' 
  | 'Travel' 
  | 'Media' 
  | 'Documents' 
  | 'Code' 
  | 'Archives' 
  | 'Installers' 
  | 'Other';

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
}

export interface TidyAction {
  id: string;
  type: 'move' | 'trash' | 'delete_duplicate';
  sourcePath: string;
  targetPath: string;
  fileName: string;
  fileSize: number;
  reason: string;
  category: Category;
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
  };
}

export interface JournalAction {
  sourcePath: string;
  currentPath: string;
  type: 'move' | 'trash';
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  targetFolder: string;
  actions: JournalAction[];
  status: 'applied' | 'reverted';
}

export interface TidySettings {
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

export const DEFAULT_SETTINGS: TidySettings = {
  decayDays: 14,
  expiringThresholdDays: 3,
  enableDecay: true,
  enableCategorize: true,
  enableDeduplicate: true,
  heavyFileThresholdMB: 100,
  autoSchedule: 'manual',
  ignoredExtensions: ['.ini', '.sys', '.tmp', '.crdownload', '.part'],
  ignoredPatterns: ['node_modules', '.git', '.tidyfs-decay'],
  categoryFolders: {
    Finances: 'Finances',
    Travel: 'Travel',
    Media: 'Media',
    Documents: 'Documents',
    Code: 'Projects',
    Archives: 'Archives',
    Installers: 'Installers',
    Other: 'Misc'
  },
  decayFolderName: 'TidyFS-Recycled'
};
