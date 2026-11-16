import { useMemo, useState } from 'react';
import { diffLines, diffWords, type Change } from 'diff';
import { ArrowLeftRight, Columns2, ListTree, Sparkles } from 'lucide-react';

const DIFF_SAMPLES = {
  env: {
    label: '.env Staging vs Prod',
    left: `NODE_ENV=staging
PORT=8080
DATABASE_URL=postgres://dev:pass@db.staging.internal:5432/app
STRIPE_WEBHOOK_TOLERANCE=300
RATE_LIMIT_RPM=120
ENABLE_DEBUG_LOGS=true
CORS_ORIGIN=https://staging.taprico.com`,
    right: `NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://prod_user:vault_ref@db.us-east.internal:5432/app
STRIPE_WEBHOOK_TOLERANCE=180
RATE_LIMIT_RPM=2400
REDIS_CLUSTER_MODE=enabled
CORS_ORIGIN=https://taprico.com`,
  },
  json: {
    label: 'API Response Diff',
    left: `{
  "plan": "starter",
  "priceMonthly": 29,
  "seats": 3,
  "features": ["json", "jwt", "cron"]
}`,
    right: `{
  "plan": "growth",
  "priceMonthly": 49,
  "seats": 10,
  "features": ["json", "jwt", "cron", "sql", "invoices"],
  "prioritySupport": true
}`,
  },
};

interface SplitRow {
  leftNum: number | null;
  rightNum: number | null;
  leftText: string;
  rightText: string;
  type: 'same' | 'removed' | 'added' | 'modified';
  wordChanges?: Change[];
}

