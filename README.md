# GK Portfolio Worker

A server-rendered personal portfolio and D1-backed admin panel for [portfolio.gulshan-kumar.me](https://portfolio.gulshan-kumar.me). The application runs on Cloudflare Workers and Cloudflare D1 without runtime npm dependencies.

> **Deployment rule:** edit `src/` and `worker.js`; run `npm run build`; deploy the generated `bundled_worker.js` through Wrangler. Do not deploy `worker.js` directly because it contains source-only renderer stubs.

## Current live system

The ZIP corresponds to a live deployment at `https://portfolio.gulshan-kumar.me`. A read-only live audit confirmed that the homepage, theme toggle, health endpoint, unauthenticated admin page, setup lock, robots policy, and sitemap are functioning. The live D1 content has been edited after the original seed data was created, so production content must be treated as data rather than regenerated from `seed.sql`.

The live system is currently a working bundled Worker with a D1 binding named `DB`. The hardened source in this repository adds a safer release workflow but does not automatically deploy or change the live site.

## Architecture

| Area | Implementation |
|---|---|
| Runtime | Cloudflare Workers module Worker |
| Persistence | Cloudflare D1, SQLite-compatible |
| Rendering | Server-side HTML for public, admin, and docs pages |
| Authentication | PBKDF2-SHA-256 password hashes and server-side D1 sessions |
| Public route | `GET /` |
| Admin route | `GET /admin`, protected by the session cookie |
| Admin API | `/api/admin/*`, session-protected CRUD and backup operations |
| Public actions | `POST /api/contact`, plus `/health`, `/robots.txt`, and `/sitemap.xml` |
| Build | Dependency-free `node build.js` bundler |
| Environments | `dev`, `staging`, and `production` in `wrangler.jsonc` |

## Repository layout

```text
worker.js                 Source entrypoint and route dispatcher.
build.js                  Deterministic source-to-single-file bundler.
bundled_worker.js         Generated deployable Worker artifact.
wrangler.jsonc            Authoritative multi-environment Wrangler configuration.
package.json              Build, deploy, migration, and seed scripts.
schema.sql                Initial schema reference.
seed.sql                  Original seed reference retained for compatibility.
migrations/0001_initial.sql  Versioned D1 initial migration.
scripts/seed.sql          Optional local/disposable-staging seed data.
src/lib/                  Modular reference helpers and sanitization utilities.
src/templates/            Public, admin, docs, and CSS source templates.
src/api/                  Modular API reference implementations.
verification/              Live and static verification evidence.
AUDIT_REPORT.md            Full audit report and evidence-backed findings.
```

## Local setup

Use Node.js 18 or newer. Install Wrangler locally or invoke it through `npx`; no runtime package installation is required for the Worker itself.

```bash
cp .dev.vars.example .dev.vars.dev
# Replace ADMIN_SETUP_TOKEN with a development-only random value.
npm run build
npm run check
npm run dev
```

The local Worker is available at `http://localhost:8787`. For a fresh local D1 database, apply the migration and optional seed data:

```bash
npm run db:migrations:apply:local
npm run db:seed:local
```

The local setup route can then be used to create the first development admin account. Never point local Wrangler commands at the production database.

## Environment model

`wrangler.jsonc` defines three separate deployment environments. Cloudflare bindings and variables are environment-specific, so each environment must receive its own D1 database and secret configuration [1]. Replace the placeholder D1 IDs only with the IDs for the corresponding environment.

| Environment | Worker name | Database | Intended use |
|---|---|---|---|
| `dev` | `gk-portfolio-dev` | `gk-portfolio-db-dev` | Local development and disposable test data |
| `staging` | `gk-portfolio-staging` | `gk-portfolio-db-staging` | Pre-production QA and authenticated testing |
| `production` | `gk-portfolio-production` | `gk-portfolio-db-production` | `portfolio.gulshan-kumar.me` |

Each environment requires `ADMIN_SETUP_TOKEN` as a Cloudflare secret. There is intentionally no `SESSION_SECRET`: sessions are random server-side D1 records, and the cookie carries only the session identifier. Secret values must not be placed in `vars`, committed to Git, or included in `.env` files that are tracked [4].

## Build and deploy

The generated bundle is deterministic unless `SOURCE_DATE_EPOCH` is explicitly supplied. Wrangler runs the build hook before deployment, which reduces the chance of deploying stale source.

```bash
npm run build
npm run check

# Staging release
npm run db:migrations:apply:staging
npm run deploy:staging

# Production release, only after staging verification
npm run db:migrations:apply:production
npm run deploy:production
```

For the live custom domain, production configuration uses the custom-domain route `portfolio.gulshan-kumar.me`. Dashboard paste deployment remains an emergency fallback: paste the generated `bundled_worker.js`, bind the correct production D1 database as `DB`, set the production `ADMIN_SETUP_TOKEN`, and verify `/health` before opening traffic.

## Database migrations and seeds

Schema evolution must use numbered SQL migration files in `migrations/`. Cloudflare records applied migrations and rolls back a failed migration while preserving the last successful migration [2]. Use the database name or binding intentionally and confirm the selected environment before applying a remote migration.

```bash
npx wrangler d1 migrations list gk-portfolio-db-staging --remote --env staging
npx wrangler d1 migrations apply gk-portfolio-db-staging --remote --env staging
npx wrangler d1 migrations list gk-portfolio-db-production --remote --env production
npx wrangler d1 migrations apply gk-portfolio-db-production --remote --env production
```

`seed.sql` and `scripts/seed.sql` are not production migration mechanisms. They contain default content and should be used only for new local databases or disposable staging environments. Never re-seed the live production D1 database merely because source content changed.

## Security and reliability changes in this audited version

The audit hardens the original code in several important areas. Password hashing now rejects oversized inputs and validates stored PBKDF2 records before spending CPU. Login attempts are recorded per IP and username, with a bounded ten-minute window. Contact submissions are limited to five per IP per ten minutes when a client IP is available. Admin-managed URLs are restricted to HTTP(S), same-site fragments, or safe paths before being rendered into links and image sources. Navigation IDs are allowlisted, proof item types and ratings are constrained, and the sitemap canonical URL is validated and XML-escaped.

The setup schema now executes as an atomic D1 batch rather than swallowing individual statement failures. Backup restore validates the payload and uses a single D1 batch so a failed statement does not leave the content tables half-restored. JSON responses support endpoint-specific headers such as `Retry-After`, and local HTTP development no longer receives a cookie that is impossible to send because of an unconditional `Secure` attribute.

These changes are source-verified and bundle-verified. Authenticated live testing still requires a controlled staging environment because production login, contact, CRUD, and restore operations mutate data.

## Live audit evidence

The evidence package is stored under `verification/`. The primary report is [`AUDIT_REPORT.md`](./AUDIT_REPORT.md), which separates live-verified behavior from source-only findings and records the limitations of a read-only production audit.

| Evidence file | Scope |
|---|---|
| `verification/live-homepage-findings.md` | Public SSR and initial console result |
| `verification/live-health-docs-findings.md` | D1 health and live documentation drift |
| `verification/live-admin-setup-findings.md` | Unauthenticated admin and setup lock |
| `verification/live-robots-sitemap-findings.md` | Crawler policy and sitemap |
| `verification/live-theme-findings.md` | Read-only theme toggle interaction |
| `verification/live-header-findings.md` | Cache and security response headers |

## Known limitations and next QA gate

The live audit did not submit credentials, contact data, backup files, or destructive requests. Consequently, authenticated admin workflows, contact persistence, CRUD mutations, password change, backup export/import, session expiry, and production rollback remain live-unverified. Desktop behavior was visually inspected; mobile and cross-browser screenshots must be added to the staging QA gate.

Before deploying this hardened version to production, create or refresh the staging D1 database, apply migrations, seed disposable data, run the complete authenticated flow, test backup restore failure behavior, verify rate-limit responses, test the public page at 375 px and 414 px widths, and record separate `sandbox_verified`, `staging_verified`, and `prod_verified` results.

## References

[1]: https://developers.cloudflare.com/workers/wrangler/environments/ "Cloudflare Workers — Environments"
[2]: https://developers.cloudflare.com/d1/reference/migrations/ "Cloudflare D1 — Migrations"
[3]: https://developers.cloudflare.com/d1/worker-api/d1-database/ "Cloudflare D1 — Worker API: D1 Database"
[4]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers — Secrets"
