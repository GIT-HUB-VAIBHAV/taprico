import { useMemo, useState } from 'react';
import { ArrowLeftRight, Check, Copy, FileImage, FileUp, Link2, Trash2 } from 'lucide-react';
import { formatBytes } from './studioUtils';

function encodeUtf8Base64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return b64;
}

function decodeUtf8Base64(b64: string): string {
  let normalized = b64.trim().replace(/\s+/g, '');
  if (normalized.startsWith('data:')) {
    const commaIdx = normalized.indexOf(',');
    if (commaIdx !== -1) normalized = normalized.slice(commaIdx + 1);
  }
  normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  normalized += '='.repeat(padLen);

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default function Base64Tool() {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState('{"service":"taprico-us-east","apiKey":"live_demo_99481","region":"us-east-1"}');
  const [copied, setCopied] = useState<string | null>(null);

  const [fileData, setFileData] = useState<{
    name: string;
    type: string;
    size: number;
    dataUri: string;
    rawBase64: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const textResult = useMemo(() => {
    if (!input) return { ok: true as const, output: '' };
    try {
      if (direction === 'encode') {
        return { ok: true as const, output: encodeUtf8Base64(input, urlSafe) };
      }
      return { ok: true as const, output: decodeUtf8Base64(input) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : 'Invalid Base64 or non-UTF8 binary input.',
      };
    }
  }, [input, direction, urlSafe]);

  const isImageDataUri =
    direction === 'decode' && /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(input.trim());

  const handleCopy = async (val: string, label: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError(null);
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File exceeds 10 MB browser memory safety limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = String(reader.result || '');
      const comma = dataUri.indexOf(',');
      const rawBase64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
      setFileData({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUri,
        rawBase64,
      });
    };
    reader.onerror = () => setFileError('Failed to read selected file.');
    reader.readAsDataURL(file);
  };

  const swapDirection = () => {
    if (textResult.ok && textResult.output) {
      setInput(textResult.output);
    }
    setDirection((d) => (d === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Top Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => setTab('text')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Text &amp; JWT Base64
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <FileImage className="h-3.5 w-3.5" />
            File / Image to Data URI
          </button>
        </div>

        {tab === 'text' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDirection('encode')}
                className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                  direction === 'encode' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => setDirection('decode')}
                className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                  direction === 'decode' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Decode
              </button>
            </div>

            {direction === 'encode' && (
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <Link2 className="h-3.5 w-3.5 text-cyan-500" />
                URL-Safe (RFC 4648)
              </label>
            )}
          </div>
        )}
      </div>

      {tab === 'text' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {direction === 'encode' ? 'Plain UTF-8 Input' : 'Base64 / Base64URL Input'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={swapDirection}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <ArrowLeftRight className="h-3 w-3" /> Swap
                </button>
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="h-[320px] w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none"
              placeholder={direction === 'encode' ? 'Enter UTF-8 text or JSON...' : 'Paste Base64 or Base64URL string...'}
            />
          </div>

          <div className="flex flex-col bg-slate-50/40 dark:bg-[#090e1b]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {direction === 'encode' ? (urlSafe ? 'Base64URL Output' : 'Base64 Output') : 'Decoded UTF-8 Output'}
              </span>
              <button
                type="button"
                disabled={!textResult.ok || !textResult.output}
                onClick={() => textResult.ok && handleCopy(textResult.output, 'text')}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                {copied === 'text' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied === 'text' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {isImageDataUri ? (
              <div className="h-[320px] p-4 flex flex-col items-center justify-center gap-3 overflow-auto">
                <img src={input.trim()} alt="Decoded Data URI preview" className="max-h-56 rounded-lg border border-slate-200 dark:border-slate-700" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live Image Data-URI Preview</span>
              </div>
            ) : !textResult.ok ? (
              <div className="h-[320px] p-4">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                  {textResult.error}
                </div>
              </div>
            ) : (
              <textarea
                readOnly
                value={textResult.output}
                spellCheck={false}
                className="h-[320px] w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-300 focus:outline-none"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-5">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090e1b] p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
          >
            <FileUp className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Drop an image, SVG, font, or JSON file here (or click to browse)
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Processed 100% locally via FileReader · Up to 10 MB
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {fileError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
              {fileError}
            </div>
          )}

          {fileData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">File Metadata</div>
                <p className="font-mono text-xs text-indigo-600 dark:text-indigo-300 break-all">{fileData.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MIME: <span className="font-mono">{fileData.type}</span> · Original: {formatBytes(fileData.size)}
                </p>
                {fileData.type.startsWith('image/') && (
                  <img
                    src={fileData.dataUri}
                    alt={fileData.name}
                    className="mt-2 max-h-40 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                  />
                )}
              </div>

              <div className="lg:col-span-2 space-y-3">
                {[
                  { id: 'uri', title: 'Full Data URI (HTML / CSS ready)', value: fileData.dataUri },
                  { id: 'css', title: 'CSS background-image snippet', value: `background-image: url("${fileData.dataUri}");` },
                  { id: 'raw', title: 'Raw Base64 Payload', value: fileData.rawBase64 },
                ].map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, item.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold cursor-pointer"
                      >
                        {copied === item.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copied === item.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={2}
                      value={item.value}
                      className="w-full resize-none bg-transparent font-mono text-[11px] text-slate-600 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
