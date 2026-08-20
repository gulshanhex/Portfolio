// ── Shared CSS ────────────────────────────────────────────────────────────
// Exports the full CSS string used by both public and admin pages.
// Design: neon-cyber, Bebas Neue display, JetBrains Mono body, Fraunces accent

export const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:ital,wght@0,300;0,400;0,700;1,300&family=Fraunces:ital,wght@0,300;0,700;1,300&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>`;

export const BASE_CSS = `
<style>
/* ── CSS Custom Properties ──────────────────────────── */
:root,[data-theme="dark"]{
  --bg:#060908;--bg-alt:#080d08;--bg-alt2:#060b07;
  --surface:#0b1209;--surface2:#0f1810;
  --card:#0d1510;--card-h:#111d13;
  --text:#c2d4ae;--text-dim:#7a9070;--text-faint:#4a6048;--heading:#d8e8c4;
  --lime:#8ecf00;--lime-d:#6fa000;--lime-glow:rgba(142,207,0,.15);
  --lime-b:rgba(142,207,0,.18);--lime-bg:rgba(142,207,0,.06);
  --ember:#cc4500;--ember-b:rgba(204,69,0,.3);
  --bdr:rgba(142,207,0,.12);--bdr-s:rgba(255,255,255,.05);--bdr-c:rgba(142,207,0,.09);
  --ff-h:'Bebas Neue',sans-serif;--ff-b:'JetBrains Mono',monospace;--ff-s:'Fraunces',serif;
  --sp:8rem 5vw;--mw:1260px;--tr:.25s cubic-bezier(.4,0,.2,1);
  --shadow-card:0 4px 24px rgba(0,0,0,.4);
  --glow-lime:0 0 30px rgba(142,207,0,.2);
  --radius:0px;
  color-scheme: dark;
}
[data-theme="light"]{
  --bg:#f0f5e8;--bg-alt:#e8f0de;--bg-alt2:#eaf2e0;
  --surface:#ffffff;--surface2:#f5faf0;
  --card:#ffffff;--card-h:#f5faf0;
  --text:#1a2810;--text-dim:#3d5c2a;--text-faint:#7a9960;--heading:#0d1f08;
  --lime:#4e8800;--lime-d:#3d6e00;--lime-glow:rgba(78,136,0,.12);
  --lime-b:rgba(78,136,0,.22);--lime-bg:rgba(78,136,0,.07);
  --ember:#b83b00;--ember-b:rgba(184,59,0,.25);
  --bdr:rgba(78,136,0,.15);--bdr-s:rgba(0,0,0,.06);--bdr-c:rgba(78,136,0,.1);
  --shadow-card:0 2px 12px rgba(0,0,0,.08);
  --glow-lime:0 0 20px rgba(78,136,0,.12);
  color-scheme: light;
}

/* ── Reset ──────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--text);font-family:var(--ff-b);
  overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
img{max-width:100%;height:auto;display:block}
a{text-decoration:none;color:inherit}
button{font-family:var(--ff-b);cursor:pointer}
ul{list-style:none}

/* ── Noise & Scanlines ──────────────────────────────── */
[data-theme="dark"] body::after{
  content:'';position:fixed;inset:0;z-index:1;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  opacity:.4}
[data-theme="dark"] body::before{
  content:'';position:fixed;inset:0;z-index:1;pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.05) 3px,rgba(0,0,0,.05) 4px)}
[data-theme="light"] body::after,[data-theme="light"] body::before{display:none}

/* ── Custom Cursor (desktop only) ───────────────────── */
@media (pointer:fine){
  body{cursor:none}
  #gk-cur{width:20px;height:24px;position:fixed;pointer-events:none;z-index:9999;
    left:-100px;top:-100px;
    background:var(--lime);clip-path:polygon(0% 0%,68% 32%,42% 46%,30% 100%);
    filter:drop-shadow(0 0 6px var(--lime-glow));
    transition:transform .1s ease,filter .1s ease;will-change:transform}
  #gk-trail{width:6px;height:6px;border-radius:50%;background:var(--lime);
    position:fixed;pointer-events:none;z-index:9997;left:-100px;top:-100px;
    opacity:.3;filter:blur(1.5px);will-change:transform}
  body.hovering #gk-cur{transform:scale(.7);filter:drop-shadow(0 0 12px var(--lime))}
}

