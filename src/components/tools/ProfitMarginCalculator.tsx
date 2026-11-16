import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatUsd } from './studioUtils';

type SolveMode = 'cost-price' | 'cost-margin' | 'cost-markup';

const LADDER_MARGINS = [20, 25, 30, 40, 50, 60, 70, 75];

export default function ProfitMarginCalculator() {
  const [mode, setMode] = useState<SolveMode>('cost-price');
  const [cost, setCost] = useState(42);
  const [sellingPrice, setSellingPrice] = useState(120);
  const [targetMargin, setTargetMargin] = useState(65);
  const [targetMarkup, setTargetMarkup] = useState(185.7);

  const solved = useMemo(() => {
    const safeCost = Math.max(0, cost);
    let price = 0;
    let marginPct = 0;
    let markupPct = 0;

    if (mode === 'cost-price') {
      price = Math.max(0, sellingPrice);
      const profit = price - safeCost;
      marginPct = price > 0 ? (profit / price) * 100 : 0;
      markupPct = safeCost > 0 ? (profit / safeCost) * 100 : 0;
    } else if (mode === 'cost-margin') {
      marginPct = Math.min(99.9, Math.max(0, targetMargin));
      price = safeCost / (1 - marginPct / 100);
      const profit = price - safeCost;
      markupPct = safeCost > 0 ? (profit / safeCost) * 100 : 0;
    } else {
      markupPct = Math.max(0, targetMarkup);
      price = safeCost * (1 + markupPct / 100);
      const profit = price - safeCost;
      marginPct = price > 0 ? (profit / price) * 100 : 0;
    }

    const grossProfit = price - safeCost;
    const costRatio = price > 0 ? (safeCost / price) * 100 : 0;
    const breakEvenRoas = marginPct > 0 ? 100 / marginPct : 0;

    return {
      cost: safeCost,
      price,
      grossProfit,
      marginPct,
      markupPct,
      costRatio,
      breakEvenRoas,
    };
  }, [mode, cost, sellingPrice, targetMargin, targetMarkup]);

  const profitWidth = Math.min(100, Math.max(0, solved.marginPct));
  const costWidth = Math.max(0, 100 - profitWidth);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Solver Inputs */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Pricing Solver Mode
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs">
            {[
              { id: 'cost-price', label: 'Cost + Price' },
              { id: 'cost-margin', label: 'Cost + Margin %' },
              { id: 'cost-markup', label: 'Cost + Markup %' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as SolveMode)}
                className={`rounded-lg py-2 px-1.5 font-semibold transition-colors cursor-pointer ${
                  mode === item.id ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Unit / Delivery Cost (COGS $)
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2.5 focus-within:border-indigo-500">
                <span className="font-mono text-slate-400 mr-1.5">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={cost}
                  onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-transparent font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {mode === 'cost-price' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Selling Price / Revenue ($)
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2.5 focus-within:border-emerald-500">
                  <span className="font-mono text-slate-400 mr-1.5">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-transparent font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === 'cost-margin' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Target Gross Margin (%)</label>
                  <span className="font-mono font-bold text-emerald-500">{targetMargin}%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={99.9}
                  step="0.5"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Math.min(99.9, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2.5 font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                />
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            )}

            {mode === 'cost-markup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Markup on Cost (%)
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2.5 focus-within:border-cyan-500">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={targetMarkup}
                    onChange={(e) => setTargetMarkup(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-transparent font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="font-mono text-slate-400 ml-1.5">%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right KPI Studio + Visual Split + Ladder */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-6 shadow-xl space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Gross Margin',
                  val: `${solved.marginPct.toFixed(1)}%`,
                  accent: solved.marginPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500',
                },
                {
                  label: 'Markup %',
                  val: `${solved.markupPct.toFixed(1)}%`,
                  accent: 'text-indigo-600 dark:text-indigo-400',
                },
                {
                  label: 'Gross Profit',
                  val: formatUsd(solved.grossProfit, 2),
                  accent: solved.grossProfit >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500',
                },
                {
                  label: 'Break-Even ROAS',
                  val: solved.breakEvenRoas > 0 ? `${solved.breakEvenRoas.toFixed(2)}×` : 'N/A',
                  accent: 'text-cyan-600 dark:text-cyan-400',
                },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#090e1b] p-3.5">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{kpi.label}</div>
                  <div className={`mt-1 font-mono text-xl sm:text-2xl font-black tabular-nums ${kpi.accent}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* Revenue Split Visual Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200">
                  Selling Price: <span className="font-mono">{formatUsd(solved.price, 2)}</span>
                </span>
                <span className="text-slate-500">
                  Cost {costWidth.toFixed(1)}% · Profit {profitWidth.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                <div style={{ width: `${costWidth}%` }} className="bg-slate-400 dark:bg-slate-600 transition-all" />
                <div style={{ width: `${profitWidth}%` }} className="bg-emerald-500 transition-all" />
              </div>
            </div>

            {/* Interactive Pricing Ladder */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5">
                Pricing Ladder at Your Cost ({formatUsd(solved.cost, 2)})
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/70 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="py-2 px-3">Margin %</th>
                      <th className="py-2 px-3">Markup %</th>
                      <th className="py-2 px-3">Sell Price</th>
                      <th className="py-2 px-3">Profit / Unit</th>
                      <th className="py-2 px-3">Break-Even ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                    {LADDER_MARGINS.map((m) => {
                      const p = solved.cost / (1 - m / 100);
                      const prof = p - solved.cost;
                      const mk = solved.cost > 0 ? (prof / solved.cost) * 100 : 0;
                      const roas = 100 / m;
                      return (
                        <tr key={m} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">{m}%</td>
                          <td className="py-2 px-3 text-indigo-600 dark:text-indigo-300">{mk.toFixed(1)}%</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{formatUsd(p, 2)}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{formatUsd(prof, 2)}</td>
                          <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400">{roas.toFixed(2)}×</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
