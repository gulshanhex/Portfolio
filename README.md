# Gulshan Kumar — Portfolio

> **Automation & AI Systems Engineer · Python · Web & Cloud · Delhi, India**

A dark, minimal, production-grade personal portfolio built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build tools. Hosted live at [gulshan.isroot.in](https://gulshan.isroot.in)

---

## 🌐 Live Site

| Link | Description |
|------|-------------|
| [gulshan.isroot.in](https://gulshan.isroot.in) | Main site |
| [gulshankumar.isroot.in](https://gulshankumar.isroot.in) | Portfolio |

---

## ✨ Features

- **Forest-Noir dark theme** — eye-friendly tinted palette, muted lime accent
- **Animated canvas** — floating particle network background
- **Custom arrow cursor** — stylish lime arrow with glowing trail
- **Sections** — Hero · About · Skills · Experience · Education · Projects · Reviews · Contact
- **Interactive terminal** — typewriter animation in contact section
- **Project filter** — category-based filtering with smooth transitions
- **Scroll reveal animations** — staggered entrance effects
- **Count-up stats** — animated numbers on scroll
- **Fully responsive** — mobile menu, adaptive grid layouts
- **Material Icons Round** — used throughout (no emojis)
- **Brand SVG logos** — LinkedIn, GitHub inline SVGs

---

## 🗂️ File Structure

```
portfolio/
├── index.html        ← HTML shell — structure & markup only
├── style.css         ← All styles — theme, layout, animations
├── script.js         ← All JS — fetches JSON, renders UI, all logic
├── config.json       ← Personal info, skills, experience, education, terminal
├── projects.json     ← Projects data (images, links, tech stack)
├── reviews.json      ← Clients & testimonials data
└── README.md         ← You are here
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (custom properties, grid, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Data | JSON (config, projects, reviews) |
| Fonts | Google Fonts — Bebas Neue · JetBrains Mono · Fraunces |
| Icons | Google Material Icons Round |
| Hosting | cPanel / Shared Hosting |

---

## ✏️ How to Update Content

### Personal info, skills, experience, education
→ Edit **`config.json`**

### Add / edit projects
→ Edit **`projects.json`** — add a new object to the `"projects"` array

### Add / edit testimonials or clients
→ Edit **`reviews.json`** — add to `"clients"` or `"reviews"` arrays

### Add your real images
Replace placeholder URLs with **imgbb direct links** in:
- `projects.json` → `"img"` field of each project
- `reviews.json` → `"logo"` field of each client, `"av"` field of each review

### Change styles
→ Edit **`style.css`** — all CSS variables are at the top under `:root {}`

---

## 🎨 Theme Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#060908` | Main background |
| `--lime` | `#8ecf00` | Primary accent |
| `--ember` | `#cc4500` | Secondary accent |
| `--text` | `#c2d4ae` | Body text |
| `--heading` | `#d8e8c4` | Headings |

---

## 🚀 Deployment

1. Clone or download this repo
2. Upload **all 6 files** to your hosting root (`public_html/` or `www/`)
3. Done — no build step, no npm, no dependencies

```bash
# All 6 files must be in the same directory
index.html   style.css   script.js
config.json  projects.json  reviews.json
```

> ⚠️ **Important:** `script.js` uses `fetch()` to load JSON files. This requires a web server (works on any hosting). It will **not** work from a local `file://` URL — use VS Code Live Server or any local server for development.

---

## 📸 Preview

| Section | Description |
|---------|-------------|
| Hero | Animated name entry, system info panel, particle canvas |
| About | Bio, quote, animated stat counters |
| Skills | 6 category cards with hot-skill highlights |
| Experience | Editorial timeline — Losung Automation · Elent Electronics |
| Projects | Filterable grid with hover overlays |
| Reviews | Star-rated testimonials with client logos |
| Contact | Link cards + live terminal typewriter |

---

## 📄 License

[MIT](LICENSE) — Free to use, modify, and share.

---

<div align="center">

Built by **Gulshan Kumar** · Delhi, India · 2025–2026

[Website](https://gulshan.isroot.in) · [LinkedIn](https://linkedin.com/in/gulshankumar-tech) · [GitHub](https://github.com/ayush0972)

</div>
