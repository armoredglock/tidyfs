import React, { useState } from 'react';
import {
  X,
  Save,
  Settings,
  RotateCcw,
  ShieldCheck,
  FolderTree,
  Lock,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  TidySettings,
  DEFAULT_SETTINGS,
  Category,
  OrganizationStrategy,
  PrivacyMode,
  CustomRule,
  DEFAULT_CUSTOM_RULES
} from '../types.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TidySettings;
  onSave: (newSettings: TidySettings) => void;
}

type SettingsTab = 'strategy' | 'rules' | 'security' | 'folders' | 'engines';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<TidySettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTab>('strategy');
  const [newRule, setNewRule] = useState<Omit<CustomRule, 'id'>>({
    name: '',
    enabled: true,
    matchType: 'keyword',
    pattern: '',
    targetFolder: ''
  });
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);

  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleCategoryFolderChange = (cat: Category, val: string) => {
    setFormData(prev => ({
      ...prev,
      categoryFolders: {
        ...prev.categoryFolders,
        [cat]: val
      }
    }));
  };

  const handleToggleRule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customRules: prev.customRules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    }));
  };

  const handleDeleteRule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customRules: prev.customRules.filter(r => r.id !== id)
    }));
  };

  const handleAddRule = () => {
    if (!newRule.name.trim() || !newRule.pattern.trim() || !newRule.targetFolder.trim()) return;

    const created: CustomRule = {
      ...newRule,
      id: `rule-${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      customRules: [created, ...(prev.customRules || [])]
    }));

    setNewRule({
      name: '',
      enabled: true,
      matchType: 'keyword',
      pattern: '',
      targetFolder: ''
    });
    setIsAddingRule(false);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_SETTINGS });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 select-none">
      <div className="glass-surface border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                ENGINE PREFERENCES // RULES
              </h3>
              <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                Data security protocol, segregation strategies & custom routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-brute text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tactical Sub-Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`btn-brute px-3 py-1.5 rounded text-[11px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'strategy'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            01 // STRATEGY
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`btn-brute px-3 py-1.5 rounded text-[11px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'rules'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            02 // CUSTOM RULES ({formData.customRules?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`btn-brute px-3 py-1.5 rounded text-[11px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'security'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            03 // SECURITY & PRIVACY
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`btn-brute px-3 py-1.5 rounded text-[11px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'folders'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            04 // FOLDERS
          </button>
          <button
            onClick={() => setActiveTab('engines')}
            className={`btn-brute px-3 py-1.5 rounded text-[11px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'engines'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            05 // ENGINES
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* TAB 1: ORGANIZATION STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Folder Segregation Mode
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose how files are organized according to your personal workflow
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'category' as OrganizationStrategy,
                    title: 'Semantic Domain Category',
                    desc: 'Group by high-level domain (Finances, Travel, Legal, Academic, Design, Code, Media)'
                  },
                  {
                    id: 'date-year-month' as OrganizationStrategy,
                    title: 'Timeline (Year & Month)',
                    desc: 'Organize files into chronological timeline folders (e.g. 2026/10 - October)'
                  },
                  {
                    id: 'date-year' as OrganizationStrategy,
                    title: 'Yearly Hierarchy',
                    desc: 'Organize files purely by calendar year (e.g. 2026/)'
                  },
                  {
                    id: 'extension' as OrganizationStrategy,
                    title: 'Raw File Format (Extension)',
                    desc: 'Group strictly by file extension subfolder (e.g. PDF/, PNG/, ZIP/, PPTX/)'
                  },
                  {
                    id: 'size-tier' as OrganizationStrategy,
                    title: 'Size Tiers',
                    desc: 'Segregate files into Heavy (>100MB), Medium (10-100MB), and Standard (<10MB)'
                  },
                  {
                    id: 'custom-rules' as OrganizationStrategy,
                    title: 'Strict Custom Rules Only',
                    desc: 'Route strictly according to your defined rules; unmatched items go to Unmatched'
                  }
                ].map(opt => (
                  <label
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, organizationStrategy: opt.id })}
                    className={`card-brute p-3.5 border rounded cursor-pointer transition-all flex flex-col justify-between ${
                      formData.organizationStrategy === opt.id
                        ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {opt.title}
                      </span>
                      <input
                        type="radio"
                        name="strategy"
                        checked={formData.organizationStrategy === opt.id}
                        onChange={() => setFormData({ ...formData, organizationStrategy: opt.id })}
                        className="text-emerald-600 focus:ring-0 cursor-pointer mt-0.5"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                      {opt.desc}
                    </p>
                  </label>
                ))}
              </div>

              {/* Subfolder Modifier Checkbox */}
              <div className="card-brute p-3.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 rounded">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                      Create Yearly Subfolders in Categories
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      When using Semantic Category mode, nest files by year (e.g. <code className="font-mono text-emerald-600 dark:text-emerald-400">Finances/2026/invoice.pdf</code>)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.dateSubfolders}
                    onChange={e => setFormData({ ...formData, dateSubfolders: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    User Routing Rules
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Custom rules are evaluated with top priority before any general classification
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingRule(!isAddingRule)}
                  className="btn-brute flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-[11px] cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {isAddingRule ? 'CANCEL' : 'ADD NEW RULE'}
                </button>
              </div>

              {/* Add New Rule Form */}
              {isAddingRule && (
                <div className="card-brute p-4 border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 rounded space-y-3">
                  <span className="font-mono font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    CREATE CUSTOM ROUTING RULE
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">
                        RULE NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Work Invoices"
                        value={newRule.name}
                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">
                        MATCH TYPE
                      </label>
                      <select
                        value={newRule.matchType}
                        onChange={e => setNewRule({ ...newRule, matchType: e.target.value as CustomRule['matchType'] })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-white"
                      >
                        <option value="keyword">Filename Keyword</option>
                        <option value="extension">File Extension</option>
                        <option value="regex">Regular Expression</option>
                        <option value="min_size_mb">Minimum Size (MB)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">
                        PATTERN / VALUES (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. invoice, receipt, tax"
                        value={newRule.pattern}
                        onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">
                        TARGET DESTINATION FOLDER
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Finances/Tax_Documents"
                        value={newRule.targetFolder}
                        onChange={e => setNewRule({ ...newRule, targetFolder: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAddRule}
                      className="btn-brute px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      SAVE & APPLY RULE
                    </button>
                  </div>
                </div>
              )}

              {/* Rules List */}
              <div className="space-y-2">
                {formData.customRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`card-brute p-3 border rounded flex items-center justify-between gap-3 ${
                      rule.enabled
                        ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {rule.name}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                            {rule.matchType}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          Pattern: <code className="text-slate-800 dark:text-slate-200">{rule.pattern}</code> &rarr; Destination: <code className="text-emerald-700 dark:text-emerald-400 font-bold">{rule.targetFolder}</code>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="btn-brute text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DATA SECURITY & PRIVACY PROTOCOL */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Air-Gapped Verification Banner */}
              <div className="card-brute p-4 border border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-mono font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    100% AIR-GAPPED // ZERO CONTENT SCANNING GUARANTEE
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-relaxed">
                    TidyFS classifies, sorts, and organizes files <strong>exclusively by metadata</strong> (file name, file size, extension, and OS timestamps). 
                    Your files are <strong>never opened, read, or parsed for their private contents</strong>. Zero data leaves your device.
                  </p>
                </div>
              </div>

              {/* Privacy Inspection Mode Selection */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Engine Privacy & Content Handling Mode
                </h4>

                <div className="space-y-3">
                  <label
                    onClick={() => setFormData({ ...formData, privacyMode: 'strict-metadata' })}
                    className={`card-brute p-3.5 border rounded cursor-pointer transition-all flex items-start gap-3 ${
                      formData.privacyMode === 'strict-metadata'
                        ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacyMode"
                      checked={formData.privacyMode === 'strict-metadata'}
                      onChange={() => setFormData({ ...formData, privacyMode: 'strict-metadata' })}
                      className="text-emerald-600 focus:ring-0 cursor-pointer mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          Strict Metadata Only (Default & Recommended)
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          ZERO FILE READS
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        TidyFS performs zero file read operations on disk. Duplicates and categories are evaluated strictly through exact byte sizes, file names, and copy patterns. Absolute zero exposure for sensitive, proprietary, or encrypted documents.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, privacyMode: 'local-hash' })}
                    className={`card-brute p-3.5 border rounded cursor-pointer transition-all flex items-start gap-3 ${
                      formData.privacyMode === 'local-hash'
                        ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacyMode"
                      checked={formData.privacyMode === 'local-hash'}
                      onChange={() => setFormData({ ...formData, privacyMode: 'local-hash' })}
                      className="text-emerald-600 focus:ring-0 cursor-pointer mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          Local On-Device SHA-256 Hashing
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                          BYTE-FOR-BYTE DEDUP
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Computes cryptographic SHA-256 in local RAM for files that have matching byte sizes to prove bitwise equivalence. Hashing occurs 100% on-device with zero external transmission or data persistence.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORY FOLDERS */}
          {activeTab === 'folders' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Custom Destination Folder Names
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Rename destination folders to match your preferred folder naming convention
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-300 dark:border-slate-700">
                {(Object.keys(formData.categoryFolders) as Category[]).map(cat => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold shrink-0">
                      {cat}:
                    </span>
                    <input
                      type="text"
                      value={formData.categoryFolders[cat]}
                      onChange={e => handleCategoryFolderChange(cat, e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ENGINES & DECAY */}
          {activeTab === 'engines' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Sub-Engines
                </h4>
                <div className="bg-white dark:bg-slate-800 rounded divide-y divide-slate-200 dark:divide-slate-700 border border-slate-300 dark:border-slate-700 overflow-hidden">
                  <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                        Category & Strategy Segregation
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Enable automatic folder creation and file organization
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableCategorize}
                      onChange={e => setFormData({ ...formData, enableCategorize: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                        Temporary File Decay Engine
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Automatically isolate obsolete installers (.exe, .dmg) to staging
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableDecay}
                      onChange={e => setFormData({ ...formData, enableDecay: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                        Duplicate Clutter Hunter
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Identify duplicate file copies and quarantine redundant copies
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableDeduplicate}
                      onChange={e => setFormData({ ...formData, enableDeduplicate: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Thresholds */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Thresholds & Lifecycles
                </h4>
                <div className="bg-white dark:bg-slate-800 rounded divide-y divide-slate-200 dark:divide-slate-700 border border-slate-300 dark:border-slate-700 overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                        Installer Decay Retention Window
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Flag single-use installers older than this limit as expired
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={formData.decayDays}
                        onChange={e => setFormData({ ...formData, decayDays: parseInt(e.target.value) || 14 })}
                        className="w-16 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                      <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">days</span>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                        Heavy File Warning Size
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Flag storage-consuming files exceeding this threshold
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="1024"
                        value={formData.heavyFileThresholdMB || 100}
                        onChange={e => setFormData({ ...formData, heavyFileThresholdMB: parseInt(e.target.value) || 100 })}
                        className="w-16 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                      <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md">
          <button
            onClick={handleReset}
            className="btn-brute flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET FACTORY
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-brute px-4 py-1.5 rounded text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer shadow-2xs"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="btn-brute flex items-center gap-1.5 px-4.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              <Save className="h-3.5 w-3.5" />
              APPLY SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
