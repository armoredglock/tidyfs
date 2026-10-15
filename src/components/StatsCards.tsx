import React from 'react';
import { Files, Clock, Copy, FolderSync } from 'lucide-react';
import { TidyPlan, ScannedFile } from '../types.js';

interface StatsCardsProps {
  plan: TidyPlan | null;
  files: ScannedFile[];
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ plan, files }) => {
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const pendingActions = plan ? plan.actions.length : 0;
  const decayCount = plan ? plan.summary.decayCount : 0;
  const decayBytes = plan ? plan.summary.decayBytes : 0;
  const duplicateCount = plan ? plan.summary.duplicateCount : 0;
  const duplicateBytes = plan ? plan.summary.duplicateBytes : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Monitored Storage */}
      <div className="card-brute p-3.5 flex flex-col justify-between transition-colors border-l-4 border-l-blue-600 dark:border-l-blue-500">
        <div className="flex items-center justify-between">
          <span className="telemetry-tag text-slate-500 dark:text-slate-400">
            FS // MONITORED
          </span>
          <div className="h-6 w-6 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
            <Files className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {files.length}
            </span>
            <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">
              FILES
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>VOLUME:</span>
            <span className="text-blue-700 dark:text-blue-300">{formatBytes(totalBytes)}</span>
          </div>
        </div>
      </div>

      {/* 2. Pending Categorization */}
      <div className="card-brute p-3.5 flex flex-col justify-between transition-colors border-l-4 border-l-emerald-600 dark:border-l-emerald-500">
        <div className="flex items-center justify-between">
          <span className="telemetry-tag text-slate-500 dark:text-slate-400">
            RULES // TO_SORT
          </span>
          <div className="h-6 w-6 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <FolderSync className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {pendingActions}
            </span>
            <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">
              ACTIONS
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>STATUS:</span>
            <span className={pendingActions > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
              {pendingActions > 0 ? 'READY TO APPLY' : 'ALL SORTED'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Expired Installers & Archives */}
      <div className="card-brute p-3.5 flex flex-col justify-between transition-colors border-l-4 border-l-amber-600 dark:border-l-amber-500">
        <div className="flex items-center justify-between">
          <span className="telemetry-tag text-slate-500 dark:text-slate-400">
            DECAY // OBSOLETE
          </span>
          <div className="h-6 w-6 rounded bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {decayCount}
            </span>
            <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">
              STALE
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>WASTE:</span>
            <span className="text-amber-700 dark:text-amber-300">{formatBytes(decayBytes)}</span>
          </div>
        </div>
      </div>

      {/* 4. Duplicate Clutter */}
      <div className="card-brute p-3.5 flex flex-col justify-between transition-colors border-l-4 border-l-rose-600 dark:border-l-rose-500">
        <div className="flex items-center justify-between">
          <span className="telemetry-tag text-slate-500 dark:text-slate-400">
            CLONES // DEDUP
          </span>
          <div className="h-6 w-6 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
            <Copy className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {duplicateCount}
            </span>
            <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">
              COPIES
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>RECLAIMABLE:</span>
            <span className="text-rose-700 dark:text-rose-300">{formatBytes(duplicateBytes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
