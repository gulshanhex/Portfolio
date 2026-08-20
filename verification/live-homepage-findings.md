# Live Homepage Findings

- Audited URL: https://portfolio.gulshan-kumar.me/
- Audit mode: read-only browser inspection; no login, writes, or submissions performed.
- Page title: Gulshan Kumar — Automation & AI Systems Engineer.
- The homepage returned server-rendered content for navigation, hero, about, services, skills, experience, education, proof, contact form, footer, and external resume/social links.
- Visible public content matched the uploaded Worker’s documented feature set, with live data including the public contact email, Google Drive resume link, two experience records, two education records, organizations, and testimonials.
- Screenshot evidence: /home/ubuntu/screenshots/portfolio_gulshan-ku_2026-08-20_20-06-56_1672.webp
- Browser console check after initial load: no console output/errors observed.
- Live markdown extraction was saved by the browser under /home/ubuntu/page_texts/portfolio.gulshan-kumar.me_.md.
- Initial visual observation: page loaded successfully at desktop viewport and showed the intended light theme; full-page height was approximately 6,987 px.

## Initial Live Mismatches / Notes

- The uploaded seed values and README describe some content differently from the live page, such as the live contact email and education school label. This indicates the live D1 data has been edited after the ZIP’s initial seed, so source/seed parity must not be treated as live-content parity.
- The public page exposes `/docs` as a footer link, consistent with the source.
- The live page is currently serving the bundled artifact successfully; this is important evidence that `worker.js` itself is not the deployed artifact.
