# Design System Specification & Token Architecture

**Project:** `gk-portfolio-astro` (`portfolio.gulshan-kumar.me`)  
**Design Version:** 3.0  
**Author:** Gulshan Kumar  

---

## 1. Design Philosophy

The portfolio design system balances technical clarity and readability:
- **Clean Elevation & Depth**: Subtle 1px borders, card surfaces, and translucent header blurs.
- **Accessible Typography**: Self-hosted variable Inter for prose/headings, monospace for code/metadata, and Material Icons Round ligatures.
- **Resilient Contrast**: Every foreground/background and button/pill/badge combination on `--accent` exceeds WCAG AA (4.5:1 floor).
- **Progressive Enhancement**: Full content visibility when JavaScript is disabled (`.rv` hiding is gated behind `html.js`).

---

## 2. Core Palette & Semantic Tokens

All tokens are defined in `src/styles/tokens.css`.

### Base Palettes (Dark & Light)

| Semantic Token | Dark Mode (`[data-theme="dark"]`) | Light Mode (`[data-theme="light"]`) | Usage |
|:---|:---:|:---:|:---|
| `--bg` | `#0A0C0B` | `#F6F7F4` | Primary page canvas |
| `--surface` | `#111513` | `#FFFFFF` | Secondary elevation, sticky navigation |
| `--card` | `#111513` | `#FFFFFF` | Cards, project items, service boxes |
| `--card-hover` | `#161C19` | `#F8F9F7` | Elevated state on card hover |
| `--border` | `#1E2521` | `#E3E6E0` | Structural boundaries and dividing rules |
| `--text` | `#F4F1E8` | `#0B0F0D` | Primary body prose |
| `--heading` | `#F4F1E8` | `#0B0F0D` | Section titles, headlines |
| `--muted` | `#9AA39E` | `#5B645F` | Subtitles, timestamps, metadata labels |

---

## 3. Accent Colour Presets & WCAG AA Contrast Audit

All buttons, pills, and badges that sit on `var(--accent)` (or its alias `var(--lime)`) use `color: var(--text-on-accent)`.

| Preset Name | Theme | `--accent` | `--accent-hover` | `--text-on-accent` | `--text-on-accent` on `--accent` | `--text-on-accent` on `--accent-hover` | `--accent` on `--bg` | WCAG AA Status |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Emerald (Default)** | Dark | `#2FBF71` | `#3DD683` | `#04130B` | **7.99:1** | **10.10:1** | **8.75:1** | PASS |
| **Emerald (Default)** | Light | `#17804A` | `#136C3E` | `#FFFFFF` | **4.97:1** | **6.48:1** | **4.62:1** | PASS |
| **Teal** | Dark | `#2DD4BF` | `#5EEAD4` | `#042F2E` | **7.77:1** | **9.78:1** | **10.97:1** | PASS |
| **Teal** | Light | `#0F766E` | `#115E59` | `#FFFFFF` | **5.47:1** | **7.58:1** | **5.09:1** | PASS |
| **Blue** | Dark | `#38BDF8` | `#7DD3FC` | `#082F49` | **6.48:1** | **8.32:1** | **9.39:1** | PASS |
| **Blue** | Light | `#0369A1` | `#075985` | `#FFFFFF` | **5.93:1** | **7.56:1** | **5.51:1** | PASS |
| **Indigo** | Dark | `#818CF8` | `#A5B4FC` | `#1E1B4B` | **5.36:1** | **8.02:1** | **6.65:1** | PASS |
| **Indigo** | Light | `#4338CA` | `#3730A3` | `#FFFFFF` | **7.90:1** | **9.93:1** | **7.35:1** | PASS |

---

## 4. Typography & Font Hosting

1. **Body Font (`--ff-sans`)**:
   - `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
   - Self-hosted variable font at `/fonts/inter-variable.woff2` (`font-weight: 100 900`).
2. **Monospace Font (`--ff-mono`)**:
   - `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
   - Self-hosted at `/fonts/mono-regular.woff2`.
3. **Icons (`.material-icons-round`, `.mi`)**:
   - Self-hosted at `/fonts/material-icons-round.woff2` with `font-feature-settings: 'liga'`.
   - `Icon.astro` inline SVGs provide progressive enhancement on public components.

---

## 5. Layout & Spacing Scale

- `--sp-1`: `4px`
- `--sp-2`: `8px`
- `--sp-3`: `12px`
- `--sp-4`: `16px`
- `--sp-5`: `24px`
- `--sp-6`: `32px`
- `--sp-7`: `48px`
- `--sp-8`: `64px`
- `--sp-9`: `96px`
- `--max-w-content`: `1240px`
- `--radius-btn`: `10px`
- `--radius-card`: `12px`
- `--radius-pill`: `9999px`
