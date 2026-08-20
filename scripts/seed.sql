-- ============================================================
-- GK Portfolio — Seed Data
-- Run AFTER schema.sql in the D1 Query console
-- Or triggered automatically by the /setup route
-- ============================================================

-- ── Sections ──────────────────────────────────────────────
INSERT OR IGNORE INTO sections VALUES ('hero',        'Hero',             1, 1);
INSERT OR IGNORE INTO sections VALUES ('about',       'About',            2, 1);
INSERT OR IGNORE INTO sections VALUES ('services',    'What I Do',        3, 1);
INSERT OR IGNORE INTO sections VALUES ('skills',      'Tech Arsenal',     4, 1);
INSERT OR IGNORE INTO sections VALUES ('experience',  'Experience',       5, 1);
INSERT OR IGNORE INTO sections VALUES ('education',   'Education',        6, 1);
INSERT OR IGNORE INTO sections VALUES ('projects',    'Projects',         7, 1);
INSERT OR IGNORE INTO sections VALUES ('proof',       'Proof & Context',  8, 1);
INSERT OR IGNORE INTO sections VALUES ('contact',     'Contact',          9, 1);

-- ── Global Settings ───────────────────────────────────────
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('global', '{
  "name": "Gulshan Kumar",
  "site_name": "GK Portfolio",
  "tagline": "Automation & AI Systems Engineer",
  "domain": "https://gulshan-kumar.me",
  "portfolio": "https://portfolio.gulshan-kumar.me",
  "projects_subdomain": "https://projects.gulshan-kumar.me",
  "location": "Delhi, India",
  "footer_text": "Built by <strong>Gulshan Kumar</strong> · Delhi, India"
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hero', '{
  "headline_line1": "GULSHAN",
  "headline_line2": "KUMAR",
  "role_text": "<strong>Automation & AI Systems</strong> engineer crafting intelligent backends, bots & <em>real-world control systems</em>",
  "status_label": "Available for Opportunities",
  "status_chip": "OPEN TO WORK",
  "cta_primary_label": "View Projects",
  "cta_primary_url": "#projects",
  "cta_secondary_label": "Get In Touch",
  "cta_secondary_url": "#contact",
  "resume_label": "Resume",
  "quick_stats": [
    {"value": "2+", "label": "Internships", "desc": "Hands-on at real production environments in Delhi"},
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

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('contact', '{
  "email": "gulshan@gulshan-kumar.me",
  "linkedin": "https://linkedin.com/in/gulshankumar-tech",
  "github": "https://github.com/gulshanhex",
  "main_site": "https://gulshan-kumar.me",
  "portfolio": "https://portfolio.gulshan-kumar.me",
  "resume_url": "",
  "intro_text": "Open to internships, freelance projects, collaborations, and anything interesting. If you are building something with automation, AI, or backend systems — let''s talk.",
  "form_enabled": true,
  "availability_badge": "Open to Work",
  "availability_visible": true
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('seo', '{
  "title": "Gulshan Kumar — Automation & AI Systems Engineer",
  "description": "Portfolio of Gulshan Kumar — Automation & AI Systems | Python | Web & Cloud | Delhi, India",
  "og_title": "Gulshan Kumar — Automation & AI Systems Engineer",
  "og_description": "Portfolio of Gulshan Kumar — Automation & AI Systems | Python | Web & Cloud | Delhi, India",
  "og_image": "",
  "canonical": "https://portfolio.gulshan-kumar.me",
  "robots": "index, follow",
  "json_ld_enabled": true
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('theme', '{
  "default": "dark",
  "user_toggle_enabled": true,
  "stars_enabled": true,
  "stars_count": 80,
  "noise_enabled": true,
  "scanlines_enabled": true,
  "neon_intensity": "balanced"
}');

-- Nav items must include all sections you want in the nav
-- (services and proof are included here — admin can reorder/remove via Sections panel)
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('nav', '{
  "show_resume": true,
  "resume_label": "Resume",
  "items": ["about", "services", "skills", "experience", "education", "projects", "proof", "contact"]
}');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('proof_section', '{
  "section_title": "Proof & Context",
  "orgs_title": "WHO I''VE WORKED WITH",
  "orgs_subtitle": "Organizations and environments that shaped my work.",
  "testimonials_title": "What People Say",
  "show_orgs": true,
  "show_testimonials": true
}');

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
INSERT OR IGNORE INTO services (id, icon, title, description, order_idx) VALUES
  (1, 'smart_toy',    'Automation Bots',       'Telegram, Discord, and custom API bots for notifications, task queues, and workflow automation.', 1),
  (2, 'hub',          'Backend Systems',        'Python and Node.js backends with clean APIs, D1/SQL persistence, and solid integration patterns.', 2),
  (3, 'cloud_sync',   'Cloud & Deployment',     'Cloudflare Workers/Pages deployments, CI/CD pipelines, and reliable cloud-native architectures.', 3),
  (4, 'code',         'Web Development',        'Full-stack web systems — from landing pages to admin panels — built clean and mobile-first.', 4),
  (5, 'settings_suggest', 'Technical Prototyping', 'Rapid prototypes for automation ideas, hardware-software interfaces, and proof-of-concept systems.', 5),
  (6, 'integration_instructions', 'API Integration', 'Connecting third-party services, building webhooks, and integrating complex APIs into clean backends.', 6);

-- ── Experience ────────────────────────────────────────────
INSERT OR IGNORE INTO experiences (id, badge_label, badge_type, icon, title, company, date_range, duration, location, bullet_points, tags, order_idx) VALUES
(1, 'Automation', 'lime', 'precision_manufacturing',
 'Automation Intern', 'Losung Automation Pvt. Ltd.',
 'May 2025 – Jun 2025', '2 Months', 'Mahipalpur, New Delhi · On-site',
 '["Worked in an industrial environment with <strong>electrical control panels</strong> and <strong>PLC-based systems</strong> on live production floors.",
   "Observed and documented <strong>system integration and testing workflows</strong> for complex automation setups.",
   "Gained hands-on exposure to <strong>control logic fundamentals</strong> applied in real industrial processes.",
   "Followed <strong>high-voltage safety protocols</strong> — developing awareness critical to industrial environments."]',
 '["Industrial Automation","Control Systems","PLC","Electrical Panels","Process Automation","System Testing"]',
 1),
(2, 'Electronics', 'ember', 'electrical_services',
 'Electronics Intern', 'Elent Electronics Private Limited',
 'Jan 2025 – Jan 2025', '1 Month', 'New Delhi · On-site',
 '["Industrial training focused on <strong>transformers and voltage stabilizers</strong> — from assembly to output testing.",
   "Observed <strong>wiring, assembly, and component testing</strong> processes in a manufacturing environment.",
   "Applied basic <strong>electrical troubleshooting techniques</strong> to identify and resolve faults."]',
 '["Electrical Systems","Power Distribution","Troubleshooting","Electronics"]',
 2);

-- ── Education ─────────────────────────────────────────────
INSERT OR IGNORE INTO education (id, period, degree, stream, school, grade, items, pills, order_idx) VALUES
(1, 'Apr 2025 – Apr 2026', 'Senior Secondary (Class 12)', 'PCM + Computer Science',
 'SBV Sarojini Nagar, Delhi', 'In Progress',
 '["Industrial Automation Internship (May–Jun 2025) at Losung Automation Pvt. Ltd.",
   "Electrical Systems Internship completed in Class 11",
   "PCM with Computer Science and Electronics Technology curriculum",
   "Real-world internship exposure through both Class 11 & 12"]',
 '["Python","Full-Stack Dev","Cloud Computing","Bot Development","Industrial Automation"]',
 1),
(2, 'Apr 2023 – Mar 2024', 'Secondary (SSC — Class 10)', 'General Education',
 'Atal Adarsh Vidyalaya Laxmi Bai Nagar, Delhi', '70.8%',
 '["Completed Secondary Education (Class X) successfully",
   "Best Five Subjects Percentage: 70.8%",
   "Foundational studies in Mathematics, Science, and Technology"]',
 '["HTML5","JavaScript","RDBMS","Microsoft Office","Problem Solving"]',
 2);

-- ── Projects ──────────────────────────────────────────────
INSERT OR IGNORE INTO projects (id, title, category, category_icon, summary, tags, stack, featured, github_url, order_idx) VALUES
(1,'Telegram Automation Bot','Bot Development','smart_toy',
 'Multi-feature Telegram bot that automates notifications, manages task queues, and integrates external APIs for real-time data delivery.',
 '["Bot","Automation","API"]','["Python","Telegram API","REST API","Automation"]',1,'https://github.com/gulshanhex',1),
(2,'Discord Notification System','Bot Development','notifications_active',
 'Discord bot for server automation — announcements, role management, scheduled tasks, and webhook integrations.',
 '["Bot","Discord","Automation"]','["Python","Discord.py","Webhooks","API Integration"]',1,'https://github.com/gulshanhex',2),
(3,'Industrial Dashboard Monitor','Web Application','dashboard',
 'Web-based monitoring dashboard for industrial automation data — real-time system health, alerts, and control panel status.',
 '["Web","Industrial","Dashboard"]','["HTML5","JavaScript","Python","Industrial Automation"]',0,NULL,3),
(4,'Cloud Automation Pipeline','Cloud & Backend','cloud_sync',
 'Automated cloud deployment and task scheduling pipeline using Python scripts and cloud computing fundamentals.',
 '["Cloud","Backend","Automation"]','["Python","Cloud Computing","Automation","Scripting"]',0,NULL,4),
(5,'PLC Logic Visualizer','Industrial Automation','memory',
 'Software interface for visualizing and testing PLC ladder logic sequences — developed during the Losung Automation internship.',
 '["Industrial","PLC","Tools"]','["Python","PLC Systems","Control Systems","Industrial"]',0,NULL,5),
(6,'API Integration Toolkit','Backend Development','integration_instructions',
 'Reusable Python toolkit for rapid API integration — handles auth flows, rate limiting, response parsing, and retry logic.',
 '["Backend","API","Tools"]','["Python","API Integration","REST APIs","Full-Stack"]',0,NULL,6);

-- ── Proof Items ───────────────────────────────────────────
INSERT OR IGNORE INTO proof_items (id, type, name, subtitle, logo_url, url, order_idx) VALUES
(1,'org','Losung Automation Pvt. Ltd.','Industrial Automation','https://ui-avatars.com/api/?name=LA&background=0b1209&color=8ecf00&size=64&bold=true','#',1),
(2,'org','Elent Electronics Pvt. Ltd.','Electronics Manufacturing','https://ui-avatars.com/api/?name=EE&background=0b1209&color=8ecf00&size=64&bold=true','#',2),
(3,'org','SBV Sarojini Nagar','Education Institution','https://ui-avatars.com/api/?name=SBV&background=0b1209&color=8ecf00&size=64&bold=true','#',3),
(4,'org','Atal Adarsh Vidyalaya','Education Institution','https://ui-avatars.com/api/?name=AAV&background=0b1209&color=8ecf00&size=64&bold=true','#',4);

INSERT OR IGNORE INTO proof_items (id, type, name, subtitle, logo_url, testimonial_text, testimonial_rating, order_idx) VALUES
(5,'testimonial','Rajiv Sharma','Senior Engineer · Losung Automation Pvt. Ltd.',
 'https://ui-avatars.com/api/?name=Rajiv+Sharma&background=111c11&color=8ecf00&size=80&bold=true',
 'Gulshan showed exceptional curiosity and discipline during his internship. He quickly adapted to our industrial environment and asked the right questions — a rare quality in someone so early in their career.',5,5),
(6,'testimonial','Priya Nair','Technical Trainer · Elent Electronics Pvt. Ltd.',
 'https://ui-avatars.com/api/?name=Priya+Nair&background=111c11&color=8ecf00&size=80&bold=true',
 'In just one month, Gulshan demonstrated a strong grasp of transformer assembly and electrical troubleshooting. He was methodical, safety-conscious, and always willing to understand the why behind each process.',5,6);
