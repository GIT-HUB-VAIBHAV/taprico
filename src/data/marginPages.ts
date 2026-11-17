export interface MarginPageItem {
  slug: string;
  marginPct: number;
  markupPct: number;
  title: string;
  seoTitle: string;
  seoDescription: string;
  sampleCost: number;
  context: string;
  industryFit: string;
}

const RAW_MARGINS: { marginPct: number; sampleCost: number; context: string; industryFit: string }[] = [
  {
    marginPct: 20,
    sampleCost: 80,
    context:
      'A 20% gross margin requires a 25% markup on cost. At this slim spread, payment fees (2.9% + $0.30) and free shipping can easily erase net profit.',
    industryFit: 'High-volume retail distribution, wholesale pass-through hardware, and grocery/commodities.',
  },
  {
    marginPct: 25,
    sampleCost: 75,
    context:
      'A 25% gross margin equals a 33.33% markup above unit cost—you keep $0.25 of every $1.00 in gross revenue before marketing and overhead.',
    industryFit: 'Managed IT hardware resellers, wholesale B2B suppliers, and low-touch fulfillment SKUs.',
  },
  {
    marginPct: 30,
    sampleCost: 70,
    context:
      'A 30% gross margin equals a 42.86% markup on cost—one of the most frequently miscalculated pricing targets by small US businesses.',
    industryFit: 'General retail, specialty construction contracting, and consumer packaged goods wholesale.',
  },
  {
    marginPct: 40,
    sampleCost: 60,
    context:
      'A 40% gross margin translates to a 66.67% markup on cost, giving small businesses breathing room for payment fees and seasonal promotions.',
    industryFit: 'Boutique retail, custom print/packaging shops, and hybrid productized services.',
  },
  {
    marginPct: 50,
    sampleCost: 50,
    context:
      'A 50% gross margin means doubling your unit cost (100% markup—"keystone pricing") so cost and gross profit split revenue evenly 50/50.',
    industryFit: 'US digital agencies (after contractor COGS), Shopify DTC brands, and specialty apparel.',
  },
  {
    marginPct: 60,
    sampleCost: 40,
    context:
      'A 60% gross margin requires a 150% markup on unit cost, leaving healthy room for Meta/Google customer acquisition costs (CAC).',
    industryFit: 'DTC beauty/supplements, high-efficiency creative agencies, and managed B2B retainers.',
  },
  {
    marginPct: 70,
    sampleCost: 30,
    context:
      'A 70% gross margin corresponds to a 233.33% markup on cost—giving consumer brands and agencies strong reinvestment power for growth.',
    industryFit: 'High-margin e-commerce brands, paid software add-ons, and senior consulting practices.',
  },
  {
    marginPct: 75,
    sampleCost: 25,
    context:
      'A 75% gross margin equals a 300% markup (4× cost), the classic benchmark target for healthy US B2B SaaS and digital download businesses.',
    industryFit: 'B2B SaaS platforms, digital templates, developer APIs, and specialized advisory firms.',
  },
];

export const MARGIN_PAGES: MarginPageItem[] = RAW_MARGINS.map((m) => {
  const markupPct = Math.round(((m.marginPct / (100 - m.marginPct)) * 100) * 100) / 100;
  return {
    slug: `${m.marginPct}-percent-margin`,
    marginPct: m.marginPct,
    markupPct,
    title: `${m.marginPct}% Profit Margin Calculator (= ${markupPct}% Markup Formula)`,
    seoTitle: `${m.marginPct}% Profit Margin vs Markup Calculator (${markupPct}%) | Taprico`,
    seoDescription: `Calculate selling prices for a ${m.marginPct}% gross profit margin (${markupPct}% markup on cost). Includes US Stripe 2.9% fee impact and break-even ROAS math.`,
    sampleCost: m.sampleCost,
    context: m.context,
    industryFit: m.industryFit,
  };
});
