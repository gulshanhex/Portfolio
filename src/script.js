/* ═══════════════════════════════════════════
   GULSHAN KUMAR — PORTFOLIO SCRIPT
   Fetches: config.json, projects.json, reviews.json
   ═══════════════════════════════════════════ */

/* ══ CANVAS PARTICLE NET ══ */
(function () {
  const cv = document.getElementById("bgCanvas"), ctx = cv.getContext("2d");
  let W, H, ns = [];
  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize(); addEventListener("resize", resize);
  function N() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - .5) * .28; this.vy = (Math.random() - .5) * .28;
    this.r = Math.random() * 1.2 + .4;
  }
  for (let i = 0; i < 80; i++) ns.push(new N());
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ns.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(142,207,0,.5)"; ctx.fill();
    });
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x, dy = ns[i].y - ns[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          ctx.beginPath(); ctx.moveTo(ns[i].x, ns[i].y); ctx.lineTo(ns[j].x, ns[j].y);
          ctx.strokeStyle = `rgba(142,207,0,${.14 * (1 - d / 150)})`; ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══ CURSOR — FAST ARROW ══ */
(function () {
  const cur = document.getElementById("cur");
  const trail = document.getElementById("cur-trail");
  if (!cur) return;

  let mx = -200, my = -200, tx = -200, ty = -200;

  /* Arrow moves at exact mouse position — instant, no lag */
  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    /* Offset so arrow tip aligns to pointer hotspot */
    cur.style.left = (mx - 2) + "px";
    cur.style.top  = (my - 2) + "px";
  });

  /* Trail follows with slight lag for style */
  (function animTrail() {
    tx += (mx - tx) * 0.22;
    ty += (my - ty) * 0.22;
    trail.style.left = (tx - 3) + "px";
    trail.style.top  = (ty - 3) + "px";
    requestAnimationFrame(animTrail);
  })();

  document.addEventListener("mouseleave", () => {
    cur.style.left = "-100px"; trail.style.left = "-100px";
  });
})();

/* Hover effect on interactive elements */
function addHov() {
  document.querySelectorAll("a, button, .sk-card, .st-box, .proj-card, .edu-card, .xp-item, .rv-card, .cl-card, .c-link, .pf-btn")
    .forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("hov"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("hov"));
    });
}

/* ══ NAV ══ */
(function () {
  const nav = document.getElementById("nav");
  const ham = document.getElementById("ham");
  const mob = document.getElementById("mob-menu");
  addEventListener("scroll", () => { nav.classList.toggle("stuck", scrollY > 60); updateAct(); });
  ham && ham.addEventListener("click", () => mob.classList.toggle("open"));
  mob && mob.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mob.classList.remove("open")));
  function updateAct() {
    const ss = document.querySelectorAll("section[id]");
    const ls = document.querySelectorAll(".nav-ul a[href^='#']");
    let cur = "";
    ss.forEach(s => { if (scrollY >= s.offsetTop - 120) cur = s.id; });
    ls.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }
})();

/* ══ REVEAL OBSERVER ══ */
const rvObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const d = parseFloat(e.target.style.transitionDelay || 0) * 1000;
      setTimeout(() => e.target.classList.add("vis"), d);
    }
  });
}, { threshold: .1 });

function observe() {
  document.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
}

/* ══ STAT COUNT-UP ══ */
const stObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target.querySelector(".st-num");
    if (!el) return;
    const t = parseInt(el.dataset.val), sfx = el.dataset.sfx || "";
    let c = 0;
    const s = t / 45;
    const tmr = setInterval(() => {
      c += s;
      if (c >= t) { el.textContent = t + sfx; clearInterval(tmr); }
      else el.textContent = Math.floor(c) + sfx;
    }, 30);
    stObs.unobserve(e.target);
  });
}, { threshold: .5 });

/* ══ RENDER — SKILLS ══ */
function renderSkills(C) {
  const grid = document.getElementById("sk-grid");
  if (!grid || !C.skills) return;
  grid.innerHTML = C.skills.map((sk, i) => `
    <div class="sk-card rv" style="transition-delay:${i * .08}s">
      <div class="sk-hd">
        <div class="sk-ico"><span class="material-icons-round">${sk.icon}</span></div>
        <span class="sk-lbl">${sk.label}</span>
      </div>
      <div class="pills">
        ${sk.pills.map(p => `<span class="pill ${sk.hot.includes(p) ? "hot" : ""}">${p}</span>`).join("")}
      </div>
    </div>`).join("");
  grid.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
}

