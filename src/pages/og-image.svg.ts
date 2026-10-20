import type { APIRoute } from 'astro';
import { getAllSettings, escHtml } from '../lib/db';
import { t } from '../lib/ui-strings';

/**
 * Dynamic Vector OpenGraph Card (/og-image.svg)
 * Reflects live name, tagline, location, and status from Cloudflare D1.
 */
export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const settings = await getAllSettings(db);
  const g = settings.global || {};
  const hero = settings.hero || {};
  const contact = settings.contact || {};

  const name = escHtml(g.name || 'Your Name');
  const tagline = escHtml(g.tagline || 'Automation & AI Systems Engineer');
  const location = escHtml((g.location || 'Remote').toUpperCase());
  const statusLabel = escHtml(contact.availability_badge || hero.status_label || 'AVAILABLE FOR PROJECTS');
  const portfolioHost = escHtml((g.portfolio || 'https://portfolio.example.com').replace(/^https?:\/\//, ''));
  const brandMark = escHtml(t(settings, 'a11y.brand_mark'));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${name} — ${tagline}">
  <defs>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#141916" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0A0C0B"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="6" fill="#2FBF71"/>
  <rect x="40" y="40" width="1120" height="550" rx="16" fill="none" stroke="#34423C" stroke-width="2"/>

  <!-- Status Badge -->
  <rect x="80" y="80" width="380" height="40" rx="20" fill="rgba(47, 191, 113, 0.14)" stroke="rgba(47, 191, 113, 0.34)" stroke-width="1"/>
  <circle cx="102" cy="100" r="6" fill="#2FBF71"/>
  <text x="120" y="105" fill="#2FBF71" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="600" letter-spacing="1">${statusLabel} · ${location}</text>

  <!-- Brand Wordmark -->
  <text x="1050" y="112" fill="#F4F1E8" font-family="'Inter', sans-serif" font-size="38" font-weight="800" letter-spacing="-1">${brandMark}</text>
  <circle cx="1114" cy="106" r="6" fill="#2FBF71"/>

  <!-- Headline -->
  <text x="80" y="220" fill="#F4F1E8" font-family="'Inter', sans-serif" font-size="64" font-weight="800" letter-spacing="-2">I build bots &amp; automation</text>
  <text x="80" y="295" fill="#2FBF71" font-family="'Inter', sans-serif" font-size="64" font-weight="800" letter-spacing="-2">that run your business.</text>

  <!-- Subheadline -->
  <text x="80" y="360" fill="#A6B0AB" font-family="'Inter', sans-serif" font-size="24" font-weight="500">From custom AI workflows to automated scaling — edge &amp; control systems.</text>

  <!-- Footer Info -->
  <text x="80" y="520" fill="#F4F1E8" font-family="'Inter', sans-serif" font-size="22" font-weight="700">${name} · ${location}</text>
  <text x="80" y="550" fill="#A6B0AB" font-family="'JetBrains Mono', monospace" font-size="16">${portfolioHost}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
