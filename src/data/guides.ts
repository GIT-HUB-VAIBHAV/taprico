export interface GuideSection {
  heading: string;
  body: string[];
  bullets?: string[];
  callout?: {
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export interface GuideArticle {
  slug: string;
  title: string;
  category: 'Freelance & Finance' | 'Engineering & DevOps';
  readingTime: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  relatedTools: string[];
  sections: GuideSection[];
}

export const GUIDES: GuideArticle[] = [
  {
    slug: 'us-freelance-hourly-rate-guide',
    title: 'How to Price Your US Freelance Rate in 2026 (Including 15.3% Self-Employment Tax)',
    category: 'Freelance & Finance',
    readingTime: '6 min read',
    updatedAt: 'November 2026',
    seoTitle: 'US Freelance Rate Guide 2026: Pricing, Taxes & Utilization | Taprico',
    seoDescription:
      'Step-by-step formula for US freelancers and 1099 contractors to calculate profitable hourly, day, and retainer rates after self-employment taxes, PTO, and overhead.',
    excerpt:
      'Stop dividing your desired salary by 2,080 hours. Learn the exact utilization, overhead, and US FICA math used by six-figure consultants.',
    relatedTools: ['freelance-rate-calculator', 'hourly-to-salary-converter', 'invoice-generator'],
    sections: [
      {
        heading: 'The #1 Pricing Mistake New US Freelancers Make',
        body: [
          'Suppose you earned $120,000 as a salaried W-2 software engineer or designer. When transitioning to independent 1099 consulting, the temptation is to divide $120,000 by 2,080 annual work hours and quote $58–$60/hour.',
          'At $60/hour, you will almost certainly earn 35% to 45% less take-home pay than your old salaried role. Why? Because W-2 employers quietly absorb your employer payroll tax share, paid holidays, health insurance, software licenses, and every hour you spend in unpaid meetings or writing proposals.',
        ],
      },
      {
        heading: 'Step 1: Calculate Your True Annual Billable Hours',
        body: [
          'A full-time calendar has 52 weeks × 40 hours = 2,080 total hours. However, independent consultants rarely bill 40 hours every single week of the year:',
        ],
        bullets: [
          'Subtract 3–4 weeks for vacation, sick days, and US federal holidays (48 working weeks remaining).',
          'Subtract non-billable business time: client discovery calls, invoicing, bookkeeping, marketing, and cold pipeline gaps (typically 25%–35% of your week).',
          'Realistic annual billable hours = 48 weeks × 28 billable hours = 1,344 billable hours per year.',
        ],
      },
      {
        heading: 'Step 2: Add Overhead, Benefits, and the 15.3% Self-Employment Tax',
        body: [
          'Before computing an hourly rate, build your Required Gross Revenue target from the bottom up. On top of your target $120,000 net lifestyle budget, add annual LLC/CPA fees, hardware, SaaS subscriptions (~$4,800/yr), health insurance & Solo 401(k) contributions (~$9,000–$18,000/yr), and federal/state + 15.3% self-employment FICA tax reserves.',
          'When you divide roughly $185,000–$200,000 in required gross revenue by 1,344 billable hours, your true minimum sustainable consulting rate lands around $138–$148/hour—over double the naive 2,080-hour estimate.',
        ],
        callout: {
          title: 'Model Your Exact US Rate in 30 Seconds',
          text: 'Plug your own target net income, weekly billable utilization, monthly overhead, and state tax bracket into our interactive calculator.',
          ctaLabel: 'Open Freelance Rate Calculator →',
          ctaHref: '/tools/freelance-rate-calculator/',
        },
      },
      {
        heading: 'Step 3: Transition From Hourly Rates to Day Rates & Retainers',
        body: [
          'Once you know your floor hourly rate, avoid billing strictly by the tracked hour whenever possible. Experienced US consultants convert their hourly rate into Day Rates (8× hourly) or Weekly Sprints so increasing speed rewards you rather than penalizing efficiency.',
        ],
      },
    ],
  },
  {
    slug: 'json-vs-yaml-kubernetes-apis',
    title: 'JSON vs. YAML: Production Engineering Guide for APIs, Kubernetes & CI/CD',
    category: 'Engineering & DevOps',
    readingTime: '5 min read',
    updatedAt: 'November 2026',
    seoTitle: 'JSON vs YAML: When to Use Each in APIs & Kubernetes | Taprico',
    seoDescription:
      'Practical architectural comparison of JSON vs. YAML covering parsing performance, YAML implicit type pitfalls, Kubernetes specs, and API contracts.',
    excerpt:
      'Why modern engineering teams standardize on JSON for machine-to-machine APIs while reserving YAML for human-edited infrastructure configs.',
    relatedTools: ['json-yaml-formatter', 'diff-checker', 'jwt-decoder'],
    sections: [
      {
        heading: 'Design Philosophy: Strict Transport vs. Human Readability',
        body: [
          'JSON (JavaScript Object Notation) was designed for lightweight, unambiguous data interchange across networks. It intentionally excludes comments, trailing commas, and implicit type magic so parsers stay fast and deterministic across every language.',
          'YAML (YAML Ain’t Markup Language) is actually a superset of JSON optimized for humans editing infrastructure definitions—adding # comments, multi-line strings, and indentation-based nesting.',
        ],
      },
      {
        heading: 'The Infamous YAML Type-Coercion Pitfalls (The "Norway Problem")',
        body: [
          'Unquoted strings in YAML 1.1 parsers can silently coerce into unexpected booleans or base-60 numbers. For example, country code NO (Norway) without quotes parses as boolean false in older parsers, and version numbers like 1.10 can collapse to float 1.1.',
        ],
        bullets: [
          'Always quote environment variable values, port mappings ("8080:80"), and version strings ("3.10") in YAML.',
          'Prefer 2-space indentation and enforce linting in CI before applying Kubernetes or Terraform configs.',
          'Remember that every valid JSON document is technically valid YAML 1.2—making programmatic conversion straightforward.',
        ],
        callout: {
          title: 'Convert & Validate Configs Locally',
          text: 'Need to turn an API JSON payload into Kubernetes YAML or inspect syntax errors on the exact failing line?',
          ctaLabel: 'Open JSON / YAML Formatter →',
          ctaHref: '/tools/json-yaml-formatter/',
        },
      },
    ],
  },
  {
    slug: 'jwt-authentication-security-checklist',
    title: 'JWT Security Checklist: Avoiding alg:none, Weak Secrets & Expiry Bugs',
    category: 'Engineering & DevOps',
    readingTime: '5 min read',
    updatedAt: 'November 2026',
    seoTitle: 'JWT Authentication Security Checklist for Backend Devs | Taprico',
    seoDescription:
      'Production checklist for verifying JSON Web Tokens safely in Node.js, Go, and Python—preventing algorithm confusion, stale tokens, and PII exposure.',
    excerpt:
      'A practical engineering audit list for preventing the most common JSON Web Token vulnerabilities in modern web apps and microservices.',
    relatedTools: ['jwt-decoder', 'base64-encoder-decoder', 'uuid-generator'],
    sections: [
      {
        heading: 'Remember: Signing Is Not Encryption',
        body: [
          'A standard JWT uses JWS (JSON Web Signature). Anyone who intercepts an Authorization: Bearer header can Base64URL-decode the payload in milliseconds. Treat every claim inside a standard JWT as public metadata.',
        ],
      },
      {
        heading: '5 Mandatory Server-Side JWT Checks',
        body: [
          'Before trusting any user ID or role inside a token, confirm your authentication middleware enforces all five rules:',
        ],
        bullets: [
          'Whitelist allowed algorithms explicitly (e.g., algorithms: ["RS256"])—never trust the incoming header alg field blindly.',
          'Reject tokens with alg: "none" at your API gateway or verification helper.',
          'Verify iss (Issuer) and aud (Audience) claims so tokens from a staging tenant cannot access production.',
          'Require an exp timestamp and keep access token lifetimes short (5–15 minutes).',
          'Use high-entropy 256-bit+ secrets for HMAC (HS256) or rotate asymmetric keys via JWKS.',
        ],
        callout: {
          title: 'Inspect & Verify Tokens Without Uploading Secrets',
          text: 'Debug JWT headers, timestamps, and HS256 signatures right inside your browser Web Crypto engine.',
          ctaLabel: 'Open JWT Decoder & Verifier →',
          ctaHref: '/tools/jwt-decoder/',
        },
      },
    ],
  },
  {
    slug: 'us-freelance-invoice-checklist',
    title: 'US Freelance Invoice Requirements: Net 30, W-9, Sales Tax & Getting Paid Faster',
    category: 'Freelance & Finance',
    readingTime: '4 min read',
    updatedAt: 'November 2026',
    seoTitle: 'US Freelance Invoice Checklist: Net 30, W-9 & ACH Guide | Taprico',
    seoDescription:
      'Everything US clients and accounts payable teams need on an invoice—sequential numbering, W-9 tips, Net 15 vs Net 30 terms, ACH details, and PDF best practices.',
    excerpt:
      'Eliminate avoidable accounts-payable delays by formatting your US client invoices correctly the first time.',
    relatedTools: ['invoice-generator', 'freelance-rate-calculator', 'profit-margin-markup-calculator'],
    sections: [
      {
        heading: 'Why Invoices Sit Unpaid in Accounts Payable Queues',
        body: [
          'Enterprise and mid-market US companies route vendor invoices through strict AP workflows. If your invoice lacks a purchase order reference, clear payment terms, or direct ACH routing details, it gets kicked back to the end of the next bi-weekly check run.',
        ],
      },
      {
        heading: 'Essential Elements Every US Business Invoice Needs',
        body: ['Include these items clearly on page one in standard US Letter (8.5 × 11 in) layout:'],
        bullets: [
          'Your legal name or LLC name, mailing address, and business email matching your Form W-9.',
          'Unique sequential invoice number (e.g., INV-2026-008) plus Issue Date and exact Due Date.',
          'Clear payment term label (Due on Receipt, Net 15, or Net 30) and itemized deliverable descriptions.',
          'Direct payment instructions: ACH bank routing/account numbers, Wire info, or a one-click Stripe/Zelle handle.',
        ],
        callout: {
          title: 'Generate a Clean Vector PDF Invoice Now',
          text: 'Build and download an unlimited, watermark-free US Letter PDF invoice with saved company defaults.',
          ctaLabel: 'Open Free Invoice Generator →',
          ctaHref: '/tools/invoice-generator/',
        },
      },
    ],
  },
  {
    slug: '1099-quarterly-estimated-taxes-us-freelancers',
    title: 'US 1099 Quarterly Estimated Taxes: Safe Harbor Rules & 2026 Deadlines',
    category: 'Freelance & Finance',
    readingTime: '6 min read',
    updatedAt: 'November 2026',
    seoTitle: '1099 Quarterly Estimated Taxes 2026: Safe Harbor & Rates | Taprico',
    seoDescription:
      'Avoid IRS underpayment penalties as a US 1099 freelancer or LLC. Learn Form 1040-ES quarterly due dates, 15.3% FICA math, and the 100%/110% safe harbor rule.',
    excerpt:
      'Keep your freelance cashflow predictable with a simple tax-reserve percentage and IRS safe harbor calendar.',
    relatedTools: ['freelance-rate-calculator', 'hourly-to-salary-converter', 'invoice-generator'],
    sections: [
      {
        heading: 'Why W-2 Withholding Mindset Traps New 1099 Contractors',
        body: [
          'Unlike salaried employees whose employers split FICA taxes and remit federal withholding on every bi-weekly paycheck, US independent contractors must pay both halves of Social Security and Medicare (15.3% self-employment tax up to the Social Security wage base) plus federal and state income tax directly via IRS Form 1040-ES.',
          'Whenever you expect to owe $1,000 or more in tax at filing time, the IRS requires four quarterly estimated payments rather than a single April lump sum.',
        ],
      },
      {
        heading: 'Using the IRS Safe Harbor Rule to Avoid Penalties',
        body: [
          'Calculating exact quarter-by-quarter net profit can be painful when client retainer revenue fluctuates. Most US CPAs recommend using the prior-year Safe Harbor benchmark:',
        ],
        bullets: [
          'Pay at least 90% of your current year total tax liability, OR 100% of the total tax shown on your prior-year return (110% if your prior-year AGI exceeded $150,000).',
          'Standard IRS quarterly due dates fall on April 15, June 15, September 15, and January 15 (shifted to the next business day on weekends or federal holidays).',
          'Open a dedicated high-yield business savings account and automatically sweep 28%–32% of every paid client invoice before paying yourself.',
        ],
        callout: {
          title: 'Bake Tax Overhead Directly Into Your Hourly Rate',
          text: 'Model your target take-home salary alongside US self-employment taxes and non-billable weeks.',
          ctaLabel: 'Run Freelance Rate Calculator →',
          ctaHref: '/tools/freelance-rate-calculator/',
        },
      },
    ],
  },
  {
    slug: 'gross-margin-vs-markup-us-agencies-ecommerce',
    title: 'Profit Margin vs. Markup: Pricing Benchmarks for US Agencies & E-Commerce',
    category: 'Freelance & Finance',
    readingTime: '5 min read',
    updatedAt: 'November 2026',
    seoTitle: 'Gross Margin vs Markup Formula & US Benchmarks | Taprico',
    seoDescription:
      'Confusing a 30% markup with a 30% gross margin costs US agencies and Shopify brands thousands per year. Master the exact conversion formulas and Stripe fee math.',
    excerpt:
      'A 50% markup only yields a 33.3% gross margin. Learn how to quote retainers and SKUs without accidentally eroding profit.',
    relatedTools: ['profit-margin-markup-calculator', 'freelance-rate-calculator', 'invoice-generator'],
    sections: [
      {
        heading: 'The $100 Cost Mistake That Shrinks Agency & Store Profits',
        body: [
          'Markup measures how much you add on top of cost (`(Price - Cost) / Cost`), whereas Gross Margin measures the share of total revenue you keep (`(Price - Cost) / Price`). Because margin uses the larger selling price as its denominator, margin percentage is always lower than markup percentage.',
          'If a product or subcontractor deliverable costs $100 and you apply a 25% markup ($125 price), your actual gross margin is only 20%—leaving almost no room once payment processing fees (2.9% + $0.30 on Stripe/Shopify), ad spend, and refunds hit.',
        ],
      },
      {
        heading: 'Healthy Target Margins Across US Business Models',
        body: ['Benchmark your unit economics against typical US operating bands before locking pricing:'],
        bullets: [
          'US Digital Agencies & Consultancies: Target 50%–65% gross delivery margin after contractor labor and software licenses.',
          'DTC E-Commerce & Shopify Brands: Target 55%–70% landed gross margin to absorb Meta/Google acquisition costs and free shipping.',
          'B2B SaaS Products: Mature cloud software typically runs at 75%–85% gross margin after hosting, AI inference, and support COGS.',
        ],
        callout: {
          title: 'Test Margin, Markup & Payment Fees Instantly',
          text: 'Calculate exact selling prices from target margin percentages—including Stripe/PayPal processing drag.',
          ctaLabel: 'Open Margin & Markup Calculator →',
          ctaHref: '/tools/profit-margin-markup-calculator/',
        },
      },
    ],
  },
  {
    slug: 'postgresql-uuid-v7-vs-uuid-v4-performance',
    title: 'PostgreSQL UUID v7 vs. UUID v4: B-Tree Locality, Index Bloat & Migration Tips',
    category: 'Engineering & DevOps',
    readingTime: '5 min read',
    updatedAt: 'November 2026',
    seoTitle: 'UUID v7 vs UUID v4 in PostgreSQL: Performance & B-Tree Guide | Taprico',
    seoDescription:
      'Understand why random UUID v4 primary keys fragment PostgreSQL B-Tree indexes at scale and how time-ordered RFC 9562 UUID v7 fixes write amplification.',
    excerpt:
      'Keep globally unique distributed primary keys without destroying database buffer cache hit ratios.',
    relatedTools: ['uuid-generator', 'sql-formatter', 'json-yaml-formatter'],
    sections: [
      {
        heading: 'Why Random UUID v4 Hurts High-Write Relational Tables',
        body: [
          'Standard UUID v4 places 122 cryptographically random bits across the identifier. While random IDs prevent enumeration and eliminate coordination across microservices, inserting random keys into a clustered or B-Tree index scatters writes across random memory pages.',
          'Once a high-churn Postgres table outgrows shared_buffers, random UUID v4 inserts trigger constant page splits, extra WAL write amplification, and degraded cache locality compared to monotonic IDs.',
        ],
      },
      {
        heading: 'How RFC 9562 UUID v7 Solves Index Fragmentation',
        body: [
          'RFC 9562 UUID v7 begins with a 48-bit big-endian Unix timestamp in milliseconds followed by sub-millisecond monotonic/random entropy:',
        ],
        bullets: [
          'New inserts append sequentially to the rightmost B-Tree leaf pages—dramatically lowering IOPS and index bloat.',
          'Retains the exact 128-bit UUID wire format (8-4-4-4-12 hex string), requiring zero schema type changes in PostgreSQL uuid columns.',
          'Natural lexicographical sorting by creation time improves cursor pagination and multi-region ETL watermarks.',
        ],
        callout: {
          title: 'Generate RFC 9562 UUID v7 & v4 Batches Locally',
          text: 'Create, inspect timestamp bits, or export UUID v7/v4 test rows as SQL INSERTs, JSON, or CSV.',
          ctaLabel: 'Open UUID v4 / v7 Generator →',
          ctaHref: '/tools/uuid-generator/',
        },
      },
    ],
  },
  {
    slug: 'github-actions-aws-cron-scheduling-guide',
    title: 'GitHub Actions & AWS EventBridge Cron Guide: Avoiding UTC & DST Drift',
    category: 'Engineering & DevOps',
    readingTime: '5 min read',
    updatedAt: 'November 2026',
    seoTitle: 'GitHub Actions & AWS Cron Guide: UTC, DST & Syntax | Taprico',
    seoDescription:
      'Master 5-field POSIX cron vs 6-field AWS EventBridge schedules, handle US Daylight Saving Time shifts cleanly, and prevent overlapping batch jobs.',
    excerpt:
      'Eliminate missed midnight jobs and unexpected 1-hour Daylight Saving Time shifts in cloud schedulers.',
    relatedTools: ['cron-expression-generator', 'json-yaml-formatter', 'regex-tester'],
    sections: [
      {
        heading: '5-Field POSIX Cron vs. 6-Field AWS EventBridge Syntax',
        body: [
          'Linux crontab, GitHub Actions, and Kubernetes CronJobs all parse the standard 5-field expression: Minute, Hour, Day-of-Month, Month, and Day-of-Week. By contrast, AWS EventBridge requires 6 fields (adding a Year field at the end) and strictly forbids putting * in both Day-of-Month and Day-of-Week simultaneously—one of them must be ?.',
        ],
      },
      {
        heading: 'Handling US Eastern & Pacific Daylight Saving Time Shifts',
        body: [
          'Because GitHub Actions workflows and default AWS EventBridge rules evaluate schedules in UTC, a report configured for 0 14 * * 1-5 runs at 9:00 AM EST during winter—but shifts to 10:00 AM EDT between March and November:',
        ],
        bullets: [
          'On Kubernetes v1.27+, explicitly declare spec.timeZone: "America/New_York" on CronJob manifests when schedules track US business hours.',
          'On AWS EventBridge Scheduler, set ScheduleExpressionTimezone to "America/New_York" rather than adjusting UTC offsets twice a year.',
          'For critical billing or ETL scripts, combine concurrency guards or distributed locks so delayed cloud runners never execute duplicate runs concurrently.',
        ],
        callout: {
          title: 'Preview Exact US Eastern, Pacific & UTC Next Runs',
          text: 'Validate any 5-field cron expression visually and check its next 10 execution timestamps before deploying.',
          ctaLabel: 'Open Interactive Cron Studio →',
          ctaHref: '/tools/cron-expression-generator/',
        },
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
