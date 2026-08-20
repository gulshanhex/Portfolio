/**
 * GK Portfolio — Cloudflare Worker (Source Skeleton)
 *
 * ⚠️  THIS FILE IS NOT THE DEPLOYABLE ARTIFACT.
 *     The deployable file is:  bundled_worker.js
 *     Generate it by running:  node build.js
 *     Then paste bundled_worker.js into the Cloudflare Worker editor.
 *
 * Routes:
 *   GET  /                    → Public portfolio (SSR from D1)
 *   GET  /docs                → Docs / Setup page
 *   GET  /admin               → Admin panel (login or dashboard)
 *   POST /admin/login         → Login form handler
 *   POST /admin/logout        → Logout
 *   *    /api/admin/*         → Admin API (session-protected)
 *   POST /api/contact         → Public contact form
 *   GET  /sitemap.xml         → Auto-generated sitemap
 *   GET  /robots.txt          → Robots policy
 *   GET  /health              → DB health check
 *   GET  /setup               → One-time DB init (ADMIN_SETUP_TOKEN required)
 */

// ═══════════════════════════════════════════════════════════════════════════
// ── AUTH (inline) ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PBKDF2_ITERS = 100_000;
const MAX_PASSWORD_LENGTH = 256;
const LOGIN_WINDOW_MINUTES = 10;
const LOGIN_MAX_ATTEMPTS = 5;
const CONTACT_WINDOW_MINUTES = 10;
const CONTACT_MAX_SUBMISSIONS = 5;

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password must be between 8 and ${MAX_PASSWORD_LENGTH} characters.`);
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERS, hash: 'SHA-256' }, km, 256);
  return `pbkdf2:${bufToHex(salt)}:${bufToHex(new Uint8Array(bits))}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > MAX_PASSWORD_LENGTH || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2' || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const salt = hexToBuf(parts[1]);
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERS, hash: 'SHA-256' }, km, 256);
  return timingSafeEq(bufToHex(new Uint8Array(bits)), parts[2]);
}

function genSessionId() { return bufToHex(crypto.getRandomValues(new Uint8Array(32))); }

async function createSession(DB, userId, ip, ua) {
  const id = genSessionId();
  const exp = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await DB.prepare('INSERT INTO admin_sessions (id,user_id,expires_at,ip,user_agent) VALUES (?,?,?,?,?)')
    .bind(id, userId, exp, ip || null, ua || null).run();
  return id;
}

async function validateSession(DB, sid) {
  if (!sid || sid.length !== 64) return null;
  return DB.prepare(
    `SELECT s.user_id,s.expires_at,u.username FROM admin_sessions s
     JOIN admin_users u ON u.id=s.user_id
     WHERE s.id=? AND s.expires_at > datetime('now')`
  ).bind(sid).first();
}

async function deleteSession(DB, sid) {
  await DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(sid).run();
}

