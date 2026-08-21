# Multi-Environment Cloudflare Worker Deployment Plan

## Objective

Move GK Portfolio from a single manually pasted production bundle to a repeatable environment-aware release system without changing the current public behavior or mixing production data with development and staging data.

> **Target topology:** one source repository, one Worker codebase, three named environments, three separate D1 databases, environment-specific secrets, versioned migrations, and promotion from staging to production only after authenticated QA.

## Target topology

| Environment | Worker | Domain | D1 | Data policy |
|---|---|---|---|---|
| Development | `gk-portfolio-dev` | `workers.dev` or localhost | `gk-portfolio-db-dev` | Disposable; may be seeded |
| Staging | `gk-portfolio-staging` | `portfolio-staging.gulshan-kumar.me` or preview URL | `gk-portfolio-db-staging` | Sanitized or disposable; full QA |
| Production | `gk-portfolio-production` | `portfolio.gulshan-kumar.me` | `gk-portfolio-db-production` | Live content; never seeded blindly |

Cloudflare Wrangler environments create separate Worker names using the base name plus the environment suffix, and environment-specific bindings and variables must be declared explicitly [1]. Production should use the custom domain, while staging should use a workers.dev or dedicated staging hostname until the release is proven.

## Repository contract

The repository should have one authoritative `wrangler.jsonc`, one generated Worker entrypoint, and one source build command. `worker.js` and `src/` are editable source. `bundled_worker.js` is a generated artifact. The Wrangler `build.command` runs `node build.js` before deployment, so a source edit cannot silently leave an old bundle as the intended release.

D1 changes live under `migrations/` as ordered SQL files. Cloudflare records applied migrations and applies them sequentially; a failed migration is rolled back while the previous successful migration remains applied [2]. Seed data remains a separate, explicitly non-production operation.

## One-time provisioning sequence

First create the three D1 databases and record their IDs in the matching environment blocks. Then deploy each Worker environment with its own `DB` binding. Set `ADMIN_SETUP_TOKEN` separately for each environment; do not reuse the production token in development or staging. Cloudflare supports required-secret declarations and environment-specific secrets; secrets should not be stored in plaintext `vars` or committed dotenv files [4].

Apply the initial migration before creating content:

```bash
npx wrangler d1 migrations apply gk-portfolio-db-dev --local --env dev
npx wrangler d1 migrations apply gk-portfolio-db-staging --remote --env staging
npx wrangler d1 migrations apply gk-portfolio-db-production --remote --env production
```

Use `/setup` only for a new environment that has no admin user. After creating the first account, delete or rotate `ADMIN_SETUP_TOKEN` and verify that the setup route is no longer usable. For production, preserve the existing D1 content and do not run `scripts/seed.sql` unless the explicit intention is to replace or initialize that environment.

## Day-to-day release flow

A normal release should follow a single promotion path:

| Gate | Action | Evidence required |
|---|---|---|
| Source | Review code, audit diff, and migration SQL | Pull request or equivalent review |
| Static | Run build, syntax checks, and targeted tests | Clean CI output |
| Local D1 | Apply migrations locally and run smoke tests | `/health`, public page, setup fixture |
| Staging DB | Apply migrations remotely to staging | Migration output and backup confirmation |
| Staging Worker | Deploy `--env staging` | Deployment version and URL |
| Authenticated QA | Exercise login, CRUD, contact, backup, restore, rate limits | Acceptance checklist |
| Production DB | Apply the same migration set to production | Migration output, pre-change backup |
| Production Worker | Deploy `--env production` | Version ID and route health |
| Post-deploy | Probe `/health`, `/`, `/admin`, `/docs`, sitemap, and headers | Production verification record |

The Worker and database should be promoted separately but in dependency order: apply backward-compatible migrations first, deploy code that supports both old and new schema where necessary, then remove compatibility code only in a later release. For the current initial migration, deploy to a fresh environment first; do not use it as a destructive reset against the existing production database. The already-live database should receive the additive `migrations/0002_auth_attempts.sql` migration, which creates only the new login-attempt table and index. Apply it to staging first, verify login behavior, then apply it to production with the normal migration gate.

