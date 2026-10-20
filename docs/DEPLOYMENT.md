# Cloudflare Workers & D1 Deployment Guide

This project runs on **Cloudflare Workers** with a **Cloudflare D1** serverless SQLite database and static asset serving. Zero secrets are stored in `wrangler.jsonc` or `wrangler.toml`, making the repository safe to host publicly on GitHub.

## 1. Local Development

1. **Install dependencies**:
   ```bash
   npm ci
   ```
2. **Create `.dev.vars` from the example template**:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Populate `SESSION_SECRET` and `ADMIN_SETUP_TOKEN` with strong 32+ character strings.
3. **Initialize local D1 database**:
   ```bash
   npm run db:schema:local
   npm run db:seed:local
   ```
4. **Start local dev server**:
   ```bash
   npm run dev
   ```
5. **Run first-time admin setup**:
   Open `http://localhost:4321/setup?token=YOUR_ADMIN_SETUP_TOKEN` to create your administrator user and password.

## 2. Production Deployment on Cloudflare Workers

### Step 1: Create or Bind Your D1 Database

If creating a new D1 database:
```bash
npx wrangler d1 create portfolio-cms-db
```
Ensure the `d1_databases` binding in [`wrangler.jsonc`](../wrangler.jsonc) has `"binding": "DB"`.

### Step 2: Configure Worker Secrets in Cloudflare Dashboard

In the Cloudflare Dashboard, open **Workers & Pages** → select your Worker → **Settings** → **Variables and Secrets** → **+ Add** (choose **Secret** type):

| Secret / Variable | Required | Description |
| :--- | :---: | :--- |
| `SESSION_SECRET` | **Yes** | 32+ character random secret used to HMAC-SHA256 sign session cookies and derive CSRF tokens |
| `ADMIN_SETUP_TOKEN` | **Yes** | One-time token used to authorize `/setup?token=...` |
| `ADMIN_ACCESS_KEY` | Optional | Optional stealth key; when set, `/admin` requires `/admin?key=YOUR_KEY` before showing the login screen |
| `SITE_URL` | Optional | Canonical origin URL fallback (e.g. `https://portfolio.example.com`) |
| `ADMIN_TOTP_SECRET` | Optional | Base32 TOTP secret to enforce 2FA via environment variable |
| `TURNSTILE_SECRET_KEY` | Optional | Reserved for optional Cloudflare Turnstile verification |
| `D1_DATABASE_ID` | Optional | Optional override used by `scripts/prepare-wrangler.mjs` during CI builds |

### Step 3: Connect Public GitHub Repository (Auto-Deploy)

1. Go to **Workers & Pages** → select your Worker → **Settings** → **Build** → **Connect to Git**.
2. Select your GitHub repository and configure:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy --keep-vars`
3. Why `--keep-vars` and `"keep_vars": true` matter: They guarantee that Cloudflare never deletes or overwrites the encrypted secrets you configured in the Dashboard when deploying from GitHub.

### Step 4: Initialize or Migrate Remote D1 Schema

- **First-Time Initialization**:
  Visit `https://your-domain.com/setup?token=YOUR_ADMIN_SETUP_TOKEN` in your browser. This automatically runs `ensureDatabaseSchema(db)` and seeds initial tables if no admin user exists yet.
- **Additive Remote SQL Migration (CLI)**:
  ```bash
  npm run db:migrate:remote
  ```
  *(Note: visiting `/setup?token=YOUR_ADMIN_SETUP_TOKEN` on an already-initialized database also syncs all additive schema migrations idempotently without overwriting your data.)*
