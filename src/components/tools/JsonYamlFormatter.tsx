import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCode2,
  Minimize2,
  Sparkles,
  Trash2,
  TreeDeciduous,
} from 'lucide-react';
import { downloadTextFile, formatBytes } from './studioUtils';

type Mode = 'format-json' | 'minify-json' | 'json-to-yaml' | 'yaml-to-json' | 'tree';

const SAMPLES: Record<string, { label: string; content: string; defaultMode: Mode }> = {
  stripe: {
    label: 'Stripe Webhook',
    defaultMode: 'format-json',
    content: `{"id":"evt_3Q9xTaprico001","object":"event","api_version":"2025-11-15","created":1763356800,"type":"invoice.payment_succeeded","data":{"object":{"id":"in_1Q9x001","customer":"cus_US_Acme99","amount_paid":480000,"currency":"usd","status":"paid","metadata":{"project":"API Architecture Sprint","terms":"Net 15"}}}}`,
  },
  k8s: {
    label: 'Kubernetes YAML',
    defaultMode: 'yaml-to-json',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: taprico-api-gateway
  namespace: production-us-east
  labels:
    app: gateway
    tier: edge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    spec:
      containers:
        - name: gateway
          image: ghcr.io/taprico/gateway:2.4.1
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
            - name: RATE_LIMIT_RPM
              value: "1200"`,
  },
  pkg: {
    label: 'package.json',
    defaultMode: 'json-to-yaml',
    content: `{
  "name": "acme-billing-service",
  "version": "1.8.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc --noEmit && esbuild src/server.ts --bundle --outdir=dist",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.24.0",
    "postgres": "^3.4.5"
  }
}`,
  },
};

function sortObjectDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectDeep(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

function countKeysAndDepth(value: unknown, depth = 0): { keys: number; maxDepth: number } {
  if (Array.isArray(value)) {
    let keys = 0;
    let maxDepth = depth;
    for (const item of value) {
      const sub = countKeysAndDepth(item, depth + 1);
      keys += sub.keys;
      maxDepth = Math.max(maxDepth, sub.maxDepth);
    }
    return { keys, maxDepth };
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    let keys = entries.length;
    let maxDepth = depth;
    for (const [, v] of entries) {
      const sub = countKeysAndDepth(v, depth + 1);
      keys += sub.keys;
      maxDepth = Math.max(maxDepth, sub.maxDepth);
    }
    return { keys, maxDepth };
  }
  return { keys: 0, maxDepth: depth };
}

function extractJsonErrorLocation(input: string, errMessage: string): string {
  const posMatch = errMessage.match(/position\s+(\d+)/i);
  if (!posMatch) return errMessage;
  const pos = Number(posMatch[1]);
  const snippet = input.slice(0, pos);
  const lines = snippet.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return `Line ${line}, Column ${col}: ${errMessage}`;
}

interface TreeNodeProps {
  name: string;
  value: unknown;
  path: string;
  onCopyPath: (path: string) => void;
  depth?: number;
}

function JsonTreeNode({ name, value, path, onCopyPath, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object' && !isArray;
  const isBranch = isArray || isObject;

  if (!isBranch) {
    let valColor = 'text-emerald-600 dark:text-emerald-400';
    let formattedVal = JSON.stringify(value);
    if (typeof value === 'number') valColor = 'text-amber-600 dark:text-amber-400';
    else if (typeof value === 'boolean') valColor = 'text-sky-600 dark:text-sky-400';
    else if (value === null) {
      valColor = 'text-rose-500 dark:text-rose-400';
      formattedVal = 'null';
    }

    return (
      <div className="group flex items-center justify-between gap-2 rounded px-2 py-0.5 font-mono text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-indigo-600 dark:text-indigo-300 shrink-0">"{name}":</span>
          <span className={`${valColor} break-all`}>{formattedVal}</span>
        </div>
        <button
          type="button"
          onClick={() => onCopyPath(path)}
          className="opacity-0 group-hover:opacity-100 shrink-0 rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-200 transition-opacity cursor-pointer"
          title={`Copy path: ${path}`}
        >
          Copy path
        </button>
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, idx) => [String(idx), v] as const)
    : Object.entries(value as Record<string, unknown>);

  return (
    <div className="font-mono text-xs">
      <div className="group flex items-center justify-between gap-2 rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/60">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-left cursor-pointer"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="text-indigo-600 dark:text-indigo-300 font-medium">{name}</span>
          <span className="text-slate-400">
            {isArray ? `[${entries.length}]` : `{${entries.length}}`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onCopyPath(path)}
          className="opacity-0 group-hover:opacity-100 rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-200 transition-opacity cursor-pointer"
        >
          {path}
        </button>
      </div>
      {expanded && (
        <div className="ml-3.5 border-l border-slate-200 dark:border-slate-800 pl-2.5 space-y-0.5">
          {entries.map(([k, v]) => {
            const childPath = isArray ? `${path}[${k}]` : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? `${path}.${k}` : `${path}["${k}"]`;
            return (
              <JsonTreeNode
                key={k}
                name={k}
                value={v}
                path={childPath}
                onCopyPath={onCopyPath}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JsonYamlFormatter() {
  const [input, setInput] = useState(SAMPLES.stripe.content);
  const [mode, setMode] = useState<Mode>('format-json');
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        ok: true,
        output: '',
        parsed: null as unknown,
        error: null as string | null,
        keys: 0,
        maxDepth: 0,
        detectedInput: 'empty',
      };
    }

    let parsed: unknown;
    let detectedInput = 'JSON';

    try {
      if (mode === 'yaml-to-json') {
        detectedInput = 'YAML';
        parsed = yaml.load(trimmed);
      } else {
        try {
          parsed = JSON.parse(trimmed);
          detectedInput = 'JSON';
        } catch (jsonErr) {
          if (mode === 'json-to-yaml' || mode === 'tree') {
            try {
              parsed = yaml.load(trimmed);
              detectedInput = 'YAML';
            } catch {
              throw jsonErr;
            }
          } else {
            throw jsonErr;
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to parse input.';
      const friendly = detectedInput === 'JSON' ? extractJsonErrorLocation(trimmed, msg) : msg;
      return {
        ok: false,
        output: '',
        parsed: null,
        error: friendly,
        keys: 0,
        maxDepth: 0,
        detectedInput,
      };
    }

    const normalized = sortKeys ? sortObjectDeep(parsed) : parsed;
    const stats = countKeysAndDepth(normalized);
    const spaceArg = indent === 'tab' ? '\t' : Number(indent);

    let output = '';
    if (mode === 'minify-json') {
      output = JSON.stringify(normalized);
    } else if (mode === 'json-to-yaml') {
      output = yaml.dump(normalized, {
        indent: indent === 'tab' ? 2 : Number(indent),
        lineWidth: 120,
        noRefs: true,
        sortKeys,
      });
    } else {
      output = JSON.stringify(normalized, null, spaceArg);
    }

    return {
      ok: true,
      output,
      parsed: normalized,
      error: null,
      keys: stats.keys,
      maxDepth: stats.maxDepth,
      detectedInput,
    };
  }, [input, mode, indent, sortKeys]);

  const handleCopy = async (text: string, label = 'output') => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleSwap = () => {
    if (!result.ok || !result.output) return;
    setInput(result.output);
    if (mode === 'json-to-yaml') setMode('yaml-to-json');
    else if (mode === 'yaml-to-json') setMode('json-to-yaml');
  };

  const outExt = mode === 'json-to-yaml' ? 'yaml' : 'json';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Studio Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1">
          {(
            [
              { id: 'format-json', label: 'Format JSON', icon: Sparkles },
              { id: 'minify-json', label: 'Minify', icon: Minimize2 },
              { id: 'json-to-yaml', label: 'JSON → YAML', icon: ArrowLeftRight },
              { id: 'yaml-to-json', label: 'YAML → JSON', icon: FileCode2 },
              { id: 'tree', label: 'Tree View', icon: TreeDeciduous },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                mode === id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Options & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value as '2' | '4' | 'tab')}
              className="bg-transparent font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              aria-label="Indentation"
            >
              <option value="2" className="dark:bg-slate-900">2 spaces</option>
              <option value="4" className="dark:bg-slate-900">4 spaces</option>
              <option value="tab" className="dark:bg-slate-900">Tab</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            Sort keys
          </label>

          <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            {Object.entries(SAMPLES).map(([key, sample]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setInput(sample.content);
                  setMode(sample.defaultMode);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Input Pane */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Input Payload</span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {formatBytes(new Blob([input]).size)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSwap}
                disabled={!result.ok || !result.output}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                title="Replace input with formatted output"
              >
                <ArrowLeftRight className="h-3 w-3" /> Use Output
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste raw JSON or YAML here..."
            className="h-[420px] w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Output Pane */}
        <div className="flex flex-col bg-slate-50/40 dark:bg-[#090e1b]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {mode === 'tree' ? 'Interactive JSON Tree' : mode === 'json-to-yaml' ? 'YAML Output' : 'Formatted JSON'}
              </span>
              {result.ok && result.output && (
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {formatBytes(new Blob([result.output]).size)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(result.output, 'output')}
                disabled={!result.ok || !result.output}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 disabled:opacity-40 cursor-pointer"
              >
                {copied === 'output' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied === 'output' ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => downloadTextFile(`taprico-formatted.${outExt}`, result.output)}
                disabled={!result.ok || !result.output}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
              >
                <Download className="h-3 w-3" /> .{outExt}
              </button>
            </div>
          </div>

          {!result.ok ? (
            <div className="h-[420px] p-5 flex items-start">
              <div className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Syntax Validation Failed
                </div>
                <p className="mt-2 font-mono text-xs leading-relaxed break-words">{result.error}</p>
              </div>
            </div>
          ) : mode === 'tree' ? (
            <div className="h-[420px] overflow-auto p-4">
              {copied && copied !== 'output' && (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
                  <Check className="h-3 w-3" /> Copied path: {copied}
                </div>
              )}
              {result.parsed !== null && result.parsed !== undefined ? (
                <JsonTreeNode
                  name="root"
                  value={result.parsed}
                  path="$"
                  onCopyPath={(p) => handleCopy(p, p)}
                />
              ) : (
                <p className="text-xs text-slate-400">Paste valid JSON or YAML to explore its structure.</p>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={result.output}
              spellCheck={false}
              placeholder="Output will appear here..."
              className="h-[420px] w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-emerald-300/90 placeholder-slate-400 focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Live Metrics Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${result.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {result.ok ? `Valid ${result.detectedInput}` : 'Invalid Syntax'}
          </span>
          <span>Keys: <strong className="text-slate-900 dark:text-slate-200">{result.keys}</strong></span>
          <span>Max Depth: <strong className="text-slate-900 dark:text-slate-200">{result.maxDepth}</strong></span>
          <span>Lines: <strong className="text-slate-900 dark:text-slate-200">{result.output ? result.output.split('\n').length : 0}</strong></span>
        </div>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          Zero network calls · Parsed locally in browser
        </span>
      </div>
    </div>
  );
}
