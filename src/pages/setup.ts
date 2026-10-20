import { getEnv } from '../lib/env';
import type { APIRoute } from 'astro';
import { hashPassword } from '../lib/auth';
import { escHtml } from '../lib/db';
import { getEnvSecret } from '../lib/env';
import { htmlResponse } from '../lib/response';
import { initializeDatabaseSchemaAndSeed } from '../lib/schema-sql';

function renderSetupForm(token: string, error = ''): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Setup · GK Portfolio</title>
  <style>
    :root {
      --bg: #0A0C0B;
      --surface: #111412;
      --card: #151A17;
      --border: #222B25;
      --text: #F4F1E8;
      --muted: #8E9992;
      --accent: #2FBF71;
      --accent-hover: #3CD07F;
      --danger: #EF4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --radius: 12px;
      --btn-radius: 8px;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      line-height: 1.5;
    }
    .box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    }
    .eyebrow {
      font-family: var(--mono);
      font-size: 0.78rem;
      color: var(--accent);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }
    p.sub {
      font-size: 0.88rem;
      color: var(--muted);
      margin-bottom: 1.8rem;
      line-height: 1.5;
    }
    .err {
      background: var(--danger-bg);
      border: 1px solid var(--danger);
      color: #FCA5A5;
      padding: 0.75rem 1rem;
      border-radius: var(--btn-radius);
      margin-bottom: 1.2rem;
      font-size: 0.84rem;
    }
    label {
      font-family: var(--mono);
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--muted);
      display: block;
      margin-bottom: 0.4rem;
    }
    input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--btn-radius);
      color: var(--text);
      font-family: var(--font);
      font-size: 0.92rem;
      padding: 0.75rem 0.9rem;
      margin-bottom: 1.2rem;
      outline: none;
      transition: border-color 0.15s ease;
    }
    input:focus {
      border-color: var(--accent);
    }
    button {
      width: 100%;
      background: var(--accent);
      color: #04130B;
      border: none;
      border-radius: var(--btn-radius);
      font-family: var(--font);
      font-size: 0.9rem;
      font-weight: 700;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    button:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="eyebrow">// INITIAL SETUP</div>
    <h1>GK Portfolio Setup</h1>
    <p class="sub">Create your administrator account to initialize the Cloudflare D1 database schema and seed content.</p>
    ${error ? `<div class="err" role="alert">${escHtml(error)}</div>` : ''}
    <form method="POST" action="/setup?token=${encodeURIComponent(token)}">
      <label for="setup-user">Admin Username</label>
      <input id="setup-user" type="text" name="username" required minlength="3" placeholder="admin" autocomplete="username"/>
      <label for="setup-pass">Admin Password</label>
      <input id="setup-pass" type="password" name="password" required minlength="8" placeholder="min 8 characters" autocomplete="new-password"/>
      <button type="submit">Initialize Database &rarr;</button>
    </form>
  </div>
</body>
</html>`;
}

async function handleSetupRequest(request: Request, locals: App.Locals): Promise<Response> {
  const url = new URL(request.url);
  const token = (url.searchParams.get('token') || '').trim();
  const env = getEnv();
  const db = env?.DB;
  const setupToken = getEnvSecret(env, 'ADMIN_SETUP_TOKEN');

  if (!db) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"/><title>Database Missing</title><style>body{background:#0A0C0B;color:#F4F1E8;font-family:'Inter',sans-serif;padding:3rem;text-align:center}h2{color:#EF4444;margin-bottom:1rem}code{background:#151A17;padding:2px 6px;border-radius:4px;color:#2FBF71}</style></head><body><h2>D1 Database binding "DB" not found</h2><p>Bind your D1 database as variable name <code>DB</code> in Cloudflare Worker Settings.</p></body></html>`,
      500
    );
  }

  if (!setupToken) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"/><title>Setup Disabled</title><style>body{background:#0A0C0B;color:#F4F1E8;font-family:'Inter',sans-serif;padding:3rem;text-align:center}h2{color:#EF4444;margin-bottom:1rem}code{background:#151A17;padding:2px 6px;border-radius:4px;color:#2FBF71}</style></head><body><h2>Setup disabled: ADMIN_SETUP_TOKEN secret not configured</h2><p>Add <code>ADMIN_SETUP_TOKEN</code> under Worker &rarr; Settings &rarr; Variables and Secrets.</p></body></html>`,
      403
    );
  }

  if (!token || token !== setupToken) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"/><title>Unauthorized</title><style>body{background:#0A0C0B;color:#F4F1E8;font-family:'Inter',sans-serif;padding:3rem;text-align:center}h2{color:#EF4444;margin-bottom:1rem}code{background:#151A17;padding:2px 6px;border-radius:4px;color:#2FBF71}</style></head><body><h2>Unauthorized</h2><p>Pass your valid ADMIN_SETUP_TOKEN as <code>?token=</code> in the URL.</p></body></html>`,
      403
    );
  }

  // Always ensure new tables and missing seed rows exist idempotently
  await initializeDatabaseSchemaAndSeed(db).catch(() => {});

  const existing = await db
    .prepare('SELECT COUNT(*) as n FROM admin_users')
    .first<{ n: number }>()
    .catch(() => null);
  const alreadyHasUsers = Boolean(existing && existing.n > 0);

  if (alreadyHasUsers) {
    return htmlResponse(
      `<!DOCTYPE html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"/><title>Already Initialized</title><style>body{font-family:'Inter',sans-serif;background:#0A0C0B;color:#F4F1E8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{background:#151A17;border:1px solid #222B25;border-radius:12px;padding:2.5rem;max-width:480px;text-align:center}h2{color:#2FBF71;margin-bottom:1rem}p{color:#8E9992;line-height:1.6;margin-bottom:1.5rem}a{display:inline-block;padding:8px 16px;background:#111412;border:1px solid #222B25;border-radius:6px;color:#2FBF71;text-decoration:none;font-weight:600;margin:0 4px}</style></head><body><div class="box"><h2>&#10003; Database Synced &amp; Active</h2><p>Your D1 database is active, and schema tables and migrations have been synced idempotently.</p><a href="/admin">&rarr; Go to Admin Panel</a> <a href="/">&rarr; View Portfolio</a></div></body></html>`,
      200
    );
  }

  if (request.method === 'POST') {
    const fd = await request.formData();
    const username = String(fd.get('username') || '').trim();
    const password = String(fd.get('password') || '').trim();

    if (username.length < 3) {
      return htmlResponse(renderSetupForm(token, 'Username must be at least 3 characters.'));
    }
    if (password.length < 8) {
      return htmlResponse(renderSetupForm(token, 'Password must be at least 8 characters.'));
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return htmlResponse(renderSetupForm(token, 'Username may only contain letters, numbers, - and _.'));
    }

    const hash = await hashPassword(password);
    await db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').bind(username, hash).run();

    return htmlResponse(
      `<!DOCTYPE html><html lang="en" data-theme="dark"><head><meta charset="UTF-8"/><title>Setup Complete</title><style>body{font-family:'Inter',sans-serif;background:#0A0C0B;color:#F4F1E8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{background:#151A17;border:1px solid #222B25;border-radius:12px;padding:2.5rem;max-width:480px;text-align:center}h1{color:#2FBF71;margin-bottom:0.75rem}p{color:#8E9992;line-height:1.6;margin-bottom:1rem}a{display:inline-block;padding:10px 20px;background:#2FBF71;color:#04130B;border-radius:6px;text-decoration:none;font-weight:700;margin:0.5rem}</style></head><body><div class="box"><h1>&#10003; Setup Complete!</h1><p>Database initialized. Admin user "<strong>${escHtml(username)}</strong>" created.</p><a href="/admin">Go to Admin Panel &rarr;</a><br/><p style="margin-top:1.5rem;font-size:0.8rem;color:#5A655F">Security tip: delete or rotate ADMIN_SETUP_TOKEN in your Worker secrets now that setup is complete.</p></div></body></html>`
    );
  }

  return htmlResponse(renderSetupForm(token, ''));
}

export const GET: APIRoute = async ({ request, locals }) => handleSetupRequest(request, locals);
export const POST: APIRoute = async ({ request, locals }) => handleSetupRequest(request, locals);
