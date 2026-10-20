import { env } from 'cloudflare:workers';
// ── Cloudflare Worker Environment & Secret Helper ─────────────────────────
// Safely reads variables and secrets configured in Cloudflare Dashboard
// (Settings → Variables and Secrets → Text | JSON | Secret modes).
// No secrets or variables need to be stored in wrangler.jsonc.

export function getEnvSecret(env: any, name: string): string {
  if (!env) return '';
  const raw = env[name];
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'string') {
    // Strip accidental surrounding whitespace or quotes if pasted into Secret box
    return raw.trim().replace(/^['"]|['"]$/g, '');
  }
  if (typeof raw === 'object') {
    return JSON.stringify(raw);
  }
  return String(raw).trim();
}

export function getSiteUrl(env: any, fallbackOrigin = 'https://portfolio.example.com'): string {
  const fromSecret = getEnvSecret(env, 'SITE_URL');
  if (fromSecret && fromSecret.startsWith('http')) {
    return fromSecret.replace(/\/$/, '');
  }
  return (fallbackOrigin || 'https://portfolio.example.com').replace(/\/$/, '');
}

// ── Astro 7 / @astrojs/cloudflare v14 migration ───────────────────────────
// `Astro.locals.runtime` was removed in adapter v14. Worker bindings and
// secrets are now imported directly from the `cloudflare:workers` module.
export function getEnv(): Env {
  return env as unknown as Env;
}
