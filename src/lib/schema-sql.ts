// ── Schema & Default Seed Data Module ─────────────────────────────────────
// Provides SQL schema initialization, safe migrations for existing D1 DBs,
// and default fallback data (used ONLY when DB binding is undefined in local dev).

import { DEFAULT_UI_MAP } from './ui-strings';

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT(datetime('now')),
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS admin_sessions(
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT(datetime('now')),
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS login_attempts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  username TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS site_settings(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS sections(
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS skills(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'code',
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS skill_pills(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_hot INTEGER NOT NULL DEFAULT 0,
  order_idx INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS services(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT NOT NULL DEFAULT 'build',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  slug TEXT,
  long_description TEXT,
  features TEXT NOT NULL DEFAULT '[]',
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS experiences(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_label TEXT NOT NULL,
  badge_type TEXT NOT NULL DEFAULT 'lime',
  icon TEXT NOT NULL DEFAULT 'work',
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  date_range TEXT NOT NULL,
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  bullet_points TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS education(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period TEXT NOT NULL,
  degree TEXT NOT NULL,
  stream TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'In Progress',
  items TEXT NOT NULL DEFAULT '[]',
  pills TEXT NOT NULL DEFAULT '[]',
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS projects(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_icon TEXT NOT NULL DEFAULT 'folder',
  summary TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  stack TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'completed',
  featured INTEGER NOT NULL DEFAULT 0,
  external_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  slug TEXT,
  problem TEXT,
  solution TEXT,
  result TEXT,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS proof_items(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'org',
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  logo_url TEXT,
  url TEXT,
  testimonial_text TEXT,
  testimonial_rating INTEGER DEFAULT 5,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS faqs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS contact_submissions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT(datetime('now')),
  read INTEGER NOT NULL DEFAULT 0,
  ip TEXT
);
CREATE TABLE IF NOT EXISTS audit_log(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip,attempted_at);
CREATE INDEX IF NOT EXISTS idx_pills_skill ON skill_pills(skill_id);
CREATE INDEX IF NOT EXISTS idx_proj_ord ON projects(order_idx);
CREATE INDEX IF NOT EXISTS idx_faqs_ord ON faqs(order_idx);
CREATE INDEX IF NOT EXISTS idx_subs_read ON contact_submissions(read,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;
`;

export const DEFAULT_SETTINGS: Record<string, any> = {
  global: {
    name: 'Your Name',
    site_name: 'Portfolio',
    tagline: 'Automation & AI Systems Engineer',
    domain: 'https://example.com',
    portfolio: 'https://portfolio.example.com',
    projects_subdomain: 'https://projects.example.com',
    location: 'Remote',
    footer_text: 'Built by <strong>Your Name</strong>',
    footer_links: [
      { label: 'Work Archive', url: '/work' },
      { label: 'LLMs.txt', url: '/llms.txt' },
      { label: 'Sitemap', url: '/sitemap.xml' },
    ],
  },
  hero: {
    headline: 'I build bots & automation that run your business',
    subheadline:
      'From custom AI workflows to automated scaling—I architect system integrations that eliminate manual work.',
    show_visual: true,
    visual_variant: 'chat+chart',
    headline_line1: 'YOUR',
    headline_line2: 'NAME',
    role_text:
      '<strong>Automation & AI Systems</strong> engineer crafting intelligent backends, bots & <em>real-world control systems</em>',
    status_label: 'Available for projects',
    status_chip: 'OPEN TO WORK',
    cta_primary_label: 'Start a project',
    cta_primary_url: '#contact',
    cta_secondary_label: 'View work',
    cta_secondary_url: '#projects',
    resume_label: 'Resume',
    quick_stats: [
      { value: '2+', label: 'Internships', desc: 'Hands-on in real production environments' },
      { value: '20+', label: 'Technical Skills', desc: 'Python, bots, PLC, cloud, web, and more' },
      { value: '3 mo', label: 'Field Experience', desc: 'Solving real engineering problems in industrial environments' },
    ],
  },
  about: {
    paragraphs: [
      'I build and explore <strong>intelligent automation and software systems</strong> — bridging the gap between physical hardware and digital infrastructure with equal curiosity for both worlds.',
      'From backend automation tools, Telegram bots and Discord bots to working hands-on with <em>industrial control panels and PLC-based systems</em> — I thrive where software meets the real world.',
      'Deeply curious about how systems work — from industrial control panels to cloud architectures — always focused on creating things that <strong>improve efficiency and functionality</strong>.',
    ],
    quote: 'Always Learning. Always Building.',
  },
  copy: {
    about_eyebrow: '// ABOUT ME',
    about_title: 'Who am I?',
    about_subtitle: 'Engineering intelligent software that interfaces with the physical and digital world.',
    services_eyebrow: '// SERVICES',
    services_title: 'What I can do for you.',
    services_subtitle: 'Tailored automation, integration, and intelligence for your business.',
    skills_eyebrow: '// SKILLS',
    skills_title: 'What I work with.',
    skills_subtitle: 'A curated set of tools, languages, and systems built through production environments and hands-on engineering.',
    experience_eyebrow: '// EXPERIENCE',
    experience_title: "Where I've engineered.",
    education_eyebrow: '// EDUCATION',
    education_title: 'Where I learned.',
    projects_eyebrow: '// SELECTED WORK',
    projects_title: 'What I built.',
    projects_subtitle: 'Production bots, monitoring dashboards, and automation toolkits.',
    proof_eyebrow: '// TESTIMONIALS',
    faq_eyebrow: '// QUICK ANSWERS',
    faq_title: 'Frequently asked questions.',
    faq_subtitle: 'Direct answers regarding engineering background, automation experience, and availability.',
    contact_eyebrow: "// LET'S CONNECT",
    contact_title: 'Get in touch.',
    contact_subtitle: "Tell me what you're working on. Open to automation workflows, backend architecture, and custom bots.",
  },
  contact: {
    email: 'hello@example.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    main_site: 'https://example.com',
    portfolio: 'https://portfolio.example.com',
    resume_url: '',
    intro_text:
      "Open to internships, freelance projects, collaborations, and anything interesting. If you are building something with automation, AI, or backend systems — let's talk.",
    form_enabled: true,
    availability_badge: 'Available for projects',
    availability_visible: true,
  },
  seo: {
    title: 'Your Name — Automation & AI Systems Engineer | Python, Bots, PLC & Cloud',
    description:
      'Official portfolio of an Automation & AI Systems Engineer specializing in Python backends, Telegram & Discord bots, PLC industrial automation, and Cloudflare edge systems.',
    keywords:
      'Automation Engineer, AI Systems Engineer, Python Developer, Telegram Bot Developer, Discord Bot Developer, PLC Systems, Industrial Automation, Cloudflare Workers, Backend Engineer',
    og_title: 'Your Name — Automation & AI Systems Engineer',
    og_description:
      'Explore projects, industrial automation experience, Python bots, and cloud systems.',
    og_image: 'https://portfolio.example.com/og-image.png',
    canonical: 'https://portfolio.example.com',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    json_ld_enabled: true,
    reviews_jsonld: false,
  },
  theme: {
    default: 'dark',
    accent: 'emerald',
    user_toggle_enabled: true,
    glow_intensity: 'subtle',
    stars_enabled: false,
    stars_count: 80,
    noise_enabled: false,
    scanlines_enabled: false,
    neon_intensity: 'subtle',
  },
  nav: {
    show_resume: true,
    resume_label: 'Resume',
    items: ['about', 'services', 'skills', 'experience', 'education', 'projects', 'proof', 'faq', 'contact'],
  },
  proof_section: {
    section_title: 'Testimonials',
    orgs_title: "Who I've worked with",
    orgs_subtitle: 'Organizations and environments that shaped my work.',
    testimonials_title: 'What People Say',
    show_orgs: true,
    show_testimonials: true,
  },
  ui: { ...DEFAULT_UI_MAP },
};

export const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero', order_idx: 1, visible: 1 },
  { id: 'about', label: 'About', order_idx: 2, visible: 1 },
  { id: 'services', label: 'Services', order_idx: 3, visible: 1 },
  { id: 'skills', label: 'Skills', order_idx: 4, visible: 1 },
  { id: 'experience', label: 'Experience', order_idx: 5, visible: 1 },
  { id: 'education', label: 'Education', order_idx: 6, visible: 1 },
  { id: 'projects', label: 'Work', order_idx: 7, visible: 1 },
  { id: 'proof', label: 'Testimonials', order_idx: 8, visible: 1 },
  { id: 'faq', label: 'FAQ', order_idx: 9, visible: 1 },
  { id: 'contact', label: 'Contact', order_idx: 10, visible: 1 },
];

export const DEFAULT_SKILLS = [
  {
    id: 1,
    label: 'Programming',
    icon: 'code',
    order_idx: 1,
    visible: 1,
    pills: [
      { id: 1, skill_id: 1, label: 'Python', is_hot: 1, order_idx: 1 },
      { id: 2, skill_id: 1, label: 'JavaScript', is_hot: 1, order_idx: 2 },
      { id: 3, skill_id: 1, label: 'HTML5', is_hot: 0, order_idx: 3 },
      { id: 4, skill_id: 1, label: 'SQL / RDBMS', is_hot: 0, order_idx: 4 },
      { id: 5, skill_id: 1, label: 'Bash (Basic)', is_hot: 0, order_idx: 5 },
    ],
  },
  {
    id: 2,
    label: 'Web & Backend',
    icon: 'hub',
    order_idx: 2,
    visible: 1,
    pills: [
      { id: 6, skill_id: 2, label: 'Full-Stack Dev', is_hot: 1, order_idx: 1 },
      { id: 7, skill_id: 2, label: 'API Integration', is_hot: 1, order_idx: 2 },
      { id: 8, skill_id: 2, label: 'Bot Development', is_hot: 1, order_idx: 3 },
      { id: 9, skill_id: 2, label: 'Telegram Bots', is_hot: 0, order_idx: 4 },
      { id: 10, skill_id: 2, label: 'Discord Bots', is_hot: 0, order_idx: 5 },
      { id: 11, skill_id: 2, label: 'REST APIs', is_hot: 0, order_idx: 6 },
    ],
  },
  {
    id: 3,
    label: 'Cloud & Systems',
    icon: 'cloud',
    order_idx: 3,
    visible: 1,
    pills: [
      { id: 12, skill_id: 3, label: 'Cloud Computing', is_hot: 1, order_idx: 1 },
      { id: 13, skill_id: 3, label: 'Cloudflare Workers', is_hot: 1, order_idx: 2 },
      { id: 14, skill_id: 3, label: 'System Testing', is_hot: 0, order_idx: 3 },
      { id: 15, skill_id: 3, label: 'CS Fundamentals', is_hot: 0, order_idx: 4 },
      { id: 16, skill_id: 3, label: 'Linux (Basic)', is_hot: 0, order_idx: 5 },
    ],
  },
  {
    id: 4,
    label: 'Industrial Automation',
    icon: 'settings_suggest',
    order_idx: 4,
    visible: 1,
    pills: [
      { id: 17, skill_id: 4, label: 'Industrial Automation', is_hot: 1, order_idx: 1 },
      { id: 18, skill_id: 4, label: 'PLC Systems', is_hot: 1, order_idx: 2 },
      { id: 19, skill_id: 4, label: 'Control Systems', is_hot: 1, order_idx: 3 },
      { id: 20, skill_id: 4, label: 'Process Automation', is_hot: 0, order_idx: 4 },
      { id: 21, skill_id: 4, label: 'Electrical Panels', is_hot: 0, order_idx: 5 },
      { id: 22, skill_id: 4, label: 'HV Safety Protocols', is_hot: 0, order_idx: 6 },
    ],
  },
  {
    id: 5,
    label: 'Electrical Systems',
    icon: 'bolt',
    order_idx: 5,
    visible: 1,
    pills: [
      { id: 23, skill_id: 5, label: 'Electronics Fundamentals', is_hot: 1, order_idx: 1 },
      { id: 24, skill_id: 5, label: 'Power Distribution', is_hot: 0, order_idx: 2 },
      { id: 25, skill_id: 5, label: 'Electrical Troubleshooting', is_hot: 0, order_idx: 3 },
      { id: 26, skill_id: 5, label: 'Transformers', is_hot: 0, order_idx: 4 },
      { id: 27, skill_id: 5, label: 'Voltage Stabilizers', is_hot: 0, order_idx: 5 },
      { id: 28, skill_id: 5, label: 'Wiring & Assembly', is_hot: 0, order_idx: 6 },
    ],
  },
  {
    id: 6,
    label: 'Analytical Skills',
    icon: 'psychology',
    order_idx: 6,
    visible: 1,
    pills: [
      { id: 29, skill_id: 6, label: 'Problem Solving', is_hot: 1, order_idx: 1 },
      { id: 30, skill_id: 6, label: 'Analytical Thinking', is_hot: 1, order_idx: 2 },
      { id: 31, skill_id: 6, label: 'Strategy', is_hot: 0, order_idx: 3 },
      { id: 32, skill_id: 6, label: 'System Integration', is_hot: 0, order_idx: 4 },
      { id: 33, skill_id: 6, label: 'Workflow Optimization', is_hot: 0, order_idx: 5 },
    ],
  },
];

export const DEFAULT_SERVICES = [
  {
    id: 1,
    icon: 'smart_toy',
    title: 'Automation Bots',
    slug: 'automation-bots',
    description: 'Telegram, Discord, and custom API bots for notifications, task queues, and workflow automation.',
    long_description: 'Custom, high-reliability bots designed for real-time dispatch, webhook processing, task queues, and system alerts. Architected with asynchronous event handling and edge persistence.',
    features: ['Webhook-driven command handling', 'Queue and alert dispatching', 'Role-based access permissions', 'Cloudflare Workers & D1 persistence'],
    cta_label: null,
    cta_url: null,
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    icon: 'hub',
    title: 'Backend Systems',
    slug: 'backend-systems',
    description: 'Python and Node.js backends with clean APIs, D1/SQL persistence, and solid integration patterns.',
    long_description: 'Robust backend architectures engineered for performance, structured data persistence, and secure communication across microservices and external APIs.',
    features: ['RESTful & serverless API design', 'D1 & SQLite schema modeling', 'Secure authentication & token validation', 'Structured error handling & logging'],
    cta_label: null,
    cta_url: null,
    order_idx: 2,
    visible: 1,
  },
  {
    id: 3,
    icon: 'cloud_sync',
    title: 'Cloud & Deployment',
    slug: 'cloud-deployment',
    description: 'Cloudflare Workers/Pages deployments, CI/CD pipelines, and reliable cloud-native architectures.',
    long_description: 'Modern edge deployments that eliminate infrastructure management overhead. Global edge delivery with sub-second response times and automated deployment scripts.',
    features: ['Serverless Cloudflare Worker setups', 'D1 database binding & migrations', 'Edge asset routing & caching', 'Environment secrets management'],
    cta_label: null,
    cta_url: null,
    order_idx: 3,
    visible: 1,
  },
  {
    id: 4,
    icon: 'code',
    title: 'Web Development',
    slug: 'web-development',
    description: 'Full-stack web systems — from landing pages to admin panels — built clean and mobile-first.',
    long_description: 'High-performance web applications focused on semantic HTML, accessible UI components, zero layout shifts, and fast loading across mobile and desktop devices.',
    features: ['Responsive mobile-first interfaces', 'Theme customization & WCAG AA standards', 'Progressive enhancement & offline support', 'Clean administrative management panels'],
    cta_label: null,
    cta_url: null,
    order_idx: 4,
    visible: 1,
  },
  {
    id: 5,
    icon: 'settings_suggest',
    title: 'Technical Prototyping',
    slug: 'technical-prototyping',
    description: 'Rapid prototypes for automation ideas, hardware-software interfaces, and proof-of-concept systems.',
    long_description: 'Hands-on technical proof-of-concept development bridging digital software with physical hardware, telemetry sensors, and control system logic.',
    features: ['Hardware-to-software integration', 'PLC ladder logic visual testing', 'Telemetry monitor mockups', 'Rapid iterative proof-of-concept validation'],
    cta_label: null,
    cta_url: null,
    order_idx: 5,
    visible: 1,
  },
  {
    id: 6,
    icon: 'integration_instructions',
    title: 'API Integration',
    slug: 'api-integration',
    description: 'Connecting third-party services, building webhooks, and integrating complex APIs into clean backends.',
    long_description: 'Unified integration layers connecting payment webhooks, messaging APIs, databases, and third-party SaaS platforms with exponential retry mechanisms.',
    features: ['Custom webhook receivers', 'Data transformation & serialization', 'Rate limiting & exponential backoff', 'Audit logging & telemetry tracking'],
    cta_label: null,
    cta_url: null,
    order_idx: 6,
    visible: 1,
  },
];

export const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    badge_label: 'Automation',
    badge_type: 'lime',
    icon: 'precision_manufacturing',
    title: 'Automation Intern',
    company: 'Industrial Automation Lab',
    date_range: 'May 2025 – Jun 2025',
    duration: '2 Months',
    location: 'On-site',
    bullet_points: [
      'Worked in an industrial environment with <strong>electrical control panels</strong> and <strong>PLC-based systems</strong> on live production floors.',
      'Observed and documented <strong>system integration and testing workflows</strong> for complex automation setups.',
      'Gained hands-on exposure to <strong>control logic fundamentals</strong> applied in real industrial processes.',
      'Followed <strong>high-voltage safety protocols</strong> — developing awareness critical to industrial environments.',
    ],
    tags: ['Industrial Automation', 'Control Systems', 'PLC', 'Electrical Panels', 'Process Automation', 'System Testing'],
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    badge_label: 'Electronics',
    badge_type: 'ember',
    icon: 'electrical_services',
    title: 'Electronics Intern',
    company: 'Electronics Manufacturing Division',
    date_range: 'Jan 2025 – Jan 2025',
    duration: '1 Month',
    location: 'On-site',
    bullet_points: [
      'Industrial training focused on <strong>transformers and voltage stabilizers</strong> — from assembly to output testing.',
      'Observed <strong>wiring, assembly, and component testing</strong> processes in a manufacturing environment.',
      'Applied basic <strong>electrical troubleshooting techniques</strong> to identify and resolve faults.',
    ],
    tags: ['Electrical Systems', 'Power Distribution', 'Troubleshooting', 'Electronics'],
    order_idx: 2,
    visible: 1,
  },
];

export const DEFAULT_EDUCATION = [
  {
    id: 1,
    period: '2025 – 2026',
    degree: 'Senior Secondary (Class 12)',
    stream: 'PCM + Computer Science',
    school: 'Senior Secondary School',
    grade: 'In Progress',
    items: [
      'Industrial Automation Internship (May–Jun 2025)',
      'Electrical Systems Internship completed in Class 11',
      'PCM with Computer Science and Electronics Technology curriculum',
      'Real-world internship exposure through both Class 11 & 12',
    ],
    pills: ['Python', 'Full-Stack Dev', 'Cloud Computing', 'Bot Development', 'Industrial Automation'],
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    period: '2023 – 2024',
    degree: 'Secondary (SSC — Class 10)',
    stream: 'General Education',
    school: 'Secondary School',
    grade: 'Completed',
    items: [
      'Completed Secondary Education (Class X) successfully',
      'Foundational studies in Mathematics, Science, and Technology',
    ],
    pills: ['HTML5', 'JavaScript', 'RDBMS', 'Problem Solving'],
    order_idx: 2,
    visible: 1,
  },
];

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: 'Telegram Automation Bot',
    slug: 'telegram-automation-bot',
    problem: '',
    solution: '',
    result: '',
    category: 'Bot Development',
    category_icon: 'smart_toy',
    summary:
      'Multi-feature Telegram bot that automates notifications, manages task queues, and integrates external APIs for real-time data delivery.',
    tags: ['Bot', 'Automation', 'API'],
    stack: ['Python', 'Telegram API', 'REST API', 'Automation'],
    status: 'completed',
    featured: 1,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    title: 'Discord Notification System',
    slug: 'discord-notification-system',
    problem: '',
    solution: '',
    result: '',
    category: 'Bot Development',
    category_icon: 'notifications_active',
    summary:
      'Discord bot for server automation — announcements, role management, scheduled tasks, and webhook integrations.',
    tags: ['Bot', 'Discord', 'Automation'],
    stack: ['Python', 'Discord.py', 'Webhooks', 'API Integration'],
    status: 'completed',
    featured: 1,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 2,
    visible: 1,
  },
  {
    id: 3,
    title: 'Industrial Dashboard Monitor',
    slug: 'industrial-dashboard-monitor',
    problem: '',
    solution: '',
    result: '',
    category: 'Web Application',
    category_icon: 'dashboard',
    summary:
      'Web-based monitoring dashboard for industrial automation data — real-time system health, alerts, and control panel status.',
    tags: ['Web', 'Industrial', 'Dashboard'],
    stack: ['HTML5', 'JavaScript', 'Python', 'Industrial Automation'],
    status: 'completed',
    featured: 0,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 3,
    visible: 1,
  },
  {
    id: 4,
    title: 'Cloud Automation Pipeline',
    slug: 'cloud-automation-pipeline',
    problem: '',
    solution: '',
    result: '',
    category: 'Cloud & Backend',
    category_icon: 'cloud_sync',
    summary:
      'Automated cloud deployment and task scheduling pipeline using Python scripts and cloud computing fundamentals.',
    tags: ['Cloud', 'Backend', 'Automation'],
    stack: ['Python', 'Cloud Computing', 'Automation', 'Scripting'],
    status: 'completed',
    featured: 0,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 4,
    visible: 1,
  },
  {
    id: 5,
    title: 'PLC Logic Visualizer',
    slug: 'plc-logic-visualizer',
    problem: '',
    solution: '',
    result: '',
    category: 'Industrial Automation',
    category_icon: 'memory',
    summary:
      'Software interface for visualizing and testing PLC ladder logic sequences during industrial automation training.',
    tags: ['Industrial', 'PLC', 'Tools'],
    stack: ['Python', 'PLC Systems', 'Control Systems', 'Industrial'],
    status: 'completed',
    featured: 0,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 5,
    visible: 1,
  },
  {
    id: 6,
    title: 'API Integration Toolkit',
    slug: 'api-integration-toolkit',
    problem: '',
    solution: '',
    result: '',
    category: 'Backend Development',
    category_icon: 'integration_instructions',
    summary:
      'Reusable Python toolkit for rapid API integration — handles auth flows, rate limiting, response parsing, and retry logic.',
    tags: ['Backend', 'API', 'Tools'],
    stack: ['Python', 'API Integration', 'REST APIs', 'Full-Stack'],
    status: 'completed',
    featured: 0,
    external_url: null,
    github_url: null,
    demo_url: null,
    image_url: null,
    order_idx: 6,
    visible: 1,
  },
];

export const DEFAULT_PROOF = [
  {
    id: 1,
    type: 'org',
    name: 'Industrial Automation Lab',
    subtitle: 'Industrial Automation',
    logo_url: null,
    url: '#',
    testimonial_text: null,
    testimonial_rating: 5,
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    type: 'org',
    name: 'Electronics Manufacturing',
    subtitle: 'Power & Control Systems',
    logo_url: null,
    url: '#',
    testimonial_text: null,
    testimonial_rating: 5,
    order_idx: 2,
    visible: 1,
  },
  {
    id: 3,
    type: 'org',
    name: 'Computer Science Academy',
    subtitle: 'Education Institution',
    logo_url: null,
    url: '#',
    testimonial_text: null,
    testimonial_rating: 5,
    order_idx: 3,
    visible: 1,
  },
];

export const DEFAULT_FAQS = [
  {
    id: 1,
    question: 'What areas of engineering do you specialize in?',
    answer:
      'I specialize in building <strong>Python backend systems</strong>, Telegram and Discord automation bots, REST API integrations, Cloudflare Workers edge applications, and industrial PLC control systems.',
    order_idx: 1,
    visible: 1,
  },
  {
    id: 2,
    question: 'What hands-on industrial and engineering experience do you have?',
    answer:
      'I have completed hands-on engineering internships working with <strong>PLC-based systems</strong>, electrical control panels, system testing on live production floors, transformers, voltage stabilizers, and electrical troubleshooting.',
    order_idx: 2,
    visible: 1,
  },
  {
    id: 3,
    question: 'What software and automation services do you offer?',
    answer:
      'I build custom Telegram and Discord bots, backend APIs with Python/JavaScript and SQL/D1 databases, cloud-native deployments on Cloudflare Workers, full-stack web dashboards, and rapid hardware-software technical prototypes.',
    order_idx: 3,
    visible: 1,
  },
  {
    id: 4,
    question: 'Are you available for internships, freelance projects, or collaborations?',
    answer:
      'Yes, I am actively open to internships, freelance automation and backend projects, and technical collaborations. Use the contact section below to get in touch directly.',
    order_idx: 4,
    visible: 1,
  },
];

/**
 * One-time, lazy, idempotent label & copy migration behind a settings flag.
 * Replaces ONLY values that still equal the old v1/v2 defaults; never overwrites user edits.
 */
export async function runLazyLabelMigrations(db: D1Database): Promise<void> {
  try {
    const flagRow = await db
      .prepare("SELECT value FROM site_settings WHERE key = '_migrations'")
      .first<{ value: string }>()
      .catch(() => null);
    if (flagRow?.value) {
      try {
        const parsed = JSON.parse(flagRow.value);
        if (parsed?.v3_labels_v1) return;
      } catch {}
    }

    // 1. Section labels migration (ONLY when equal to old defaults)
    const sectionReplacements: Array<[string, string, string]> = [
      ['services', 'What I Do', 'Services'],
      ['skills', 'Tech Arsenal', 'Skills'],
      ['projects', 'Projects', 'Work'],
      ['proof', 'Proof & Context', 'Testimonials'],
    ];
    for (const [secId, oldLabel, newLabel] of sectionReplacements) {
      await db
        .prepare('UPDATE sections SET label = ? WHERE id = ? AND label = ?')
        .bind(newLabel, secId, oldLabel)
        .run()
        .catch(() => {});
    }

    // Check if there are visible projects
    const projCountRow = await db
      .prepare('SELECT COUNT(*) as n FROM projects WHERE visible = 1')
      .first<{ n: number }>()
      .catch(() => ({ n: 1 }));
    const hasVisibleProjects = (projCountRow?.n ?? 1) > 0;

    // 2. Hero settings migration (ONLY when equal to old defaults)
    const heroSettingRow = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'hero'")
      .first<{ value: string }>()
      .catch(() => null);
    if (heroSettingRow?.value) {
      try {
        const heroVal = JSON.parse(heroSettingRow.value);
        let changed = false;
        if (heroVal.cta_primary_label === 'View Projects' && heroVal.cta_primary_url === '#projects') {
          heroVal.cta_primary_label = 'Start a project';
          heroVal.cta_primary_url = '#contact';
          changed = true;
        }
        if (heroVal.cta_secondary_label === 'Get In Touch') {
          heroVal.cta_secondary_label = hasVisibleProjects ? 'View work' : 'See services';
          if (heroVal.cta_secondary_url === '#contact') {
            heroVal.cta_secondary_url = hasVisibleProjects ? '#projects' : '#services';
          }
          changed = true;
        }
        if (heroVal.status_label === 'Available for Opportunities') {
          heroVal.status_label = 'Available for projects';
          changed = true;
        }
        if (changed) {
          await db
            .prepare("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'hero'")
            .bind(JSON.stringify(heroVal))
            .run()
            .catch(() => {});
        }
      } catch {}
    }

    // 3. Copy eyebrows migration (ONLY when equal to old defaults)
    const copySettingRow = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'copy'")
      .first<{ value: string }>()
      .catch(() => null);
    if (copySettingRow?.value) {
      try {
        const copyVal = JSON.parse(copySettingRow.value);
        let changed = false;
        if (copyVal.skills_eyebrow === '// TECH ARSENAL') {
          copyVal.skills_eyebrow = '// SKILLS';
          changed = true;
        }
        if (copyVal.proof_eyebrow === '// PROOF & CONTEXT') {
          copyVal.proof_eyebrow = '// TESTIMONIALS';
          changed = true;
        }
        if (copyVal.experience_eyebrow === '// WORK HISTORY') {
          copyVal.experience_eyebrow = '// EXPERIENCE';
          changed = true;
        }
        if (changed) {
          await db
            .prepare("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'copy'")
            .bind(JSON.stringify(copyVal))
            .run()
            .catch(() => {});
        }
      } catch {}
    }

    // 4. Proof section heading case migration (ONLY when equal to old defaults)
    const proofSettingRow = await db
      .prepare("SELECT value FROM site_settings WHERE key = 'proof_section'")
      .first<{ value: string }>()
      .catch(() => null);
    if (proofSettingRow?.value) {
      try {
        const proofVal = JSON.parse(proofSettingRow.value);
        let changed = false;
        if (proofVal.orgs_title === "WHO I'VE WORKED WITH") {
          proofVal.orgs_title = "Who I've worked with";
          changed = true;
        }
        if (proofVal.section_title === 'Proof & Context') {
          proofVal.section_title = 'Testimonials';
          changed = true;
        }
        if (changed) {
          await db
            .prepare("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = 'proof_section'")
            .bind(JSON.stringify(proofVal))
            .run()
            .catch(() => {});
        }
      } catch {}
    }

    // Mark migration complete
    await db
      .prepare(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ('_migrations', '{"v3_labels_v1":true}', datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run()
      .catch(() => {});
  } catch {}
}

/**
 * Ensures all tables, columns, and indexes exist.
 * Safe to run on both fresh and initialized databases (idempotent, never deletes data).
 */
export async function ensureDatabaseSchema(db: D1Database): Promise<void> {
  const statements = SCHEMA_SQL.split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sql of statements) {
    await db.prepare(sql).run().catch(() => {});
  }

  // Safe migrations for existing databases
  const migrations = [
    'ALTER TABLE admin_users ADD COLUMN totp_secret TEXT',
    'ALTER TABLE admin_users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE services ADD COLUMN slug TEXT',
    'ALTER TABLE services ADD COLUMN long_description TEXT',
    "ALTER TABLE services ADD COLUMN features TEXT NOT NULL DEFAULT '[]'",
    'ALTER TABLE projects ADD COLUMN slug TEXT',
    'ALTER TABLE projects ADD COLUMN problem TEXT',
    'ALTER TABLE projects ADD COLUMN solution TEXT',
    'ALTER TABLE projects ADD COLUMN result TEXT',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE slug IS NOT NULL',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL',
  ];

  for (const mig of migrations) {
    await db.prepare(mig).run().catch(() => {});
  }

  // Ensure faq section exists in sections table on initialized DBs
  await db
    .prepare('INSERT OR IGNORE INTO sections (id, label, order_idx, visible) VALUES (?, ?, ?, ?)')
    .bind('faq', 'FAQ', 9, 1)
    .run()
    .catch(() => {});

  // Run one-time lazy label and copy migrations behind flag
  await runLazyLabelMigrations(db);

  // Idempotently backfill missing slugs for services
  try {
    const svcs = await db.prepare("SELECT id, title FROM services WHERE slug IS NULL OR slug = ''").all<any>();
    for (const s of svcs.results || []) {
      if (s.title) {
        const sSlug = s.title
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        if (sSlug) {
          await db.prepare('UPDATE services SET slug = ? WHERE id = ?').bind(sSlug, s.id).run().catch(() => {});
        }
      }
    }
  } catch {}

  // Idempotently backfill missing slugs for projects
  try {
    const projs = await db.prepare("SELECT id, title FROM projects WHERE slug IS NULL OR slug = ''").all<any>();
    for (const p of projs.results || []) {
      if (p.title) {
        const pSlug = p.title
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        if (pSlug) {
          await db.prepare('UPDATE projects SET slug = ? WHERE id = ?').bind(pSlug, p.id).run().catch(() => {});
        }
      }
    }
  } catch {}
}

/**
 * Seeds content tables ONLY on fresh installations.
 */
export async function seedInitialContent(db: D1Database): Promise<void> {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db
      .prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)')
      .bind(key, JSON.stringify(value))
      .run();
  }

  for (const sec of DEFAULT_SECTIONS) {
    await db
      .prepare('INSERT OR IGNORE INTO sections (id, label, order_idx, visible) VALUES (?, ?, ?, ?)')
      .bind(sec.id, sec.label, sec.order_idx, sec.visible)
      .run();
  }

  for (const sk of DEFAULT_SKILLS) {
    await db
      .prepare('INSERT OR IGNORE INTO skills (id, label, icon, order_idx, visible) VALUES (?, ?, ?, ?, ?)')
      .bind(sk.id, sk.label, sk.icon, sk.order_idx, sk.visible)
      .run();
    for (const p of sk.pills) {
      await db
        .prepare('INSERT OR IGNORE INTO skill_pills (id, skill_id, label, is_hot, order_idx) VALUES (?, ?, ?, ?, ?)')
        .bind(p.id, sk.id, p.label, p.is_hot, p.order_idx)
        .run();
    }
  }

  for (const svc of DEFAULT_SERVICES) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO services (id, icon, title, description, cta_label, cta_url, slug, long_description, features, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        svc.id,
        svc.icon,
        svc.title,
        svc.description,
        svc.cta_label,
        svc.cta_url,
        svc.slug,
        svc.long_description,
        JSON.stringify(svc.features),
        svc.order_idx,
        svc.visible
      )
      .run();
  }

  for (const xp of DEFAULT_EXPERIENCES) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO experiences (id, badge_label, badge_type, icon, title, company, date_range, duration, location, bullet_points, tags, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        xp.id,
        xp.badge_label,
        xp.badge_type,
        xp.icon,
        xp.title,
        xp.company,
        xp.date_range,
        xp.duration,
        xp.location,
        JSON.stringify(xp.bullet_points),
        JSON.stringify(xp.tags),
        xp.order_idx,
        xp.visible
      )
      .run();
  }

  for (const ed of DEFAULT_EDUCATION) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO education (id, period, degree, stream, school, grade, items, pills, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        ed.id,
        ed.period,
        ed.degree,
        ed.stream,
        ed.school,
        ed.grade,
        JSON.stringify(ed.items),
        JSON.stringify(ed.pills),
        ed.order_idx,
        ed.visible
      )
      .run();
  }

  for (const pr of DEFAULT_PROJECTS) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO projects (id, title, category, category_icon, summary, tags, stack, status, featured, external_url, github_url, demo_url, image_url, slug, problem, solution, result, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        pr.id,
        pr.title,
        pr.category,
        pr.category_icon,
        pr.summary,
        JSON.stringify(pr.tags),
        JSON.stringify(pr.stack),
        pr.status,
        pr.featured,
        pr.external_url,
        pr.github_url,
        pr.demo_url,
        pr.image_url,
        pr.slug,
        pr.problem,
        pr.solution,
        pr.result,
        pr.order_idx,
        pr.visible
      )
      .run();
  }

  for (const pf of DEFAULT_PROOF) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO proof_items (id, type, name, subtitle, logo_url, url, testimonial_text, testimonial_rating, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        pf.id,
        pf.type,
        pf.name,
        pf.subtitle,
        pf.logo_url,
        pf.url,
        pf.testimonial_text,
        pf.testimonial_rating,
        pf.order_idx,
        pf.visible
      )
      .run();
  }

  for (const fq of DEFAULT_FAQS) {
    await db
      .prepare('INSERT OR IGNORE INTO faqs (id, question, answer, order_idx, visible) VALUES (?, ?, ?, ?, ?)')
      .bind(fq.id, fq.question, fq.answer, fq.order_idx, fq.visible)
      .run();
  }
}

/**
 * Backward compatibility wrapper.
 * On fresh install (no admin users yet), seeds initial content.
 * On an initialized DB, only runs schema migrations and seeds tables that didn't exist before (faqs).
 */
export async function initializeDatabaseSchemaAndSeed(db: D1Database): Promise<void> {
  await ensureDatabaseSchema(db);
  const users = await db.prepare('SELECT COUNT(*) as n FROM admin_users').first<{ n: number }>().catch(() => null);
  if (!users || users.n === 0) {
    await seedInitialContent(db);
  } else {
    // Only seed tables that did not exist before this run (i.e. faqs)
    const faqCount = await db.prepare('SELECT COUNT(*) as n FROM faqs').first<{ n: number }>().catch(() => null);
    if (!faqCount || faqCount.n === 0) {
      for (const fq of DEFAULT_FAQS) {
        await db
          .prepare('INSERT OR IGNORE INTO faqs (id, question, answer, order_idx, visible) VALUES (?, ?, ?, ?, ?)')
          .bind(fq.id, fq.question, fq.answer, fq.order_idx, fq.visible)
          .run()
          .catch(() => {});
      }
    }
  }
}