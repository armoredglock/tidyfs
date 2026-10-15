import React from 'react';
import { History, RotateCcw, Check } from 'lucide-react';
import { JournalEntry } from '../types.js';

interface JournalViewProps {
  journal: JournalEntry[];
  onRevert: (id: string) => void;
  isReverting: boolean;
}

export const JournalView: React.FC<JournalViewProps> = ({ journal, onRevert, isReverting }) => {
  if (journal.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3.5">
          <History className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          No Past Transactions Recorded
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
          When you execute tidy operations, full reverse journals will be maintained here so you can rewind any operation back in time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1 select-none flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            Transaction History and Revert Journal
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Every file movement is indexed. Reverting restores each file straight back to its previous location.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
        {journal.map(entry => {
          const isReverted = entry.status === 'reverted';
          const dateStr = new Date(entry.timestamp).toLocaleString();

          return (
            <div
              key={entry.id}
              className={`card-normal p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isReverted ? 'opacity-50 bg-slate-50 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">Batch #{entry.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                      isReverted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {entry.actions.length} files organized · <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{dateStr}</span>
                </div>
              </div>

              <div>
                {isReverted ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Reverted
                  </span>
                ) : (
                  <button
                    onClick={() => onRevert(entry.id)}
                    disabled={isReverting}
                    className="btn-normal flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-extrabold cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revert Operation
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
