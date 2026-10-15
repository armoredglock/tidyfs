import React from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { ScannedFile } from '../types.js';
import { formatBytes } from './StatsCards.js';

interface DuplicatesViewProps {
  files: ScannedFile[];
  onRevealFile: (path: string) => void;
}

export const DuplicatesView: React.FC<DuplicatesViewProps> = ({ files, onRevealFile }) => {
  const duplicateFiles = files.filter(f => f.duplicateOf);
  const totalWastedBytes = duplicateFiles.reduce((acc, f) => acc + f.size, 0);

  if (duplicateFiles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          Zero Duplicate Files Detected
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
          Every file in this folder has unique content and naming. No storage capacity is being wasted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1 select-none flex flex-col">
      {/* Banner */}
      <div className="card-normal p-4 flex items-center justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center">
              <Copy className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Duplicate Storage Hunter
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
            Found <span className="text-rose-700 dark:text-rose-400 font-extrabold">{duplicateFiles.length} duplicate files</span> wasting{' '}
            <span className="text-rose-700 dark:text-rose-400 font-mono font-extrabold">{formatBytes(totalWastedBytes)}</span> of disk space.
          </p>
        </div>
      </div>

      {/* Duplicates Table */}
      <div className="card-normal overflow-hidden transition-colors flex-1 min-h-[380px] max-h-[58vh] flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-extrabold">
              <tr>
                <th className="p-3">Duplicate File</th>
                <th className="p-3">Original Reference</th>
                <th className="p-3">Wasted Space</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
              {duplicateFiles.map(file => (
                <tr key={file.path} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-rose-800 dark:text-rose-300 font-mono font-bold flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate max-w-xs" title={file.name}>
                      {file.name}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 font-mono font-medium">
                    <span className="truncate max-w-xs block text-slate-800 dark:text-slate-200 font-bold" title={file.duplicateOf}>
                      {file.duplicateOf ? file.duplicateOf.split(/[\\/]/).pop() : 'Original reference'}
                    </span>
                  </td>
                  <td className="p-3 text-rose-700 dark:text-rose-400 font-mono font-extrabold text-xs">
                    {formatBytes(file.size)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onRevealFile(file.path)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                      title="Reveal in File Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
