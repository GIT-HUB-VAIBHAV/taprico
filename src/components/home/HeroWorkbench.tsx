import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { ArrowRight, Braces, Calculator, ShieldCheck } from 'lucide-react';
import { formatUsd } from '../tools/studioUtils';

type Tab = 'json' | 'jwt' | 'rate';

const SAMPLE_JSON = `{"service":"taprico-edge","region":"us-east-1","tier":"enterprise","zeroServerUploads":true}`;

export default function HeroWorkbench() {
  const [tab, setTab] = useState<Tab>('json');
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [targetNet, setTargetNet] = useState(125000);
  const [billableHrs, setBillableHrs] = useState(28);

  const yamlPreview = useMemo(() => {
    try {
      return yaml.dump(JSON.parse(jsonInput), { indent: 2 });
    } catch {
      return '# Fix JSON syntax to live-convert to YAML';
    }
  }, [jsonInput]);

  const estimatedRate = useMemo(() => {
    const annualBillable = billableHrs * 48;
    const grossNeeded = targetNet / 0.7 + 5400;
    return (grossNeeded / Math.max(1, annualBillable)) * 1.15;
  }, [targetNet, billableHrs]);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-[#0d1424]/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl overflow-hidden">
      {/* Window Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">taprico.com/studio</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setTab('json')}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold cursor-pointer transition-colors ${
              tab === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Braces className="h-3 w-3" /> JSON→YAML
          </button>
          <button
            type="button"
            onClick={() => setTab('jwt')}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold cursor-pointer transition-colors ${
              tab === 'jwt' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <ShieldCheck className="h-3 w-3" /> JWT Audit
          </button>
          <button
            type="button"
            onClick={() => setTab('rate')}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold cursor-pointer transition-colors ${
              tab === 'rate' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Calculator className="h-3 w-3" /> US Rate
          </button>
        </div>
      </div>

      {/* Interactive Tab Body */}
      <div className="p-4 sm:p-5 min-h-[265px] flex flex-col justify-between gap-4">
        {tab === 'json' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Live JSON Input</div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  aria-label="Live JSON input"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-emerald-500">Real-Time YAML</div>
                <pre className="h-[138px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-2.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">
                  {yamlPreview}
                </pre>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Zero server upload · Instant tree &amp; diff</span>
              <a
                href="/tools/json-yaml-formatter/"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open Full Formatter <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}

        {tab === 'jwt' && (
          <>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-3 font-mono text-[11px] break-all">
                <span className="text-rose-500">eyJhbGciOiJIUzI1NiJ9</span>.
                <span className="text-indigo-400">eyJzdWIiOiJ1c3JfOTEwIiwiYXVkIjoiYWNtZS11cyIsImV4cCI6MTg5NDg5NjAwMH0</span>.
                <span className="text-cyan-400">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-3">
                  <div className="text-[10px] font-bold uppercase text-rose-500 mb-1">Header</div>
                  <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-200">{`{\n  "alg": "HS256",\n  "typ": "JWT"\n}`}</pre>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-3">
                  <div className="text-[10px] font-bold uppercase text-indigo-500 mb-1">Payload</div>
                  <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-200">{`{\n  "sub": "usr_910",\n  "aud": "acme-us"\n}`}</pre>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Web Crypto HMAC verification built in</span>
              <a
                href="/tools/jwt-decoder/"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open JWT Inspector <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}

        {tab === 'rate' && (
          <>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-3">
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Target Net Pay ($)</label>
                  <input
                    type="number"
                    step={5000}
                    value={targetNet}
                    onChange={(e) => setTargetNet(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-transparent font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] p-3">
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Billable Hrs / Wk</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={billableHrs}
                    onChange={(e) => setBillableHrs(Math.max(1, Number(e.target.value) || 25))}
                    className="w-full bg-transparent font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Recommended US Consulting Rate
                  </div>
                  <div className="font-mono text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {formatUsd(estimatedRate, 0)}/hr
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Day Rate: <strong className="font-mono">{formatUsd(estimatedRate * 8, 0)}</strong></div>
                  <div>Includes 15.3% SE tax reserve</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Built for US 1099 &amp; LLC freelancers</span>
              <a
                href="/tools/freelance-rate-calculator/"
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Open Full Rate Engine <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
