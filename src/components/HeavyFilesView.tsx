import React, { useState } from 'react';
import { HardDrive, ExternalLink, Check } from 'lucide-react';
import { ScannedFile } from '../types.js';
import { formatBytes } from './StatsCards.js';

interface HeavyFilesViewProps {
  files: ScannedFile[];
  thresholdMB: number;
  onRevealFile: (path: string) => void;
  onThresholdChange?: (newThresholdMB: number) => void;
}

export const HeavyFilesView: React.FC<HeavyFilesViewProps> = ({
  files,
  thresholdMB,
  onRevealFile,
  onThresholdChange
}) => {
  const [currentThreshold, setCurrentThreshold] = useState<number>(thresholdMB);

  const thresholdBytes = currentThreshold * 1024 * 1024;
  const heavyFiles = files.filter(f => f.size >= thresholdBytes);
  const totalHeavyBytes = heavyFiles.reduce((acc, f) => acc + f.size, 0);

  const handlePresetThreshold = (mb: number) => {
    setCurrentThreshold(mb);
    if (onThresholdChange) onThresholdChange(mb);
  };

  if (heavyFiles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3.5">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          No Heavy Files Detected
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
          No files in this folder exceed your {currentThreshold} MB threshold. Your storage is not being eaten up by massive downloads.
        </p>

        <div className="mt-4 flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">Try lower threshold:</span>
          <button
            onClick={() => handlePresetThreshold(50)}
            className="px-2.5 py-1 rounded text-xs font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            50 MB
          </button>
          <button
            onClick={() => handlePresetThreshold(20)}
            className="px-2.5 py-1 rounded text-xs font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            20 MB
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1 select-none flex flex-col">
      {/* Banner */}
      <div className="card-normal p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center">
              <HardDrive className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Heavy File Hunter (Files &gt; {currentThreshold} MB)
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
            Found <span className="text-blue-700 dark:text-blue-400 font-extrabold">{heavyFiles.length} heavy files</span> consuming{' '}
            <span className="text-blue-700 dark:text-blue-400 font-mono font-extrabold">{formatBytes(totalHeavyBytes)}</span> of disk space.
          </p>
        </div>

        {/* Quick Threshold Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-md shrink-0 text-xs border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400 font-extrabold px-1.5">Threshold:</span>
          {[20, 50, 100, 500].map(val => (
            <button
              key={val}
              onClick={() => handlePresetThreshold(val)}
              className={`px-2.5 py-1 rounded font-extrabold transition-all cursor-pointer ${
                currentThreshold === val
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {val} MB
            </button>
          ))}
        </div>
      </div>

      {/* Heavy Files Table */}
      <div className="card-normal overflow-hidden transition-colors flex-1 min-h-[380px] max-h-[60vh] flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs font-black">
              <tr>
                <th className="p-3.5">File Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5 w-14 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
              {heavyFiles
                .sort((a, b) => b.size - a.size)
                .map(file => (
                  <tr key={file.path} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-slate-900 dark:text-white font-mono font-bold flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                        <HardDrive className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-sm sm:max-w-md" title={file.name}>
                        {file.name}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {file.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-blue-700 dark:text-blue-400 font-mono font-extrabold text-xs sm:text-[13px]">
                      {formatBytes(file.size)}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-[13px]">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onRevealFile(file.path)}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 cursor-pointer"
                        title="Reveal in File Explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
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
