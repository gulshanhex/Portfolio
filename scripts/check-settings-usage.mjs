#!/usr/bin/env node
/**
 * Prebuild Regression Guard: scripts/check-settings-usage.mjs
 * Parses DEFAULT_SETTINGS in src/lib/schema-sql.ts and verifies that every
 * top-level setting group and leaf key is read somewhere under src/
 * (excluding src/pages/admin, src/pages/api/admin, and src/lib/schema-sql.ts),
 * unless listed in ALLOWLIST with a documented one-line reason.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEMA_FILE = path.join(ROOT, 'src/lib/schema-sql.ts');

// Explicit allowlist of legacy/stored-only keys with a one-line reason
const ALLOWLIST = {
  'hero.resume_label': 'Replaced by nav.resume_label; retained in DEFAULT_SETTINGS for backward-compatible DB merges.',
  'copy.proof_title': 'Proof section title is read from proof_section.section_title; retained for Section Copy panel compatibility.',
  'copy.proof_subtitle': 'Proof section subtitle is read from proof_section.orgs_subtitle; retained for Section Copy panel compatibility.',
  'theme.stars_enabled': 'Replaced in UI by theme.glow_intensity per Part 0.4 while preserving stored DB value.',
  'theme.stars_count': 'Replaced in UI by theme.glow_intensity per Part 0.4 while preserving stored DB value.',
  'theme.noise_enabled': 'Replaced in UI by theme.glow_intensity per Part 0.4 while preserving stored DB value.',
  'theme.scanlines_enabled': 'Replaced in UI by theme.glow_intensity per Part 0.4 while preserving stored DB value.',
  'nav.items': 'Navigation order and visibility are driven by the sections table; retained for legacy backup compatibility.',
};

function collectSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (rel === 'src/pages/admin' || rel === 'src/pages/api/admin') continue;
      collectSourceFiles(full, out);
    } else if (entry.isFile()) {
      if (rel === 'src/lib/schema-sql.ts') continue;
      if (/\.(astro|ts|js|mjs|css)$/.test(entry.name)) {
        out.push({ rel, content: fs.readFileSync(full, 'utf8') });
      }
    }
  }
  return out;
}

// Extract DEFAULT_SETTINGS keys from src/lib/schema-sql.ts
const schemaSrc = fs.readFileSync(SCHEMA_FILE, 'utf8');
const startIdx = schemaSrc.indexOf('export const DEFAULT_SETTINGS');
const endIdx = schemaSrc.indexOf('export const DEFAULT_SECTIONS');
if (startIdx === -1 || endIdx === -1) {
  console.error('[check-settings-usage] ERROR: Could not locate DEFAULT_SETTINGS block in src/lib/schema-sql.ts');
  process.exit(1);
}
const block = schemaSrc.slice(startIdx, endIdx);

// Parse 2-space indented top-level keys and 4-space indented second-level keys
const topKeys = [];
const leafKeys = [];
let currentTop = null;

for (const line of block.split('\n')) {
  const topMatch = line.match(/^  ([a-zA-Z0-9_]+):\s*\{/);
  if (topMatch) {
    currentTop = topMatch[1];
    topKeys.push(currentTop);
    continue;
  }
  if (/^  \},?\s*$/.test(line)) {
    currentTop = null;
    continue;
  }
  if (currentTop) {
    const leafMatch = line.match(/^    ([a-zA-Z0-9_]+):/);
    if (leafMatch) {
      leafKeys.push({ group: currentTop, key: leafMatch[1], full: `${currentTop}.${leafMatch[1]}` });
    }
  }
}

const sourceFiles = collectSourceFiles(path.join(ROOT, 'src'));
const combinedCorpus = sourceFiles.map((f) => f.content).join('\n');

const unused = [];

for (const tk of topKeys) {
  const regex = new RegExp(`\\b${tk}\\b`);
  if (!regex.test(combinedCorpus)) {
    unused.push(`Top-level group "${tk}"`);
  }
}

for (const item of leafKeys) {
  if (ALLOWLIST[item.full]) continue;
  const regex = new RegExp(`\\b${item.key}\\b`);
  if (!regex.test(combinedCorpus)) {
    unused.push(item.full);
  }
}

if (unused.length > 0) {
  console.error('[check-settings-usage] FAILED — Unused DEFAULT_SETTINGS keys found:');
  for (const u of unused) {
    console.error(`  ✗ ${u}`);
  }
  process.exit(1);
}

console.log(
  `[check-settings-usage] SUCCESS: Verified ${topKeys.length} top-level groups and ${leafKeys.length} setting keys across ${sourceFiles.length} non-admin source files (${Object.keys(ALLOWLIST).length} allowlisted legacy keys).`
);