/* ── Particle Canvas ────────────────────────────────── */
#gk-canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.2}
[data-theme="light"] #gk-canvas{opacity:.1}

/* ── Nav ─────────────────────────────────────────────── */
#gk-nav{position:fixed;top:0;left:0;right:0;z-index:800;
  display:flex;align-items:center;justify-content:space-between;
  padding:1.4rem 5vw;transition:padding .35s,background .35s,backdrop-filter .35s}
#gk-nav.stuck{
  background:rgba(6,9,8,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--bdr);padding:.9rem 5vw}
[data-theme="light"] #gk-nav.stuck{
  background:rgba(240,245,232,.94)}
.n-logo{font-family:var(--ff-h);font-size:1.7rem;letter-spacing:3px;color:var(--heading);
  display:inline-flex;align-items:baseline;gap:0}
.n-logo .dot{color:var(--lime)}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--text-dim);transition:color var(--tr);position:relative}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;right:0;
  height:1px;background:var(--lime);transform:scaleX(0);
  transform-origin:left;transition:transform var(--tr)}
.nav-links a:hover,.nav-links a.active{color:var(--lime)}
.nav-links a:hover::after,.nav-links a.active::after{transform:scaleX(1)}
.nav-cta-link{font-size:.7rem!important;letter-spacing:.18em!important;
  text-transform:uppercase;font-weight:700;
  background:var(--lime);color:#060908!important;
  padding:.45rem 1.2rem;
  clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
  transition:box-shadow var(--tr)!important}
.nav-cta-link:hover{box-shadow:var(--glow-lime)!important}
.nav-cta-link::after{display:none!important}
.theme-toggle{background:none;border:1px solid var(--bdr);
  color:var(--text-dim);padding:.4rem;display:flex;align-items:center;
  transition:border-color var(--tr),color var(--tr)}
.theme-toggle:hover{border-color:var(--lime);color:var(--lime)}
.theme-toggle .material-icons-round{font-size:1.1rem}
.nav-ham{display:none;flex-direction:column;gap:5px;background:none;
  border:none;cursor:pointer;padding:4px}
.nav-ham span{display:block;width:22px;height:1.5px;background:var(--text);transition:.3s}
#mob-nav{display:none;position:fixed;inset:0;z-index:790;
  background:rgba(6,9,8,.97);flex-direction:column;
  align-items:center;justify-content:center;gap:2.5rem}
[data-theme="light"] #mob-nav{background:rgba(240,245,232,.97)}
#mob-nav.open{display:flex}
#mob-nav a{font-family:var(--ff-h);font-size:2.8rem;letter-spacing:.1em;
  color:var(--heading);transition:color var(--tr)}
#mob-nav a:hover{color:var(--lime)}

/* ── Section Base ────────────────────────────────────── */
.section{position:relative;z-index:2;max-width:var(--mw);
  margin:0 auto;padding:var(--sp)}
.section-wrap{border-top:1px solid var(--bdr-s)}
.s-eyebrow{display:flex;align-items:center;gap:.8rem;font-size:.68rem;
  letter-spacing:.3em;text-transform:uppercase;color:var(--lime);margin-bottom:1.2rem}
.s-eyebrow::before{content:'';display:inline-block;width:28px;height:1px;
  background:var(--lime);flex-shrink:0}
.s-title{font-family:var(--ff-h);font-size:clamp(2.8rem,6vw,5.5rem);
  line-height:.92;letter-spacing:2px;color:var(--heading);margin-bottom:.5rem}
.s-title .dim{color:var(--text-faint)}
.s-title .accent{color:var(--lime)}
.s-subtitle{font-size:.92rem;color:var(--text-dim);
  max-width:600px;line-height:1.7;margin-top:.4rem;margin-bottom:3rem}

/* ── Reveal Animation ────────────────────────────────── */
@media (prefers-reduced-motion: no-preference){
  .rv{opacity:0;transform:translateY(24px);
    transition:opacity .6s ease,transform .6s ease}
  .rv.fl{transform:translateX(-24px)}
  .rv.vis{opacity:1;transform:none!important}
}

/* ── Buttons ─────────────────────────────────────────── */
.btn-primary{font-family:var(--ff-b);font-size:.72rem;letter-spacing:.18em;
  text-transform:uppercase;font-weight:700;
  background:var(--lime);color:#060908;
  padding:.85rem 2rem;
  clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
  transition:box-shadow var(--tr),transform var(--tr);
  display:inline-flex;align-items:center;gap:.5rem;border:none}
