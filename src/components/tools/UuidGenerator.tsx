import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, Fingerprint, RefreshCw, Search } from 'lucide-react';
import { downloadTextFile } from './studioUtils';

const INITIAL_SAMPLE_V7 = [
  '019a8c4e-2b10-7a3f-9d12-4c8e1a9f0001',
  '019a8c4e-2b11-7b82-8e44-7f2a3c1d0002',
  '019a8c4e-2b12-7c19-a011-9b3e5d7f0003',
  '019a8c4e-2b13-7d45-b290-1c4f6e8a0004',
  '019a8c4e-2b14-7e71-8c33-3d5a7f9b0005',
  '019a8c4e-2b15-7f02-9a55-5e6b8c0d0006',
  '019a8c4e-2b16-7a88-b177-7f7c9d1e0007',
  '019a8c4e-2b17-7b34-8d99-9a8d0e2f0008',
  '019a8c4e-2b18-7c60-a311-1b9e1f3a0009',
  '019a8c4e-2b19-7d95-9f22-3c0f2a4b0010',
];

type IdKind = 'v7' | 'v4' | 'ulid' | 'nil';
type ExportFormat = 'lines' | 'json' | 'csv' | 'sql';

function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// RFC 9562 UUIDv7 (48-bit Unix ms timestamp + 4-bit version 7 + 12-bit rand + 2-bit variant + 62-bit rand)
function generateUuidV7(offsetMs = 0): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const now = BigInt(Date.now() + offsetMs);
  bytes[0] = Number((now >> 40n) & 0xffn);
  bytes[1] = Number((now >> 32n) & 0xffn);
  bytes[2] = Number((now >> 24n) & 0xffn);
  bytes[3] = Number((now >> 16n) & 0xffn);
  bytes[4] = Number((now >> 8n) & 0xffn);
  bytes[5] = Number(now & 0xffn);
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122/9562
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function generateUlid(offsetMs = 0): string {
  let time = Date.now() + offsetMs;
  let timeChars = '';
  for (let i = 9; i >= 0; i--) {
    timeChars = CROCKFORD[time % 32] + timeChars;
    time = Math.floor(time / 32);
  }
  const randBytes = new Uint8Array(16);
  crypto.getRandomValues(randBytes);
  let randChars = '';
  for (let i = 0; i < 16; i++) {
    randChars += CROCKFORD[randBytes[i] % 32];
  }
  return timeChars + randChars;
}

function inspectUuid(raw: string) {
  const clean = raw.trim().replace(/^urn:uuid:/i, '').replace(/[{}]/g, '');
  const normalized = clean.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(normalized)) {
    return { valid: false as const, message: 'Enter a valid 128-bit UUID (32 hex chars, with or without hyphens).' };
  }
  const formatted = `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`;
  const versionNibble = parseInt(normalized[12], 16);
  const variantBits = parseInt(normalized[16], 16);
  const variant =
    (variantBits & 0x8) === 0
      ? 'NCS (Reserved)'
      : (variantBits & 0xc) === 0x8
        ? 'RFC 4122 / RFC 9562'
        : (variantBits & 0xe) === 0xc
          ? 'Microsoft GUID'
          : 'Future Reserved';

  let timestampIso: string | null = null;
  if (normalized === '0'.repeat(32)) {
    return { valid: true as const, formatted, version: 'Nil UUID (0)', variant, timestampIso: null };
  }
  if (versionNibble === 7) {
    const msHex = normalized.slice(0, 12);
    const ms = Number(BigInt('0x' + msHex));
    timestampIso = new Date(ms).toISOString();
  }
  return {
    valid: true as const,
    formatted,
    version: `Version ${versionNibble}`,
    variant,
    timestampIso,
  };
}

