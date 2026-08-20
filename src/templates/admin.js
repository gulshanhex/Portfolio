// ── Admin Panel Renderer ──────────────────────────────────────────────────
import { FONTS } from './css.js';

export function renderLoginPage(error = '') {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Admin Login · GK Portfolio</title>
<meta name="robots" content="noindex,nofollow"/>
${FONTS}
<style>
:root{--bg:#060908;--surface:#0b1209;--text:#c2d4ae;--text-dim:#7a9070;
  --heading:#d8e8c4;--lime:#8ecf00;--lime-b:rgba(142,207,0,.18);
  --lime-bg:rgba(142,207,0,.06);--ember:#cc4500;
  --ff-b:'JetBrains Mono',monospace;--ff-h:'Bebas Neue',sans-serif;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--ff-b);
  min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.wrap{width:100%;max-width:400px}
.logo{font-family:var(--ff-h);font-size:2rem;letter-spacing:3px;color:var(--heading);
  margin-bottom:.25rem;text-align:center}
.logo span{color:var(--lime)}
.sub{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--text-dim);text-align:center;margin-bottom:2.5rem}
.box{background:var(--surface);border:1px solid var(--lime-b);padding:2rem}
.box h1{font-family:var(--ff-h);font-size:1.5rem;letter-spacing:2px;
  color:var(--heading);margin-bottom:1.5rem}
.fg{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem}
.fg label{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim)}
.fg input{background:var(--bg);border:1px solid rgba(255,255,255,.08);
  color:var(--text);font-family:var(--ff-b);font-size:.88rem;
  padding:.75rem 1rem;outline:none;transition:border-color .2s}
.fg input:focus{border-color:var(--lime)}
.btn{width:100%;background:var(--lime);color:#060908;border:none;
  font-family:var(--ff-b);font-size:.78rem;letter-spacing:.18em;
  text-transform:uppercase;font-weight:700;padding:.9rem;cursor:pointer;
  margin-top:.4rem;transition:box-shadow .2s}
.btn:hover{box-shadow:0 0 24px rgba(142,207,0,.3)}
.err{font-size:.8rem;color:var(--ember);background:rgba(204,69,0,.08);
  border:1px solid rgba(204,69,0,.3);padding:.6rem 1rem;margin-bottom:1rem}
.foot{text-align:center;font-size:.65rem;color:var(--text-dim);margin-top:1.5rem}
.foot a{color:var(--lime)}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">GK<span>.</span></div>
  <div class="sub">Portfolio Admin</div>
  <div class="box">
    <h1>SIGN IN</h1>
    ${error ? `<div class="err" role="alert">${error}</div>` : ''}
    <form method="POST" action="/admin/login">
      <div class="fg"><label for="un">Username</label>
        <input type="text" id="un" name="username" required autocomplete="username" autofocus/></div>
      <div class="fg"><label for="pw">Password</label>
        <input type="password" id="pw" name="password" required autocomplete="current-password"/></div>
      <button type="submit" class="btn">Sign In →</button>
    </form>
  </div>
  <div class="foot"><a href="/">← Back to portfolio</a> · <a href="/docs">Setup docs</a></div>
