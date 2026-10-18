// ── Hardened Auth, Session, Brute-Force Lockout, CSRF & TOTP 2FA Engine ──
// Pure WebCrypto implementation for Cloudflare Workers:
// 1. PBKDF2-SHA256 (100,000 iterations) with 128-bit random salt & constant-time comparison
// 2. Server-side D1 sessions + HMAC-SHA256 signed HttpOnly/Secure/SameSite=Strict cookies
// 3. Brute-force rate limiting & 15-minute IP/username lockout (max 5 failed attempts)
// 4. Per-session HMAC-SHA256 CSRF token generation & constant-time verification
// 5. RFC 6238 TOTP 2FA (Google Authenticator / Authy compatible) via WebCrypto HMAC-SHA1
// 6. Optional Secret Admin Gate Cookie (ADMIN_ACCESS_KEY) to hide /admin from bots

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PBKDF2_ITERATIONS = 100_000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

// ── 1. Password Hashing (PBKDF2-SHA256) ──────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `pbkdf2:${bufToHex(salt)}:${bufToHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;
  const salt = hexToBuf(parts[1]);
  const expected = parts[2];
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashHex = bufToHex(new Uint8Array(bits));
  return timingSafeEqual(hashHex, expected);
}

// ── 2. Session Management & HMAC Cookie Signing ──────────────────────────

export function generateSessionId(): string {
  return bufToHex(crypto.getRandomValues(new Uint8Array(32)));
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bufToHex(new Uint8Array(sig));
}

async function signSessionId(sessionId: string, sessionSecret?: string): Promise<string> {
  const cleanSecret = sessionSecret?.trim();
  if (!cleanSecret) return sessionId;
  const sigHex = await hmacSha256Hex(cleanSecret, `session:${sessionId}`);
  return `${sessionId}.${sigHex}`;
}

async function verifySignedCookieValue(rawCookieVal: string, sessionSecret?: string): Promise<string | null> {
  if (!rawCookieVal) return null;
  const cleanSecret = sessionSecret?.trim();
  if (rawCookieVal.includes('.')) {
    const [sid, sigHex] = rawCookieVal.split('.');
    if (!sid || sid.length !== 64 || !/^[a-f0-9]{64}$/.test(sid)) return null;
    if (!cleanSecret) return sid;
    const expectedSig = await hmacSha256Hex(cleanSecret, `session:${sid}`);
    return timingSafeEqual(sigHex || '', expectedSig) ? sid : null;
  }
  if (/^[a-f0-9]{64}$/.test(rawCookieVal)) {
    // If SESSION_SECRET is configured, require signed cookies
    if (cleanSecret) return null;
    return rawCookieVal;
  }
  return null;
}

export async function createSession(
  db: D1Database,
  userId: number,
  ip?: string | null,
  userAgent?: string | null,
  sessionSecret?: string
): Promise<string> {
  await cleanExpiredSessions(db);
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db
    .prepare(
      `INSERT INTO admin_sessions (id, user_id, expires_at, ip, user_agent)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(sessionId, userId, expiresAt, ip || null, (userAgent || '').slice(0, 255) || null)
    .run();
  return signSessionId(sessionId, sessionSecret);
}

export async function validateSession(
  db: D1Database | undefined,
  cookieToken: string | null,
  sessionSecret?: string
): Promise<{ user_id: number; expires_at: string; username: string; session_id: string } | null> {
  if (!db || !cookieToken) return null;
  const sessionId = await verifySignedCookieValue(cookieToken, sessionSecret);
  if (!sessionId || sessionId.length !== 64) return null;
  try {
    const row = await db
      .prepare(
        `SELECT s.id as session_id, s.user_id, s.expires_at, u.username
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      )
      .bind(sessionId)
      .first<{ session_id: string; user_id: number; expires_at: string; username: string }>();
    return row || null;
  } catch {
    return null;
  }
}

export async function deleteSession(db: D1Database | undefined, cookieToken: string | null): Promise<void> {
  if (!db || !cookieToken) return;
  const sessionId = cookieToken.split('.')[0];
  if (!sessionId) return;
  try {
    await db.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(sessionId).run();
  } catch {
    // ignore
  }
}

export async function revokeOtherSessions(db: D1Database, userId: number, keepSessionId: string): Promise<void> {
  try {
    await db
      .prepare('DELETE FROM admin_sessions WHERE user_id = ? AND id != ?')
      .bind(userId, keepSessionId)
      .run();
  } catch {
    // ignore
  }
}

