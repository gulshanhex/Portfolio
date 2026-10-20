# Design System, Tokens & Accessibility

All visual styling is governed by [`src/styles/tokens.css`](../src/styles/tokens.css) and [`src/styles/global.css`](../src/styles/global.css).

## 1. Typography (100% Self-Hosted, Zero External Font Requests)

All fonts are self-hosted in `public/fonts/` and verified during `prebuild` by `scripts/check-assets.mjs`:

| Font Family | File | Role |
| :--- | :--- | :--- |
| **Inter Variable** | `public/fonts/inter-variable.woff2` | Primary UI, headings (`--ff-sans`), and body copy |
| **JetBrains Mono** | `public/fonts/mono-regular.woff2` | Eyebrows, badges, telemetry metrics, and code (`--ff-mono`) |
| **Material Icons Round** | `public/fonts/material-icons-round.woff2` | Self-hosted ligature icon subset (`font-feature-settings: 'liga'`) |

## 2. Color Tokens & Dark Card Contrast

### Dark Theme (`:root`, `[data-theme="dark"]`)

Cards are clearly separated from the page background while preserving high text contrast:

| Token | Hex | Contrast vs `--bg` (`#0A0C0B`) | Contrast vs `--surface` (`#1E2622`) | Requirement |
| :--- | :--- | :---: | :---: | :--- |
| `--bg` | `#0A0C0B` | 1.00:1 | — | Base canvas |
| `--bg-subtle` | `#111614` | 1.06:1 | — | Subtle section separation |
| `--surface` / `--card` | `#1E2622` | **1.27:1** | 1.00:1 | `>= 1.25:1` card separation |
| `--surface-raised` / `--card-hover` | `#242E29` | **1.40:1** | 1.10:1 | Elevated / hover surface |
| `--border` | `#34423C` | **1.86:1** | 1.47:1 | `>= 1.60:1` border separation |
| `--text` / `--heading` | `#F4F1E8` | **17.39:1** | **13.72:1** | WCAG AAA (`>= 7.0:1`) |
| `--muted` / `--text-muted` | `#A6B0AB` | **8.81:1** | **6.95:1** | WCAG AA (`>= 4.5:1`) |

### Light Theme (`[data-theme="light"]`)

| Token | Hex | Contrast vs `--bg` (`#F6F7F4`) | Contrast vs `--surface` (`#FFFFFF`) | Requirement |
| :--- | :--- | :---: | :---: | :--- |
| `--bg` | `#F6F7F4` | 1.00:1 | — | Base canvas |
| `--surface` / `--card` | `#FFFFFF` | 1.07:1 | 1.00:1 | Elevated white card + shadow |
| `--border` | `#D5DAD2` | 1.32:1 | 1.41:1 | Crisp card border |
| `--text` / `--heading` | `#0B0F0D` | **17.90:1** | **19.16:1** | WCAG AAA (`>= 7.0:1`) |
| `--muted` / `--text-muted` | `#525B56` | **6.34:1** | **6.78:1** | WCAG AA (`>= 4.5:1`) |

## 3. Accent Presets (WCAG AA Verified in Both Themes)

All four accent presets selectable in `/admin` → **Theme** exceed the WCAG AA `4.5:1` threshold:

| Preset | Theme | Accent (`--accent`) | Button Foreground (`--text-on-accent`) | Button Contrast | Accent vs `--bg` | Accent vs `--surface` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Emerald** | Dark | `#2FBF71` | `#04130B` | **8.30:1** | **8.70:1** | **6.87:1** |
| **Emerald** | Light | `#17804A` | `#FFFFFF` | **5.05:1** | **4.71:1** | **5.05:1** |
| **Teal** | Dark | `#2DD4BF` | `#042F2E` | **8.49:1** | **11.16:1** | **8.81:1** |
| **Teal** | Light | `#0F766E` | `#FFFFFF` | **5.47:1** | **5.10:1** | **5.47:1** |
| **Blue** | Dark | `#38BDF8` | `#082F49` | **7.51:1** | **9.62:1** | **7.59:1** |
| **Blue** | Light | `#0369A1` | `#FFFFFF` | **5.93:1** | **5.54:1** | **5.93:1** |
| **Indigo** | Dark | `#818CF8` | `#1E1B4B` | **5.66:1** | **6.82:1** | **5.38:1** |
| **Indigo** | Light | `#4338CA` | `#FFFFFF` | **7.64:1** | **7.13:1** | **7.64:1** |

## 4. Ambient Glow Intensity (`data-glow`)

The **Glow Intensity** setting in `/admin` → **Theme** sets `data-glow="none" | "subtle" | "balanced" | "strong"` on `<html>`, which drives `--glow-opacity` (`0`, `0.14`, `0.26`, `0.42`) and `--accent-glow` in `src/styles/tokens.css`.

## 5. Scoped Light-Mode Rule for Astro Components

Because Astro scopes component `<style>` rules with `[data-astro-cid-*]`, writing `[data-theme="light"] .my-class` inside a component `<style>` block will fail to match `<html>`. Always use `:global([data-theme="light"]) .my-class` or rely on theme tokens from `src/styles/tokens.css`.
