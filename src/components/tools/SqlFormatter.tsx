import { useMemo, useState } from 'react';
import { format, type KeywordCase, type LogicalOperatorNewline, type SqlLanguage } from 'sql-formatter';
import { AlertTriangle, Check, Copy, Database, Download, Minimize2, Sparkles, Trash2 } from 'lucide-react';
import { downloadTextFile } from './studioUtils';

const SQL_SAMPLES: Record<string, { label: string; dialect: SqlLanguage; query: string }> = {
  postgres: {
    label: 'Postgres CTE',
    dialect: 'postgresql',
    query: `with monthly_mrr as (select date_trunc('month', i.paid_at) as billing_month, c.account_tier, sum(i.amount_cents)/100.0 as revenue_usd, count(distinct i.customer_id) as paying_customers from billing.invoices i inner join core.customers c on c.id=i.customer_id where i.status='paid' and i.paid_at>=now()-interval '12 months' group by 1,2) select billing_month, account_tier, revenue_usd, paying_customers, round(revenue_usd*100.0/sum(revenue_usd) over (partition by billing_month),2) as tier_share_pct from monthly_mrr order by billing_month desc, revenue_usd desc;`,
  },
  mysql: {
    label: 'MySQL E-Commerce',
    dialect: 'mysql',
    query: `SELECT o.order_id, u.email, p.sku, oi.quantity, (oi.unit_price * oi.quantity) AS line_total FROM orders o JOIN users u ON u.id = o.user_id JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.id = oi.product_id WHERE o.country_code = 'US' AND o.created_at >= '2026-01-01' ORDER BY line_total DESC LIMIT 50;`,
  },
  ddl: {
    label: 'Create Table DDL',
    dialect: 'postgresql',
    query: `CREATE TABLE IF NOT EXISTS api_keys (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, key_prefix varchar(12) NOT NULL, key_hash text NOT NULL, scopes text[] NOT NULL DEFAULT ARRAY['read:tools'], last_used_at timestamptz, expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());`,
  },
};

function minifySqlQuery(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),;])\s*/g, '$1 ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+;/g, ';')
    .trim();
}

export default function SqlFormatter() {
  const [input, setInput] = useState(SQL_SAMPLES.postgres.query);
  const [dialect, setDialect] = useState<SqlLanguage>('postgresql');
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
  const [indentMode, setIndentMode] = useState<'2' | '4' | 'tab'>('2');
  const [logicalNewline, setLogicalNewline] = useState<LogicalOperatorNewline>('before');
  const [minify, setMinify] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const clean = input.trim();
    if (!clean) return { ok: true as const, output: '' };
    try {
      if (minify) {
        return { ok: true as const, output: minifySqlQuery(clean) };
      }
      const formatted = format(clean, {
        language: dialect,
        tabWidth: indentMode === '4' ? 4 : 2,
        useTabs: indentMode === 'tab',
        keywordCase,
        logicalOperatorNewline: logicalNewline,
        linesBetweenQueries: 2,
      });
      return { ok: true as const, output: formatted };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : 'Unable to parse SQL query under selected dialect.',
      };
    }
  }, [input, dialect, keywordCase, indentMode, logicalNewline, minify]);

  const handleCopy = async () => {
    if (!result.ok || !result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs">
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SqlLanguage)}
              aria-label="SQL Dialect"
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="postgresql" className="dark:bg-slate-900">PostgreSQL</option>
              <option value="mysql" className="dark:bg-slate-900">MySQL</option>
              <option value="bigquery" className="dark:bg-slate-900">BigQuery</option>
              <option value="snowflake" className="dark:bg-slate-900">Snowflake</option>
              <option value="sqlite" className="dark:bg-slate-900">SQLite</option>
              <option value="transactsql" className="dark:bg-slate-900">T-SQL (SQL Server)</option>
            </select>
          </div>

          <select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
            disabled={minify}
            aria-label="Keyword casing"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <option value="upper" className="dark:bg-slate-900">UPPERCASE Keywords</option>
            <option value="lower" className="dark:bg-slate-900">lowercase keywords</option>
            <option value="preserve" className="dark:bg-slate-900">Preserve Case</option>
          </select>

          <select
            value={indentMode}
            onChange={(e) => setIndentMode(e.target.value as '2' | '4' | 'tab')}
            disabled={minify}
            aria-label="Indentation"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <option value="2" className="dark:bg-slate-900">2 spaces</option>
            <option value="4" className="dark:bg-slate-900">4 spaces</option>
            <option value="tab" className="dark:bg-slate-900">Tabs</option>
          </select>

          <button
            type="button"
            onClick={() => setLogicalNewline((l) => (l === 'before' ? 'after' : 'before'))}
            disabled={minify}
            className="hidden sm:inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
            title="Toggle AND / OR newline placement"
          >
            AND/OR: <strong className="ml-1 text-indigo-500">{logicalNewline}</strong>
          </button>

          <button
            type="button"
            onClick={() => setMinify((m) => !m)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
              minify
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            {minify ? 'Minified' : 'Minify'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mr-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Samples:
          </span>
          {Object.entries(SQL_SAMPLES).map(([k, s]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setInput(s.query);
                setDialect(s.dialect);
                setMinify(false);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split SQL Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Raw SQL Input</span>
            <button
              type="button"
              onClick={() => setInput('')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste SQL query here..."
            className="h-[400px] w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex flex-col bg-slate-50/40 dark:bg-[#090e1b]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 px-4 py-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {minify ? 'Minified SQL' : `Formatted ${dialect.toUpperCase()} Output`}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result.ok || !result.output}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => result.ok && downloadTextFile('taprico-query.sql', result.output)}
                disabled={!result.ok || !result.output}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer"
              >
                <Download className="h-3 w-3" /> .sql
              </button>
            </div>
          </div>

          {!result.ok ? (
            <div className="h-[400px] p-4">
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{result.error}</span>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              value={result.output}
              spellCheck={false}
              className="h-[400px] w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-cyan-300 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
