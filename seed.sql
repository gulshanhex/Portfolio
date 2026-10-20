-- ============================================================
-- Portfolio CMS (Astro + Cloudflare Workers) — Seed Data
-- Run AFTER schema.sql or triggered automatically via /setup
-- ============================================================

-- ── Sections ──────────────────────────────────────────────
INSERT OR IGNORE INTO sections VALUES ('hero',        'Hero',             1, 1);
INSERT OR IGNORE INTO sections VALUES ('about',       'About',            2, 1);
INSERT OR IGNORE INTO sections VALUES ('services',    'Services',         3, 1);
INSERT OR IGNORE INTO sections VALUES ('skills',      'Skills',           4, 1);
INSERT OR IGNORE INTO sections VALUES ('experience',  'Experience',       5, 1);
INSERT OR IGNORE INTO sections VALUES ('education',   'Education',        6, 1);
INSERT OR IGNORE INTO sections VALUES ('projects',    'Work',             7, 1);
INSERT OR IGNORE INTO sections VALUES ('proof',       'Testimonials',     8, 1);
INSERT OR IGNORE INTO sections VALUES ('faq',         'FAQ',              9, 1);
INSERT OR IGNORE INTO sections VALUES ('contact',     'Contact',          10, 1);

-- ── Global Settings ───────────────────────────────────────
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('global', '{
  "name": "Your Name",
  "site_name": "Portfolio",
  "tagline": "Automation & AI Systems Engineer",
  "domain": "https://example.com",
  "portfolio": "https://portfolio.example.com",
  "projects_subdomain": "https://projects.example.com",
  "location": "Remote",
  "footer_text": "Built by <strong>Your Name</strong>",
  "footer_links": [
    {"label": "Work Archive", "url": "/work"},
    {"label": "LLMs.txt", "url": "/llms.txt"},
    {"label": "Sitemap", "url": "/sitemap.xml"}
  ]
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hero', '{
  "headline": "I build bots & automation that run your business",
  "subheadline": "From custom AI workflows to automated scaling—I architect system integrations that eliminate manual work.",
  "show_visual": true,
  "visual_variant": "chat+chart",
  "headline_line1": "YOUR",
  "headline_line2": "NAME",
  "role_text": "<strong>Automation & AI Systems</strong> engineer crafting intelligent backends, bots & <em>real-world control systems</em>",
  "status_label": "Available for projects",
  "status_chip": "OPEN TO WORK",
  "cta_primary_label": "Start a project",
  "cta_primary_url": "#contact",
  "cta_secondary_label": "View work",
  "cta_secondary_url": "#projects",
  "resume_label": "Resume",
  "quick_stats": [
    {"value": "2+", "label": "Internships", "desc": "Hands-on in real production environments"},
    {"value": "20+", "label": "Technical Skills", "desc": "Python, bots, PLC, cloud, web, and more"},
    {"value": "3 mo", "label": "Field Experience", "desc": "Solving real engineering problems in industrial environments"}
  ]
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('about', '{
  "paragraphs": [
    "I build and explore <strong>intelligent automation and software systems</strong> — bridging the gap between physical hardware and digital infrastructure with equal curiosity for both worlds.",
    "From backend automation tools, Telegram bots and Discord bots to working hands-on with <em>industrial control panels and PLC-based systems</em> — I thrive where software meets the real world.",
    "Deeply curious about how systems work — from industrial control panels to cloud architectures — always focused on creating things that <strong>improve efficiency and functionality</strong>."
  ],
  "quote": "Always Learning. Always Building."
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('copy', '{
  "about_eyebrow": "// ABOUT ME",
  "about_title": "Who am I?",
  "about_subtitle": "Engineering intelligent software that interfaces with the physical and digital world.",
  "services_eyebrow": "// SERVICES",
  "services_title": "What I can do for you.",
  "services_subtitle": "Tailored automation, integration, and intelligence for your business.",
  "skills_eyebrow": "// SKILLS",
  "skills_title": "What I work with.",
  "skills_subtitle": "A curated set of tools, languages, and systems built through production environments and hands-on engineering.",
  "experience_eyebrow": "// EXPERIENCE",
  "experience_title": "Where I''ve engineered.",
  "education_eyebrow": "// EDUCATION",
  "education_title": "Where I learned.",
  "projects_eyebrow": "// SELECTED WORK",
  "projects_title": "What I built.",
  "projects_subtitle": "Production bots, monitoring dashboards, and automation toolkits.",
  "proof_eyebrow": "// TESTIMONIALS",
  "faq_eyebrow": "// QUICK ANSWERS",
  "faq_title": "Frequently asked questions.",
  "faq_subtitle": "Direct answers regarding engineering background, automation experience, and availability.",
  "contact_eyebrow": "// LET''S CONNECT",
  "contact_title": "Get in touch.",
  "contact_subtitle": "Tell me what you''re working on. Open to automation workflows, backend architecture, and custom bots."
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('contact', '{
  "email": "hello@example.com",
  "linkedin": "https://linkedin.com",
  "github": "https://github.com",
  "main_site": "https://example.com",
  "portfolio": "https://portfolio.example.com",
  "resume_url": "",
  "intro_text": "Open to internships, freelance projects, collaborations, and anything interesting. If you are building something with automation, AI, or backend systems — let''s talk.",
  "form_enabled": true,
  "availability_badge": "Available for projects",
  "availability_visible": true
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('seo', '{
  "title": "Your Name — Automation & AI Systems Engineer | Python, Bots, PLC & Cloud",
  "description": "Official portfolio of an Automation & AI Systems Engineer specializing in Python backends, Telegram & Discord bots, PLC industrial automation, and Cloudflare edge systems.",
  "keywords": "Automation Engineer, AI Systems Engineer, Python Developer, Telegram Bot Developer, Discord Bot Developer, PLC Systems, Industrial Automation, Cloudflare Workers, Backend Engineer",
  "og_title": "Your Name — Automation & AI Systems Engineer",
  "og_description": "Explore projects, industrial automation experience, Python bots, and cloud systems.",
  "og_image": "https://portfolio.example.com/og-image.png",
  "canonical": "https://portfolio.example.com",
  "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  "json_ld_enabled": true
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('theme', '{
  "default": "dark",
  "accent": "emerald",
  "user_toggle_enabled": true,
  "glow_intensity": "subtle",
  "stars_enabled": false,
  "stars_count": 80,
  "noise_enabled": false,
  "scanlines_enabled": false,
  "neon_intensity": "subtle"
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('nav', '{
  "show_resume": true,
  "resume_label": "Resume",
  "items": ["about", "services", "skills", "experience", "education", "projects", "proof", "faq", "contact"]
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('proof_section', '{
  "section_title": "Testimonials",
  "orgs_title": "Who I''ve worked with",
  "orgs_subtitle": "Organizations and environments that shaped my work.",
  "testimonials_title": "What People Say",
  "show_orgs": true,
  "show_testimonials": true
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('ui', '{}');

-- ── Skills ────────────────────────────────────────────────
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (1, 'Programming',           'code',             1);
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (2, 'Web & Backend',         'hub',              2);
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (3, 'Cloud & Systems',       'cloud',            3);
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (4, 'Industrial Automation', 'settings_suggest', 4);
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (5, 'Electrical Systems',    'bolt',             5);
INSERT OR IGNORE INTO skills (id, label, icon, order_idx) VALUES (6, 'Analytical Skills',     'psychology',       6);

INSERT OR IGNORE INTO skill_pills (skill_id, label, is_hot, order_idx) VALUES
  (1,'Python',1,1),(1,'JavaScript',1,2),(1,'HTML5',0,3),(1,'SQL / RDBMS',0,4),(1,'Bash (Basic)',0,5),
  (2,'Full-Stack Dev',1,1),(2,'API Integration',1,2),(2,'Bot Development',1,3),(2,'Telegram Bots',0,4),(2,'Discord Bots',0,5),(2,'REST APIs',0,6),
  (3,'Cloud Computing',1,1),(3,'Cloudflare Workers',1,2),(3,'System Testing',0,3),(3,'CS Fundamentals',0,4),(3,'Linux (Basic)',0,5),
  (4,'Industrial Automation',1,1),(4,'PLC Systems',1,2),(4,'Control Systems',1,3),(4,'Process Automation',0,4),(4,'Electrical Panels',0,5),(4,'HV Safety Protocols',0,6),
  (5,'Electronics Fundamentals',1,1),(5,'Power Distribution',0,2),(5,'Electrical Troubleshooting',0,3),(5,'Transformers',0,4),(5,'Voltage Stabilizers',0,5),(5,'Wiring & Assembly',0,6),
  (6,'Problem Solving',1,1),(6,'Analytical Thinking',1,2),(6,'Strategy',0,3),(6,'System Integration',0,4),(6,'Workflow Optimization',0,5);

-- ── Services ──────────────────────────────────────────────
INSERT OR IGNORE INTO services (id, icon, title, slug, description, order_idx) VALUES
  (1, 'smart_toy',    'Automation Bots',       'automation-bots',       'Telegram, Discord, and custom API bots for notifications, task queues, and workflow automation.', 1),
  (2, 'hub',          'Backend Systems',       'backend-systems',       'Python and Node.js backends with clean APIs, D1/SQL persistence, and solid integration patterns.', 2),
  (3, 'cloud_sync',   'Cloud & Deployment',    'cloud-deployment',      'Cloudflare Workers/Pages deployments, CI/CD pipelines, and reliable cloud-native architectures.', 3),
  (4, 'code',         'Web Development',       'web-development',       'Full-stack web systems — from landing pages to admin panels — built clean and mobile-first.', 4),
  (5, 'settings_suggest', 'Technical Prototyping', 'technical-prototyping', 'Rapid prototypes for automation ideas, hardware-software interfaces, and proof-of-concept systems.', 5),
  (6, 'integration_instructions', 'API Integration', 'api-integration', 'Connecting third-party services, building webhooks, and integrating complex APIs into clean backends.', 6);

-- ── Experience ────────────────────────────────────────────
INSERT OR IGNORE INTO experiences (id, badge_label, badge_type, icon, title, company, date_range, duration, location, bullet_points, tags, order_idx) VALUES
(1, 'Automation', 'lime', 'precision_manufacturing',
 'Automation Intern', 'Industrial Automation Lab',
 'May 2025 – Jun 2025', '2 Months', 'On-site',
 '["Worked in an industrial environment with <strong>electrical control panels</strong> and <strong>PLC-based systems</strong> on live production floors.",
   "Observed and documented <strong>system integration and testing workflows</strong> for complex automation setups.",
   "Gained hands-on exposure to <strong>control logic fundamentals</strong> applied in real industrial processes.",
   "Followed <strong>high-voltage safety protocols</strong> — developing awareness critical to industrial environments."]',
 '["Industrial Automation","Control Systems","PLC","Electrical Panels","Process Automation","System Testing"]',
 1),
(2, 'Electronics', 'ember', 'electrical_services',
 'Electronics Intern', 'Electronics Manufacturing Division',
 'Jan 2025 – Jan 2025', '1 Month', 'On-site',
 '["Industrial training focused on <strong>transformers and voltage stabilizers</strong> — from assembly to output testing.",
   "Observed <strong>wiring, assembly, and component testing</strong> processes in a manufacturing environment.",
   "Applied basic <strong>electrical troubleshooting techniques</strong> to identify and resolve faults."]',
 '["Electrical Systems","Power Distribution","Troubleshooting","Electronics"]',
 2);

-- ── Education ─────────────────────────────────────────────
INSERT OR IGNORE INTO education (id, period, degree, stream, school, grade, items, pills, order_idx) VALUES
(1, '2025 – 2026', 'Senior Secondary (Class 12)', 'PCM + Computer Science',
 'Senior Secondary School', 'In Progress',
 '["Industrial Automation Internship (May–Jun 2025)",
   "Electrical Systems Internship completed in Class 11",
   "PCM with Computer Science and Electronics Technology curriculum",
   "Real-world internship exposure through both Class 11 & 12"]',
 '["Python","Full-Stack Dev","Cloud Computing","Bot Development","Industrial Automation"]',
 1),
(2, '2023 – 2024', 'Secondary (SSC — Class 10)', 'General Education',
 'Secondary School', 'Completed',
 '["Completed Secondary Education (Class X) successfully",
   "Foundational studies in Mathematics, Science, and Technology"]',
 '["HTML5","JavaScript","RDBMS","Problem Solving"]',
 2);

-- ── Projects ──────────────────────────────────────────────
INSERT OR IGNORE INTO projects (id, title, slug, category, category_icon, summary, tags, stack, featured, github_url, order_idx) VALUES
(1,'Telegram Automation Bot','telegram-automation-bot','Bot Development','smart_toy',
 'Multi-feature Telegram bot that automates notifications, manages task queues, and integrates external APIs for real-time data delivery.',
 '["Bot","Automation","API"]','["Python","Telegram API","REST API","Automation"]',1,NULL,1),
(2,'Discord Notification System','discord-notification-system','Bot Development','notifications_active',
 'Discord bot for server automation — announcements, role management, scheduled tasks, and webhook integrations.',
 '["Bot","Discord","Automation"]','["Python","Discord.py","Webhooks","API Integration"]',1,NULL,2),
(3,'Industrial Dashboard Monitor','industrial-dashboard-monitor','Web Application','dashboard',
 'Web-based monitoring dashboard for industrial automation data — real-time system health, alerts, and control panel status.',
 '["Web","Industrial","Dashboard"]','["HTML5","JavaScript","Python","Industrial Automation"]',0,NULL,3),
(4,'Cloud Automation Pipeline','cloud-automation-pipeline','Cloud & Backend','cloud_sync',
 'Automated cloud deployment and task scheduling pipeline using Python scripts and cloud computing fundamentals.',
 '["Cloud","Backend","Automation"]','["Python","Cloud Computing","Automation","Scripting"]',0,NULL,4),
(5,'PLC Logic Visualizer','plc-logic-visualizer','Industrial Automation','memory',
 'Software interface for visualizing and testing PLC ladder logic sequences during industrial automation training.',
 '["Industrial","PLC","Tools"]','["Python","PLC Systems","Control Systems","Industrial"]',0,NULL,5),
(6,'API Integration Toolkit','api-integration-toolkit','Backend Development','integration_instructions',
 'Reusable Python toolkit for rapid API integration — handles auth flows, rate limiting, response parsing, and retry logic.',
 '["Backend","API","Tools"]','["Python","API Integration","REST APIs","Full-Stack"]',0,NULL,6);

-- ── Proof Items (Organizations Only — No Fabricated Testimonials) ───────────
INSERT OR IGNORE INTO proof_items (id, type, name, subtitle, logo_url, url, order_idx) VALUES
(1,'org','Industrial Automation Lab','Industrial Automation',NULL,'#',1),
(2,'org','Electronics Manufacturing','Power & Control Systems',NULL,'#',2),
(3,'org','Computer Science Academy','Education Institution',NULL,'#',3);

-- ── FAQs (AEO / GEO Optimization) ─────────────────────────
INSERT OR IGNORE INTO faqs (id, question, answer, order_idx, visible) VALUES
(1, 'What areas of engineering do you specialize in?',
 'I specialize in building <strong>Python backend systems</strong>, Telegram and Discord automation bots, REST API integrations, Cloudflare Workers edge applications, and industrial PLC control systems.', 1, 1),
(2, 'What hands-on industrial and engineering experience do you have?',
 'I have completed hands-on engineering internships working with <strong>PLC-based systems</strong>, electrical control panels, system testing on live production floors, transformers, voltage stabilizers, and electrical troubleshooting.', 2, 1),
(3, 'What software and automation services do you offer?',
 'I build custom Telegram and Discord bots, backend APIs with Python/JavaScript and SQL/D1 databases, cloud-native deployments on Cloudflare Workers, full-stack web dashboards, and rapid hardware-software technical prototypes.', 3, 1),
(4, 'Are you available for internships, freelance projects, or collaborations?',
 'Yes, I am actively open to internships, freelance automation and backend projects, and technical collaborations. Use the contact section below to get in touch directly.', 4, 1);
