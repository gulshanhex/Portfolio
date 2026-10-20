import { getEnv } from '../lib/env';
import type { APIRoute } from 'astro';
import { getSetting } from '../lib/db';
import { getSiteUrl } from '../lib/env';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv();
  const db = env?.DB;
  const seo = (await getSetting(db, 'seo')) || {};
  const url = new URL(request.url);
  const base = (seo.canonical || getSiteUrl(env, url.origin)).replace(/\/$/, '');

  const txt = `# GK Portfolio — Robots & AI Crawler Policy (SEO + GEO + AEO)
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /setup

# Explicitly welcome AI Search & Answer Engines for GEO/AEO citation
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${base}/sitemap.xml
# LLM Context Files (https://llmstxt.org)
# ${base}/llms.txt
# ${base}/llms-full.txt
`;

  return new Response(txt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