## Recommended CI/CD shape

The repository should use a CI workflow with three jobs. The first job runs `npm run build`, `npm run check`, and any unit or fixture tests. The second job is a staging deployment triggered from the protected integration branch and runs staging migrations before deploying the staging Worker. The third job is a manually approved production deployment that applies production migrations, deploys the production Worker, and runs post-deploy smoke checks.

Cloudflare credentials should be supplied as CI secrets with the smallest account and zone permissions possible. The CI job must never print `ADMIN_SETUP_TOKEN`, D1 IDs are configuration identifiers rather than secret values, and production deployment should require an explicit approval rule. The existing dashboard paste method should be retained only as a documented emergency fallback.

## Rollback strategy

Rollback has two independent dimensions. If only Worker code is faulty, deploy the last known-good Worker version without touching D1. If a migration is faulty, stop the Worker rollout, inspect the migration result, and use the migration system’s rollback/backup behavior or a documented forward-fix migration. Do not restore production content from an old JSON backup unless the data owner explicitly approves the loss window.

For destructive content operations, export a backup before restore. The hardened source uses a single D1 batch for restore; D1 documents batched statements as transactional, so a failed statement aborts or rolls back the sequence [3]. For operational disaster recovery, maintain periodic D1 exports and document the recovery point and recovery time objectives separately from application deployment.

## Domain and traffic progression

Keep the existing production custom domain attached to the production environment. Introduce staging with a separate hostname such as `portfolio-staging.gulshan-kumar.me` only after DNS and certificate ownership are confirmed. Never test staging against the production hostname or production D1. If gradual or canary deployment is later required, use Cloudflare Worker versions and deployment controls rather than switching the production D1 binding between environments.

## Observability and security controls

Keep Workers Observability enabled in every environment, with a higher sampling rate in staging and a deliberately chosen production rate. Log structured events without passwords, setup tokens, session cookies, full contact messages, or raw backup payloads. Monitor Worker errors, D1 latency, login failures, contact-rate-limit responses, and restore failures.

The current live response headers include frame protection, MIME sniffing protection, referrer policy, permissions policy, and route-specific cache controls. HSTS should be verified at the Cloudflare zone level before enabling it in the Worker. A strict CSP is a later hardening project because the current HTML uses inline scripts and styles; implement nonces or hashes first rather than adding a CSP that breaks the admin and public pages.

## Migration roadmap

**Phase 1 — Foundation:** keep current routes and content behavior, introduce `wrangler.jsonc`, environment-specific D1 placeholders, required secrets, build hooks, migrations, and safe scripts. This is the phase represented by the audited repository.

**Phase 2 — Controlled staging:** create staging resources, import a sanitized backup if required, apply migrations, deploy the hardened bundle, and run full authenticated QA. Do not connect staging to production D1.

**Phase 3 — Production promotion:** back up production D1, apply only reviewed migrations, deploy the production environment, run smoke tests, and monitor logs. Keep the previous Worker version available for immediate code rollback.

**Phase 4 — Maintainability:** replace the custom text concatenation bundler with a standard module build if the project grows, establish automated tests for route contracts and template escaping, and make one module graph authoritative instead of maintaining parallel inline and modular implementations.

## Definition of done

The migration is complete when a clean checkout can build the deployable bundle, local development uses a non-production D1, staging can be recreated from configuration and migrations, production deployment requires approval, secrets are environment-specific, post-deploy checks are recorded, and a Worker-only rollback can be performed without overwriting live content.

## References

[1]: https://developers.cloudflare.com/workers/wrangler/environments/ "Cloudflare Workers — Environments"
[2]: https://developers.cloudflare.com/d1/reference/migrations/ "Cloudflare D1 — Migrations"
[3]: https://developers.cloudflare.com/d1/worker-api/d1-database/ "Cloudflare D1 — Worker API: D1 Database"
[4]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers — Secrets"
