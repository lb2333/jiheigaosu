import fs from 'node:fs';
import path from 'node:path';

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.error('[prepare-standalone] .next/standalone not found');
  process.exit(1);
}

copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));
if (fs.existsSync(path.join(root, '.env.local'))) {
  fs.copyFileSync(path.join(root, '.env.local'), path.join(standaloneDir, '.env.local'));
}
console.log('[prepare-standalone] Synced .next/static, public, and .env.local into .next/standalone');
