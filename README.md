# Gulshan Kumar — Portfolio

> **Automation & AI Systems Engineer · Python · Web & Cloud · Delhi, India**

[![Live Site](https://img.shields.io/badge/Live-gulshan.isroot.in-8ecf00?style=flat&labelColor=060908)](https://gulshan.isroot.in)
[![Portfolio](https://img.shields.io/badge/Portfolio-gulshankumar.isroot.in-8ecf00?style=flat&labelColor=060908)](https://gulshankumar.isroot.in)
[![License](https://img.shields.io/badge/License-MIT-8ecf00?style=flat&labelColor=060908)](LICENSE)

---

## 📁 Repo Structure

```
gulshan-portfolio/
│
├── 📄 README.md          ← You are here
├── 📄 .gitignore
├── 📄 LICENSE
│
├── 📂 dist/              ⭐ DEPLOY THIS — single file, works everywhere
│   └── index.html        ← All CSS + JS + data merged into one file
│
└── 📂 src/               ✏️ EDIT THIS — clean modular code
    ├── index.html        ← HTML structure only
    ├── style.css         ← All styles
    ├── script.js         ← All JavaScript
    ├── config.json       ← Personal info, skills, experience, education
    ├── projects.json     ← Projects data
    └── reviews.json      ← Clients & testimonials
```

---

## 🚀 Kaun sa Use Karo?

### ✅ Hosting / Deploy karna hai → `dist/index.html`

```
dist/index.html  ←  SIRF YE EK FILE UPLOAD KARO
```

- **Zero dependencies** — koi bhi external file nahi chahiye
- **Shared hosting pe kaam karta hai** (cPanel, unaux, Hostinger, sab)
- **Double-click se bhi khuljata hai** — local file://  pe bhi chalega
- Sab kuch ek hi file mein hai: CSS + JS + data

### ✏️ Code Edit karna hai → `src/` folder

```
src/index.html   ← HTML structure
src/style.css    ← Styles edit karo
src/script.js    ← JS edit karo
src/config.json  ← Apna data update karo (skills, experience, education)
src/projects.json← Projects add/edit karo
src/reviews.json ← Clients & testimonials
```

> ⚠️ `src/` ko directly hosting pe mat daalO — JSON files `fetch()` se load hoti hain jo shared hosting pe CORS se block ho jaati hai. Editing ke baad `dist/index.html` mein merge karo.

---

## ✨ Features

- **Forest-Noir dark theme** — `#060908` bg, `#8ecf00` lime accent
- **Sharp arrow cursor** — lime arrow with glow trail, instant response
- **Canvas particle network** — 80 animated nodes, collision lines
- **Sections** — Hero · About · Skills · Experience · Education · Projects · Reviews · Contact
- **Interactive terminal** — typewriter cycling through 4 commands
- **Project category filter** — Bots / Web / Cloud / Industrial / Backend
- **Scroll reveal animations** — staggered entrance effects
- **Stat count-up** — animated numbers on scroll trigger
- **Magnetic buttons** — subtle pull effect on hover
- **Fully responsive** — mobile hamburger, adaptive grids
- **Material Icons Round** — Google icons throughout

---

## ✏️ Content Kaise Update Karein

### Option A — `src/` mein edit karo (recommended for devs)

**Personal info, skills, experience, education, terminal:**
→ `src/config.json` edit karo

**Projects add/update:**
→ `src/projects.json` mein array mein object add karo

**Testimonials / Clients:**
→ `src/reviews.json` edit karo

**Styles:**
→ `src/style.css` — top pe `:root {}` mein CSS variables hain

---

### Option B — `dist/index.html` directly edit karo

File mein `<script>` tag ke andar clearly labeled constants hain:

```javascript
const SKILLS    = [ ... ]   // Line ~380
const EXPERIENCE = [ ... ]  // Line ~390
const EDUCATION  = [ ... ]  // Line ~405
const PROJECTS   = [ ... ]  // Line ~420
const CLIENTS    = [ ... ]  // Line ~445
const REVIEWS    = [ ... ]  // Line ~455
const TERM_LINES = [ ... ]  // Line ~465
```

Directly in karo edit — save karo — upload karo. ✅

---

## 🎨 Theme Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#060908` | Main background |
| `--lime` | `#8ecf00` | Primary accent |
| `--ember` | `#cc4500` | Badge accent |
| `--text` | `#c2d4ae` | Body text |
| `--heading` | `#d8e8c4` | Headings |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, clip-path, animations) |
| Logic | Vanilla JavaScript ES6+ |
| Data (`src/`) | JSON |
| Fonts | Google Fonts — Bebas Neue · JetBrains Mono · Fraunces |
| Icons | Google Material Icons Round |

---

## 🌐 Deployment — 3 Steps

1. `dist/` folder kholo
2. `index.html` copy karo
3. Hosting ke `public_html/` ya apne folder mein upload karo

```
✅ Works on: cPanel · unaux · Hostinger · Netlify · GitHub Pages · Vercel
✅ Works locally: double-click index.html → opens in browser
❌ src/ directly deploy mat karo
```

---

## 📸 Sections Preview

| # | Section | Description |
|---|---------|-------------|
| — | Hero | Animated name, system info panel, particle canvas |
| 01 | About | Bio paragraphs, motto quote, animated stat counters |
| 02 | Skills | 6 tech category cards with hot-skill highlights |
| 03 | Experience | Editorial layout — Losung Automation · Elent Electronics |
| 04 | Education | Class 12 (In Progress) · Class 10 (70.8%) |
| 05 | Projects | Filterable grid with hover overlay CTAs |
| 06 | Reviews | Client logos + star-rated testimonials |
| 07 | Contact | Link cards + live terminal typewriter |

---

## 📄 License

[MIT](LICENSE) — Free to use, fork, and modify.

---

<div align="center">

**Gulshan Kumar** · Delhi, India · 2025–2026

[🌐 Website](https://gulshan.isroot.in) · [💼 LinkedIn](https://linkedin.com/in/gulshankumar-tech) · [🐙 GitHub](https://github.com/ayush0972)

</div>
