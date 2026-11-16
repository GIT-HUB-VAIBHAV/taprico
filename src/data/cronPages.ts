export interface CronPageItem {
  slug: string;
  expr: string;
  awsExpr: string;
  title: string;
  humanLabel: string;
  seoTitle: string;
  seoDescription: string;
  useCases: string[];
  notes: string;
}

export const CRON_PAGES: CronPageItem[] = [
  {
    slug: 'every-minute',
    expr: '* * * * *',
    awsExpr: 'cron(* * * * ? *)',
    title: 'Cron Expression for Every Minute (* * * * *)',
    humanLabel: 'Every 1 minute (60 times/hour)',
    seoTitle: 'Cron Every Minute (* * * * *) — Crontab, GitHub & K8s | Taprico',
    seoDescription:
      'Use * * * * * to run a cron job every minute. Copy POSIX crontab, Kubernetes CronJob, and AWS EventBridge syntax plus overlap prevention tips.',
    useCases: [
      'Local worker queue polling and heartbeat health checks.',
      'Lightweight metrics scraping when sub-minute systemd timers are unavailable.',
      'Short-lived cache invalidation or webhook retry sweeps.',
    ],
    notes:
      'Always wrap 1-minute jobs with flock or a distributed lock. Note that GitHub Actions enforces a 5-minute minimum interval on schedule triggers.',
  },
  {
    slug: 'every-5-minutes',
    expr: '*/5 * * * *',
    awsExpr: 'cron(0/5 * * * ? *)',
    title: 'Cron Expression for Every 5 Minutes (*/5 * * * *)',
    humanLabel: 'Every 5 minutes (at :00, :05, :10...)',
    seoTitle: 'Cron Every 5 Minutes (*/5 * * * *) — Examples & Tester | Taprico',
    seoDescription:
      'Copy */5 * * * * to schedule tasks every 5 minutes across Linux crontab, GitHub Actions, Kubernetes, and AWS EventBridge with next-run timezone previews.',
    useCases: [
      'GitHub Actions scheduled workflows (smallest officially supported interval).',
      'SaaS billing webhook reconciliation and payment status polling.',
      'Uptime monitoring, log aggregation, and Redis queue draining.',
    ],
    notes:
      'GitHub Actions drops or delays */5 * * * * runs during peak UTC top-of-hour minutes—avoid assuming exact second-level precision on shared runners.',
  },
  {
    slug: 'every-15-minutes',
    expr: '*/15 * * * *',
    awsExpr: 'cron(0/15 * * * ? *)',
    title: 'Cron Expression for Every 15 Minutes (*/15 * * * *)',
    humanLabel: 'Every 15 minutes (:00, :15, :30, :45)',
    seoTitle: 'Cron Every 15 Minutes (*/15 * * * *) — Crontab & K8s | Taprico',
    seoDescription:
      'Schedule cron jobs every 15 minutes with */15 * * * *. Includes next execution times in US timezones, AWS EventBridge syntax, and Kubernetes YAML.',
    useCases: [
      'Incremental ETL data syncs from Stripe, HubSpot, or Shopify into Postgres.',
      'Refreshing materialized database views without overwhelming primary replicas.',
      'Sending batched customer digest notifications.',
    ],
    notes:
      'Combine with a weekday business-hours range (*/15 9-17 * * 1-5) when syncing US financial or CRM APIs only during office hours.',
  },
  {
    slug: 'every-30-minutes',
    expr: '*/30 * * * *',
    awsExpr: 'cron(0,30 * * * ? *)',
    title: 'Cron Expression for Every 30 Minutes (*/30 * * * *)',
    humanLabel: 'Every 30 minutes (:00 and :30 past each hour)',
    seoTitle: 'Cron Every 30 Minutes (*/30 * * * *) — Examples | Taprico',
    seoDescription:
      'Run scheduled tasks twice an hour at :00 and :30 with */30 * * * *. Copy Linux crontab, GitHub Actions, and AWS EventBridge expressions.',
    useCases: [
      'Half-hourly analytics warehouse rollups and search index updates.',
      'Renewing short-lived OAuth provider tokens ahead of expiration.',
      'Inventory and pricing feed synchronization for US e-commerce stores.',
    ],
    notes:
      'To reduce load spikes at :00 and :30 across fleet nodes, shift the minute field to an offset like 7,37 * * * *.',
  },
  {
    slug: 'every-hour',
    expr: '0 * * * *',
    awsExpr: 'cron(0 * * * ? *)',
    title: 'Cron Expression for Every Hour (0 * * * *)',
    humanLabel: 'Once every hour at minute 0',
    seoTitle: 'Cron Every Hour (0 * * * *) — Hourly Schedule Guide | Taprico',
    seoDescription:
      'Use 0 * * * * (or @hourly) to execute scripts once every hour. Includes jitter tips, GitHub Actions YAML, Kubernetes CronJob, and AWS syntax.',
    useCases: [
      'Hourly database snapshots and S3 cold-tier backups.',
      'Generating hourly usage billing metrics for SaaS metered plans.',
      'Clearing expired session rows and temporary upload artifacts.',
    ],
    notes:
      'Never use * * * * * when you want hourly—putting * in the minute field triggers 60 times an hour! Always set minute to 0 (or e.g. 17 to avoid top-of-hour API thundering herds).',
  },
  {
    slug: 'every-6-hours',
    expr: '0 */6 * * *',
    awsExpr: 'cron(0 */6 * * ? *)',
    title: 'Cron Expression for Every 6 Hours (0 */6 * * *)',
    humanLabel: '4 times daily at 00:00, 06:00, 12:00, 18:00',
    seoTitle: 'Cron Every 6 Hours (0 */6 * * *) — Crontab & Cloud | Taprico',
    seoDescription:
      'Run scripts four times a day every 6 hours using 0 */6 * * *. Inspect exact US Eastern, Pacific, and UTC fire times with live examples.',
    useCases: [
      'Periodic SSL certificate renewal checks (Certbot / ACME).',
      'Four-times-daily sitemap regeneration and CDN cache warming.',
      'Automated security vulnerability scans in CI/CD pipelines.',
    ],
    notes:
      'If your servers operate in UTC, 0 */6 * * * fires at 00:00, 06:00, 12:00, and 18:00 UTC—equivalent to 7:00 PM, 1:00 AM, 7:00 AM, and 1:00 PM EST.',
  },
  {
    slug: 'every-day-at-midnight',
    expr: '0 0 * * *',
    awsExpr: 'cron(0 0 * * ? *)',
    title: 'Cron Expression for Every Day at Midnight (0 0 * * *)',
    humanLabel: 'Daily at 12:00 AM (00:00)',
    seoTitle: 'Cron Daily at Midnight (0 0 * * *) — Crontab & UTC Guide | Taprico',
    seoDescription:
      'Schedule a daily midnight job with 0 0 * * * (or @daily). Preview UTC vs US Eastern midnight shifts and copy GitHub Actions or K8s YAML.',
    useCases: [
      'Daily PostgreSQL pg_dump backups and log rotation.',
      'Resetting daily free-tier API rate-limit quotas at midnight.',
      'End-of-day Stripe payout and ledger reconciliation jobs.',
    ],
    notes:
      'Watch out for cloud defaults: GitHub Actions, AWS EventBridge, and Kubernetes default to UTC unless timeZone is explicitly set—0 0 * * * UTC is 7:00 PM EST / 4:00 PM PST.',
  },
  {
    slug: 'every-day-at-9am',
    expr: '0 9 * * *',
    awsExpr: 'cron(0 9 * * ? *)',
    title: 'Cron Expression for Every Day at 9:00 AM (0 9 * * *)',
    humanLabel: 'Daily at 9:00 AM (09:00)',
    seoTitle: 'Cron Daily at 9 AM (0 9 * * *) — US Business Schedule | Taprico',
    seoDescription:
      'Run daily reports and notifications at 9:00 AM using 0 9 * * *. Convert 9 AM US Eastern to UTC for GitHub Actions and Kubernetes CronJobs.',
    useCases: [
      'Delivering daily KPI Slack digests to US engineering and revenue teams.',
      'Sending automated invoice payment reminders for Net 30 accounts.',
      'Morning CI regression and synthetic checkout checks.',
    ],
    notes:
      'For weekdays only (Mon–Fri at 9 AM), switch the 5th field from * to 1-5: 0 9 * * 1-5.',
  },
  {
    slug: 'every-monday',
    expr: '0 9 * * 1',
    awsExpr: 'cron(0 9 ? * MON *)',
    title: 'Cron Expression for Every Monday at 9:00 AM (0 9 * * 1)',
    humanLabel: 'Weekly on Monday at 9:00 AM',
    seoTitle: 'Cron Every Monday (0 9 * * 1) — Weekly Job Examples | Taprico',
    seoDescription:
      'Schedule weekly Monday tasks with 0 9 * * 1. Copy crontab, GitHub Actions, Kubernetes, and AWS EventBridge syntax with weekday numbering tips.',
    useCases: [
      'Weekly sprint metrics summaries and customer MRR health reports.',
      'Automated Monday morning dependency updates (Dependabot / npm audit).',
      'Weekly database vacuuming and stale staging environment cleanup.',
    ],
    notes:
      'Remember POSIX weekday numbering: 0 (or 7) is Sunday, 1 is Monday, and 5 is Friday. In AWS EventBridge, Sunday is 1 and Monday is 2 unless using MON.',
  },
  {
    slug: 'first-day-of-every-month',
    expr: '0 0 1 * *',
    awsExpr: 'cron(0 0 1 * ? *)',
    title: 'Cron Expression for the 1st Day of Every Month (0 0 1 * *)',
    humanLabel: 'Monthly on day 1 at 00:00 (Midnight)',
    seoTitle: 'Cron 1st of Every Month (0 0 1 * *) — Billing & Audit | Taprico',
    seoDescription:
      'Trigger monthly billing, invoice generation, or archive tasks on the 1st of every month with 0 0 1 * *. Tested across UTC and US timezones.',
    useCases: [
      'Generating monthly client retainer PDF invoices on the 1st.',
      'Monthly AWS/Cloud cost exports and enterprise audit archiving.',
      'Rotating monthly partitioning tables in high-volume PostgreSQL databases.',
    ],
    notes:
      'If you schedule monthly jobs on day 29, 30, or 31, shorter months like February will skip execution completely—day 1 or day 1–28 is safest.',
  },
];
