-- ============================================================
-- GK Portfolio — D1 Schema
-- Run this in Cloudflare Dashboard → D1 → your database → Query
-- Or use the /setup route after configuring ADMIN_SETUP_TOKEN
-- ============================================================

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

-- Admin sessions (server-side)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Site-wide key/value settings (values are JSON strings)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Section visibility and ordering
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

-- Skills groups
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'code',
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

-- Skill pills (belong to a skill group)
CREATE TABLE IF NOT EXISTS skill_pills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_hot INTEGER NOT NULL DEFAULT 0,
  order_idx INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Services / What I Do
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT NOT NULL DEFAULT 'build',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

-- Work experience entries
CREATE TABLE IF NOT EXISTS experiences (
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

-- Education entries
CREATE TABLE IF NOT EXISTS education (
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

-- Project showcase cards
CREATE TABLE IF NOT EXISTS projects (
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
  order_idx INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Proof items: organizations OR testimonials
CREATE TABLE IF NOT EXISTS proof_items (
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

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read INTEGER NOT NULL DEFAULT 0,
  ip TEXT
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Login-attempt counters used for bounded brute-force protection
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  username TEXT NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_skill_pills_skill ON skill_pills(skill_id);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_idx);
CREATE INDEX IF NOT EXISTS idx_submissions_read ON contact_submissions(read, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup ON auth_attempts(ip, username, created_at);
