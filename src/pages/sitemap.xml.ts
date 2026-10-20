import { getEnv } from '../lib/env';
import type { APIRoute } from 'astro';
import { getAllSettings, getServices, getProjects, escHtml } from '../lib/db';
import { getSiteUrl } from '../lib/env';

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv();
  const db = env?.DB;
  const settings = await getAllSettings(db);
  const seo = settings.seo || {};
  const g = settings.global || {};
  const url = new URL(request.url);
  const base = (seo.canonical || g.portfolio || getSiteUrl(env, url.origin)).replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const ogImg = seo.og_image || `${base}/og-image.png`;
  const imgTitle = seo.og_title || `${g.name || 'Your Name'} — ${g.tagline || 'Automation & AI Systems Engineer'}`;

  const [services, projects] = await Promise.all([
    getServices(db, true),
    getProjects(db, true),
  ]);

  const serviceUrls = services
    .filter((s: any) => s.slug)
    .map(
      (s: any) => `  <url>
    <loc>${escHtml(base)}/services/${escHtml(s.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const projectUrls = projects
    .filter((p: any) => p.slug)
    .map(
      (p: any) => `  <url>
    <loc>${escHtml(base)}/work/${escHtml(p.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escHtml(base)}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${escHtml(ogImg)}</image:loc>
      <image:title>${escHtml(imgTitle)}</image:title>
    </image:image>
  </url>

  <url>
    <loc>${escHtml(base)}/work</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${serviceUrls ? serviceUrls + '\n' : ''}${projectUrls ? projectUrls + '\n' : ''}  <url>
    <loc>${escHtml(base)}/llms.txt</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${escHtml(base)}/llms-full.txt</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
