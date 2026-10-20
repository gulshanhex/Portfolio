#!/usr/bin/env node
/**
 * Prebuild Regression Guard: scripts/check-admin.mjs
 * Verifies src/pages/admin/index.astro invariants:
 * 1. The inline script is a plain `<script is:inline>` with NO `define:vars`
 * 2. CSRF token comes from `<div id="gk-csrf" data-token=...>`
 * 3. `async function loadHero()` keeps its `async`
 * 4. No stray `async` token on its own line
 * 5. Inline script passes `node --check` syntax validation
 * 6. Every function named in an inline `onclick="..."` handler (including inside JS template strings)
 *    is declared at the top level of the inline script.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ADMIN_PATH = path.resolve(process.cwd(), 'src/pages/admin/index.astro');

if (!fs.existsSync(ADMIN_PATH)) {
  console.error(`[check-admin] ERROR: ${ADMIN_PATH} not found.`);
  process.exit(1);
}

const content = fs.readFileSync(ADMIN_PATH, 'utf8');
const errors = [];

// 1. Verify <div id="gk-csrf" data-token={csrfToken} ...> exists
if (!/<div\s+id="gk-csrf"\s+data-token=\{csrfToken\}/.test(content)) {
  errors.push('Missing `<div id="gk-csrf" data-token={csrfToken} hidden></div>` in src/pages/admin/index.astro.');
}

// 2. Verify <script is:inline> has NO define:vars
const scriptTagMatches = [...content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
if (scriptTagMatches.length === 0) {
  errors.push('No <script> tag found in src/pages/admin/index.astro.');
}

let inlineScriptCode = '';
for (const m of scriptTagMatches) {
  const attrs = m[1] || '';
  const body = m[2] || '';
  if (attrs.includes('define:vars')) {
    errors.push(`Forbidden \`define:vars\` found on <script${attrs}> in src/pages/admin/index.astro (causes Astro IIFE wrapping).`);
  }
  if (attrs.includes('is:inline')) {
    inlineScriptCode = body;
  }
}

if (!inlineScriptCode) {
  errors.push('Missing `<script is:inline>` block in src/pages/admin/index.astro.');
}

// 3. Verify `async function loadHero()` keeps its `async`
if (!/\basync\s+function\s+loadHero\s*\(/.test(inlineScriptCode)) {
  errors.push('`async function loadHero()` is missing or lost its `async` keyword.');
}

// 4. Verify no stray `async` token on its own line
const scriptLines = inlineScriptCode.split('\n');
scriptLines.forEach((line, idx) => {
  if (/^\s*async\s*$/.test(line)) {
    errors.push(`Stray \`async\` token on its own line at script line ${idx + 1}.`);
  }
});

// 5. Run `node --check` on extracted inline script
if (inlineScriptCode) {
  const tmpFile = path.join(os.tmpdir(), `gk-admin-inline-${process.pid}.js`);
  try {
    fs.writeFileSync(tmpFile, inlineScriptCode, 'utf8');
    execFileSync(process.execPath, ['--check', tmpFile], { stdio: 'pipe' });
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    errors.push(`\`node --check\` failed on inline script:\n${stderr}`);
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
  }
}

// 6. Extract all top-level function declarations in inlineScriptCode
//    Matches: `function foo(`, `async function foo(`, or `const foo =` at top-level indentation
const declaredFunctions = new Set();
const fnDeclRegex = /^(?: {0,12}|\t{0,3})(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gm;
let m;
while ((m = fnDeclRegex.exec(inlineScriptCode)) !== null) {
  declaredFunctions.add(m[1]);
}

// Extract every function name called in onclick="..." or onclick={`...`}
const onclickHandlers = new Set();
const onclickAttrRegex = /\bonclick=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})/g;
while ((m = onclickAttrRegex.exec(content)) !== null) {
  const expr = (m[1] || m[2] || m[3] || '').trim();
  // Match leading function call identifier before `(`
  const fnMatch = expr.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/);
  if (fnMatch) {
    onclickHandlers.add(fnMatch[1]);
  }
}

const builtins = new Set(['confirm', 'alert', 'window', 'document', 'location', 'history']);
for (const fnName of onclickHandlers) {
  if (builtins.has(fnName)) continue;
  if (!declaredFunctions.has(fnName)) {
    errors.push(`onclick handler function "${fnName}()" is not declared at the top level of <script is:inline>.`);
  }
}

if (errors.length > 0) {
  console.error('[check-admin] FAILED:');
  for (const e of errors) {
    console.error(`  ✗ ${e}`);
  }
  process.exit(1);
}

console.log(
  `[check-admin] SUCCESS: <script is:inline> passed node --check and verified ${onclickHandlers.size} unique onclick handler functions (${[...onclickHandlers].join(', ')}).`
);