export default function UuidGenerator() {
  const [tab, setTab] = useState<'generate' | 'inspect'>('generate');
  const [kind, setKind] = useState<IdKind>('v7');
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [urn, setUrn] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('lines');
  const [mounted, setMounted] = useState(false);
  const [seedTick, setSeedTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const [inspectInput, setInspectInput] = useState(INITIAL_SAMPLE_V7[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ids = useMemo(() => {
    void seedTick;
    const safeCount = Math.min(Math.max(1, count), 500);
    if (!mounted && kind === 'v7' && safeCount <= INITIAL_SAMPLE_V7.length && !uppercase && hyphens && !braces && !urn) {
      return INITIAL_SAMPLE_V7.slice(0, safeCount);
    }
    const arr: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      let id =
        kind === 'v7'
          ? generateUuidV7(i)
          : kind === 'v4'
            ? generateUuidV4()
            : kind === 'ulid'
              ? generateUlid(i)
              : '00000000-0000-0000-0000-000000000000';

      if (kind !== 'ulid') {
        if (!hyphens) id = id.replace(/-/g, '');
        if (uppercase) id = id.toUpperCase();
        if (braces) id = `{${id}}`;
        if (urn && !braces) id = `urn:uuid:${id}`;
      } else if (!uppercase) {
        // ULIDs are canonically uppercase Crockford, allow lowercase if desired
        id = uppercase ? id.toUpperCase() : id;
      }
      arr.push(id);
    }
    return arr;
  }, [kind, count, uppercase, hyphens, braces, urn, seedTick]);

  const formattedOutput = useMemo(() => {
    if (exportFormat === 'json') return JSON.stringify(ids, null, 2);
    if (exportFormat === 'csv') return ['id', ...ids].join('\n');
    if (exportFormat === 'sql') {
      return `INSERT INTO items (id)\nVALUES\n${ids.map((id) => `  ('${id}')`).join(',\n')};`;
    }
    return ids.join('\n');
  }, [ids, exportFormat]);

  const inspection = useMemo(() => inspectUuid(inspectInput), [inspectInput]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => setTab('generate')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              tab === 'generate' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Fingerprint className="h-3.5 w-3.5" /> Bulk Generator
          </button>
          <button
            type="button"
            onClick={() => setTab('inspect')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              tab === 'inspect' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Search className="h-3.5 w-3.5" /> UUID Inspector
          </button>
        </div>

        {tab === 'generate' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeedTick((t) => t + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
          </div>
        )}
      </div>

      {tab === 'generate' ? (
        <div className="p-5 space-y-5">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Identifier Version</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'v7', label: 'UUID v7' },
                    { id: 'v4', label: 'UUID v4' },
                    { id: 'ulid', label: 'ULID' },
                    { id: 'nil', label: 'Nil' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setKind(item.id)}
                    className={`rounded-lg border py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      kind === item.id
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Quantity (1–500)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Math.min(500, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Export Format</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['lines', 'json', 'csv', 'sql'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`rounded-lg border py-2 font-mono text-xs uppercase font-semibold cursor-pointer ${
                      exportFormat === fmt
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {kind !== 'ulid' && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="accent-indigo-600" />
                Hyphens
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-indigo-600" />
                UPPERCASE
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={braces} onChange={(e) => setBraces(e.target.checked)} className="accent-indigo-600" />
                Braces &#123;...&#125;
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={urn} onChange={(e) => setUrn(e.target.checked)} className="accent-indigo-600" />
                urn:uuid: prefix
              </label>
            </div>
          )}

          {/* Output box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-2 text-xs">
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {ids.length} {kind.toUpperCase()} identifier{ids.length > 1 ? 's' : ''} · CSPRNG
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile(`taprico-ids.${exportFormat === 'lines' ? 'txt' : exportFormat}`, formattedOutput)}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  <Download className="h-3 w-3" /> Export
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={11}
              value={formattedOutput}
              className="w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-300 focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Paste UUID to Decode Version &amp; Timestamp
              </label>
              <button
                type="button"
                onClick={() => setInspectInput(generateUuidV7())}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Load Fresh UUID v7
              </button>
            </div>
            <input
              type="text"
              value={inspectInput}
              onChange={(e) => setInspectInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-4 py-3 font-mono text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {inspection.valid ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Canonical Format', value: inspection.formatted },
                { label: 'RFC Version', value: inspection.version },
                { label: 'Variant Layout', value: inspection.variant },
                {
                  label: 'Embedded Timestamp',
                  value: inspection.timestampIso
                    ? `${inspection.timestampIso} (${new Date(inspection.timestampIso).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET)`
                    : 'None (random / non-time-based)',
                },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </div>
                  <div className="mt-1 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 break-all">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
              {inspection.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
