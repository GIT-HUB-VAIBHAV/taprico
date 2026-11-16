import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Copy, Replace, SearchCheck, Sparkles } from 'lucide-react';

interface Preset {
  label: string;
  pattern: string;
  flags: string;
  sampleText: string;
  replacement: string;
}

const PRESETS: Preset[] = [
  {
    label: 'US Phone',
    pattern: '(?:\\+1[\\s.-]?)?\\(?(\\d{3})\\)?[\\s.-]?(\\d{3})[\\s.-]?(\\d{4})',
    flags: 'g',
    sampleText: `Acme Support: (415) 890-4421\nBilling Desk: +1 212-555-0194\nAustin Office: 512.555.7890\nInvalid: 123-45`,
    replacement: '($1) $2-$3',
  },
  {
    label: 'US ZIP / ZIP+4',
    pattern: '\\b(?<zip>\\d{5})(?:-(?<plus4>\\d{4}))?\\b',
    flags: 'g',
    sampleText: `San Francisco, CA 94107\nNew York, NY 10001-3421\nAustin, TX 78701\nBad code: 9410`,
    replacement: 'ZIP:$1',
  },
  {
    label: 'Email Address',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: 'gi',
    sampleText: `Contact alex.morgan@acme.io or billing+us@taprico.com\nBounce: invalid@@domain`,
    replacement: '$1 [at] $2',
  },
  {
    label: 'SemVer Tag',
    pattern: 'v?(?<major>0|[1-9]\\d*)\\.(?<minor>0|[1-9]\\d*)\\.(?<patch>0|[1-9]\\d*)(?:-(?<prerelease>[0-9A-Za-z-]+))?',
    flags: 'g',
    sampleText: `Deploying v2.14.0-rc1 -> previous 2.13.9 (ignore v01.2.3)`,
    replacement: 'major=$1 minor=$2 patch=$3',
  },
  {
    label: 'ISO Date',
    pattern: '(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    sampleText: `Invoice Date: 2026-11-17\nDue Date: 2026-12-17\nInvalid: 2026-13-40`,
    replacement: '$2/$3/$1',
  },
];

const CHEAT_TOKENS = [
  { token: '\\d+', title: 'One or more digits' },
  { token: '\\w+', title: 'Word chars [A-Za-z0-9_]' },
  { token: '\\b', title: 'Word boundary' },
  { token: '(?<name>...)', title: 'Named capture group' },
  { token: '(?:...)', title: 'Non-capturing group' },
  { token: '(?=...)', title: 'Positive lookahead' },
  { token: '(?!...)', title: 'Negative lookahead' },
  { token: '[A-Za-z0-9_-]+', title: 'URL slug characters' },
];

