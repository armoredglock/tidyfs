import React, { useState, useMemo } from 'react';
import { ArrowRight, Check, Eye, FileText, ExternalLink, Sparkles, Filter, Search, ArrowUpDown, Ban } from 'lucide-react';
import { TidyPlan, TidyAction, Category, OrganizationStrategy } from '../types.js';
import { formatBytes } from './StatsCards.js';

interface PlanViewProps {
  plan: TidyPlan | null;
  dryRun: boolean;
  setDryRun: (val: boolean) => void;
  onExecute: (selectedActions: TidyAction[]) => void;
  isExecuting: boolean;
  onRevealFile: (path: string) => void;
  filterCategory?: Category | 'all';
  currentStrategy?: OrganizationStrategy;
  onChangeStrategy?: (strategy: OrganizationStrategy) => void;
  onOpenSettings?: () => void;
}

const CATEGORY_TINTS: Record<Category, string> = {
  Finances: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  Travel: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
  Legal: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  Academic: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800',
  Media: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  Design: 'bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-800 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-800',
  Documents: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  Code: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  Archives: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  Installers: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
  Other: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
};

type SortKey = 'size_desc' | 'size_asc' | 'name_asc' | 'name_desc' | 'category';

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  dryRun,
  setDryRun,
  onExecute,
  isExecuting,
  onRevealFile,
  filterCategory = 'all',
  currentStrategy = 'category',
  onChangeStrategy,
  onOpenSettings
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewState, setViewState] = useState<'auto' | 'success' | 'table'>('auto');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(filterCategory);
  const [sortBy, setSortBy] = useState<SortKey>('size_desc');
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setSelectedCategory(filterCategory);
  }, [filterCategory]);

  React.useEffect(() => {
    if (plan) {
      setSelectedIds(new Set(plan.actions.map(a => a.id)));
    }
  }, [plan]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = (visibleActions: TidyAction[]) => {
    const visibleIds = visibleActions.map(a => a.id);
    const allVisibleSelected = visibleIds.every(id => selectedIds.has(id));

    const next = new Set(selectedIds);
    if (allVisibleSelected) {
      visibleIds.forEach(id => next.delete(id));
    } else {
      visibleIds.forEach(id => next.add(id));
    }
    setSelectedIds(next);
  };

  const toggleIgnore = (id: string) => {
    const next = new Set(ignoredIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      const sel = new Set(selectedIds);
      sel.delete(id);
      setSelectedIds(sel);
    }
    setIgnoredIds(next);
  };

  const hasActions = plan && plan.actions.length > 0;
  const isSuccessMode = viewState === 'success' || (!hasActions && viewState !== 'table');

  const filteredActions = useMemo(() => {
    if (!plan) return [];
    return plan.actions
      .filter(action => {
        if (ignoredIds.has(action.id)) return false;
        if (selectedCategory !== 'all' && action.category !== selectedCategory) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = action.fileName.toLowerCase().includes(q);
          const matchReason = action.reason.toLowerCase().includes(q);
          const matchCat = action.category.toLowerCase().includes(q);
          if (!matchName && !matchReason && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'size_desc') return b.fileSize - a.fileSize;
        if (sortBy === 'size_asc') return a.fileSize - b.fileSize;
        if (sortBy === 'name_asc') return a.fileName.localeCompare(b.fileName);
        if (sortBy === 'name_desc') return b.fileName.localeCompare(a.fileName);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return 0;
      });
  }, [plan, searchQuery, selectedCategory, sortBy, ignoredIds]);

  if (isSuccessMode) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center select-none card-brute p-8">
        <div className="w-12 h-12 rounded bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        <span className="telemetry-tag text-emerald-700 dark:text-emerald-400 font-mono mb-1">
          STATUS // PERFECTLY_ORGANIZED
        </span>

        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono">
          All Target Files In Place
        </h3>

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
          No obsolete clutter, duplicates, or unorganized files detected in the active monitored folder.
        </p>

        {hasActions && (
          <button
            onClick={() => setViewState('table')}
            className="btn-brute mt-5 px-3.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            SHOW {plan?.actions.length} PENDING OPERATIONS
          </button>
        )}
      </div>
    );
  }

  const selectedActions = filteredActions.filter(a => selectedIds.has(a.id));

  return (
    <div className="space-y-3 pt-1 select-none flex flex-col">
      {/* Segregation Strategy Control Deck */}
      <div className="card-brute px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-100/70 dark:bg-[#070b14] border border-slate-300 dark:border-slate-800 rounded">
        <div className="flex items-center gap-2">
          <span className="telemetry-tag text-slate-500 dark:text-slate-400">
            SEGREGATION STRATEGY:
          </span>
          <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
            {currentStrategy?.replace(/-/g, ' ') || 'SEMANTIC CATEGORY'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'category' as OrganizationStrategy, label: 'CATEGORY' },
            { id: 'date-year-month' as OrganizationStrategy, label: 'TIMELINE (YYYY/MM)' },
            { id: 'extension' as OrganizationStrategy, label: 'FORMAT (EXT)' },
            { id: 'size-tier' as OrganizationStrategy, label: 'SIZE TIERS' },
            { id: 'custom-rules' as OrganizationStrategy, label: 'CUSTOM RULES' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => onChangeStrategy?.(st.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                currentStrategy === st.id
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-slate-950 font-black shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {st.label}
            </button>
          ))}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100 cursor-pointer"
              title="Configure Custom Rules & Strategy"
            >
              RULES...
            </button>
          )}
        </div>
      </div>

      {/* High-Priority Threat Alert Banner */}
      {plan?.summary?.threatCount && plan.summary.threatCount > 0 ? (
        <div className="card-brute p-3.5 border-2 border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Ban className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono font-black text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
                SECURITY ALERT // {plan.summary.threatCount} SUSPICIOUS / MALWARE DECEPTION THREAT(S) DETECTED
              </span>
              <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                Double extensions, Right-to-Left character spoofing, or dangerous script wrappers staged for quarantine.
              </p>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-rose-600 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase shrink-0">
            AUTO-ISOLATED TO QUARANTINE
          </span>
        </div>
      ) : null}

      {/* Functional Filter & Search Bar */}
      <div className="card-brute p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
        {/* Live Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 text-slate-500 dark:text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="FILTER FILES // [name, ext, rule]..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0c1222] border border-slate-300 dark:border-slate-700 rounded text-xs sm:text-[13px] font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          {(['all', 'Finances', 'Travel', 'Legal', 'Academic', 'Media', 'Design', 'Documents', 'Code', 'Archives', 'Installers'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {cat === 'all' ? 'ALL' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-slate-50 dark:bg-[#0c1222] border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs sm:text-[13px] font-mono font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="size_desc">SORT: SIZE (DESC)</option>
            <option value="size_asc">SORT: SIZE (ASC)</option>
            <option value="name_asc">SORT: NAME (A-Z)</option>
            <option value="name_desc">SORT: NAME (Z-A)</option>
            <option value="category">SORT: CATEGORY</option>
          </select>
        </div>
      </div>

      {/* Action Control Bar */}
      <div className="card-brute p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors bg-slate-50/50 dark:bg-slate-850/50">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={filteredActions.length > 0 && filteredActions.every(a => selectedIds.has(a.id))}
            onChange={() => toggleAll(filteredActions)}
            className="rounded-none border-slate-400 dark:border-slate-600 text-slate-900 focus:ring-0 h-4 w-4 cursor-pointer"
          />
          <span className="telemetry-tag text-slate-800 dark:text-slate-200 text-xs sm:text-[13px]">
            {selectedActions.length} / {filteredActions.length} OPERATIONS SELECTED
          </span>

          <button
            onClick={() => setViewState('success')}
            className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline ml-2 cursor-pointer uppercase"
          >
            [SHOW SUCCESS STATE]
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dry Run Switch */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded">
            <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase">
              <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              DRY RUN:
            </span>
            <button
              onClick={() => setDryRun(!dryRun)}
              type="button"
              className={`btn-brute text-[11px] font-mono font-black px-2 py-0.5 rounded border cursor-pointer ${
                dryRun
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-rose-600 text-white border-rose-700'
              }`}
            >
              {dryRun ? 'ENGAGED' : 'LIVE'}
            </button>
          </div>

          {/* Execute Button */}
          <button
            onClick={() => onExecute(selectedActions)}
            disabled={isExecuting || selectedActions.length === 0}
            className={`btn-brute flex items-center gap-2 px-5 py-2 rounded font-black text-xs sm:text-[13px] uppercase tracking-wider cursor-pointer disabled:opacity-40 border transition-all ${
              dryRun
                ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-600 dark:border-emerald-400 font-black shadow-md glow-emerald'
            }`}
          >
            {dryRun ? <Eye className="h-4 w-4 text-emerald-400 dark:text-emerald-600" /> : <Sparkles className="h-4 w-4 text-slate-950" />}
            {isExecuting ? 'PROCESSING...' : dryRun ? 'PREVIEW EXECUTION' : 'EXECUTE LIVE'}
          </button>
        </div>
      </div>

      {/* Operations Table */}
      <div className="card-brute overflow-hidden transition-colors flex-1 min-h-[380px] max-h-[60vh] flex flex-col border border-slate-300 dark:border-slate-800">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-100 dark:bg-slate-850 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono text-xs font-black">
              <tr>
                <th className="p-3 w-10 text-center"></th>
                <th className="p-3">FILE IDENTIFIER</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">ROUTING DESTINATION</th>
                <th className="p-3">SIZE</th>
                <th className="p-3">CLASSIFICATION REASON</th>
                <th className="p-3 w-20 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-500 dark:text-slate-400 font-bold font-mono text-sm">
                    NO ENTRIES MATCHING ACTIVE FILTER PARAMETERS.
                  </td>
                </tr>
              ) : (
                filteredActions.map(action => (
                  <tr
                    key={action.id}
                    className={`hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors ${
                      !selectedIds.has(action.id) ? 'opacity-35' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(action.id)}
                        onChange={() => toggleSelect(action.id)}
                        className="rounded-none border-slate-400 dark:border-slate-600 text-emerald-600 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-sm sm:max-w-md font-bold text-[13px]" title={action.fileName}>
                        {action.fileName}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black border uppercase ${
                          CATEGORY_TINTS[action.category]
                        }`}
                      >
                        {action.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          action.type === 'quarantine'
                            ? 'bg-rose-600 text-white border border-rose-700'
                            : action.type === 'trash'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : action.type === 'delete_duplicate'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {action.type === 'quarantine' ? 'QUARANTINE' : action.type === 'trash' ? 'RECYCLE' : action.type === 'delete_duplicate' ? 'DEDUP' : 'MOVE'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-400 truncate max-w-sm text-[13px] font-bold" title={action.targetPath}>
                          {action.targetPath.split(/[\\/]/).slice(-2).join('/')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-bold text-[13px]">
                      {formatBytes(action.fileSize)}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 truncate max-w-sm text-xs sm:text-[13px] font-medium" title={action.reason}>
                      {action.reason}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onRevealFile(action.sourcePath)}
                          className="btn-brute text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 cursor-pointer"
                          title="Reveal in Explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleIgnore(action.id)}
                          className="btn-brute text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                          title="Ignore / Whitelist file"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