function setSessionCookie(sid, requestUrl) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `gk_session=${sid}; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_MS / 1000}`;
}
function clearCookie(requestUrl) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `gk_session=; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function getSidFromCookie(hdr) {
  if (!hdr) return null;
  const m = hdr.match(/(?:^|;\s*)gk_session=([a-f0-9]{64})/);
  return m ? m[1] : null;
}

function bufToHex(b) { return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join(''); }
function hexToBuf(h) { const a = new Uint8Array(h.length / 2); for (let i = 0; i < h.length; i += 2) a[i / 2] = parseInt(h.slice(i, i + 2), 16); return a; }
function timingSafeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function timingSafeStringEq(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  const max = Math.max(left.length, right.length);
  let result = left.length ^ right.length;
  for (let i = 0; i < max; i++) result |= (left.charCodeAt(i % Math.max(left.length, 1)) || 0) ^ (right.charCodeAt(i % Math.max(right.length, 1)) || 0);
  return result === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// ── DB HELPERS (inline) ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function getSetting(DB, key) {
  const r = await DB.prepare('SELECT value FROM site_settings WHERE key=?').bind(key).first();
  if (!r) return null;
  try { return JSON.parse(r.value); } catch { return r.value; }
}
async function setSetting(DB, key, value) {
  const j = typeof value === 'string' ? value : JSON.stringify(value);
  await DB.prepare(`INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`)
    .bind(key, j).run();
}
async function getAllSettings(DB) {
  const { results } = await DB.prepare('SELECT key,value FROM site_settings').all();
  const o = {};
  for (const r of results) { try { o[r.key] = JSON.parse(r.value); } catch { o[r.key] = r.value; } }
  return o;
}
async function getSections(DB) {
  const { results } = await DB.prepare('SELECT * FROM sections ORDER BY order_idx').all();
  return results;
}
async function getSkills(DB, vis = false) {
  const q = vis ? 'SELECT * FROM skills WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM skills ORDER BY order_idx';
  const { results: groups } = await DB.prepare(q).all();
  const { results: pills } = await DB.prepare('SELECT * FROM skill_pills ORDER BY skill_id,order_idx').all();
  return groups.map(g => ({ ...g, pills: pills.filter(p => p.skill_id === g.id) }));
}
async function getServices(DB, vis = false) {
  const { results } = await DB.prepare(vis ? 'SELECT * FROM services WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM services ORDER BY order_idx').all();
  return results;
}
async function getExperiences(DB, vis = false) {
  const { results } = await DB.prepare(vis ? 'SELECT * FROM experiences WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM experiences ORDER BY order_idx').all();
  return results.map(e => ({ ...e, bullet_points: safeJSON(e.bullet_points, []), tags: safeJSON(e.tags, []) }));
}
async function getEducation(DB, vis = false) {
  const { results } = await DB.prepare(vis ? 'SELECT * FROM education WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM education ORDER BY order_idx').all();
  return results.map(e => ({ ...e, items: safeJSON(e.items, []), pills: safeJSON(e.pills, []) }));
}
async function getProjects(DB, vis = false) {
  const { results } = await DB.prepare(vis ? 'SELECT * FROM projects WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM projects ORDER BY order_idx').all();
  return results.map(p => ({ ...p, tags: safeJSON(p.tags, []), stack: safeJSON(p.stack, []) }));
}
async function getProofItems(DB, vis = false) {
  const { results } = await DB.prepare(vis ? 'SELECT * FROM proof_items WHERE visible=1 ORDER BY order_idx' : 'SELECT * FROM proof_items ORDER BY order_idx').all();
  return results;
}
async function getSubmissions(DB) {
  const { results } = await DB.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 100').all();
  return results;
}
async function addSubmission(DB, { name, email, subject, message, ip }) {
  await DB.prepare('INSERT INTO contact_submissions (name,email,subject,message,ip) VALUES (?,?,?,?,?)')
    .bind(name, email, subject || null, message, ip || null).run();
}
async function markSubRead(DB, id) {
  await DB.prepare('UPDATE contact_submissions SET read=1 WHERE id=?').bind(id).run();
}
async function getAdminUser(DB, username) {
  return DB.prepare('SELECT * FROM admin_users WHERE username=?').bind(username).first();
}
async function getDashStats(DB) {
  const [p, e, m, u] = await Promise.all([
    DB.prepare('SELECT COUNT(*) as n FROM projects WHERE visible=1').first(),
    DB.prepare('SELECT COUNT(*) as n FROM experiences WHERE visible=1').first(),
    DB.prepare('SELECT COUNT(*) as n FROM contact_submissions').first(),
    DB.prepare('SELECT COUNT(*) as n FROM contact_submissions WHERE read=0').first()
  ]);
  return { projects: p?.n || 0, experiences: e?.n || 0, submissions: m?.n || 0, unread: u?.n || 0 };
}
async function getSiteData(DB) {
  const [settings, sections, skills, services, experiences, education, projects, proof] = await Promise.all([
    getAllSettings(DB), getSections(DB), getSkills(DB, true), getServices(DB, true),
    getExperiences(DB, true), getEducation(DB, true), getProjects(DB, true), getProofItems(DB, true)
  ]);
  return { settings, sections, skills, services, experiences, education, projects, proof };
}
async function logAction(DB, action, details = null) {
  try { await DB.prepare('INSERT INTO audit_log (action,details) VALUES (?,?)').bind(action, details ? JSON.stringify(details) : null).run(); } catch { }
}
function safeJSON(s, fb = null) { if (!s) return fb; try { return JSON.parse(s); } catch { return fb; } }
function escHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
// Note: same function as sanitizeBasicHtml in src/lib/db.js — name must match
function sanitizeBasicHtml(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;(\/?(strong|em|br))\s*&gt;/gi, '<$1>'); }

// ═══════════════════════════════════════════════════════════════════════════
// ── RESPONSE HELPERS (inline) ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const SEC_HDRS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(),microphone=(),geolocation=()'
};
function htmlRes(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'no-store', ...SEC_HDRS, ...extra } });
}
function pubHtmlRes(body) {
  return new Response(body, { headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'public,max-age=60,stale-while-revalidate=300', ...SEC_HDRS } });
}
function jsonRes(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...SEC_HDRS, ...extra } });
}
function redirect(loc, status = 302) { return new Response(null, { status, headers: { Location: loc } }); }
function getIp(req) {
  return req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || null;
}
function xmlEsc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function safeHttpUrl(value, fallback) {
  try {
    const u = new URL(String(value || fallback));
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href.replace(/\/$/, '') : fallback;
  } catch {
    return fallback;
  }
}

async function countRecentAttempts(DB, ip, username) {
  if (!ip) return 0;
  const row = await DB.prepare(
    `SELECT COUNT(*) AS n FROM auth_attempts
     WHERE ip=? AND username=? AND created_at > datetime('now', ?)`
  ).bind(ip, username, `-${LOGIN_WINDOW_MINUTES} minutes`).first();
  return Number(row?.n || 0);
}

async function recordLoginAttempt(DB, ip, username, succeeded) {
  if (!ip) return;
  await DB.prepare('INSERT INTO auth_attempts (ip,username,succeeded) VALUES (?,?,?)')
    .bind(ip, username, succeeded ? 1 : 0).run();
}

async function tooManyContactSubmissions(DB, ip) {
  if (!ip) return false;
  const row = await DB.prepare(
    `SELECT COUNT(*) AS n FROM contact_submissions
     WHERE ip=? AND created_at > datetime('now', ?)`
  ).bind(ip, `-${CONTACT_WINDOW_MINUTES} minutes`).first();
  return Number(row?.n || 0) >= CONTACT_MAX_SUBMISSIONS;
}

// ═══════════════════════════════════════════════════════════════════════════
// ── SCHEMA & SEED (for /setup route) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT(datetime('now')),last_login TEXT);
CREATE TABLE IF NOT EXISTS admin_sessions(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT(datetime('now')),expires_at TEXT NOT NULL,ip TEXT,user_agent TEXT,FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS site_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE TABLE IF NOT EXISTS sections(id TEXT PRIMARY KEY,label TEXT NOT NULL,order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS skills(id INTEGER PRIMARY KEY AUTOINCREMENT,label TEXT NOT NULL,icon TEXT NOT NULL DEFAULT 'code',order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS skill_pills(id INTEGER PRIMARY KEY AUTOINCREMENT,skill_id INTEGER NOT NULL,label TEXT NOT NULL,is_hot INTEGER NOT NULL DEFAULT 0,order_idx INTEGER NOT NULL DEFAULT 0,FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY AUTOINCREMENT,icon TEXT NOT NULL DEFAULT 'build',title TEXT NOT NULL,description TEXT NOT NULL,cta_label TEXT,cta_url TEXT,order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS experiences(id INTEGER PRIMARY KEY AUTOINCREMENT,badge_label TEXT NOT NULL,badge_type TEXT NOT NULL DEFAULT 'lime',icon TEXT NOT NULL DEFAULT 'work',title TEXT NOT NULL,company TEXT NOT NULL,date_range TEXT NOT NULL,duration TEXT NOT NULL,location TEXT NOT NULL,bullet_points TEXT NOT NULL DEFAULT '[]',tags TEXT NOT NULL DEFAULT '[]',order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS education(id INTEGER PRIMARY KEY AUTOINCREMENT,period TEXT NOT NULL,degree TEXT NOT NULL,stream TEXT NOT NULL,school TEXT NOT NULL,grade TEXT NOT NULL DEFAULT 'In Progress',items TEXT NOT NULL DEFAULT '[]',pills TEXT NOT NULL DEFAULT '[]',order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,category TEXT NOT NULL,category_icon TEXT NOT NULL DEFAULT 'folder',summary TEXT NOT NULL,tags TEXT NOT NULL DEFAULT '[]',stack TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL DEFAULT 'completed',featured INTEGER NOT NULL DEFAULT 0,external_url TEXT,github_url TEXT,demo_url TEXT,image_url TEXT,order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE TABLE IF NOT EXISTS proof_items(id INTEGER PRIMARY KEY AUTOINCREMENT,type TEXT NOT NULL DEFAULT 'org',name TEXT NOT NULL,subtitle TEXT NOT NULL,logo_url TEXT,url TEXT,testimonial_text TEXT,testimonial_rating INTEGER DEFAULT 5,order_idx INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS contact_submissions(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT,message TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT(datetime('now')),read INTEGER NOT NULL DEFAULT 0,ip TEXT);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,action TEXT NOT NULL,details TEXT,created_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE TABLE IF NOT EXISTS auth_attempts(id INTEGER PRIMARY KEY AUTOINCREMENT,ip TEXT NOT NULL,username TEXT NOT NULL,succeeded INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pills_skill ON skill_pills(skill_id);
CREATE INDEX IF NOT EXISTS idx_proj_ord ON projects(order_idx);
CREATE INDEX IF NOT EXISTS idx_subs_read ON contact_submissions(read,created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup ON auth_attempts(ip,username,created_at);`;

