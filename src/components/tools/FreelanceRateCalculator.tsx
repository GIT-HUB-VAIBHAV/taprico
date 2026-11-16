import { useMemo, useState } from 'react';
import { Calculator, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatUsd } from './studioUtils';

const TAX_PRESETS = [
  { label: 'Low Tax State (TX / FL / WA)', rate: 25 },
  { label: 'US Average Combined', rate: 30 },
  { label: 'High Tax State (CA / NY / NJ)', rate: 36 },
];

export default function FreelanceRateCalculator() {
  const [targetNetIncome, setTargetNetIncome] = useState(125000);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
  const [utilizationPct, setUtilizationPct] = useState(70);
  const [weeksOff, setWeeksOff] = useState(4);
  const [monthlyOverhead, setMonthlyOverhead] = useState(450);
  const [monthlyBenefits, setMonthlyBenefits] = useState(750);
  const [taxRatePct, setTaxRatePct] = useState(30);
  const [profitMarginPct, setProfitMarginPct] = useState(20);

  const calc = useMemo(() => {
    const workingWeeks = Math.max(1, 52 - weeksOff);
    const billableHoursPerWeek = workHoursPerWeek * (utilizationPct / 100);
    const annualBillableHours = Math.max(1, workingWeeks * billableHoursPerWeek);

    const annualOverhead = monthlyOverhead * 12;
    const annualBenefits = monthlyBenefits * 12;

    // Net + Benefits must be retained after tax: GrossBeforeOverhead = (Net + Benefits) / (1 - taxRate)
    const taxDecimal = Math.min(0.65, Math.max(0, taxRatePct / 100));
    const preTaxIncomeNeeded = (targetNetIncome + annualBenefits) / (1 - taxDecimal);
    const estimatedTaxes = preTaxIncomeNeeded - (targetNetIncome + annualBenefits);
    const breakEvenRevenue = preTaxIncomeNeeded + annualOverhead;

    const breakEvenHourly = breakEvenRevenue / annualBillableHours;
    const recommendedHourly = breakEvenHourly * (1 + profitMarginPct / 100);
    const recommendedRevenue = recommendedHourly * annualBillableHours;

    const dayRate = recommendedHourly * 8;
    const weeklySprint = recommendedHourly * billableHoursPerWeek;
    const monthlyRetainer = recommendedRevenue / 12;

    const totalSlice = Math.max(1, recommendedRevenue);
    const pctNet = (targetNetIncome / totalSlice) * 100;
    const pctTax = (estimatedTaxes / totalSlice) * 100;
    const pctBenefits = (annualBenefits / totalSlice) * 100;
    const pctOverhead = (annualOverhead / totalSlice) * 100;
    const pctMargin = Math.max(0, 100 - pctNet - pctTax - pctBenefits - pctOverhead);

    return {
      workingWeeks,
      billableHoursPerWeek,
      annualBillableHours,
      annualOverhead,
      annualBenefits,
      estimatedTaxes,
      breakEvenRevenue,
      recommendedRevenue,
      breakEvenHourly,
      recommendedHourly,
      dayRate,
      weeklySprint,
      monthlyRetainer,
      pctNet,
      pctTax,
      pctBenefits,
      pctOverhead,
      pctMargin,
    };
  }, [
    targetNetIncome,
    workHoursPerWeek,
    utilizationPct,
    weeksOff,
    monthlyOverhead,
    monthlyBenefits,
    taxRatePct,
    profitMarginPct,
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Inputs */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 sm:p-6 shadow-xl space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="h-4 w-4 text-indigo-500" />
          Income, Utilization &amp; US Tax Inputs
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Target Net Annual Take-Home Pay (After Taxes &amp; Expenses)
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2.5 focus-within:border-indigo-500">
            <span className="font-mono text-slate-400 mr-1.5">$</span>
            <input
              type="number"
              min={10000}
              step={5000}
              value={targetNetIncome}
              onChange={(e) => setTargetNetIncome(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent font-mono text-xl font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Utilization Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-600 dark:text-slate-300">Billable Utilization Rate</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
              {utilizationPct}% ({calc.billableHoursPerWeek.toFixed(1)} billable hrs/wk)
            </span>
          </div>
          <input
            type="range"
            min={35}
            max={95}
            value={utilizationPct}
            onChange={(e) => setUtilizationPct(Number(e.target.value))}
            className="w-full"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Realistic US solo benchmark: 60%–75% (leaves 10–15 hrs/wk for proposals, admin &amp; marketing).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Total Work Hrs/Wk</label>
            <input
              type="number"
              min={10}
              max={70}
              value={workHoursPerWeek}
              onChange={(e) => setWorkHoursPerWeek(Math.max(1, Number(e.target.value) || 40))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Weeks Off / Yr (PTO)</label>
            <input
              type="number"
              min={0}
              max={26}
              value={weeksOff}
              onChange={(e) => setWeeksOff(Math.min(26, Math.max(0, Number(e.target.value) || 0)))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Monthly Overhead ($)</label>
            <input
              type="number"
              min={0}
              step={50}
              value={monthlyOverhead}
              onChange={(e) => setMonthlyOverhead(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Health / 401k / Mo ($)</label>
            <input
              type="number"
              min={0}
              step={50}
              value={monthlyBenefits}
              onChange={(e) => setMonthlyBenefits(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono font-semibold"
            />
          </div>
        </div>

        {/* Tax Presets */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">US Tax Reserve (SE 15.3% + Income)</span>
            <span className="font-mono font-bold text-rose-500">{taxRatePct}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={50}
            value={taxRatePct}
            onChange={(e) => setTaxRatePct(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex flex-wrap gap-1.5">
            {TAX_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setTaxRatePct(p.rate)}
                className={`rounded-lg border px-2 py-1 text-[10px] font-semibold cursor-pointer ${
                  taxRatePct === p.rate
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Safety / Profit Buffer</span>
            <span className="font-mono font-bold text-emerald-500">+{profitMarginPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={45}
            value={profitMarginPct}
            onChange={(e) => setProfitMarginPct(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Right Rate Card Output */}
      <div className="lg:col-span-7 space-y-5">
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-white to-emerald-500/10 dark:from-indigo-500/15 dark:via-[#0d1322] dark:to-emerald-500/10 p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-3.5 w-3.5" /> Recommended Client Rate
              </span>
              <div className="mt-1.5 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatUsd(calc.recommendedHourly, 0)}
                <span className="text-lg font-semibold text-slate-500">/hr</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Break-even floor: <strong className="font-mono text-slate-900 dark:text-slate-200">{formatUsd(calc.breakEvenHourly, 2)}/hr</strong>
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#090e1b]/80 p-3.5 text-xs space-y-1">
              <div className="text-slate-500 dark:text-slate-400">Required Annual Gross Billing</div>
              <div className="font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatUsd(calc.recommendedRevenue, 0)}
              </div>
              <div className="text-[11px] text-slate-500">
                Across {Math.round(calc.annualBillableHours).toLocaleString('en-US')} billable hrs ({calc.workingWeeks} wks)
              </div>
            </div>
          </div>

          {/* 3 Packaging Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Day Rate (8 hrs)', val: calc.dayRate, note: 'Ideal for advisory & audits' },
              { title: 'Weekly Sprint', val: calc.weeklySprint, note: `${calc.billableHoursPerWeek.toFixed(0)}h focused dev week` },
              { title: 'Monthly Retainer', val: calc.monthlyRetainer, note: 'Predictable recurring cashflow' },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#090e1b]/80 p-3.5"
              >
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{card.title}</div>
                <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatUsd(card.val, 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{card.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Revenue Allocation Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Where Every Invoiced Dollar Goes
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">Total: {formatUsd(calc.recommendedRevenue, 0)}</span>
          </div>

          {/* Stacked Bar */}
          <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
            <div style={{ width: `${calc.pctNet}%` }} className="bg-emerald-500 transition-all" title="Net Take-Home" />
            <div style={{ width: `${calc.pctTax}%` }} className="bg-rose-500 transition-all" title="US Taxes" />
            <div style={{ width: `${calc.pctBenefits}%` }} className="bg-cyan-500 transition-all" title="Health & 401k" />
            <div style={{ width: `${calc.pctOverhead}%` }} className="bg-amber-500 transition-all" title="Business Overhead" />
            <div style={{ width: `${calc.pctMargin}%` }} className="bg-indigo-500 transition-all" title="Business Buffer" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              { color: 'bg-emerald-500', label: 'Net Take-Home', val: targetNetIncome, pct: calc.pctNet },
              { color: 'bg-rose-500', label: 'US Tax Reserve', val: calc.estimatedTaxes, pct: calc.pctTax },
              { color: 'bg-cyan-500', label: 'Health & 401(k)', val: calc.annualBenefits, pct: calc.pctBenefits },
              { color: 'bg-amber-500', label: 'Business Overhead', val: calc.annualOverhead, pct: calc.pctOverhead },
              {
                color: 'bg-indigo-500',
                label: 'Profit / Bench Buffer',
                val: Math.max(0, calc.recommendedRevenue - calc.breakEvenRevenue),
                pct: calc.pctMargin,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-2 rounded-lg border border-slate-100 dark:border-slate-800/70 p-2.5">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${row.color}`} />
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.label}</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatUsd(row.val, 0)} <span className="text-[10px] font-normal text-slate-400">({row.pct.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
