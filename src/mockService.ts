import { ScannedFile, TidyPlan, TidySettings, JournalEntry, DEFAULT_SETTINGS } from './types.js';

export const MOCK_FILES: ScannedFile[] = [
  {
    path: 'C:/Users/User/Downloads/Q3_Financial_Statement_2026.pdf',
    name: 'Q3_Financial_Statement_2026.pdf',
    extension: '.pdf',
    size: 2450000,
    createdAt: Date.now() - 4 * 86400000,
    modifiedAt: Date.now() - 4 * 86400000,
    category: 'Finances',
    decayState: 'exempt',
    daysUntilDecay: 999,
    isInstallerOrArchive: false
  },
  {
    path: 'C:/Users/User/Downloads/BoardingPass_Flight_UA842.pdf',
    name: 'BoardingPass_Flight_UA842.pdf',
    extension: '.pdf',
    size: 1120000,
    createdAt: Date.now() - 2 * 86400000,
    modifiedAt: Date.now() - 2 * 86400000,
    category: 'Travel',
    decayState: 'exempt',
    daysUntilDecay: 999,
    isInstallerOrArchive: false
  },
  {
    path: 'C:/Users/User/Downloads/Docker_Desktop_Installer_v4.32.exe',
    name: 'Docker_Desktop_Installer_v4.32.exe',
    extension: '.exe',
    size: 612000000,
    createdAt: Date.now() - 22 * 86400000,
    modifiedAt: Date.now() - 22 * 86400000,
    category: 'Installers',
    decayState: 'expired',
    daysUntilDecay: 0,
    isInstallerOrArchive: true
  },
  {
    path: 'C:/Users/User/Downloads/Node_v24_Setup.msi',
    name: 'Node_v24_Setup.msi',
    extension: '.msi',
    size: 32000000,
    createdAt: Date.now() - 12 * 86400000,
    modifiedAt: Date.now() - 12 * 86400000,
    category: 'Installers',
    decayState: 'expiring',
    daysUntilDecay: 2,
    isInstallerOrArchive: true
  },
  {
    path: 'C:/Users/User/Downloads/Product_Presentation_Keynote.pptx',
    name: 'Product_Presentation_Keynote.pptx',
    extension: '.pptx',
    size: 18400000,
    createdAt: Date.now() - 6 * 86400000,
    modifiedAt: Date.now() - 6 * 86400000,
    category: 'Documents',
    decayState: 'exempt',
    daysUntilDecay: 999,
    isInstallerOrArchive: false
  },
  {
    path: 'C:/Users/User/Downloads/Product_Presentation_Keynote (1).pptx',
    name: 'Product_Presentation_Keynote (1).pptx',
    extension: '.pptx',
    size: 18400000,
    createdAt: Date.now() - 1 * 86400000,
    modifiedAt: Date.now() - 1 * 86400000,
    category: 'Documents',
    decayState: 'exempt',
    daysUntilDecay: 999,
    isInstallerOrArchive: false,
    duplicateOf: 'C:/Users/User/Downloads/Product_Presentation_Keynote.pptx'
  },
  {
    path: 'C:/Users/User/Downloads/Sunset_4k_Wallpaper.png',
    name: 'Sunset_4k_Wallpaper.png',
    extension: '.png',
    size: 8900000,
    createdAt: Date.now() - 3 * 86400000,
    modifiedAt: Date.now() - 3 * 86400000,
    category: 'Media',
    decayState: 'exempt',
    daysUntilDecay: 999,
    isInstallerOrArchive: false
  },
  {
    path: 'C:/Users/User/Downloads/api-service-backend.zip',
    name: 'api-service-backend.zip',
    extension: '.zip',
    size: 45000000,
    createdAt: Date.now() - 18 * 86400000,
    modifiedAt: Date.now() - 18 * 86400000,
    category: 'Archives',
    decayState: 'expired',
    daysUntilDecay: 0,
    isInstallerOrArchive: true
  }
];

