// ── Astro Cloudflare Worker Security Middleware ───────────────────────────
// 1. Optional Secret Admin Gate (ADMIN_ACCESS_KEY) hides /admin with a 404
// 2. Server-side session authentication on all /admin and /api/admin/* routes
// 3. Cross-Origin CSRF Origin / Sec-Fetch-Site protection on mutating requests
// 4. Per-session HMAC CSRF token generation
// 5. Hardened security headers (CSP, HSTS, X-Frame-Options, nosniff)

import { defineMiddleware } from 'astro:middleware';
import {
  generateCsrfToken,
  getSessionIdFromCookie,
  setAdminGateCookie,
   timingSafeEqual,
  validateSession,
  verifyAdminGateCookie,
} from './lib/auth';
import { getEnvSecret } from './lib/env';
import { forbidden, redirect, SECURITY_HEADERS, unauthorized } from './lib/response';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, locals } = context;
  const pathname = url.pathname;
  const method = request.method.toUpperCase();
  const env = locals.runtime?.env;
  const db = env?.DB;
  const sessionSecret = getEnvSecret(env, 'SESSION_SECRET');
  const adminAccessKey = getEnvSecret(env, 'ADMIN_ACCESS_KEY');

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminRoute) {
    const cookieHeader = request.headers.get('Cookie');

    // 1. Optional Secret Admin Gate Check (if ADMIN_ACCESS_KEY is configured in Worker Secrets)
    if (adminAccessKey) {
      const providedKey = (url.searchParams.get('key') || '').trim();
      if (providedKey && timingSafeEqual(providedKey, adminAccessKey)) {
        const isSecure = url.protocol === 'https:';
        const gateCookie = await setAdminGateCookie(adminAccessKey, isSecure);
        return redirect('/admin', 302, { 'Set-Cookie': gateCookie });
      }
      const gateValid = await verifyAdminGateCookie(cookieHeader, adminAccessKey);
      if (!gateValid) {
        // Return stealth 404 so automated scanners cannot discover /admin
        return new Response('Not Found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Robots-Tag': 'noindex, nofollow',
            ...SECURITY_HEADERS,
          },
        });
      }
    }

    // 2. Cross-Origin CSRF Check on state-changing requests (POST, PUT, DELETE, PATCH)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = request.headers.get('Origin');
      const secFetchSite = request.headers.get('Sec-Fetch-Site');
      if (origin && origin !== url.origin) {
        return forbidden('CSRF validation failed: cross-origin request blocked.');
      }
      if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
        return forbidden('CSRF validation failed: invalid Sec-Fetch-Site.');
      }
    }

    // 3. Server-Side Session Validation
    const cookieToken = getSessionIdFromCookie(cookieHeader);
    const session = cookieToken && db ? await validateSession(db, cookieToken, sessionSecret) : null;
    locals.adminSession = session;

    if (session) {
      locals.csrfToken = await generateCsrfToken(session.session_id, sessionSecret);
    }

    // 4. Enforce strict server-side auth on all /api/admin/* routes at middleware level
    if (pathname.startsWith('/api/admin') && !session) {
      return unauthorized('Unauthorized: valid admin session required.');
    }
  }

  const response = await next();

  // Attach hardened security headers to every response
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }

  // Ensure admin & setup routes are never indexed or cached
  if (isAdminRoute || pathname.startsWith('/setup')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
});
