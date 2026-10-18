import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const filesToScan = [
  path.join(ROOT_DIR, 'src/styles/tokens.css'),
  path.join(ROOT_DIR, 'public/site.webmanifest'),
  path.join(ROOT_DIR, 'src/pages/admin/manifest.webmanifest.ts'),
  path.join(ROOT_DIR, 'public/sw.js'),
];

console.log('[check-assets] Scanning asset references across stylesheets, manifests, and service worker...');

const referencedUrls = new Set();
// Regex to catch /fonts/*, /icon-*, /favicon.*, /apple-touch-icon.*, /offline.html
const assetRegex = /(\/fonts\/[a-zA-Z0-9._-]+|\/icon-[a-zA-Z0-9._-]+|\/apple-touch-icon\.[a-z]+|\/favicon\.[a-z]+|\/offline\.html)/g;

for (const filePath of filesToScan) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[check-assets] Warning: config file not found: ${filePath}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    referencedUrls.add(match[1]);
  }
}

console.log(`[check-assets] Found ${referencedUrls.size} unique asset URLs:`);
let missingCount = 0;

for (const url of Array.from(referencedUrls).sort()) {
  // Strip leading slash to locate within public directory
  const relativePublicPath = url.replace(/^\//, '');
  const targetFile = path.join(PUBLIC_DIR, relativePublicPath);
  const exists = fs.existsSync(targetFile);

  if (exists) {
    const stat = fs.statSync(targetFile);
    console.log(`  ✓ 200 OK: ${url} -> public/${relativePublicPath} (${stat.size} bytes)`);
  } else {
    console.error(`  ✗ 404 MISSING: ${url} -> public/${relativePublicPath} NOT FOUND`);
    missingCount++;
  }
}

if (missingCount > 0) {
  console.error(`\n[check-assets] FAILED: ${missingCount} referenced public asset(s) are missing!`);
  process.exit(1);
} else {
  console.log(`\n[check-assets] SUCCESS: All ${referencedUrls.size} referenced assets verified on disk.`);
}
