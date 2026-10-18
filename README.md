# GK Portfolio — Modular Astro 5 SSR + Cloudflare Workers & D1 Stack

Personal portfolio and edge CMS for **Gulshan Kumar** ([LIVE:portfolio.gulshan-kumar.me](https://portfolio.gulshan-kumar.me)), built on **Astro 5 SSR + `@astrojs/cloudflare` + Cloudflare D1**.

> **Public GitHub Repo Safe:** No secrets or `[vars]` are stored in `wrangler.jsonc`. It has `keep_vars = true` enabled so all Secrets configured in your Cloudflare Worker Dashboard (`Settings → Variables and Secrets → Type: Secret`) are preserved across every GitHub auto-deployment.

---

## Step-by-Step: Connect Public GitHub Repo to Your EXISTING Worker (Bina Worker Delete Kiye)

Agar aapne pehle se Cloudflare Worker (`gk-portfolio`) "Edit Code" se banaya hua hai aur `DB` (D1) bind kar rakha hai, toh **Worker delete karne ki zaroorat nahi hai**:

### Step 1 — Worker Name Match Karein
- Apne Cloudflare Dashboard me dekhein ki aapke existing Worker ka exact naam kya hai (default: `gk-portfolio`).
- Agar naam `gk-portfolio` hai toh kuch change nahi karna. Agar alag naam hai, toh `wrangler.jsonc` ki pehli line me `name: "aapka-worker-name"` kar dein.
- `wrangler.jsonc` me apna `database_id` aur `database_name` check kar lein (Note: D1 `database_id` sirf ek internal binding UUID hai; bina aapke Cloudflare login/API token ke koi bhi public repo se aapka DB access nahi kar sakta. Agar aap `database_id` bhi repo me nahi rakhna chahte, toh build environment me `D1_DATABASE_ID` secret de sakte hain — `scripts/prepare-wrangler.mjs` usko build time par auto-inject kar dega).

### Step 2 — Worker ke "Variables and Secrets" me `Secret` Mode Set Karein
1. Cloudflare Dashboard → **Workers & Pages** → Apne existing Worker (`gk-portfolio`) par click karein.
2. **Settings** tab → **Variables and Secrets** section me jayein.
3. Agar wahan pehle se koi plain `Text` variable hai jise aap secret rakhna chahte hain, toh use hata kar **+ Add** par click karein aur **Type: `Secret`** (out of `Text`, `JSON`, `Secret`) select karke add karein:
   - **`ADMIN_SETUP_TOKEN`** → Type: **`Secret`** → Value: कोई भी 32+ characters ka strong secret token.
   - **`SESSION_SECRET`** → Type: **`Secret`** → Value: कोई भी 32+ characters ka random secret (ye login session cookie ko HMAC-SHA256 se cryptographically sign karta hai).
   - *(Optional)* **`ADMIN_ACCESS_KEY`** → Type: **`Secret`** → Value: Secret key jo `/admin` ko stealth 404 ke peeche chhupa deti hai (`/admin?key=YOUR_KEY`).
   - *(Optional)* **`SITE_URL`** → Type: **`Secret`** → Value: `https://portfolio.gulshan-kumar.me`
   - *(Optional)* **`ENVIRONMENT`** → Type: **`Secret`** → Value: `production`
4. **Deploy / Save** par click karein. (Aapki existing D1 binding `DB` jo **Bindings** tab me hai, woh waise hi rahegi).

### Step 3 — Code ko Public GitHub Repository me Push Karein
Is project ke saare files (`package.json`, `astro.config.mjs`, `wrangler.jsonc`, `src/`, `public/`, `scripts/`) apne Public GitHub repo ke root me push kar dein:
```bash
git init
git add .
git commit -m "Upgrade to modular Astro 5 SSR stack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 4 — Existing Worker ko GitHub Repo se Connect Karein (Auto-Deploy)
1. Cloudflare Dashboard → **Workers & Pages** → Apne existing Worker (`gk-portfolio`) par click karein.
2. **Settings** tab → **Build** section me jayein.
3. **Git Repository** ke samne **Connect** (ya **Connect to Git**) button par click karein.
4. **GitHub** select karein, apna account authorize karein, aur apna public repository select karein.
5. **Build configuration** me ye details bharein:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy --keep-vars`
   - **Root directory**: `/` (default)
6. **Save and Deploy** par click karein!
   - Ab jab bhi aap GitHub par `git push` karenge, Cloudflare automatically `npm run build` chalayega aur aapke **existing Worker** par deploy kar dega!

### Step 5 — Existing D1 Database me New Tables Sync Karein
Deploy complete hone ke baad, ek baar browser me ye URL open karein:
```text
https://portfolio.gulshan-kumar.me/setup?token=YOUR_ADMIN_SETUP_TOKEN
```
- Agar aapka admin user pehle se bana hua hai, toh ye aapka koi bhi purana data delete kiye bina naye schema updates ko automatically sync kar dega.
- Agar naya DB hai, toh aapse Admin Username aur Password banane ko kahega.
