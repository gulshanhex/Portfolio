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

const WOFF2_MIN_SIZES = {
  'inter-variable.woff2': 30 * 1024,        // 30 KB minimum
  'material-icons-round.woff2': 100 * 1024, // 100 KB minimum
  'mono-regular.woff2': 20 * 1024,          // 20 KB minimum
};

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

console.log('[check-assets] Checking referenced assets on disk in public/...');

const referencedUrls = new Set([
  '/fonts/inter-variable.woff2',
  '/fonts/material-icons-round.woff2',
  '/fonts/mono-regular.woff2',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
]);

const assetRegex = /(\/fonts\/[a-zA-Z0-9._-]+|\/icon-[a-zA-Z0-9._-]+|\/apple-touch-icon\.[a-z]+|\/favicon\.[a-z]+|\/offline\.html)/g;

for (const filePath of filesToScan) {
  if (!fs.existsSync(filePath)) {
    console.error(`[check-assets] FAIL: source file not found on disk: ${path.relative(ROOT_DIR, filePath)}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    referencedUrls.add(match[1]);
  }
}

let failures = 0;

for (const url of Array.from(referencedUrls).sort()) {
  const relativePublicPath = url.replace(/^\//, '');
  const targetFile = path.join(PUBLIC_DIR, relativePublicPath);
  const baseName = path.basename(targetFile);

  if (!fs.existsSync(targetFile)) {
    console.error(`  [FAIL] public/${relativePublicPath}: file does not exist on disk`);
    failures++;
    continue;
  }

  const stat = fs.statSync(targetFile);
  if (!stat.isFile() || stat.size === 0) {
    console.error(`  [FAIL] public/${relativePublicPath}: file is empty (0 bytes)`);
    failures++;
    continue;
  }

  if (targetFile.endsWith('.woff2')) {
    const fd = fs.openSync(targetFile, 'r');
    const header = Buffer.alloc(4);
    const bytesRead = fs.readSync(fd, header, 0, 4, 0);
    fs.closeSync(fd);

    const magic = header.toString('ascii', 0, bytesRead);
    if (magic !== 'wOF2') {
      console.error(`  [FAIL] public/${relativePublicPath}: invalid WOFF2 magic bytes (expected "wOF2", got ${JSON.stringify(magic)})`);
      failures++;
      continue;
    }

    const minSize = WOFF2_MIN_SIZES[baseName] || 10 * 1024;
    if (stat.size < minSize) {
      console.error(
        `  [FAIL] public/${relativePublicPath}: size ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB) is below required minimum of ${minSize} bytes (${(minSize / 1024).toFixed(0)} KB)`
      );
      failures++;
      continue;
    }

    console.log(`  [OK] public/${relativePublicPath}: ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB), magic="wOF2"`);
  } else if (targetFile.endsWith('.png')) {
    const fd = fs.openSync(targetFile, 'r');
    const header = Buffer.alloc(8);
    const bytesRead = fs.readSync(fd, header, 0, 8, 0);
    fs.closeSync(fd);

    if (bytesRead < 8 || !header.equals(PNG_MAGIC)) {
      console.error(`  [FAIL] public/${relativePublicPath}: invalid PNG signature`);
      failures++;
      continue;
    }

    console.log(`  [OK] public/${relativePublicPath}: ${stat.size} bytes, valid PNG header`);
  } else {
    console.log(`  [OK] public/${relativePublicPath}: ${stat.size} bytes`);
  }
}

if (failures > 0) {
  console.error(`\n[check-assets] FAILED: ${failures} asset check(s) failed.`);
  process.exit(1);
} else {
  console.log(`\n[check-assets] PASSED: All ${referencedUrls.size} disk asset checks succeeded.`);
}
