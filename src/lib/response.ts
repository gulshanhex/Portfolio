// ── HTTP Response & Hardened Security Headers ─────────────────────────────

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' https: data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';",
};

export function htmlResponse(body: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function publicHtmlResponse(body: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function redirect(location: string, status = 302, extraHeaders: Record<string, string> = {}): Response {
  return new Response(null, {
    status,
    headers: {
      Location: location,
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  });
}

export function notFound(message = 'Not found'): Response {
  return jsonResponse({ error: message }, 404);
}

export function unauthorized(message = 'Unauthorized'): Response {
  return jsonResponse({ error: message }, 401);
}

export function forbidden(message = 'Forbidden'): Response {
  return jsonResponse({ error: message }, 403);
}

export function badRequest(message = 'Bad request'): Response {
  return jsonResponse({ error: message }, 400);
}

export function tooManyRequests(message = 'Too many requests. Please try again later.', retryAfterSec = 900): Response {
  return jsonResponse({ error: message, retry_after: retryAfterSec }, 429, {
    'Retry-After': String(retryAfterSec),
  });
}

export function serverError(message = 'Internal server error'): Response {
  return jsonResponse({ error: message }, 500);
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}
