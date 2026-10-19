// ── D1 Database Layer, Input Sanitization & Sample Data Protection ────────
// All content queries for public SSR pages and admin API routes go through here.
// RULE: DEFAULT_* fallback is used ONLY when D1 binding is undefined (local dev).
// If DB exists and returns 0 rows, return [] and let sections hide safely.

import {
  DEFAULT_EDUCATION,
  DEFAULT_EXPERIENCES,
  DEFAULT_FAQS,
  DEFAULT_PROJECTS,
  DEFAULT_PROOF,
  DEFAULT_SECTIONS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_SKILLS,
} from './schema-sql';

export async function getSetting(db: D1Database | undefined, key: string): Promise<any> {
  if (!db) return DEFAULT_SETTINGS[key] ?? null;
  try {
    const row = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind(key).first<{ value: string }>();
    if (!row) return DEFAULT_SETTINGS[key] ?? null;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  } catch {
    return DEFAULT_SETTINGS[key] ?? null;
  }
}

export async function setSetting(db: D1Database, key: string, value: unknown): Promise<void> {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  await db
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .bind(key, json)
    .run();
}

export async function getAllSettings(db: D1Database | undefined): Promise<Record<string, any>> {
  const merged: Record<string, any> = structuredClone(DEFAULT_SETTINGS);
  if (!db) return merged;
  try {
    const { results } = await db.prepare('SELECT key, value FROM site_settings').all<{ key: string; value: string }>();
    for (const r of results || []) {
      try {
        merged[r.key] = { ...(merged[r.key] || {}), ...JSON.parse(r.value) };
      } catch {
        merged[r.key] = r.value;
      }
    }
    return merged;
  } catch {
    return merged;
  }
}

export async function getSections(db: D1Database | undefined): Promise<any[]> {
  if (!db) return DEFAULT_SECTIONS;
  try {
    const { results } = await db.prepare('SELECT * FROM sections ORDER BY order_idx').all();
    if (!results || results.length === 0) return DEFAULT_SECTIONS;
    return results;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export async function getSkills(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_SKILLS.filter((s) => s.visible) : DEFAULT_SKILLS;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM skills WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM skills ORDER BY order_idx';
    const { results: groups } = await db.prepare(q).all<any>();
    if (!groups || groups.length === 0) return [];
    const { results: pills } = await db.prepare('SELECT * FROM skill_pills ORDER BY skill_id, order_idx').all<any>();
    return groups.map((g) => ({
      ...g,
      pills: (pills || []).filter((p) => p.skill_id === g.id),
    }));
  } catch {
    return [];
  }
}

export async function getServices(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_SERVICES.filter((s) => s.visible) : DEFAULT_SERVICES;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM services WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM services ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return (results || []).map((s) => ({
      ...s,
      slug: s.slug || slugify(s.title),
      features: safeJSON(s.features, []),
    }));
  } catch {
    return [];
  }
}

export async function getServiceBySlug(db: D1Database | undefined, slug: string): Promise<any | null> {
  if (!slug) return null;
  if (!db) {
    const found = DEFAULT_SERVICES.find((s) => s.slug === slug || slugify(s.title) === slug);
    return found || null;
  }
  try {
    let row = await db.prepare('SELECT * FROM services WHERE slug = ?').bind(slug).first<any>();
    if (!row) {
      const all = await getServices(db);
      row = all.find((s) => s.slug === slug || slugify(s.title) === slug);
      if (!row) return null;
    }
    return {
      ...row,
      slug: row.slug || slugify(row.title),
      features: safeJSON(row.features, []),
    };
  } catch {
    return null;
  }
}

export async function getExperiences(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_EXPERIENCES.filter((e) => e.visible) : DEFAULT_EXPERIENCES;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM experiences WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM experiences ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return (results || []).map((e) => ({
      ...e,
      bullet_points: safeJSON(e.bullet_points, []),
      tags: safeJSON(e.tags, []),
    }));
  } catch {
    return [];
  }
}

export async function getEducation(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_EDUCATION.filter((e) => e.visible) : DEFAULT_EDUCATION;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM education WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM education ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return (results || []).map((e) => ({
      ...e,
      items: safeJSON(e.items, []),
      pills: safeJSON(e.pills, []),
    }));
  } catch {
    return [];
  }
}