export default function DiffChecker() {
  const [left, setLeft] = useState(DIFF_SAMPLES.env.left);
  const [right, setRight] = useState(DIFF_SAMPLES.env.right);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diffData = useMemo(() => {
    const normalize = (s: string) => {
      let out = s;
      if (ignoreWhitespace) {
        out = out
          .split('\n')
          .map((line) => line.trim().replace(/\s+/g, ' '))
          .join('\n');
      }
      if (ignoreCase) {
        out = out.toLowerCase();
      }
      return out;
    };

    const a = normalize(left);
    const b = normalize(right);
    const changes = diffLines(a, b);

    const rows: SplitRow[] = [];
    const unifiedLines: { numLeft: number | null; numRight: number | null; kind: 'same' | 'add' | 'del'; text: string }[] = [];

    let leftLine = 1;
    let rightLine = 1;
    let addedCount = 0;
    let removedCount = 0;
    let sameCount = 0;

    for (let i = 0; i < changes.length; i++) {
      const part = changes[i];
      const lines = part.value.replace(/\n$/, '').split('\n');
      if (part.value === '') continue;

      const next = changes[i + 1];
      if (part.removed && next && next.added) {
        const remLines = part.value.replace(/\n$/, '').split('\n');
        const addLines = next.value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(remLines.length, addLines.length);

        for (let j = 0; j < maxLen; j++) {
          const lText = remLines[j];
          const rText = addLines[j];
          if (lText !== undefined && rText !== undefined) {
            removedCount++;
            addedCount++;
            rows.push({
              leftNum: leftLine++,
              rightNum: rightLine++,
              leftText: lText,
              rightText: rText,
              type: 'modified',
              wordChanges: diffWords(lText, rText),
            });
          } else if (lText !== undefined) {
            removedCount++;
            rows.push({
              leftNum: leftLine++,
              rightNum: null,
              leftText: lText,
              rightText: '',
              type: 'removed',
            });
          } else if (rText !== undefined) {
            addedCount++;
            rows.push({
              leftNum: null,
              rightNum: rightLine++,
              leftText: '',
              rightText: rText,
              type: 'added',
            });
          }
        }

        // Also build unified lines cleanly
        let uLeft = leftLine - remLines.length;
        let uRight = rightLine - addLines.length;
        remLines.forEach((txt) => unifiedLines.push({ numLeft: uLeft++, numRight: null, kind: 'del', text: txt }));
        addLines.forEach((txt) => unifiedLines.push({ numLeft: null, numRight: uRight++, kind: 'add', text: txt }));

        i++; // skip consumed next
      } else if (part.removed) {
        for (const l of lines) {
          removedCount++;
          rows.push({ leftNum: leftLine, rightNum: null, leftText: l, rightText: '', type: 'removed' });
          unifiedLines.push({ numLeft: leftLine, numRight: null, kind: 'del', text: l });
          leftLine++;
        }
      } else if (part.added) {
        for (const l of lines) {
          addedCount++;
          rows.push({ leftNum: null, rightNum: rightLine, leftText: '', rightText: l, type: 'added' });
          unifiedLines.push({ numLeft: null, numRight: rightLine, kind: 'add', text: l });
          rightLine++;
        }
      } else {
        for (const l of lines) {
          sameCount++;
          rows.push({ leftNum: leftLine, rightNum: rightLine, leftText: l, rightText: l, type: 'same' });
          unifiedLines.push({ numLeft: leftLine, numRight: rightLine, kind: 'same', text: l });
          leftLine++;
          rightLine++;
        }
      }
    }

    const total = sameCount + Math.max(addedCount, removedCount);
    const similarity = total === 0 ? 100 : Math.round((sameCount / total) * 100);

    return { rows, unifiedLines, addedCount, removedCount, sameCount, similarity };
  }, [left, right, ignoreWhitespace, ignoreCase]);

  const swapSides = () => {
    setLeft(right);
    setRight(left);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" /> Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'unified' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <ListTree className="h-3.5 w-3.5" /> Unified View
              </button>
            </div>

            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="accent-indigo-600"
              />
              Ignore whitespace
            </label>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="accent-indigo-600"
              />
              Ignore case
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            </span>
            {Object.entries(DIFF_SAMPLES).map(([k, s]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setLeft(s.left);
                  setRight(s.right);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={swapSides}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 cursor-pointer"
            >
              <ArrowLeftRight className="h-3 w-3" /> Swap
            </button>
          </div>
        </div>

        {/* Editable Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              Original (Left)
            </div>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full resize-y bg-transparent p-3.5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Modified (Right)
            </div>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full resize-y bg-transparent p-3.5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/60 px-4 py-2.5 text-xs border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 tabular-nums font-mono">
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              +{diffData.addedCount} added
            </span>
            <span className="rounded-md bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-600 dark:text-rose-400">
              -{diffData.removedCount} removed
            </span>
            <span className="text-slate-500 dark:text-slate-400">{diffData.sameCount} unchanged</span>
          </div>
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            {diffData.similarity}% similarity
          </span>
        </div>

        {/* Rendered Diff */}
        <div className="max-h-[460px] overflow-auto bg-slate-50/40 dark:bg-[#080d19] font-mono text-xs">
          {viewMode === 'split' ? (
            <div className="min-w-[680px] divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {diffData.rows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
                  {/* Left cell */}
                  <div
                    className={`flex items-start px-2 py-1 ${
                      row.type === 'removed' || row.type === 'modified'
                        ? 'bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-9 shrink-0 select-none text-right pr-2 text-slate-400 tabular-nums">
                      {row.leftNum ?? ''}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {row.type === 'modified' && row.wordChanges
                        ? row.wordChanges
                            .filter((w) => !w.added)
                            .map((w, wi) => (
                              <span
                                key={wi}
                                className={w.removed ? 'rounded bg-rose-500/30 px-0.5 font-bold underline decoration-rose-400' : ''}
                              >
                                {w.value}
                              </span>
                            ))
                        : row.leftText}
                    </span>
                  </div>

                  {/* Right cell */}
                  <div
                    className={`flex items-start px-2 py-1 ${
                      row.type === 'added' || row.type === 'modified'
                        ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-9 shrink-0 select-none text-right pr-2 text-slate-400 tabular-nums">
                      {row.rightNum ?? ''}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {row.type === 'modified' && row.wordChanges
                        ? row.wordChanges
                            .filter((w) => !w.removed)
                            .map((w, wi) => (
                              <span
                                key={wi}
                                className={w.added ? 'rounded bg-emerald-500/30 px-0.5 font-bold underline decoration-emerald-400' : ''}
                              >
                                {w.value}
                              </span>
                            ))
                        : row.rightText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
              {diffData.unifiedLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-3 py-1 ${
                    line.kind === 'add'
                      ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                      : line.kind === 'del'
                        ? 'bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-8 shrink-0 select-none text-slate-400 tabular-nums">{line.numLeft ?? ''}</span>
                  <span className="w-8 shrink-0 select-none text-slate-400 tabular-nums">{line.numRight ?? ''}</span>
                  <span className="w-5 shrink-0 select-none font-bold">
                    {line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
