// ── Response Utilities ────────────────────────────────────────────────────

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function htmlResponse(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}

export function redirect(location, status = 302) {
  return new Response(null, {
    status,
    headers: { Location: location }
  });
}

export function notFound(message = 'Not found') {
  return jsonResponse({ error: message }, 404);
}

export function unauthorized(message = 'Unauthorized') {
  return jsonResponse({ error: message }, 401);
}

export function badRequest(message = 'Bad request') {
  return jsonResponse({ error: message }, 400);
}

export function serverError(message = 'Internal server error') {
  return jsonResponse({ error: message }, 500);
}

// For public pages: cache with short TTL
export function publicHtmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      ...SECURITY_HEADERS,
    }
  });
}

export function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    null;
}
