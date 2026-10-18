import type { APIRoute } from 'astro';
import {
  checkLoginLockout,
  clearFailedLoginAttempts,
  createSession,
  recordFailedLoginAttempt,
  setSessionCookie,
  verifyPassword,
  verifyTotpCode,
} from '../../lib/auth';
import { getAdminUser, logAction } from '../../lib/db';
import { getEnvSecret } from '../../lib/env';
import { getClientIp, redirect } from '../../lib/response';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const db = env?.DB;
  if (!db) {
    return redirect('/admin?error=' + encodeURIComponent('D1 database binding (DB) not configured.'));
  }

  const fd = await request.formData();
  const username = String(fd.get('username') || '').trim().slice(0, 100);
  const password = String(fd.get('password') || '').trim();
  const totpCode = String(fd.get('totp_code') || '').trim();

  if (!username || !password) {
    return redirect('/admin?error=' + encodeURIComponent('Username and password are required.'));
  }

  const ip = getClientIp(request);

  // 1. Check Brute-Force Rate Limit & Lockout (Max 5 failed attempts per 15 minutes)
  const lockout = await checkLoginLockout(db, ip, username);
  if (lockout.locked) {
    const mins = Math.ceil(lockout.retryAfterSeconds / 60);
    await logAction(db, 'login_lockout_blocked', { username, ip });
    return redirect(
      '/admin?error=' +
        encodeURIComponent(`Too many failed login attempts. Account/IP locked for ${mins} min(s).`)
    );
  }

  // Constant-time jitter delay (100–200ms)
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 100));

  const user = await getAdminUser(db, username).catch(() => null);
  if (!user) {
    await recordFailedLoginAttempt(db, ip, username);
    return redirect(
      '/admin?error=' +
        encodeURIComponent(`Invalid credentials. (${ Math.max(0, lockout.remainingAttempts - 1) } attempt(s) left)`)
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    await recordFailedLoginAttempt(db, ip, username);
    await logAction(db, 'login_failed', { username, ip });
    return redirect(
      '/admin?error=' +
        encodeURIComponent(`Invalid credentials. (${ Math.max(0, lockout.remainingAttempts - 1) } attempt(s) left)`)
    );
  }

  // 2. Check 2FA (TOTP Authenticator Code) if enabled in D1 or via ADMIN_TOTP_SECRET Worker Secret
  const envTotpSecret = getEnvSecret(env, 'ADMIN_TOTP_SECRET');
  const activeTotpSecret = (user.totp_enabled && user.totp_secret) ? String(user.totp_secret) : envTotpSecret;

  if (activeTotpSecret) {
    if (!totpCode) {
      return redirect('/admin?error=' + encodeURIComponent('2FA Authenticator 6-digit code is required.'));
    }
    const totpValid = await verifyTotpCode(activeTotpSecret, totpCode);
    if (!totpValid) {
      await recordFailedLoginAttempt(db, ip, username);
      await logAction(db, 'login_2fa_failed', { username, ip });
      return redirect('/admin?error=' + encodeURIComponent('Invalid 2FA Authenticator code.'));
    }
  }

  // 3. Login Succeeded: Clear failed attempts & create signed HttpOnly session
  await clearFailedLoginAttempts(db, ip, username);

  const ua = request.headers.get('User-Agent') || '';
  const sessionSecret = getEnvSecret(env, 'SESSION_SECRET');
  const signedToken = await createSession(db, user.id, ip, ua, sessionSecret);

  await db.prepare(`UPDATE admin_users SET last_login = datetime('now') WHERE id = ?`).bind(user.id).run();
  await logAction(db, 'login_success', { username, ip, two_factor: Boolean(activeTotpSecret) });

  const isSecure = new URL(request.url).protocol === 'https:';
  return redirect('/admin', 302, {
    'Set-Cookie': setSessionCookie(signedToken, isSecure),
  });
};
