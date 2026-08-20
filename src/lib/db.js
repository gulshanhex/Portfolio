// ── D1 Database Helpers ───────────────────────────────────────────────────
// All content reads for the public site and admin panel go through here.

// ── Settings ─────────────────────────────────────────────────────────────

export async function getSetting(db, key) {
  const row = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind(key).first();
  if (!row) return null;
  try { return JSON.parse(row.value); } catch { return row.value; }
}

export async function setSetting(db, key, value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  await db.prepare(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(key, json).run();
}

export async function getAllSettings(db) {
  const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
  const out = {};
  for (const r of results) {
    try { out[r.key] = JSON.parse(r.value); } catch { out[r.key] = r.value; }
  }
  return out;
}

// ── Sections ─────────────────────────────────────────────────────────────

export async function getSections(db) {
  const { results } = await db.prepare(
    'SELECT * FROM sections ORDER BY order_idx'
  ).all();
  return results;
}

// ── Skills ───────────────────────────────────────────────────────────────

export async function getSkills(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM skills WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM skills ORDER BY order_idx';
  const { results: groups } = await db.prepare(q).all();
  const { results: pills } = await db.prepare(
    'SELECT * FROM skill_pills ORDER BY skill_id, order_idx'
  ).all();
  return groups.map(g => ({
    ...g,
    pills: pills.filter(p => p.skill_id === g.id)
  }));
}

// ── Services ─────────────────────────────────────────────────────────────

export async function getServices(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM services WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM services ORDER BY order_idx';
  const { results } = await db.prepare(q).all();
  return results;
}

// ── Experience ───────────────────────────────────────────────────────────

export async function getExperiences(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM experiences WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM experiences ORDER BY order_idx';
  const { results } = await db.prepare(q).all();
  return results.map(e => ({
    ...e,
    bullet_points: safeJSON(e.bullet_points, []),
    tags: safeJSON(e.tags, [])
  }));
}

// ── Education ────────────────────────────────────────────────────────────

export async function getEducation(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM education WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM education ORDER BY order_idx';
  const { results } = await db.prepare(q).all();
  return results.map(e => ({
    ...e,
    items: safeJSON(e.items, []),
    pills: safeJSON(e.pills, [])
  }));
}

// ── Projects ─────────────────────────────────────────────────────────────

export async function getProjects(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM projects WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM projects ORDER BY order_idx';
  const { results } = await db.prepare(q).all();
  return results.map(p => ({
    ...p,
    tags: safeJSON(p.tags, []),
    stack: safeJSON(p.stack, [])
  }));
}

// ── Proof Items ──────────────────────────────────────────────────────────

export async function getProofItems(db, visibleOnly = false) {
  const q = visibleOnly
    ? 'SELECT * FROM proof_items WHERE visible = 1 ORDER BY order_idx'
    : 'SELECT * FROM proof_items ORDER BY order_idx';
  const { results } = await db.prepare(q).all();
  return results;
}

// ── Contact Submissions ──────────────────────────────────────────────────

export async function getSubmissions(db, unreadOnly = false) {
  const q = unreadOnly
    ? 'SELECT * FROM contact_submissions WHERE read = 0 ORDER BY created_at DESC'
    : 'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 100';
  const { results } = await db.prepare(q).all();
  return results;
}

export async function addSubmission(db, { name, email, subject, message, ip }) {
  await db.prepare(
    `INSERT INTO contact_submissions (name, email, subject, message, ip)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(name, email, subject || null, message, ip || null).run();
}

export async function markSubmissionRead(db, id) {
  await db.prepare('UPDATE contact_submissions SET read = 1 WHERE id = ?').bind(id).run();
}

// ── Admin User ───────────────────────────────────────────────────────────

export async function getAdminUser(db, username) {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first();
}

export async function createAdminUser(db, username, passwordHash) {
  await db.prepare(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)'
  ).bind(username, passwordHash).run();
}

export async function updateAdminPassword(db, userId, passwordHash) {
  await db.prepare(
    'UPDATE admin_users SET password_hash = ? WHERE id = ?'
  ).bind(passwordHash, userId).run();
}

export async function updateLastLogin(db, userId) {
  await db.prepare(
    `UPDATE admin_users SET last_login = datetime('now') WHERE id = ?`
  ).bind(userId).run();
}

// ── Audit Log ────────────────────────────────────────────────────────────

export async function logAction(db, action, details = null) {
  try {
    await db.prepare(
      'INSERT INTO audit_log (action, details) VALUES (?, ?)'
    ).bind(action, details ? JSON.stringify(details) : null).run();
  } catch { /* non-critical, swallow */ }
}

// ── Full Site Data (for public SSR) ──────────────────────────────────────

export async function getSiteData(db) {
  const [settings, sections, skills, services, experiences, education, projects, proof] =
    await Promise.all([
      getAllSettings(db),
      getSections(db),
      getSkills(db, true),
      getServices(db, true),
      getExperiences(db, true),
      getEducation(db, true),
      getProjects(db, true),
      getProofItems(db, true)
    ]);
  return { settings, sections, skills, services, experiences, education, projects, proof };
}

// ── Dashboard Stats ──────────────────────────────────────────────────────

export async function getDashboardStats(db) {
  const [projects, experiences, submissions, unread] = await Promise.all([
    db.prepare('SELECT COUNT(*) as n FROM projects WHERE visible=1').first(),
    db.prepare('SELECT COUNT(*) as n FROM experiences WHERE visible=1').first(),
    db.prepare('SELECT COUNT(*) as n FROM contact_submissions').first(),
    db.prepare('SELECT COUNT(*) as n FROM contact_submissions WHERE read=0').first()
  ]);
  return {
    projects: projects?.n || 0,
    experiences: experiences?.n || 0,
    submissions: submissions?.n || 0,
    unread: unread?.n || 0
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

export function safeJSON(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Allow basic HTML in certain fields (bold, em, strong)
export function sanitizeBasicHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?(strong|em|br))\s*&gt;/gi, '<$1>');
}
