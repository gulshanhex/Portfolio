# Live Admin and Setup Findings

## Unauthenticated admin

The read-only request to `https://portfolio.gulshan-kumar.me/admin` returned the expected login page titled `Admin Login · GK Portfolio`. The dashboard was not exposed without a session. The page displayed username/password fields, a sign-in control, and links back to the public site and docs. Evidence screenshot: `/home/ubuntu/screenshots/portfolio_gulshan-ku_2026-08-20_20-08-04_7660.webp`. Browser markdown: `/home/ubuntu/page_texts/portfolio.gulshan-kumar.me_admin.md`.

## Setup route without token

The read-only request to `https://portfolio.gulshan-kumar.me/setup` returned `Unauthorized` and did not expose the initialization form. Evidence screenshot: `/home/ubuntu/screenshots/portfolio_gulshan-ku_2026-08-20_20-08-12_3960.webp`. Browser markdown: `/home/ubuntu/page_texts/portfolio.gulshan-kumar.me_setup.md`.

The endpoint explicitly tells an unauthenticated visitor to pass `ADMIN_SETUP_TOKEN` in the query string. This is operationally convenient but query-string tokens can enter browser history, access logs, analytics, and copied URLs; the hardened source should keep the one-time route disabled after initialization and document immediate secret deletion/rotation.
