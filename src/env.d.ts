/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types/2023-07-01" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
  // Cloudflare D1 Binding
  DB: D1Database;
  // Static Assets Binding
  ASSETS: Fetcher;
  // Secrets configured in Cloudflare Dashboard (Variables and Secrets → Type: Secret)
  ADMIN_SETUP_TOKEN?: string;
  SESSION_SECRET?: string;
  ADMIN_ACCESS_KEY?: string;
  ADMIN_TOTP_SECRET?: string;
  SITE_URL?: string;
  ENVIRONMENT?: string;
}

declare namespace App {
  interface Locals extends Runtime {
    adminSession?: {
      user_id: number;
      username: string;
      expires_at: string;
      session_id: string;
    } | null;
    csrfToken?: string;
  }
}
