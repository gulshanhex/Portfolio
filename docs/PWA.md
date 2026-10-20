# Progressive Web App (PWA) & Offline Architecture

This portfolio is a full Progressive Web App (PWA) with a hand-crafted Service Worker, safe-zone maskable icons, offline fallback hydration, and responsive install controls.

## 1. Web App Manifest (`public/site.webmanifest`)

- Declared at `/site.webmanifest` and linked in [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro).
- Provides standard icons (`/favicon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`) and a dedicated safe-zone padded maskable icon (`/icon-maskable.png`).
- Defines quick-access app shortcuts for **Work Archive** (`/work`), **Selected Work** (`/#projects`), and **Get in Touch** (`/#contact`).

## 2. Service Worker (`public/sw.js`)

The Service Worker (`CACHE_NAME = 'gk-portfolio-v3'`) implements four routing rules:

1. **Resilient Install Precaching (`Promise.allSettled`)**:
   - Precaches `/offline.html`, favicons, PWA icons, and all three self-hosted `.woff2` fonts.
   - Reconstructs clean, non-redirected `Response` objects so browser navigation never rejects cached fallback responses.
2. **Strict Admin & API Bypass**:
   - Requests to `/admin*`, `/api*`, `/setup*`, and `/health` always bypass the Service Worker cache and go straight to the network.
3. **Navigation Requests (`mode === 'navigate'`)**:
   - Uses a **Network-First** strategy with automatic cache update on HTTP 200 responses, falling back to the cached page or `/offline.html` when offline.
4. **Static Assets (`/fonts/*`, `/_astro/*`, `.woff2`, `.png`, `.svg`, `.css`, `.js`)**:
   - Uses a **Cache-First** strategy with network fallback for instant repeat loads.

## 3. Admin-Editable Offline Page (`public/offline.html`)

- All text on `public/offline.html` (`offline.eyebrow`, `offline.title`, `offline.description`, `offline.retry_btn`, `offline.home_btn`) is editable in `/admin` → **Interface Text**.
- When a visitor loads any online page, [`src/components/ClientScripts.astro`](../src/components/ClientScripts.astro) syncs the resolved `offline.*` strings and active theme (`gk-theme`) into `localStorage`.
- When offline, `public/offline.html` hydrates those strings and the user's selected theme (`dark` or `light`) from `localStorage`.

## 4. Install Controls Across Devices

- **Desktop & Tablet (`>= 768px`)**: When the browser fires `beforeinstallprompt`, a labelled **Install** button (`#pwa-desktop-install`) appears in the top navigation bar.
- **Mobile Phones (`< 768px`)**: To keep the mobile top header uncluttered, no icon-only install button is shown in the phone header. Instead, a labelled **Install app** item appears inside the mobile **More** bottom sheet (`#pwa-sheet-install` in `BottomNav.astro`) and in the page footer (`#pwa-footer-install` in `Footer.astro`).
- **Standalone Mode**: All install buttons and banners automatically hide when `(display-mode: standalone)` is active.
