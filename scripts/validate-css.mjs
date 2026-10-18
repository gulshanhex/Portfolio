import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const postcss = require('/usr/share/nodejs/postcss');

const cssFiles = [];
function findCssFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      findCssFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      cssFiles.push(fullPath);
    }
  }
}

findCssFiles('/tmp/project/src');

console.log(`[PostCSS] Parsing ${cssFiles.length} CSS files...`);
let errors = 0;

for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf8');
  try {
    const root = postcss.parse(content, { from: file });
    console.log(`✓ ${path.relative('/tmp/project', file)}: parsed successfully (${root.nodes.length} top-level nodes)`);
  } catch (err) {
    console.error(`✗ ${path.relative('/tmp/project', file)}: syntax error:`, err.message);
    errors++;
  }
}

if (errors > 0) {
  console.error(`[PostCSS] FAILED: ${errors} syntax errors found.`);
  process.exit(1);
} else {
  console.log(`[PostCSS] SUCCESS: All ${cssFiles.length} CSS files parsed cleanly with 0 syntax errors.`);
}