/* ══ RENDER — EXPERIENCE ══ */
function renderXP(C) {
  const list = document.getElementById("xp-list");
  if (!list || !C.experience) return;
  list.innerHTML = C.experience.map(x => `
    <div class="xp-item rv fl">
      <div class="xp-l">
        <div class="xp-n">${x.num}</div>
        <div class="xp-dt">${x.date}</div>
        <div class="xp-dur">${x.dur}</div>
        <div class="xp-loc"><span class="material-icons-round">location_on</span>${x.loc}</div>
      </div>
      <div class="xp-r">
        <span class="xp-badge ${x.bt}">
          <span class="material-icons-round">${x.icon}</span>${x.badge}
        </span>
        <div class="xp-title">${x.title}</div>
        <div class="xp-co"><span class="material-icons-round">business</span>${x.co}</div>
        <ul class="xp-pts">${x.pts.map(p => `<li>${p}</li>`).join("")}</ul>
        <div class="xp-tags">${x.tags.map(t => `<span class="xp-tag">${t}</span>`).join("")}</div>
      </div>
    </div>`).join("");
  list.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
}

/* ══ RENDER — EDUCATION ══ */
function renderEdu(C) {
  const grid = document.getElementById("edu-grid");
  if (!grid || !C.education) return;
  grid.innerHTML = C.education.map((ed, i) => `
    <div class="edu-card rv" style="transition-delay:${i * .12}s">
      <div class="edu-top">
        <div class="edu-per"><span class="material-icons-round">calendar_month</span>${ed.period}</div>
        <div class="edu-deg">${ed.deg}</div>
        <div class="edu-str">${ed.str}</div>
        <div class="edu-sch"><span class="material-icons-round">school</span>${ed.sch}</div>
        <div class="edu-gr">${ed.gr}</div>
      </div>
      <div class="edu-body">
        ${ed.items.map(it => `<div class="edu-item">${it}</div>`).join("")}
        <div class="edu-pills">${ed.pills.map(p => `<span class="edu-pill">${p}</span>`).join("")}</div>
      </div>
    </div>`).join("");
  grid.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
}

/* ══ RENDER — STATS ══ */
function renderStats(C) {
  if (!C.stats) return;
  document.querySelectorAll(".st-box").forEach((box, i) => {
    if (!C.stats[i]) return;
    const numEl = box.querySelector(".st-num");
    const lbl   = box.querySelector(".st-lbl");
    const desc  = box.querySelector(".st-desc");
    if (numEl) { numEl.dataset.val = C.stats[i].value; numEl.dataset.sfx = C.stats[i].suffix; numEl.textContent = "0" + C.stats[i].suffix; }
    if (lbl)  lbl.textContent  = C.stats[i].label;
    if (desc) desc.textContent = C.stats[i].desc;
    stObs.observe(box);
  });
}