.btn-primary:hover{box-shadow:var(--glow-lime);transform:translateY(-2px)}
.btn-primary .material-icons-round{font-size:1rem}
.btn-outline{font-family:var(--ff-b);font-size:.72rem;letter-spacing:.18em;
  text-transform:uppercase;border:1px solid var(--bdr-c);color:var(--text);
  padding:.85rem 2rem;
  clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
  transition:border-color var(--tr),color var(--tr),background var(--tr);
  display:inline-flex;align-items:center;gap:.5rem;background:none}
.btn-outline:hover{border-color:var(--lime);color:var(--lime)}
.btn-outline .material-icons-round{font-size:1rem}

/* ── Pills / Tags ────────────────────────────────────── */
.pill{font-size:.72rem;letter-spacing:.08em;border:1px solid var(--bdr-s);
  color:var(--text-faint);padding:.3rem .75rem;
  transition:border-color var(--tr),color var(--tr),background var(--tr)}
.pill.hot,.pill:hover{border-color:var(--lime-b);color:var(--lime);background:var(--lime-bg)}
.tag{font-size:.68rem;letter-spacing:.08em;border:1px solid var(--bdr-s);
  color:var(--text-faint);padding:.22rem .6rem}

/* ── Cards ───────────────────────────────────────────── */
.card{background:var(--card);border:1px solid var(--bdr-c);
  transition:border-color var(--tr),transform var(--tr),box-shadow var(--tr)}
.card:hover{border-color:var(--lime-b);box-shadow:var(--shadow-card)}

/* ── Footer ──────────────────────────────────────────── */
#gk-footer{position:relative;z-index:2;border-top:1px solid var(--bdr-s);
  padding:2rem 5vw;display:flex;align-items:center;
  justify-content:space-between;flex-wrap:wrap;gap:1rem}
.ft-left{font-size:.72rem;color:var(--text-faint)}
.ft-left strong{color:var(--text)}
.ft-links{display:flex;gap:1.5rem;flex-wrap:wrap}
.ft-links a{font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;
  color:var(--text-faint);transition:color var(--tr)}
.ft-links a:hover{color:var(--lime)}
.ft-copy{width:100%;text-align:center;font-size:.62rem;letter-spacing:.15em;
  color:var(--text-faint);border-top:1px solid var(--bdr-s);
  padding-top:1.2rem;margin-top:.5rem;opacity:.5}

/* ── Availability Bar ────────────────────────────────── */
#avail-bar{position:relative;z-index:3;background:var(--lime);
  display:flex;align-items:center;justify-content:center;gap:.6rem;
  padding:.5rem 5vw;font-size:.68rem;letter-spacing:.15em;
  text-transform:uppercase;color:#060908;font-weight:700}
#avail-bar .dot{width:6px;height:6px;border-radius:50%;
  background:#060908;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,0,0,.3)}60%{box-shadow:0 0 0 6px rgba(0,0,0,0)}}

/* ── Hero ────────────────────────────────────────────── */
#hero{min-height:100vh;position:relative;z-index:2;
  display:grid;grid-template-columns:1.15fr 1fr;align-items:center;
  gap:3rem;max-width:var(--mw);margin:0 auto;padding:7rem 5vw 4rem}
.h-status{display:inline-flex;align-items:center;gap:.6rem;font-size:.68rem;
  letter-spacing:.2em;text-transform:uppercase;color:var(--lime);
  border:1px solid var(--lime-b);padding:.4rem 1rem;background:var(--lime-bg);
  margin-bottom:2rem}
.h-pulse{width:6px;height:6px;border-radius:50%;background:var(--lime);
  animation:pulse 2s infinite}
.h-name{font-family:var(--ff-h);line-height:.9;letter-spacing:2px;overflow:hidden;margin-bottom:1.5rem}
.h-ln1{display:block;font-size:clamp(4rem,9vw,9rem);color:var(--heading);
  transform:translateX(-110%);animation:slideL .9s cubic-bezier(.16,1,.3,1) .1s forwards}
.h-ln2{display:block;font-size:clamp(4rem,9vw,9rem);color:var(--lime);
  transform:translateX(110%);animation:slideR .9s cubic-bezier(.16,1,.3,1) .2s forwards;
  text-shadow:0 0 60px rgba(142,207,0,.15)}