const SEED_SETTINGS = [
  ['global', '{"name":"Gulshan Kumar","site_name":"GK Portfolio","tagline":"Automation & AI Systems Engineer","domain":"https://gulshan-kumar.me","portfolio":"https://portfolio.gulshan-kumar.me","projects_subdomain":"https://projects.gulshan-kumar.me","location":"Delhi, India","footer_text":"Built by <strong>Gulshan Kumar</strong> · Delhi, India"}'],
  ['hero', '{"headline_line1":"GULSHAN","headline_line2":"KUMAR","role_text":"<strong>Automation & AI Systems</strong> engineer crafting intelligent backends, bots & <em>real-world control systems</em>","status_label":"Available for Opportunities","status_chip":"OPEN TO WORK","cta_primary_label":"View Projects","cta_primary_url":"#projects","cta_secondary_label":"Get In Touch","cta_secondary_url":"#contact","resume_label":"Resume","quick_stats":[{"value":"2+","label":"Internships","desc":"Hands-on at real production environments in Delhi"},{"value":"20+","label":"Technical Skills","desc":"Python, bots, PLC, cloud, web, and more"},{"value":"3 mo","label":"Field Experience","desc":"Solving real engineering problems in industrial environments"}]}'],
  ['about', '{"paragraphs":["I build and explore <strong>intelligent automation and software systems</strong> — bridging the gap between physical hardware and digital infrastructure with equal curiosity for both worlds.","From backend automation tools, Telegram bots and Discord bots to working hands-on with <em>industrial control panels and PLC-based systems</em> — I thrive where software meets the real world.","Deeply curious about how systems work — from industrial control panels to cloud architectures — always focused on creating things that <strong>improve efficiency and functionality</strong>."],"quote":"Always Learning. Always Building."}'],
  ['contact', '{"email":"gulshan@gulshan-kumar.me","linkedin":"https://linkedin.com/in/gulshankumar-tech","github":"https://github.com/gulshanhex","main_site":"https://gulshan-kumar.me","portfolio":"https://portfolio.gulshan-kumar.me","resume_url":"","intro_text":"Open to internships, freelance projects, collaborations, and anything interesting. If you are building something with automation, AI, or backend systems — let\'s talk.","form_enabled":true,"availability_badge":"Open to Work","availability_visible":true}'],
  ['seo', '{"title":"Gulshan Kumar — Automation & AI Systems Engineer","description":"Portfolio of Gulshan Kumar — Automation & AI Systems | Python | Web & Cloud | Delhi, India","og_title":"Gulshan Kumar — Automation & AI Systems Engineer","og_description":"Portfolio of Gulshan Kumar — Automation & AI Systems | Python | Web & Cloud | Delhi, India","og_image":"","canonical":"https://portfolio.gulshan-kumar.me","robots":"index, follow","json_ld_enabled":true}'],
  ['theme', '{"default":"dark","user_toggle_enabled":true,"stars_enabled":true,"stars_count":80,"noise_enabled":true,"scanlines_enabled":true,"neon_intensity":"balanced"}'],
  ['nav', '{"show_resume":true,"resume_label":"Resume","items":["about","services","skills","experience","education","projects","proof","contact"]}'],
  ['proof_section', '{"section_title":"Proof & Context","orgs_title":"WHO I\'VE WORKED WITH","orgs_subtitle":"Organizations and environments that shaped my work.","testimonials_title":"What People Say","show_orgs":true,"show_testimonials":true}']
];

