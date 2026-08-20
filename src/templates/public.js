// ── Public Site SSR Renderer ──────────────────────────────────────────────
// Renders the full portfolio page from D1 data as server-side HTML.
// All core content is in HTML — JS only enhances (animations, terminal, theme).

import { FONTS, BASE_CSS } from './css.js';
import { escHtml, sanitizeBasicHtml } from '../lib/db.js';

function safeHref(value, fallback = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  if ((raw.startsWith('#') || (raw.startsWith('/') && !raw.startsWith('//'))) && !/[\u0000-\u001f]/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : fallback;
  } catch {
    return fallback;
  }
}
function safeAttrUrl(value, fallback = '') { return escHtml(safeHref(value, fallback)); }
function safeMailto(value) {
  const email = String(value ?? '').trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}` : '';
}
function safeAnchorId(value) {
  const id = String(value ?? '').trim();
  return /^[A-Za-z][A-Za-z0-9_-]*$/.test(id) ? id : '';
}

// ── SVG Icons (inline, no external dep) ──────────────────────────────────
const LI_SVG = `<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.605 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const GH_SVG = `<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

export function renderPublicPage(data) {
  const { settings, sections, skills, services, experiences, education, projects, proof } = data;
  const g = settings.global || {};
  const hero = settings.hero || {};
  const about = settings.about || {};
  const contact = settings.contact || {};
  const seo = settings.seo || {};
  const theme = settings.theme || {};
  const nav = settings.nav || {};
  const proofCfg = settings.proof_section || {};

  // Section visibility map
  const secMap = {};
  for (const s of (sections || [])) secMap[s.id] = s;
  const secVisible = (id) => !secMap[id] || secMap[id].visible;

  const name = escHtml(g.name || 'Gulshan Kumar');
  const tagline = escHtml(g.tagline || 'Automation & AI Systems Engineer');
  const defaultTheme = theme.default || 'dark';
  const starsEnabled = theme.stars_enabled !== false;
  const starsCount = Math.min(Math.max(parseInt(theme.stars_count) || 80, 20), 200);
  const noiseEnabled = theme.noise_enabled !== false;
  const scanlinesEnabled = theme.scanlines_enabled !== false;
  const neonIntensity = theme.neon_intensity || 'balanced';

  // Neon intensity CSS overrides (injected inline to apply at SSR time)
  const neonOverrideCSS = neonIntensity === 'subtle'
    ? `<style>:root,[data-theme="dark"]{--lime-glow:rgba(142,207,0,.07);--glow-lime:0 0 18px rgba(142,207,0,.1)}[data-theme="light"]{--lime-glow:rgba(78,136,0,.05);--glow-lime:0 0 14px rgba(78,136,0,.07)}</style>`
    : neonIntensity === 'strong'
      ? `<style>:root,[data-theme="dark"]{--lime-glow:rgba(142,207,0,.28);--glow-lime:0 0 48px rgba(142,207,0,.38)}[data-theme="light"]{--lime-glow:rgba(78,136,0,.18);--glow-lime:0 0 32px rgba(78,136,0,.2)}</style>`
      : ''; // balanced = defaults in BASE_CSS

  // CSS overrides for disabled effects (applied at SSR time)
  const effectOverrides = [
    !noiseEnabled ? `<style>[data-theme="dark"] body::after{display:none!important}</style>` : '',
    !scanlinesEnabled ? `<style>[data-theme="dark"] body::before{display:none!important}</style>` : ''
  ].filter(Boolean).join('');

  // Build JSON-LD
  const jsonLd = seo.json_ld_enabled !== false ? `
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Person",
   "name":"${escHtml(g.name || 'Gulshan Kumar')}",
   "jobTitle":"${tagline}",
   "url":"${escHtml(safeHref(seo.canonical, 'https://portfolio.gulshan-kumar.me'))}",
   "sameAs":["${escHtml(safeHref(contact.linkedin))}","${escHtml(safeHref(contact.github))}"]
  }
  </script>` : '';

  // Nav items HTML
  const navItems = (nav.items || ['about', 'services', 'skills', 'experience', 'education', 'projects', 'proof', 'contact'])
    .map(id => safeAnchorId(id))
    .filter(Boolean)
    .map(id => `<li><a href="#${escHtml(id)}">${escHtml(secMap[id]?.label || id)}</a></li>`).join('');

  // Skills
  const skillsHtml = skills.map((sk, i) => `
    <div class="sk-card rv" style="transition-delay:${i * .08}s">
      <div class="sk-head">
        <div class="sk-ico"><span class="material-icons-round">${escHtml(sk.icon)}</span></div>
        <span class="sk-label">${escHtml(sk.label)}</span>
      </div>
      <div class="pills-wrap">
        ${sk.pills.map(p => `<span class="pill${p.is_hot ? ' hot' : ''}">${escHtml(p.label)}</span>`).join('')}
      </div>
    </div>`).join('');

  // Services
  const servicesHtml = services.map((s, i) => `
    <div class="svc-card rv" style="transition-delay:${i * .08}s">
      <div class="svc-ico"><span class="material-icons-round">${escHtml(s.icon)}</span></div>
      <div class="svc-title">${escHtml(s.title)}</div>
      <div class="svc-desc">${escHtml(s.description)}</div>
    </div>`).join('');

  // Experience
  const xpHtml = experiences.map((x, i) => `
    <div class="xp-item rv fl" id="xp-${x.id}">
      <div class="xp-left">
        <div class="xp-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="xp-dates">${escHtml(x.date_range)}</div>
        <div class="xp-dur">${escHtml(x.duration)}</div>
        <div class="xp-loc"><span class="material-icons-round">location_on</span>${escHtml(x.location)}</div>
      </div>
      <div class="xp-right">
        <span class="xp-badge ${escHtml(x.badge_type)}">
          <span class="material-icons-round">${escHtml(x.icon)}</span>${escHtml(x.badge_label)}
        </span>
        <div class="xp-title">${escHtml(x.title)}</div>
        <div class="xp-co"><span class="material-icons-round">business</span>${escHtml(x.company)}</div>
        <ul class="xp-bullets">
          ${x.bullet_points.map(b => `<li>${sanitizeBasicHtml(b)}</li>`).join('')}
        </ul>
        <div class="xp-tags">${x.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('');

  // Education
  const eduHtml = education.map((ed, i) => `
    <div class="edu-card rv" style="transition-delay:${i * .12}s">
      <div class="edu-top">
        <div class="edu-period"><span class="material-icons-round">calendar_month</span>${escHtml(ed.period)}</div>
        <div class="edu-deg">${escHtml(ed.degree)}</div>
        <div class="edu-stream">${escHtml(ed.stream)}</div>
        <div class="edu-school"><span class="material-icons-round">school</span>${escHtml(ed.school)}</div>
        <div class="edu-grade">${escHtml(ed.grade)}</div>
      </div>
      <div class="edu-body">
        ${ed.items.map(it => `<div class="edu-item">${escHtml(it)}</div>`).join('')}
        <div class="edu-pills">${ed.pills.map(p => `<span class="edu-pill">${escHtml(p)}</span>`).join('')}</div>
      </div>
    </div>`).join('');

  // Projects
  const projFilters = [...new Set(projects.map(p => p.category))]
    .map(cat => `<button class="proj-filter-btn" data-cat="${escHtml(cat)}">
      <span class="material-icons-round">${escHtml(projects.find(p => p.category === cat)?.category_icon || 'folder')}</span>${escHtml(cat)}
    </button>`).join('');

  const projHtml = projects.map((p, i) => {
    const imgHtml = p.image_url
      ? `<img src="${safeAttrUrl(p.image_url)}" alt="${escHtml(p.title)}" loading="lazy"/>`
      : `<div class="proj-thumb-fallback"><span class="material-icons-round">folder_open</span><span>${escHtml(p.category)}</span></div>`;
    const ghUrl = safeHref(p.github_url);
    const demoUrl = safeHref(p.demo_url);
    const extUrl = safeHref(p.external_url);
    const ghBtn = ghUrl ? `<a href="${escHtml(ghUrl)}" target="_blank" rel="noopener noreferrer" class="proj-cta-btn"><span class="material-icons-round">code</span>Code</a>` : '';
    const demoBtn = demoUrl ? `<a href="${escHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="proj-cta-btn outline"><span class="material-icons-round">open_in_new</span>Live</a>` : '';
    const extBtn = extUrl && !demoUrl ? `<a href="${escHtml(extUrl)}" target="_blank" rel="noopener noreferrer" class="proj-cta-btn outline"><span class="material-icons-round">launch</span>View</a>` : '';
    return `
    <article class="proj-card rv" style="transition-delay:${i * .09}s" data-cat="${escHtml(p.category)}">
      <div class="proj-thumb">
        ${imgHtml}
        ${ghBtn || demoBtn || extBtn ? `<div class="proj-overlay"><div class="proj-ctas">${ghBtn}${demoBtn}${extBtn}</div></div>` : ''}
        ${p.featured ? `<span class="proj-featured"><span class="material-icons-round">star</span>Featured</span>` : ''}
      </div>
      <div class="proj-body">
        <div class="proj-meta">
          <span class="proj-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="proj-cat"><span class="material-icons-round">${escHtml(p.category_icon)}</span>${escHtml(p.category)}</span>
        </div>
        <h3 class="proj-title">${escHtml(p.title)}</h3>
        <p class="proj-desc">${escHtml(p.summary)}</p>
        <div class="proj-stack">${p.stack.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </div>
    </article>`;
  }).join('');

  const projectsUrl = safeHref(g.projects_subdomain, 'https://projects.gulshan-kumar.me');
  const projSubdomain = escHtml(projectsUrl);

  // Proof items
  const orgs = proof.filter(p => p.type === 'org');
  const testimonials = proof.filter(p => p.type === 'testimonial');

  const orgsHtml = orgs.map(o => `
    <a href="${safeAttrUrl(o.url, '#')}" class="org-card rv" ${safeHref(o.url) ? 'target="_blank" rel="noopener noreferrer"' : ''}>
      ${o.logo_url ? `<img src="${safeAttrUrl(o.logo_url)}" alt="${escHtml(o.name)}" class="org-logo" loading="lazy"/>` : ''}
      <div><div class="org-name">${escHtml(o.name)}</div><div class="org-sub">${escHtml(o.subtitle)}</div></div>
    </a>`).join('');

  const testimonialsHtml = testimonials.map((r, i) => {
    const stars = Array(Math.min(Math.max(r.testimonial_rating || 5, 1), 5)).fill(`<span class="material-icons-round rv-star">star</span>`).join('');
    return `
    <article class="rv-card rv" style="transition-delay:${i * .1}s">
      <div class="rv-top">
        <div class="rv-stars">${stars}</div>
        <span class="material-icons-round rv-quote-icon">format_quote</span>
      </div>
      <p class="rv-text">${escHtml(r.testimonial_text || '')}</p>
      <div class="rv-author">
        ${r.logo_url ? `<img src="${safeAttrUrl(r.logo_url)}" alt="${escHtml(r.name)}" class="rv-avatar" loading="lazy"/>` : ''}
        <div>
          <div class="rv-name">${escHtml(r.name)}</div>
          <div class="rv-role">${escHtml(r.subtitle)}</div>
        </div>
      </div>
    </article>`;
  }).join('');

  // Contact links
  const ctLinks = [
    safeMailto(contact.email) ? `
    <a href="${escHtml(safeMailto(contact.email))}" class="c-link">
      <div class="c-ico"><span class="material-icons-round">mail_outline</span></div>
      <div class="c-txt"><span class="c-label">Email</span><span class="c-val">${escHtml(contact.email)}</span></div>
      <div class="c-arr"><span class="material-icons-round">arrow_forward</span></div>
    </a>` : '',
    safeHref(contact.linkedin) ? `
    <a href="${safeAttrUrl(contact.linkedin)}" target="_blank" rel="noopener noreferrer" class="c-link">
      <div class="c-ico">${LI_SVG}</div>
      <div class="c-txt"><span class="c-label">LinkedIn</span><span class="c-val">${escHtml(contact.linkedin.replace('https://linkedin.com/in/', '/in/'))}</span></div>
      <div class="c-arr"><span class="material-icons-round">arrow_forward</span></div>
    </a>` : '',
    safeHref(contact.github) ? `
    <a href="${safeAttrUrl(contact.github)}" target="_blank" rel="noopener noreferrer" class="c-link">
      <div class="c-ico">${GH_SVG}</div>
      <div class="c-txt"><span class="c-label">GitHub</span><span class="c-val">${escHtml(contact.github.replace('https://github.com/', 'github.com/'))}</span></div>
      <div class="c-arr"><span class="material-icons-round">arrow_forward</span></div>
    </a>` : '',
    safeHref(contact.resume_url) ? `
    <a href="${safeAttrUrl(contact.resume_url)}" target="_blank" rel="noopener noreferrer" class="c-link">
      <div class="c-ico"><span class="material-icons-round">description</span></div>
      <div class="c-txt"><span class="c-label">Resume</span><span class="c-val">${escHtml(nav.resume_label || 'View Resume')}</span></div>
      <div class="c-arr"><span class="material-icons-round">arrow_forward</span></div>
    </a>` : ''
  ].filter(Boolean).join('');

  const contactForm = contact.form_enabled !== false ? `
    <form id="ct-form" class="ct-form" novalidate aria-label="Contact form">
      <div class="form-field">
        <label for="ct-name">Your Name *</label>
        <input type="text" id="ct-name" name="name" placeholder="Gulshan Kumar" required autocomplete="name" maxlength="100"/>
      </div>
      <div class="form-field">
        <label for="ct-email">Email Address *</label>
        <input type="email" id="ct-email" name="email" placeholder="you@example.com" required autocomplete="email" maxlength="200"/>
      </div>
      <div class="form-field">
        <label for="ct-subject">Subject</label>
        <input type="text" id="ct-subject" name="subject" placeholder="Project, internship, collaboration..." maxlength="200"/>
      </div>
      <div class="form-field">
        <label for="ct-message">Message *</label>
        <textarea id="ct-message" name="message" placeholder="Tell me what you're working on..." required maxlength="5000"></textarea>
      </div>
      <div id="ct-msg" role="status" aria-live="polite" style="display:none"></div>
      <button type="submit" class="btn-primary" style="width:100%;justify-content:center">
        <span class="material-icons-round" aria-hidden="true">send</span>
        <span id="ct-btn-txt">Send Message</span>
      </button>
    </form>` : `
    <div style="text-align:center;padding:3rem;border:1px dashed var(--bdr);color:var(--text-faint)">
      <span class="material-icons-round" style="font-size:2rem;display:block;margin-bottom:.5rem" aria-hidden="true">mail_outline</span>
      Reach out via the links on the left.
    </div>`;

  // Proof section orgs title — uses sanitizeBasicHtml for safety since it allows <strong>/<em>
  const proofOrgsTitle = escHtml(proofCfg.orgs_title || "WHO I'VE WORKED WITH");

  return `<!DOCTYPE html>
<html lang="en" data-theme="${defaultTheme}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escHtml(seo.title || `${name} — ${tagline}`)}</title>
<meta name="description" content="${escHtml(seo.description || '')}"/>
<meta name="robots" content="${escHtml(seo.robots || 'index, follow')}"/>
<link rel="canonical" href="${safeAttrUrl(seo.canonical, 'https://portfolio.gulshan-kumar.me')}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${escHtml(seo.og_title || seo.title || '')}"/>
<meta property="og:description" content="${escHtml(seo.og_description || seo.description || '')}"/>
<meta property="og:url" content="${safeAttrUrl(seo.canonical)}"/>
${safeHref(seo.og_image) ? `<meta property="og:image" content="${safeAttrUrl(seo.og_image)}"/>` : ''}
<meta name="twitter:card" content="summary_large_image"/>
<meta name="theme-color" content="#060908" media="(prefers-color-scheme: dark)"/>
<meta name="theme-color" content="#f0f5e8" media="(prefers-color-scheme: light)"/>
${FONTS}
${BASE_CSS}
${neonOverrideCSS}
${effectOverrides}
${jsonLd}
</head>
<body>
<div id="gk-cur" aria-hidden="true"></div>
<div id="gk-trail" aria-hidden="true"></div>
${starsEnabled ? `<canvas id="gk-canvas" aria-hidden="true"></canvas>` : ''}

${contact.availability_visible !== false ? `
<div id="avail-bar" role="status" aria-label="Availability status">
  <span class="dot" aria-hidden="true"></span>
  ${escHtml(contact.availability_badge || 'Open to Work')} — ${escHtml(contact.email || '')}
</div>` : ''}

<!-- ── Navigation ──────────────────────────────────── -->
<nav id="gk-nav" role="navigation" aria-label="Main navigation">
  <a href="#hero" class="n-logo" aria-label="${name} Home">GK<span class="dot">.</span></a>
  <ul class="nav-links" role="list">${navItems}
    ${safeHref(contact.resume_url) && nav.show_resume !== false ? `<li><a href="${safeAttrUrl(contact.resume_url)}" target="_blank" rel="noopener noreferrer" class="nav-cta-link">${escHtml(nav.resume_label || 'Resume')}</a></li>` : ''}
  </ul>
  <div style="display:flex;align-items:center;gap:.8rem">
    ${theme.user_toggle_enabled !== false ? `<button class="theme-toggle" id="theme-btn" aria-label="Toggle theme" title="Toggle dark/light theme">
      <span class="material-icons-round" id="theme-icon" aria-hidden="true">light_mode</span>
    </button>` : ''}
    <button class="nav-ham" id="nav-ham" aria-label="Open menu" aria-expanded="false" aria-controls="mob-nav">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
  </div>
</nav>

<div id="mob-nav" role="dialog" aria-label="Mobile navigation" aria-modal="true">
    ${(nav.items || ['about', 'services', 'skills', 'experience', 'education', 'projects', 'proof', 'contact']).map(id => safeAnchorId(id)).filter(Boolean).map(id =>
    `<a href="#${escHtml(id)}">${escHtml(secMap[id]?.label || id)}</a>`).join('')}
  ${safeHref(contact.resume_url) && nav.show_resume !== false ? `<a href="${safeAttrUrl(contact.resume_url)}" target="_blank" rel="noopener noreferrer">${escHtml(nav.resume_label || 'Resume')}</a>` : ''}
</div>

<!-- ── Hero ────────────────────────────────────────── -->
<section id="hero" aria-label="Introduction">
  <div class="hero-left">
    <div class="h-status" role="status">
      <span class="h-pulse" aria-hidden="true"></span>
      ${escHtml(hero.status_label || 'Available for Opportunities')}
    </div>
    <h1 class="h-name">
      <span class="h-ln1">${escHtml(hero.headline_line1 || 'GULSHAN')}</span>
      <span class="h-ln2">${escHtml(hero.headline_line2 || 'KUMAR')}</span>
    </h1>
    <p class="h-role">${sanitizeBasicHtml(hero.role_text || '<strong>Automation &amp; AI Systems</strong> engineer crafting intelligent backends, bots &amp; <em>real-world control systems</em>')}</p>
    <div class="h-btns">
      <a href="${safeAttrUrl(hero.cta_primary_url, '#projects')}" class="btn-primary">
        <span class="material-icons-round" aria-hidden="true">folder_open</span>${escHtml(hero.cta_primary_label || 'View Projects')}
      </a>
      <a href="${safeAttrUrl(hero.cta_secondary_url, '#contact')}" class="btn-outline">
        <span class="material-icons-round" aria-hidden="true">mail_outline</span>${escHtml(hero.cta_secondary_label || 'Get In Touch')}
      </a>
      ${safeHref(contact.resume_url) ? `
      <a href="${safeAttrUrl(contact.resume_url)}" target="_blank" rel="noopener noreferrer" class="btn-outline">
        <span class="material-icons-round" aria-hidden="true">description</span>${escHtml(hero.resume_label || 'Resume')}
      </a>` : ''}
    </div>
    ${(hero.quick_stats || []).length > 0 ? `<div class="stats-row">
      ${(hero.quick_stats || []).map((s, i) => `
      <div class="stat-box rv" style="transition-delay:${i * .1}s">
        <div class="stat-num">${escHtml(s.value)}</div>
        <div class="stat-lbl">${escHtml(s.label)}</div>
        <div class="stat-desc">${escHtml(s.desc)}</div>
      </div>`).join('')}
    </div>` : ''}
  </div>
  <div class="h-right">
    <div class="info-panel" role="complementary" aria-label="Quick info">
      <div class="info-row">
        <span class="ir-key"><span class="material-icons-round" aria-hidden="true">location_on</span>Location</span>
        <span class="ir-val">${escHtml(g.location || 'Delhi, India')}</span>
      </div>
      ${safeHref(g.domain) ? `<div class="info-row">
        <span class="ir-key"><span class="material-icons-round" aria-hidden="true">language</span>Website</span>
        <span class="ir-val"><a href="${safeAttrUrl(g.domain)}" target="_blank" rel="noopener noreferrer">${escHtml(String(g.domain).replace(/^https?:\/\//, ''))}</a></span>
      </div>` : ''}
      ${safeHref(contact.github) ? `<div class="info-row">
        <span class="ir-key"><span style="width:13px;height:13px;display:inline-flex;align-items:center;color:var(--lime)" aria-hidden="true">${GH_SVG}</span>GitHub</span>
        <span class="ir-val"><a href="${safeAttrUrl(contact.github)}" target="_blank" rel="noopener noreferrer">${escHtml(String(contact.github).replace('https://github.com/', 'github.com/'))}</a></span>
      </div>` : ''}
      ${safeHref(contact.linkedin) ? `<div class="info-row">
        <span class="ir-key"><span style="width:13px;height:13px;display:inline-flex;align-items:center;color:var(--lime)" aria-hidden="true">${LI_SVG}</span>LinkedIn</span>
        <span class="ir-val"><a href="${safeAttrUrl(contact.linkedin)}" target="_blank" rel="noopener noreferrer">${escHtml(String(contact.linkedin).replace('https://linkedin.com/', 'linkedin.com/'))}</a></span>
      </div>` : ''}
      <div class="info-row">
        <span class="ir-key"><span class="material-icons-round" aria-hidden="true">radio_button_checked</span>Status</span>
        <span class="ir-val"><span class="chip">${escHtml(hero.status_chip || 'OPEN TO WORK')}</span></span>
      </div>
    </div>
  </div>
  <div class="h-scroll" aria-hidden="true">
    <div class="h-scroll-bar"></div>Scroll to explore
  </div>
</section>

<!-- ── About ────────────────────────────────────────── -->
${secVisible('about') ? `
<div class="section-wrap">
<section id="about" class="section" aria-labelledby="about-title">
  <div class="s-eyebrow">01 — About Me</div>
  <h2 class="s-title" id="about-title">WHO AM <span class="accent">I?</span></h2>
  <div class="about-grid">
    <div class="about-text rv">
      ${(about.paragraphs || []).map(p => `<p>${sanitizeBasicHtml(p)}</p>`).join('')}
      ${about.quote ? `
      <div class="about-quote">
        <p>&ldquo;${escHtml(about.quote)}&rdquo;</p>
      </div>` : ''}
    </div>
    <div class="stat-col rv" style="transition-delay:.15s;display:flex;flex-direction:column;gap:1rem">
      ${(hero.quick_stats || []).map((s, i) => `
      <div class="stat-box">
        <div class="stat-num">${escHtml(s.value)}</div>
        <div class="stat-lbl">${escHtml(s.label)}</div>
        <div class="stat-desc">${escHtml(s.desc)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>
</div>` : ''}

<!-- ── What I Do ────────────────────────────────────── -->
${secVisible('services') && services.length > 0 ? `
<div class="section-wrap">
<section id="services" class="section" aria-labelledby="services-title">
  <div class="s-eyebrow">02 — What I Do</div>
  <h2 class="s-title" id="services-title">HOW I CAN <span class="accent">HELP</span></h2>
  <p class="s-subtitle">Areas I build in — automation, systems, web, and cloud.</p>
  <div class="services-grid">${servicesHtml}</div>
</section>
</div>` : ''}

<!-- ── Skills ────────────────────────────────────────── -->
${secVisible('skills') && skills.length > 0 ? `
<div class="section-wrap">
<section id="skills" class="section" aria-labelledby="skills-title">
  <div class="s-eyebrow">03 — Tech Arsenal</div>
  <h2 class="s-title" id="skills-title">WHAT I <span class="accent">KNOW</span></h2>
  <p class="s-subtitle">A curated set of tools, languages, and systems — built through real internships, self-directed learning, and constant curiosity.</p>
  <div class="skills-grid">${skillsHtml}</div>
</section>
</div>` : ''}

<!-- ── Experience ─────────────────────────────────────── -->
${secVisible('experience') && experiences.length > 0 ? `
<div class="section-wrap">
<section id="experience" class="section" aria-labelledby="xp-title">
  <div class="s-eyebrow">04 — Work History</div>
  <h2 class="s-title" id="xp-title">WHERE I <span class="accent">WORKED</span></h2>
  <div class="xp-list">${xpHtml}</div>
</section>
</div>` : ''}

<!-- ── Education ──────────────────────────────────────── -->
${secVisible('education') && education.length > 0 ? `
<div class="section-wrap">
<section id="education" class="section" aria-labelledby="edu-title">
  <div class="s-eyebrow">05 — Education</div>
  <h2 class="s-title" id="edu-title">WHERE I <span class="accent">LEARNED</span></h2>
  <div class="edu-grid">${eduHtml}</div>
</section>
</div>` : ''}

<!-- ── Projects ───────────────────────────────────────── -->
${secVisible('projects') && projects.length > 0 ? `
<div class="section-wrap">
<section id="projects" class="section" aria-labelledby="proj-title">
  <div class="s-eyebrow">06 — Selected Work</div>
  <h2 class="s-title" id="proj-title">WHAT I <span class="accent">BUILT</span></h2>
  <p class="s-subtitle">A curated showcase. Visit <a href="${projSubdomain}" style="color:var(--lime)" target="_blank" rel="noopener noreferrer">${escHtml((g.projects_subdomain || 'projects.gulshan-kumar.me').replace('https://', ''))}</a> for the full archive.</p>
  <div class="proj-filters" role="group" aria-label="Filter projects by category">
    <button class="proj-filter-btn active" data-cat="all"><span class="material-icons-round" aria-hidden="true">apps</span>All</button>
    ${projFilters}
  </div>
  <div class="proj-grid" id="proj-grid" role="list">${projHtml}</div>
  <div class="proj-all-cta rv">
    <p>Explore the complete project archive →</p>
    <a href="${projSubdomain}" target="_blank" rel="noopener noreferrer" class="btn-outline">
      <span class="material-icons-round" aria-hidden="true">open_in_new</span>All Projects on ${escHtml((g.projects_subdomain || 'projects.gulshan-kumar.me').replace('https://', ''))}
    </a>
  </div>
</section>
</div>` : ''}

<!-- ── Proof & Context ────────────────────────────────── -->
${secVisible('proof') && (orgs.length > 0 || testimonials.length > 0) ? `
<div class="section-wrap">
<section id="proof" class="section" aria-labelledby="proof-title">
  <div class="s-eyebrow">07 — ${escHtml(proofCfg.section_title || 'Proof & Context')}</div>
  <h2 class="s-title" id="proof-title">${proofOrgsTitle}</h2>
  ${orgs.length > 0 ? `
  <p class="s-subtitle" style="margin-bottom:0">${escHtml(proofCfg.orgs_subtitle || 'Organizations and environments that shaped my work.')}</p>
  <div class="orgs-grid">${orgsHtml}</div>` : ''}
  ${testimonials.length > 0 ? `
  <h3 class="testimonials-title">
    <span class="material-icons-round" aria-hidden="true">format_quote</span>
    ${escHtml(proofCfg.testimonials_title || 'What People Say')}
  </h3>
  <div class="testimonials-grid">${testimonialsHtml}</div>` : ''}
</section>
</div>` : ''}

<!-- ── Contact ────────────────────────────────────────── -->
${secVisible('contact') ? `
<div class="section-wrap">
<section id="contact" class="section" aria-labelledby="ct-title">
  <div class="s-eyebrow">08 — Let's Connect</div>
  <h2 class="s-title" id="ct-title">GET IN <span class="accent">TOUCH</span></h2>
  <div class="contact-grid">
    <div>
      <p class="ct-intro">${escHtml(contact.intro_text || 'Open to internships, freelance projects, collaborations, and anything interesting.')}</p>
      <div class="c-links">${ctLinks}</div>
    </div>
    <div>
      ${contact.form_enabled !== false ? contactForm : `
      <div class="terminal" role="region" aria-label="Terminal animation">
        <div class="term-bar">
          <span class="td r" aria-hidden="true"></span>
          <span class="td y" aria-hidden="true"></span>
          <span class="td g" aria-hidden="true"></span>
          <span class="term-title">gulshan@portfolio — bash</span>
        </div>
        <div class="term-body">
          <div class="t-line"><span class="t-p">gulshan@portfolio</span><span class="t-m"> ~ $ </span><span id="t-cmd" class="t-w" aria-live="off"></span><span class="t-cursor" aria-hidden="true"></span></div>
          <div id="t-out" aria-live="polite"></div>
        </div>
      </div>`}
    </div>
  </div>
</section>
</div>` : ''}

<!-- ── Footer ─────────────────────────────────────────── -->
<footer id="gk-footer" role="contentinfo">
  <div class="ft-left">${sanitizeBasicHtml(g.footer_text || `Built by <strong>${escHtml(g.name || 'Gulshan Kumar')}</strong> · Delhi, India`)}</div>
  <nav class="ft-links" aria-label="Footer links">
    ${safeHref(g.domain) ? `<a href="${safeAttrUrl(g.domain)}" target="_blank" rel="noopener noreferrer">Main Site</a>` : ''}
    ${safeHref(contact.github) ? `<a href="${safeAttrUrl(contact.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
    ${safeHref(contact.linkedin) ? `<a href="${safeAttrUrl(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
    <a href="/docs">Docs</a>
  </nav>
  <div class="ft-copy">${escHtml(g.name || 'Gulshan Kumar').toUpperCase()} · ${escHtml(g.tagline || 'Automation & AI Systems Engineer').toUpperCase()} · PORTFOLIO.GULSHAN-KUMAR.ME</div>
</footer>

<!-- ── Client-Side JS ──────────────────────────────────── -->
<script>
(function(){
  // ── Theme ──────────────────────────────────────────
  const root = document.documentElement;
  const icon = document.getElementById('theme-icon');
  const themeToggleEnabled = ${theme.user_toggle_enabled !== false ? 'true' : 'false'};
  let theme = localStorage.getItem('gk-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (icon) icon.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
    if (themeToggleEnabled) localStorage.setItem('gk-theme', t);
  }
  applyTheme(theme);
  if (themeToggleEnabled) {
    document.getElementById('theme-btn')?.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
    });
  }

  // ── Custom Cursor (desktop pointer only) ──────────
  if (window.matchMedia('(pointer: fine)').matches && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const cur = document.getElementById('gk-cur');
    const trail = document.getElementById('gk-trail');
    if (cur && trail) {
      let mx = -200, my = -200, tx = -200, ty = -200;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cur.style.cssText = 'left:' + (mx - 2) + 'px;top:' + (my - 2) + 'px';
      });
      (function loop() {
        tx += (mx - tx) * .22; ty += (my - ty) * .22;
        trail.style.cssText = 'left:' + (tx - 3) + 'px;top:' + (ty - 3) + 'px';
        requestAnimationFrame(loop);
      })();
      document.addEventListener('mouseleave', () => {
        cur.style.left = '-100px'; trail.style.left = '-100px';
      });
      const hovers = 'a,button,.sk-card,.stat-box,.proj-card,.edu-card,.xp-item,.rv-card,.org-card,.c-link,.svc-card,.proj-filter-btn';
      document.querySelectorAll(hovers).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
      });
    }
  }

  // ── Particle Canvas (stars) ────────────────────────
  const cv = document.getElementById('gk-canvas');
  if (cv && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const ctx = cv.getContext('2d');
    let W, H, pts = [];
    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    function Pt() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .28; this.vy = (Math.random() - .5) * .28;
      this.r = Math.random() * 1.2 + .4;
    }
    const COUNT = ${starsCount};
    for (let i = 0; i < COUNT; i++) pts.push(new Pt());
    const lime = () => root.getAttribute('data-theme') === 'light' ? '78,136,0' : '142,207,0';
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const c = lime();
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c + ',.5)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y,
                d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = 'rgba(' + c + ',' + .12 * (1 - d / 150) + ')';
            ctx.lineWidth = .6; ctx.stroke();
          }
        }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── Nav scroll + active section ────────────────────
  const gkNav = document.getElementById('gk-nav');
  const navHam = document.getElementById('nav-ham');
  const mobNav = document.getElementById('mob-nav');
  addEventListener('scroll', () => {
    gkNav?.classList.toggle('stuck', scrollY > 60);
    updateActive();
  }, { passive: true });
  function updateActive() {
    const secs = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    let current = '';
    secs.forEach(s => { if (scrollY >= s.offsetTop - 130) current = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  navHam?.addEventListener('click', () => {
    const open = mobNav?.classList.toggle('open');
    navHam.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobNav.classList.remove('open');
    navHam?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
  // Close mobile nav on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobNav?.classList.contains('open')) {
      mobNav.classList.remove('open');
      navHam?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navHam?.focus();
    }
  });

  // ── Reveal on scroll ───────────────────────────────
  if ('IntersectionObserver' in window && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = parseFloat(e.target.style.transitionDelay || 0) * 1000;
          setTimeout(() => e.target.classList.add('vis'), d);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .1 });
    document.querySelectorAll('.rv').forEach(el => obs.observe(el));
  } else {
    // For reduced-motion, just show all immediately
    document.querySelectorAll('.rv').forEach(el => el.classList.add('vis'));
  }

  // ── Project filter ─────────────────────────────────
  document.querySelectorAll('.proj-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.proj-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.proj-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });

  // ── Terminal animation (contact section) ───────────
  const tCmd = document.getElementById('t-cmd');
  const tOut = document.getElementById('t-out');
  if (tCmd && tOut && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const lines = [
      { cmd: 'whoami', out: [{ c: 't-g', v: 'gulshan@portfolio.gulshan-kumar.me' }, { c: 't-w', v: 'Automation & AI Systems Engineer' }, { c: 't-m', v: 'Delhi, India' }] },
      { cmd: 'cat skills.txt', out: [{ c: 't-g', v: '→ Python · JavaScript · HTML5 · SQL' }, { c: 't-g', v: '→ Industrial Automation · PLC · Control Systems' }, { c: 't-g', v: '→ Bot Dev · API Integration · Cloud · Full-Stack' }] },
      { cmd: 'echo $STATUS', out: [{ c: 't-g', v: 'OPEN TO INTERNSHIPS & COLLABORATIONS' }] },
      { cmd: 'curl portfolio.gulshan-kumar.me', out: [{ c: 't-g', v: '200 OK · portfolio.gulshan-kumar.me' }, { c: 't-m', v: 'Email: gulshan@gulshan-kumar.me' }, { c: 't-m', v: 'GitHub: github.com/gulshanhex' }] }
    ];
    let li = 0, ci = 0, phase = 'type';
    function tick() {
      const line = lines[li];
      if (phase === 'type') {
        tCmd.textContent = line.cmd.slice(0, ci + 1); ci++;
        if (ci >= line.cmd.length) { phase = 'show'; setTimeout(tick, 500); return; }
        setTimeout(tick, 65 + Math.random() * 40);
      } else if (phase === 'show') {
        tOut.innerHTML = line.out.map(o => '<div class="t-line"><span class="' + o.c + '">' + o.v + '</span></div>').join('');
        phase = 'erase'; setTimeout(tick, 2800);
      } else {
        const t = tCmd.textContent;
        if (!t.length) { tOut.innerHTML = ''; li = (li + 1) % lines.length; ci = 0; phase = 'type'; setTimeout(tick, 400); return; }
        tCmd.textContent = t.slice(0, -1); setTimeout(tick, 30);
      }
    }
    setTimeout(tick, 1400);
  }

  // ── Magnetic buttons ───────────────────────────────
  if (window.matchMedia('(pointer: fine)').matches && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    document.querySelectorAll('.btn-primary,.btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .18 + 'px,' + (e.clientY - r.top - r.height / 2) * .18 + 'px)';
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  // ── Contact Form ───────────────────────────────────
  const ctForm = document.getElementById('ct-form');
  const ctMsg = document.getElementById('ct-msg');
  const ctBtnTxt = document.getElementById('ct-btn-txt');
  if (ctForm) {
    ctForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(ctForm);
      const body = { name: fd.get('name')?.trim(), email: fd.get('email')?.trim(), subject: fd.get('subject')?.trim() || undefined, message: fd.get('message')?.trim() };
      if (!body.name || !body.email || !body.message) {
        ctMsg.className = 'form-msg err'; ctMsg.textContent = 'Please fill all required fields.'; ctMsg.style.display = '';
        return;
      }
      ctBtnTxt.textContent = 'Sending...';
      const btn = ctForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) {
          ctMsg.className = 'form-msg ok'; ctMsg.textContent = data.message || "Message sent! I'll get back to you soon."; ctMsg.style.display = '';
          ctForm.reset();
        } else {
          ctMsg.className = 'form-msg err'; ctMsg.textContent = data.error || 'Something went wrong. Try again.'; ctMsg.style.display = '';
        }
      } catch {
        ctMsg.className = 'form-msg err'; ctMsg.textContent = 'Network error. Please try again.'; ctMsg.style.display = '';
      }
      ctBtnTxt.textContent = 'Send Message';
      if (btn) btn.disabled = false;
    });
  }

})();
</script>
</body>
</html>`;
}

export function render404Page(defaultTheme = 'dark') {
  const themeColor = defaultTheme === 'light' ? '78,136,0' : '142,207,0';
  return `<!DOCTYPE html>
