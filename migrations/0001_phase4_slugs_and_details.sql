-- Migration 0001: Phase 4 Slugs & Structured Details
-- Safe & additive migration for Cloudflare D1 (never drops data)

ALTER TABLE services ADD COLUMN slug TEXT;
ALTER TABLE services ADD COLUMN long_description TEXT;
ALTER TABLE services ADD COLUMN features TEXT NOT NULL DEFAULT '[]';

ALTER TABLE projects ADD COLUMN slug TEXT;
ALTER TABLE projects ADD COLUMN problem TEXT;
ALTER TABLE projects ADD COLUMN solution TEXT;
ALTER TABLE projects ADD COLUMN result TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;