[data-theme="light"] .h-ln2{text-shadow:none}
@keyframes slideL{to{transform:translateX(0)}}
@keyframes slideR{to{transform:translateX(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.h-role{font-family:var(--ff-s);font-weight:300;font-style:italic;
  font-size:clamp(.95rem,1.7vw,1.3rem);color:var(--text-dim);
  line-height:1.75;margin-bottom:2.5rem;
  opacity:0;animation:fadeUp .8s .7s ease forwards}
.h-role strong{color:var(--text);font-style:normal}
.h-btns{display:flex;gap:1rem;flex-wrap:wrap;
  opacity:0;animation:fadeUp .8s .9s ease forwards;margin-bottom:3rem}
.h-right{opacity:0;animation:fadeUp .8s 1.1s ease forwards}
.info-panel{border:1px solid var(--bdr);background:var(--surface);
  padding:2rem;position:relative}
.info-panel::before{content:'SYSTEM_INFO';position:absolute;top:-9px;left:1rem;
  font-size:.62rem;letter-spacing:.2em;color:var(--lime);
  background:var(--bg);padding:0 .5rem}
[data-theme="light"] .info-panel::before{background:var(--bg)}
.info-row{display:flex;justify-content:space-between;align-items:center;
  padding:.75rem 0;border-bottom:1px solid var(--bdr-s);font-size:.82rem}
.info-row:last-child{border-bottom:none}
.ir-key{color:var(--text-faint);letter-spacing:.1em;
  display:flex;align-items:center;gap:.5rem}
.ir-key .material-icons-round{font-size:.95rem;color:var(--lime)}
.ir-val{color:var(--text);text-align:right}
.ir-val a{color:var(--lime-d);transition:color var(--tr)}
.ir-val a:hover{color:var(--lime)}
.chip{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;
  background:var(--lime);color:#060908;font-weight:700;padding:.2rem .6rem}
.h-scroll{position:fixed;bottom:2rem;left:5vw;z-index:10;
  display:flex;align-items:center;gap:.8rem;font-size:.65rem;
  letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint);
  opacity:0;animation:fadeUp 1s 1.8s ease forwards}
.h-scroll-bar{width:50px;height:1px;background:linear-gradient(to right,var(--lime),transparent)}

/* ── Quick Stats ─────────────────────────────────────── */
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:3rem}
.stat-box{border:1px solid var(--bdr-c);background:var(--card);
  padding:1.4rem 1.6rem;position:relative;overflow:hidden;
  transition:border-color var(--tr),transform var(--tr)}
.stat-box::before{content:'';position:absolute;left:0;top:0;bottom:0;
  width:2px;background:var(--lime);box-shadow:0 0 10px rgba(142,207,0,.3)}
.stat-box:hover{border-color:var(--lime-b);transform:translateX(4px)}
.stat-num{font-family:var(--ff-h);font-size:2.4rem;letter-spacing:2px;
  color:var(--lime);line-height:1}
.stat-lbl{font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;
  color:var(--text-dim);margin-top:.3rem}
.stat-desc{font-size:.8rem;color:var(--text-faint);margin-top:.4rem;line-height:1.5}

/* ── About ───────────────────────────────────────────── */
.about-grid{display:grid;grid-template-columns:1.1fr 1fr;
  gap:5rem;align-items:start;margin-top:4rem}
.about-text p{font-family:var(--ff-s);font-weight:300;font-size:1.1rem;
  line-height:1.9;color:var(--text-dim);margin-bottom:1.4rem}
.about-text p em{color:var(--text)}
.about-text p strong{color:var(--lime-d);font-style:normal}
.about-quote{margin-top:2rem;padding:1.4rem 1.6rem;
  border-left:2px solid var(--lime);background:var(--lime-bg)}
.about-quote p{font-family:var(--ff-h);font-size:1.4rem;letter-spacing:2px;
  color:var(--heading);line-height:1.2;margin:0!important}

/* ── Services ────────────────────────────────────────── */
.services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:1.2rem;margin-top:4rem}
.svc-card{background:var(--card);border:1px solid var(--bdr-c);
  padding:2rem;position:relative;overflow:hidden;
  transition:border-color var(--tr),transform var(--tr)}
.svc-card::after{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at top left,var(--lime-bg) 0%,transparent 65%);
  opacity:0;transition:opacity var(--tr)}
