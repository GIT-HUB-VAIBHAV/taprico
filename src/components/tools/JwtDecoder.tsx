import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

function base64UrlToUint8Array(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlJson(segment: string): Record<string, unknown> {
  const bytes = base64UrlToUint8Array(segment);
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  return JSON.parse(text) as Record<string, unknown>;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createSampleHs256Jwt(secret: string, expiresOffsetSeconds: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: 'https://auth.taprico.com',
    sub: 'usr_9842_us_east',
    aud: 'taprico-billing-api',
    email: 'alex.morgan@acme.dev',
    plan: 'pro_annual',
    roles: ['developer', 'admin'],
    iat: now,
    exp: now + expiresOffsetSeconds,
  };
  const enc = new TextEncoder();
  const h = base64UrlEncodeBytes(enc.encode(JSON.stringify(header)));
  const p = base64UrlEncodeBytes(enc.encode(JSON.stringify(payload)));
  const signingInput = `${h}.${p}`;
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(sig))}`;
}

const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: 'Issuer — principal that issued the token',
  sub: 'Subject — unique user or service ID',
  aud: 'Audience — intended API/resource recipient',
  exp: 'Expiration Time — token invalid after this Unix timestamp',
  nbf: 'Not Before — token rejected prior to this timestamp',
  iat: 'Issued At — when token was minted',
  jti: 'JWT ID — unique identifier to prevent replay attacks',
};

function formatTimeDelta(seconds: number): string {
  const abs = Math.abs(seconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export default function JwtDecoder() {
  const [token, setToken] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGgudGFwcmljby5jb20iLCJzdWIiOiJ1c3JfOTg0Ml91c19lYXN0IiwiYXVkIjoidGFwcmljby1hcGkiLCJlbWFpbCI6ImFsZXhAYWNtZS5kZXYiLCJyb2xlcyI6WyJkZXZlbG9wZXIiLCJiaWxsaW5nIl0sImlhdCI6MTc2MzI3MDQwMCwiZXhwIjoxODk0ODk2MDAwfQ.dummySignatureForInspectionOnly'
  );
  const [secret, setSecret] = useState('taprico-demo-secret-key-2026');
  const [verifyState, setVerifyState] = useState<'idle' | 'valid' | 'invalid' | 'unsupported'>('idle');
  const [nowSec, setNowSec] = useState(1763356800);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setNowSec(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Load real valid HS256 sample on first mount so user can verify immediately!
  useEffect(() => {
    createSampleHs256Jwt('taprico-demo-secret-key-2026', 86400 * 7)
      .then((signed) => setToken(signed))
      .catch(() => {});
  }, []);

  const decoded = useMemo(() => {
    const clean = token.trim();
    if (!clean) {
      return { ok: false as const, error: 'Paste a JWT string (header.payload.signature) to inspect it.' };
    }
    const parts = clean.split('.');
    if (parts.length !== 3) {
      return {
        ok: false as const,
        error: `Expected 3 dot-separated segments (header.payload.signature), but found ${parts.length}.`,
      };
    }

    try {
      const header = decodeBase64UrlJson(parts[0]);
      const payload = decodeBase64UrlJson(parts[1]);
      return {
        ok: true as const,
        parts,
        header,
        payload,
        signature: parts[2],
      };
    } catch (e) {
      return {
        ok: false as const,
        error: `Malformed Base64URL or JSON segment: ${e instanceof Error ? e.message : 'Decode failed'}`,
      };
    }
  }, [token]);

  // Verify HMAC signature via SubtleCrypto
  useEffect(() => {
    if (!decoded.ok) {
      setVerifyState('idle');
      return;
    }
    const alg = String(decoded.header.alg || '').toUpperCase();
    const hashMap: Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
      HS256: 'SHA-256',
      HS384: 'SHA-384',
      HS512: 'SHA-512',
    };
    const hash = hashMap[alg];
    if (!hash) {
      setVerifyState('unsupported');
      return;
    }
    if (!secret) {
      setVerifyState('idle');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          enc.encode(secret),
          { name: 'HMAC', hash },
          false,
          ['verify']
        );
        const sigBytes = base64UrlToUint8Array(decoded.signature);
        const dataBytes = enc.encode(`${decoded.parts[0]}.${decoded.parts[1]}`);
        const valid = await crypto.subtle.verify(
          'HMAC',
          key,
          new Uint8Array(sigBytes).buffer,
          new Uint8Array(dataBytes).buffer
        );
        if (!cancelled) setVerifyState(valid ? 'valid' : 'invalid');
      } catch {
        if (!cancelled) setVerifyState('invalid');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [decoded, secret]);

  const securityWarnings = useMemo(() => {
    if (!decoded.ok) return [];
    const warnings: { level: 'danger' | 'warn'; text: string }[] = [];
    const alg = String(decoded.header.alg || '');
    if (alg.toLowerCase() === 'none' || !alg) {
      warnings.push({
        level: 'danger',
        text: 'Critical: Header uses alg="none" or omits alg. Attackers can forge unsigned tokens if your server does not reject alg:none.',
      });
    }
    if (typeof decoded.payload.exp !== 'number') {
      warnings.push({
        level: 'warn',
        text: 'Missing "exp" (Expiration) claim. Bearer tokens without expiration remain valid indefinitely unless manually revoked.',
      });
    } else if (decoded.payload.exp < nowSec) {
      warnings.push({
        level: 'warn',
        text: `Token expired ${formatTimeDelta(nowSec - decoded.payload.exp)} ago.`,
      });
    }
    if ('password' in decoded.payload || 'ssn' in decoded.payload || 'secret' in decoded.payload) {
      warnings.push({
        level: 'danger',
        text: 'Sensitive field name detected in payload! Remember: JWT payloads are Base64URL-encoded, NOT encrypted.',
      });
    }
    return warnings;
  }, [decoded, nowSec]);

  const loadSample = async (kind: 'valid' | 'expired' | 'rs256') => {
    if (kind === 'valid') {
      const s = await createSampleHs256Jwt('taprico-demo-secret-key-2026', 3600 * 12);
      setSecret('taprico-demo-secret-key-2026');
      setToken(s);
    } else if (kind === 'expired') {
      const s = await createSampleHs256Jwt('taprico-demo-secret-key-2026', -7200);
      setSecret('taprico-demo-secret-key-2026');
      setToken(s);
    } else {
      const h = base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'auth0-key-2026-us' })));
      const p = base64UrlEncodeBytes(
        new TextEncoder().encode(
          JSON.stringify({
            iss: 'https://acme-us.us.auth0.com/',
            sub: 'auth0|6748912abc',
            aud: 'https://api.acme-saas.com',
            scope: 'read:invoices write:webhooks',
            iat: nowSec - 300,
            exp: nowSec + 3300,
          })
        )
      );
      setToken(`${h}.${p}.RS256_ASYMMETRIC_PUBLIC_KEY_SIGNATURE_SAMPLE`);
    }
  };

  const copyJson = async (key: string, val: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(val, null, 2));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const exp = decoded.ok && typeof decoded.payload.exp === 'number' ? decoded.payload.exp : null;
  const isExpired = exp !== null && exp < nowSec;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Lock className="h-4 w-4 text-indigo-500" />
            Encoded JWT Input
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              Web Crypto Local
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadSample('valid')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
            >
              Valid HS256
            </button>
            <button
              type="button"
              onClick={() => loadSample('expired')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
            >
              Expired Token
            </button>
            <button
              type="button"
              onClick={() => loadSample('rs256')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-cyan-400 cursor-pointer"
            >
              Auth0 RS256
            </button>
          </div>
        </div>

        {/* Main Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left: Encoded + Color-coded anatomy + Secret verifier */}
          <div className="lg:col-span-5 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Paste Token (Header.Payload.Signature)
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                spellCheck={false}
                rows={6}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#090e1b] p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>

            {decoded.ok && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Color-Coded Token Anatomy</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500">Header</span>·
                    <span className="text-indigo-500">Payload</span>·
                    <span className="text-cyan-500">Signature</span>
                  </div>
                </div>
                <p className="font-mono text-[11px] leading-relaxed break-all">
                  <span className="text-rose-600 dark:text-rose-400">{decoded.parts[0]}</span>
                  <span className="text-slate-400">.</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{decoded.parts[1]}</span>
                  <span className="text-slate-400">.</span>
                  <span className="text-cyan-600 dark:text-cyan-400">{decoded.parts[2]}</span>
                </p>
              </div>
            )}

            {/* Signature Verification Panel */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-500" />
                  HMAC Signature Verifier
                </span>
                {verifyState === 'valid' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
                {verifyState === 'invalid' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    <XCircle className="h-3 w-3" /> Invalid Signature
                  </span>
                )}
                {verifyState === 'unsupported' && (
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                    Asymmetric ({String(decoded.ok ? decoded.header.alg : 'N/A')})
                  </span>
                )}
              </div>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter HMAC secret (for HS256/HS384/HS512)..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090e1b] px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Verified using native <code className="text-cyan-600 dark:text-cyan-400">crypto.subtle</code> inside your browser. Asymmetric RS256/ES256 tokens require your provider JWKS public key.
              </p>
            </div>
          </div>

          {/* Right: Decoded Header, Payload, Expiry, Audit */}
          <div className="lg:col-span-7 p-4 space-y-4 bg-slate-50/30 dark:bg-[#090e1b]/60">
            {!decoded.ok ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{decoded.error}</span>
              </div>
            ) : (
              <>
                {/* Expiration Banner */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
                    exp === null
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : isExpired
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="h-4 w-4" />
                    {exp === null
                      ? 'No expiration claim (exp) present'
                      : isExpired
                        ? `Expired ${formatTimeDelta(nowSec - exp)} ago`
                        : `Active · Expires in ${formatTimeDelta(exp - nowSec)}`}
                  </div>
                  {exp !== null && (
                    <span className="font-mono text-[11px] opacity-90">
                      {new Date(exp * 1000).toLocaleString('en-US', {
                        timeZone: 'America/New_York',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      ET
                    </span>
                  )}
                </div>

                {/* Security Warnings */}
                {securityWarnings.length > 0 && (
                  <div className="space-y-2">
                    {securityWarnings.map((w, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
                          w.level === 'danger'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{w.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Header JSON */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-3.5 py-2">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      HEADER · Algorithm &amp; Token Type
                    </span>
                    <button
                      type="button"
                      onClick={() => copyJson('header', decoded.header)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-500 cursor-pointer"
                    >
                      {copiedKey === 'header' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === 'header' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>

                {/* Payload JSON */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-3.5 py-2">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      PAYLOAD · Claims &amp; Identity Data
                    </span>
                    <button
                      type="button"
                      onClick={() => copyJson('payload', decoded.payload)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-500 cursor-pointer"
                    >
                      {copiedKey === 'payload' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedKey === 'payload' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>

                {/* Human Claims Table */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 px-3.5 py-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Decoded Claim Annotations
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {Object.entries(decoded.payload).map(([k, v]) => {
                      const isTimestamp = (k === 'exp' || k === 'iat' || k === 'nbf') && typeof v === 'number';
                      return (
                        <div key={k} className="grid grid-cols-12 gap-2 px-3.5 py-2 text-xs">
                          <div className="col-span-3 font-mono font-semibold text-indigo-600 dark:text-indigo-300">{k}</div>
                          <div className="col-span-9 space-y-0.5">
                            <div className="font-mono text-slate-800 dark:text-slate-200 break-all">
                              {isTimestamp
                                ? `${v} (${new Date((v as number) * 1000).toUTCString()})`
                                : typeof v === 'object'
                                  ? JSON.stringify(v)
                                  : String(v)}
                            </div>
                            {CLAIM_DESCRIPTIONS[k] && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{CLAIM_DESCRIPTIONS[k]}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
