export const SITE = {
  name: 'Taprico',
  domain: 'taprico.com',
  url: 'https://taprico.com',
  tagline: 'Fast, Local-First Workbench for Developers & Freelancers',
  description:
    'Free browser-based developer tools & US freelance calculators: JSON/YAML, JWT verify, Cron tester, PDF invoices & 1099 rates—zero server uploads.',
  contactEmail: 'hello@taprico.com',
  locale: 'en-US',
  copyrightYear: 2026,
  defaultTheme: 'dark' as 'dark' | 'light',
  social: {
    github: 'https://github.com/GIT-HUB-VAIBHAV/taprico',
    twitter: '@tapricotools',
  },
} as const;

export const NAV_LINKS = [
  { label: 'All Tools', href: '/tools/' },
  { label: 'Developer Studio', href: '/tools/#developer' },
  { label: 'Freelance Finance', href: '/tools/#freelance' },
  { label: 'Playbooks', href: '/guides/' },
  { label: 'About', href: '/about/' },
] as const;
