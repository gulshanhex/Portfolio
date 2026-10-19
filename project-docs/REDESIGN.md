# Architecture & Engineering Migration Guide (v3.0)

**Project:** `gk-portfolio-astro` (`portfolio.gulshan-kumar.me`)  
**Deployment Target:** Cloudflare Pages / Cloudflare Workers + Cloudflare D1 SQL  
**Framework:** Astro 5 SSR (Standalone Edge Output)  

---

## 1. System Architecture

The v3.0 redesign structures the portfolio as an edge-rendered Astro 5 application backed by Cloudflare D1:

```
[ User Request ]
       │
       ▼
[ Cloudflare Global Edge ]
       │
       ├─► Static Cache (Service Worker / _headers): Fonts, Icons, Manifests, Offline Fallback
       │
       ▼
[ Astro 5 Serverless Worker ]
       │
       ├─► Server-Side Routing (SSR):
       │     - /                      (Landing Page)
       │     - /work                  (Archive Catalog)
       │     - /work/[slug]           (Structured Case Study)
       │     - /services/[slug]       (Engineering Detail Route)
       │     - /sitemap.xml           (Dynamic Search Sitemap)
       │     - /llms.txt              (AI Engine Index)
       │     - /llms-full.txt         (Comprehensive AEO Context)
       │     - /admin/*               (Autonomous Management Suite)
       │
       ▼
[ Cloudflare D1 SQL Database ]
       - site_settings, sections, skills, services,
         experiences, education, projects, proof_items,
         faqs, contact_submissions, admin_users, sessions
```

---

## 2. Multi-Route SSR & Detail Architecture

- **`/work/index.astro`**: Full project catalog with client-side category filtering.
- **`/work/[slug].astro`**: Structured case study pages broken down into:
  1. *01. The Problem / Operational Challenge*
  2. *02. Technical Architecture & Implementation*
  3. *03. Measurable Results & Impact*
- **`/services/[slug].astro`**: Dedicated service detail pages with capability checklists and inquiry CTAs.
- **Dynamic Sitemap & LLM Endpoints**:
  - `sitemap.xml`: Dynamically includes `/`, `/work`, active `/services/[slug]`, and active `/work/[slug]` (excluding `/docs`).
  - `llms.txt` and `llms-full.txt`: Markdown-formatted context for AI answer engines.

---

## 3. Database Safety & Additive Migrations

Every migration in v3 is strictly **additive**:
- Tables use `CREATE TABLE IF NOT EXISTS`.
- Columns are appended using `ALTER TABLE ... ADD COLUMN`.
- No `DROP TABLE` or `DROP COLUMN` statements are used.

### Applied Schema Extensions (`migrations/0001_phase4_slugs_and_details.sql`):
```sql
ALTER TABLE services ADD COLUMN slug TEXT;
ALTER TABLE services ADD COLUMN long_description TEXT;
ALTER TABLE services ADD COLUMN features TEXT NOT NULL DEFAULT '[]';

ALTER TABLE projects ADD COLUMN slug TEXT;
ALTER TABLE projects ADD COLUMN problem TEXT;
ALTER TABLE projects ADD COLUMN solution TEXT;
ALTER TABLE projects ADD COLUMN result TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;
```

### Automatic Backfill & Fallback
`ensureDatabaseSchema` in `src/lib/schema-sql.ts` and `getServiceBySlug` / `getProjectBySlug` in `src/lib/db.ts` backfill missing slugs from record titles using `slugify()`.

---

## 4. Security & Progressive Enhancement

1. **Autonomous TOTP 2FA**: Optional 2FA with standard authenticator apps supported in `/admin`.
2. **Honeypot & Timing Defense**: Contact form uses hidden field `_hp` and client-side elapsed time (`_elapsed >= 2000ms`) via `performance.now()`.
3. **PWA & Offline Resilience**:
   - `public/sw.js` pre-caches core assets via `Promise.allSettled` and serves an unredirected `/offline.html` fallback when navigation fails offline.
   - Admin routes (`/admin*`, `/api/*`, `/setup*`, `/health`) bypass the Service Worker cache.

---

## 5. Verification Status (Run vs. Not Run in Sandbox)

Because the development sandbox environment has no outbound network access and no pre-installed `node_modules` for Astro or Wrangler:

### Checks Actually Run in Sandbox
- **PostCSS Syntax Parsing**: Parsed `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/admin.css`, and `src/styles/docs.css` using `/usr/share/nodejs/postcss` (0 syntax errors).
- **Asset Guard (`scripts/check-assets.mjs`)**: Verified disk existence, PNG headers, WOFF2 `"wOF2"` magic bytes, and minimum file size thresholds (`inter-variable.woff2 >= 30KB`, `material-icons-round.woff2 >= 100KB`, `mono-regular.woff2 >= 20KB`).
- **Wrangler Config Preparation (`scripts/prepare-wrangler.mjs`)**: Executed via Node.js.
- **WCAG 2.1 Contrast Calculations**: Recomputed contrast ratios for all text, background, button, pill, and badge pairs across all 4 accent presets in dark and light modes.
- **SQLite Schema & Query Simulation**: Verified `schema.sql`, `seed.sql`, and `migrations/0001_phase4_slugs_and_details.sql` syntax and column definitions against Python `sqlite3`.

### Checks Not Run in Sandbox (To Be Run Locally)
- **`npm install` / `npm ci`**: **not run** (no network connectivity in sandbox to reach `registry.npmjs.org`).
- **`npm run build` (`astro build`)**: **not run** (`astro` and `@astrojs/cloudflare` packages require `npm install`).
- **`wrangler dev` & Live D1 HTTP Integration Tests**: **not run** (`wrangler` package requires `npm install`).
- **Playwright / Lighthouse**: **not run** (Playwright and Lighthouse are not installed in the sandbox, and sandbox Chromium blocks localhost HTTP navigation).