export const MOCK_PLAN: TidyPlan = {
  targetFolder: 'C:/Users/User/Downloads',
  timestamp: Date.now(),
  totalFiles: MOCK_FILES.length,
  totalBytes: MOCK_FILES.reduce((acc, f) => acc + f.size, 0),
  actions: [
    {
      id: 'a1',
      type: 'move',
      sourcePath: 'C:/Users/User/Downloads/Q3_Financial_Statement_2026.pdf',
      targetPath: 'C:/Users/User/Downloads/Finances/Q3_Financial_Statement_2026.pdf',
      fileName: 'Q3_Financial_Statement_2026.pdf',
      fileSize: 2450000,
      reason: 'Organized into Finances by semantic rule',
      category: 'Finances'
    },
    {
      id: 'a2',
      type: 'move',
      sourcePath: 'C:/Users/User/Downloads/BoardingPass_Flight_UA842.pdf',
      targetPath: 'C:/Users/User/Downloads/Travel/BoardingPass_Flight_UA842.pdf',
      fileName: 'BoardingPass_Flight_UA842.pdf',
      fileSize: 1120000,
      reason: 'Organized into Travel by semantic rule',
      category: 'Travel'
    },
    {
      id: 'a3',
      type: 'trash',
      sourcePath: 'C:/Users/User/Downloads/Docker_Desktop_Installer_v4.32.exe',
      targetPath: 'C:/Users/User/Downloads/TidyFS-Recycled/Docker_Desktop_Installer_v4.32.exe',
      fileName: 'Docker_Desktop_Installer_v4.32.exe',
      fileSize: 612000000,
      reason: 'Expired installer (22 days old > 14 days threshold)',
      category: 'Installers'
    },
    {
      id: 'a4',
      type: 'trash',
      sourcePath: 'C:/Users/User/Downloads/api-service-backend.zip',
      targetPath: 'C:/Users/User/Downloads/TidyFS-Recycled/api-service-backend.zip',
      fileName: 'api-service-backend.zip',
      fileSize: 45000000,
      reason: 'Expired temporary archive (18 days old > 14 days threshold)',
      category: 'Archives'
    },
    {
      id: 'a5',
      type: 'delete_duplicate',
      sourcePath: 'C:/Users/User/Downloads/Product_Presentation_Keynote (1).pptx',
      targetPath: 'C:/Users/User/Downloads/Duplicates/Product_Presentation_Keynote (1).pptx',
      fileName: 'Product_Presentation_Keynote (1).pptx',
      fileSize: 18400000,
      reason: 'Byte-identical duplicate of Product_Presentation_Keynote.pptx',
      category: 'Documents'
    },
    {
      id: 'a6',
      type: 'move',
      sourcePath: 'C:/Users/User/Downloads/Sunset_4k_Wallpaper.png',
      targetPath: 'C:/Users/User/Downloads/Media/Sunset_4k_Wallpaper.png',
      fileName: 'Sunset_4k_Wallpaper.png',
      fileSize: 8900000,
      reason: 'Organized into Media by semantic rule',
      category: 'Media'
    }
  ],
  summary: {
    categoryCounts: {
      Finances: 1,
      Travel: 1,
      Legal: 0,
      Academic: 0,
      Media: 1,
      Design: 0,
      Documents: 2,
      Code: 0,
      Archives: 1,
      Installers: 2,
      Other: 0
    },
    categoryBytes: {
      Finances: 2450000,
      Travel: 1120000,
      Legal: 0,
      Academic: 0,
      Media: 8900000,
      Design: 0,
      Documents: 36800000,
      Code: 0,
      Archives: 45000000,
      Installers: 644000000,
      Other: 0
    },
    decayCount: 2,
    decayBytes: 657000000,
    duplicateCount: 1,
    duplicateBytes: 18400000,
    heavyCount: 2,
    heavyBytes: 657000000
  }
};

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: 'b8f2a1',
    timestamp: Date.now() - 3600000 * 2,
    targetFolder: 'C:/Users/User/Downloads',
    actions: [
      {
        sourcePath: 'C:/Users/User/Downloads/invoice_august.pdf',
        currentPath: 'C:/Users/User/Downloads/Finances/invoice_august.pdf',
        type: 'move'
      },
      {
        sourcePath: 'C:/Users/User/Downloads/old_chrome_setup.exe',
        currentPath: 'C:/Users/User/Downloads/TidyFS-Recycled/old_chrome_setup.exe',
        type: 'trash'
      }
    ],
    status: 'applied'
  }
];
