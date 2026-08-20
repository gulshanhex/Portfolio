// ── Public API Handlers ───────────────────────────────────────────────────

import { addSubmission, getSiteData } from '../lib/db.js';
import { jsonResponse, badRequest, serverError } from '../lib/response.js';
import { getClientIp } from '../lib/response.js';

// ── Contact Form Submission ───────────────────────────────────────────────
export async function handleContactSubmit(request, env) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Check form is enabled
    const DB = env.DB;
    const cfgRow = await DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('contact').first();
    const cfg = cfgRow ? JSON.parse(cfgRow.value) : {};
    if (cfg.form_enabled === false) {
      return jsonResponse({ error: 'Contact form is disabled.' }, 403);
    }

    const body = await request.json().catch(() => null);
    if (!body) return badRequest('Invalid request body');

    const { name, email, subject, message } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
      return badRequest('Name is required (max 100 chars)');
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) {
      return badRequest('Valid email is required');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) {
      return badRequest('Message must be between 5 and 5000 characters');
    }

    const ip = getClientIp(request);
    await addSubmission(DB, {
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      subject: subject ? String(subject).trim().slice(0, 200) : null,
      message: message.trim().slice(0, 5000),
      ip
    });

    return jsonResponse({ ok: true, message: "Message received! I'll get back to you soon." });
  } catch (err) {
    console.error('Contact submit error:', err);
    return serverError('Failed to save message. Please try again.');
  }
}

// ── Sitemap ───────────────────────────────────────────────────────────────
export async function handleSitemap(env) {
  try {
    const DB = env.DB;
    const row = await DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('seo').first();
    const seo = row ? JSON.parse(row.value) : {};
    const base = seo.canonical || 'https://portfolio.gulshan-kumar.me';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
  <url>
    <loc>${base}/docs</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch {
    return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

// ── Robots ────────────────────────────────────────────────────────────────
export function handleRobots(request) {
  const url = new URL(request.url);
  const base = url.origin;
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /setup

Sitemap: ${base}/sitemap.xml`;
  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' }
  });
}

// ── Health Check ──────────────────────────────────────────────────────────
export async function handleHealth(env) {
  try {
    await env.DB.prepare('SELECT 1').first();
    return jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected'
    });
  } catch (err) {
    return jsonResponse({ status: 'error', db: 'disconnected', error: err.message }, 503);
  }
}
