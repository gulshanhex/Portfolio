# GK Portfolio — Full Audit Report

**Audit date:** 21 August 2026 (IST)  
**Scope:** Attached `gk-portfolio.zip` and the live deployment at [portfolio.gulshan-kumar.me](https://portfolio.gulshan-kumar.me)  
**Repository target:** `gulshanhex/Portfolio` only  
**Excluded repository:** `gulshanhex/codex`; verified clean and unchanged  
**Audit mode:** Source analysis plus read-only live browser verification. No live login, data mutation, contact submission, backup restore, or deployment was performed.

## Executive assessment

The live portfolio is operational. The homepage returned server-rendered content, the public theme toggle worked, the health endpoint reported a connected D1 database, the unauthenticated admin route showed only the login page, and the setup route rejected a request without a token. The deployed artifact is therefore a working bundled Worker rather than the source `worker.js` skeleton.

The most important engineering weakness was not a current homepage outage but **deployment and state-management fragility**. The project relied on manually pasting a generated bundle, had no first-class multi-environment configuration, could silently continue through failed schema statements, and could leave D1 in a partially restored state if backup import failed midway. Authentication had a brute-force delay but no real attempt limit, and the public contact form had no server-side abuse limit. Admin-managed URLs and navigation IDs were escaped inconsistently, creating a persistent injection/open-redirect risk if hostile or malformed content entered D1.

## Severity summary

| ID | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| F-01 | Critical | Deploying `worker.js` directly crashes renderer routes because it contains intentional stubs. | `worker.js:824–843`, README deployment instructions | Fixed defensively in build guard; deployment workflow documented more safely |
| F-02 | High | Manual bundle paste creates source/bundle drift and stale deployments. | `README.md`, `build.js`, `wrangler.toml` | Fixed with Wrangler custom build and `wrangler.jsonc` environments |
| F-03 | High | Backup restore performed deletes and inserts as separate requests, allowing partial data loss. | Original `worker.js` restore block around `backup/import` | Fixed with validation plus one atomic `DB.batch()` |
| F-04 | High | Login only used a random delay; there was no bounded attempt limit. | Original `worker.js:471–472` | Fixed with `auth_attempts`, a 10-minute/5-attempt window, and bounded password length |
| F-05 | High | Public contact form had no IP-based submission rate limit. | Original `worker.js:722–744` | Fixed with a 10-minute/5-submission window when a client IP is available |
| F-06 | High | User-controlled URL fields were escaped but not scheme-validated; `javascript:` or unsafe external values could become links/images. | `src/templates/public.js` URL interpolations | Fixed with HTTP(S)/fragment/path validation before rendering |
| F-07 | High | `nav.items` was inserted into fragment URLs without validation. | Original `src/templates/public.js:62–63` | Fixed with strict anchor-ID validation |
| F-08 | Medium | Sitemap canonical value was inserted into XML without XML escaping or URL validation. | Original `worker.js` sitemap route | Fixed with `safeHttpUrl()` and `xmlEsc()` |
| F-09 | Medium | `jsonRes()` ignored extra headers, so endpoint-specific headers such as `Retry-After` could not be emitted. | Original response helper | Fixed by adding the `extra` header parameter |
| F-10 | Medium | Setup schema execution swallowed every D1 error and could report progress after a partial schema failure. | Original setup loop | Fixed by using atomic `DB.batch()` and allowing failure to surface |
| F-11 | Medium | Proof-item type and rating were not constrained; admin data could break the expected UI path. | Original `/api/admin/proof` handlers | Fixed with allowlist and rating validation |
| F-12 | Medium | Password input was not bounded before PBKDF2 work, creating avoidable CPU/memory abuse potential. | Original `hashPassword`/login path | Fixed with a 256-character maximum and hash-format validation |
| F-13 | Medium | Cookie helper always emitted `Secure`, which complicates local HTTP development. | Original `setSessionCookie()`/`clearCookie()` | Fixed to emit `Secure` based on request protocol |
| F-14 | Medium | Live `/docs` claimed `SESSION_SECRET` was required and described a nonexistent general `/api/public/*` surface. | Live `/docs`, saved under `docs/live-verification/live-health-docs-findings.md` | Fixed in source docs |
| F-15 | Low | No CSP or Worker-level HSTS header was observed in live probes. | Live header probe | Not changed automatically; CSP needs nonce architecture and HSTS should be confirmed at zone level |
| F-16 | Low | The public `/health` endpoint reveals that D1 is connected and includes a timestamp. | Live `/health` | Accepted as an operational endpoint; restrict or authenticate it if threat model requires |
| F-17 | Low | Source contains modular `src/api/*` and `src/lib/*` files that are not the actual bundle inputs for all runtime paths, so they can drift from `worker.js`. | Repository structure and build script | Documented as a maintainability risk; future refactor should establish one authoritative module graph |

## Fixes implemented in the working source

The Worker now has a bounded password length, validated PBKDF2 record format, environment-aware cookies, timing-safe setup-token comparison, login attempt tracking, contact submission throttling, safer URL rendering, strict navigation IDs, XML-safe sitemap generation, valid extra response headers, strict proof-item validation, defensive JSON payload checks, and atomic schema/backup operations.

The deployment surface now includes `wrangler.jsonc` with separate `dev`, `staging`, and `production` environments; explicit D1 binding placeholders; required-secret declarations; a Worker build hook; observability settings; an environment-safe `.gitignore`; package scripts; a versioned `migrations/0001_initial.sql`; and an optional non-production seed script at `scripts/seed.sql`.

## Live verification results

| Flow | Result | Evidence |
|---|---|---|
| Public homepage | Passed; HTTP 200 and full SSR content observed | `docs/live-verification/live-homepage-findings.md` |
| Browser console on initial load | No console output/errors observed | `docs/live-verification/live-homepage-findings.md` |
| Theme toggle | Passed; light-to-dark state changed without a network write | `docs/live-verification/live-theme-findings.md` |
| `/health` | Passed; `status: ok`, `db: connected` | `docs/live-verification/live-health-docs-findings.md` |
| `/admin` without session | Passed; login page only, no dashboard | `docs/live-verification/live-admin-setup-findings.md` |
| `/setup` without token | Passed; unauthorized, no setup form exposed | `docs/live-verification/live-admin-setup-findings.md` |
| `/robots.txt` | Passed; admin/API/setup disallowed and sitemap declared | `docs/live-verification/live-robots-sitemap-findings.md` |
| `/sitemap.xml` | Passed; homepage and docs entries returned | `docs/live-verification/live-robots-sitemap-findings.md` |
| Live response headers | Baseline security and cache headers present; no CSP/HSTS observed | `docs/live-verification/live-header-findings.md` |

The live deployment’s D1 data differs from the ZIP seed content in legitimate ways, such as the public contact email and education label. This confirms that the live D1 database is the current content source and must never be overwritten by blindly re-running seed data in production.

## QA limitations and remaining handoff

Authenticated admin flows were not exercised because they would require credentials and could mutate real D1 data. The contact POST route, password-change flow, CRUD operations, backup export, and backup restore therefore remain source-verified but live-unverified. Mobile and cross-browser visual verification also remains a follow-up because this audit session used the available desktop browser viewport.

Before production deployment of the hardened bundle, run a staging migration and perform a separate authenticated QA pass covering login success/failure/rate-limit behavior, every CRUD form, contact submission throttling, backup restore rollback, session expiration, and the public page at mobile breakpoints. Keep `sandbox_verified` and `prod_verified` separate in the release record.

## External references

The deployment changes follow Cloudflare’s current Wrangler environment model, where environment-specific bindings and variables are explicitly configured and deployed with `--env` [1]. D1 schema changes are represented as versioned migration files and applied with Wrangler [2]. D1 `batch()` statements are documented as transactional and rollback-capable when a statement fails [3]. Required secrets should be declared and stored outside plaintext configuration [4].

## References

[1]: https://developers.cloudflare.com/workers/wrangler/environments/ "Cloudflare Workers — Environments"
[2]: https://developers.cloudflare.com/d1/reference/migrations/ "Cloudflare D1 — Migrations"
[3]: https://developers.cloudflare.com/d1/worker-api/d1-database/ "Cloudflare D1 — Worker API: D1 Database"
[4]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers — Secrets"
