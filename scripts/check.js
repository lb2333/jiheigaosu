#!/usr/bin/env node
'use strict';

/**
 * 全项目静态健康检查（零外部依赖）：
 * 1. 校验全部 JS 文件语法（node --check）
 * 2. 校验 JIHEI_CONFIG.moduleScripts、pageCatalog 与模块真实注册声明 100% 一致
 * 3. 校验全平台跨模块 switchModule() 跳转 0 断链
 * 4. 校验核心静态资源与入口页面完整存在
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function collectJsFiles(dirRel) {
  const full = path.join(ROOT, dirRel);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const ent of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dirRel, ent.name);
    if (ent.isDirectory()) out.push(...collectJsFiles(rel));
    else if (ent.name.endsWith('.js')) out.push(rel);
  }
  return out;
}

const jsFiles = [
  'server.js',
  ...collectJsFiles('js'),
  ...collectJsFiles('scripts')
].sort();

let failed = false;
function fail(msg) {
  failed = true;
  console.error('[FAIL]', msg);
}
function pass(msg) {
  console.log('[PASS]', msg);
}

// 1. JS Syntax Check
for (const rel of jsFiles) {
  try {
    execSync(`node --check "${path.join(ROOT, rel)}"`, { stdio: 'pipe' });
  } catch (e) {
    fail(`Syntax error in ${rel}: ${e.stderr?.toString() || e.message}`);
  }
}
if (!failed) pass(`Syntax check passed for all ${jsFiles.length} JS files.`);

// 2. Config <-> Data <-> Module Registry consistency
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8'), sandbox);
const cfg = sandbox.window.JIHEI_CONFIG;
const data = sandbox.window.JIHEI_DATA;

const registeredMap = {
  home: data.subPages.map(p => p.id)
};

for (const [modId, relScript] of Object.entries(cfg.moduleScripts || {})) {
  const full = path.join(ROOT, relScript);
  if (!fs.existsSync(full)) {
    fail(`Missing module script for "${modId}": ${relScript}`);
    continue;
  }
  const src = fs.readFileSync(full, 'utf8');
  const idx = src.indexOf('registerModule');
  if (idx < 0) {
    fail(`Module script ${relScript} does not call registerModule()`);
    continue;
  }
  const block = src.slice(idx, idx + 2000);
  const idMatch = block.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
  if (!idMatch || idMatch[1] !== modId) {
    fail(`Module ID mismatch in ${relScript}: config="${modId}", code="${idMatch ? idMatch[1] : 'none'}"`);
  }
  let spSource = (block.match(/subPages\s*:\s*\[([\s\S]*?)\]/) || [])[1] || '';
  if (!spSource) {
    const varMatch = block.match(/subPages\s*:\s*([A-Za-z0-9_$]+)/);
    if (varMatch) {
      const defMatch = src.match(new RegExp(`(?:const|let|var)\\s+${varMatch[1]}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
      if (defMatch) spSource = defMatch[1];
    }
  }
  registeredMap[modId] = [...spSource.matchAll(/\bid\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
}

const totalRegisteredPages = Object.values(registeredMap).reduce((s, a) => s + a.length, 0);
pass(`Verified ${Object.keys(registeredMap).length} modules / ${totalRegisteredPages} sub-pages registered.`);

// Check pageCatalog against registeredMap
const catalog = cfg.pageCatalog || [];
for (const entry of catalog) {
  if (!registeredMap[entry.mod] || !registeredMap[entry.mod].includes(entry.sub)) {
    fail(`pageCatalog entry invalid: ${entry.mod}/${entry.sub} (${entry.name})`);
  }
}
if (catalog.length !== totalRegisteredPages) {
  fail(`pageCatalog length (${catalog.length}) !== totalRegisteredPages (${totalRegisteredPages})`);
} else {
  pass(`pageCatalog 100% synced (${catalog.length}/${totalRegisteredPages} pages).`);
}

// 3. Cross-module switchModule() link validation
let totalLinks = 0;
let brokenLinks = 0;
for (const rel of collectJsFiles('js')) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const calls = [...src.matchAll(/switchModule\s*\(\s*['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/g)];
  for (const [, mid, sid] of calls) {
    totalLinks++;
    const okMod = !!registeredMap[mid];
    const okSub = !sid || (okMod && registeredMap[mid].includes(sid));
    if (!okMod || !okSub) {
      brokenLinks++;
      fail(`Broken switchModule("${mid}"${sid ? `, "${sid}"` : ''}) in ${rel}`);
    }
  }
}
if (brokenLinks === 0) pass(`All ${totalLinks} cross-module switchModule() links valid.`);

// 4. Core assets & entry HTML check
const requiredFiles = [
  'index.html',
  'css/platform.css',
  'css/modules-common.css',
  'js/config.js',
  'js/shared/ui-kit.js',
  'js/data.js',
  'js/cesium-map.js',
  'js/app.js',
  'lib/cesium/Cesium.js',
  'assets/corridor_aerial.jpg',
  'assets/milestone_before.jpg',
  'assets/milestone_after.jpg',
  'assets/showcase_viaduct.jpg'
];
for (const rf of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, rf))) fail(`Missing required file: ${rf}`);
}
if (!failed) {
  pass('All core runtime files & assets verified.');
  console.log('\n✅ 全项目静态检查全部通过！');
} else {
  process.exit(1);
}
