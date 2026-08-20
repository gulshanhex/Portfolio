# Live Robots and Sitemap Findings

The live `robots.txt` at `https://portfolio.gulshan-kumar.me/robots.txt` includes Cloudflare-managed content-signal directives followed by the application’s own rules. The application section disallows `/admin`, `/api/`, and `/setup`, and declares `https://portfolio.gulshan-kumar.me/sitemap.xml` as the sitemap. Evidence screenshot: `/home/ubuntu/screenshots/portfolio_gulshan-ku_2026-08-20_20-08-31_2412.webp`. Browser markdown: `/home/ubuntu/page_texts/portfolio.gulshan-kumar.me_robots.txt.md`.

The live sitemap at `https://portfolio.gulshan-kumar.me/sitemap.xml` returned valid XML with two entries: the homepage and `/docs`. The canonical host is consistent with the live deployment, and `/admin` and `/setup` were not included. Evidence screenshot: `/home/ubuntu/screenshots/portfolio_gulshan-ku_2026-08-20_20-08-40_4884.webp`. Browser markdown: `/home/ubuntu/page_texts/portfolio.gulshan-kumar.me_sitemap.xml.md`.

The current source constructs the sitemap with a canonical value from D1 and does not XML-escape it. The hardened renderer should validate or XML-escape the canonical URL before placing it inside `<loc>`.
