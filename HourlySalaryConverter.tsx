import { useMemo, useState } from 'react';
import { Briefcase, DollarSign, Info, Sparkles } from 'lucide-react';
import { formatUsd } from './studioUtils';

interface Props {
  initialHourly?: number;
}

export default function HourlySalaryConverter({ initialHourly = 65 }: Props) {
  const [hourlyRate, setHourlyRate] = useState(initialHourly);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [paidTimeOff, setPaidTimeOff] = useState(true);
  const [ptoDays, setPtoDays] = useState(15);
  const [holidays, setHolidays] = useState(11);
  const [overtimeHours, setOvertimeHours] = useState(0);

  const metrics = useMemo(() => {
    const dailyHours = hoursPerWeek / 5;
    const totalScheduledHours = hoursPerWeek * weeksPerYear;
    const offDaysTotal = ptoDays + holidays;
    const offHours = offDaysTotal * dailyHours;
    const billableHours = paidTimeOff
      ? totalScheduledHours
      : Math.max(0, totalScheduledHours - offHours);

    const baseAnnual = hourlyRate * billableHours;
    const overtimeAnnual = overtimeHours * weeksPerYear * (hourlyRate * 1.5);
    const totalAnnual = baseAnnual + overtimeAnnual;

    const monthly = totalAnnual / 12;
    const semiMonthly = totalAnnual / 24;
    const biWeekly = totalAnnual / 26;
    const weekly = totalAnnual / weeksPerYear;
    const daily = hourlyRate * dailyHours;

    // US 1099 Equivalent (7.65% employer FICA + 18% lost benefits/PTO load = ~26% uplift, plus 15% non-billable buffer)
    const w2EffectiveHourly = totalAnnual / Math.max(1, totalScheduledHours);
    const contractorEquivalentMin = (totalAnnual * 1.26) / Math.max(1, totalScheduledHours - offHours);
    const contractorRecommended = (totalAnnual * 1.38) / Math.max(1, (totalScheduledHours - offHours) * 0.85);

    return {
      billableHours,
      baseAnnual,
      overtimeAnnual,
      totalAnnual,
      monthly,
      semiMonthly,
      biWeekly,
      weekly,
      daily,
      w2EffectiveHourly,
      contractorEquivalentMin,
      contractorRecommended,
    };
  }, [hourlyRate, hoursPerWeek, weeksPerYear, paidTimeOff, ptoDays, holidays, overtimeHours]);

  const handleAnnualInput = (annualVal: number) => {
    const dailyHours = hoursPerWeek / 5;
    const totalScheduled = hoursPerWeek * weeksPerYear;
    const effectiveHours = paidTimeOff
      ? totalScheduled
      : Math.max(1, totalScheduled - (ptoDays + holidays) * dailyHours);
    setHourlyRate(Number((annualVal / effectiveHours).toFixed(2)));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              US Compensation Inputs
            </h2>
            <div className="flex gap-1">
              {[35, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHourlyRate(preset)}
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold cursor-pointer ${
                    Math.round(hourlyRate) === preset
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  ${preset}/hr
                </button>
              ))}
            </div>
          </div>

          {/* Bidirectional Hourly & Annual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Hourly Rate (USD)
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 focus-within:border-emerald-500">
                <span className="font-mono text-slate-400 mr-1">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-transparent font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Annual Gross Target
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 focus-within:border-indigo-500">
                <span className="font-mono text-slate-400 mr-1">$</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={Math.round(metrics.baseAnnual)}
                  onChange={(e) => handleAnnualInput(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-transparent font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Hours per Week</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{hoursPerWeek} hrs</span>
              </div>
              <input
                type="range"
                min={10}
                max={65}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Overtime Hours / Week (1.5×)</span>
                <span className="font-mono font-bold text-amber-500">{overtimeHours} hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090e1b] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Time Off Mode</span>
                <div className="flex rounded-lg bg-slate-200/80 dark:bg-slate-800 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPaidTimeOff(true)}
                    className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                      paidTimeOff ? 'bg-emerald-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    Paid PTO (W-2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidTimeOff(false)}
                    className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                      !paidTimeOff ? 'bg-amber-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    Unpaid (Hourly/1099)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Weeks/Yr</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={weeksPerYear}
                    onChange={(e) => setWeeksPerYear(Math.min(52, Math.max(1, Number(e.target.value) || 52)))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">US Holidays</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={holidays}
                    onChange={(e) => setHolidays(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Vacation Days</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={ptoDays}
                    onChange={(e) => setPtoDays(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Paycheck Breakdown + W2 vs 1099 Reality Check */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hero Annual Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-white to-cyan-500/10 dark:from-emerald-500/15 dark:via-[#0d1322] dark:to-indigo-500/10 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" /> Annual Gross Compensation
              </span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {Math.round(metrics.billableHours).toLocaleString('en-US')} paid hrs/yr
              </span>
            </div>
            <div className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatUsd(metrics.totalAnnual, 0)}
            </div>
            {metrics.overtimeAnnual > 0 && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-300 font-medium">
                Includes {formatUsd(metrics.overtimeAnnual, 0)}/yr in 1.5× overtime pay
              </p>
            )}

            {/* 6 Pay Periods */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Monthly (12/yr)', val: metrics.monthly },
                { label: 'Semi-Monthly (24/yr)', val: metrics.semiMonthly },
                { label: 'Bi-Weekly (26/yr)', val: metrics.biWeekly },
                { label: 'Weekly (52/yr)', val: metrics.weekly },
                { label: 'Daily Rate', val: metrics.daily },
                { label: 'Effective Hourly', val: hourlyRate },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#090e1b]/80 p-3.5"
                >
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{card.label}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatUsd(card.val, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* W-2 vs 1099 Contractor Reality Check */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              W-2 Salary vs. 1099 Contractor Rate Equivalent
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              To match a <strong className="text-slate-900 dark:text-slate-100">{formatUsd(metrics.totalAnnual, 0)}</strong> W-2 package as an independent US 1099 contractor—covering the extra 7.65% employer FICA match, lost paid holidays/PTO, and healthcare—you must charge substantially higher than your W-2 hourly figure:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Minimum 1099 Parity Rate
                </div>
                <div className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {formatUsd(metrics.contractorEquivalentMin, 2)}/hr
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Covers FICA + unpaid PTO + health baseline
                </div>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Healthy Consulting Target
                </div>
                <div className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {formatUsd(metrics.contractorRecommended, 2)}/hr
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Includes 15% non-billable sales/admin buffer
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-500" />
              <span>Want exact pricing with your own monthly business expenses &amp; state taxes? Open our Freelance Rate Calculator.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
