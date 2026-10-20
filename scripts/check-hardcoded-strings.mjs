#!/usr/bin/env node
/**
 * Prebuild Regression Guard (Heuristic): scripts/check-hardcoded-strings.mjs
 * Scans public Astro components and pages (excluding admin and docs) and fails
 * when static English text appears between HTML tags or inside
 * aria-label / title / placeholder / alt attributes instead of being routed
 * through t(settings, key) or dynamic Astro expressions `{...}`.
 * Excludes punctuation, icons, symbols, and numbers.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const TARGET_DIRS = [
  path.join(ROOT, 'src/components'),
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/layouts'),
];

const EXCLUDED_FILES = new Set([
  'src/pages/admin/index.astro',
  'src/pages/docs.astro',
  'src/layouts/AdminLayout.astro',
]);

// Material icon ligatures & technical tokens allowed inside icon spans
const ALLOWED_LITERALS = new Set([
  'light_mode',
  'dark_mode',
  'download',
  'arrow_back',
  'GK',
  'ORG',
]);

function collectAstroFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (rel.startsWith('src/pages/admin') || rel.startsWith('src/pages/api')) continue;
      collectAstroFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.astro')) {
      if (!EXCLUDED_FILES.has(rel)) {
        out.push({ full, rel });
      }
    }
  }
  return out;
}

function stripBalancedBraces(input) {
  let result = '';
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const prev = i > 0 ? input[i - 1] : '';
    if (depth > 0) {
      if (!inDouble && !inTemplate && ch === "'" && prev !== '\\') inSingle = !inSingle;
      else if (!inSingle && !inTemplate && ch === '"' && prev !== '\\') inDouble = !inDouble;
      else if (!inSingle && !inDouble && ch === '`' && prev !== '\\') inTemplate = !inTemplate;
    }
    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === '{') {
        depth++;
        result += ' ';
        continue;
      }
      if (ch === '}' && depth > 0) {
        depth--;
        result += ' ';
        continue;
      }
    }
    if (depth === 0) {
      result += ch;
    }
  }
  return result;
}

function extractTemplateMarkup(astroSource) {
  // Remove frontmatter --- ... ---
  let body = astroSource;
  if (body.startsWith('---')) {
    const endFm = body.indexOf('\n---', 3);
    if (endFm !== -1) {
      body = body.slice(endFm + 4);
    }
  }
  // Remove <style...>...</style> and <script...>...</script> and HTML comments
  body = body
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  return body;
}

const files = [];
for (const d of TARGET_DIRS) collectAstroFiles(d, files);

const violations = [];

for (const file of files) {
  const raw = fs.readFileSync(file.full, 'utf8');
  const markup = extractTemplateMarkup(raw);

  // 1. Check static aria-label="...", title="...", placeholder="...", alt="..." attributes
  //    (Dynamic attributes use aria-label={...}, so static double/single quoted strings with letters are violations)
  const attrRegex = /\b(aria-label|title|placeholder|alt)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = attrRegex.exec(markup)) !== null) {
    const attrName = m[1];
    const attrVal = (m[2] ?? m[3] ?? '').trim();
    if (/[A-Za-z]{2,}/.test(attrVal)) {
      violations.push(`${file.rel}: static ${attrName}="${attrVal}" (must use t(settings, ...))`);
    }
  }

  // 2. Strip Astro `{...}` expressions and check remaining static text between `>` and `<`
  const stripped = stripBalancedBraces(markup);
  const textNodeRegex = />([^<]+)</g;
  while ((m = textNodeRegex.exec(stripped)) !== null) {
    const text = m[1]
      .replace(/&(rarr|larr|uarr|darr|times|amp|nbsp|middot|bull|#\d+);/g, '')
      .trim();
    if (!text) continue;
    if (ALLOWED_LITERALS.has(text)) continue;
    // Ignore pure punctuation, symbols, arrows, and numbers
    if (!/[A-Za-z]{2,}/.test(text)) continue;
    violations.push(`${file.rel}: static visible text "${text}" between tags (must use t(settings, ...))`);
  }
}

if (violations.length > 0) {
  console.error('[check-hardcoded-strings] FAILED — Hardcoded public strings detected:');
  for (const v of violations) {
    console.error(`  ✗ ${v}`);
  }
  process.exit(1);
}

console.log(
  `[check-hardcoded-strings] SUCCESS: Scanned ${files.length} public Astro templates — 0 hardcoded text nodes or accessibility attributes found.`
);
