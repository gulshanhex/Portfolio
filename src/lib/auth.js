// ── Auth & Session Utilities ──────────────────────────────────────────────
// Uses WebCrypto (available in Cloudflare Workers without any imports)
// Sessions are stored server-side in D1; session ID travels as HttpOnly cookie.

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PBKDF2_ITERATIONS = 100_000;
const MAX_PASSWORD_LENGTH = 256;

// ── Password Hashing ─────────────────────────────────────────────────────

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > MAX_PASSWORD_LENGTH) throw new Error(`Password must be between 8 and ${MAX_PASSWORD_LENGTH} characters.`);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashArr = new Uint8Array(bits);
  const saltHex = bufToHex(salt);
  const hashHex = bufToHex(hashArr);
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || password.length > MAX_PASSWORD_LENGTH || typeof storedHash !== 'string') return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2' || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const salt = hexToBuf(parts[1]);
  const expected = parts[2];
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashHex = bufToHex(new Uint8Array(bits));
  // Constant-time compare
  return timingSafeEqual(hashHex, expected);
}

// ── Session Management ───────────────────────────────────────────────────

export function generateSessionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bufToHex(bytes);
}

export async function createSession(db, userId, ip, userAgent) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db.prepare(
    `INSERT INTO admin_sessions (id, user_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(sessionId, userId, expiresAt, ip || null, userAgent || null).run();
  return sessionId;
}

export async function validateSession(db, sessionId) {
  if (!sessionId || sessionId.length !== 64) return null;
  const row = await db.prepare(
    `SELECT s.user_id, s.expires_at, u.username
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  ).bind(sessionId).first();
  return row || null;
}

export async function deleteSession(db, sessionId) {
  await db.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(sessionId).run();
}

export async function cleanExpiredSessions(db) {
  await db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= datetime('now')`).run();
}

// ── Cookie Helpers ───────────────────────────────────────────────────────

export function setSessionCookie(sessionId, requestUrl = 'https://example.invalid') {
  const maxAge = SESSION_DURATION_MS / 1000;
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `gk_session=${sessionId}; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(requestUrl = 'https://example.invalid') {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `gk_session=; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getSessionIdFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)gk_session=([a-f0-9]{64})/);
  return match ? match[1] : null;
}

// ── CSRF ─────────────────────────────────────────────────────────────────
// Simple double-submit pattern: token in form + matching header

export function generateCsrfToken() {
  return bufToHex(crypto.getRandomValues(new Uint8Array(16)));
}

// ── Helpers ──────────────────────────────────────────────────────────────

function bufToHex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