.svc-card:hover{border-color:var(--lime-b);transform:translateY(-4px)}
.svc-card:hover::after{opacity:1}
.svc-ico{width:44px;height:44px;border:1px solid var(--bdr);background:var(--surface2);
  display:flex;align-items:center;justify-content:center;margin-bottom:1.2rem;
  transition:background var(--tr),border-color var(--tr);position:relative;z-index:1}
.svc-card:hover .svc-ico{background:var(--lime-bg);border-color:var(--lime-b)}
.svc-ico .material-icons-round{font-size:1.3rem;color:var(--lime)}
.svc-title{font-family:var(--ff-h);font-size:1.1rem;letter-spacing:2px;
  color:var(--heading);margin-bottom:.6rem;position:relative;z-index:1}
.svc-desc{font-size:.85rem;color:var(--text-dim);line-height:1.65;
  position:relative;z-index:1}

/* ── Skills ──────────────────────────────────────────── */
.skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
  gap:1.2rem;margin-top:4rem}
.sk-card{background:var(--card);border:1px solid var(--bdr-c);
  padding:1.8rem;position:relative;overflow:hidden;
  transition:border-color var(--tr),transform var(--tr)}
.sk-card:hover{border-color:var(--lime-b)}
.sk-head{display:flex;align-items:center;gap:.9rem;margin-bottom:1.4rem}
.sk-ico{width:40px;height:40px;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--bdr);background:var(--surface2);flex-shrink:0;
  transition:background var(--tr),border-color var(--tr)}
.sk-card:hover .sk-ico{background:var(--lime-bg);border-color:var(--lime-b)}
.sk-ico .material-icons-round{font-size:1.2rem;color:var(--lime)}
.sk-label{font-family:var(--ff-h);font-size:1rem;letter-spacing:2px;color:var(--heading)}
.pills-wrap{display:flex;flex-wrap:wrap;gap:.5rem}

/* ── Experience ──────────────────────────────────────── */
.xp-list{margin-top:4rem}
.xp-item{display:grid;grid-template-columns:200px 1fr;
  border-bottom:1px solid var(--bdr-s);transition:background var(--tr)}
.xp-item:first-child{border-top:1px solid var(--bdr-s)}
.xp-item:hover{background:var(--surface)}
.xp-left{padding:2.5rem 2rem 2.5rem 0;border-right:1px solid var(--bdr-s)}
.xp-num{font-size:.65rem;letter-spacing:.2em;color:var(--lime);margin-bottom:.5rem}
.xp-dates{font-size:.8rem;color:var(--text-dim);line-height:1.6}
.xp-dur{display:inline-block;margin-top:.5rem;font-size:.7rem;letter-spacing:.1em;
  background:var(--lime-bg);border:1px solid var(--lime-b);color:var(--lime);padding:.22rem .55rem}
.xp-loc{display:flex;align-items:flex-start;gap:.3rem;font-size:.72rem;
  color:var(--text-faint);margin-top:.5rem;line-height:1.4}
.xp-loc .material-icons-round{font-size:.85rem;color:var(--lime);flex-shrink:0;margin-top:.05rem}
.xp-right{padding:2.5rem 0 2.5rem 2.5rem}
.xp-badge{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;
  display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .8rem;margin-bottom:1rem}