// ═══════════════════════════════════════════════════════════════════════════
// ── MAIN HANDLER ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const DB = env.DB;

    try {
      // ── Health ────────────────────────────────────────────────────
      if (path === '/health') {
        try {
          await DB.prepare('SELECT 1').first();
          return jsonRes({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
        } catch (e) {
          return jsonRes({ status: 'error', db: 'disconnected', error: e.message }, 503);
        }
      }

      // ── Robots ────────────────────────────────────────────────────
      if (path === '/robots.txt') {
        return new Response(
          `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /setup\n\nSitemap: ${url.origin}/sitemap.xml`,
          { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public,max-age=86400' } }
        );
      }

      // ── Sitemap ───────────────────────────────────────────────────
      if (path === '/sitemap.xml') {
        const seo = await getSetting(DB, 'seo') || {};
        const base = safeHttpUrl(seo.canonical, url.origin);
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xmlEsc(base)}/</loc><changefreq>weekly</changefreq><priority>1.0</priority><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url><url><loc>${xmlEsc(base)}/docs</loc><changefreq>monthly</changefreq><priority>0.3</priority></url></urlset>`,
          { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public,max-age=3600' } }
        );
      }

      // ── Public Contact Form ───────────────────────────────────────
      if (path === '/api/contact' && request.method === 'POST') {
        return await handleContactApi(request, DB);
      }

      // ── Setup (one-time DB init) ──────────────────────────────────
      if (path === '/setup') {
        return await handleSetup(request, url, env, DB);
      }

      // ── Admin Login / Logout ──────────────────────────────────────
      if (path === '/admin/login' && request.method === 'POST') {
        return await handleLogin(request, DB, env);
      }
      if (path === '/admin/logout' && request.method === 'POST') {
        const sid = getSidFromCookie(request.headers.get('Cookie'));
        if (sid) await deleteSession(DB, sid);
        return new Response(null, { status: 302, headers: { Location: '/admin', 'Set-Cookie': clearCookie(request.url) } });
      }

      // ── Admin API (/api/admin/*) — MUST be before /admin page block ──
      if (path.startsWith('/api/admin')) {
        const sid = getSidFromCookie(request.headers.get('Cookie'));
        const session = sid ? await validateSession(DB, sid) : null;
        if (!session) return jsonRes({ error: 'Unauthorized' }, 401);
        return await handleAdminApiRoute(request, DB, session, path);
      }

      // ── Admin Panel (page only) ────────────────────────────────────
      if (path.startsWith('/admin')) {
        const sid = getSidFromCookie(request.headers.get('Cookie'));
        const session = sid ? await validateSession(DB, sid) : null;
        if (!session) {
          if (path === '/admin' || path === '/admin/') {
            return htmlRes(renderLogin(''), 200, { 'X-Robots-Tag': 'noindex,nofollow' });
          }
          return redirect('/admin');
        }
        return htmlRes(renderAdminPanel(session.username), 200, {
          'X-Robots-Tag': 'noindex,nofollow',
          'Cache-Control': 'no-store'
        });
      }

      // ── Docs / README ─────────────────────────────────────────────
      if (path === '/docs' || path === '/readme') {
        const theme = await getSetting(DB, 'theme').catch(() => null);
        return htmlRes(renderDocs(theme?.default || 'dark'));
      }

      // ── Public Site ───────────────────────────────────────────────
      if (path === '/' || path === '/index.html') {
        const data = await getSiteData(DB);
        return pubHtmlRes(renderPublic(data));
      }

      // ── 404 ───────────────────────────────────────────────────────
      const theme = await getSetting(DB, 'theme').catch(() => null);
      return htmlRes(render404(theme?.default || 'dark'), 404);

    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ── SETUP HANDLER ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function handleSetup(request, url, env, DB) {
  const token = url.searchParams.get('token');
  const SETUP_TOKEN = env.ADMIN_SETUP_TOKEN;

  if (!SETUP_TOKEN) {
    return htmlRes('<h2 style="font-family:monospace;color:#cc4500;padding:2rem">Setup disabled: ADMIN_SETUP_TOKEN secret not configured.</h2><p style="font-family:monospace;padding:0 2rem">Set it in Worker Settings → Variables → Secrets, then redeploy.</p>');
  }
  if (!token || !timingSafeStringEq(token, SETUP_TOKEN)) {
    return htmlRes('<h2 style="font-family:monospace;color:#cc4500;padding:2rem">Unauthorized</h2><p style="font-family:monospace;padding:0 2rem">Pass your ADMIN_SETUP_TOKEN as ?token= in the URL.</p>', 403);
  }

  // Check if already initialized
  const existing = await DB.prepare('SELECT COUNT(*) as n FROM admin_users').first().catch(() => null);
  const alreadyHasUsers = existing && existing.n > 0;

  if (request.method === 'POST' && !alreadyHasUsers) {
    const fd = await request.formData();
    const username = (fd.get('username') || '').trim();
    const password = (fd.get('password') || '').trim();
    if (!username || username.length < 3) return htmlRes(setupForm(token, 'Username must be at least 3 characters.'));
    if (!password || password.length < 8) return htmlRes(setupForm(token, 'Password must be at least 8 characters.'));
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return htmlRes(setupForm(token, 'Username may only contain letters, numbers, - and _.'));

    // Run schema
    const statements = SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean);
    await DB.batch(statements.map(sql => DB.prepare(sql)));

    // Seed settings
    for (const [key, value] of SEED_SETTINGS) {
      await DB.prepare(`INSERT OR IGNORE INTO site_settings (key,value) VALUES (?,?)`).bind(key, value).run();
    }

    // Seed sections
    const secs = [['hero', 'Hero', 1], ['about', 'About', 2], ['services', 'What I Do', 3], ['skills', 'Tech Arsenal', 4], ['experience', 'Experience', 5], ['education', 'Education', 6], ['projects', 'Projects', 7], ['proof', 'Proof & Context', 8], ['contact', 'Contact', 9]];
    for (const [id, label, ord] of secs) {
      await DB.prepare('INSERT OR IGNORE INTO sections (id,label,order_idx,visible) VALUES (?,?,?,1)').bind(id, label, ord).run();
    }

    // Seed skills
    const skillGroups = [
      [1, 'Programming', 'code', 1, ['Python*', 'JavaScript*', 'HTML5', 'SQL / RDBMS', 'Bash (Basic)']],
      [2, 'Web & Backend', 'hub', 2, ['Full-Stack Dev*', 'API Integration*', 'Bot Development*', 'Telegram Bots', 'Discord Bots', 'REST APIs']],
      [3, 'Cloud & Systems', 'cloud', 3, ['Cloud Computing*', 'Cloudflare Workers*', 'System Testing', 'CS Fundamentals', 'Linux (Basic)']],
      [4, 'Industrial Automation', 'settings_suggest', 4, ['Industrial Automation*', 'PLC Systems*', 'Control Systems*', 'Process Automation', 'Electrical Panels', 'HV Safety Protocols']],
      [5, 'Electrical Systems', 'bolt', 5, ['Electronics Fundamentals*', 'Power Distribution', 'Electrical Troubleshooting', 'Transformers', 'Voltage Stabilizers', 'Wiring & Assembly']],
      [6, 'Analytical Skills', 'psychology', 6, ['Problem Solving*', 'Analytical Thinking*', 'Strategy', 'System Integration', 'Workflow Optimization']]
    ];
    for (const [id, label, icon, ord, pills] of skillGroups) {
      await DB.prepare('INSERT OR IGNORE INTO skills (id,label,icon,order_idx,visible) VALUES (?,?,?,?,1)').bind(id, label, icon, ord).run();
      for (let i = 0; i < pills.length; i++) {
        const hot = pills[i].endsWith('*');
        const lbl = pills[i].replace('*', '');
        await DB.prepare('INSERT OR IGNORE INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)').bind(id, lbl, hot ? 1 : 0, i).run();
      }
    }

    // Seed services
    const svcs = [
      ['smart_toy', 'Automation Bots', 'Telegram, Discord, and custom API bots for notifications, task queues, and workflow automation.', 1],
      ['hub', 'Backend Systems', 'Python and Node.js backends with clean APIs, D1/SQL persistence, and solid integration patterns.', 2],
      ['cloud_sync', 'Cloud & Deployment', 'Cloudflare Workers/Pages deployments, CI/CD pipelines, and reliable cloud-native architectures.', 3],
      ['code', 'Web Development', 'Full-stack web systems — from landing pages to admin panels — built clean and mobile-first.', 4],
      ['settings_suggest', 'Technical Prototyping', 'Rapid prototypes for automation ideas, hardware-software interfaces, and proof-of-concept systems.', 5],
      ['integration_instructions', 'API Integration', 'Connecting third-party services, building webhooks, and integrating complex APIs into clean backends.', 6]
    ];
    for (const [icon, title, desc, ord] of svcs) {
      await DB.prepare('INSERT OR IGNORE INTO services (icon,title,description,order_idx,visible) VALUES (?,?,?,?,1)').bind(icon, title, desc, ord).run();
    }

    // Seed experiences
    await DB.prepare(`INSERT OR IGNORE INTO experiences (id,badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (1,'Automation','lime','precision_manufacturing','Automation Intern','Losung Automation Pvt. Ltd.','May 2025 – Jun 2025','2 Months','Mahipalpur, New Delhi · On-site','["Worked in an industrial environment with <strong>electrical control panels</strong> and <strong>PLC-based systems</strong> on live production floors.","Observed and documented <strong>system integration and testing workflows</strong> for complex automation setups.","Gained hands-on exposure to <strong>control logic fundamentals</strong> applied in real industrial processes.","Followed <strong>high-voltage safety protocols</strong> — developing awareness critical to industrial environments."]','["Industrial Automation","Control Systems","PLC","Electrical Panels","Process Automation","System Testing"]',1,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO experiences (id,badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (2,'Electronics','ember','electrical_services','Electronics Intern','Elent Electronics Private Limited','Jan 2025 – Jan 2025','1 Month','New Delhi · On-site','["Industrial training focused on <strong>transformers and voltage stabilizers</strong> — from assembly to output testing.","Observed <strong>wiring, assembly, and component testing</strong> processes in a manufacturing environment.","Applied basic <strong>electrical troubleshooting techniques</strong> to identify and resolve faults."]','["Electrical Systems","Power Distribution","Troubleshooting","Electronics"]',2,1)`).run();

    // Seed education
    await DB.prepare(`INSERT OR IGNORE INTO education (id,period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (1,'Apr 2025 – Apr 2026','Senior Secondary (Class 12)','PCM + Computer Science','SBV Sarojini Nagar, Delhi','In Progress','["Industrial Automation Internship (May–Jun 2025) at Losung Automation Pvt. Ltd.","Electrical Systems Internship completed in Class 11","PCM with Computer Science and Electronics Technology curriculum","Real-world internship exposure through both Class 11 & 12"]','["Python","Full-Stack Dev","Cloud Computing","Bot Development","Industrial Automation"]',1,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO education (id,period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (2,'Apr 2023 – Mar 2024','Secondary (SSC — Class 10)','General Education','Atal Adarsh Vidyalaya Laxmi Bai Nagar, Delhi','70.8%','["Completed Secondary Education (Class X) successfully","Best Five Subjects Percentage: 70.8%","Foundational studies in Mathematics, Science, and Technology"]','["HTML5","JavaScript","RDBMS","Microsoft Office","Problem Solving"]',2,1)`).run();

    // Seed projects
    const projs = [
      [1, 'Telegram Automation Bot', 'Bot Development', 'smart_toy', 'Multi-feature Telegram bot that automates notifications, manages task queues, and integrates external APIs for real-time data delivery.', '["Bot","Automation","API"]', '["Python","Telegram API","REST API","Automation"]', 1, 'https://github.com/gulshanhex', 1],
      [2, 'Discord Notification System', 'Bot Development', 'notifications_active', 'Discord bot for server automation — announcements, role management, scheduled tasks, and webhook integrations.', '["Bot","Discord","Automation"]', '["Python","Discord.py","Webhooks","API Integration"]', 1, 'https://github.com/gulshanhex', 2],
      [3, 'Industrial Dashboard Monitor', 'Web Application', 'dashboard', 'Web-based monitoring dashboard for industrial automation data — real-time system health, alerts, and control panel status.', '["Web","Industrial"]', '["HTML5","JavaScript","Python","Industrial Automation"]', 0, null, 3],
      [4, 'Cloud Automation Pipeline', 'Cloud & Backend', 'cloud_sync', 'Automated cloud deployment and task scheduling pipeline using Python scripts and cloud computing fundamentals.', '["Cloud","Backend"]', '["Python","Cloud Computing","Automation","Scripting"]', 0, null, 4],
      [5, 'PLC Logic Visualizer', 'Industrial Automation', 'memory', 'Software interface for visualizing and testing PLC ladder logic sequences — developed during the Losung Automation internship.', '["Industrial","PLC"]', '["Python","PLC Systems","Control Systems","Industrial"]', 0, null, 5],
      [6, 'API Integration Toolkit', 'Backend Development', 'integration_instructions', 'Reusable Python toolkit for rapid API integration — handles auth flows, rate limiting, response parsing, and retry logic.', '["Backend","API"]', '["Python","API Integration","REST APIs","Full-Stack"]', 0, null, 6]
    ];
    for (const [id, title, cat, icon, sum, tags, stack, feat, gh, ord] of projs) {
      await DB.prepare('INSERT OR IGNORE INTO projects (id,title,category,category_icon,summary,tags,stack,featured,github_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,1)').bind(id, title, cat, icon, sum, tags, stack, feat, gh, ord).run();
    }

    // Seed proof items
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,url,order_idx,visible) VALUES (1,'org','Losung Automation Pvt. Ltd.','Industrial Automation','https://ui-avatars.com/api/?name=LA&background=0b1209&color=8ecf00&size=64&bold=true','#',1,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,url,order_idx,visible) VALUES (2,'org','Elent Electronics Pvt. Ltd.','Electronics Manufacturing','https://ui-avatars.com/api/?name=EE&background=0b1209&color=8ecf00&size=64&bold=true','#',2,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,url,order_idx,visible) VALUES (3,'org','SBV Sarojini Nagar','Education Institution','https://ui-avatars.com/api/?name=SBV&background=0b1209&color=8ecf00&size=64&bold=true','#',3,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,url,order_idx,visible) VALUES (4,'org','Atal Adarsh Vidyalaya','Education Institution','https://ui-avatars.com/api/?name=AAV&background=0b1209&color=8ecf00&size=64&bold=true','#',4,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (5,'testimonial','Rajiv Sharma','Senior Engineer · Losung Automation Pvt. Ltd.','https://ui-avatars.com/api/?name=Rajiv+Sharma&background=111c11&color=8ecf00&size=80&bold=true','Gulshan showed exceptional curiosity and discipline during his internship. He quickly adapted to our industrial environment and asked the right questions — a rare quality in someone so early in their career.',5,5,1)`).run();
    await DB.prepare(`INSERT OR IGNORE INTO proof_items (id,type,name,subtitle,logo_url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (6,'testimonial','Priya Nair','Technical Trainer · Elent Electronics Pvt. Ltd.','https://ui-avatars.com/api/?name=Priya+Nair&background=111c11&color=8ecf00&size=80&bold=true','In just one month, Gulshan demonstrated a strong grasp of transformer assembly and electrical troubleshooting. He was methodical, safety-conscious, and always willing to understand the why behind each process.',5,6,1)`).run();

    // Create admin user
    const hash = await hashPassword(password);
    await DB.prepare('INSERT INTO admin_users (username,password_hash) VALUES (?,?)').bind(username, hash).run();

    return htmlRes(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Setup Complete</title><style>body{font-family:monospace;background:#060908;color:#c2d4ae;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}div{text-align:center;padding:2rem}h1{color:#8ecf00;margin-bottom:1rem}p{margin-bottom:.5rem;color:#7a9070}a{color:#8ecf00}</style></head><body><div><h1>✓ Setup Complete!</h1><p>Database initialized with all default content.</p><p>Admin user "<strong style="color:#d8e8c4">${escHtml(username)}</strong>" created.</p><br/><p><a href="/admin">→ Go to Admin Panel</a></p><p><a href="/">→ View Portfolio</a></p><p style="margin-top:1.5rem;font-size:.8rem;color:#4a6048">Security tip: delete or rotate ADMIN_SETUP_TOKEN in your Worker secrets now that setup is complete.</p></div></body></html>`);
  }

  if (alreadyHasUsers) {
    return htmlRes(`<html><head><style>body{font-family:monospace;background:#060908;color:#c2d4ae;display:flex;align-items:center;justify-content:center;min-height:100vh}div{text-align:center}h2{color:#cc4500}a{color:#8ecf00}</style></head><body><div><h2>Already initialized</h2><p>Admin users already exist. Setup can only run once.</p><p><a href="/admin">→ Admin Panel</a> · <a href="/">→ Portfolio</a></p></div></body></html>`, 403);
  }

  return htmlRes(setupForm(token, ''));
}

function setupForm(token, error) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>GK Portfolio Setup</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;background:#060908;color:#c2d4ae;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}.box{background:#0b1209;border:1px solid rgba(142,207,0,.2);padding:2.5rem;width:100%;max-width:420px}h1{font-family:Georgia,serif;font-size:1.6rem;color:#8ecf00;margin-bottom:.25rem}p.sub{font-size:.8rem;color:#7a9070;margin-bottom:2rem}.err{background:rgba(204,69,0,.1);border:1px solid rgba(204,69,0,.3);color:#cc4500;padding:.6rem 1rem;margin-bottom:1rem;font-size:.82rem}label{font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:#7a9070;display:block;margin-bottom:.3rem}input{width:100%;background:#060908;border:1px solid rgba(255,255,255,.08);color:#c2d4ae;font-family:inherit;font-size:.88rem;padding:.7rem .9rem;margin-bottom:1rem;outline:none}input:focus{border-color:#8ecf00}button{width:100%;background:#8ecf00;color:#060908;border:none;font-family:inherit;font-size:.8rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:.85rem;cursor:pointer}</style></head><body><div class="box"><h1>GK Portfolio Setup</h1><p class="sub">Create your admin account to initialize the database.</p>${error ? `<div class="err">${escHtml(error)}</div>` : ''}<form method="POST" action="/setup?token=${encodeURIComponent(token)}"><label>Admin Username</label><input type="text" name="username" required minlength="3" placeholder="admin" autocomplete="username"/><label>Admin Password</label><input type="password" name="password" required minlength="8" placeholder="min 8 characters" autocomplete="new-password"/><button type="submit">Initialize Database →</button></form></div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ── LOGIN HANDLER ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function handleLogin(request, DB, env) {
  const fd = await request.formData();
  const username = String(fd.get('username') || '').trim().slice(0, 100);
  const password = String(fd.get('password') || '');
  const ip = getIp(request);

  if (!username || !password || password.length > MAX_PASSWORD_LENGTH) {
    return htmlRes(renderLogin('Invalid username or password.'), 200, { 'X-Robots-Tag': 'noindex' });
  }

  const attempts = await countRecentAttempts(DB, ip, username).catch(() => 0);
  if (attempts >= LOGIN_MAX_ATTEMPTS) {
    return htmlRes(renderLogin('Too many login attempts. Please wait 10 minutes and try again.'), 429, { 'X-Robots-Tag': 'noindex', 'Retry-After': String(LOGIN_WINDOW_MINUTES * 60) });
  }

  // Constant-time-ish delay to slow brute force without using Math.random for security decisions.
  await new Promise(r => setTimeout(r, 120));

  const user = await getAdminUser(DB, username);
  if (!user) {
    await recordLoginAttempt(DB, ip, username, false).catch(() => {});
    return htmlRes(renderLogin('Invalid username or password.'), 200, { 'X-Robots-Tag': 'noindex' });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    await recordLoginAttempt(DB, ip, username, false).catch(() => {});
    await logAction(DB, 'login_failed', { username });
    return htmlRes(renderLogin('Invalid username or password.'), 200, { 'X-Robots-Tag': 'noindex' });
  }

  const ua = request.headers.get('User-Agent') || '';
  const sid = await createSession(DB, user.id, ip, ua);
  await recordLoginAttempt(DB, ip, username, true).catch(() => {});
  await DB.prepare(`UPDATE admin_users SET last_login=datetime('now') WHERE id=?`).bind(user.id).run();
  await logAction(DB, 'login_success', { username });

  return new Response(null, {
    status: 302,
    headers: { Location: '/admin', 'Set-Cookie': setSessionCookie(sid, request.url) }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ── ADMIN API ROUTER ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function handleAdminApiRoute(request, DB, session, fullPath) {
  const path = fullPath.replace(/^\/api\/admin/, '').replace(/\/$/, '') || '/';
  const method = request.method;

  try {
    // ── Dashboard ─────────────────────────────────────────────────
    if (path === '/dashboard' && method === 'GET') {
      const [stats, settings] = await Promise.all([getDashStats(DB), getAllSettings(DB)]);
      return jsonRes({ stats, settings });
    }

    // ── Settings ──────────────────────────────────────────────────
    if (path === '/settings' && method === 'GET') {
      return jsonRes({ settings: await getAllSettings(DB) });
    }
    if (path === '/settings' && method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonRes({ error: 'Request body must be an object' }, 400);
      const allowed = ['global', 'hero', 'about', 'contact', 'seo', 'theme', 'nav', 'proof_section'];
      for (const key of Object.keys(body)) {
        if (allowed.includes(key)) await setSetting(DB, key, body[key]);
      }
      await logAction(DB, 'settings_updated', { keys: Object.keys(body) });
      return jsonRes({ ok: true });
    }

    // ── Sections ──────────────────────────────────────────────────
    if (path === '/sections' && method === 'GET') return jsonRes({ sections: await getSections(DB) });
    if (path === '/sections' && method === 'PUT') {
      const body = await request.json().catch(() => null);
      const sections = body?.sections;
      if (!Array.isArray(sections) || sections.length > 100 || sections.some(s => !s || typeof s.id !== 'string' || !/^[a-z0-9_-]+$/.test(s.id))) {
        return jsonRes({ error: 'sections must be a valid array' }, 400);
      }
      const stmt = DB.prepare('UPDATE sections SET order_idx=?,visible=? WHERE id=?');
      await DB.batch(sections.map((s, i) => stmt.bind(Number.isInteger(s.order_idx) ? s.order_idx : i, s.visible ? 1 : 0, s.id)));
      return jsonRes({ ok: true });
    }

    // ── Skills ────────────────────────────────────────────────────
    if (path === '/skills' && method === 'GET') return jsonRes({ skills: await getSkills(DB) });
    if (path === '/skills' && method === 'POST') {
      const b = await request.json();
      if (!b.label) return jsonRes({ error: 'label required' }, 400);
      const r = await DB.prepare('INSERT INTO skills (label,icon,order_idx,visible) VALUES (?,?,?,?)').bind(b.label, b.icon || 'code', b.order_idx || 0, b.visible !== false ? 1 : 0).run();
      const skillId = r.meta.last_row_id;
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(b.pills.map((p, i) => DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)').bind(skillId, p.label, p.is_hot ? 1 : 0, i)));
      }
      return jsonRes({ ok: true, id: skillId });
    }
    const skMatch = path.match(/^\/skills\/(\d+)$/);
    if (skMatch && method === 'PUT') {
      const id = parseInt(skMatch[1]); const b = await request.json();
      await DB.prepare('UPDATE skills SET label=?,icon=?,order_idx=?,visible=? WHERE id=?').bind(b.label, b.icon || 'code', b.order_idx || 0, b.visible !== false ? 1 : 0, id).run();
      await DB.prepare('DELETE FROM skill_pills WHERE skill_id=?').bind(id).run();
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(b.pills.map((p, i) => DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)').bind(id, p.label, p.is_hot ? 1 : 0, i)));
      }
      return jsonRes({ ok: true });
    }
    if (skMatch && method === 'DELETE') { await DB.prepare('DELETE FROM skills WHERE id=?').bind(parseInt(skMatch[1])).run(); return jsonRes({ ok: true }); }

    // ── Services ──────────────────────────────────────────────────
    if (path === '/services' && method === 'GET') return jsonRes({ services: await getServices(DB) });
    if (path === '/services' && method === 'POST') {
      const b = await request.json(); if (!b.title) return jsonRes({ error: 'title required' }, 400);
      await DB.prepare('INSERT INTO services (icon,title,description,cta_label,cta_url,order_idx,visible) VALUES (?,?,?,?,?,?,?)').bind(b.icon || 'build', b.title, b.description || '', b.cta_label || null, b.cta_url || null, b.order_idx || 0, b.visible !== false ? 1 : 0).run();
      return jsonRes({ ok: true });
    }
    const svcM = path.match(/^\/services\/(\d+)$/);
    if (svcM && method === 'PUT') { const id = parseInt(svcM[1]); const b = await request.json(); await DB.prepare('UPDATE services SET icon=?,title=?,description=?,cta_label=?,cta_url=?,order_idx=?,visible=? WHERE id=?').bind(b.icon || 'build', b.title, b.description || '', b.cta_label || null, b.cta_url || null, b.order_idx || 0, b.visible !== false ? 1 : 0, id).run(); return jsonRes({ ok: true }); }
    if (svcM && method === 'DELETE') { await DB.prepare('DELETE FROM services WHERE id=?').bind(parseInt(svcM[1])).run(); return jsonRes({ ok: true }); }

    // ── Experiences ───────────────────────────────────────────────
    if (path === '/experiences' && method === 'GET') return jsonRes({ experiences: await getExperiences(DB) });
    if (path === '/experiences' && method === 'POST') {
      const b = await request.json(); if (!b.title || !b.company) return jsonRes({ error: 'title and company required' }, 400);
      await DB.prepare('INSERT INTO experiences (badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(b.badge_label || '', b.badge_type || 'lime', b.icon || 'work', b.title, b.company, b.date_range || '', b.duration || '', b.location || '', JSON.stringify(b.bullet_points || []), JSON.stringify(b.tags || []), b.order_idx || 0, b.visible !== false ? 1 : 0).run();
      return jsonRes({ ok: true });
    }
    const xpM = path.match(/^\/experiences\/(\d+)$/);
    if (xpM && method === 'PUT') { const id = parseInt(xpM[1]); const b = await request.json(); await DB.prepare('UPDATE experiences SET badge_label=?,badge_type=?,icon=?,title=?,company=?,date_range=?,duration=?,location=?,bullet_points=?,tags=?,order_idx=?,visible=? WHERE id=?').bind(b.badge_label || '', b.badge_type || 'lime', b.icon || 'work', b.title, b.company, b.date_range || '', b.duration || '', b.location || '', JSON.stringify(b.bullet_points || []), JSON.stringify(b.tags || []), b.order_idx || 0, b.visible !== false ? 1 : 0, id).run(); return jsonRes({ ok: true }); }
    if (xpM && method === 'DELETE') { await DB.prepare('DELETE FROM experiences WHERE id=?').bind(parseInt(xpM[1])).run(); return jsonRes({ ok: true }); }

    // ── Education ─────────────────────────────────────────────────
    if (path === '/education' && method === 'GET') return jsonRes({ education: await getEducation(DB) });
    if (path === '/education' && method === 'POST') {
      const b = await request.json(); if (!b.degree) return jsonRes({ error: 'degree required' }, 400);
      await DB.prepare('INSERT INTO education (period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?)').bind(b.period || '', b.degree, b.stream || '', b.school || '', b.grade || 'In Progress', JSON.stringify(b.items || []), JSON.stringify(b.pills || []), b.order_idx || 0, b.visible !== false ? 1 : 0).run();
      return jsonRes({ ok: true });
    }
    const eduM = path.match(/^\/education\/(\d+)$/);
    if (eduM && method === 'PUT') { const id = parseInt(eduM[1]); const b = await request.json(); await DB.prepare('UPDATE education SET period=?,degree=?,stream=?,school=?,grade=?,items=?,pills=?,order_idx=?,visible=? WHERE id=?').bind(b.period || '', b.degree, b.stream || '', b.school || '', b.grade || 'In Progress', JSON.stringify(b.items || []), JSON.stringify(b.pills || []), b.order_idx || 0, b.visible !== false ? 1 : 0, id).run(); return jsonRes({ ok: true }); }
    if (eduM && method === 'DELETE') { await DB.prepare('DELETE FROM education WHERE id=?').bind(parseInt(eduM[1])).run(); return jsonRes({ ok: true }); }

    // ── Projects ──────────────────────────────────────────────────
    if (path === '/projects' && method === 'GET') return jsonRes({ projects: await getProjects(DB) });
    if (path === '/projects' && method === 'POST') {
      const b = await request.json(); if (!b.title) return jsonRes({ error: 'title required' }, 400);
      await DB.prepare('INSERT INTO projects (title,category,category_icon,summary,tags,stack,status,featured,external_url,github_url,demo_url,image_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(b.title, b.category || '', b.category_icon || 'folder', b.summary || '', JSON.stringify(b.tags || []), JSON.stringify(b.stack || []), b.status || 'completed', b.featured ? 1 : 0, b.external_url || null, b.github_url || null, b.demo_url || null, b.image_url || null, b.order_idx || 0, b.visible !== false ? 1 : 0).run();
      return jsonRes({ ok: true });
    }
    const prM = path.match(/^\/projects\/(\d+)$/);
    if (prM && method === 'PUT') { const id = parseInt(prM[1]); const b = await request.json(); await DB.prepare('UPDATE projects SET title=?,category=?,category_icon=?,summary=?,tags=?,stack=?,status=?,featured=?,external_url=?,github_url=?,demo_url=?,image_url=?,order_idx=?,visible=? WHERE id=?').bind(b.title, b.category || '', b.category_icon || 'folder', b.summary || '', JSON.stringify(b.tags || []), JSON.stringify(b.stack || []), b.status || 'completed', b.featured ? 1 : 0, b.external_url || null, b.github_url || null, b.demo_url || null, b.image_url || null, b.order_idx || 0, b.visible !== false ? 1 : 0, id).run(); return jsonRes({ ok: true }); }
    if (prM && method === 'DELETE') { await DB.prepare('DELETE FROM projects WHERE id=?').bind(parseInt(prM[1])).run(); return jsonRes({ ok: true }); }

    // ── Proof Items ───────────────────────────────────────────────
    if (path === '/proof' && method === 'GET') { const items = await getProofItems(DB); const settings = await getAllSettings(DB); return jsonRes({ items, settings }); }
    if (path === '/proof' && method === 'POST') {
      const b = await request.json().catch(() => null);
      if (!b || !b.name) return jsonRes({ error: 'name required' }, 400);
      if (!['org', 'testimonial'].includes(b.type || 'org')) return jsonRes({ error: 'type must be org or testimonial' }, 400);
      const rating = Number(b.testimonial_rating || 5);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonRes({ error: 'rating must be between 1 and 5' }, 400);
      await DB.prepare('INSERT INTO proof_items (type,name,subtitle,logo_url,url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?)').bind(b.type || 'org', String(b.name).slice(0, 200), String(b.subtitle || '').slice(0, 300), b.logo_url || null, b.url || null, b.testimonial_text || null, rating, Number.isInteger(b.order_idx) ? b.order_idx : 0, b.visible !== false ? 1 : 0).run();
      return jsonRes({ ok: true });
    }
    const pfM = path.match(/^\/proof\/(\d+)$/);
    if (pfM && method === 'PUT') {
      const id = parseInt(pfM[1]);
      const b = await request.json().catch(() => null);
      if (!b || !b.name) return jsonRes({ error: 'name required' }, 400);
      if (!['org', 'testimonial'].includes(b.type || 'org')) return jsonRes({ error: 'type must be org or testimonial' }, 400);
      const rating = Number(b.testimonial_rating || 5);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonRes({ error: 'rating must be between 1 and 5' }, 400);
      await DB.prepare('UPDATE proof_items SET type=?,name=?,subtitle=?,logo_url=?,url=?,testimonial_text=?,testimonial_rating=?,order_idx=?,visible=? WHERE id=?').bind(b.type || 'org', String(b.name).slice(0, 200), String(b.subtitle || '').slice(0, 300), b.logo_url || null, b.url || null, b.testimonial_text || null, rating, Number.isInteger(b.order_idx) ? b.order_idx : 0, b.visible !== false ? 1 : 0, id).run();
      return jsonRes({ ok: true });
    }
    if (pfM && method === 'DELETE') { await DB.prepare('DELETE FROM proof_items WHERE id=?').bind(parseInt(pfM[1])).run(); return jsonRes({ ok: true }); }

    // ── Inbox ─────────────────────────────────────────────────────
    if (path === '/inbox' && method === 'GET') return jsonRes({ submissions: await getSubmissions(DB) });
    const rdM = path.match(/^\/inbox\/(\d+)\/read$/);
    if (rdM && method === 'POST') { await markSubRead(DB, parseInt(rdM[1])); return jsonRes({ ok: true }); }

    // ── Change Password ───────────────────────────────────────────
    if (path === '/change-password' && method === 'POST') {
      const { current_password, new_password } = await request.json();
      if (!current_password || !new_password) return jsonRes({ error: 'Both fields required' }, 400);
      if (new_password.length < 8) return jsonRes({ error: 'Password must be at least 8 characters' }, 400);
      const user = await DB.prepare('SELECT * FROM admin_users WHERE id=?').bind(session.user_id).first();
      if (!user) return jsonRes({ error: 'User not found' }, 400);
      const ok = await verifyPassword(current_password, user.password_hash);
      if (!ok) return jsonRes({ error: 'Current password is incorrect' }, 400);
      const h = await hashPassword(new_password);
      await DB.prepare('UPDATE admin_users SET password_hash=? WHERE id=?').bind(h, session.user_id).run();
      await logAction(DB, 'password_changed', { user_id: session.user_id });
      return jsonRes({ ok: true });
    }

    // ── Backup Export ─────────────────────────────────────────────
    if (path === '/backup/export' && method === 'GET') {
      const [settings, sections, skills, services, experiences, education, projects, proof] = await Promise.all([
        getAllSettings(DB), getSections(DB), getSkills(DB), getServices(DB),
        getExperiences(DB), getEducation(DB), getProjects(DB), getProofItems(DB)
      ]);
      return jsonRes({ exported_at: new Date().toISOString(), settings, sections, skills, services, experiences, education, projects, proof });
    }

    // ── Backup Import / Restore ───────────────────────────────────
    if (path === '/backup/import' && method === 'POST') {
      const data = await request.json().catch(() => null);
      const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
      const tableNames = ['sections', 'skills', 'services', 'experiences', 'education', 'projects', 'proof'];
      if (!isObject(data) || !isObject(data.settings) || Object.keys(data.settings).length > 100 || tableNames.some(name => data[name] !== undefined && !Array.isArray(data[name]))) {
        return jsonRes({ error: 'Invalid backup format' }, 400);
      }
      if (tableNames.some(name => Array.isArray(data[name]) && data[name].length > 1000)) {
        return jsonRes({ error: 'Backup contains too many records' }, 413);
      }
      if (tableNames.some(name => Array.isArray(data[name]) && data[name].some(row => !isObject(row)))) {
        return jsonRes({ error: 'Backup contains an invalid record' }, 400);
      }

      const statements = [];
      // Restore settings (merge — keeps keys not in backup)
      for (const [k, v] of Object.entries(data.settings)) {
        if (/^[a-z_]{1,64}$/.test(k)) statements.push(DB.prepare(`INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).bind(k, typeof v === 'string' ? v : JSON.stringify(v)));
      }
      // Restore sections
      if (Array.isArray(data.sections)) {
        statements.push(...data.sections.map((s, i) => DB.prepare('INSERT OR REPLACE INTO sections (id,label,order_idx,visible) VALUES (?,?,?,?)').bind(String(s.id || '').slice(0, 64), String(s.label || '').slice(0, 200), Number.isInteger(s.order_idx) ? s.order_idx : i, s.visible ? 1 : 0)));
      }
      // Restore skills + pills
      if (Array.isArray(data.skills)) {
        statements.push(DB.prepare('DELETE FROM skill_pills'), DB.prepare('DELETE FROM skills'));
        for (const sk of data.skills) {
          statements.push(DB.prepare('INSERT INTO skills (id,label,icon,order_idx,visible) VALUES (?,?,?,?,?)').bind(sk.id, String(sk.label || '').slice(0, 200), sk.icon || 'code', Number.isInteger(sk.order_idx) ? sk.order_idx : 0, sk.visible !== false ? 1 : 0));
          for (const p of (Array.isArray(sk.pills) ? sk.pills : [])) statements.push(DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)').bind(sk.id, String(p.label || '').slice(0, 200), p.is_hot ? 1 : 0, Number.isInteger(p.order_idx) ? p.order_idx : 0));
        }
      }
      // Restore services
      if (Array.isArray(data.services)) {
        statements.push(DB.prepare('DELETE FROM services'));
        for (const s of data.services) statements.push(DB.prepare('INSERT INTO services (id,icon,title,description,cta_label,cta_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?)').bind(s.id, s.icon || 'build', String(s.title || '').slice(0, 200), String(s.description || '').slice(0, 5000), s.cta_label || null, s.cta_url || null, Number.isInteger(s.order_idx) ? s.order_idx : 0, s.visible !== false ? 1 : 0));
      }
      // Restore experiences
      if (Array.isArray(data.experiences)) {
        statements.push(DB.prepare('DELETE FROM experiences'));
        for (const x of data.experiences) statements.push(DB.prepare('INSERT INTO experiences (id,badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(x.id, x.badge_label || '', x.badge_type || 'lime', x.icon || 'work', String(x.title || '').slice(0, 200), String(x.company || '').slice(0, 200), x.date_range || '', x.duration || '', x.location || '', JSON.stringify(Array.isArray(x.bullet_points) ? x.bullet_points : []), JSON.stringify(Array.isArray(x.tags) ? x.tags : []), Number.isInteger(x.order_idx) ? x.order_idx : 0, x.visible !== false ? 1 : 0));
      }
      // Restore education
      if (Array.isArray(data.education)) {
        statements.push(DB.prepare('DELETE FROM education'));
        for (const e of data.education) statements.push(DB.prepare('INSERT INTO education (id,period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(e.id, e.period || '', String(e.degree || '').slice(0, 200), e.stream || '', e.school || '', e.grade || 'In Progress', JSON.stringify(Array.isArray(e.items) ? e.items : []), JSON.stringify(Array.isArray(e.pills) ? e.pills : []), Number.isInteger(e.order_idx) ? e.order_idx : 0, e.visible !== false ? 1 : 0));
      }
      // Restore projects
      if (Array.isArray(data.projects)) {
        statements.push(DB.prepare('DELETE FROM projects'));
        for (const p of data.projects) statements.push(DB.prepare('INSERT INTO projects (id,title,category,category_icon,summary,tags,stack,status,featured,external_url,github_url,demo_url,image_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id, String(p.title || '').slice(0, 200), p.category || '', p.category_icon || 'folder', String(p.summary || '').slice(0, 5000), JSON.stringify(Array.isArray(p.tags) ? p.tags : []), JSON.stringify(Array.isArray(p.stack) ? p.stack : []), p.status || 'completed', p.featured ? 1 : 0, p.external_url || null, p.github_url || null, p.demo_url || null, p.image_url || null, Number.isInteger(p.order_idx) ? p.order_idx : 0, p.visible !== false ? 1 : 0));
      }
      // Restore proof items
      if (Array.isArray(data.proof)) {
        statements.push(DB.prepare('DELETE FROM proof_items'));
        for (const pr of data.proof) {
          const rating = Number(pr.testimonial_rating || 5);
          if (!['org', 'testimonial'].includes(pr.type || 'org') || !Number.isInteger(rating) || rating < 1 || rating > 5) return jsonRes({ error: 'Invalid proof item in backup' }, 400);
          statements.push(DB.prepare('INSERT INTO proof_items (id,type,name,subtitle,logo_url,url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(pr.id, pr.type || 'org', String(pr.name || '').slice(0, 200), String(pr.subtitle || '').slice(0, 300), pr.logo_url || null, pr.url || null, pr.testimonial_text || null, rating, Number.isInteger(pr.order_idx) ? pr.order_idx : 0, pr.visible !== false ? 1 : 0));
        }
      }

      if (!statements.length) return jsonRes({ error: 'Backup contains no restorable data' }, 400);
      await DB.batch(statements);
      await logAction(DB, 'backup_restored', { imported_at: new Date().toISOString() });
      return jsonRes({ ok: true, restored: new Date().toISOString() });
    }

    return jsonRes({ error: 'Not found' }, 404);

  } catch (err) {
    console.error('Admin API error:', err);
    return jsonRes({ error: err.message || 'Internal error' }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ── CONTACT API ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function handleContactApi(request, DB) {
  try {
    const cfgRow = await DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('contact').first();
    const cfg = cfgRow ? JSON.parse(cfgRow.value) : {};
    if (cfg.form_enabled === false) return jsonRes({ error: 'Contact form is disabled.' }, 403);

    const body = await request.json().catch(() => null);
    if (!body) return jsonRes({ error: 'Invalid request body' }, 400);

    const { name, email, subject, message } = body;
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) return jsonRes({ error: 'Name is required (max 100 chars)' }, 400);
    if (!email || typeof email !== 'string' || email.trim().length > 200 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim())) return jsonRes({ error: 'Valid email address required' }, 400);
    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) return jsonRes({ error: 'Message must be 5–5000 characters' }, 400);

    const ip = getIp(request);
    if (await tooManyContactSubmissions(DB, ip).catch(() => false)) {
      return jsonRes({ error: 'Too many messages from this address. Please try again later.' }, 429, { 'Retry-After': String(CONTACT_WINDOW_MINUTES * 60) });
    }
    await addSubmission(DB, {
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      subject: subject ? String(subject).trim().slice(0, 200) : null,
      message: message.trim().slice(0, 5000),
      ip
    });
    return jsonRes({ ok: true, message: "Message received! I'll get back to you soon." });
  } catch (err) {
    console.error('Contact error:', err);
    return jsonRes({ error: 'Failed to save. Please try again.' }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ── TEMPLATE RENDER STUBS ──────────────────────────────────────────────────
// build.js removes everything between @@STUB_START and @@STUB_END and
// replaces the call names with the real function names from templates/*.js
// @@STUB_START
function renderPublic(data) {
  throw new Error('renderPublic not bundled — run: node build.js');
}
function renderLogin(error) {
  throw new Error('renderLogin not bundled — run: node build.js');
}
function renderAdminPanel(username) {
  throw new Error('renderAdminPanel not bundled — run: node build.js');
}
function renderDocs(theme) {
  throw new Error('renderDocs not bundled — run: node build.js');
}
function render404(theme) {
  throw new Error('render404 not bundled — run: node build.js');
}
// @@STUB_END
