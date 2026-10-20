# Astro 7 Upgrade — Migration Notes

Branch: `astro-7-upgrade`
Status: **work in progress — not yet verified by a production build.**

This branch upgrades **Astro 5 -> 7** and **@astrojs/cloudflare 12 -> 14**.
It is meant to be test-deployed on a preview/test Worker before merging to `main`.

## Changes made

### Dependencies (`package.json`, `package-lock.json` regenerated)
| Package | Before | After |
| :-- | :-- | :-- |
| `astro` | ^5.12.0 | ^7.4.1 |
| `@astrojs/cloudflare` | ^12.6.0 | ^14.4.0 |
| `@cloudflare/workers-types` | ^4.20250214.0 | ^5.20261016.1 |
| `wrangler` | ^4.30.0 | ^4.125.0 (required by adapter v14) |
| `engines.node` | >=20.0.0 | >=22.22.0 |

### Code — `Astro.locals.runtime` was removed in adapter v14
- Replaced `Astro.locals.runtime?.env` / `locals.runtime?.env` with a `getEnv()`
  helper in **19 files**.
- Added `getEnv()` to `src/lib/env.ts`, backed by `import { env } from 'cloudflare:workers'`
  (the documented replacement for `Astro.locals.runtime.env`).
- `src/env.d.ts`: removed the deleted `Runtime` type; updated the
  `@cloudflare/workers-types` reference (v5 dropped the dated `2023-07-01` entrypoint).

### Configuration
- `wrangler.jsonc`: `main` changed from `./dist/_worker.js/index.js` to
  `@astrojs/cloudflare/entrypoints/server`; added the `global_fetch_strictly_public`
  compatibility flag.

## Not verified (could not run a build in this environment)
- A full `astro build` / `wrangler deploy` was **not** run here.
- Astro 7 uses a new **Rust compiler that is stricter about HTML** — unclosed tags
  now produce build errors, and invalid markup is no longer auto-corrected. Some
  `.astro` templates may need fixing; the build log will name them.
- The adapter v14 output layout changed (`dist/server/entry.mjs` plus a generated
  `dist/server/wrangler.json`). Confirm the Cloudflare deploy command still resolves
  the correct configuration.

## Cloudflare Worker settings to check
- **Build command:** `npm run build` (unchanged).
- **Deploy command:** `npx wrangler deploy --keep-vars` — verify it still works with
  the new entrypoint; if not, deploy against the generated `dist/server/wrangler.json`.
- **Node version:** must be >= 22.22.0 (the current build image uses Node 24.x — fine).

## How to test
1. Point a test/preview Worker (or the existing Worker) at this branch.
2. Deploy and read the build log.
3. Fix anything the Rust compiler flags, then re-push to this branch.
4. Merge to `main` only once the preview deploy is clean.

## References
- Astro v7 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v7/
- Astro v6 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v6/
- Cloudflare adapter guide: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