.xp-badge.lime{background:var(--lime);color:#060908}
.xp-badge.ember{background:var(--ember);color:#f0ddd0}
.xp-badge .material-icons-round{font-size:.78rem}
.xp-title{font-family:var(--ff-h);font-size:clamp(1.7rem,2.5vw,2.2rem);
  letter-spacing:2px;color:var(--heading);line-height:1;margin-bottom:.3rem}
.xp-co{font-family:var(--ff-s);font-style:italic;font-size:1rem;
  color:var(--text-dim);margin-bottom:1.6rem;
  display:flex;align-items:center;gap:.5rem}
.xp-co .material-icons-round{font-size:.95rem;color:var(--lime-d)}
.xp-bullets{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.4rem}
.xp-bullets li{font-size:.9rem;line-height:1.7;color:var(--text-dim);
  padding-left:1.3rem;position:relative}
.xp-bullets li::before{content:'→';position:absolute;left:0;color:var(--lime);font-size:.75rem}
.xp-bullets li strong{color:var(--text)}
.xp-tags{display:flex;flex-wrap:wrap;gap:.4rem}

/* ── Education ───────────────────────────────────────── */
.edu-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem;margin-top:4rem}
.edu-card{background:var(--card);border:1px solid var(--bdr-c);overflow:hidden;
  transition:border-color var(--tr),transform var(--tr)}
.edu-card:hover{border-color:var(--lime-b);transform:translateY(-4px)}
.edu-top{padding:2rem 2rem 1.5rem;
  background:linear-gradient(135deg,var(--lime-bg) 0%,transparent 70%);
  border-bottom:1px solid var(--bdr-s);position:relative}
.edu-period{font-size:.67rem;letter-spacing:.2em;color:var(--lime);
  margin-bottom:.8rem;display:flex;align-items:center;gap:.4rem}
.edu-period .material-icons-round{font-size:.82rem}
.edu-deg{font-family:var(--ff-h);font-size:1.4rem;letter-spacing:2px;
  color:var(--heading);line-height:1.1;margin-bottom:.3rem}
.edu-stream{font-size:.8rem;color:var(--lime-d);margin-bottom:.3rem}
.edu-school{font-size:.82rem;color:var(--text-dim);line-height:1.4;
  display:flex;align-items:flex-start;gap:.3rem}
.edu-school .material-icons-round{font-size:.88rem;color:var(--text-faint);flex-shrink:0;margin-top:.1rem}
.edu-grade{position:absolute;top:1.8rem;right:2rem;font-family:var(--ff-h);
  font-size:1.2rem;color:var(--lime);text-shadow:var(--glow-lime)}
.edu-body{padding:1.4rem 2rem 1.8rem}
.edu-item{font-size:.82rem;color:var(--text-faint);line-height:1.6;
  padding:.4rem 0 .4rem 1.1rem;border-bottom:1px solid var(--bdr-s);position:relative}
.edu-item:last-of-type{border-bottom:none}
.edu-item::before{content:'◆';position:absolute;left:0;top:.55rem;
  color:var(--lime);font-size:.4rem}
.edu-pills{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:1rem}
.edu-pill{font-size:.68rem;letter-spacing:.08em;
  background:var(--lime-bg);border:1px solid var(--lime-b);color:var(--lime);padding:.22rem .55rem}

/* ── Projects ────────────────────────────────────────── */
.proj-filters{display:flex;gap:.5rem;flex-wrap:wrap;margin:1.5rem 0 3rem}
.proj-filter-btn{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;
  border:1px solid var(--bdr-s);color:var(--text-faint);padding:.45rem 1rem;
  background:none;transition:border-color var(--tr),color var(--tr),background var(--tr);
  display:inline-flex;align-items:center;gap:.35rem}
.proj-filter-btn:hover,.proj-filter-btn.active{
  border-color:var(--lime-b);color:var(--lime);background:var(--lime-bg)}
.proj-filter-btn .material-icons-round{font-size:.82rem}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
  gap:1.4rem}
.proj-card{background:var(--card);border:1px solid var(--bdr-c);overflow:hidden;
  transition:border-color var(--tr),transform var(--tr)}
.proj-card:hover{border-color:var(--lime-b);transform:translateY(-5px)}
.proj-thumb{position:relative;aspect-ratio:16/10;overflow:hidden;
  background:var(--surface2);display:flex;align-items:center;justify-content:center}
.proj-thumb img{width:100%;height:100%;object-fit:cover;
  transition:transform .5s ease}
.proj-card:hover .proj-thumb img{transform:scale(1.04)}
.proj-thumb-fallback{display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.5rem;height:100%;
  color:var(--text-faint);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase}
.proj-thumb-fallback .material-icons-round{font-size:2rem;color:var(--bdr)}
.proj-overlay{position:absolute;inset:0;background:rgba(6,9,8,.8);
  display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity var(--tr)}
.proj-card:hover .proj-overlay{opacity:1}
.proj-ctas{display:flex;gap:.8rem}
.proj-cta-btn{display:inline-flex;align-items:center;gap:.35rem;font-size:.7rem;
  letter-spacing:.1em;text-transform:uppercase;font-weight:700;
  background:var(--lime);color:#060908;padding:.55rem 1.1rem;
  transition:box-shadow var(--tr)}
.proj-cta-btn:hover{box-shadow:var(--glow-lime)}
.proj-cta-btn.outline{background:transparent;border:1px solid var(--lime);color:var(--lime)}
.proj-cta-btn .material-icons-round{font-size:.85rem}
.proj-featured{position:absolute;top:.8rem;left:.8rem;font-size:.62rem;
  letter-spacing:.1em;text-transform:uppercase;font-weight:700;
  background:var(--lime);color:#060908;padding:.2rem .6rem;
  display:inline-flex;align-items:center;gap:.25rem}
