import { getEnv } from '../../lib/env';
import type { APIRoute } from 'astro';
import { clearSessionCookie, deleteSession, getSessionIdFromCookie } from '../../lib/auth';
import { redirect } from '../../lib/response';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getEnv()?.DB;
  const sid = getSessionIdFromCookie(request.headers.get('Cookie'));
  if (sid && db) {
    await deleteSession(db, sid);
  }
  const isSecure = new URL(request.url).protocol === 'https:';
  return redirect('/admin', 302, {
    'Set-Cookie': clearSessionCookie(isSecure),
  });
};
