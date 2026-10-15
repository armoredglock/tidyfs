import React, { useState } from 'react';
import { X, Save, Settings, RotateCcw } from 'lucide-react';
import { TidySettings, DEFAULT_SETTINGS, Category } from '../types.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TidySettings;
  onSave: (newSettings: TidySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<TidySettings>({ ...settings });

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

  const handleReset = () => {
    setFormData({ ...DEFAULT_SETTINGS });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              TidyFS Preferences & Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-normal text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Active Engines Group */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Active Engines
            </h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Smart Semantic Categorization</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sort documents by topic (Finances, Travel, Media, Code)</span>
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
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Temporary File Decay Engine</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Recycle obsolete installers (.exe, .zip) automatically</span>
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
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Duplicate Storage Hunter</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Detect and isolate byte-for-byte duplicate copies</span>
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

          {/* Decay Duration */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              File Lifecycle & Thresholds
            </h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Installer Decay Lifetime</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Flag installers older than this as obsolete</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.decayDays}
                    onChange={e => setFormData({ ...formData, decayDays: parseInt(e.target.value) || 14 })}
                    className="w-16 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">days</span>
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Heavy File Warning Threshold</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Flag files exceeding this size in Storage Hunter</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1024"
                    value={formData.heavyFileThresholdMB || 50}
                    onChange={e => setFormData({ ...formData, heavyFileThresholdMB: parseInt(e.target.value) || 50 })}
                    className="w-16 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-bold text-xs">MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Subfolders */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Designated Category Subfolders
            </h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 grid grid-cols-2 gap-3 border border-slate-200 dark:border-slate-700">
              {(Object.keys(formData.categoryFolders) as Category[]).map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="w-20 text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0">{cat}:</span>
                  <input
                    type="text"
                    value={formData.categoryFolders[cat]}
                    onChange={e => handleCategoryFolderChange(cat, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            onClick={handleReset}
            className="btn-normal flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-normal px-4 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-normal flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Save Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
