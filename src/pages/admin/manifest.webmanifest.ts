import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const manifest = {
    id: '/admin/?source=pwa',
    name: 'GK Admin · Portfolio Control Plane',
    short_name: 'GK Admin',
    description: 'Autonomous administration and content management for Gulshan Kumar portfolio.',
    start_url: '/admin/',
    scope: '/admin/',
    display: 'standalone',
    background_color: '#0A0C0B',
    theme_color: '#0A0C0B',
    orientation: 'any',
    lang: 'en-IN',
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
