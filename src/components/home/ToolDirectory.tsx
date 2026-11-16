import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Binary,
  Braces,
  Calculator,
  Clock,
  Database,
  DollarSign,
  FileText,
  Fingerprint,
  GitCompare,
  Regex,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { TOOLS, type ToolCategory } from '../../config/tools';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces,
  ShieldCheck,
  Clock,
  Regex,
  Binary,
  Fingerprint,
  Database,
  GitCompare,
  FileText,
  DollarSign,
  Calculator,
  TrendingUp,
};

export default function ToolDirectory() {
  const [filter, setFilter] = useState<'all' | ToolCategory>('all');
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const catMatch = filter === 'all' || tool.category === filter;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.shortName.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.includes(q))
      );
    });
  }, [filter, search]);

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-1">
          {[
            { id: 'all', label: `All Tools (${TOOLS.length})` },
            { id: 'developer', label: 'Developer Studio (8)' },
            { id: 'freelance', label: 'Freelance & Business (4)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as 'all' | ToolCategory)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tools (e.g., JWT, Invoice, SQL)..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bento Grid */}
      {filteredTools.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] py-12 text-center text-sm text-slate-500">
          No tools matched <span className="font-mono text-indigo-500">"{search}"</span>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = ICON_MAP[tool.iconName] || Braces;
            const isFreelance = tool.category === 'freelance';
            return (
              <a
                key={tool.slug}
                href={`/tools/${tool.slug}/`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 shadow-sm hover:border-indigo-500/60 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        isFreelance
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        isFreelance
                          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.shortName}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {tool.tagline}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{tool.categoryLabel}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    Launch <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
