// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/**
 * Astro Configuration for Cloudflare Workers SSR + D1 Edge Database
 * Documentation: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
 */
export default defineConfig({
  site: 'https://portfolio.gulshan-kumar.me',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'passthrough',
  }),
  compressHTML: true,
  security: {
    checkOrigin: false,
  },
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: true,
    },
    ssr: {
      external: ['node:buffer', 'node:crypto'],
    },
  },
});
