# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-10-19

### Added
- **Central UI Strings Registry (`src/lib/ui-strings.ts`)**: Single source of truth for 115+ public interface strings across 11 groups (`t(settings, key)`), stored under `site_settings.ui`.
- **Automatic "Interface Text" Admin Panel (`src/pages/admin/index.astro`)**: Dynamically generated from `UI_STRINGS` with collapsible group sections, live search filtering, default placeholders, per-field reset buttons, and server-confirmed save (`POST /api/admin/settings` with `{ ui: {...} }`).
- **Hero Visual Customization**: Added `hero.visual_variant` (`"chat+chart" | "chart" | "none"`) and a dedicated **Hero Visual Card** editor in the Hero & About admin panel so every metric, label, chat bubble, code line, and caption is editable.
- **Editable Footer Links**: Added add/remove/reorder support for `global.footer_links` (`{ label, url }`) in the Global Settings admin panel.
- **Prebuild Regression Guards**:
  - `scripts/check-admin.mjs`: Validates `<script is:inline>` syntax with `node --check`, prevents `define:vars` IIFE regressions, checks `async function loadHero()`, and verifies every `onclick="..."` handler is declared at top level.
  - `scripts/check-settings-usage.mjs`: Verifies every key in `DEFAULT_SETTINGS` is read in non-admin source files under `src/`.
  - `scripts/check-hardcoded-strings.mjs`: Scans public `.astro` templates to ensure no static visible text or accessibility attributes bypass `t(settings, key)`.
- **Open-Source Packaging**: Added `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `THIRD_PARTY_NOTICES.md`, `.nvmrc`, `.editorconfig`, GitHub issue/PR templates, Dependabot config, CI workflow (`.github/workflows/ci.yml`), and comprehensive documentation under `docs/`.

### Changed
- **Dark Mode Card Contrast (`src/styles/tokens.css`)**: Elevated `--surface` / `--card` to `#1E2622` (`1.27:1` vs `--bg` `#0A0C0B`) and `--border` to `#34423C` (`1.86:1` vs `--bg`), while maintaining WCAG AA/AAA text contrast across all four accent presets (`emerald`, `teal`, `blue`, `indigo`) in both dark and light modes.
- **One-Time Lazy Label & Copy Migrations (`src/lib/schema-sql.ts`)**: Idempotently migrates unedited legacy section labels, hero CTAs, and eyebrows behind the `_migrations.v3_labels_v1` flag without touching user-customized content.
- **Hero Owner Name & Availability Badge**: Displays `global.name` as a dedicated line above the primary `<h1>` headline and wires `contact.availability_badge` and `contact.main_site` across Hero, About, Contact, and Footer.
- **Theme Glow Control**: Replaced unused particle/noise/scanline toggles in the admin UI with a single `Glow Intensity` control (`data-glow` driving `--glow-opacity`) while preserving legacy stored values in D1.
- **Neutral Fresh-Install Defaults**: Replaced personal names, emails, and domains in `src/lib/schema-sql.ts`, `seed.sql`, and code fallbacks with neutral defaults (`"Your Name"`, `"hello@example.com"`, `"https://portfolio.example.com"`), and removed fabricated sample testimonials.

### Fixed
- **Light Mode Scoped CSS Selectors**: Replaced scoped `[data-theme="light"]` selectors with `:global([data-theme="light"])` in `TopNav.astro`, `BottomNav.astro`, `HeroVisual.astro`, `services/[slug].astro`, `work/index.astro`, and `work/[slug].astro`.
- **Raw HTML Escaping Bug**: Rendered stored database fields that support basic HTML (`<strong>`, `<em>`, `<br>`) through `sanitizeBasicHtml()` with `set:html` across experience bullets (`TimelineItem.astro`), education items (`Education.astro`), service descriptions, project summaries/case studies, FAQ answers (`FaqItem.astro`), and testimonial quotes (`Proof.astro`).
- **Proof Section Initials & Headings (`src/components/Proof.astro`)**: Wired `proof_section.section_title` and `proof_section.testimonials_title`, converted all-caps headings to sentence case, and rendered high-contrast organization initials badges natively in both themes.
- **Mobile PWA Install Button Placement**: Removed the icon-only install button from the mobile top header and added labelled `"Install app"` items to the mobile More sheet (`BottomNav.astro`) and `Footer.astro` (automatically hidden in standalone display mode).
