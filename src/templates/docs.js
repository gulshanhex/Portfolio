// ── Docs / README Page ────────────────────────────────────────────────────
import { FONTS, BASE_CSS } from './css.js';

export function renderDocsPage(defaultTheme = 'dark') {
  return `<!DOCTYPE html>
<html lang="en" data-theme="${defaultTheme}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Docs & Setup · GK Portfolio</title>
<meta name="robots" content="noindex"/>
${FONTS}
${BASE_CSS}
<style>
.docs-wrap{max-width:860px;margin:0 auto;padding:8rem 5vw 6rem;position:relative;z-index:2}
.docs-eyebrow{font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;
  color:var(--lime);margin-bottom:1rem;display:flex;align-items:center;gap:.6rem}
.docs-eyebrow::before{content:'';width:28px;height:1px;background:var(--lime)}
.docs-title{font-family:var(--ff-h);font-size:clamp(3rem,7vw,5.5rem);
  line-height:.92;letter-spacing:2px;color:var(--heading);margin-bottom:.5rem}
.docs-sub{font-size:.92rem;color:var(--text-dim);line-height:1.7;
  max-width:560px;margin-bottom:3rem}
.docs-nav{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:3rem;
  padding-bottom:2rem;border-bottom:1px solid var(--bdr-s)}
.docs-nav a{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;
  color:var(--text-faint);border:1px solid var(--bdr-s);
  padding:.35rem .75rem;transition:border-color .2s,color .2s}
.docs-nav a:hover{border-color:var(--lime);color:var(--lime)}
.section{margin-bottom:3.5rem}
.section-num{font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--lime);margin-bottom:.5rem}
.section h2{font-family:var(--ff-h);font-size:clamp(1.6rem,3vw,2.4rem);
  letter-spacing:2px;color:var(--heading);margin-bottom:1.2rem}
.section h3{font-family:var(--ff-h);font-size:1.1rem;letter-spacing:2px;
  color:var(--heading);margin:1.5rem 0 .7rem}
.section p{font-family:var(--ff-s);font-weight:300;font-size:1rem;
  color:var(--text-dim);line-height:1.8;margin-bottom:.9rem}
.section ul{margin:0 0 1rem 0;display:flex;flex-direction:column;gap:.35rem}
.section ul li{font-size:.88rem;color:var(--text-dim);line-height:1.6;
  padding-left:1.2rem;position:relative}
.section ul li::before{content:'→';position:absolute;left:0;color:var(--lime);font-size:.75rem}
.section ul li code,.section p code,.section h3 code{
  font-family:var(--ff-b);background:var(--surface);border:1px solid var(--bdr-s);
  color:var(--lime);padding:.1rem .4rem;font-size:.82em}
.codeblock{background:var(--surface);border:1px solid var(--bdr-s);
  padding:1.2rem 1.4rem;margin:1rem 0;overflow-x:auto}
.codeblock code{font-family:var(--ff-b);font-size:.8rem;color:var(--text);
  white-space:pre;display:block;line-height:1.6}
.codeblock code .c{color:var(--lime-d)}
.codeblock code .k{color:var(--lime)}
.codeblock code .s{color:var(--text-dim)}
.step{background:var(--surface);border:1px solid var(--bdr-s);
  border-left:2px solid var(--lime);padding:1.2rem 1.4rem;margin-bottom:.8rem}
.step-num{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--lime);margin-bottom:.4rem}
.step-title{font-size:.9rem;color:var(--heading);font-weight:700;margin-bottom:.3rem}
.step-body{font-size:.82rem;color:var(--text-dim);line-height:1.65}
.back-link{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;
  letter-spacing:.15em;text-transform:uppercase;color:var(--text-faint);
  margin-bottom:2rem;transition:color .2s}
.back-link:hover{color:var(--lime)}
.back-link .material-icons-round{font-size:.9rem}
.note{background:var(--lime-bg);border:1px solid var(--lime-b);
  padding:.9rem 1.2rem;margin:1rem 0;font-size:.82rem;color:var(--text-dim);line-height:1.6}
.note strong{color:var(--lime)}
.warn{background:rgba(204,69,0,.06);border:1px solid rgba(204,69,0,.2);
  padding:.9rem 1.2rem;margin:1rem 0;font-size:.82rem;color:var(--text-dim);line-height:1.6}
.warn strong{color:var(--ember)}
</style>
</head>
<body>
<canvas id="gk-canvas" aria-hidden="true"></canvas>

<nav id="gk-nav" style="position:fixed;top:0;left:0;right:0;z-index:800;
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 5vw;background:rgba(6,9,8,.92);backdrop-filter:blur(18px);
  border-bottom:1px solid rgba(142,207,0,.1)">
  <a href="/" style="font-family:var(--ff-h);font-size:1.5rem;letter-spacing:3px;color:var(--heading)">
    GK<span style="color:var(--lime)">.</span>
  </a>
  <div style="display:flex;gap:1.5rem;align-items:center">
    <a href="/" style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-dim)">← Portfolio</a>
    <a href="/admin" style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;
      background:var(--lime);color:#060908;padding:.4rem 1rem;font-weight:700">Admin →</a>
  </div>
</nav>

<div class="docs-wrap">
  <a href="/" class="back-link"><span class="material-icons-round">arrow_back</span>Back to Portfolio</a>

  <div class="docs-eyebrow">Documentation</div>
  <h1 class="docs-title">SETUP &<br><span style="color:var(--lime)">DOCS</span></h1>
  <p class="docs-sub">Architecture overview, Cloudflare dashboard deployment guide, and admin usage reference for the GK Portfolio system.</p>

  <div class="docs-nav">
    <a href="#architecture">Architecture</a>
    <a href="#deploy">Deployment</a>
    <a href="#d1-setup">D1 Database</a>
    <a href="#first-login">First Login</a>
    <a href="#content">Managing Content</a>
    <a href="#resume">Resume Setup</a>
    <a href="#backup">Backup & Restore</a>
    <a href="#projects-sub">projects.gulshan-kumar.me</a>
    <a href="#security">Security Notes</a>
    <a href="#troubleshoot">Troubleshooting</a>
  </div>

  <!-- Architecture -->
  <div class="section" id="architecture">
    <div class="section-num">01</div>
    <h2>ARCHITECTURE</h2>
    <p>This portfolio runs on <strong style="color:var(--text)">Cloudflare Workers + D1</strong>. The Worker executes at the edge, while each deployment environment has its own explicitly bound D1 database. No long-running Node.js server is required.</p>
    <h3>How it works</h3>
    <ul>
      <li><strong style="color:var(--text)">bundled_worker.js</strong> — The deployable single-file Cloudflare Worker. Generated from src/ by running node build.js: public site, admin panel, API endpoints, sitemap, robots.txt, health check, and /docs.</li>
      <li><strong style="color:var(--text)">Cloudflare D1</strong> — SQLite-compatible edge database. Stores all site content: settings, skills, projects, experiences, contact submissions, admin sessions.</li>
      <li><strong style="color:var(--text)">Server-side rendering</strong> — The public portfolio page is fully rendered in the Worker from D1 data. Crawlers see real HTML. JS only adds animations and interactivity.</li>
      <li><strong style="color:var(--text)">Admin Panel</strong> — A full SPA served at <code>/admin</code>. Authentication uses PBKDF2-hashed passwords and server-side sessions stored in D1. No localStorage auth.</li>
      <li><strong style="color:var(--text)">API routes</strong> — Content is managed via protected <code>/api/admin/*</code>; the public contact endpoint is <code>/api/contact</code>, with public utility routes for health, robots, and sitemap.</li>
    </ul>
    <h3>File structure</h3>
    <div class="codeblock"><code>worker.js            ← Main Worker entry point (route dispatcher)
  wrangler.jsonc       ← Authoritative multi-environment Wrangler config
migrations/           ← Versioned D1 schema migrations
scripts/seed.sql      ← Optional non-production seed data
schema.sql            ← Initial schema reference
src/
  lib/
    auth.js          ← PBKDF2 hashing, session management, cookies
    db.js            ← D1 helpers, content queries, sanitization
    response.js      ← HTTP response helpers, security headers
  templates/
    css.js           ← Full CSS (dark + light themes, design system)
    public.js        ← Public portfolio SSR renderer
    admin.js         ← Admin panel HTML + JavaScript SPA
    docs.js          ← This docs page
  api/
    public.js        ← Public API handlers (contact form)
    admin.js         ← Admin API handlers (all CRUD operations)</code></div>
  </div>

  <!-- Deployment -->
  <div class="section" id="deploy">
    <div class="section-num">02</div>
    <h2>DEPLOYMENT (ENVIRONMENT-AWARE)</h2>
    <p>The recommended path is Wrangler with separate <code>dev</code>, <code>staging</code>, and <code>production</code> environments. Dashboard paste deployment remains available as an emergency/manual fallback using the generated <code>bundled_worker.js</code>.</p>

    <div class="step">
      <div class="step-num">Step 1</div>
      <div class="step-title">Create environment resources</div>
      <div class="step-body">Create separate Workers and D1 databases for development, staging, and production, or let Wrangler provision them where supported. Never point staging or local development at the production D1 database.</div>
    </div>
    <div class="step">
      <div class="step-num">Step 2</div>
      <div class="step-title">Build and deploy</div>
      <div class="step-body">Run <code>npm run build</code> and deploy with <code>npx wrangler deploy --env staging</code> or <code>npx wrangler deploy --env production</code>. For a manual dashboard fallback, paste the generated <code>bundled_worker.js</code> only.</div>
    </div>
    <div class="step">
      <div class="step-num">Step 3</div>
      <div class="step-title">Bind the correct D1 database</div>
      <div class="step-body">Configure one D1 binding named <code>DB</code> per environment in <code>wrangler.jsonc</code>. Use names such as <code>gk-portfolio-db-dev</code>, <code>gk-portfolio-db-staging</code>, and <code>gk-portfolio-db-production</code>.</div>
    </div>
    <div class="step">
      <div class="step-num">Step 4</div>
      <div class="step-title">Apply migrations</div>
      <div class="step-body">Apply the versioned files in <code>migrations/</code> with <code>npx wrangler d1 migrations apply gk-portfolio-db-staging --remote --env staging</code> or the matching production command. Seed only development or disposable staging data.</div>
    </div>
    <div class="step">
      <div class="step-num">Step 5</div>
      <div class="step-title">Set Secret environment variables</div>
      <div class="step-body">In Worker → <strong>Settings → Variables → Environment Variables</strong>. Add these as <strong>Secrets</strong> (encrypted):
        <br/><code>ADMIN_SETUP_TOKEN</code> — a long random secret used only during first-time initialization. Sessions are server-side D1 records and do not require a SESSION_SECRET.
      </div>
    </div>
    <div class="step">
      <div class="step-num">Step 6</div>
      <div class="step-title">Initialize the database</div>
      <div class="step-body">For a new environment, visit <code>https://your-worker.workers.dev/setup?token=YOUR_ADMIN_SETUP_TOKEN</code>. This creates the schema, seeds default content, and creates the first admin user. Use the route only once, then delete or rotate the secret immediately.</div>
    </div>
    <div class="step">
      <div class="step-num">Step 7</div>
      <div class="step-title">Set custom domain</div>
      <div class="step-body">In Worker → <strong>Triggers → Custom Domains</strong>. Add <code>portfolio.gulshan-kumar.me</code>. Cloudflare will handle SSL automatically.</div>
    </div>
    <div class="note"><strong>Tip:</strong> After setup, the <code>ADMIN_SETUP_TOKEN</code> secret should be deleted or rotated — the /setup route only works once and will be locked after first use.</div>
  </div>

  <!-- D1 Setup -->
  <div class="section" id="d1-setup">
    <div class="section-num">03</div>
    <h2>D1 DATABASE</h2>
    <p>If you prefer running SQL manually instead of using <code>/setup</code>, you can do it from the D1 Query console.</p>
    <ul>
      <li>Go to <strong>Cloudflare Dashboard → D1 → your database → Query</strong></li>
      <li>Prefer applying the versioned files in <code>migrations/</code> with Wrangler</li>
      <li>Use <code>scripts/seed.sql</code> only for local or disposable staging data</li>
      <li>Then create your admin user manually or use <code>/setup</code></li>
    </ul>
    <h3>Tables overview</h3>
    <ul>
      <li><code>admin_users</code> — Admin accounts with PBKDF2-hashed passwords</li>
      <li><code>admin_sessions</code> — Server-side session tokens with expiry</li>
      <li><code>site_settings</code> — Key/value JSON settings (global, hero, about, contact, seo, theme, nav)</li>
      <li><code>sections</code> — Section visibility and ordering</li>
      <li><code>skills</code> + <code>skill_pills</code> — Skill groups and pill tags</li>
      <li><code>services</code> — "What I Do" service cards</li>
      <li><code>experiences</code> — Work and internship entries</li>
      <li><code>education</code> — Education entries</li>
      <li><code>projects</code> — Project showcase cards</li>
      <li><code>proof_items</code> — Organizations and testimonials</li>
      <li><code>contact_submissions</code> — Contact form messages (D1 inbox)</li>
      <li><code>audit_log</code> — Admin action log</li>
      <li><code>auth_attempts</code> — Bounded login-attempt tracking</li>
    </ul>
  </div>

  <!-- First Login -->
  <div class="section" id="first-login">
    <div class="section-num">04</div>
    <h2>FIRST LOGIN & ADMIN</h2>
    <p>After running <code>/setup</code>, navigate to <code>https://portfolio.gulshan-kumar.me/admin</code>.</p>
    <ul>
      <li>Log in with the username and password you created during setup</li>
      <li>The admin panel loads all content from D1 via the <code>/api/admin/*</code> routes</li>
      <li>Sessions last 7 days. The session token travels in an <code>HttpOnly; Secure; SameSite=Strict</code> cookie</li>
      <li>Change your password immediately under <strong>Admin → Security</strong></li>
      <li>All content changes take effect instantly on the public site (no rebuild needed)</li>
    </ul>
    <div class="warn"><strong>Important:</strong> Admin routes are noindexed and protected by session. Do not share your admin URL publicly. The login form has basic brute-force delay built in.</div>
  </div>

  <!-- Content -->
  <div class="section" id="content">
    <div class="section-num">05</div>
    <h2>MANAGING CONTENT</h2>
    <p>All content is editable from the admin panel at <code>/admin</code>. Changes are saved to D1 and reflected instantly on the public site.</p>
    <h3>Content sections and what they control</h3>
    <ul>
      <li><strong style="color:var(--text)">Global Settings</strong> — Name, tagline, location, social links, resume URL, footer text, nav options</li>
      <li><strong style="color:var(--text)">Hero & About</strong> — Headline lines, role text, status label/chip, CTA labels and URLs, quick stats (value + label + desc), about paragraphs, pull quote</li>
      <li><strong style="color:var(--text)">Skills</strong> — Skill groups with icon and pills. Append <code>*</code> to a pill to highlight it (e.g. <code>Python*, JS</code>)</li>
      <li><strong style="color:var(--text)">Services</strong> — "What I Do" cards with icon, title, and description</li>
      <li><strong style="color:var(--text)">Experience</strong> — Work/internship entries with title, company, dates, location, bullet points (one per line), tags, badge style</li>
      <li><strong style="color:var(--text)">Projects</strong> — Showcase cards with title, summary, stack, tags, GitHub/demo/external links, featured toggle, visibility toggle</li>
      <li><strong style="color:var(--text)">Proof & Context</strong> — Organizations (logo + name + URL) and testimonials (text + rating). Both are optional and the section can be hidden</li>
      <li><strong style="color:var(--text)">Contact Config</strong> — Email, LinkedIn, GitHub, intro text, contact form on/off, availability badge</li>
      <li><strong style="color:var(--text)">Inbox</strong> — Contact form submissions. Mark as read. Stored permanently in D1</li>
      <li><strong style="color:var(--text)">Sections & Order</strong> — Toggle section visibility and drag to reorder the public page sections</li>
      <li><strong style="color:var(--text)">SEO</strong> — Meta title/description, Open Graph, canonical URL, robots meta, JSON-LD structured data toggle</li>
      <li><strong style="color:var(--text)">Theme</strong> — Default theme (dark/light), user theme toggle, particle background, noise and scanlines toggles</li>
    </ul>
  </div>

  <!-- Resume -->
  <div class="section" id="resume">
    <div class="section-num">06</div>
    <h2>RESUME SETUP</h2>
    <p>Resume is powered by a Google Drive link — no file hosting needed.</p>
    <ul>
      <li>Upload your resume PDF to Google Drive</li>
      <li>Right-click → <strong>Get link</strong> → set to "Anyone with the link can view"</li>
      <li>Copy the shareable link (format: <code>https://drive.google.com/file/d/FILE_ID/view?usp=sharing</code>)</li>
      <li>Paste it in <strong>Admin → Global Settings → Resume URL</strong> and save</li>
      <li>The resume CTA will automatically appear in the hero section, nav (if enabled), and contact section</li>
    </ul>
    <div class="note"><strong>Tip:</strong> To make it open directly (not the Google Drive preview), change <code>/view</code> to <code>/preview</code> at the end of the URL.</div>
  </div>

  <!-- Backup -->
  <div class="section" id="backup">
    <div class="section-num">07</div>
    <h2>BACKUP & RESTORE</h2>
    <p>The admin panel includes a full JSON export/import system at <strong>Admin → Backup & Restore</strong>.</p>
    <ul>
      <li><strong style="color:var(--text)">Export</strong> — Downloads all settings, content, and data as a single timestamped JSON file. Keep this safe as a rollback point.</li>
      <li><strong style="color:var(--text)">Import/Restore</strong> — Upload a previously exported JSON file. This will overwrite all current data in D1. Use with caution.</li>
    </ul>
    <div class="warn"><strong>Warning:</strong> Restore overwrites all content. Always export a backup before importing. Contact submissions are not included in backups (they stay in D1).</div>
  </div>

  <!-- Projects subdomain -->
  <div class="section" id="projects-sub">
    <div class="section-num">08</div>
    <h2>FUTURE: projects.gulshan-kumar.me</h2>
    <p>The main portfolio only shows curated project showcase cards. Full project pages will live at <code>projects.gulshan-kumar.me</code> as a separate build.</p>
    <ul>
      <li>The portfolio already links to this subdomain from the Projects section CTA</li>
      <li>Configure the projects subdomain URL in <strong>Admin → Global Settings → Projects Subdomain</strong></li>
      <li>Each project card's "View" / "Live" button can point to an external URL or the future subdomain URL</li>
      <li>When <code>projects.gulshan-kumar.me</code> is built, set each project's <strong>External URL</strong> to the corresponding project page URL</li>
    </ul>
  </div>

  <!-- Security -->
  <div class="section" id="security">
    <div class="section-num">09</div>
    <h2>SECURITY NOTES</h2>
    <ul>
      <li>Admin passwords are hashed with <strong>PBKDF2-SHA256 (100,000 iterations)</strong> using WebCrypto — no plain-text passwords anywhere</li>
      <li>Sessions are stored server-side in D1, not in localStorage or client cookies (only the session ID travels as an <code>HttpOnly; Secure; SameSite=Strict</code> cookie)</li>
      <li>All admin API routes check session validity on every request</li>
      <li>All D1 queries use prepared statements — no SQL injection vectors</li>
      <li>Admin pages send <code>X-Robots-Tag: noindex</code> and <code>Cache-Control: no-store</code></li>
      <li>Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are applied to all responses</li>
      <li>Contact form submissions are validated and rate-limited at the Worker level</li>
    </ul>
  </div>

  <!-- Troubleshooting -->
  <div class="section" id="troubleshoot">
    <div class="section-num">10</div>
    <h2>TROUBLESHOOTING</h2>
    <h3>Site shows "Service Unavailable" or blank page</h3>
    <ul>
      <li>Check D1 binding is set with variable name <code>DB</code> in Worker Settings → Variables</li>
      <li>Confirm the worker was deployed with all module code included</li>
      <li>Check Worker logs in Cloudflare Dashboard → your Worker → Logs</li>
    </ul>
    <h3>/setup says "already initialized"</h3>
    <ul>
      <li>The setup route runs once. If you need to re-run it, temporarily delete the <code>admin_users</code> table rows in D1 Query console, then visit /setup again</li>
    </ul>
    <h3>Admin login not working</h3>
    <ul>
      <li>Confirm you visited /setup and created an admin user successfully</li>
      <li>Confirm the environment’s D1 binding is named <code>DB</code> and its migrations are applied</li>
      <li>Try clearing cookies for the domain and logging in again</li>
    </ul>
    <h3>Content changes not showing</h3>
    <ul>
      <li>The public page has a short cache TTL (60s). Wait 1 minute or force-refresh</li>
      <li>If you're using Cloudflare's cache, purge it from the dashboard</li>
    </ul>
    <h3>Contact form not sending</h3>
    <ul>
      <li>Ensure "Enable Contact Form" is toggled on in Admin → Contact Config</li>
      <li>Check that the D1 binding is correct — submissions are saved to the <code>contact_submissions</code> table</li>
    </ul>
  </div>

</div><!-- docs-wrap -->

<footer style="position:relative;z-index:2;border-top:1px solid rgba(255,255,255,.05);
  padding:1.5rem 5vw;display:flex;justify-content:space-between;align-items:center;
  flex-wrap:wrap;gap:1rem">
  <span style="font-size:.72rem;color:var(--text-faint)">GK Portfolio · Docs & Setup</span>
  <div style="display:flex;gap:1.5rem">
    <a href="/" style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text-faint);transition:color .2s">Portfolio</a>
    <a href="/admin" style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text-faint);transition:color .2s">Admin</a>
    <a href="/health" style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text-faint);transition:color .2s">Health</a>
  </div>
</footer>

<script>
(function(){
  const t=localStorage.getItem('gk-theme')||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');
  document.documentElement.setAttribute('data-theme',t);
  const cv=document.getElementById('gk-canvas');
  if(cv&&window.matchMedia('(prefers-reduced-motion:no-preference)').matches){
    const ctx=cv.getContext('2d');let W,H,pts=[];
    function r(){W=cv.width=innerWidth;H=cv.height=innerHeight}r();addEventListener('resize',r);
    function P(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.25;this.vy=(Math.random()-.5)*.25;this.r=Math.random()*1.1+.3}
    for(let i=0;i<60;i++)pts.push(new P());
    const lm=()=>document.documentElement.getAttribute('data-theme')==='light'?'78,136,0':'142,207,0';
    function d(){ctx.clearRect(0,0,W,H);const c=lm();pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba('+c+',.4)';ctx.fill()});requestAnimationFrame(d);}d();}
})();
</script>
</body>
</html>`;
}