.proj-featured .material-icons-round{font-size:.72rem}
.proj-body{padding:1.5rem 1.6rem 1.8rem}
.proj-meta{display:flex;align-items:center;gap:.8rem;margin-bottom:.8rem}
.proj-num{font-size:.65rem;letter-spacing:.15em;color:var(--text-faint)}
.proj-cat{font-size:.67rem;letter-spacing:.1em;color:var(--lime-d);
  display:inline-flex;align-items:center;gap:.3rem}
.proj-cat .material-icons-round{font-size:.78rem}
.proj-title{font-family:var(--ff-h);font-size:1.3rem;letter-spacing:2px;
  color:var(--heading);margin-bottom:.6rem;line-height:1.1}
.proj-desc{font-size:.86rem;color:var(--text-dim);line-height:1.65;margin-bottom:1rem}
.proj-stack{display:flex;flex-wrap:wrap;gap:.4rem}
.proj-all-cta{margin-top:3rem;text-align:center;padding:2rem;
  border:1px dashed var(--bdr);background:var(--lime-bg)}
.proj-all-cta p{font-size:.9rem;color:var(--text-dim);margin-bottom:1rem}

/* ── Proof Section ───────────────────────────────────── */
.orgs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:1rem;margin:2.5rem 0 4rem}
.org-card{display:flex;align-items:center;gap:1rem;background:var(--card);
  border:1px solid var(--bdr-c);padding:1.2rem 1.4rem;
  transition:border-color var(--tr),transform var(--tr)}
.org-card:hover{border-color:var(--lime-b);transform:translateY(-3px)}
.org-logo{width:44px;height:44px;border-radius:3px;flex-shrink:0;object-fit:cover}
.org-name{font-size:.88rem;color:var(--heading);font-weight:700}
.org-sub{font-size:.72rem;color:var(--text-faint);margin-top:.2rem}
.testimonials-title{font-family:var(--ff-h);font-size:clamp(1.8rem,3vw,2.4rem);
  letter-spacing:2px;color:var(--heading);margin-bottom:2.5rem;
  display:flex;align-items:center;gap:.8rem}
.testimonials-title .material-icons-round{color:var(--lime);font-size:1.8rem}
.testimonials-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));
  gap:1.3rem}
.rv-card{background:var(--card);border:1px solid var(--bdr-c);
  padding:1.8rem;transition:border-color var(--tr),transform var(--tr)}
.rv-card:hover{border-color:var(--lime-b);transform:translateY(-4px)}
.rv-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.rv-stars{display:flex;gap:.15rem}
.rv-star{font-size:.9rem;color:var(--lime)}
.rv-quote-icon{color:var(--lime-b);font-size:1.8rem;opacity:.6}
.rv-text{font-family:var(--ff-s);font-weight:300;font-style:italic;
  font-size:.98rem;line-height:1.75;color:var(--text-dim);margin-bottom:1.5rem}
.rv-author{display:flex;align-items:center;gap:.9rem}
.rv-avatar{width:42px;height:42px;border-radius:50%;flex-shrink:0;
  border:1px solid var(--lime-b);object-fit:cover}
.rv-name{font-size:.88rem;color:var(--heading);font-weight:700}
.rv-role{font-size:.72rem;color:var(--text-faint);margin-top:.15rem}

/* ── Contact ─────────────────────────────────────────── */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;
  gap:5rem;align-items:start;margin-top:4rem}
.ct-intro{font-family:var(--ff-s);font-weight:300;font-size:1.1rem;
  color:var(--text-dim);line-height:1.8;margin-bottom:2.5rem}
.c-links{display:flex;flex-direction:column;gap:.9rem}
.c-link{display:flex;align-items:center;gap:1rem;background:var(--card);
  border:1px solid var(--bdr-c);padding:1.1rem 1.3rem;
  transition:border-color var(--tr),transform var(--tr);position:relative;overflow:hidden}
.c-link:hover{border-color:var(--lime-b);transform:translateX(4px)}
.c-link::after{content:'';position:absolute;left:0;top:0;bottom:0;
  width:0;background:var(--lime-bg);transition:width var(--tr)}
