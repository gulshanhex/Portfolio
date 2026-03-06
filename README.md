<div align="center">

<img src="https://img.shields.io/badge/-%20GULSHAN%20KUMAR-060908?style=for-the-badge&logoColor=8ecf00" height="42"/>

### Automation & AI Systems Engineer · Python · Web · Cloud

[![Live Site](https://img.shields.io/badge/▸%20Live%20Site-gulshan.isroot.in-8ecf00?style=flat-square&labelColor=060908&logoColor=8ecf00)](https://gulshan.isroot.in)
[![Portfolio](https://img.shields.io/badge/▸%20Portfolio-gulshankumar.isroot.in-8ecf00?style=flat-square&labelColor=060908)](https://gulshankumar.isroot.in)
[![License](https://img.shields.io/badge/License-MIT-8ecf00?style=flat-square&labelColor=060908)](LICENSE)
[![Location](https://img.shields.io/badge/📍-Delhi,%20India-060908?style=flat-square&labelColor=1a1a1a&color=8ecf00)](https://gulshan.isroot.in)

</div>

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/folder_open/v1/24px.svg" width="20" valign="middle"/> &nbsp;Repository Structure

```
gulshan-portfolio/
│
├── README.md                   ← You are here
├── .gitignore
├── LICENSE
│
├── dist/                       ⭐  DEPLOY THIS — single self-contained file
│   └── index.html              ←  All CSS + JS + data merged into one file
│
└── src/                        ✏️  EDIT THIS — clean modular source
    ├── index.html              ←  HTML structure only
    ├── style.css               ←  All styles
    ├── script.js               ←  All JavaScript
    ├── config.json             ←  Personal info · skills · experience · education
    ├── projects.json           ←  Projects data
    └── reviews.json            ←  Client testimonials
```

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/rocket_launch/v1/24px.svg" width="20" valign="middle"/> &nbsp;Which File Should You Use?

### <img src="https://fonts.gstatic.com/s/i/materialiconsround/cloud_upload/v1/24px.svg" width="18" valign="middle"/> &nbsp;Hosting / Deployment → `dist/index.html`

```
dist/index.html  ←  UPLOAD ONLY THIS ONE FILE
```

| Property | Detail |
|----------|--------|
| **Zero Dependencies** | No external files required |
| **Universal Hosting** | Works on cPanel · Hostinger · unaux and all shared hosts |
| **Works Offline Too** | Opens directly via `file://` — no server needed |
| **Self-Contained** | CSS + JS + all data packed into one file |

### <img src="https://fonts.gstatic.com/s/i/materialiconsround/edit/v1/24px.svg" width="18" valign="middle"/> &nbsp;Code Editing → `src/` folder

| File | Purpose |
|------|---------|
| `src/index.html` | HTML structure |
| `src/style.css` | All visual styles |
| `src/script.js` | JavaScript logic |
| `src/config.json` | Personal info · skills · experience · education |
| `src/projects.json` | Projects — add or update entries |
| `src/reviews.json` | Client logos and testimonials |

> **⚠️ Warning:** Never deploy the `src/` folder directly to hosting. JSON files load via `fetch()`, which gets blocked by CORS on shared hosting. Always merge changes back into `dist/index.html` before deploying.

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/auto_awesome/v1/24px.svg" width="20" valign="middle"/> &nbsp;Features

| Category | Feature |
|----------|---------|
| **Theme** | Forest-Noir dark — `#060908` background · `#8ecf00` lime accent |
| **Cursor** | Custom sharp lime arrow with animated glow trail |
| **Particles** | Canvas particle network — 80 animated nodes with collision lines |
| **Animations** | Scroll-reveal with staggered entrance effects |
| **Terminal** | Interactive typewriter cycling through 4 live commands |
| **Projects** | Filterable grid — Bots · Web · Cloud · Industrial · Backend |
| **Numbers** | Animated stat count-up triggered on scroll |
| **Buttons** | Magnetic hover pull effect |
| **Icons** | Google Material Icons Round throughout |
| **Layout** | Fully responsive — mobile hamburger · adaptive grids |
| **Sections** | Hero · About · Skills · Experience · Education · Projects · Reviews · Contact |

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/tune/v1/24px.svg" width="20" valign="middle"/> &nbsp;How to Update Content

### Option A — Edit `src/` *(Recommended for developers)*

**Personal info · skills · experience · education · terminal commands:**
→ Edit `src/config.json`

**Add or update projects:**
→ Add a new object to the array in `src/projects.json`

**Testimonials and client logos:**
→ Edit `src/reviews.json`

**Visual styles:**
→ Edit `src/style.css` — CSS variables are defined at the top inside `:root {}`

---

### Option B — Edit `dist/index.html` Directly

Open the file and locate the clearly labeled constants inside the `<script>` tag:

```javascript
const SKILLS     = [ ... ]   // Line ~380
const EXPERIENCE = [ ... ]   // Line ~390
const EDUCATION  = [ ... ]   // Line ~405
const PROJECTS   = [ ... ]   // Line ~420
const CLIENTS    = [ ... ]   // Line ~445
const REVIEWS    = [ ... ]   // Line ~455
const TERM_LINES = [ ... ]   // Line ~465
```

Edit → Save → Upload. Done.

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/palette/v1/24px.svg" width="20" valign="middle"/> &nbsp;Theme Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | ![#060908](https://img.shields.io/badge/-%23060908-060908?style=flat-square) `#060908` | Main background |
| `--lime` | ![#8ecf00](https://img.shields.io/badge/-%238ecf00-8ecf00?style=flat-square) `#8ecf00` | Primary accent |
| `--ember` | ![#cc4500](https://img.shields.io/badge/-%23cc4500-cc4500?style=flat-square) `#cc4500` | Badge accent |
| `--text` | ![#c2d4ae](https://img.shields.io/badge/-%23c2d4ae-c2d4ae?style=flat-square) `#c2d4ae` | Body text |
| `--heading` | ![#d8e8c4](https://img.shields.io/badge/-%23d8e8c4-d8e8c4?style=flat-square) `#d8e8c4` | Headings |

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/build/v1/24px.svg" width="20" valign="middle"/> &nbsp;Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 |
| **Styling** | CSS3 — custom properties · grid · clip-path · keyframe animations |
| **Logic** | Vanilla JavaScript ES6+ |
| **Data** | JSON (`src/` only) |
| **Fonts** | Google Fonts — Bebas Neue · JetBrains Mono · Fraunces |
| **Icons** | Google Material Icons Round |

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/publish/v1/24px.svg" width="20" valign="middle"/> &nbsp;Deployment — 3 Steps

```
1.  Open the dist/ folder
2.  Copy index.html
3.  Upload it to your hosting root (public_html/ or equivalent)
```

| Platform | Status |
|----------|--------|
| cPanel / Hostinger / unaux | ✅ Supported |
| Netlify | ✅ Supported |
| GitHub Pages | ✅ Supported |
| Vercel | ✅ Supported |
| Local (double-click) | ✅ Supported |
| `src/` deployed directly | ❌ Not supported — CORS issues |

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/view_quilt/v1/24px.svg" width="20" valign="middle"/> &nbsp;Sections Overview

| # | Section | Description |
|---|---------|-------------|
| — | **Hero** | Animated name · system info panel · particle canvas |
| 01 | **About** | Bio · personal motto · animated stat counters |
| 02 | **Skills** | 6 tech category cards with highlighted hot skills |
| 03 | **Experience** | Editorial layout — Losung Automation · Elent Electronics |
| 04 | **Education** | Class 12 (In Progress) · Class 10 (70.8%) |
| 05 | **Projects** | Filterable grid with hover overlay and CTAs |
| 06 | **Reviews** | Client logos + star-rated testimonials |
| 07 | **Contact** | Link cards + live terminal typewriter |

---

## <img src="https://fonts.gstatic.com/s/i/materialiconsround/gavel/v1/24px.svg" width="20" valign="middle"/> &nbsp;License

[MIT](LICENSE) — Free to use, fork, and modify.

---

<div align="center">

**Gulshan Kumar** &nbsp;·&nbsp; Delhi, India &nbsp;·&nbsp; 2025–2026

[![Website](https://img.shields.io/badge/Website-gulshan.isroot.in-8ecf00?style=flat-square&labelColor=060908)](https://gulshan.isroot.in)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gulshankumar--tech-0077B5?style=flat-square&labelColor=060908)](https://linkedin.com/in/gulshankumar-tech)
[![GitHub](https://img.shields.io/badge/GitHub-ayush0972-8ecf00?style=flat-square&labelColor=060908)](https://github.com/ayush0972)

</div>