/* ══ RENDER — PROJECTS ══ */
function renderProjects(data) {
  const grid = document.getElementById("proj-grid");
  if (!grid || !data.projects) return;
  grid.innerHTML = data.projects.map((p, i) => `
    <article class="proj-card rv" style="transition-delay:${i * .09}s" data-cat="${p.cat}">
      <div class="proj-img-w">
        <img src="${p.img}" alt="${p.title}" class="proj-img" loading="lazy"/>
        <div class="proj-ov">
          <div class="proj-ctas">
            ${p.gh  ? `<a href="${p.gh}"   target="_blank" class="proj-cta"><span class="material-icons-round">code</span>Code</a>` : ""}
            ${p.live? `<a href="${p.live}" target="_blank" class="proj-cta live"><span class="material-icons-round">open_in_new</span>Live</a>` : ""}
          </div>
        </div>
        ${p.feat ? `<span class="proj-feat"><span class="material-icons-round">star</span>Featured</span>` : ""}
      </div>
      <div class="proj-body">
        <div class="proj-meta">
          <span class="proj-num">${p.num}</span>
          <span class="proj-cat"><span class="material-icons-round">${p.catIcon}</span>${p.cat}</span>
        </div>
        <h3 class="proj-title">${p.title}</h3>
        <p class="proj-desc">${p.desc}</p>
        <div class="proj-techs">${p.tech.map(t => `<span class="proj-tech">${t}</span>`).join("")}</div>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
}

/* ══ RENDER — CLIENTS & REVIEWS ══ */
function renderReviews(data) {
  /* Clients */
  const clGrid = document.getElementById("cl-grid");
  if (clGrid && data.clients) {
    clGrid.innerHTML = data.clients.map(c => `
      <a href="${c.url}" class="cl-card rv">
        <img src="${c.logo}" alt="${c.name}" class="cl-logo" loading="lazy"/>
        <div><div class="cl-name">${c.name}</div><div class="cl-cat">${c.cat}</div></div>
      </a>`).join("");
    clGrid.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
  }
  /* Reviews */
  const rvGrid = document.getElementById("rv-grid");
  if (rvGrid && data.reviews) {
    rvGrid.innerHTML = data.reviews.map((r, i) => `
      <article class="rv-card rv" style="transition-delay:${i * .1}s">
        <div class="rv-top">
          <div class="rv-stars">${Array(r.r).fill('<span class="material-icons-round rv-star">star</span>').join("")}</div>
          <span class="material-icons-round rv-qi">format_quote</span>
        </div>
        <p class="rv-text">${r.text}</p>
        <div class="rv-auth">
          <img src="${r.av}" alt="${r.name}" class="rv-av" loading="lazy"/>
          <div>
            <div class="rv-name">${r.name}</div>
            <div class="rv-role">${r.role}<span class="material-icons-round rv-dot">fiber_manual_record</span>${r.co}</div>
          </div>
        </div>
      </article>`).join("");
    rvGrid.querySelectorAll(".rv").forEach(el => rvObs.observe(el));
  }
}

/* ══ PROJECT FILTER ══ */
function initFilter() {
  const btns = document.querySelectorAll(".pf-btn");
  const grid = document.getElementById("proj-grid");
  if (!btns.length || !grid) return;
  btns.forEach(btn => btn.addEventListener("click", () => {
    btns.forEach(b => b.classList.remove("active")); btn.classList.add("active");
    const cat = btn.dataset.cat;
    grid.querySelectorAll(".proj-card").forEach(card => {
      card.style.display = (cat === "all" || card.dataset.cat.includes(cat)) ? "" : "none";
    });
  }));
}

/* ══ TERMINAL TYPEWRITER ══ */
function initTerminal(lines) {
  const cmdEl = document.getElementById("t-cmd");
  const outEl = document.getElementById("t-out");
  if (!cmdEl || !outEl || !lines) return;
  let li = 0, ci = 0, ph = "type";
  function tick() {
    const line = lines[li];
    if (ph === "type") {
      cmdEl.textContent = line.cmd.slice(0, ci + 1); ci++;
      if (ci >= line.cmd.length) { ph = "show"; setTimeout(tick, 500); return; }
      setTimeout(tick, 72 + Math.random() * 38);
    } else if (ph === "show") {
      outEl.innerHTML = line.out.map(o => `<div class="term-ln"><span class="${o.c}">${o.v}</span></div>`).join("");
      ph = "erase"; setTimeout(tick, 2600);
    } else if (ph === "erase") {
      const t = cmdEl.textContent;
      if (!t.length) { outEl.innerHTML = ""; li = (li + 1) % lines.length; ci = 0; ph = "type"; setTimeout(tick, 350); return; }
      cmdEl.textContent = t.slice(0, -1); setTimeout(tick, 32);
    }
  }
  setTimeout(tick, 1400);
}

/* ══ MAGNETIC BUTTONS ══ */
function initMagnetic() {
  document.querySelectorAll(".btn-m, .btn-g").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .22}px)`;
    });
    btn.addEventListener("mouseleave", () => btn.style.transform = "");
  });
}

/* ══ MAIN INIT — fetch all JSON then render ══ */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [cfg, proj, rev] = await Promise.all([
      fetch("config.json").then(r => r.json()),
      fetch("projects.json").then(r => r.json()),
      fetch("reviews.json").then(r => r.json())
    ]);

    renderSkills(cfg);
    renderXP(cfg);
    renderEdu(cfg);
    renderStats(cfg);
    renderProjects(proj);
    renderReviews(rev);
    initTerminal(cfg.termLines);
    initFilter();
    initMagnetic();
    observe();
    setTimeout(addHov, 300);

  } catch (err) {
    console.error("Portfolio: Failed to load data —", err);
  }
});