interface MatchItem {
  index: number;
  end: number;
  value: string;
  groups: string[];
  namedGroups: Record<string, string> | undefined;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [testText, setTestText] = useState(PRESETS[0].sampleText);
  const [replacePattern, setReplacePattern] = useState(PRESETS[0].replacement);
  const [tab, setTab] = useState<'matches' | 'replace'>('matches');
  const [copied, setCopied] = useState(false);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const result = useMemo(() => {
    if (!pattern) {
      return { ok: true as const, matches: [] as MatchItem[], replaced: testText, elapsedMs: 0 };
    }
    try {
      const start = performance.now();
      const re = new RegExp(pattern, flags);
      const matches: MatchItem[] = [];

      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testText)) !== null && safety < 500) {
          safety++;
          matches.push({
            index: m.index,
            end: m.index + m[0].length,
            value: m[0],
            groups: m.slice(1),
            namedGroups: m.groups,
          });
          if (m[0].length === 0) {
            re.lastIndex++;
          }
        }
      } else {
        const m = re.exec(testText);
        if (m) {
          matches.push({
            index: m.index,
            end: m.index + m[0].length,
            value: m[0],
            groups: m.slice(1),
            namedGroups: m.groups,
          });
        }
      }

      const replaced = testText.replace(new RegExp(pattern, flags), replacePattern);
      const elapsedMs = performance.now() - start;

      return { ok: true as const, matches, replaced, elapsedMs };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : 'Invalid regular expression',
      };
    }
  }, [pattern, flags, testText, replacePattern]);

  const highlightedNodes = useMemo(() => {
    if (!result.ok || result.matches.length === 0) return testText;
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    result.matches.forEach((m, i) => {
      if (m.index > cursor) {
        nodes.push(<span key={`t-${i}`}>{testText.slice(cursor, m.index)}</span>);
      }
      if (m.value.length > 0) {
        nodes.push(
          <mark
            key={`m-${i}`}
            title={`Match #${i + 1} [${m.index}..${m.end}]`}
            className={`rounded px-0.5 font-semibold ${
              i % 2 === 0
                ? 'bg-indigo-500/25 text-indigo-950 dark:bg-indigo-500/35 dark:text-indigo-100 ring-1 ring-indigo-500/40'
                : 'bg-cyan-500/25 text-cyan-950 dark:bg-cyan-500/35 dark:text-cyan-100 ring-1 ring-cyan-500/40'
            }`}
          >
            {m.value}
          </mark>
        );
      }
      cursor = Math.max(cursor, m.end);
    });
    if (cursor < testText.length) {
      nodes.push(<span key="tail">{testText.slice(cursor)}</span>);
    }
    return nodes;
  }, [result, testText]);

  const copyRegexLiteral = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Presets + Cheat bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> US Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
                setTestText(p.sampleText);
                setReplacePattern(p.replacement);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={copyRegexLiteral}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied /regex/!' : 'Copy Literal'}
        </button>
      </div>

      {/* Pattern Input Row */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="flex flex-1 items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 focus-within:border-indigo-500">
            <span className="font-mono text-base font-bold text-slate-400 mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              aria-label="Regular expression pattern"
              placeholder="Enter regex pattern..."
              className="w-full bg-transparent font-mono text-sm text-slate-900 dark:text-white focus:outline-none"
            />
            <span className="font-mono text-base font-bold text-slate-400 ml-1">/{flags}</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { f: 'g', title: 'Global (find all matches)' },
              { f: 'i', title: 'Case-insensitive' },
              { f: 'm', title: 'Multiline (^ and $ per line)' },
              { f: 's', title: 'DotAll (. matches newline)' },
              { f: 'u', title: 'Unicode mode' },
            ].map(({ f, title }) => {
              const active = flags.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  title={title}
                  onClick={() => toggleFlag(f)}
                  className={`h-9 w-9 rounded-lg border font-mono text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Insert Cheat Tokens */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">Insert token:</span>
          {CHEAT_TOKENS.map((item) => (
            <button
              key={item.token}
              type="button"
              title={item.title}
              onClick={() => setPattern((p) => p + item.token)}
              className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
            >
              {item.token}
            </button>
          ))}
        </div>

        {!result.ok && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {result.error}
          </div>
        )}
      </div>

      {/* Main Split: Test String + Highlighter vs Matches / Replace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left: Test Input & Highlighted Preview */}
        <div className="lg:col-span-7 p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Test String</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {result.ok ? `${result.matches.length} matches · ${result.elapsedMs.toFixed(2)} ms` : 'Pattern error'}
              </span>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#090e1b] p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Live Match Highlighting
            </div>
            <div className="min-h-[140px] whitespace-pre-wrap break-words rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#090e1b] p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              {highlightedNodes}
            </div>
          </div>
        </div>

        {/* Right: Match Inspector & Find/Replace */}
        <div className="lg:col-span-5 flex flex-col bg-slate-50/40 dark:bg-[#090e1b]/60">
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setTab('matches')}
              className={`inline-flex items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-xs font-semibold cursor-pointer ${
                tab === 'matches'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <SearchCheck className="h-3.5 w-3.5" />
              Matches ({result.ok ? result.matches.length : 0})
            </button>
            <button
              type="button"
              onClick={() => setTab('replace')}
              className={`inline-flex items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-xs font-semibold cursor-pointer ${
                tab === 'replace'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Replace className="h-3.5 w-3.5" />
              Find &amp; Replace
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[380px]">
            {tab === 'matches' ? (
              !result.ok || result.matches.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No matches found in the test string.</p>
              ) : (
                <div className="space-y-2.5">
                  {result.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Match #{idx + 1}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          index {m.index}–{m.end}
                        </span>
                      </div>
                      <div className="rounded bg-slate-50 dark:bg-slate-900 px-2 py-1 font-mono text-slate-800 dark:text-slate-100 break-all">
                        {m.value || '(empty match)'}
                      </div>
                      {m.groups.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {m.groups.map((g, gIdx) => (
                            <div key={gIdx} className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-600 dark:text-cyan-300">
                                ${gIdx + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 break-all">
                                {g ?? <em className="text-slate-400">undefined</em>}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.namedGroups && Object.keys(m.namedGroups).length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {Object.entries(m.namedGroups).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-300">
                                {k}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300">{v ?? 'undefined'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Replacement Template ($1, $2, $&)
                  </label>
                  <input
                    type="text"
                    value={replacePattern}
                    onChange={(e) => setReplacePattern(e.target.value)}
                    spellCheck={false}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1322] px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Result Preview
                  </label>
                  <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-3 font-mono text-xs text-emerald-700 dark:text-emerald-300">
                    {result.ok ? result.replaced : 'Fix regex pattern to preview replacement.'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
