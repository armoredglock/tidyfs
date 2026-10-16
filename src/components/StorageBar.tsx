import React from 'react';
import { TidyPlan, Category } from '../types.js';
import { formatBytes } from './StatsCards.js';
import { Trash2, Copy, FileSpreadsheet, HardDrive } from 'lucide-react';

interface StorageBarProps {
  plan: TidyPlan | null;
  onFilterCategory: (category: Category | 'all') => void;
  activeCategory: Category | 'all';
  onQuickCleanDecay: () => void;
  onQuickCleanDuplicates: () => void;
  onExportReport: () => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Finances: 'bg-emerald-600 dark:bg-emerald-500',
  Travel: 'bg-sky-600 dark:bg-sky-500',
  Legal: 'bg-rose-600 dark:bg-rose-500',
  Academic: 'bg-teal-600 dark:bg-teal-500',
  Media: 'bg-purple-600 dark:bg-purple-500',
  Design: 'bg-fuchsia-600 dark:bg-fuchsia-500',
  Documents: 'bg-blue-600 dark:bg-blue-500',
  Code: 'bg-amber-600 dark:bg-amber-500',
  Archives: 'bg-indigo-600 dark:bg-indigo-500',
  Installers: 'bg-orange-600 dark:bg-orange-500',
  Other: 'bg-slate-500 dark:bg-slate-400'
};

const CATEGORY_PILL_STYLES: Record<Category, string> = {
  Finances: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800',
  Travel: 'text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800',
  Legal: 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800',
  Academic: 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border-teal-300 dark:border-teal-800',
  Media: 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800',
  Design: 'text-fuchsia-800 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/70 border-fuchsia-300 dark:border-fuchsia-800',
  Documents: 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800',
  Code: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800',
  Archives: 'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800',
  Installers: 'text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/70 border-orange-300 dark:border-orange-800',
  Other: 'text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
};

export const StorageBar: React.FC<StorageBarProps> = ({
  plan,
  onFilterCategory,
  activeCategory,
  onQuickCleanDecay,
  onQuickCleanDuplicates,
  onExportReport
}) => {
  if (!plan || plan.totalBytes === 0) return null;

  const totalBytes = plan.totalBytes;
  const categories = Object.keys(plan.summary.categoryBytes || {}) as Category[];
  const activeCategories = categories.filter(c => (plan.summary.categoryBytes[c] || 0) > 0);

  return (
    <div className="card-brute p-4 sm:p-4.5 bg-white dark:bg-[#0b1120] border border-slate-300 dark:border-slate-800 rounded select-none space-y-3.5 transition-colors">
      {/* Top Header: Allocation Map Telemetry & Quick Action Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
          <div>
            <span className="telemetry-tag text-slate-500 dark:text-slate-400 block leading-none">
              STORAGE MAP // ALLOCATION BREAKDOWN
            </span>
            <span className="text-xs sm:text-[13px] font-mono font-bold text-slate-800 dark:text-slate-200">
              TOTAL ANALYZED: <span className="font-black text-slate-900 dark:text-white">{formatBytes(totalBytes)}</span> ({plan.totalFiles} files)
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          {plan.summary.decayCount > 0 && (
            <button
              onClick={onQuickCleanDecay}
              className="btn-brute flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs sm:text-[13px] font-extrabold cursor-pointer shadow-2xs"
              title="Clean only expired installers and stale archives"
            >
              <Trash2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              CLEAN EXPIRED ({plan.summary.decayCount})
            </button>
          )}

          {plan.summary.duplicateCount > 0 && (
            <button
              onClick={onQuickCleanDuplicates}
              className="btn-brute flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 text-xs sm:text-[13px] font-extrabold cursor-pointer shadow-2xs"
              title="Clean only duplicate copies"
            >
              <Copy className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              PURGE DUPLICATES ({plan.summary.duplicateCount})
            </button>
          )}

          <button
            onClick={onExportReport}
            className="btn-brute flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs sm:text-[13px] font-extrabold cursor-pointer shadow-2xs"
            title="Export full file report to CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            EXPORT CSV
          </button>
        </div>
      </div>

      {/* Segmented Proportional Meter */}
      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded overflow-hidden flex border border-slate-300 dark:border-slate-700">
        {activeCategories.map(cat => {
          const bytes = plan.summary.categoryBytes[cat] || 0;
          const percentage = (bytes / totalBytes) * 100;
          if (percentage < 0.4) return null;

          return (
            <div
              key={cat}
              onClick={() => onFilterCategory(activeCategory === cat ? 'all' : cat)}
              style={{ width: `${percentage}%` }}
              className={`${CATEGORY_COLORS[cat]} h-full hover:brightness-110 border-r border-black/20 cursor-pointer transition-all`}
              title={`${cat}: ${formatBytes(bytes)} (${percentage.toFixed(1)}%) - Click to filter`}
            />
          );
        })}
      </div>

      {/* Interactive Category Chips */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs font-mono">
        <button
          onClick={() => onFilterCategory('all')}
          className={`px-2.5 py-1 rounded text-xs font-extrabold border transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
          }`}
        >
          ALL ({plan.totalFiles})
        </button>

        {activeCategories.map(cat => {
          const bytes = plan.summary.categoryBytes[cat] || 0;
          const percentage = ((bytes / totalBytes) * 100).toFixed(1);
          const isSelected = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onFilterCategory(isSelected ? 'all' : cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-extrabold border transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-1 dark:ring-offset-slate-950 ' + CATEGORY_PILL_STYLES[cat]
                  : CATEGORY_PILL_STYLES[cat]
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm ${CATEGORY_COLORS[cat]}`} />
              <span>{cat.toUpperCase()}</span>
              <span className="text-[11px] opacity-75">({percentage}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
