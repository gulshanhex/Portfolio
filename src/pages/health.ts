import { getEnv } from '../lib/env';
import type { APIRoute } from 'astro';
import { jsonResponse } from '../lib/response';

export const GET: APIRoute = async ({ locals }) => {
  const db = getEnv()?.DB;
  if (!db) {
    return jsonResponse(
      {
        status: 'ok',
        mode: 'fallback-seed',
        db: 'unbound',
        timestamp: new Date().toISOString(),
      },
      200
    );
  }

  try {
    await db.prepare('SELECT 1').first();
    return jsonResponse({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return jsonResponse(
      {
        status: 'error',
        db: 'disconnected',
        error: err?.message || 'Database check failed',
      },
      503
    );
  }
};
