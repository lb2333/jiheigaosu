#!/usr/bin/env node
'use strict';

/**
 * 轻量化交付打包脚本：
 * 将运行所需文件输出至 dist-release/，自动剔除「系统界面示意图/」（75+ MB）与临时文件，
 * 使客户汇报与内网部署包体积从 ~100 MB 缩减至 ~22 MB。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dist-release');

const INCLUDE_FILES = [
  'index.html',
  'server.js',
  '启动三维平台.bat',
  'package.json',
  'HANDOFF.md'
];
const INCLUDE_DIRS = [
  'assets',
  'css',
  'js',
  'lib',
  'pages',
  'scripts'
];

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const ent of fs.readdirSync(src)) {
      copyRecursive(path.join(src, ent), path.join(dst, ent));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function measureSize(target) {
  if (!fs.existsSync(target)) return { bytes: 0, files: 0 };
  const st = fs.statSync(target);
  if (!st.isDirectory()) return { bytes: st.size, files: 1 };
  let bytes = 0, files = 0;
  for (const ent of fs.readdirSync(target, { withFileTypes: true })) {
    const sub = measureSize(path.join(target, ent.name));
    bytes += sub.bytes;
    files += sub.files;
  }
  return { bytes, files };
}

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const f of INCLUDE_FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) copyRecursive(src, path.join(OUT_DIR, f));
}
for (const d of INCLUDE_DIRS) {
  const src = path.join(ROOT, d);
  if (fs.existsSync(src)) copyRecursive(src, path.join(OUT_DIR, d));
}

const fullStats = measureSize(ROOT);
const outStats = measureSize(OUT_DIR);
const origBytes = fullStats.bytes - outStats.bytes;

console.log(`✅ 轻量化发布包已生成：${OUT_DIR}`);
console.log(`   工作区原体积（含示意图）: ${(origBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`   发布包体积（纯运行态）  : ${(outStats.bytes / 1024 / 1024).toFixed(2)} MB（${outStats.files} 个文件，缩减 ${(100 * (1 - outStats.bytes / origBytes)).toFixed(1)}%）`);