export async function getProjects(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_PROJECTS.filter((p) => p.visible) : DEFAULT_PROJECTS;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM projects WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM projects ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return (results || []).map((p) => ({
      ...p,
      slug: p.slug || slugify(p.title),
      tags: safeJSON(p.tags, []),
      stack: safeJSON(p.stack, []),
    }));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(db: D1Database | undefined, slug: string): Promise<any | null> {
  if (!slug) return null;
  if (!db) {
    const found = DEFAULT_PROJECTS.find((p) => p.slug === slug || slugify(p.title) === slug);
    return found || null;
  }
  try {
    let row = await db.prepare('SELECT * FROM projects WHERE slug = ?').bind(slug).first<any>();
    if (!row) {
      const all = await getProjects(db);
      row = all.find((p) => p.slug === slug || slugify(p.title) === slug);
      if (!row) return null;
    }
    return {
      ...row,
      slug: row.slug || slugify(row.title),
      tags: safeJSON(row.tags, []),
      stack: safeJSON(row.stack, []),
    };
  } catch {
    return null;
  }
}

export async function getProofItems(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_PROOF.filter((p) => p.visible) : DEFAULT_PROOF;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM proof_items WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM proof_items ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return results || [];
  } catch {
    return [];
  }
}

export async function getFaqs(db: D1Database | undefined, visibleOnly = false): Promise<any[]> {
  if (!db) return visibleOnly ? DEFAULT_FAQS.filter((f) => f.visible) : DEFAULT_FAQS;
  try {
    const q = visibleOnly
      ? 'SELECT * FROM faqs WHERE visible = 1 ORDER BY order_idx'
      : 'SELECT * FROM faqs ORDER BY order_idx';
    const { results } = await db.prepare(q).all<any>();
    return results || [];
  } catch {
    return [];
  }
}

export async function getSubmissions(db: D1Database, unreadOnly = false): Promise<any[]> {
  try {
    const q = unreadOnly
      ? 'SELECT * FROM contact_submissions WHERE read = 0 ORDER BY created_at DESC'
      : 'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 100';
    const { results } = await db.prepare(q).all();
    return results || [];
  } catch {
    return [];
  }
}

export async function checkContactRateLimit(db: D1Database, ip: string): Promise<boolean> {
  if (!ip || ip === '0.0.0.0') return true;
  try {
    const row = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM contact_submissions
         WHERE ip = ? AND created_at > datetime('now', '-10 minutes')`
      )
      .bind(ip)
      .first<{ cnt: number }>();
    return (row?.cnt || 0) < 5;
  } catch {
    return true;
  }
}

export async function addSubmission(
  db: D1Database,
  { name, email, subject, message, ip }: { name: string; email: string; subject?: string | null; message: string; ip?: string | null }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO contact_submissions (name, email, subject, message, ip)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(name, email, subject || null, message, ip || null)
    .run();
}

export async function markSubmissionRead(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE contact_submissions SET read = 1 WHERE id = ?').bind(id).run();
}

export async function getAdminUser(db: D1Database, username: string): Promise<any> {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first();
}

export async function logAction(db: D1Database | undefined, action: string, details: unknown = null): Promise<void> {
  if (!db) return;
  try {
    await db
      .prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)')
      .bind(action, details ? JSON.stringify(details) : null)
      .run();
  } catch {
    // non-critical
  }
}

export async function getSiteData(db: D1Database | undefined) {
  const [settings, sections, skills, services, experiences, education, projects, proof, faqs] = await Promise.all([
    getAllSettings(db),
    getSections(db),
    getSkills(db, true),
    getServices(db, true),
    getExperiences(db, true),
    getEducation(db, true),
    getProjects(db, true),
    getProofItems(db, true),
    getFaqs(db, true),
  ]);
  return { settings, sections, skills, services, experiences, education, projects, proof, faqs };
}

export async function getDashboardStats(db: D1Database | undefined) {
  if (!db) {
    return {
      projects: DEFAULT_PROJECTS.length,
      experiences: DEFAULT_EXPERIENCES.length,
      submissions: 0,
      unread: 0,
    };
  }
  try {
    const [projects, experiences, submissions, unread] = await Promise.all([
      db.prepare('SELECT COUNT(*) as n FROM projects WHERE visible=1').first<{ n: number }>(),
      db.prepare('SELECT COUNT(*) as n FROM experiences WHERE visible=1').first<{ n: number }>(),
      db.prepare('SELECT COUNT(*) as n FROM contact_submissions').first<{ n: number }>(),
      db.prepare('SELECT COUNT(*) as n FROM contact_submissions WHERE read=0').first<{ n: number }>(),
    ]);
    return {
      projects: projects?.n || 0,
      experiences: experiences?.n || 0,
      submissions: submissions?.n || 0,
      unread: unread?.n || 0,
    };
  } catch {
    return {
      projects: 0,
      experiences: 0,
      submissions: 0,
      unread: 0,
    };
  }
}

export function safeJSON<T>(str: unknown, fallback: T): T {
  if (!str) return fallback;
  if (typeof str === 'object') return str as T;
  try {
    return JSON.parse(String(str));
  } catch {
    return fallback;
  }
}

export function escHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function stripHtml(str: unknown): string {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '').trim();
}

export function sanitizeBasicHtml(str: unknown): string {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?(strong|em|br))\s*&gt;/gi, '<$1>');
}

export function sanitizeUrl(url: unknown): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  ) {
    return trimmed.slice(0, 500);
  }
  return null;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
