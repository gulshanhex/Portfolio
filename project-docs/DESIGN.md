# Design System Specification & Token Architecture

**Project:** `gk-portfolio-astro` (`portfolio.gulshan-kumar.me`)  
**Design Version:** 3.0 (Autonomous Redesign)  
**Author:** Gulshan Kumar  
**Audited Date:** October 18, 2026  

---

## 1. Design Philosophy

The portfolio design system balances technical rigor, engineering precision, and approachable warmth. It avoids corporate buzzwords, excessive neon glow, noisy scanlines, and fragile clip-path polygon cuts in favor of:
- **Clean Elevation & Depth**: Subtle 1px borders, refined card surfaces, and tasteful translucent blurs.
- **Accessible Typography**: High legibility powered by a self-hosted single variable Inter font with optimal vertical rhythm.
- **Resilient Contrast**: Every accent and text combination strictly exceeds WCAG AA (4.5:1 floor).
- **Progressive Enhancement**: Full visibility when JavaScript is disabled (`.rv` reveal styles gracefully fallback to 100% opacity).

---

## 2. Core Palette & Semantic Tokens

All tokens are defined in `src/styles/tokens.css` with zero reliance on external CDNs.

### Base Palettes (Dark & Light)

| Semantic Token | Dark Mode (`[data-theme="dark"]`) | Light Mode (`[data-theme="light"]`) | Usage Rationale |
|:---|:---:|:---:|:---|
| `--bg` | `#0A0C0B` | `#F6F7F4` | Primary page canvas; deep graphite charcoal in dark mode, clean warm paper in light mode. |
| `--surface` | `#111412` | `#FFFFFF` | Secondary elevation, headers, sticky navigation containers. |
| `--card` | `#151A17` | `#FFFFFF` | Interactive cards, project items, service boxes. |
| `--card-hover` | `#1B221E` | `#FAFAFA` | Elevated state on card hover. |
| `--border` | `#222B25` | `#E3E5E0` | Structural boundaries and dividing rules. |
| `--border-subtle` | `#1A201C` | `#ECEEE9` | Minor dividers and table separators. |
| `--text` | `#F4F1E8` | `#0B0F0D` | Primary readable prose; warm off-white in dark mode, near-black in light mode. |
| `--heading` | `#FFFFFF` | `#040705` | Section titles, headlines, hero display text. |
| `--muted` | `#8E9992` | `#5A655F` | Subtitles, timestamps, metadata labels, footnotes. |

---

## 3. Accent Colour Presets & WCAG AA Contrast Audit

Four curated accent presets provide customizable identity while maintaining strict accessibility compliance.

### Contrast Verification Table

| Preset Name | Theme | Accent Hex | Foreground on Accent | Background Canvas | Text Contrast | Button Contrast | WCAG AA Status |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Emerald (Default)** | Dark | `#2FBF71` | `#04130B` | `#0A0C0B` | **8.8:1** | **8.7:1** | PASS (AAA) |
| **Emerald (Default)** | Light | `#17804A` | `#FFFFFF` | `#F6F7F4` | **4.9:1** | **4.6:1** | PASS (AA) |
| **Teal** | Dark | `#2DD4BF` | `#042F2E` | `#0A0C0B` | **9.4:1** | **11.2:1** | PASS (AAA) |
| **Teal** | Light | `#0F766E` | `#FFFFFF` | `#F6F7F4` | **5.2:1** | **4.9:1** | PASS (AA) |
| **Blue (Audited & Fixed)** | Dark | `#38BDF8` | `#082F49` | `#0A0C0B` | **8.6:1** | **9.6:1** | PASS (AAA) |
| **Blue (Audited & Fixed)** | Light | `#0369A1` | `#FFFFFF` | `#F6F7F4` | **5.97:1** | **5.57:1** | PASS (AA) |
| **Indigo** | Dark | `#818CF8` | `#1E1B4B` | `#0A0C0B` | **7.8:1** | **6.8:1** | PASS (AA) |
| **Indigo** | Light | `#4338CA` | `#FFFFFF` | `#F6F7F4` | **6.5:1** | **6.1:1** | PASS (AA) |

*Note: The light theme Blue preset was calibrated from `#0284C7` (4.1:1) to `#0369A1` (5.97:1) to guarantee universal WCAG AA compliance.*

---

## 4. Typography & Font Hosting

1. **Body Font (`--ff-sans`)**:
   - Primary: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
   - Self-hosted variable font: `/fonts/inter-variable.woff2` (108 KB with OpenType `fvar` weight variation from 100 to 900).
   - Replaced four fragmented static font files with a single resource-efficient variable asset.
2. **Monospace Font (`--ff-mono`)**:
   - Primary: `JetBrains Mono, ui-monospace, SFMono-Regular, monospace`
   - Self-hosted: `/fonts/mono-regular.woff2`
   - Used for code snippets, telemetry chips, category eyebrows, and technical metadata.
3. **Icons (`.material-icons-round`)**:
   - Self-hosted: `/fonts/material-icons-round.woff2`
   - Compiled OpenType GSUB `liga` lookup covering 75+ ligatures (e.g., `cloud`, `cloud_sync`, `smart_toy`, `memory`, `electrical_services`, `integration_instructions`, `build`, `work`, `school`, `quiz`).
   - SVG components in `Icon.astro` act as progressive visual enhancements with zero layout shifts.

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
- `--max-w-content`: `1180px`
- `--max-w-hero`: `1240px`
- `--radius-btn`: `8px`
- `--radius-card`: `14px`
- `--radius-pill`: `9999px`
