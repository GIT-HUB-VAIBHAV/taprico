# Taprico — Local-First Developer & US Freelance Studio

**Live App:** [https://taprico.com](https://taprico.com)

Taprico is a fast, privacy-first suite of 12 developer utilities and US freelance finance calculators running **100% locally in your browser** (built with Astro SSG, React 19, Tailwind CSS v4, Web Crypto API, and vector `jsPDF`). Zero logins, zero server-side payload logging.

## Included Tools
### Developer & DevOps Utilities
- **JSON ↔ YAML Formatter & Converter** (`/tools/json-yaml-formatter/`)
- **JWT Decoder & Signature Verifier** (`/tools/jwt-decoder/`) — HS256/RS256 verification via Web Crypto
- **Cron Expression Generator & US/UTC Timezone Tester** (`/tools/cron-expression-generator/` + `/cron/`)
- **Regex Tester & Live Match Inspector** (`/tools/regex-tester/`)
- **Base64 / URL Encoder & Decoder** (`/tools/base64-encoder-decoder/`)
- **UUID v4 & RFC 9562 UUID v7 Generator** (`/tools/uuid-generator/`)
- **Multi-Dialect SQL Formatter** (`/tools/sql-formatter/`)
- **Side-by-Side Text & Code Diff Checker** (`/tools/diff-checker/`)

### Freelancer & Small Business Finance
- **Vector US Letter PDF Invoice Generator** (`/tools/invoice-generator/`)
- **Hourly-to-Annual Salary Converter** (`/tools/hourly-to-salary-converter/` + `/salary/`)
- **1099 Freelance Rate Calculator** (`/tools/freelance-rate-calculator/`)
- **Profit Margin & Markup Calculator** (`/tools/profit-margin-markup-calculator/`)

## Local Development
```bash
npm install
npm run dev
npm run build
```
