import type { APIRoute } from 'astro';
import { getAllSettings } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const settings = await getAllSettings(db);
  const g = settings.global || {};
  const siteName = g.site_name || 'Portfolio';

  const manifest = {
    id: '/admin/',
    name: `${siteName} Admin · Control Plane`,
    short_name: 'Admin',
    description: `Administration and content management for ${siteName}.`,
    start_url: '/admin/',
    scope: '/admin/',
    display: 'standalone',
    background_color: '#0A0C0B',
    theme_color: '#0A0C0B',
    orientation: 'any',
    lang: 'en-US',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