</div>
</body>
</html>`;
}

export function renderAdminPanel(username = 'admin') {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Admin · GK Portfolio</title>
<meta name="robots" content="noindex,nofollow"/>
${FONTS}
<style>
:root{
  --bg:#060908;--bg-alt:#080d08;--surface:#0b1209;--surface2:#0e1610;
  --card:#0d1510;--text:#c2d4ae;--text-dim:#7a9070;--text-faint:#4a6048;
  --heading:#d8e8c4;--lime:#8ecf00;--lime-d:#6fa000;
  --lime-b:rgba(142,207,0,.18);--lime-bg:rgba(142,207,0,.06);
  --ember:#cc4500;--ember-b:rgba(204,69,0,.3);
  --bdr:rgba(142,207,0,.12);--bdr-s:rgba(255,255,255,.05);
  --ff-h:'Bebas Neue',sans-serif;--ff-b:'JetBrains Mono',monospace;
  --sidebar:220px;--tr:.22s ease;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--ff-b);
  display:flex;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
button{font-family:var(--ff-b);cursor:pointer}
input,textarea,select{font-family:var(--ff-b)}

/* Sidebar */
#sb{width:var(--sidebar);flex-shrink:0;background:var(--bg-alt);
  border-right:1px solid var(--bdr-s);display:flex;flex-direction:column;
  position:fixed;height:100vh;left:0;top:0;z-index:100;overflow-y:auto;
  transition:transform .3s}
.sb-logo{padding:1.4rem 1.2rem;border-bottom:1px solid var(--bdr-s)}
.sb-mark{font-family:var(--ff-h);font-size:1.6rem;letter-spacing:3px;color:var(--heading)}
.sb-mark span{color:var(--lime)}
.sb-sub{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint);margin-top:.1rem}
.sb-user{padding:.7rem 1.2rem;font-size:.68rem;color:var(--text-faint);
  letter-spacing:.1em;display:flex;align-items:center;gap:.4rem}
.sb-user .mi{font-size:.9rem;color:var(--lime-d)}
.sb-nav{flex:1;padding:.4rem 0}
.sb-cat{font-size:.56rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--text-faint);padding:.7rem 1.2rem .3rem;display:block}
.sbl{display:flex;align-items:center;gap:.65rem;padding:.6rem 1.2rem;
  font-size:.7rem;letter-spacing:.1em;color:var(--text-dim);
  cursor:pointer;transition:background var(--tr),color var(--tr);
  border:none;background:none;width:100%;text-align:left;border-left:2px solid transparent}
.sbl .mi{font-size:.95rem;flex-shrink:0}
.sbl:hover{background:var(--surface);color:var(--text)}
.sbl.active{background:var(--lime-bg);color:var(--lime);border-left-color:var(--lime)}
.sb-bot{padding:1rem 1.2rem;border-top:1px solid var(--bdr-s)}
.sb-bot a,.sb-bot button{display:flex;align-items:center;gap:.6rem;
  font-size:.66rem;letter-spacing:.1em;color:var(--text-dim);background:none;border:none;
  padding:.35rem 0;transition:color var(--tr);cursor:pointer;width:100%}
.sb-bot a:hover,.sb-bot button:hover{color:var(--lime)}
.sb-bot .mi{font-size:.9rem}
#ubadge{margin-left:auto;background:var(--lime);color:#060908;
  font-size:.58rem;padding:.1rem .35rem;display:none}

/* Main */
#main{margin-left:var(--sidebar);flex:1;display:flex;flex-direction:column;min-width:0}
#topbar{height:50px;background:var(--bg-alt);border-bottom:1px solid var(--bdr-s);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 1.4rem;flex-shrink:0;position:sticky;top:0;z-index:50}
#tb-title{font-family:var(--ff-h);font-size:1.05rem;letter-spacing:2px;color:var(--heading)}
.tb-btn{background:none;border:1px solid var(--bdr-s);color:var(--text-dim);
  padding:.32rem .75rem;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;
  display:inline-flex;align-items:center;gap:.3rem;transition:border-color var(--tr),color var(--tr)}
.tb-btn:hover{border-color:var(--lime);color:var(--lime)}
.tb-btn .mi{font-size:.82rem}
#ham{background:none;border:none;color:var(--text-dim);display:none;padding:.3rem}
#ham .mi{font-size:1.3rem}

/* Content */
#content{flex:1;padding:1.8rem;overflow-y:auto}
.panel{display:none}
.panel.active{display:block}

/* Panel header */
.ph{margin-bottom:1.5rem;padding-bottom:.9rem;border-bottom:1px solid var(--bdr-s)}
.ph-title{font-family:var(--ff-h);font-size:1.4rem;letter-spacing:2px;color:var(--heading)}
.ph-sub{font-size:.78rem;color:var(--text-dim);margin-top:.25rem}

/* Form sections */
.fs{background:var(--surface);border:1px solid var(--bdr-s);padding:1.4rem;margin-bottom:1.2rem}
.fs-title{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--lime);margin-bottom:1rem;display:flex;align-items:center;gap:.4rem}
.fs-title .mi{font-size:.88rem}
.fg{display:flex;flex-direction:column;gap:.32rem}
.fg label{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--text-faint)}
.fg input,.fg textarea,.fg select{background:var(--bg);border:1px solid var(--bdr-s);
  color:var(--text);font-size:.8rem;padding:.55rem .75rem;
  outline:none;transition:border-color var(--tr);resize:vertical}
.fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--lime)}
.fg select option{background:var(--bg)}
.fg textarea{min-height:72px}
.fg .hint{font-size:.62rem;color:var(--text-faint);margin-top:.15rem;line-height:1.4}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}
.fgrid.s1{grid-template-columns:1fr}
.fgrid.s3{grid-template-columns:1fr 1fr 1fr}
.full{grid-column:1/-1}

/* Toggle */
.trow{display:flex;align-items:center;justify-content:space-between;
  padding:.55rem 0;border-bottom:1px solid var(--bdr-s)}
.trow:last-child{border-bottom:none}
.tlbl{font-size:.78rem;color:var(--text-dim)}
.tlbl small{display:block;font-size:.65rem;color:var(--text-faint);margin-top:.08rem}
.tsw{position:relative;width:38px;height:20px;flex-shrink:0}
.tsw input{opacity:0;width:0;height:0;position:absolute}
.tsl{position:absolute;inset:0;background:rgba(255,255,255,.08);
  border-radius:10px;cursor:pointer;transition:.22s}
.tsl::before{content:'';position:absolute;height:14px;width:14px;left:3px;bottom:3px;
  background:var(--text-faint);border-radius:50%;transition:.22s}
.tsw input:checked + .tsl{background:var(--lime-bg);border:1px solid var(--lime-b)}
.tsw input:checked + .tsl::before{transform:translateX(18px);background:var(--lime)}

/* Buttons */
.btn-s{background:var(--lime);color:#060908;border:none;
  font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;
  padding:.65rem 1.6rem;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;
  transition:box-shadow var(--tr)}
.btn-s:hover{box-shadow:0 0 18px rgba(142,207,0,.3)}
.btn-s .mi{font-size:.88rem}
.btn-d{background:rgba(204,69,0,.1);color:var(--ember);border:1px solid var(--ember-b);
  font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;
  padding:.62rem 1.4rem;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;
  transition:background var(--tr)}
.btn-d:hover{background:rgba(204,69,0,.2)}
.btn-d .mi{font-size:.88rem}
.btn-o{background:none;color:var(--text-dim);border:1px solid var(--bdr-s);
  font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;
  padding:.62rem 1.3rem;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;
  transition:border-color var(--tr),color var(--tr)}
.btn-o:hover{border-color:var(--lime);color:var(--lime)}
.btn-o .mi{font-size:.88rem}
.brow{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;margin-top:1rem}

/* Toast */
#toast{position:fixed;bottom:1.4rem;right:1.4rem;z-index:9999;
  background:var(--lime);color:#060908;font-size:.76rem;letter-spacing:.1em;
  padding:.65rem 1.3rem;display:none;align-items:center;gap:.45rem;font-weight:700;max-width:300px}
#toast.show{display:flex}
#toast.err{background:var(--ember);color:#fff}
#toast .mi{font-size:.95rem}

/* List items */
.li{background:var(--surface);border:1px solid var(--bdr-s);
  padding:.9rem 1.1rem;margin-bottom:.5rem;
  display:flex;align-items:flex-start;justify-content:space-between;gap:.9rem}
.li-body{flex:1;min-width:0}
.li-title{font-size:.88rem;color:var(--heading);margin-bottom:.18rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.li-sub{font-size:.7rem;color:var(--text-dim)}
.li-tags{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.35rem}
.lt{font-size:.62rem;background:var(--lime-bg);border:1px solid var(--lime-b);
  color:var(--lime);padding:.12rem .4rem}
.la{display:flex;align-items:center;gap:.4rem;flex-shrink:0}
.lbtn{background:none;border:1px solid var(--bdr-s);color:var(--text-faint);
  padding:.28rem .45rem;font-size:.62rem;display:inline-flex;align-items:center;gap:.18rem;
  transition:border-color var(--tr),color var(--tr)}
.lbtn:hover{border-color:var(--lime);color:var(--lime)}
.lbtn.del:hover{border-color:var(--ember-b);color:var(--ember)}
.lbtn .mi{font-size:.8rem}
.badge{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;
  font-weight:700;padding:.15rem .45rem}
.badge.ok{background:var(--lime);color:#060908}
.badge.off{background:rgba(255,255,255,.05);color:var(--text-faint)}
.badge.em{background:var(--ember);color:#fee}

/* Modal */
#ov{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;
  display:none;align-items:center;justify-content:center;padding:1rem}
#ov.open{display:flex}
#modal{background:var(--surface);border:1px solid var(--lime-b);
  width:100%;max-width:580px;max-height:90vh;overflow-y:auto;
  padding:1.5rem;position:relative}
.modal-title{font-family:var(--ff-h);font-size:1.15rem;letter-spacing:2px;
  color:var(--heading);margin-bottom:1.3rem}
.mc{position:absolute;top:.9rem;right:.9rem;background:none;border:none;
  color:var(--text-dim);cursor:pointer}
.mc .mi{font-size:1.1rem}

/* Dash stats */
.dstats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
  gap:.9rem;margin-bottom:1.8rem}
.dstat{background:var(--surface);border:1px solid var(--bdr-s);
  padding:1.1rem 1.3rem;border-left:2px solid var(--lime)}
.dsv{font-family:var(--ff-h);font-size:2rem;letter-spacing:2px;color:var(--lime)}
.dsl{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--text-dim);margin-top:.15rem}

/* Inbox */
.sub-card{background:var(--surface);border:1px solid var(--bdr-s);
  padding:1.1rem;margin-bottom:.7rem;border-left:2px solid transparent}
.sub-card.unread{border-left-color:var(--lime)}
.sub-hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem}
.sub-name{font-size:.88rem;color:var(--heading);font-weight:700}
.sub-email{font-size:.72rem;color:var(--lime-d);margin-top:.1rem}
.sub-date{font-size:.65rem;color:var(--text-faint)}
.sub-subj{font-size:.76rem;color:var(--text-dim);margin-bottom:.35rem;font-style:italic}
.sub-msg{font-size:.8rem;color:var(--text-dim);line-height:1.6;
  white-space:pre-wrap;word-break:break-word}

/* Section drag */
.sec-item{display:flex;align-items:center;gap:.8rem;padding:.7rem 1rem;
  background:var(--surface);border:1px solid var(--bdr-s);margin-bottom:.4rem;cursor:grab}
.sec-item:active{cursor:grabbing}
.sec-drag{color:var(--text-faint);font-size:1.1rem}
.sec-label{flex:1;font-size:.82rem;color:var(--text)}
.sec-id{font-size:.65rem;color:var(--text-faint);letter-spacing:.1em}

@media(max-width:768px){
  #sb{transform:translateX(-220px)}
  #sb.open{transform:translateX(0)}
  #main{margin-left:0}
  #ham{display:block}
  .fgrid{grid-template-columns:1fr}
  .dstats{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>

<!-- Sidebar -->
<aside id="sb">
  <div class="sb-logo">
    <div class="sb-mark">GK<span>.</span></div>
    <div class="sb-sub">Portfolio Admin</div>
  </div>
  <div class="sb-user"><span class="material-icons-round mi">account_circle</span>${username}</div>
  <nav class="sb-nav">
    <span class="sb-cat">Overview</span>
    <button class="sbl active" data-p="dashboard"><span class="material-icons-round mi">dashboard</span>Dashboard</button>
    <span class="sb-cat">Content</span>
    <button class="sbl" data-p="global"><span class="material-icons-round mi">settings</span>Global Settings</button>
    <button class="sbl" data-p="hero"><span class="material-icons-round mi">text_fields</span>Hero & About</button>
    <button class="sbl" data-p="skills"><span class="material-icons-round mi">psychology</span>Skills</button>
    <button class="sbl" data-p="services"><span class="material-icons-round mi">build</span>Services</button>
    <button class="sbl" data-p="experience"><span class="material-icons-round mi">work</span>Experience</button>
    <button class="sbl" data-p="education"><span class="material-icons-round mi">school</span>Education</button>
    <button class="sbl" data-p="projects"><span class="material-icons-round mi">folder_open</span>Projects</button>
    <button class="sbl" data-p="proof"><span class="material-icons-round mi">verified</span>Proof & Context</button>
    <span class="sb-cat">Site</span>
    <button class="sbl" data-p="contact"><span class="material-icons-round mi">contact_mail</span>Contact Config</button>
    <button class="sbl" data-p="inbox"><span class="material-icons-round mi">inbox</span>Inbox<span id="ubadge"></span></button>
    <button class="sbl" data-p="sections"><span class="material-icons-round mi">view_list</span>Sections</button>
    <button class="sbl" data-p="seo"><span class="material-icons-round mi">search</span>SEO</button>
    <button class="sbl" data-p="theme"><span class="material-icons-round mi">palette</span>Theme</button>
    <span class="sb-cat">Admin</span>
    <button class="sbl" data-p="security"><span class="material-icons-round mi">lock</span>Security</button>
    <button class="sbl" data-p="backup"><span class="material-icons-round mi">backup</span>Backup & Restore</button>
    <button class="sbl" data-p="help"><span class="material-icons-round mi">help_outline</span>Help</button>
  </nav>
  <div class="sb-bot">
    <a href="/" target="_blank"><span class="material-icons-round mi">open_in_new</span>View Site</a>
    <a href="/docs" target="_blank"><span class="material-icons-round mi">description</span>Docs</a>
    <button id="logout-btn"><span class="material-icons-round mi">logout</span>Sign Out</button>
  </div>
</aside>

<!-- Main -->
<div id="main">
  <header id="topbar">
    <div style="display:flex;align-items:center;gap:.7rem">
      <button id="ham"><span class="material-icons-round mi">menu</span></button>
      <span id="tb-title">DASHBOARD</span>
    </div>
    <a href="/" target="_blank" class="tb-btn"><span class="material-icons-round mi">open_in_new</span>View Site</a>
  </header>

  <div id="content">

    <!-- Dashboard -->
    <div class="panel active" id="p-dashboard">
      <div class="ph"><div class="ph-title">DASHBOARD</div><div class="ph-sub">Overview of your portfolio site.</div></div>
      <div class="dstats">
        <div class="dstat"><div class="dsv" id="ds-proj">—</div><div class="dsl">Projects</div></div>
        <div class="dstat"><div class="dsv" id="ds-exp">—</div><div class="dsl">Experiences</div></div>
        <div class="dstat"><div class="dsv" id="ds-msgs">—</div><div class="dsl">Messages</div></div>
        <div class="dstat"><div class="dsv" id="ds-unread">—</div><div class="dsl">Unread</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="fs">
          <div class="fs-title"><span class="material-icons-round mi">rocket_launch</span>Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:.5rem">
            <button class="btn-o" onclick="go('projects')"><span class="material-icons-round mi">folder_open</span>Manage Projects</button>
            <button class="btn-o" onclick="go('inbox')"><span class="material-icons-round mi">inbox</span>View Inbox</button>
            <button class="btn-o" onclick="go('global')"><span class="material-icons-round mi">settings</span>Edit Global Settings</button>
            <a href="/" target="_blank" class="btn-o" style="display:inline-flex"><span class="material-icons-round mi">open_in_new</span>View Live Site</a>
          </div>
        </div>
        <div class="fs">
          <div class="fs-title"><span class="material-icons-round mi">info</span>Site Info</div>
          <div id="dash-info" style="font-size:.78rem;color:var(--text-dim);line-height:1.9">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Global Settings -->
    <div class="panel" id="p-global">
      <div class="ph"><div class="ph-title">GLOBAL SETTINGS</div><div class="ph-sub">Identity, domains, resume, nav.</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">person</span>Identity</div>
        <div class="fgrid">
          <div class="fg"><label>Name</label><input id="g-name"/></div>
          <div class="fg"><label>Tagline</label><input id="g-tagline"/></div>
          <div class="fg"><label>Location</label><input id="g-location"/></div>
          <div class="fg full"><label>Footer Text (supports &lt;strong&gt;)</label><input id="g-footer"/></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">link</span>Domains</div>
        <div class="fgrid">
          <div class="fg"><label>Main Domain</label><input id="g-domain" placeholder="https://gulshan-kumar.me"/></div>
          <div class="fg"><label>Portfolio URL</label><input id="g-portfolio" placeholder="https://portfolio.gulshan-kumar.me"/></div>
          <div class="fg full"><label>Projects Subdomain (future)</label><input id="g-proj-sub" placeholder="https://projects.gulshan-kumar.me"/></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">description</span>Resume</div>
        <div class="fgrid s1">
          <div class="fg"><label>Resume Google Drive URL</label>
            <input id="g-resume" placeholder="https://drive.google.com/file/d/YOUR_ID/view?usp=sharing"/>
            <span class="hint">Paste a shareable Google Drive link. Used in hero CTA, nav, and contact section.</span>
          </div>
        </div>
        <div class="fgrid" style="margin-top:.8rem">
          <div class="fg"><label>Resume Button Label</label><input id="g-resume-lbl" placeholder="Download Resume"/></div>
        </div>
        <div class="trow" style="margin-top:.8rem">
          <div class="tlbl">Show Resume in Nav<small>Adds resume link to top navigation</small></div>
          <label class="tsw"><input type="checkbox" id="g-resume-nav"/><span class="tsl"></span></label>
        </div>
      </div>
      <div class="brow"><button class="btn-s" onclick="saveGlobal()"><span class="material-icons-round mi">save</span>Save Settings</button></div>
    </div>

    <!-- Hero & About -->
    <div class="panel" id="p-hero">
      <div class="ph"><div class="ph-title">HERO & ABOUT</div><div class="ph-sub">Headline, role, status, CTAs, stats, about text.</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">text_fields</span>Hero</div>
        <div class="fgrid">
          <div class="fg"><label>Headline Line 1</label><input id="h-ln1" placeholder="GULSHAN"/></div>
          <div class="fg"><label>Headline Line 2 (accent colour)</label><input id="h-ln2" placeholder="KUMAR"/></div>
          <div class="fg full"><label>Role Text (supports &lt;strong&gt; &lt;em&gt;)</label><input id="h-role"/></div>
          <div class="fg"><label>Status Label</label><input id="h-status" placeholder="Available for Opportunities"/></div>
          <div class="fg"><label>Status Chip Text</label><input id="h-chip" placeholder="OPEN TO WORK"/></div>
          <div class="fg"><label>Primary CTA Label</label><input id="h-cta1l" placeholder="View Projects"/></div>
          <div class="fg"><label>Primary CTA URL</label><input id="h-cta1u" placeholder="#projects"/></div>
          <div class="fg"><label>Secondary CTA Label</label><input id="h-cta2l" placeholder="Get In Touch"/></div>
          <div class="fg"><label>Secondary CTA URL</label><input id="h-cta2u" placeholder="#contact"/></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">bar_chart</span>Quick Stats</div>
        <div id="stats-ed"></div>
        <button class="btn-o" style="margin-top:.7rem" onclick="addStat()"><span class="material-icons-round mi">add</span>Add Stat</button>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">person</span>About Section</div>
        <div id="para-ed"></div>
        <button class="btn-o" style="margin-top:.5rem" onclick="addPara()"><span class="material-icons-round mi">add</span>Add Paragraph</button>
        <div class="fg" style="margin-top:1rem"><label>Pull Quote</label><input id="h-quote" placeholder="Always Learning. Always Building."/></div>
      </div>
      <div class="brow"><button class="btn-s" onclick="saveHero()"><span class="material-icons-round mi">save</span>Save</button></div>
    </div>

    <!-- Skills -->
    <div class="panel" id="p-skills">
      <div class="ph"><div class="ph-title">SKILLS</div><div class="ph-sub">Groups and pill tags. Mark pills with * to highlight them.</div></div>
      <div id="skills-list"></div>
      <div class="brow"><button class="btn-o" onclick="openSkill(null)"><span class="material-icons-round mi">add</span>Add Skill Group</button></div>
    </div>

    <!-- Services -->
    <div class="panel" id="p-services">
      <div class="ph"><div class="ph-title">SERVICES</div><div class="ph-sub">"What I Do" cards.</div></div>
      <div id="svcs-list"></div>
      <div class="brow"><button class="btn-o" onclick="openService(null)"><span class="material-icons-round mi">add</span>Add Service</button></div>
    </div>

    <!-- Experience -->
    <div class="panel" id="p-experience">
      <div class="ph"><div class="ph-title">EXPERIENCE</div><div class="ph-sub">Internships and work entries.</div></div>
      <div id="xp-list"></div>
      <div class="brow"><button class="btn-o" onclick="openXp(null)"><span class="material-icons-round mi">add</span>Add Experience</button></div>
    </div>

    <!-- Education -->
    <div class="panel" id="p-education">
      <div class="ph"><div class="ph-title">EDUCATION</div><div class="ph-sub">Academic entries.</div></div>
      <div id="edu-list"></div>
      <div class="brow"><button class="btn-o" onclick="openEdu(null)"><span class="material-icons-round mi">add</span>Add Education</button></div>
    </div>

    <!-- Projects -->
    <div class="panel" id="p-projects">
      <div class="ph"><div class="ph-title">PROJECTS</div><div class="ph-sub">Showcase cards on the portfolio.</div></div>
      <div id="proj-list"></div>
      <div class="brow"><button class="btn-o" onclick="openProj(null)"><span class="material-icons-round mi">add</span>Add Project</button></div>
    </div>

    <!-- Proof -->
    <div class="panel" id="p-proof">
      <div class="ph"><div class="ph-title">PROOF & CONTEXT</div><div class="ph-sub">Organizations and testimonials (both optional).</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">settings</span>Section Labels</div>
        <div class="fgrid">
          <div class="fg"><label>Section Title</label><input id="proof-title" placeholder="Proof & Context"/></div>
          <div class="fg"><label>Orgs Subtitle</label><input id="proof-orgs-sub" placeholder="Organizations that shaped my work."/></div>
          <div class="fg"><label>Testimonials Title</label><input id="proof-rv-title" placeholder="What People Say"/></div>
        </div>
        <div class="brow"><button class="btn-s" onclick="saveProofCfg()"><span class="material-icons-round mi">save</span>Save Labels</button></div>
      </div>
      <div id="proof-list"></div>
      <div class="brow">
        <button class="btn-o" onclick="openProofItem('org',null)"><span class="material-icons-round mi">domain</span>Add Organization</button>
        <button class="btn-o" onclick="openProofItem('testimonial',null)"><span class="material-icons-round mi">format_quote</span>Add Testimonial</button>
      </div>
    </div>

    <!-- Contact Config -->
    <div class="panel" id="p-contact">
      <div class="ph"><div class="ph-title">CONTACT CONFIG</div><div class="ph-sub">Contact links, form, availability badge.</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">contact_mail</span>Contact Details</div>
        <div class="fgrid">
          <div class="fg"><label>Email</label><input id="ct-email" type="email"/></div>
          <div class="fg"><label>LinkedIn URL</label><input id="ct-li"/></div>
          <div class="fg"><label>GitHub URL</label><input id="ct-gh"/></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">message</span>Intro Text</div>
        <div class="fg full"><textarea id="ct-intro"></textarea></div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">toggle_on</span>Options</div>
        <div class="trow">
          <div class="tlbl">Enable Contact Form<small>Stores submissions in D1 inbox</small></div>
          <label class="tsw"><input type="checkbox" id="ct-form"/><span class="tsl"></span></label>
        </div>
        <div class="trow">
          <div class="tlbl">Show Availability Bar<small>Top banner announcing availability</small></div>
          <label class="tsw"><input type="checkbox" id="ct-avail"/><span class="tsl"></span></label>
        </div>
        <div class="fg" style="margin-top:.8rem"><label>Availability Badge Text</label><input id="ct-avail-txt" placeholder="Open to Work"/></div>
      </div>
      <div class="brow"><button class="btn-s" onclick="saveContact()"><span class="material-icons-round mi">save</span>Save Contact</button></div>
    </div>

    <!-- Inbox -->
    <div class="panel" id="p-inbox">
      <div class="ph"><div class="ph-title">INBOX</div><div class="ph-sub">Contact form submissions stored in D1.</div></div>
      <div id="inbox-content"><div style="color:var(--text-faint);font-size:.8rem">Loading...</div></div>
    </div>

    <!-- Sections -->
    <div class="panel" id="p-sections">
      <div class="ph"><div class="ph-title">SECTIONS & ORDER</div><div class="ph-sub">Toggle visibility and drag to reorder.</div></div>
      <div id="sections-list"></div>
      <div class="brow"><button class="btn-s" onclick="saveSections()"><span class="material-icons-round mi">save</span>Save Order & Visibility</button></div>
    </div>

    <!-- SEO -->
    <div class="panel" id="p-seo">
      <div class="ph"><div class="ph-title">SEO & METADATA</div><div class="ph-sub">Meta, Open Graph, canonical, robots.</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">search</span>Meta Tags</div>
        <div class="fgrid s1">
          <div class="fg"><label>Page Title</label><input id="seo-title"/></div>
          <div class="fg"><label>Meta Description</label><textarea id="seo-desc" style="min-height:56px"></textarea></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">share</span>Open Graph</div>
        <div class="fgrid">
          <div class="fg"><label>OG Title</label><input id="seo-ogt"/></div>
          <div class="fg"><label>OG Image URL</label><input id="seo-ogi"/></div>
          <div class="fg full"><label>OG Description</label><textarea id="seo-ogd" style="min-height:56px"></textarea></div>
        </div>
      </div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">tune</span>Technical</div>
        <div class="fgrid">
          <div class="fg"><label>Canonical URL</label><input id="seo-can"/></div>
          <div class="fg"><label>Robots</label>
            <select id="seo-robots">
              <option value="index, follow">index, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>
        <div class="trow" style="margin-top:.8rem">
          <div class="tlbl">Enable JSON-LD Structured Data</div>
          <label class="tsw"><input type="checkbox" id="seo-jsonld"/><span class="tsl"></span></label>
        </div>
      </div>
      <div class="brow"><button class="btn-s" onclick="saveSeo()"><span class="material-icons-round mi">save</span>Save SEO</button></div>
    </div>

    <!-- Theme -->
    <div class="panel" id="p-theme">
      <div class="ph"><div class="ph-title">THEME</div><div class="ph-sub">Default theme and visual effects.</div></div>
      <div class="fs">
        <div class="fs-title"><span class="material-icons-round mi">palette</span>Options</div>
        <div class="fgrid">
          <div class="fg"><label>Default Theme</label>
            <select id="th-default"><option value="dark">Dark</option><option value="light">Light</option></select>
          </div>
          <div class="fg"><label>Neon Intensity</label>
            <select id="th-neon"><option value="balanced">Balanced (recommended)</option><option value="strong">Strong</option><option value="subtle">Subtle</option></select>
          </div>
        </div>
        <div class="trow" style="margin-top:.8rem">
          <div class="tlbl">Allow User Theme Toggle<small>Visitors can switch between dark/light</small></div>
          <label class="tsw"><input type="checkbox" id="th-toggle"/><span class="tsl"></span></label>
        </div>
        <div class="trow">
          <div class="tlbl">Particle Background (stars)</div>
          <label class="tsw"><input type="checkbox" id="th-stars"/><span class="tsl"></span></label>
        </div>
        <div class="trow">
          <div class="tlbl">Noise Texture (dark mode)</div>
          <label class="tsw"><input type="checkbox" id="th-noise"/><span class="tsl"></span></label>
        </div>
        <div class="trow">
          <div class="tlbl">Scanlines (dark mode)</div>
          <label class="tsw"><input type="checkbox" id="th-scan"/><span class="tsl"></span></label>
        </div>
      </div>
      <div class="brow"><button class="btn-s" onclick="saveTheme()"><span class="material-icons-round mi">save</span>Save Theme</button></div>
    </div>

    <!-- Security -->
    <div class="panel" id="p-security">
      <div class="ph"><div class="ph-title">SECURITY</div><div class="ph-sub">Change your admin password.</div></div>
      <div class="fs" style="max-width:400px">
        <div class="fs-title"><span class="material-icons-round mi">lock</span>Change Password</div>
        <div class="fg" style="margin-bottom:.8rem"><label>Current Password</label><input type="password" id="pw-cur" autocomplete="current-password"/></div>
        <div class="fg" style="margin-bottom:.8rem"><label>New Password (min 8 chars)</label><input type="password" id="pw-new" autocomplete="new-password"/></div>
        <div class="fg" style="margin-bottom:1rem"><label>Confirm New Password</label><input type="password" id="pw-con" autocomplete="new-password"/></div>
        <button class="btn-s" onclick="changePw()"><span class="material-icons-round mi">lock</span>Change Password</button>
      </div>
    </div>

    <!-- Backup -->
    <div class="panel" id="p-backup">
      <div class="ph"><div class="ph-title">BACKUP & RESTORE</div><div class="ph-sub">Export all content as JSON or restore from backup.</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="fs">
          <div class="fs-title"><span class="material-icons-round mi">download</span>Export Backup</div>
          <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:1rem;line-height:1.6">Download all settings, projects, skills, and content as a single JSON file.</p>
          <button class="btn-s" onclick="doExport()"><span class="material-icons-round mi">download</span>Download JSON Backup</button>
        </div>
        <div class="fs">
          <div class="fs-title"><span class="material-icons-round mi">upload</span>Restore from Backup</div>
          <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:1rem;line-height:1.6"><strong style="color:var(--ember)">Warning:</strong> This will overwrite all current data.</p>
          <div class="fg" style="margin-bottom:.8rem"><label>Select JSON Backup</label><input type="file" id="restore-file" accept=".json" style="color:var(--text-dim)"/></div>
          <button class="btn-d" onclick="doImport()"><span class="material-icons-round mi">restore</span>Restore Backup</button>
        </div>
      </div>
    </div>

    <!-- Help -->
    <div class="panel" id="p-help">
      <div class="ph"><div class="ph-title">HELP & DOCS</div><div class="ph-sub">Quick reference. Full docs at <a href="/docs" target="_blank" style="color:var(--lime)">/docs</a>.</div></div>
      <div class="fs" style="font-size:.8rem;color:var(--text-dim);line-height:2">
        <div><strong style="color:var(--lime)">Global Settings</strong> — Name, resume link, social URLs, footer text, nav options</div>
        <div><strong style="color:var(--lime)">Hero & About</strong> — Headline, role text, status chip, CTAs, quick stats, about paragraphs</div>
        <div><strong style="color:var(--lime)">Skills</strong> — Groups + pill tags (add * to a pill to highlight it)</div>
        <div><strong style="color:var(--lime)">Services</strong> — "What I Do" cards shown on the public page</div>
        <div><strong style="color:var(--lime)">Experience</strong> — Internship/work entries with bullet points and tags</div>
        <div><strong style="color:var(--lime)">Projects</strong> — Showcase cards: title, summary, stack, links, featured toggle</div>
        <div><strong style="color:var(--lime)">Proof & Context</strong> — Org logos and testimonials (both optional, section hideable)</div>
        <div><strong style="color:var(--lime)">Contact Config</strong> — Email, LinkedIn, GitHub, intro text, form on/off, badge</div>
        <div><strong style="color:var(--lime)">Inbox</strong> — Form submissions stored in D1, mark as read</div>
        <div><strong style="color:var(--lime)">Sections</strong> — Toggle visibility, drag to reorder</div>
        <div><strong style="color:var(--lime)">SEO</strong> — Title, description, OG, canonical, robots, JSON-LD</div>
        <div><strong style="color:var(--lime)">Backup</strong> — Full JSON export/import</div>
        <div><strong style="color:var(--lime)">Security</strong> — Change admin password (PBKDF2 hashed, stored in D1)</div>
      </div>
    </div>

  </div><!-- #content -->
</div><!-- #main -->

<!-- Toast -->
<div id="toast" role="status"><span class="material-icons-round mi" id="t-ico">check_circle</span><span id="t-msg"></span></div>

<!-- Modal -->
<div id="ov"><div id="modal"><button class="mc" onclick="closeModal()"><span class="material-icons-round mi">close</span></button><div id="mbody"></div></div></div>

<script>
// ── Admin JS ──────────────────────────────────────────────────────────
const A = '/api/admin';
let ST = {}; // local state cache

// ── Routing ────────────────────────────────────────────────────────────
function go(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sbl').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById('p-' + id);
  if (panel) panel.classList.add('active');
  const btn = document.querySelector('[data-p="' + id + '"]');
  if (btn) btn.classList.add('active');
  document.getElementById('tb-title').textContent = id.replace(/-/g,' ').toUpperCase();
  const loaders = {
    dashboard: loadDash, inbox: loadInbox, sections: loadSections,
    skills: loadSkills, services: loadSvcs, experience: loadXp,
    education: loadEdu, projects: loadProj, proof: loadProof,
    global: loadGlobal, hero: loadHero, contact: loadContact,
    seo: loadSeo, theme: loadTheme
  };
  if (loaders[id]) loaders[id]();
  document.getElementById('sb').classList.remove('open');
}
document.querySelectorAll('.sbl').forEach(b => b.addEventListener('click', () => go(b.dataset.p)));
document.getElementById('ham').addEventListener('click', () => document.getElementById('sb').classList.toggle('open'));

// ── Helpers ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const val = id => $( id)?.value?.trim() || '';
const setVal = (id, v) => { if ($(id)) $(id).value = v || ''; };
const setChk = (id, v) => { if ($(id)) $(id).checked = !!v; };
const chk = id => $(id)?.checked || false;
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function toast(msg, err = false) {
  const t = $('toast');
  t.className = 'show' + (err ? ' err' : '');
  $('t-ico').textContent = err ? 'error' : 'check_circle';
  $('t-msg').textContent = msg;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 3500);
}

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(A + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function openModal() { $('ov').classList.add('open'); }
function closeModal() { $('ov').classList.remove('open'); }
$('ov').addEventListener('click', e => { if (e.target === $('ov')) closeModal(); });

// ── Logout ─────────────────────────────────────────────────────────────
$('logout-btn').addEventListener('click', async () => {
  await fetch('/admin/logout', { method: 'POST' });
  location.href = '/admin';
});

// ── Dashboard ──────────────────────────────────────────────────────────
async function loadDash() {
  try {
    const { stats, settings } = await api('/dashboard');
    $('ds-proj').textContent = stats.projects;
    $('ds-exp').textContent = stats.experiences;
    $('ds-msgs').textContent = stats.submissions;
    $('ds-unread').textContent = stats.unread;
    if (stats.unread > 0) { const b = $('ubadge'); b.textContent = stats.unread; b.style.display = ''; }
    const g = settings.global || {};
    const c = settings.contact || {};
    $('dash-info').innerHTML =
      '<div>Domain: <strong style="color:var(--text)">' + esc(g.portfolio || 'not set') + '</strong></div>' +
      '<div>Resume: <strong style="color:var(--text)">' + (c.resume_url ? 'Configured ✓' : 'Not set') + '</strong></div>' +
      '<div>Theme: <strong style="color:var(--text)">' + esc(settings.theme?.default || 'dark') + '</strong></div>' +
      '<div>Contact Form: <strong style="color:var(--text)">' + (c.form_enabled ? 'Enabled' : 'Disabled') + '</strong></div>';
  } catch(e) { toast(e.message, true); }
}

// ── Global Settings ────────────────────────────────────────────────────
async function loadGlobal() {
  try {
    const { settings } = await api('/settings');
    ST.settings = settings;
    const g = settings.global || {}, nav = settings.nav || {}, c = settings.contact || {};
    setVal('g-name', g.name); setVal('g-tagline', g.tagline);
    setVal('g-location', g.location); setVal('g-footer', g.footer_text);
    setVal('g-domain', g.domain); setVal('g-portfolio', g.portfolio);
    setVal('g-proj-sub', g.projects_subdomain);
    setVal('g-resume', c.resume_url);
    setVal('g-resume-lbl', nav.resume_label || 'Resume');
    setChk('g-resume-nav', nav.show_resume !== false);
  } catch(e) { toast(e.message, true); }
}
async function saveGlobal() {
  try {
    const s = ST.settings || {};
    await api('/settings', 'POST', {
      global: { ...(s.global||{}), name:val('g-name'), tagline:val('g-tagline'),
        location:val('g-location'), footer_text:val('g-footer'),
        domain:val('g-domain'), portfolio:val('g-portfolio'), projects_subdomain:val('g-proj-sub') },
      nav: { ...(s.nav||{}), show_resume:chk('g-resume-nav'), resume_label:val('g-resume-lbl') },
      contact: { ...(s.contact||{}), resume_url:val('g-resume') }
    });
    toast('Global settings saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Hero & About ───────────────────────────────────────────────────────
async function loadHero() {
  try {
    const { settings } = await api('/settings');
    ST.settings = settings;
    const h = settings.hero || {}, a = settings.about || {};
    setVal('h-ln1', h.headline_line1); setVal('h-ln2', h.headline_line2);
    setVal('h-role', h.role_text); setVal('h-status', h.status_label);
    setVal('h-chip', h.status_chip);
    setVal('h-cta1l', h.cta_primary_label); setVal('h-cta1u', h.cta_primary_url);
    setVal('h-cta2l', h.cta_secondary_label); setVal('h-cta2u', h.cta_secondary_url);
    ST.stats = JSON.parse(JSON.stringify(h.quick_stats || []));
    ST.paras = JSON.parse(JSON.stringify(a.paragraphs || []));
    setVal('h-quote', a.quote);
    renderStats(); renderParas();
  } catch(e) { toast(e.message, true); }
}
async function saveHero() {
  try {
    const s = ST.settings || {};
    await api('/settings', 'POST', {
      hero: { ...(s.hero||{}),
        headline_line1:val('h-ln1'), headline_line2:val('h-ln2'), role_text:val('h-role'),
        status_label:val('h-status'), status_chip:val('h-chip'),
        cta_primary_label:val('h-cta1l'), cta_primary_url:val('h-cta1u'),
        cta_secondary_label:val('h-cta2l'), cta_secondary_url:val('h-cta2u'),
        quick_stats: collectStats()
      },
      about: { ...(s.about||{}), paragraphs: collectParas(), quote:val('h-quote') }
    });
    toast('Hero & About saved!');
  } catch(e) { toast(e.message, true); }
}
function renderStats() {
  $('stats-ed').innerHTML = (ST.stats||[]).map((s,i) => \`
    <div class="fgrid" style="margin-bottom:.7rem;padding:.8rem;border:1px solid var(--bdr-s)">
      <div class="fg"><label>Value</label><input id="sv-\${i}" value="\${esc(s.value)}"/></div>
      <div class="fg"><label>Label</label><input id="sl-\${i}" value="\${esc(s.label)}"/></div>
      <div class="fg full"><label>Description</label><input id="sd-\${i}" value="\${esc(s.desc)}"/></div>
      <div class="fg"><button class="btn-d" onclick="rmStat(\${i})"><span class="material-icons-round mi">delete</span>Remove</button></div>
    </div>\`).join('');
}
function addStat(){ST.stats.push({value:'',label:'',desc:''});renderStats();}
function rmStat(i){ST.stats.splice(i,1);renderStats();}
function collectStats(){return(ST.stats||[]).map((_,i)=>({value:val('sv-'+i),label:val('sl-'+i),desc:val('sd-'+i)}));}
function renderParas() {
  $('para-ed').innerHTML = (ST.paras||[]).map((p,i) => \`
    <div style="display:flex;gap:.5rem;margin-bottom:.5rem">
      <textarea id="pa-\${i}" style="flex:1;min-height:60px;background:var(--bg);border:1px solid var(--bdr-s);
        color:var(--text);font-size:.78rem;padding:.55rem;outline:none;resize:vertical">\${esc(p)}</textarea>
      <button class="btn-d" onclick="rmPara(\${i})" style="padding:.3rem .5rem;height:fit-content"><span class="material-icons-round mi">delete</span></button>
    </div>\`).join('');
}
function addPara(){ST.paras.push('');renderParas();}
function rmPara(i){ST.paras.splice(i,1);renderParas();}
function collectParas(){return(ST.paras||[]).map((_,i)=>val('pa-'+i));}

// ── Skills ─────────────────────────────────────────────────────────────
async function loadSkills() {
  try {
    const { skills } = await api('/skills');
    ST.skills = skills;
    $('skills-list').innerHTML = skills.length ? skills.map(sk => \`
      <div class="li">
        <div class="li-body">
          <div class="li-title">\${esc(sk.label)}</div>
          <div class="li-sub">Icon: \${esc(sk.icon)} · \${sk.pills?.length||0} pills · ord:\${sk.order_idx}</div>
          <div class="li-tags">\${(sk.pills||[]).slice(0,8).map(p=>\`<span class="lt">\${esc(p.label)}\${p.is_hot?' ★':''}</span>\`).join('')}</div>
        </div>
        <div class="la">
          <span class="badge \${sk.visible?'ok':'off'}">\${sk.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openSkill(\${sk.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('skills',\${sk.id},loadSkills)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No skill groups yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function openSkill(id) {
  const sk = ST.skills?.find(s => s.id === id) || null;
  const pills = sk?.pills?.map(p => p.label + (p.is_hot ? '*' : '')).join(', ') || '';
  $('mbody').innerHTML = \`
    <div class="modal-title">\${sk ? 'EDIT SKILL GROUP' : 'ADD SKILL GROUP'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg"><label>Label</label><input id="m-label" value="\${esc(sk?.label||'')}"/></div>
      <div class="fg"><label>Material Icon Name</label><input id="m-icon" value="\${esc(sk?.icon||'code')}"/></div>
      <div class="fg"><label>Order (lower = first)</label><input id="m-ord" type="number" value="\${sk?.order_idx||0}"/></div>
      <div class="fg" style="justify-content:flex-end;padding-top:1.2rem">
        <div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${sk?.visible!==false?'checked':''}/><span class="tsl"></span></label></div>
      </div>
      <div class="fg full"><label>Pills — comma-separated, add * to highlight (e.g. Python*, JS*, HTML)</label>
        <textarea id="m-pills" style="min-height:68px">\${esc(pills)}</textarea></div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveSkill(\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveSkill(id) {
  try {
    const pills = val('m-pills').split(',').map(s=>s.trim()).filter(Boolean)
      .map((p,i) => ({ label:p.replace('*','').trim(), is_hot:p.includes('*'), order_idx:i }));
    const body = { label:val('m-label'), icon:val('m-icon'), order_idx:parseInt(val('m-ord'))||0, visible:chk('m-vis'), pills };
    id ? await api('/skills/'+id,'PUT',body) : await api('/skills','POST',body);
    closeModal(); loadSkills(); toast('Skill saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Services ───────────────────────────────────────────────────────────
async function loadSvcs() {
  try {
    const { services } = await api('/services');
    ST.services = services;
    $('svcs-list').innerHTML = services.length ? services.map(s => \`
      <div class="li">
        <div class="li-body"><div class="li-title">\${esc(s.title)}</div><div class="li-sub">\${esc(s.description).slice(0,70)}...</div></div>
        <div class="la">
          <span class="badge \${s.visible?'ok':'off'}">\${s.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openService(\${s.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('services',\${s.id},loadSvcs)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No services yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function openService(id) {
  const s = ST.services?.find(x => x.id === id) || null;
  $('mbody').innerHTML = \`
    <div class="modal-title">\${s ? 'EDIT SERVICE' : 'ADD SERVICE'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg"><label>Title</label><input id="m-title" value="\${esc(s?.title||'')}"/></div>
      <div class="fg"><label>Icon</label><input id="m-icon" value="\${esc(s?.icon||'build')}"/></div>
      <div class="fg full"><label>Description</label><textarea id="m-desc">\${esc(s?.description||'')}</textarea></div>
      <div class="fg"><label>Order</label><input id="m-ord" type="number" value="\${s?.order_idx||0}"/></div>
      <div class="fg" style="padding-top:1.1rem"><div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${s?.visible!==false?'checked':''}/><span class="tsl"></span></label></div></div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveSvc(\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveSvc(id) {
  try {
    const body={title:val('m-title'),icon:val('m-icon'),description:val('m-desc'),order_idx:parseInt(val('m-ord'))||0,visible:chk('m-vis')};
    id ? await api('/services/'+id,'PUT',body) : await api('/services','POST',body);
    closeModal(); loadSvcs(); toast('Service saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Experience ─────────────────────────────────────────────────────────
async function loadXp() {
  try {
    const { experiences } = await api('/experiences');
    ST.experiences = experiences;
    $('xp-list').innerHTML = experiences.length ? experiences.map(x => \`
      <div class="li">
        <div class="li-body">
          <div class="li-title">\${esc(x.title)} — \${esc(x.company)}</div>
          <div class="li-sub">\${esc(x.date_range)} · \${esc(x.duration)}</div>
        </div>
        <div class="la">
          <span class="badge \${x.visible?'ok':'off'}">\${x.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openXp(\${x.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('experiences',\${x.id},loadXp)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No experience entries yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function openXp(id) {
  const x = ST.experiences?.find(e => e.id === id) || null;
  const bp = Array.isArray(x?.bullet_points) ? x.bullet_points.join('\n') : (x?.bullet_points||'');
  const tgs = Array.isArray(x?.tags) ? x.tags.join(', ') : (x?.tags||'');
  $('mbody').innerHTML = \`
    <div class="modal-title">\${x ? 'EDIT EXPERIENCE' : 'ADD EXPERIENCE'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg"><label>Title</label><input id="m-title" value="\${esc(x?.title||'')}"/></div>
      <div class="fg"><label>Company</label><input id="m-co" value="\${esc(x?.company||'')}"/></div>
      <div class="fg"><label>Date Range</label><input id="m-dates" value="\${esc(x?.date_range||'')}"/></div>
      <div class="fg"><label>Duration</label><input id="m-dur" value="\${esc(x?.duration||'')}"/></div>
      <div class="fg full"><label>Location</label><input id="m-loc" value="\${esc(x?.location||'')}"/></div>
      <div class="fg"><label>Badge Label</label><input id="m-badge" value="\${esc(x?.badge_label||'')}"/></div>
      <div class="fg"><label>Badge Style</label>
        <select id="m-btype"><option value="lime" \${x?.badge_type==='lime'?'selected':''}>Lime (green)</option><option value="ember" \${x?.badge_type==='ember'?'selected':''}>Ember (orange)</option></select>
      </div>
      <div class="fg"><label>Icon (Material)</label><input id="m-icon" value="\${esc(x?.icon||'work')}"/></div>
      <div class="fg"><label>Order</label><input id="m-ord" type="number" value="\${x?.order_idx||0}"/></div>
      <div class="fg" style="padding-top:1rem"><div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${x?.visible!==false?'checked':''}/><span class="tsl"></span></label></div></div>
      <div class="fg full"><label>Bullet Points (one per line; supports &lt;strong&gt;&lt;em&gt;)</label><textarea id="m-bp" style="min-height:100px">\${esc(bp)}</textarea></div>
      <div class="fg full"><label>Tags (comma-separated)</label><input id="m-tags" value="\${esc(tgs)}"/></div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveXp(\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveXp(id) {
  try {
    const bullets = val('m-bp').split('\n').map(s=>s.trim()).filter(Boolean);
    const tags = val('m-tags').split(',').map(s=>s.trim()).filter(Boolean);
    const body={title:val('m-title'),company:val('m-co'),date_range:val('m-dates'),duration:val('m-dur'),
      location:val('m-loc'),badge_label:val('m-badge'),badge_type:val('m-btype'),icon:val('m-icon'),
      order_idx:parseInt(val('m-ord'))||0,visible:chk('m-vis'),bullet_points:bullets,tags};
    id ? await api('/experiences/'+id,'PUT',body) : await api('/experiences','POST',body);
    closeModal(); loadXp(); toast('Experience saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Education ──────────────────────────────────────────────────────────
async function loadEdu() {
  try {
    const { education } = await api('/education');
    ST.education = education;
    $('edu-list').innerHTML = education.length ? education.map(e => \`
      <div class="li">
        <div class="li-body">
          <div class="li-title">\${esc(e.degree)}</div>
          <div class="li-sub">\${esc(e.school)} · \${esc(e.period)}</div>
        </div>
        <div class="la">
          <span class="badge \${e.visible?'ok':'off'}">\${e.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openEdu(\${e.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('education',\${e.id},loadEdu)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No education entries yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function openEdu(id) {
  const e = ST.education?.find(x => x.id === id) || null;
  const items = Array.isArray(e?.items) ? e.items.join('\n') : (e?.items||'');
  const pills = Array.isArray(e?.pills) ? e.pills.join(', ') : (e?.pills||'');
  $('mbody').innerHTML = \`
    <div class="modal-title">\${e ? 'EDIT EDUCATION' : 'ADD EDUCATION'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg"><label>Degree / Level</label><input id="m-deg" value="\${esc(e?.degree||'')}"/></div>
      <div class="fg"><label>Stream / Major</label><input id="m-stream" value="\${esc(e?.stream||'')}"/></div>
      <div class="fg full"><label>School / Institution</label><input id="m-school" value="\${esc(e?.school||'')}"/></div>
      <div class="fg"><label>Period</label><input id="m-period" value="\${esc(e?.period||'')}"/></div>
      <div class="fg"><label>Grade / Status</label><input id="m-grade" value="\${esc(e?.grade||'In Progress')}"/></div>
      <div class="fg"><label>Order</label><input id="m-ord" type="number" value="\${e?.order_idx||0}"/></div>
      <div class="fg" style="padding-top:1rem"><div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${e?.visible!==false?'checked':''}/><span class="tsl"></span></label></div></div>
      <div class="fg full"><label>Bullet Items (one per line)</label><textarea id="m-items" style="min-height:80px">\${esc(items)}</textarea></div>
      <div class="fg full"><label>Skill Pills (comma-separated)</label><input id="m-pills" value="\${esc(pills)}"/></div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveEdu(\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveEdu(id) {
  try {
    const items=val('m-items').split('\n').map(s=>s.trim()).filter(Boolean);
    const pills=val('m-pills').split(',').map(s=>s.trim()).filter(Boolean);
    const body={degree:val('m-deg'),stream:val('m-stream'),school:val('m-school'),period:val('m-period'),
      grade:val('m-grade'),order_idx:parseInt(val('m-ord'))||0,visible:chk('m-vis'),items,pills};
    id ? await api('/education/'+id,'PUT',body) : await api('/education','POST',body);
    closeModal(); loadEdu(); toast('Education saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Projects ───────────────────────────────────────────────────────────
async function loadProj() {
  try {
    const { projects } = await api('/projects');
    ST.projects = projects;
    $('proj-list').innerHTML = projects.length ? projects.map(p => \`
      <div class="li">
        <div class="li-body">
          <div class="li-title">\${esc(p.title)}\${p.featured?' ★':''}</div>
          <div class="li-sub">\${esc(p.category)} · ord:\${p.order_idx}</div>
          <div class="li-tags">\${(p.stack||[]).slice(0,4).map(t=>\`<span class="lt">\${esc(t)}</span>\`).join('')}</div>
        </div>
        <div class="la">
          <span class="badge \${p.visible?'ok':'off'}">\${p.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openProj(\${p.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('projects',\${p.id},loadProj)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No projects yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function openProj(id) {
  const p = ST.projects?.find(x => x.id === id) || null;
  const stk = Array.isArray(p?.stack) ? p.stack.join(', ') : (p?.stack||'');
  const tgs = Array.isArray(p?.tags) ? p.tags.join(', ') : (p?.tags||'');
  $('mbody').innerHTML = \`
    <div class="modal-title">\${p ? 'EDIT PROJECT' : 'ADD PROJECT'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg full"><label>Title</label><input id="m-title" value="\${esc(p?.title||'')}"/></div>
      <div class="fg"><label>Category</label><input id="m-cat" value="\${esc(p?.category||'')}"/></div>
      <div class="fg"><label>Category Icon (Material)</label><input id="m-icon" value="\${esc(p?.category_icon||'folder')}"/></div>
      <div class="fg full"><label>Summary</label><textarea id="m-sum">\${esc(p?.summary||'')}</textarea></div>
      <div class="fg full"><label>Stack (comma-separated)</label><input id="m-stk" value="\${esc(stk)}"/></div>
      <div class="fg full"><label>Tags (comma-separated)</label><input id="m-tags" value="\${esc(tgs)}"/></div>
      <div class="fg"><label>GitHub URL</label><input id="m-gh" value="\${esc(p?.github_url||'')}"/></div>
      <div class="fg"><label>Demo / Live URL</label><input id="m-demo" value="\${esc(p?.demo_url||'')}"/></div>
      <div class="fg full"><label>External URL (fallback CTA)</label><input id="m-ext" value="\${esc(p?.external_url||'')}"/></div>
      <div class="fg full"><label>Thumbnail Image URL (optional)</label><input id="m-img" value="\${esc(p?.image_url||'')}"/></div>
      <div class="fg"><label>Status</label>
        <select id="m-status">
          <option value="completed" \${p?.status==='completed'?'selected':''}>Completed</option>
          <option value="in-progress" \${p?.status==='in-progress'?'selected':''}>In Progress</option>
          <option value="archived" \${p?.status==='archived'?'selected':''}>Archived</option>
        </select>
      </div>
      <div class="fg"><label>Order</label><input id="m-ord" type="number" value="\${p?.order_idx||0}"/></div>
      <div class="fg" style="padding-top:.5rem">
        <div class="trow"><div class="tlbl">Featured ★</div><label class="tsw"><input type="checkbox" id="m-feat" \${p?.featured?'checked':''}/><span class="tsl"></span></label></div>
        <div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${p?.visible!==false?'checked':''}/><span class="tsl"></span></label></div>
      </div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveProj(\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveProj(id) {
  try {
    const stack=val('m-stk').split(',').map(s=>s.trim()).filter(Boolean);
    const tags=val('m-tags').split(',').map(s=>s.trim()).filter(Boolean);
    const body={title:val('m-title'),category:val('m-cat'),category_icon:val('m-icon'),
      summary:val('m-sum'),stack,tags,github_url:val('m-gh')||null,demo_url:val('m-demo')||null,
      external_url:val('m-ext')||null,image_url:val('m-img')||null,status:val('m-status'),
      order_idx:parseInt(val('m-ord'))||0,featured:chk('m-feat'),visible:chk('m-vis')};
    id ? await api('/projects/'+id,'PUT',body) : await api('/projects','POST',body);
    closeModal(); loadProj(); toast('Project saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Proof ──────────────────────────────────────────────────────────────
async function loadProof() {
  try {
    const { items, settings } = await api('/proof');
    ST.proof = items;
    const cfg = settings?.proof_section || {};
    setVal('proof-title', cfg.section_title || '');
    setVal('proof-orgs-title', cfg.orgs_title || '');
    setVal('proof-orgs-sub', cfg.orgs_subtitle || '');
    setVal('proof-rv-title', cfg.testimonials_title || '');
    $('proof-list').innerHTML = items.length ? items.map(p => \`
      <div class="li">
        <div class="li-body">
          <div class="li-title">\${esc(p.name)}</div>
          <div class="li-sub">\${esc(p.type)} · \${esc(p.subtitle)}</div>
        </div>
        <div class="la">
          <span class="badge \${p.visible?'ok':'off'}">\${p.visible?'On':'Off'}</span>
          <button class="lbtn" onclick="openProofItem('\${esc(p.type)}',\${p.id})"><span class="material-icons-round mi">edit</span>Edit</button>
          <button class="lbtn del" onclick="delItem('proof',\${p.id},loadProof)"><span class="material-icons-round mi">delete</span></button>
        </div>
      </div>\`).join('') : '<div style="color:var(--text-faint);font-size:.8rem">No items yet.</div>';
  } catch(e) { toast(e.message, true); }
}
async function saveProofCfg() {
  try {
    const s = ST.settings || (await api('/settings')).settings;
    await api('/settings','POST',{ proof_section:{ ...(s.proof_section||{}),
      section_title:val('proof-title'), orgs_title:val('proof-orgs-title'), orgs_subtitle:val('proof-orgs-sub'), testimonials_title:val('proof-rv-title') }});
    toast('Proof config saved!');
  } catch(e) { toast(e.message, true); }
}
async function openProofItem(type, id) {
  const p = ST.proof?.find(x => x.id === id) || null;
  const isTrv = type === 'testimonial';
  $('mbody').innerHTML = \`
    <div class="modal-title">\${p ? 'EDIT' : 'ADD'} \${isTrv ? 'TESTIMONIAL' : 'ORGANIZATION'}</div>
    <div class="fgrid" style="margin-bottom:1rem">
      <div class="fg"><label>Name</label><input id="m-name" value="\${esc(p?.name||'')}"/></div>
      <div class="fg"><label>Subtitle / Role · Company</label><input id="m-sub" value="\${esc(p?.subtitle||'')}"/></div>
      <div class="fg full"><label>Logo / Avatar URL</label><input id="m-logo" value="\${esc(p?.logo_url||'')}"/></div>
      \${!isTrv ? \`<div class="fg full"><label>Website URL</label><input id="m-url" value="\${esc(p?.url||'')}"/></div>\` : ''}
      \${isTrv ? \`<div class="fg full"><label>Testimonial Text</label><textarea id="m-text" style="min-height:90px">\${esc(p?.testimonial_text||'')}</textarea></div>
        <div class="fg"><label>Rating (1–5)</label><input id="m-rating" type="number" min="1" max="5" value="\${p?.testimonial_rating||5}"/></div>\` : ''}
      <div class="fg"><label>Order</label><input id="m-ord" type="number" value="\${p?.order_idx||0}"/></div>
      <div class="fg" style="padding-top:1rem"><div class="trow"><div class="tlbl">Visible</div><label class="tsw"><input type="checkbox" id="m-vis" \${p?.visible!==false?'checked':''}/><span class="tsl"></span></label></div></div>
    </div>
    <div class="brow"><button class="btn-s" onclick="saveProofItem('\${type}',\${id||'null'})"><span class="material-icons-round mi">save</span>Save</button><button class="btn-o" onclick="closeModal()">Cancel</button></div>\`;
  openModal();
}
async function saveProofItem(type, id) {
  try {
    const isTrv = type === 'testimonial';
    const body={type,name:val('m-name'),subtitle:val('m-sub'),logo_url:val('m-logo')||null,
      order_idx:parseInt(val('m-ord'))||0,visible:chk('m-vis'),
      url:!isTrv?val('m-url')||null:null,
      testimonial_text:isTrv?val('m-text'):null,
      testimonial_rating:isTrv?parseInt(val('m-rating'))||5:null};
    id ? await api('/proof/'+id,'PUT',body) : await api('/proof','POST',body);
    closeModal(); loadProof(); toast('Item saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Contact ────────────────────────────────────────────────────────────
async function loadContact() {
  try {
    const { settings } = await api('/settings');
    ST.settings = settings;
    const c = settings.contact || {};
    setVal('ct-email', c.email); setVal('ct-li', c.linkedin); setVal('ct-gh', c.github);
    setVal('ct-intro', c.intro_text); setVal('ct-avail-txt', c.availability_badge);
    setChk('ct-form', c.form_enabled !== false);
    setChk('ct-avail', c.availability_visible !== false);
  } catch(e) { toast(e.message, true); }
}
async function saveContact() {
  try {
    const s = ST.settings || {};
    await api('/settings','POST',{ contact:{ ...(s.contact||{}),
      email:val('ct-email'), linkedin:val('ct-li'), github:val('ct-gh'),
      intro_text:val('ct-intro'), form_enabled:chk('ct-form'),
      availability_visible:chk('ct-avail'), availability_badge:val('ct-avail-txt') }});
    toast('Contact settings saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Inbox ──────────────────────────────────────────────────────────────
async function loadInbox() {
  try {
    const { submissions } = await api('/inbox');
    if (!submissions.length) {
      $('inbox-content').innerHTML = '<div style="color:var(--text-faint);font-size:.8rem;padding:1rem">No messages yet.</div>';
      return;
    }
    $('inbox-content').innerHTML = submissions.map(s => \`
      <div class="sub-card \${s.read?'':'unread'}">
        <div class="sub-hd">
          <div><div class="sub-name">\${esc(s.name)}</div><div class="sub-email">\${esc(s.email)}</div></div>
          <div style="text-align:right">
            <div class="sub-date">\${esc(s.created_at?.slice(0,16)||'')}</div>
            \${!s.read ? \`<button class="lbtn" style="margin-top:.3rem" onclick="markRead(\${s.id})"><span class="material-icons-round mi">mark_email_read</span>Mark read</button>\` : ''}
          </div>
        </div>
        \${s.subject ? \`<div class="sub-subj">Re: \${esc(s.subject)}</div>\` : ''}
        <div class="sub-msg">\${esc(s.message)}</div>
      </div>\`).join('');
  } catch(e) { toast(e.message, true); }
}
async function markRead(id) {
  try { await api('/inbox/'+id+'/read','POST'); loadInbox(); } catch(e) { toast(e.message, true); }
}

// ── Sections ───────────────────────────────────────────────────────────
async function loadSections() {
  try {
    const { sections } = await api('/sections');
    ST.sections = sections;
    $('sections-list').innerHTML = sections.map((s,i) => \`
      <div class="sec-item" draggable="true" data-id="\${s.id}" data-idx="\${i}">
        <span class="material-icons-round sec-drag">drag_indicator</span>
        <span class="sec-label">\${esc(s.label)}</span>
        <span class="sec-id">\${esc(s.id)}</span>
        <label class="tsw" style="margin-left:auto"><input type="checkbox" id="sec-vis-\${s.id}" \${s.visible?'checked':''}/><span class="tsl"></span></label>
      </div>\`).join('');
    initDrag();
  } catch(e) { toast(e.message, true); }
}
function initDrag() {
  const items = $('sections-list').querySelectorAll('.sec-item');
  let dragged = null;
  items.forEach(el => {
    el.addEventListener('dragstart', () => { dragged = el; el.style.opacity = '.4'; });
    el.addEventListener('dragend', () => { dragged = null; el.style.opacity = ''; });
    el.addEventListener('dragover', e => { e.preventDefault(); if (dragged && el !== dragged) el.parentNode.insertBefore(dragged, el); });
  });
}
async function saveSections() {
  try {
    const items = [...$('sections-list').querySelectorAll('.sec-item')].map((el,i) => ({
      id: el.dataset.id, order_idx: i, visible: el.querySelector('input[type="checkbox"]')?.checked ? 1 : 0
    }));
    await api('/sections','PUT',{ sections: items });
    toast('Sections saved!');
  } catch(e) { toast(e.message, true); }
}

// ── SEO ────────────────────────────────────────────────────────────────
async function loadSeo() {
  try {
    const { settings } = await api('/settings');
    const s = settings.seo || {};
    setVal('seo-title',s.title); setVal('seo-desc',s.description);
    setVal('seo-ogt',s.og_title); setVal('seo-ogi',s.og_image); setVal('seo-ogd',s.og_description);
    setVal('seo-can',s.canonical); setVal('seo-robots',s.robots);
    setChk('seo-jsonld',s.json_ld_enabled !== false);
    const sel = $('seo-robots'); if (sel) { [...sel.options].forEach(o => o.selected = o.value === (s.robots||'index, follow')); }
  } catch(e) { toast(e.message, true); }
}
async function saveSeo() {
  try {
    const s = ST.settings || (await api('/settings')).settings;
    await api('/settings','POST',{ seo:{ ...(s.seo||{}),
      title:val('seo-title'), description:val('seo-desc'),
      og_title:val('seo-ogt'), og_image:val('seo-ogi'), og_description:val('seo-ogd'),
      canonical:val('seo-can'), robots:val('seo-robots'), json_ld_enabled:chk('seo-jsonld') }});
    toast('SEO settings saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Theme ──────────────────────────────────────────────────────────────
async function loadTheme() {
  try {
    const { settings } = await api('/settings');
    const t = settings.theme || {};
    const sel=$('th-default'); if(sel)[...sel.options].forEach(o=>o.selected=o.value===t.default);
    setChk('th-toggle',t.user_toggle_enabled!==false);
    setChk('th-stars',t.stars_enabled!==false);
    setChk('th-noise',t.noise_enabled!==false);
    setChk('th-scan',t.scanlines_enabled!==false);
  } catch(e) { toast(e.message, true); }
}
async function saveTheme() {
  try {
    const s = ST.settings || (await api('/settings')).settings;
    await api('/settings','POST',{ theme:{ ...(s.theme||{}),
      default:val('th-default'), user_toggle_enabled:chk('th-toggle'),
      stars_enabled:chk('th-stars'), noise_enabled:chk('th-noise'), scanlines_enabled:chk('th-scan') }});
    toast('Theme saved!');
  } catch(e) { toast(e.message, true); }
}

// ── Security ───────────────────────────────────────────────────────────
async function changePw() {
  const cur=val('pw-cur'), nw=val('pw-new'), con=val('pw-con');
  if (!cur||!nw||!con) { toast('All fields are required.', true); return; }
  if (nw !== con) { toast('New passwords do not match.', true); return; }
  if (nw.length < 8) { toast('Password must be at least 8 characters.', true); return; }
  try {
    await api('/change-password','POST',{ current_password:cur, new_password:nw });
    $('pw-cur').value=''; $('pw-new').value=''; $('pw-con').value='';
    toast('Password changed successfully!');
  } catch(e) { toast(e.message, true); }
}

// ── Backup ─────────────────────────────────────────────────────────────
async function doExport() {
  try {
    const data = await api('/backup/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gk-portfolio-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click(); URL.revokeObjectURL(url);
    toast('Backup downloaded!');
  } catch(e) { toast(e.message, true); }
}
async function doImport() {
  const file = $('restore-file')?.files?.[0];
  if (!file) { toast('Please select a backup file.', true); return; }
  if (!confirm('This will overwrite all current data. Are you sure?')) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await api('/backup/import','POST', data);
    toast('Backup restored! Reloading...');
    setTimeout(() => location.reload(), 1500);
  } catch(e) { toast('Restore failed: ' + e.message, true); }
}

// ── Delete helper ──────────────────────────────────────────────────────
async function delItem(type, id, reload) {
  if (!confirm('Delete this item?')) return;
  try { await api('/'+type+'/'+id,'DELETE'); reload(); toast('Deleted.'); }
  catch(e) { toast(e.message, true); }
}

// ── Init ───────────────────────────────────────────────────────────────
loadDash();
</script>
</body>
</html>`;
}
