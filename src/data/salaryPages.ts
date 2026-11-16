export interface SalaryTier {
  rate: number;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  tierContext: string;
  typicalRoles: string;
}

const RAW_TIERS: { rate: number; tierContext: string; typicalRoles: string }[] = [
  {
    rate: 25,
    tierContext:
      '$25/hour is a widely searched US entry-to-mid hourly wage benchmark, placing full-time workers squarely in the $50k+ annual gross bracket.',
    typicalRoles: 'Administrative specialists, junior IT support, customer success reps, and skilled trades apprentices.',
  },
  {
    rate: 30,
    tierContext:
      '$30/hour crosses the $60,000/year full-time threshold in the US and represents a solid base for early-career technical and operations professionals.',
    typicalRoles: 'Junior web developers, digital marketing coordinators, paralegals, and bookkeeping contractors.',
  },
  {
    rate: 35,
    tierContext:
      '$35/hour yields over $72,000 annually at 40 hours/week, making overtime and paid time off policies important factors when comparing offers.',
    typicalRoles: 'Systems administrators, mid-level designers, QA automation engineers, and freelance copywriters.',
  },
  {
    rate: 40,
    tierContext:
      '$40/hour equals $83,200/year at standard 2,080 paid hours—often serving as the crossover rate between salaried W-2 roles and hourly contracting.',
    typicalRoles: 'Full-stack developers, technical recruiters, SEO specialists, and financial analysts.',
  },
  {
    rate: 45,
    tierContext:
      '$45/hour approaches six-figure territory ($93,600/year gross) and requires careful attention to bi-weekly vs. semi-monthly cashflow budgeting.',
    typicalRoles: 'Frontend engineers, product designers, B2B media buyers, and Salesforce administrators.',
  },
  {
    rate: 50,
    tierContext:
      '$50/hour is the iconic US six-figure milestone ($104,000/year at 2,080 hours)—one of the most searched compensation benchmarks across the United States.',
    typicalRoles: 'Software engineers, UX leads, RevOps consultants, and experienced freelance developers.',
  },
  {
    rate: 60,
    tierContext:
      '$60/hour puts gross full-time earnings at $124,800/year, though independent 1099 contractors should verify how unpaid PTO and FICA taxes reduce take-home pay.',
    typicalRoles: 'Senior full-stack developers, DevOps engineers, fractional growth leads, and product managers.',
  },
  {
    rate: 75,
    tierContext:
      '$75/hour translates to $156,000/year on a W-2 schedule—a common contract-to-hire rate for US tech and consulting talent.',
    typicalRoles: 'Senior backend architects, cloud consultants, cybersecurity analysts, and independent UI/UX leads.',
  },
  {
    rate: 80,
    tierContext:
      '$80/hour equals $166,400/year gross before taxes and is frequently offered on W-2 staffing agency contracts without full corporate equity.',
    typicalRoles: 'Data engineers, staff software consultants, Kubernetes specialists, and fractional marketing directors.',
  },
  {
    rate: 100,
    tierContext:
      '$100/hour ($208,000/year at 2,080 hours) is the benchmark consulting rate for senior US independent contractors and boutique technical specialists.',
    typicalRoles: 'Principal engineers, AWS/GCP solution architects, fractional CTOs, and independent SaaS consultants.',
  },
  {
    rate: 125,
    tierContext:
      '$125/hour brings full-time gross billing to $260,000/year, typically charged by specialized US LLC consultants carrying their own liability insurance and overhead.',
    typicalRoles: 'Staff AI/ML engineers, enterprise ERP consultants, security auditors, and B2B agency principals.',
  },
  {
    rate: 150,
    tierContext:
      '$150/hour ($312,000/year at 2,080 hours) represents senior advisory and specialized technical consulting territory across major US metro markets.',
    typicalRoles: 'Fractional VPs of Engineering, SOC-2 security advisors, principal cloud architects, and legal/finance consultants.',
  },
];

export const SALARY_TIERS: SalaryTier[] = RAW_TIERS.map((t) => {
  const annual = (t.rate * 2080).toLocaleString('en-US');
  return {
    rate: t.rate,
    slug: `${t.rate}-an-hour`,
    title: `$${t.rate} an Hour Is How Much a Year? ($${annual}/yr Breakdown)`,
    seoTitle: `$${t.rate} an Hour Is How Much a Year? (2026 US Breakdown) | Taprico`,
    seoDescription: `Making $${t.rate} an hour equals $${annual} per year (2,080 hours). See monthly, bi-weekly, semi-monthly, unpaid PTO adjustments, and 1099 contractor rate parity.`,
    tierContext: t.tierContext,
    typicalRoles: t.typicalRoles,
  };
});

export function getSalaryTierBySlug(slug: string): SalaryTier | undefined {
  return SALARY_TIERS.find((t) => t.slug === slug);
}
