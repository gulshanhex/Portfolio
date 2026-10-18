# Architecture & Engineering Migration Guide (v3.0)

**Project:** `gk-portfolio-astro` (`portfolio.gulshan-kumar.me`)  
**Deployment Target:** Cloudflare Pages / Cloudflare Workers + Cloudflare D1 SQL  
**Framework:** Astro 5 SSR (Standalone Edge Output)  
**Date:** October 18, 2026  

---

## 1. System Architecture

The v3.0 redesign transforms the portfolio into a high-performance, edge-rendered web application with zero external client dependencies:

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

In earlier versions, all portfolio details lived on a single landing page. Version 3 introduces scalable dynamic detail routes:
- **`/work/index.astro`**: Full project catalog with client-side category filtering (All, Bot Development, Web Application, Cloud & Backend, Industrial Automation).
- **`/work/[slug].astro`**: Deep-dive engineering case studies structured into:
  1. *01. The Problem / Operational Challenge*
  2. *02. Technical Architecture & Implementation*
  3. *03. Measurable Results & Impact*
- **`/services/[slug].astro`**: Dedicated service landing pages with capability checklists, technical architectures, and direct inquiry cards.
- **Dynamic Sitemap & Answer Engine Optimization**:
  - `sitemap.xml`: Automatically crawls active services and case studies for Google/Bing indexing.
  - `llms.txt` and `llms-full.txt`: Markdown-formatted data compliant with the llmstxt.org standard for LLM crawlers (Perplexity, ChatGPT, Claude, Gemini).

---

## 3. Database Safety & Additive Migrations

### Zero Data Loss Guarantee
Every migration in v3 is strictly **additive**:
- Tables are defined with `CREATE TABLE IF NOT EXISTS`.
- Columns are appended using `ALTER TABLE ... ADD COLUMN`.
- Drop operations (`DROP TABLE`, `DROP COLUMN`) are strictly forbidden.

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
`ensureDatabaseSchema` in `src/lib/schema-sql.ts` and `getServiceBySlug` / `getProjectBySlug` in `src/lib/db.ts` automatically backfill any missing slugs from record titles using `slugify()`. Even if migrations have not yet been run on remote D1, URL requests still resolve correctly via title-slug fallback matching.

---

## 4. Setup, Deployment & Remote Migration Steps

### A. Pre-Deployment Backup
Before pushing updates to production, log in to your existing admin dashboard (`/admin`) and click **Export Backup (JSON)** to download a full snapshot of your current database content.

### B. Applying Remote D1 Migrations
Run the dedicated migration script to apply the additive Phase 4 columns to your remote Cloudflare database:
```bash
npm run db:migrate:remote
```
*(Executes: `wrangler d1 execute portfolio-cms-db --remote --file=./migrations/0001_phase4_slugs_and_details.sql`)*

### C. Building & Deploying
```bash
# 1. Install dependencies
npm ci

# 2. Compile Astro build & validate SSR syntax
npm run build

# 3. Deploy to Cloudflare Pages / Workers
npm run deploy
```

---

## 5. Security & Progressive Enhancement

1. **Autonomous TOTP 2FA**:
   - Optional 2FA with standard authenticator apps (Google Authenticator, Bitwarden, 1Password) supported in `/admin`.
2. **Honeypot & Timing Defense**:
   - Contact form uses hidden field `_hp` and a client-side millisecond timer (`_elapsed >= 2000ms`) via `performance.now()`.
   - Replaced fragile server-client clock comparisons with relative client elapsed duration.
3. **PWA & Offline Resilience**:
   - Hand-crafted `sw.js` pre-caches fonts, icons, and `offline.html`.
   - Network-first navigation ensures visitors always get fresh portfolio content when online, with graceful offline fallback when disconnected.
   - Admin routes (`/admin*`, `/api/*`) completely bypass the Service Worker cache.
