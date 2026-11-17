export type ToolCategory = 'developer' | 'freelance';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolTechSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ToolDefinition {
  slug: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  categoryLabel: string;
  badge: string;
  iconName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  highlights: { title: string; detail: string }[];
  howToUse: string[];
  technicalGuide: ToolTechSection[];
  useCases: string[];
  faqs: ToolFaq[];
  relatedSlugs: string[];
  featuredOnHome?: boolean;
}

export const TOOLS: ToolDefinition[] = [
  // =========================================================================
  // DEVELOPER TOOLS (8)
  // =========================================================================
  {
    slug: 'json-yaml-formatter',
    name: 'JSON & YAML Formatter, Validator & Converter',
    shortName: 'JSON / YAML Formatter',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'JSON ↔ YAML',
    iconName: 'Braces',
    tagline:
      'Format, validate, minify, inspect JSON trees, and convert cleanly between JSON and YAML inside your browser.',
    seoTitle: 'JSON & YAML Formatter, Validator & Converter | Taprico',
    seoDescription:
      'Free client-side JSON and YAML formatter, validator, minifier, and tree viewer. Convert JSON and YAML locally with line-level error reporting.',
    keywords: [
      'json formatter',
      'yaml formatter',
      'json to yaml converter',
      'yaml to json',
      'json validator online',
      'kubernetes yaml validator',
    ],
    highlights: [
      {
        title: 'Bidirectional JSON ↔ YAML',
        detail: 'Switch cleanly between JSON formatting, compact minification, and Kubernetes-ready YAML output.',
      },
      {
        title: 'Exact Line & Column Diagnostics',
        detail: 'Syntax errors pinpoint the exact failing line, column, and unexpected token without guesswork.',
      },
      {
        title: 'Interactive Tree Path Explorer',
        detail: 'Expand nested API payloads and click any node to copy its exact dot/bracket JSON path.',
      },
    ],
    howToUse: [
      'Paste raw JSON or YAML into the left editor pane, or load one of the built-in Kubernetes, Stripe Webhook, or package.json presets.',
      'Select your operation mode in the studio toolbar: Format JSON, Minify JSON, JSON to YAML, YAML to JSON, or Tree Inspector.',
      'Choose indentation width (2 spaces, 4 spaces, or Tabs) and optionally sort keys alphabetically for cleaner Git diffs.',
      'Copy the transformed payload in one click or export it as a .json / .yaml file directly from your browser.',
    ],
    technicalGuide: [
      {
        heading: 'Why Local-First Formatting Matters for Production Configs',
        paragraphs: [
          'Engineering teams frequently paste API responses, webhook payloads, Helm values, and IAM policies into online formatters. Any tool that posts your payload to a remote API exposes customer PII, internal hostnames, or staging tokens to third-party logs.',
          'Taprico executes strict JSON parsing and js-yaml serialization 100% locally inside your browser JavaScript runtime. Your Network tab remains silent from the moment the page finishes loading.',
        ],
      },
      {
        heading: 'JSON vs. YAML: Practical Rules for US DevOps & Backend Teams',
        paragraphs: [
          'JSON excels at machine-to-machine REST and webhook contracts because of its unambiguous grammar and native browser parsing. YAML shines in infrastructure-as-code manifests such as Kubernetes, GitHub Actions, Docker Compose, and Ansible where comments and human scannability reduce misconfigurations.',
        ],
        bullets: [
          'Never mix tabs and spaces in YAML indentation—use 2-space indents consistently.',
          'Quote string values like "on", "off", "yes", "no", and "1.0" in YAML so parsers do not coerce them into booleans or floats.',
          'Sort object keys before diffing large JSON configuration snapshots to minimize noisy PR lines.',
        ],
      },
    ],
    useCases: [
      'Prettifying minified REST or GraphQL API logs during incident triage',
      'Converting OpenAPI or Terraform JSON fixtures into readable YAML manifests',
      'Validating GitHub Actions workflows and Kubernetes Deployment specs before pushing',
      'Inspecting nested JSON payloads and copying deep property paths for TypeScript tests',
    ],
    faqs: [
      {
        question: 'Does Taprico send my JSON or YAML data to a backend server?',
        answer:
          'No. All parsing, formatting, validation, and JSON-to-YAML conversion runs completely inside your local browser memory using JavaScript. Nothing is uploaded, stored, or logged.',
      },
      {
        question: 'Can I convert multi-line YAML files back into valid JSON?',
        answer:
          'Yes. Select "YAML → JSON" in the mode switcher to parse standard YAML 1.2 documents into strict, syntax-checked JSON.',
      },
      {
        question: 'Why does sorting JSON keys help in pull requests?',
        answer:
          'Sorting keys alphabetically produces deterministic output across environments, making code reviews and diff checks cleaner when comparing configuration files.',
      },
      {
        question: 'What happens if my JSON has trailing commas or single quotes?',
        answer:
          'Strict JSON (RFC 8259) forbids trailing commas and single-quoted strings. Our validator pinpoints the exact line and character where the parser encountered invalid syntax so you can fix it immediately.',
      },
    ],
    relatedSlugs: ['jwt-decoder', 'diff-checker', 'sql-formatter'],
    featuredOnHome: true,
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder, Claims Inspector & Signature Verifier',
    shortName: 'JWT Decoder',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'AUTH / OIDC',
    iconName: 'ShieldCheck',
    tagline:
      'Decode JSON Web Tokens, audit RFC 7519 claims, track live expiration timers, and verify HMAC signatures via Web Crypto.',
    seoTitle: 'JWT Decoder & Signature Verifier (Client-Side) | Taprico',
    seoDescription:
      'Decode JWT headers and payloads, inspect exp/iat/nbf timestamps, spot security issues like alg:none, and verify HS256/HS384/HS512 signatures locally.',
    keywords: [
      'jwt decoder',
      'decode json web token',
      'jwt signature verifier',
      'hs256 verify online',
      'oidc id token inspector',
    ],
    highlights: [
      {
        title: 'Live Expiration Countdown',
        detail: 'Converts Unix epoch exp, iat, and nbf claims into US Eastern, Pacific, and UTC dates with real-time ticking status.',
      },
      {
        title: 'Client-Side HMAC Verification',
        detail: 'Verify HS256, HS384, and HS512 signatures natively with your browser SubtleCrypto engine—no secret ever leaves your machine.',
      },
      {
        title: 'Automated Security Warnings',
        detail: 'Flags missing exp claims, insecure alg: none headers, and overly long token lifetimes automatically.',
      },
    ],
    howToUse: [
      'Paste an encoded JWT (header.payload.signature) or select one of the sample tokens (Valid HS256, Auth0 RS256, or Expired Token).',
      'Inspect the color-coded token anatomy bar and decoded Header & Payload JSON objects side by side.',
      'Hover or read the Claims Table to translate standard fields like sub, aud, iss, iat, nbf, and exp into local timestamps.',
      'For HMAC-signed tokens (HS256/384/512), enter your signing secret in the Signature Verifier panel to cryptographically validate authenticity.',
    ],
    technicalGuide: [
      {
        heading: 'Anatomy of a JSON Web Token (RFC 7519)',
        paragraphs: [
          'A standard JWS token consists of three Base64URL-encoded segments separated by dots: Header, Payload, and Signature. Because the header and payload are merely Base64URL-encoded—not encrypted—anyone holding a token can read its claims.',
          'Never store passwords, Social Security numbers, credit card details, or confidential API keys inside unencrypted JWT claims. Treat JWT payloads as tamper-evident, not secret.',
        ],
      },
      {
        heading: 'Production JWT Security Checklist',
        paragraphs: [
          'Most authentication vulnerabilities around JWTs stem from verification mistakes rather than broken cryptography.',
        ],
        bullets: [
          'Explicitly pin allowed signing algorithms on your server (reject "none" and reject HS256 when expecting RS256/ES256 public keys).',
          'Always enforce short access token TTLs (5–15 minutes) paired with rotating refresh tokens.',
          'Validate both `iss` (Issuer) and `aud` (Audience) claims so tokens minted for one microservice cannot be replayed on another.',
        ],
      },
    ],
    useCases: [
      'Debugging OAuth 2.0 and OpenID Connect (Auth0, Clerk, Cognito, Supabase) ID/Access tokens',
      'Checking exact token expiration windows when troubleshooting 401 Unauthorized API errors',
      'Validating HS256 webhook or session signatures locally during backend testing',
      'Auditing custom roles, scopes, and tenant claims before deploying RBAC middleware',
    ],
    faqs: [
      {
        question: 'Is it safe to paste a production JWT or HMAC secret here?',
        answer:
          'Yes. Taprico decodes Base64URL segments and verifies HMAC signatures exclusively via your browser Web Crypto API (crypto.subtle). Neither the token nor your secret is transmitted over the network.',
      },
      {
        question: 'Why can anyone decode a JWT without a secret key?',
        answer:
          'Standard JWTs use JSON Web Signature (JWS), which signs data to prevent tampering rather than encrypting it. A secret or public key is only required to verify the signature, not to read the header and payload.',
      },
      {
        question: 'What is the difference between HS256 and RS256?',
        answer:
          'HS256 is symmetric: the same secret signs and verifies the token. RS256 is asymmetric: the auth provider signs with a private RSA key, and microservices verify using a public JWKS endpoint.',
      },
      {
        question: 'Why does my token show "Missing exp claim"?',
        answer:
          'RFC 7519 treats exp (Expiration Time) as optional at the spec level, but omitting it creates non-expiring bearer credentials. Production APIs should almost always include an exp timestamp.',
      },
    ],
    relatedSlugs: ['base64-encoder-decoder', 'json-yaml-formatter', 'uuid-generator'],
    featuredOnHome: true,
  },
  {
    slug: 'cron-expression-generator',
    name: 'Cron Expression Generator, Explainer & Schedule Tester',
    shortName: 'Cron Expression Studio',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'SCHEDULER',
    iconName: 'Clock',
    tagline:
      'Build 5-field cron schedules visually, translate cryptic strings into plain English, and preview the next 10 run times in US timezones.',
    seoTitle: 'Cron Expression Generator & Next-Run Simulator | Taprico',
    seoDescription:
      'Interactive 5-field cron job builder and human-readable explainer. Preview the next 10 scheduled execution timestamps across US Eastern, Pacific, and UTC.',
    keywords: [
      'cron expression generator',
      'crontab guru alternative',
      'cron job schedule tester',
      'cron expression explainer',
      'github actions cron schedule',
    ],
    highlights: [
      {
        title: 'Two-Way Visual Builder',
        detail: 'Type raw crontab syntax or click visual selectors for Minute, Hour, Day, Month, and Weekday.',
      },
      {
        title: 'US Timezone Next-10 Simulator',
        detail: 'Verify exact upcoming execution dates across America/New_York, Chicago, Denver, Los Angeles, and UTC.',
      },
      {
        title: 'Plain-English Diagnostics',
        detail: 'Instant human translation eliminates accidental midnight vs. noon or weekday off-by-one bugs.',
      },
    ],
    howToUse: [
      'Enter a standard 5-field cron expression (e.g., */15 9-17 * * 1-5) or pick a common SaaS/DevOps preset.',
      'Use the interactive Minute, Hour, Day of Month, Month, and Day of Week controls to adjust intervals visually.',
      'Select your production server timezone (UTC for GitHub Actions/Kubernetes, or US Eastern/Pacific for business billing jobs).',
      'Verify the next 10 execution timestamps before pasting the cron string into crontab, Kubernetes CronJobs, or Vercel/AWS schedulers.',
    ],
    technicalGuide: [
      {
        heading: 'Standard 5-Field Crontab Syntax Reference',
        paragraphs: [
          'Traditional POSIX cron expressions contain five whitespace-separated fields: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6, where 0 and 7 both represent Sunday).',
          'Special operators let you express rich schedules concisely: * matches every value, , creates lists (1,15), - defines ranges (9-17), and / sets step increments (*/10).',
        ],
      },
      {
        heading: 'Watch Out for UTC vs. US Daylight Saving Time',
        paragraphs: [
          'Most cloud orchestrators—including GitHub Actions, Kubernetes CronJobs (unless timeZone is explicitly set), and Vercel Cron—evaluate schedules strictly in UTC. A job set to 0 9 * * * runs at 9:00 AM UTC, which shifts between 4:00 AM EST and 5:00 AM EDT in New York.',
        ],
        bullets: [
          'Avoid scheduling critical US billing jobs between 1:00 AM and 3:00 AM local time during March/November DST transitions.',
          'Note that AWS EventBridge uses a 6-field format with a Year field and requires ? in either Day-of-Month or Day-of-Week.',
        ],
      },
    ],
    useCases: [
      'Scheduling nightly PostgreSQL snapshots and S3 archival jobs during off-peak US hours',
      'Configuring GitHub Actions CI security scans and dependency update workflows',
      'Setting up Monday–Friday business-hours webhook polling or Slack digest reminders',
      'Auditing unfamiliar crontab rules in legacy Linux servers before modifying them',
    ],
    faqs: [
      {
        question: 'What does */15 * * * * mean in cron?',
        answer:
          'It triggers every 15 minutes on the hour quarter-marks (:00, :15, :30, :45), every hour of every day.',
      },
      {
        question: 'Does Sunday equal 0 or 7 in standard cron?',
        answer:
          'In POSIX/Linux vixie-cron and most modern parsers, both 0 and 7 map to Sunday, while Monday through Saturday are 1 through 6. Named aliases like MON-FRI are also widely supported.',
      },
      {
        question: 'What timezone does GitHub Actions use for cron schedules?',
        answer:
          'GitHub Actions always interprets schedule cron strings in UTC. Use our timezone dropdown to convert US Eastern or Pacific business hours accurately into UTC.',
      },
    ],
    relatedSlugs: ['regex-tester', 'json-yaml-formatter', 'uuid-generator'],
    featuredOnHome: true,
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester, Match Highlighter & Replace Debugger',
    shortName: 'Regex Tester',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'PATTERN LAB',
    iconName: 'Regex',
    tagline:
      'Test regular expressions live with color-coded match highlighting, capture group extraction, find-and-replace previews, and US format presets.',
    seoTitle: 'Online Regex Tester, Debugger & Cheat Sheet | Taprico',
    seoDescription:
      'Live JavaScript/ECMA regular expression tester with real-time match highlighting, capture groups, replacement preview, execution timing, and US format presets.',
    keywords: [
      'regex tester',
      'regular expression debugger',
      'regex match highlighter',
      'us phone number regex',
      'regex replace tester',
    ],
    highlights: [
      {
        title: 'Live Capture Group Inspector',
        detail: 'Inspect numbered ($1, $2) and named (?<id>...) capture groups with exact start/end character indices.',
      },
      {
        title: 'Find & Replace Simulator',
        detail: 'Test string transformations using $1 backreferences and full-match $& tokens in real time.',
      },
      {
        title: 'Click-to-Insert Cheat Sheet',
        detail: 'Insert anchors, lookarounds, character classes, and US presets (ZIP, Phone, Email, IPv4, SemVer) effortlessly.',
      },
    ],
    howToUse: [
      'Enter your regular expression pattern (without enclosing slashes) and toggle flags like Global (g), Case-Insensitive (i), or Multiline (m).',
      'Type or paste sample test strings into the Test Input panel, or click one of the US validation presets.',
      'Review color-highlighted matches inline and inspect extracted capture groups in the right-hand Matches table.',
      'Switch to the Replace tab to preview output strings when running regex substitutions in code.',
    ],
    technicalGuide: [
      {
        heading: 'Avoiding Catastrophic Backtracking (ReDoS)',
        paragraphs: [
          'Nested quantifiers such as (a+)+ or ([a-zA-Z]+)* can cause exponential runtime spikes on malformed inputs—freezing user browsers or blocking Node.js event loops.',
          'Our studio measures match execution latency in milliseconds so you can spot sluggish expressions early and simplify ambiguous wildcards.',
        ],
        bullets: [
          'Prefer specific negated character classes like [^"]+ instead of greedy .*? when parsing quoted fields.',
          'Anchor validation regexes with ^ and $ (or \\A / \\Z in PCRE) so partial matches do not slip past form validators.',
          'Use non-capturing groups (?:...) when parentheses are only needed for grouping precedence.',
        ],
      },
    ],
    useCases: [
      'Validating US ZIP codes (12345 or 12345-6789) and North American phone numbers',
      'Extracting structured log fields, request IDs, and latency metrics from server logs',
      'Cleaning CSV columns or refactoring codebase import paths with regex find-and-replace',
      'Testing named capture groups before shipping TypeScript or Python parsing utilities',
    ],
    faqs: [
      {
        question: 'Which regex engine does Taprico use?',
        answer:
          'Taprico runs your browser native ECMAScript (JavaScript) RegExp engine, supporting modern features including named capture groups (?<name>...), lookbehinds (?<=...), and dotAll (s) flags.',
      },
      {
        question: 'Why does my regex only match the first occurrence?',
        answer:
          'Enable the Global (g) flag in the pattern bar to find every match across the text instead of stopping after the first hit.',
      },
      {
        question: 'How do I match across multiple lines?',
        answer:
          'Toggle Multiline (m) to make ^ and $ match the start and end of each line, or toggle DotAll (s) so the dot (.) wildcard matches newline characters.',
      },
    ],
    relatedSlugs: ['diff-checker', 'json-yaml-formatter', 'cron-expression-generator'],
  },
  {
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder, Decoder & File Data-URI Studio',
    shortName: 'Base64 Studio',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'UTF-8 / URL',
    iconName: 'Binary',
    tagline:
      'Encode or decode UTF-8 text and URL-safe Base64 strings, or convert images and files directly into inline CSS/HTML Data URIs.',
    seoTitle: 'Base64 Encoder, Decoder & File Data-URI Converter | Taprico',
    seoDescription:
      'UTF-8 safe Base64 encoder and decoder with RFC 4648 URL-safe mode plus drag-and-drop image/file to Data URI generator for web developers.',
    keywords: [
      'base64 encoder decoder',
      'base64url decoder',
      'image to base64 data uri',
      'utf8 base64 encode',
      'decode base64 online',
    ],
    highlights: [
      {
        title: 'True UTF-8 & Emoji Support',
        detail: 'Uses modern TextEncoder/TextDecoder APIs so accented characters, symbols, and emojis never corrupt.',
      },
      {
        title: 'RFC 4648 URL-Safe Toggle',
        detail: 'Convert standard Base64 (+, /, =) to URL/JWT-safe (-, _) format in one click.',
      },
      {
        title: 'File & Image Data-URI Studio',
        detail: 'Drop SVG, PNG, WebP, or JSON files to copy raw Base64, CSS url(), or HTML <img> snippets.',
      },
    ],
    howToUse: [
      'Choose Encode or Decode mode in the Text Studio tab and paste your plain text or Base64 string.',
      'Enable the URL-Safe (RFC 4648 §5) switch when working with JWT segments, OAuth PKCE verifiers, or query parameters.',
      'To convert an asset, open the File to Base64 tab and drop any file from your computer.',
      'Copy the generated Data URI, CSS background snippet, or raw Base64 string locally.',
    ],
    technicalGuide: [
      {
        heading: 'Standard Base64 vs. Base64URL (And Why btoa() Breaks Unicode)',
        paragraphs: [
          'Legacy browser helpers like window.btoa() throw an InvalidCharacterError whenever input text contains characters outside Latin-1 (such as smart quotes, math symbols, or international names). Taprico encodes text into UTF-8 byte arrays first before converting to Base64.',
          'Standard Base64 includes +, /, and = padding characters that carry special meaning in URLs. Base64URL swaps + for -, / for _, and optionally omits trailing = padding—making it safe inside query strings, filenames, and JWT headers.',
        ],
      },
    ],
    useCases: [
      'Encoding HTTP Basic Auth credentials (username:password) for curl and API clients',
      'Inlining small crisp SVG or PNG icons directly into standalone HTML emails or widgets',
      'Decoding Base64 Kubernetes Secret payloads locally without leaking cluster keys',
      'Inspecting Base64URL-encoded OAuth state parameters and PKCE code challenges',
    ],
    faqs: [
      {
        question: 'Does Base64 encrypt my text or secrets?',
        answer:
          'No. Base64 is strictly an ASCII text encoding scheme, not encryption. Anyone can decode a Base64 string immediately without a key.',
      },
      {
        question: 'Why is a Base64 string roughly 33% larger than the original file?',
        answer:
          'Base64 represents every 3 bytes (24 bits) of binary input using 4 printable ASCII characters (6 bits each), resulting in a deterministic 4:3 (~33%) size overhead.',
      },
      {
        question: 'Can I preview an encoded image Data URI?',
        answer:
          'Yes. When you paste a valid data:image/... string or drop an image file in the File tab, Taprico renders a live preview alongside its byte dimensions.',
      },
    ],
    relatedSlugs: ['jwt-decoder', 'uuid-generator', 'json-yaml-formatter'],
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator (v4, v7), ULID & Timestamp Inspector',
    shortName: 'UUID & ULID Studio',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'v4 / v7 / ULID',
    iconName: 'Fingerprint',
    tagline:
      'Generate cryptographically random UUID v4, database-friendly sortable UUID v7 (RFC 9562), and ULIDs in bulk—or inspect embedded timestamps.',
    seoTitle: 'UUID Generator (v4 & v7), ULID & Batch Exporter | Taprico',
    seoDescription:
      'Generate bulk UUID v4, sortable RFC 9562 UUID v7, and ULID IDs with JSON or SQL export options plus a built-in UUID timestamp decoder.',
    keywords: [
      'uuid generator',
      'uuid v7 generator',
      'ulid generator',
      'bulk guid generator',
      'uuid timestamp decoder',
    ],
    highlights: [
      {
        title: 'Modern RFC 9562 UUID v7',
        detail: 'Time-ordered 48-bit Unix millisecond prefix dramatically reduces PostgreSQL B-tree index fragmentation compared to v4.',
      },
      {
        title: 'Bulk Export (Up to 500 IDs)',
        detail: 'Generate batches and export immediately as plain text, JSON array, CSV, or SQL VALUES lists.',
      },
      {
        title: 'Built-In UUID Inspector',
        detail: 'Paste any UUID to inspect its RFC version, variant bits, and decoded creation timestamp (for v1 and v7).',
      },
    ],
    howToUse: [
      'Select your identifier type: UUID v4 (random), UUID v7 (time-ordered), ULID (Crockford Base32 sortable), or Nil UUID.',
      'Set your batch quantity (1 to 500) and toggle Uppercase, Hyphens, Braces {...}, or URN prefixes.',
      'Click Regenerate or copy the list as plain lines, a JSON array, or an SQL VALUES snippet.',
      'Switch to the UUID Inspector tab anytime to decode the version and embedded timestamp of an existing UUID.',
    ],
    technicalGuide: [
      {
        heading: 'Why US Backend Teams Are Migrating Primary Keys from UUID v4 to UUID v7',
        paragraphs: [
          'UUID v4 relies on 122 purely random bits. While collision resistance is astronomical, inserting completely random primary keys into clustered database B-trees (such as PostgreSQL, MySQL InnoDB, or SQL Server) scatters page writes across disk and bloats indexes at scale.',
          'Ratified in RFC 9562, UUID v7 embeds a 48-bit Unix timestamp in milliseconds at the start of the 128-bit value, followed by 74 cryptographically random bits. You get global uniqueness without sacrificing sequential database write locality.',
        ],
      },
    ],
    useCases: [
      'Seeding PostgreSQL, Supabase, or Prisma development databases with realistic primary keys',
      'Generating correlation IDs, idempotency keys, and API client secrets via CSPRNG',
      'Debugging production UUID v7 records to check the exact millisecond a row was minted',
      'Choosing between 36-char UUIDs and compact 26-char URL-friendly ULIDs',
    ],
    faqs: [
      {
        question: 'Are these UUIDs cryptographically secure?',
        answer:
          'Yes. Taprico uses window.crypto.randomUUID() and window.crypto.getRandomValues() backed by your operating system CSPRNG rather than insecure Math.random().',
      },
      {
        question: 'Can I extract a creation date from a UUID v4?',
        answer:
          'No. UUID v4 contains only random bits plus version/variant metadata. Only time-based versions like UUID v7, UUID v1, and ULID embed creation timestamps.',
      },
      {
        question: 'When should I pick ULID over UUID v7?',
        answer:
          'Pick ULID when identifiers appear prominently in URLs or API responses (26 alphanumeric characters vs. 36), and pick UUID v7 when your database offers a native 16-byte uuid column type like PostgreSQL.',
      },
    ],
    relatedSlugs: ['sql-formatter', 'jwt-decoder', 'base64-encoder-decoder'],
  },
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter, Beautifier & Multi-Dialect Minifier',
    shortName: 'SQL Formatter',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'POSTGRES / SQL',
    iconName: 'Database',
    tagline:
      'Format complex CTEs, joins, and window queries across PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, and T-SQL.',
    seoTitle: 'SQL Formatter & Beautifier (Postgres, MySQL) | Taprico',
    seoDescription:
      'Free client-side SQL formatter and minifier for PostgreSQL, MySQL, SQLite, BigQuery, Snowflake, and SQL Server with custom casing and indent rules.',
    keywords: [
      'sql formatter',
      'postgresql formatter',
      'sql beautifier online',
      'bigquery sql formatter',
      'sql minifier',
    ],
    highlights: [
      {
        title: '6 Production SQL Dialects',
        detail: 'Accurate tokenization for PostgreSQL, MySQL, SQLite, BigQuery, Snowflake, and T-SQL.',
      },
      {
        title: 'Custom Style Rules',
        detail: 'Control keyword case (UPPER / lower / preserve), indent size, and comma/operator alignment.',
      },
      {
        title: 'Instant Query Minifier',
        detail: 'Collapse formatted multi-line queries into single-line strings for environment configs or logs.',
      },
    ],
    howToUse: [
      'Paste raw or messy SQL from an ORM debug log, BI dashboard, or migration script.',
      'Choose your SQL Dialect (PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, or Transact-SQL).',
      'Pick your preferred keyword casing (UPPERCASE or lowercase) and indentation width.',
      'Copy the formatted query or click Download .sql to save it directly.',
    ],
    technicalGuide: [
      {
        heading: 'Readable SQL Standards for Data & Application Engineering',
        paragraphs: [
          'Unformatted ORM-generated queries and minified BI warehouse scripts hide subtle JOIN bugs, accidental Cartesian products, and missing WHERE filters. Consistent formatting surfaces CTE boundaries and subquery nesting at a glance.',
        ],
        bullets: [
          'Keep keywords uppercase (SELECT, WITH, OVER, PARTITION BY) to distinguish SQL structure from snake_case table and column identifiers.',
          'Use Common Table Expressions (WITH clauses) instead of deeply nested inline subqueries.',
          'Validate dialect-specific syntax such as PostgreSQL :: casts or BigQuery backticks by matching the dialect dropdown.',
        ],
      },
    ],
    useCases: [
      'Beautifying single-line Prisma, Drizzle, or Hibernate SQL debug output',
      'Standardizing dbt models, Snowflake analytics queries, and BigQuery reports before PR review',
      'Inspecting complex multi-CTE reporting queries for missing predicates',
      'Minifying SQL templates for compact storage inside configuration strings',
    ],
    faqs: [
      {
        question: 'Does the SQL formatter support PostgreSQL JSONB operators and CTEs?',
        answer:
          'Yes. Selecting PostgreSQL enables native tokenization for WITH CTEs, window functions, -> / ->> JSON operators, and :: type casts.',
      },
      {
        question: 'Are my SQL schemas or queries uploaded anywhere?',
        answer:
          'Never. Formatting runs entirely in your browser via sql-formatter with zero network requests.',
      },
      {
        question: 'Does minifying SQL break inline -- comments?',
        answer:
          'Our minifier safely strips single-line -- comments and /* ... */ block comments before collapsing whitespace so trailing statements do not accidentally get commented out.',
      },
    ],
    relatedSlugs: ['json-yaml-formatter', 'diff-checker', 'uuid-generator'],
  },
  {
    slug: 'diff-checker',
    name: 'Code & Text Diff Checker (Side-by-Side & Unified)',
    shortName: 'Diff Checker',
    category: 'developer',
    categoryLabel: 'Developer Studio',
    badge: 'MYERS DIFF',
    iconName: 'GitCompare',
    tagline:
      'Compare two versions of code, JSON, .env files, or prose side by side with inline word-level change highlights and similarity metrics.',
    seoTitle: 'Online Diff Checker — Code & Text Compare | Taprico',
    seoDescription:
      'Compare code, configs, and text side by side or as a unified patch using Myers diff algorithm. Highlights added, removed, and inline word edits locally.',
    keywords: [
      'diff checker',
      'compare two texts online',
      'side by side code diff',
      'json diff tool',
      'env file compare',
    ],
    highlights: [
      {
        title: 'Split & Unified Views',
        detail: 'Toggle cleanly between side-by-side comparison columns and compact Git-style unified diffs.',
      },
      {
        title: 'Inline Word-Level Precision',
        detail: 'Spot single changed characters or modified numbers inside long configuration lines instantly.',
      },
      {
        title: 'Whitespace & Case Filters',
        detail: 'Ignore indentation noise or casing differences with instant live recomputation.',
      },
    ],
    howToUse: [
      'Paste the Original text/code on the left and the Modified version on the right, or click a sample preset.',
      'Switch between Side-by-Side Split view and Unified Patch view depending on line length.',
      'Toggle Ignore Whitespace or Ignore Case to filter out formatting-only changes.',
      'Check the summary pill bar for exact +added lines, -removed lines, and overall similarity percentage.',
    ],
    technicalGuide: [
      {
        heading: 'Comparing Sensitive Configs Without Cloud Exposure',
        paragraphs: [
          'Developers frequently diff .env secrets, production database dumps, legal contracts, and API payloads. Uploading sensitive snippets to ad-hoc comparison servers violates client NDAs and security policies.',
          'Taprico computes diffs locally using the classic Myers O(ND) difference algorithm, delivering instant word- and line-level precision right inside your browser tab.',
        ],
      },
    ],
    useCases: [
      'Comparing staging vs. production .env variables before a release',
      'Auditing edited legal terms, SOWs, or freelance client contract redlines',
      'Debugging why two nearly identical JSON payloads behave differently',
      'Reviewing refactored TypeScript, Python, or SQL snippets prior to committing',
    ],
    faqs: [
      {
        question: 'Can I compare .env files or confidential client contracts safely?',
        answer:
          'Yes. Because Taprico processes every diff purely in local browser memory, confidential keys, customer lists, and NDA documents never leave your device.',
      },
      {
        question: 'What is the difference between Split View and Unified View?',
        answer:
          'Split View displays Original and Modified texts side by side for visual alignment. Unified View merges changes into a single Git-style vertical stream that is easier to scan on narrower screens.',
      },
      {
        question: 'How does Ignore Whitespace work?',
        answer:
          'When enabled, trailing spaces and indentation adjustments are normalized before diffing so only meaningful content edits appear highlighted.',
      },
    ],
    relatedSlugs: ['json-yaml-formatter', 'sql-formatter', 'regex-tester'],
  },

  // =========================================================================
  // FREELANCER & SMALL BUSINESS TOOLS (4)
  // =========================================================================
  {
    slug: 'invoice-generator',
    name: 'US Freelance & Small Business Invoice Generator (PDF)',
    shortName: 'Invoice Generator',
    category: 'freelance',
    categoryLabel: 'Freelance Finance',
    badge: 'VECTOR PDF',
    iconName: 'FileText',
    tagline:
      'Create crisp, print-ready US Letter or A4 client invoices with logo upload, sales tax, Net 30 payment terms, ACH details, and instant vector PDF download.',
    seoTitle: 'Free US Invoice Generator — Instant Vector PDF | Taprico',
    seoDescription:
      'Create US freelance and small business invoices in seconds. Supports USD ($), US Letter paper, Net 30 terms, sales tax, ACH details, and vector PDF export.',
    keywords: [
      'free invoice generator',
      'us freelance invoice pdf',
      'small business invoice maker',
      'net 30 invoice template',
      'contractor invoice generator',
    ],
    highlights: [
      {
        title: 'True Selectable Vector PDF',
        detail: 'Exports crisp, selectable text PDFs natively via jsPDF—no blurry screenshots, no watermarks, no sign-up.',
      },
      {
        title: 'Saved Business Defaults',
        detail: 'Store your LLC name, address, logo, and ACH wire notes in localStorage so your next invoice takes 15 seconds.',
      },
      {
        title: 'Built for US Payment Workflows',
        detail: 'Defaults to USD ($), US Letter (8.5×11), Net 15/30 terms, Sales Tax, Deposits Paid, and W-9 ready notes.',
      },
    ],
    howToUse: [
      'Upload your company logo (optional), pick an accent color, and fill in your Business (From) and Client (Bill To) details.',
      'Set Invoice #, Issue Date, Payment Terms (Due on Receipt, Net 15, Net 30, Net 45), and Due Date.',
      'Add billable line items with hours/quantity and unit rates—totals calculate automatically.',
      'Apply optional Discount, Sales Tax %, or Deposit Paid, add ACH/Wire/Stripe instructions, and click Download PDF.',
    ],
    technicalGuide: [
      {
        heading: 'What US Clients & Accounts Payable Departments Expect on an Invoice',
        paragraphs: [
          'Late freelance payments often happen not because a client refuses to pay, but because an invoice fails an accounts-payable compliance check. Missing invoice numbers, vague descriptions, or absent payment instructions stall approvals for weeks.',
        ],
        bullets: [
          'Always assign a unique sequential Invoice Number (e.g., INV-2026-014) and clear Issue + Due Dates.',
          'Include explicit payment methods directly on the invoice (ACH routing/account, wire details, or payment portal link).',
          'For US B2B clients paying $600+ per year, remind them your W-9 is on file or attach it alongside your first invoice.',
          'Note whether consulting services are sales-tax exempt in your state versus taxable digital goods or hardware.',
        ],
      },
    ],
    useCases: [
      'Independent US software engineers, designers, and marketers billing monthly retainers',
      'LLC consultants issuing Net 30 invoices with ACH direct-deposit instructions',
      'Agencies sending itemized project milestone quotes and balance-due receipts',
      'Contractors generating clean PDF records for Schedule C bookkeeping',
    ],
    faqs: [
      {
        question: 'Does Taprico add watermarks or limit how many PDF invoices I can download?',
        answer:
          'Never. Taprico is 100% free with unlimited invoice downloads and zero watermarks or branding traps.',
      },
      {
        question: 'Where is my company logo and business info saved?',
        answer:
          'When you click "Save Defaults", your profile stays strictly inside your own browser localStorage so you can reuse it locally—Taprico has no server database.',
      },
      {
        question: 'Should I choose US Letter or A4 paper size?',
        answer:
          'If your clients are based in the United States or Canada, keep US Letter (8.5 × 11 in) selected so invoices print cleanly without margin clipping.',
      },
      {
        question: 'Are generated PDFs searchable text or flat images?',
        answer:
          'Taprico constructs a true vector PDF document with selectable text, crisp hairline tables, and tiny file sizes (~15–40 KB) ideal for email attachments and accounting portals.',
      },
    ],
    relatedSlugs: ['freelance-rate-calculator', 'hourly-to-salary-converter', 'profit-margin-markup-calculator'],
    featuredOnHome: true,
  },
  {
    slug: 'hourly-to-salary-converter',
    name: 'US Hourly to Salary Converter (With W-2 vs. 1099 Reality Check)',
    shortName: 'Hourly ↔ Salary',
    category: 'freelance',
    categoryLabel: 'Freelance Finance',
    badge: 'US COMP',
    iconName: 'DollarSign',
    tagline:
      'Convert hourly wages to annual, bi-weekly, semi-monthly, and monthly US salaries—plus see the true 1099 contractor rate equivalent.',
    seoTitle: 'Hourly to Salary Converter (US Pay & 1099 Guide) | Taprico',
    seoDescription:
      'Convert US hourly wages to annual, monthly, semi-monthly, and bi-weekly pay. Adjust PTO and holidays and compare W-2 vs. 1099 contractor rates.',
    keywords: [
      'hourly to salary calculator',
      'salary to hourly converter',
      '50 an hour is how much a year',
      'w2 vs 1099 hourly rate converter',
      'us biweekly salary calculator',
    ],
    highlights: [
      {
        title: 'Bidirectional Live Slider & Input',
        detail: 'Type an hourly rate OR target annual salary and watch every pay frequency update instantaneously.',
      },
      {
        title: 'All US Pay Schedules',
        detail: 'Displays Annual, Monthly (12), Semi-Monthly (24), Bi-Weekly (26), Weekly (52), and Daily pay.',
      },
      {
        title: 'W-2 vs. 1099 Contractor Parity',
        detail: 'Reveals the higher 1099 hourly rate required to match a W-2 package after FICA tax and lost PTO.',
      },
    ],
    howToUse: [
      'Enter either your Hourly Rate ($) or Annual Salary ($) at the top—the converter syncs both directions.',
      'Adjust weekly hours (40h US standard), paid holidays (11 US federal), and vacation/PTO days.',
      'Toggle whether your time off is Paid (salaried W-2) or Unpaid (hourly contractor) to see realistic annual gross income.',
      'Review the W-2 vs. 1099 Equivalent panel before negotiating a contract-to-hire or consulting offer.',
    ],
    technicalGuide: [
      {
        heading: 'The Standard 2,080-Hour Rule (And Why 1099 Contractors Need More)',
        paragraphs: [
          'In the United States, a full-time 40-hour workweek multiplied by 52 weeks equals 2,080 paid hours per year. As a fast mental shortcut, multiplying an hourly rate by 2,000 gives a close baseline (e.g., $50/hr ≈ $104,000/year at 2,080 hours).',
          'However, comparing a $50/hr W-2 hourly rate directly to a $50/hr 1099 independent contractor rate is a costly mistake. As a 1099 contractor, you pay the employer half of FICA taxes (+7.65%), receive zero paid holidays or PTO, and fund your own health insurance and 401(k) match.',
        ],
        bullets: [
          'Quick US benchmark: divide your target W-2 salary by 1,000 to approximate your bare-minimum 1099 consulting hourly rate (e.g., $120k W-2 → ~$120/hr 1099) once benefits, taxes, and unbilled admin time are factored in.',
          'Notice the difference between Bi-Weekly (26 paychecks/yr, every two weeks) and Semi-Monthly (24 paychecks/yr, e.g., 1st and 15th).',
        ],
      },
    ],
    useCases: [
      'Evaluating competing US tech job offers: salaried W-2 vs. hourly W-2 vs. 1099 C2C',
      'Calculating realistic annual take-home potential when taking unpaid PTO as a contractor',
      'Budgeting household expenses across bi-weekly (26) vs. monthly (12) paycheck cycles',
      'Estimating gross pay boosts from weekly 1.5x overtime hours',
    ],
    faqs: [
      {
        question: 'How much is $50 an hour annually in the US?',
        answer:
          'At 40 hours per week for 52 weeks (2,080 hours), $50/hour equals $104,000 gross per year before taxes. If you take 3 weeks of unpaid time off, it drops to $98,000.',
      },
      {
        question: 'What is the difference between bi-weekly and semi-monthly pay?',
        answer:
          'Bi-weekly pay runs every 14 days (26 paychecks per year, meaning two months have three paydays). Semi-monthly pay runs twice per month on fixed dates like the 1st and 15th (24 paychecks per year).',
      },
      {
        question: 'Why is the 1099 equivalent hourly rate higher than the W-2 rate?',
        answer:
          'Independent contractors absorb an extra 7.65% employer-side FICA tax, lose paid holidays/PTO, and cover health insurance, liability insurance, and retirement contributions out of pocket.',
      },
    ],
    relatedSlugs: ['freelance-rate-calculator', 'invoice-generator', 'profit-margin-markup-calculator'],
    featuredOnHome: true,
  },
  {
    slug: 'freelance-rate-calculator',
    name: 'US Freelance Rate & Self-Employment Pricing Calculator',
    shortName: 'Freelance Rate Calc',
    category: 'freelance',
    categoryLabel: 'Freelance Finance',
    badge: 'PRICING ENGINE',
    iconName: 'Calculator',
    tagline:
      'Calculate your profitable US freelance hourly, day, weekly, and retainer rates after accounting for non-billable hours, overhead, health insurance, and 15.3% SE tax.',
    seoTitle: 'US Freelance Hourly Rate Calculator & Tax Guide | Taprico',
    seoDescription:
      'Price US freelance services profitably. Models desired take-home pay, billable utilization %, PTO, business overhead, health insurance, and 15.3% SE tax.',
    keywords: [
      'freelance rate calculator',
      'how much should i charge as a freelancer',
      'consulting hourly rate calculator',
      '1099 self employment tax rate calculator',
      'freelance day rate calculator',
    ],
    highlights: [
      {
        title: 'Realistic Billable Utilization',
        detail: 'Models the critical gap between 40 work hours and the ~25–30 hours actually billed to clients.',
      },
      {
        title: 'US Tax & Benefits Presets',
        detail: 'Includes 15.3% SE tax + federal/state income tax presets plus healthcare and Solo 401(k) buffers.',
      },
      {
        title: 'Full Rate Card Output',
        detail: 'Outputs Break-Even Hourly, Recommended Target Hourly, 8h Day Rate, Weekly Sprint, and Monthly Retainer.',
      },
    ],
    howToUse: [
      'Set your Desired Annual Net Take-Home Pay ($) — what you want left after taxes and business bills.',
      'Adjust Billable Hours per Week (most solo US freelancers bill 22–30 hours after sales, admin, and invoicing) and Weeks Off.',
      'Enter monthly business overhead (software, laptop, CPA, LLC fees) plus health insurance / retirement savings.',
      'Pick a US Tax Reserve preset (Low-tax state like TX/FL, Average US, or High-tax state like CA/NY) to see your exact minimum and recommended rates.',
    ],
    technicalGuide: [
      {
        heading: 'Why Underpricing Happens (The Utilization & Tax Trap)',
        paragraphs: [
          'New US freelancers routinely divide their target salary by 2,080 hours and end up earning far less than expected. Out of a 40-hour week, 10 to 15 hours are spent on proposals, client calls, bookkeeping, and marketing—meaning you may only log 1,100 to 1,400 billable hours per year.',
          'On top of utilization, self-employed US contractors owe 15.3% FICA Self-Employment tax (12.4% Social Security up to the annual wage cap + 2.9% Medicare) in addition to federal and state income tax.',
        ],
        bullets: [
          'Never quote at your break-even hourly rate—keep a 15–25% profit margin above break-even for slow quarters and equipment upgrades.',
          'Use your calculated Day Rate (8× hourly) or Weekly Sprint Rate to move away from micro-tracked hourly billing on fixed-scope projects.',
        ],
      },
    ],
    useCases: [
      'Setting confident 2026 consulting rates when leaving a full-time US W-2 role',
      'Pricing weekly engineering sprints or design retainers for US startup clients',
      'Auditing whether legacy client retainers still clear your post-tax income targets',
      'Modeling how moving from 20 to 30 billable hours/week changes required pricing',
    ],
    faqs: [
      {
        question: 'What is a realistic billable utilization percentage for a freelancer?',
        answer:
          'Solo freelancers typically bill 60% to 75% of their working hours (24–30 billable hours in a 40-hour week). The remainder covers sales, proposals, invoicing, and skill maintenance.',
      },
      {
        question: 'How much should US freelancers set aside for taxes?',
        answer:
          'A common US rule of thumb is reserving 25% to 35% of net business profit for quarterly estimated taxes (covering 15.3% self-employment tax plus federal and state income taxes), adjusted for deductions like QBI and Solo 401(k).',
      },
      {
        question: 'How is a Freelance Day Rate calculated?',
        answer:
          'Most US consultants multiply their target hourly rate by 8 hours—often rounding cleanly to the nearest $50 or $100 increment for multi-day sprints.',
      },
    ],
    relatedSlugs: ['hourly-to-salary-converter', 'invoice-generator', 'profit-margin-markup-calculator'],
    featuredOnHome: true,
  },
  {
    slug: 'profit-margin-markup-calculator',
    name: 'Profit Margin, Markup & Break-Even ROAS Calculator',
    shortName: 'Margin & Markup',
    category: 'freelance',
    categoryLabel: 'Freelance Finance',
    badge: 'ECOMM / AGENCY',
    iconName: 'TrendingUp',
    tagline:
      'Solve Gross Profit Margin %, Markup %, Selling Price, and Break-Even ROAS interactively—with a live pricing ladder for agencies and eCommerce sellers.',
    seoTitle: 'Profit Margin & Markup Calculator (+ ROAS) | Taprico',
    seoDescription:
      'Calculate gross margin %, markup %, gross profit $, selling price, and break-even ROAS for SaaS, agencies, and US eCommerce with a live pricing ladder.',
    keywords: [
      'profit margin calculator',
      'markup vs margin calculator',
      'gross margin calculator',
      'break even roas calculator',
      'ecommerce pricing calculator',
    ],
    highlights: [
      {
        title: '3-Way Pricing Solver',
        detail: 'Solve from Cost + Price, Cost + Target Margin %, or Cost + Target Markup % seamlessly.',
      },
      {
        title: 'Break-Even ROAS Metric',
        detail: 'Shows the exact minimum Return on Ad Spend (1 / Margin) required before paid Meta/Google ads lose money.',
      },
      {
        title: 'Instant Margin-to-Markup Ladder',
        detail: 'View exact sell prices for 20% through 75% gross margins based on your live unit cost.',
      },
    ],
    howToUse: [
      'Pick your calculation mode: Cost + Selling Price, Cost + Target Margin %, or Cost + Markup %.',
      'Enter your Cost of Goods Sold (COGS) or contractor delivery cost in USD ($).',
      'Review Gross Profit ($), Gross Margin (%), Markup (%), and Break-Even ROAS instantly in the results studio.',
      'Use the Pricing Ladder table below to test higher target margins without manually re-entering formulas.',
    ],
    technicalGuide: [
      {
        heading: 'Gross Margin vs. Markup: Never Confuse the Two',
        paragraphs: [
          'Confusing margin with markup is one of the fastest ways agencies and eCommerce founders erode profitability. Markup measures profit as a percentage of your COST. Gross Margin measures profit as a percentage of your SELLING PRICE.',
          'For example, buying a product for $50 and selling it for $100 is a 100% markup—but only a 50% gross margin ($50 profit / $100 revenue). Margin can never reach or exceed 100% as long as cost is positive, while markup can grow infinitely.',
        ],
        bullets: [
          'Gross Margin % = ((Revenue − Cost) / Revenue) × 100',
          'Markup % = ((Revenue − Cost) / Cost) × 100',
          'Break-Even ROAS = 1 / (Gross Margin % / 100) — e.g., a 40% margin requires 2.50x ROAS just to break even on ad spend.',
        ],
      },
    ],
    useCases: [
      'US Shopify & Amazon FBA brands pricing SKUs above paid-acquisition break-even ROAS',
      'Creative and dev agencies pricing subcontractor work to maintain healthy 50%+ delivery margins',
      'SaaS and wholesale teams converting target gross margin KPIs into exact customer list prices',
      'Auditing discount impact during seasonal promotions before cutting prices',
    ],
    faqs: [
      {
        question: 'If I want a 50% gross profit margin, what markup do I apply?',
        answer:
          'To achieve a 50% gross margin, you must apply a 100% markup (double your cost). For example, $60 cost × 2 = $120 price ($60 profit ÷ $120 price = 50% margin).',
      },
      {
        question: 'What is Break-Even ROAS and why does it matter?',
        answer:
          'Break-Even ROAS (Return on Ad Spend) equals 1 divided by your Gross Margin decimal. If your margin is 40% (0.40), Break-Even ROAS is 2.5x—meaning every $1 spent on ads must return over $2.50 in revenue to generate net profit.',
      },
      {
        question: 'What is a healthy gross margin for a US service agency vs. SaaS?',
        answer:
          'Well-run US software and creative agencies typically target 50%–65% delivery gross margin after contractor/labor costs, while B2B SaaS products commonly target 75%–85% gross margins.',
      },
    ],
    relatedSlugs: ['freelance-rate-calculator', 'invoice-generator', 'hourly-to-salary-converter'],
    featuredOnHome: true,
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category);
}