.c-link:hover::after{width:100%}
.c-ico{width:38px;height:38px;flex-shrink:0;border:1px solid var(--lime-b);
  background:var(--lime-bg);display:flex;align-items:center;
  justify-content:center;position:relative;z-index:1}
.c-ico .material-icons-round{font-size:1.1rem;color:var(--lime)}
.c-ico svg{width:18px;height:18px;fill:var(--lime)}
.c-txt{position:relative;z-index:1;flex:1}
.c-label{font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--text-faint);display:block}
.c-val{font-size:.88rem;color:var(--text);margin-top:.12rem;display:block}
.c-arr{color:var(--lime);opacity:0;transition:opacity var(--tr),transform var(--tr);
  position:relative;z-index:1}
.c-link:hover .c-arr{opacity:1;transform:translateX(3px)}
.c-arr .material-icons-round{font-size:1rem}

/* ── Contact Form ────────────────────────────────────── */
.ct-form{display:flex;flex-direction:column;gap:1rem}
.form-field{display:flex;flex-direction:column;gap:.4rem}
.form-field label{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-faint)}
.form-field input,.form-field textarea{
  background:var(--surface);border:1px solid var(--bdr-s);
  color:var(--text);font-family:var(--ff-b);font-size:.85rem;
  padding:.75rem 1rem;transition:border-color var(--tr);resize:vertical;outline:none}
.form-field input:focus,.form-field textarea:focus{border-color:var(--lime)}
.form-field textarea{min-height:120px}
.form-msg{font-size:.82rem;padding:.6rem 1rem;margin-top:.5rem}
.form-msg.ok{background:var(--lime-bg);border:1px solid var(--lime-b);color:var(--lime)}
.form-msg.err{background:rgba(204,69,0,.08);border:1px solid var(--ember-b);color:var(--ember)}

/* ── Terminal ────────────────────────────────────────── */
.terminal{border:1px solid var(--lime-b);background:#040606;
  box-shadow:0 0 40px rgba(142,207,0,.04),0 20px 50px rgba(0,0,0,.4)}
[data-theme="light"] .terminal{background:#f0f5ea;box-shadow:none}
.term-bar{display:flex;align-items:center;gap:.5rem;padding:.7rem 1rem;
  background:rgba(255,255,255,.02);border-bottom:1px solid var(--bdr-s)}
[data-theme="light"] .term-bar{background:rgba(0,0,0,.02)}
.td{width:11px;height:11px;border-radius:50%}
.td.r{background:#ff5f57}.td.y{background:#febc2e}.td.g{background:#28c840}
.term-title{font-size:.68rem;color:var(--text-faint);letter-spacing:.12em;margin-left:.4rem}
.term-body{padding:1.5rem;min-height:200px}
.t-line{margin-bottom:.15rem;font-size:.85rem;line-height:1.6}
.t-p{color:var(--lime)}.t-g{color:rgba(142,207,0,.7)}.t-w{color:var(--text)}.t-m{color:var(--text-dim)}
[data-theme="light"] .t-p{color:var(--lime-d)}
[data-theme="light"] .t-g{color:var(--text-dim)}
.t-cursor{display:inline-block;width:7px;height:1em;background:var(--lime);
  vertical-align:text-bottom;animation:blink 1s step-end infinite}
@keyframes blink{50%{opacity:0}}

/* ── Responsive ──────────────────────────────────────── */
@media(max-width:1024px){
  #hero{grid-template-columns:1fr;padding-top:8rem}
  .h-right{max-width:520px}
  .about-grid{grid-template-columns:1fr;gap:2.5rem}
  .contact-grid{grid-template-columns:1fr;gap:3rem}
}
@media(max-width:768px){
  .nav-links{display:none}
  .nav-ham{display:flex}
  :root{--sp:5rem 4vw}
  .xp-item{grid-template-columns:1fr}
  .xp-left{border-right:none;border-bottom:1px solid var(--bdr-s);padding-right:0}
  .xp-right{padding-left:0}
  .edu-grid{grid-template-columns:1fr}
  .proj-grid{grid-template-columns:1fr}
  #gk-footer{flex-direction:column;text-align:center}
  .h-scroll{display:none}
  .stats-row{grid-template-columns:1fr}
}
@media(max-width:480px){
  .h-btns{flex-direction:column}
  .orgs-grid{grid-template-columns:1fr 1fr}
  .testimonials-grid{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
</style>`;
