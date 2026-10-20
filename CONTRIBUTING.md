# Contributing to GK Portfolio CMS

Thank you for your interest in contributing to **GK Portfolio CMS**! This project is an open-source, edge-native portfolio and content management system built on **Astro 5 SSR**, **Cloudflare Workers**, and **Cloudflare D1**.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Local Development Setup](#local-development-setup)
4. [Adding or Modifying Public UI Text](#adding-or-modifying-public-ui-text)
5. [Prebuild Verification Guards](#prebuild-verification-guards)
6. [Pull Request Checklist](#pull-request-checklist)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Core Architectural Principles

1. **The Admin Controls Everything**: No visible text, label, heading, button caption, placeholder, empty state, error message, `aria-label`, or `title` attribute in any public page or component may be hardcoded. Every string comes from database rows or the central UI registry (`src/lib/ui-strings.ts`) via `t(settings, key)`.
2. **Inline Admin Script Invariant (`src/pages/admin/index.astro`)**:
   - The admin script must remain a plain `<script is:inline>` with **no `define:vars`** attribute (Astro wraps `define:vars` scripts in an IIFE, hiding functions from inline `onclick="..."` handlers).
   - The CSRF token is read from `<div id="gk-csrf" data-token={csrfToken} hidden></div>`.
   - Every function referenced by an `onclick="..."` attribute must be declared at the top level of `<script is:inline>`.
3. **Zero Dead Controls**: Every setting editable in `/admin` and defined in `DEFAULT_SETTINGS` (`src/lib/schema-sql.ts`) must be actively read by the public site or explicitly documented in `scripts/check-settings-usage.mjs`.
4. **Protected Binary & Lockfile Assets**: Do not modify or delete `package-lock.json`, `public/fonts/*`, or `public/.assetsignore` unless explicitly upgrading dependencies or font subsets with full verification.
5. **Scoped Light-Mode Selector Rule**: Because `data-theme="light"` is set on `<html>`, any light-mode override inside a scoped Astro `<style>` block must use `:global([data-theme="light"]) .your-selector` or CSS custom properties from `src/styles/tokens.css`.

## Local Development Setup

1. **Prerequisites**: Node.js `>= 20.0.0` (Node 22 LTS recommended; see [`.nvmrc`](./.nvmrc)) and npm `>= 10.0.0`.
2. **Clone and Install**:
   ```bash
   git clone https://github.com/gulshanhex/portfolio.git
   cd portfolio
   npm ci
   ```
3. **Environment Variables**:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Edit `.dev.vars` to set `ADMIN_SETUP_TOKEN` and `SESSION_SECRET` for local development.
4. **Initialize Local D1 Database**:
   ```bash
   npm run db:schema:local
   npm run db:seed:local
   ```
5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Adding or Modifying Public UI Text

To add a new user-facing string to any public component or page:

1. Add **one entry** to `UI_STRINGS` in [`src/lib/ui-strings.ts`](./src/lib/ui-strings.ts):
   ```ts
   {
     key: 'section.my_new_label',
     default: 'Default Label Text',
     label: 'Human-Readable Admin Label',
     group: 'Group Name',
     help: 'Optional helper description shown in /admin',
     multiline: false,
     allowHtml: false,
   }
   ```
2. Read the string in your Astro component or page using `t(settings, 'section.my_new_label')`.
3. The **Interface Text** panel in `/admin` automatically renders the new input field, placeholder, search index, and per-field reset button from `UI_STRINGS` with zero changes needed in `src/pages/admin/index.astro`.

## Prebuild Verification Guards

Before submitting a pull request, run `npm run check` (also executed automatically during `npm run prebuild` and CI):

```bash
npm run check
```

This runs four automated verification scripts:
- `node scripts/check-admin.mjs`: Extracts `<script is:inline>` from `src/pages/admin/index.astro`, runs `node --check`, checks for forbidden `define:vars` or stray `async` tokens, and verifies every `onclick="..."` handler function is declared at top level.
- `node scripts/check-settings-usage.mjs`: Verifies every key in `DEFAULT_SETTINGS` is read in non-admin source files under `src/`.
- `node scripts/check-hardcoded-strings.mjs`: Scans all public `.astro` components and pages to ensure no static visible text or accessibility attributes bypass `t(settings, key)`.
- `node scripts/check-assets.mjs`: Verifies all self-hosted fonts (`wOF2` magic bytes and size thresholds), icons, manifest files, and offline assets exist on disk.

## Pull Request Checklist

- [ ] `npm run check` passes with 0 errors.
- [ ] `npm run build` completes cleanly.
- [ ] No personal emails, domains, or secrets are hardcoded in source files.
- [ ] Dark and light themes maintain WCAG AA contrast (`>= 4.5:1` for text, `>= 1.25:1` for dark card surface vs background, `>= 1.6:1` for dark card border vs background).
