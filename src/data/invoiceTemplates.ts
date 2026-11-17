import type { InvoiceTemplatePreset } from '../components/tools/InvoiceGenerator';

export interface InvoiceTemplateItem {
  slug: string;
  role: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  typicalTerms: string;
  billingTips: string[];
  preset: InvoiceTemplatePreset;
}

export const INVOICE_TEMPLATES: InvoiceTemplateItem[] = [
  {
    slug: 'web-developer',
    role: 'Freelance Web Developer',
    title: 'Free Freelance Web Developer Invoice Template (US Letter PDF)',
    seoTitle: 'Freelance Web Developer Invoice Template (PDF) | Taprico',
    seoDescription:
      'Create and download a watermark-free US Letter PDF invoice for freelance web developers—pre-filled with sprint, API integration, and Net 15/30 billing fields.',
    typicalTerms: 'Net 15 or 50% Upfront / 50% Launch',
    billingTips: [
      'Separate fixed-scope discovery/architecture milestones from hourly bug-fix sprints.',
      'Include staging environment sign-off date and Form W-9 reference for US agency clients.',
      'List ACH routing details directly in payment instructions to skip 3% credit card fees.',
    ],
    preset: {
      accentColor: '#4f46e5',
      terms: 'net15',
      fromName: 'Apex Web Studio LLC',
      toName: 'Harborview Retail Group',
      poNumber: 'PO-WEB-209',
      items: [
        { description: 'Next.js & Tailwind Frontend Architecture Sprint', quantity: 28, rate: 135 },
        { description: 'Headless CMS & Checkout API Integration', quantity: 14, rate: 135 },
        { description: 'Core Web Vitals Optimization & Lighthouse Audit', quantity: 1, rate: 750 },
      ],
    },
  },
  {
    slug: 'software-engineer',
    role: 'Independent Software Engineer (1099 / LLC)',
    title: 'Free 1099 Software Engineer Invoice Template (US Letter PDF)',
    seoTitle: '1099 Software Engineer Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Clean US 1099 software contractor invoice template with weekly/bi-weekly engineering hours, PO number, EIN/W-9 line, and instant vector PDF export.',
    typicalTerms: 'Net 30 (Enterprise AP) or Net 15',
    billingTips: [
      'Match the exact legal entity name on your IRS Form W-9 to avoid enterprise accounts payable holds.',
      'Reference sprint cycle dates or Jira/Linear milestone IDs directly inside line-item descriptions.',
      'Bill bi-weekly on longer 1099 retainers to smooth cashflow across quarterly tax dates.',
    ],
    preset: {
      accentColor: '#0f172a',
      terms: 'net30',
      fromName: 'Kestrel Systems Consulting LLC',
      toName: 'Vanguard Cloud Corp.',
      poNumber: 'MSA-2026-114',
      items: [
        { description: 'Backend Distributed Systems Engineering (Nov 1–Nov 15)', quantity: 64, rate: 165 },
        { description: 'PostgreSQL Query Tuning & Zero-Downtime Migration', quantity: 12, rate: 165 },
      ],
    },
  },
  {
    slug: 'marketing-consultant',
    role: 'Digital Marketing Consultant',
    title: 'Free Marketing Consultant Invoice Template (US Letter PDF)',
    seoTitle: 'Marketing Consultant Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Generate a clean marketing agency or growth consultant PDF invoice—retainer fee, paid search management, landing page CRO, and Net 15 payment terms.',
    typicalTerms: 'Monthly Retainer Pre-Paid (Net 15)',
    billingTips: [
      'Keep media ad spend billed directly to the client credit card so you do not inflate 1099 gross revenue.',
      'Itemize monthly retainer deliverables clearly (paid search, CRO testing, attribution reporting).',
      'Send monthly retainer invoices on the 1st of the month due Net 15.',
    ],
    preset: {
      accentColor: '#059669',
      terms: 'net15',
      fromName: 'Signal Growth Advisory LLC',
      toName: 'Brightleaf Health Co.',
      poNumber: 'MKT-Q4-08',
      items: [
        { description: 'Monthly Paid Acquisition & Funnel Retainer', quantity: 1, rate: 3500 },
        { description: 'Landing Page A/B Copy & CRO Audit', quantity: 8, rate: 150 },
        { description: 'GA4 / Server-Side Conversion Tracking Setup', quantity: 1, rate: 650 },
      ],
    },
  },
  {
    slug: 'graphic-designer',
    role: 'Freelance Graphic Designer',
    title: 'Free Freelance Graphic Designer Invoice Template (PDF)',
    seoTitle: 'Graphic Designer Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Download a crisp PDF invoice for brand identity, UI/UX design, packaging, and print deliverables with revision clauses and US Letter formatting.',
    typicalTerms: '50% Deposit / 50% Before Final Files',
    billingTips: [
      'Explicitly state how many revision rounds are included and bill extra rounds hourly.',
      'Deliver final vector/source files only after final invoice settlement clears.',
      'Separate third-party font/stock photography licensing pass-through costs.',
    ],
    preset: {
      accentColor: '#e11d48',
      terms: 'net15',
      fromName: 'Studio Forma Design LLC',
      toName: 'Copperline Roasters Inc.',
      poNumber: 'BRAND-204',
      items: [
        { description: 'Brand Identity System (Logo Suite, Typography, Guidelines)', quantity: 1, rate: 2800 },
        { description: 'Packaging Di-Lines & Print-Ready Artwork (3 SKUs)', quantity: 3, rate: 450 },
        { description: 'Commercial Font License Pass-Through', quantity: 1, rate: 220 },
      ],
    },
  },
  {
    slug: 'video-editor',
    role: 'Freelance Video Editor',
    title: 'Free Freelance Video Editor Invoice Template (US Letter PDF)',
    seoTitle: 'Freelance Video Editor Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Clean PDF invoice template for YouTube, commercial, and SaaS product video editors—itemized by edit days, motion graphics, color grading, and rush fees.',
    typicalTerms: 'Net 15 or Due on Final Export',
    billingTips: [
      'Price short-form social cutdowns and aspect-ratio resizes (9:16, 1:1) as separate line items.',
      'Include a 25%–50% rush-turnaround fee line item when deadlines are under 48 hours.',
      'Specify audio/music licensing responsibility clearly in the invoice notes.',
    ],
    preset: {
      accentColor: '#0284c7',
      terms: 'net15',
      fromName: 'Framecut Post Studio',
      toName: 'Launchpad SaaS Media',
      poNumber: 'VID-2026-19',
      items: [
        { description: 'Product Launch Hero Video Edit (4K Master, 2m 15s)', quantity: 1, rate: 1650 },
        { description: 'Motion Graphics Title Package & Lower Thirds', quantity: 6, rate: 120 },
        { description: 'Vertical 9:16 Social Cutdowns (Reels / Shorts)', quantity: 4, rate: 175 },
      ],
    },
  },
  {
    slug: 'seo-consultant',
    role: 'SEO Consultant',
    title: 'Free SEO Consultant Invoice Template (US Letter PDF)',
    seoTitle: 'SEO Consultant Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Generate a professional SEO consultant or technical SEO audit invoice PDF—keyword research, schema markup, content briefs, and monthly retainers.',
    typicalTerms: 'Monthly Retainer (Net 15)',
    billingTips: [
      'Tie monthly retainers to concrete deliverables (technical crawl audits, briefs, internal linking sprints).',
      'Separate one-time migration/technical audits from recurring monthly optimization work.',
      'Include reporting cadence dates so client finance teams approve renewals quickly.',
    ],
    preset: {
      accentColor: '#059669',
      terms: 'net15',
      fromName: 'Rankcraft Organic LLC',
      toName: 'Summit Home Services',
      poNumber: 'SEO-RET-11',
      items: [
        { description: 'Technical SEO & Core Web Vitals Remediation Audit', quantity: 1, rate: 1800 },
        { description: 'Monthly Content Briefs & On-Page Optimization (8 Pages)', quantity: 8, rate: 225 },
      ],
    },
  },
  {
    slug: 'copywriter',
    role: 'B2B Copywriter & Content Writer',
    title: 'Free Freelance Copywriter Invoice Template (US Letter PDF)',
    seoTitle: 'Freelance Copywriter Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Create a clean PDF invoice for freelance writers, SaaS copywriters, whitepaper authors, and email sequence strategists with zero watermarks.',
    typicalTerms: 'Net 15 or Due on Draft Approval',
    billingTips: [
      'Price landing pages and lifecycle email flows by project deliverable rather than per word.',
      'Reference approved Google Doc titles or campaign names in line-item descriptions.',
      'Use Net 15 terms for smaller marketing teams so invoices do not sit 45 days.',
    ],
    preset: {
      accentColor: '#4f46e5',
      terms: 'net15',
      fromName: 'Clearline Editorial LLC',
      toName: 'Metronome Data Inc.',
      poNumber: 'COPY-882',
      items: [
        { description: 'Homepage & Pricing Page Conversion Copy Rewrite', quantity: 1, rate: 2200 },
        { description: 'B2B Customer Case Studies (1,500 words + Interviews)', quantity: 2, rate: 850 },
      ],
    },
  },
  {
    slug: 'virtual-assistant',
    role: 'Executive Virtual Assistant',
    title: 'Free Virtual Assistant Invoice Template (US Letter PDF)',
    seoTitle: 'Virtual Assistant Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Send crisp bi-weekly or monthly virtual assistant PDF invoices—inbox management, scheduling, CRM hygiene, and expense reconciliation.',
    typicalTerms: 'Due on Receipt or Bi-Weekly Net 7',
    billingTips: [
      'List weekly hour summaries or fixed monthly block-hour package tiers clearly.',
      'Set invoice due dates to Due on Receipt or Net 7 for fast ACH/Zelle payout.',
      'Track out-of-scope executive travel or software subscriptions separately for reimbursement.',
    ],
    preset: {
      accentColor: '#0284c7',
      terms: 'receipt',
      fromName: 'Elena Vance Operations LLC',
      toName: 'Oakridge Ventures',
      poNumber: 'OPS-NOV-02',
      items: [
        { description: 'Executive Calendar, Inbox & Travel Coordination (40h block)', quantity: 40, rate: 48 },
        { description: 'HubSpot CRM Pipeline Cleanup & Weekly Reporting', quantity: 8, rate: 48 },
      ],
    },
  },
  {
    slug: 'bookkeeper',
    role: 'Freelance Bookkeeper',
    title: 'Free Bookkeeper & Accounting Invoice Template (PDF)',
    seoTitle: 'Bookkeeper Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Download a clean PDF invoice for freelance bookkeepers and QuickBooks ProAdvisors—monthly reconciliation, AP/AR categorization, and payroll coordination.',
    typicalTerms: 'Monthly Auto-Billing (Net 15)',
    billingTips: [
      'Bill catch-up/historical cleanup months at a separate one-time flat rate before starting monthly closes.',
      'Specify accounting period covered (e.g., October 2026 Monthly Close) on every line item.',
      'Keep client QuickBooks/Xero software subscriptions billed directly to the client when possible.',
    ],
    preset: {
      accentColor: '#0f172a',
      terms: 'net15',
      fromName: 'Ledgerline Bookkeeping LLC',
      toName: 'Bluegrass HVAC Solutions',
      poNumber: 'BK-2026-10',
      items: [
        { description: 'Monthly Bank & Credit Card Reconciliation (3 Accounts)', quantity: 1, rate: 650 },
        { description: 'Accounts Payable Coding & Monthly P&L Close Package', quantity: 1, rate: 450 },
        { description: '1099 Vendor W-9 Tracking & Compliance Prep', quantity: 1, rate: 250 },
      ],
    },
  },
  {
    slug: 'fractional-cfo',
    role: 'Fractional CFO & Finance Advisor',
    title: 'Free Fractional CFO Invoice Template (US Letter PDF)',
    seoTitle: 'Fractional CFO Invoice Template (Free PDF) | Taprico',
    seoDescription:
      'Executive-grade PDF invoice template for fractional CFOs and financial consultants—monthly board reporting, 13-week cashflow modeling, and fundraising prep.',
    typicalTerms: 'Monthly Retainer (Net 15 / ACH)',
    billingTips: [
      'Include bank ACH routing and wire instructions prominently for larger $4k–$10k monthly retainers.',
      'Break out recurring board-pack reporting from specialized M&A or Series A financial modeling projects.',
      'Reference MSA or engagement letter date cleanly in the footer notes.',
    ],
    preset: {
      accentColor: '#0f172a',
      terms: 'net15',
      fromName: 'Alder Creek CFO Partners LLC',
      toName: 'Helios Robotics Corp.',
      poNumber: 'ADV-2026-11',
      items: [
        { description: 'Monthly Fractional CFO Retainer & Board Package Review', quantity: 1, rate: 5500 },
        { description: '13-Week Rolling Cashflow & Runway Sensitivity Model', quantity: 1, rate: 1800 },
      ],
    },
  },
];