export async function cleanExpiredSessions(db: D1Database | undefined): Promise<void> {
  if (!db) return;
  try {
    await db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= datetime('now')`).run();
  } catch {
    // ignore
  }
}

export function setSessionCookie(signedToken: string, isSecure = true): string {
  const maxAge = SESSION_DURATION_MS / 1000;
  const secureFlag = isSecure ? ' Secure;' : '';
  return `gk_session=${signedToken}; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(isSecure = true): string {
  const secureFlag = isSecure ? ' Secure;' : '';
  return `gk_session=; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)gk_session=([a-f0-9]{64}(?:\.[a-f0-9]{64})?)/);
  return match ? match[1] : null;
}

// ── 3. Per-Session CSRF Protection ───────────────────────────────────────

export async function generateCsrfToken(sessionId: string, sessionSecret?: string): Promise<string> {
  const key = (sessionSecret?.trim() || 'gk-default-csrf-salt') + ':csrf';
  const full = await hmacSha256Hex(key, sessionId);
  return full.slice(0, 32);
}

export async function verifyCsrfToken(
  tokenFromClient: string | null | undefined,
  sessionId: string,
  sessionSecret?: string
): Promise<boolean> {
  if (!tokenFromClient || typeof tokenFromClient !== 'string') return false;
  const expected = await generateCsrfToken(sessionId, sessionSecret);
  return timingSafeEqual(tokenFromClient.trim(), expected);
}

// ── 4. Brute-Force Rate Limiting & Account/IP Lockout (D1) ───────────────

async function ensureLoginAttemptsTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        username TEXT NOT NULL,
        attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run()
    .catch(() => {});
}

export async function checkLoginLockout(
  db: D1Database,
  ip: string,
  username: string
): Promise<{ locked: boolean; remainingAttempts: number; retryAfterSeconds: number }> {
  await ensureLoginAttemptsTable(db);
  // Purge attempts older than lockout window
  await db
    .prepare(`DELETE FROM login_attempts WHERE attempted_at <= datetime('now', '-${LOCKOUT_WINDOW_MINUTES} minutes')`)
    .run()
    .catch(() => {});

  const row = await db
    .prepare(
      `SELECT COUNT(*) as cnt, MIN(attempted_at) as oldest
       FROM login_attempts
       WHERE (ip = ? OR LOWER(username) = LOWER(?))
         AND attempted_at > datetime('now', '-${LOCKOUT_WINDOW_MINUTES} minutes')`
    )
    .bind(ip, username)
    .first<{ cnt: number; oldest: string | null }>()
    .catch(() => null);

  const count = row?.cnt || 0;
  if (count >= MAX_LOGIN_ATTEMPTS) {
    let retryAfterSeconds = LOCKOUT_WINDOW_MINUTES * 60;
    if (row?.oldest) {
      const oldestMs = Date.parse(row.oldest.replace(' ', 'T') + 'Z');
      if (!Number.isNaN(oldestMs)) {
        const unlockMs = oldestMs + LOCKOUT_WINDOW_MINUTES * 60 * 1000;
        retryAfterSeconds = Math.max(30, Math.ceil((unlockMs - Date.now()) / 1000));
      }
    }
    return { locked: true, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - count),
    retryAfterSeconds: 0,
  };
}

export async function recordFailedLoginAttempt(db: D1Database, ip: string, username: string): Promise<void> {
  await ensureLoginAttemptsTable(db);
  await db
    .prepare('INSERT INTO login_attempts (ip, username) VALUES (?, ?)')
    .bind(ip, username.slice(0, 100))
    .run()
    .catch(() => {});
}

export async function clearFailedLoginAttempts(db: D1Database, ip: string, username: string): Promise<void> {
  await ensureLoginAttemptsTable(db);
  await db
    .prepare('DELETE FROM login_attempts WHERE ip = ? OR LOWER(username) = LOWER(?)')
    .bind(ip, username)
    .run()
    .catch(() => {});
}

// ── 5. RFC 6238 TOTP 2FA (Google Authenticator / Authy) via WebCrypto ────

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(byteLength = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function generateHotp(secretBytes: Uint8Array, counter: number): Promise<string> {
  const counterBuf = new Uint8Array(8);
  let tmp = Math.floor(counter);
  for (let i = 7; i >= 0; i--) {
    counterBuf[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBuf));
  const offset = sig[sig.length - 1] & 0x0f;
  const binary =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  const otp = binary % 1_000_000;
  return String(otp).padStart(6, '0');
}

export async function verifyTotpCode(secretBase32: string, code: string, windowSteps = 1): Promise<boolean> {
  if (!secretBase32 || !code) return false;
  const cleanCode = String(code).replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return false;
  const secretBytes = base32ToBytes(secretBase32);
  if (secretBytes.length === 0) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let w = -windowSteps; w <= windowSteps; w++) {
    const candidate = await generateHotp(secretBytes, currentStep + w);
    if (timingSafeEqual(cleanCode, candidate)) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUri(username: string, secretBase32: string, issuer = 'GK Portfolio'): string {
  const label = encodeURIComponent(`${issuer}:${username}`);
  const iss = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${encodeURIComponent(secretBase32)}&issuer=${iss}&algorithm=SHA1&digits=6&period=30`;
}

// ── 6. Optional Secret Admin Access Key Gate (Hides /admin from bots) ────

export async function setAdminGateCookie(accessKey: string, isSecure = true): Promise<string> {
  const token = await hmacSha256Hex(accessKey, 'gk-admin-gate-v1');
  const secureFlag = isSecure ? ' Secure;' : '';
  return `gk_admin_gate=${token}; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=2592000`;
}

export async function verifyAdminGateCookie(cookieHeader: string | null, accessKey: string): Promise<boolean> {
  if (!cookieHeader || !accessKey) return false;
  const match = cookieHeader.match(/(?:^|;\s*)gk_admin_gate=([a-f0-9]{64})/);
  if (!match) return false;
  const expected = await hmacSha256Hex(accessKey, 'gk-admin-gate-v1');
  return timingSafeEqual(match[1], expected);
}

// ── 7. Low-Level Constant-Time & Buffer Helpers ──────────────────────────

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
