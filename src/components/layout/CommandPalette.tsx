import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Binary,
  BookOpen,
  Braces,
  Calculator,
  Clock,
  Command,
  CornerDownLeft,
  Database,
  DollarSign,
  FileText,
  Fingerprint,
  GitCompare,
  Regex,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { TOOLS } from '../../config/tools';
import { GUIDES } from '../../data/guides';

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

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  group: 'Developer Studio' | 'Freelance Finance' | 'Playbooks';
  badge: string;
  iconName: string;
  keywords: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<SearchItem[]>(() => {
    const toolItems: SearchItem[] = TOOLS.map((t) => ({
      id: `tool-${t.slug}`,
      title: t.shortName,
      subtitle: t.tagline,
      href: `/tools/${t.slug}/`,
      group: t.category === 'developer' ? 'Developer Studio' : 'Freelance Finance',
      badge: t.badge,
      iconName: t.iconName,
      keywords: `${t.name} ${t.shortName} ${t.keywords.join(' ')} ${t.badge}`.toLowerCase(),
    }));
    const guideItems: SearchItem[] = GUIDES.map((g) => ({
      id: `guide-${g.slug}`,
      title: g.title,
      subtitle: g.excerpt,
      href: `/guides/${g.slug}/`,
      group: 'Playbooks',
      badge: g.readingTime,
      iconName: 'BookOpen',
      keywords: `${g.title} ${g.category} ${g.excerpt}`.toLowerCase(),
    }));
    return [...toolItems, ...guideItems];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpenCustom = () => setOpen(true);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('taprico:open-palette', onOpenCustom);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('taprico:open-palette', onOpenCustom);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [open]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) {
        window.location.href = target.href;
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-sm px-4 pt-16 sm:pt-24"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Quick tool launcher"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f1628] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
          <Search className="h-4 w-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Jump to any tool or guide (e.g., JWT, YAML, Invoice, 1099, Cron)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No tools matched <span className="font-mono text-indigo-500">"{query}"</span>. Try JSON, JWT, Invoice, or Rate.
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((item, idx) => {
                const Icon = ICON_MAP[item.iconName] || BookOpen;
                const isActive = idx === activeIndex;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-500/15 text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            item.group === 'Freelance Finance'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                              : item.group === 'Playbooks'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{item.title}</span>
                            <span className="hidden sm:inline-block rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                              {item.group}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          {item.badge}
                        </span>
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5 text-indigo-500" />}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
              Close
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-500 font-medium">
            <Command className="h-3 w-3" /> 100% Client-Side Execution
          </span>
        </div>
      </div>
    </div>
  );
}
