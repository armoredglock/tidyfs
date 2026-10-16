import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert, ExternalLink, Package } from 'lucide-react';
import { ScannedFile, DecayState } from '../types.js';
import { formatBytes } from './StatsCards.js';

interface DecayViewProps {
  files: ScannedFile[];
  decayDays: number;
  onRevealFile: (path: string) => void;
}

export const DecayView: React.FC<DecayViewProps> = ({ files, decayDays, onRevealFile }) => {
  const [filter, setFilter] = useState<DecayState | 'all'>('all');

  const installerFiles = files.filter(f => f.isInstallerOrArchive);

  const filtered = installerFiles.filter(f => {
    if (filter === 'all') return true;
    return f.decayState === filter;
  });

  const expiredCount = installerFiles.filter(f => f.decayState === 'expired').length;
  const expiringCount = installerFiles.filter(f => f.decayState === 'expiring').length;
  const activeCount = installerFiles.filter(f => f.decayState === 'active').length;

  return (
    <div className="space-y-4 pt-1 select-none flex flex-col">
      {/* Banner */}
      <div className="card-normal p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Temporary File Decay Engine
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Installers (<code className="text-amber-800 dark:text-amber-300 font-mono font-bold">.exe</code>, <code className="text-amber-800 dark:text-amber-300 font-mono font-bold">.msi</code>) and archives (<code className="text-amber-800 dark:text-amber-300 font-mono font-bold">.zip</code>) are single-use clutter. TidyFS tracks their physical age and marks them for recycling after {decayDays} days.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`btn-normal px-2.5 py-1 rounded text-xs font-extrabold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({installerFiles.length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`btn-normal px-2.5 py-1 rounded text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'expired'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Expired ({expiredCount})
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`btn-normal px-2.5 py-1 rounded text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'expiring'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Expiring ({expiringCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn-normal px-2.5 py-1 rounded text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Active ({activeCount})
          </button>
        </div>
      </div>

      {/* Grid of Decay Candidates */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center card-normal text-slate-500 dark:text-slate-400 font-extrabold text-xs">
          No temporary files matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map(file => {
            const isExpired = file.decayState === 'expired';
            const isExpiring = file.decayState === 'expiring';

            return (
              <div
                key={file.path}
                className="card-normal p-4 sm:p-4.5 flex flex-col justify-between space-y-3.5 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-mono font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white truncate max-w-[210px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>

                    <button
                      onClick={() => onRevealFile(file.path)}
                      className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
                      title="Reveal in Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                    <span>{formatBytes(file.size)}</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Added {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Lifecycle</span>
                  <div>
                    {isExpired ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                        EXPIRED
                      </span>
                    ) : isExpiring ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                        EXPIRING SOON
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
