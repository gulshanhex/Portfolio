#!/usr/bin/env node
/**
 * Build-Time Wrangler Config Injector
 * Runs automatically during `npm run build`.
 *
 * If process.env.D1_DATABASE_ID is set, rewrite database_id in wrangler.jsonc.
 * Otherwise no-op. Never fail the build.
 */
import fs from 'node:fs';
import path from 'node:path';

try {
  const root = process.cwd();
  const dbId = process.env.D1_DATABASE_ID?.trim();
  const dbName = process.env.D1_DATABASE_NAME?.trim();
  const workerName = process.env.WORKER_NAME?.trim();

  const jsoncPath = path.join(root, 'wrangler.jsonc');
  if (fs.existsSync(jsoncPath) && (dbId || dbName || workerName)) {
    const raw = fs.readFileSync(jsoncPath, 'utf8');
    const cfg = JSON.parse(raw);
    if (workerName) cfg.name = workerName;
    if (Array.isArray(cfg.d1_databases) && cfg.d1_databases[0]) {
      if (dbId) cfg.d1_databases[0].database_id = dbId;
      if (dbName) cfg.d1_databases[0].database_name = dbName;
    }
    fs.writeFileSync(jsoncPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    console.log('[prepare-wrangler] Updated wrangler.jsonc from environment variables.');
  }
} catch (err) {
  // Never fail the build
  console.warn('[prepare-wrangler] Warning: could not update wrangler.jsonc:', err?.message || err);
}
