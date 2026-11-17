import { useEffect, useMemo, useState } from 'react';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';
import { AlertTriangle, Calendar, Check, Clock, Copy, Globe2, Sparkles } from 'lucide-react';

const PRESETS = [
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Every 15 min (Work Hours)', expr: '*/15 9-17 * * 1-5' },
  { label: 'Daily 9:00 AM', expr: '0 9 * * *' },
  { label: 'Daily Midnight', expr: '0 0 * * *' },
  { label: 'Weekdays 8:30 AM', expr: '30 8 * * 1-5' },
  { label: 'Sunday 2:00 AM Backup', expr: '0 2 * * 0' },
  { label: 'Monthly 1st Billing', expr: '0 6 1 * *' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'US Eastern (America/New_York)' },
  { value: 'America/Chicago', label: 'US Central (America/Chicago)' },
  { value: 'America/Denver', label: 'US Mountain (America/Denver)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (America/Los_Angeles)' },
  { value: 'UTC', label: 'UTC (GitHub Actions / K8s Default)' },
  { value: 'Europe/London', label: 'London (Europe/London)' },
];

const FIELD_META = [
  { idx: 0, name: 'Minute', range: '0–59', examples: ['*', '*/5', '*/15', '0', '30'] },
  { idx: 1, name: 'Hour', range: '0–23', examples: ['*', '0', '9', '9-17', '*/2'] },
  { idx: 2, name: 'Day (Month)', range: '1–31', examples: ['*', '1', '15', '1,15', '1-7'] },
  { idx: 3, name: 'Month', range: '1–12', examples: ['*', '1', '1,7', '1-6', '*/3'] },
  { idx: 4, name: 'Weekday', range: '0–6 (Sun=0)', examples: ['*', '1-5', '0', '6,0', '1,3,5'] },
];

interface Props {
  initialExpr?: string;
}

export default function CronGenerator({ initialExpr = '*/15 9-17 * * 1-5' }: Props) {
  const [expression, setExpression] = useState(initialExpr);
  const [timezone, setTimezone] = useState('America/New_York');
  const [activeFieldIdx, setActiveFieldIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fields = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    return [0, 1, 2, 3, 4].map((i) => parts[i] || '*');
  }, [expression]);

  const updateField = (idx: number, val: string) => {
    const next = [...fields];
    next[idx] = val.trim() || '*';
    setExpression(next.join(' '));
  };

  const analysis = useMemo(() => {
    const clean = expression.trim();
    const parts = clean.split(/\s+/);
    if (parts.length !== 5) {
      return {
        ok: false as const,
        error: `Standard crontab expressions require exactly 5 space-separated fields (currently ${parts.length}).`,
      };
    }

    try {
      const human = cronstrue.toString(clean, { use24HourTimeFormat: false, verbose: true });
      const parsed = CronExpressionParser.parse(clean, {
        tz: timezone,
        currentDate: mounted ? new Date() : new Date('2026-11-17T14:00:00Z'),
      });
      const nextRuns: string[] = [];
      for (let i = 0; i < 10; i++) {
        const dt = parsed.next().toDate();
        nextRuns.push(
          dt.toLocaleString('en-US', {
            timeZone: timezone,
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          })
        );
      }
      return { ok: true as const, human, nextRuns };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : 'Invalid cron expression.',
      };
    }
  }, [expression, timezone, mounted]);

  const copyExpr = async () => {
    await navigator.clipboard.writeText(expression.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Presets Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => setExpression(p.expr)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                expression.trim() === p.expr
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-cyan-500" />
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            aria-label="Target timezone"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="dark:bg-slate-900">
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Expression Bar + Human Translation */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              spellCheck={false}
              aria-label="Cron expression"
              className="w-full rounded-xl border-2 border-indigo-500/40 dark:border-indigo-500/40 bg-slate-50 dark:bg-[#090e1b] px-4 py-3.5 text-center font-mono text-2xl sm:text-3xl font-bold tracking-widest text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={copyExpr}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied Cron!' : 'Copy Cron'}
          </button>
        </div>

        {/* Translation Banner */}
        {analysis.ok ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 flex items-start gap-3">
            <Clock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Human-Readable Schedule
              </div>
              <p className="mt-0.5 text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                "{analysis.human}"
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 flex items-start gap-3 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{analysis.error}</div>
          </div>
        )}

        {/* Interactive 5-Field Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {FIELD_META.map((field) => {
            const isSelected = activeFieldIdx === field.idx;
            return (
              <div
                key={field.name}
                onClick={() => setActiveFieldIdx(field.idx)}
                className={`rounded-xl border p-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>{field.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{field.range}</span>
                </div>
                <input
                  type="text"
                  value={fields[field.idx]}
                  onChange={(e) => updateField(field.idx, e.target.value)}
                  onFocus={() => setActiveFieldIdx(field.idx)}
                  aria-label={field.name}
                  className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090e1b] px-2.5 py-1.5 text-center font-mono text-sm font-bold text-indigo-600 dark:text-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                  {field.examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField(field.idx, ex);
                      }}
                      className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Next 10 Execution Runs + Operator Cheat Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="lg:col-span-7 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <Calendar className="h-4 w-4 text-cyan-500" />
              Next 10 Scheduled Executions
            </h2>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{timezone}</span>
          </div>
          {analysis.ok ? (
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.nextRuns.map((run, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#090e1b] px-3 py-2 text-xs"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-200 tabular-nums">{run}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-400">Fix the cron syntax above to preview upcoming run timestamps.</p>
          )}
        </div>

        <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-[#090e1b]/50 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Cron Operator Reference
          </h2>
          <div className="space-y-2 text-xs">
            {[
              { op: '*', desc: 'Any / every value in this field' },
              { op: ',', desc: 'Value list separator (e.g., 1,15 runs on 1st & 15th)' },
              { op: '-', desc: 'Inclusive range (e.g., 9-17 means 9 AM through 5 PM)' },
              { op: '/', desc: 'Step increment (e.g., */10 runs every 10 units)' },
              { op: '1-5', desc: 'Monday through Friday in Weekday field' },
            ].map((row) => (
              <div key={row.op} className="flex items-center gap-3">
                <code className="w-12 shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 text-center font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {row.op}
                </code>
                <span className="text-slate-600 dark:text-slate-400">{row.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