<html lang="en" data-theme="${defaultTheme}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>404 — Page Not Found · GK Portfolio</title>
<meta name="robots" content="noindex"/>
${FONTS}
${BASE_CSS}
</head>
<body>
<canvas id="gk-canvas" aria-hidden="true"></canvas>
<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;z-index:2;text-align:center;padding:2rem">
  <div style="font-family:var(--ff-h);font-size:clamp(6rem,20vw,16rem);line-height:.9;
    color:var(--lime);opacity:.1;position:absolute;user-select:none;pointer-events:none;
    white-space:nowrap" aria-hidden="true">404</div>
  <div style="font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--lime);margin-bottom:1.2rem">
    ERROR_404
  </div>
  <h1 style="font-family:var(--ff-h);font-size:clamp(2.5rem,6vw,4.5rem);letter-spacing:2px;
    color:var(--heading);margin-bottom:1rem">PAGE NOT FOUND</h1>
  <p style="font-family:var(--ff-s);font-size:1.1rem;color:var(--text-dim);
    max-width:400px;line-height:1.7;margin-bottom:2.5rem">
    This route doesn't exist. You may have followed a broken link or typed the URL incorrectly.
  </p>
  <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
    <a href="/" class="btn-primary"><span class="material-icons-round" aria-hidden="true">home</span>Back to Portfolio</a>
    <button onclick="history.back()" class="btn-outline"><span class="material-icons-round" aria-hidden="true">arrow_back</span>Go Back</button>
  </div>
</div>
<script>
(function(){
  const t = localStorage.getItem('gk-theme') || (window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', t);
  const cv = document.getElementById('gk-canvas');
  if (cv && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const ctx = cv.getContext('2d'); let W, H, pts = [];
    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    function Pt() { this.x = Math.random()*W; this.y = Math.random()*H; this.vx = (Math.random()-.5)*.28; this.vy = (Math.random()-.5)*.28; this.r = Math.random()*1.2+.4; }
    for (let i = 0; i < 60; i++) pts.push(new Pt());
    const lime = () => document.documentElement.getAttribute('data-theme') === 'light' ? '78,136,0' : '142,207,0';
    function draw() {
      ctx.clearRect(0,0,W,H); const c = lime();
      pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba('+c+',.45)'; ctx.fill(); });
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
</script>
</body>
</html>`;
}
