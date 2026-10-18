# Deployment & Post-Deploy Verification Guide

Follow these steps in exact order to deploy `gk-portfolio-astro` safely without losing any existing D1 database content:

---

## Step 1: Export a JSON Backup from `/admin`

1. Open your currently deployed admin dashboard at `/admin` and sign in.
2. Navigate to the **Backup** panel in the sidebar.
3. Click **Export Backup (JSON)** and save the downloaded `.json` snapshot to your computer before making any changes.

---

## Step 2: Install Dependencies (`npm install`)

Ensure the genuine `inter-variable.woff2` and `material-icons-round.woff2` font files are placed in `public/fonts/`, then run `npm install` from the project root to resolve dependencies (using `.npmrc` `legacy-peer-deps=true`) and generate a real `package-lock.json`:

```bash
npm install
```

---

## Step 3: Build the Application (`npm run build`)

Run the build pipeline, which first executes `scripts/check-assets.mjs` (verifying all required icons, manifests, and `.woff2` magic bytes and minimum file sizes) and `scripts/prepare-wrangler.mjs`, followed by `astro build`:

```bash
npm run build
```

---

## Step 4: Deploy to Cloudflare (`npm run deploy`)

Deploy the compiled Worker bundle and static assets to Cloudflare with `--keep-vars` so existing Worker environment variables and secrets are preserved:

```bash
npm run deploy
```

*(If your remote D1 database does not yet have the Phase 4 `slug`, `long_description`, `features`, `problem`, `solution`, and `result` columns, you can either run `npm run db:migrate:remote` or proceed directly to Step 5, which runs `ensureDatabaseSchema` automatically.)*

---

## Step 5: Run Idempotent Schema & Default Sync (`/setup?token=<ADMIN_SETUP_TOKEN>`)

Open the setup endpoint once in your browser using your configured `ADMIN_SETUP_TOKEN`:

```text
https://portfolio.gulshan-kumar.me/setup?token=<ADMIN_SETUP_TOKEN>
```

On an already-initialized database, this endpoint will **not** overwrite your content or admin user; it idempotently runs `ensureDatabaseSchema` to:
- Add any missing Phase 4 columns (`slug`, `long_description`, `features`, `problem`, `solution`, `result`) and unique slug indexes.
- Backfill missing slugs from existing service and project titles.
- Insert the `faq` row into `sections` (`INSERT OR IGNORE`).
- Update `hero.cta_primary_*`, `hero.cta_secondary_*`, and `hero.status_label` **only** if they still match the old unedited defaults.

---

## Step 6: Post-Deploy Verification Checklist

Verify each of the following in production after deploying:

1. **Icons render**: Confirm Material Icons Round ligatures (`cloud`, `cloud_sync`, `smart_toy`, `memory`, `build`, `work`, `school`, `quiz`, etc.) render properly across both the public homepage and `/admin`.
2. **Bottom navigation bar on phone**: Open the site on a mobile viewport (`< 768px`) and verify the fixed bottom navigation bar and More sheet operate cleanly without horizontal scroll.
3. **Service detail route (`/services/<slug>`)**: In `/admin` → **Services**, create or edit a service with a `slug`, `long_description`, and `features`, save it, and open `/services/<slug>` to confirm the detail page renders your text.
4. **Section Copy persistence**: In `/admin` → **Section Copy**, edit a section eyebrow, title, or subtitle, click **Save Section Copy** (confirming the server toast), and refresh the homepage `/` to see the updated heading.
5. **Install the PWA**: Install the site via the browser's install prompt (or "Add to Home Screen" on mobile) and confirm it launches in standalone mode with no install banners visible.
6. **Offline page works**: With the Service Worker active, toggle offline mode in DevTools (or disconnect network) and navigate to an uncached URL to confirm the branded offline fallback page renders without a redirect error.
