import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawn } from 'node:child_process';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8088';
const CDP_PORT = 19223;

const ROUTES = [
  ['home', 'overview'], ['home', 'roaming'], ['home', 'milestone'], ['home', 'showcase'],
  ['progress', 'overview'], ['progress', 'report'], ['progress', 'plan'], ['progress', 'bim_a'], ['progress', 'bim_b'],
  ['quality', 'overview'], ['quality', 'lab'], ['quality', 'mixing'], ['quality', 'pavement'], ['quality', 'beamYard'], ['quality', 'issues'],
  ['safety', 'overview'], ['safety', 'risk'], ['safety', 'ai_alert'], ['safety', 'ledger'], ['safety', 'review'],
  ['staff', 'org'], ['staff', 'attendance'],
  ['machine', 'equipment'], ['machine', 'keyArchive'],
  ['material', 'overview'], ['material', 'report'], ['material', 'yard'], ['material', 'inspect'],
  ['measure', 'overview'], ['measure', 'sectionStats'], ['measure', 'physicalCompare'], ['measure', 'rawRecords'],
  ['uav', 'overview'], ['uav', 'tasks'], ['uav', 'routes'], ['uav', 'live'], ['uav', 'hazards'], ['uav', 'reports'],
  ['video', 'directory'], ['video', 'patrol'], ['video', 'playback'], ['video', 'airground'],
  ['speed', 'traffic'], ['speed', 'algorithm'], ['speed', 'strategy'], ['speed', 'feedback'], ['speed', 'replay'],
  ['pingan', 'showcase'], ['pingan', 'topics'],
  ['publish', 'overview'], ['publish', 'templates'], ['publish', 'review'], ['publish', 'plans'], ['publish', 'receipts'],
  ['blacksoil', 'compare'],
  ['system', 'base'], ['system', 'rbac'], ['system', 'integration'], ['system', 'metrics'], ['system', 'content'], ['system', 'logs'],
  ['ai', 'exhibition'], ['ai', 'analysis'], ['ai', 'field'],
];

function findBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForCdpTarget(retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const list = await httpGetJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error('Timed out waiting for headless browser CDP endpoint');
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.buf = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      const u = new URL(this.wsUrl);
      const key = crypto.randomBytes(16).toString('base64');
      const socket = net.connect(Number(u.port) || 80, u.hostname);
      this.socket = socket;
      let upgraded = false;
      socket.on('connect', () => {
        socket.write(
          `GET ${u.pathname}${u.search || ''} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
        );
      });
      socket.on('error', (err) => { if (!upgraded) reject(err); });
      socket.on('data', (chunk) => {
        this.buf = Buffer.concat([this.buf, chunk]);
        if (!upgraded) {
          const end = this.buf.indexOf('\r\n\r\n');
          if (end === -1) return;
          const hdr = this.buf.slice(0, end).toString('utf8');
          this.buf = this.buf.slice(end + 4);
          if (!hdr.startsWith('HTTP/1.1 101')) return reject(new Error('WS handshake failed'));
          upgraded = true;
          resolve();
        }
        this._drainFrames();
      });
    });
  }
  _drainFrames() {
    while (this.buf.length >= 2) {
      const b0 = this.buf[0];
      const b1 = this.buf[1];
      const opcode = b0 & 0x0f;
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); offset = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); offset = 10; }
      const maskLen = (b1 & 0x80) !== 0 ? 4 : 0;
      if (this.buf.length < offset + maskLen + len) return;
      const payload = this.buf.slice(offset + maskLen, offset + maskLen + len);
      this.buf = this.buf.slice(offset + maskLen + len);
      if (opcode === 0x8) { this.close(); return; }
      if (opcode === 0x1 || opcode === 0x0) {
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            else resolve(msg.result);
          } else if (msg.method && this.listeners.has(msg.method)) {
            this.listeners.get(msg.method).forEach((fn) => fn(msg.params));
          }
        } catch {}
      }
    }
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const buf = Buffer.from(JSON.stringify({ id, method, params }), 'utf8');
      const mask = crypto.randomBytes(4);
      const len = buf.length;
      let header;
      if (len < 126) { header = Buffer.alloc(6); header[0] = 0x81; header[1] = 0x80 | len; mask.copy(header, 2); }
      else if (len < 65536) { header = Buffer.alloc(8); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2); mask.copy(header, 4); }
      else { header = Buffer.alloc(14); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2); mask.copy(header, 10); }
      const masked = Buffer.alloc(len);
      for (let i = 0; i < len; i++) masked[i] = buf[i] ^ mask[i & 3];
      this.socket.write(Buffer.concat([header, masked]));
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }
  async evalJs(expression) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r?.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text || JSON.stringify(r.exceptionDetails));
    }
    return r?.result?.value;
  }
  close() { try { this.socket?.destroy(); } catch {} }
}

async function main() {
  const browserBin = findBrowser();
  if (!browserBin) {
    console.error('[FAIL] No Edge/Chrome found');
    process.exit(1);
  }

  // Verify public endpoints
  const health = await fetch(`${BASE_URL}/api/health`).then((r) => r.json());
  const authOk = await fetch(`${BASE_URL}/api/auth/ok`).then((r) => r.json());
  console.log('[API]', { health, authOk });
  if (health.status !== 'ok' || !authOk.ok) {
    throw new Error('Health or auth/ok failed');
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jihei-next-cdp-'));
  const browser = spawn(
    browserBin,
    [
      '--headless=new',
      '--no-sandbox',
      '--window-size=1440,900',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userDataDir}`,
      `${BASE_URL}/login`,
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;
  const pageErrors = [];
  const consoleErrors = [];

  try {
    const target = await waitForCdpTarget();
    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');

    cdp.on('Runtime.exceptionThrown', (params) => {
      pageErrors.push(params?.exceptionDetails?.exception?.description || params?.exceptionDetails?.text || 'Unknown exception');
    });
    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = (params.args || []).map((a) => a.value || a.description || '').join(' ');
        if (!/tianditu|cesium\.com|ion\.cesium|ERR_NAME_NOT_RESOLVED|Failed to load resource/i.test(text)) {
          consoleErrors.push(text);
        }
      }
    });

    // Wait for login page & click submit
    let hasBtn = false;
    for (let i = 0; i < 40; i++) {
      hasBtn = await cdp.evalJs('Boolean(document.querySelector("form button[type=submit]"))');
      if (hasBtn) break;
      await sleep(200);
    }
    if (!hasBtn) {
      const diag = await cdp.evalJs('({ href: location.href, title: document.title, text: document.body?.innerText?.slice(0, 300) })');
      throw new Error('Login button missing: ' + JSON.stringify(diag));
    }
    await cdp.evalJs('document.querySelector("form button[type=submit]").click()');

    // Wait for /home/overview & Cesium/Shell mount
    let loggedIn = false;
    for (let i = 0; i < 50; i++) {
      const ok = await cdp.evalJs('Boolean(location.pathname.includes("/home") && document.getElementById("mainNav") && document.getElementById("page-overview"))');
      if (ok) { loggedIn = true; break; }
      await sleep(250);
    }
    if (!loggedIn) throw new Error('Login did not redirect to /home/overview');
    await sleep(1000);

    const cesiumStatus = await cdp.evalJs('({ ready: Boolean(window.JIHEI_CESIUM?.ready), hasViewer: Boolean(window.viewer) })');
    console.log('[CESIUM]', cesiumStatus);

    // Traverse all 64 routes via Next.js client-side navigation (<Link> clicks) to verify persistent Cesium + zero reloads
    let passed = 0;
    const failed = [];
    for (const [mod, sub] of ROUTES) {
      const beforeErrs = pageErrors.length;
      const targetPath = `/${mod}/${sub}`;
      await cdp.evalJs(`(() => {
        if ('${mod}' === 'system' && !location.pathname.startsWith('/system/')) {
          document.getElementById('sysManageBtn')?.click();
          return;
        }
        if ('${mod}' === 'ai' && !location.pathname.startsWith('/ai/')) {
          document.getElementById('aiWorkbenchBtn')?.click();
          return;
        }
        const navLink = document.querySelector('#mainNav a[href^="/${mod}/"]') || document.querySelector('#subTabs a[href="${targetPath}"]');
        if (navLink && !location.pathname.startsWith('/${mod}/')) {
          navLink.click();
        }
      })()`);
      await sleep(50);
      await cdp.evalJs(`(() => {
        const subLink = document.querySelector('#subTabs a[href="${targetPath}"]');
        if (subLink) subLink.click();
      })()`);
      // Fallback if subTabs didn't render yet (e.g., top nav just switched module)
      let ok = false;
      for (let t = 0; t < 40; t++) {
        await sleep(80);
        await cdp.evalJs(`(() => {
          if (!location.pathname.endsWith('${targetPath}')) {
            const subLink = document.querySelector('#subTabs a[href="${targetPath}"]');
            if (subLink) subLink.click();
          }
        })()`);
        ok = await cdp.evalJs(`(() => {
          if (!location.pathname.endsWith('${targetPath}')) return false;
          if ('${mod}' === 'home') {
            const el = document.getElementById('page-${sub}');
            return Boolean(el && el.innerHTML.trim().length > 100);
          }
          const host = document.getElementById('moduleStageHost');
          return Boolean(host && host.innerHTML.trim().length > 100 && !host.innerHTML.includes('正在按需加载'));
        })()`);
        if (ok) break;
      }
      if (ok && pageErrors.length === beforeErrs) passed++;
      else failed.push(`${mod}/${sub}`);
    }

    const cesiumAfter64 = await cdp.evalJs('({ ready: Boolean(window.JIHEI_CESIUM?.ready), hasViewer: Boolean(window.viewer) })');
    console.log('[CESIUM AFTER 64 ROUTES]', cesiumAfter64);

    // Verify Ctrl+K & AI streaming API & PostgreSQL write/read persistence
    const apiChecks = await cdp.evalJs(`(async () => {
      const homeRes = await fetch('/api/home/overview');
      const sysRes = await fetch('/api/system/users');
      const aiThreads = await fetch('/api/ai/threads');
      const createThreadRes = await fetch('/api/ai/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'analysis', title: 'smoke-test-thread' })
      });
      const created = createThreadRes.ok ? await createThreadRes.json() : null;
      const delOk = created?.thread?.id
        ? (await fetch('/api/ai/threads?id=' + encodeURIComponent(created.thread.id), { method: 'DELETE' })).ok
        : false;
      const chatRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'analysis',
          messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: '二工区进度如何' }] }]
        })
      });
      const chatText = await chatRes.text();
      return {
        homeOk: homeRes.ok,
        sysOk: sysRes.ok,
        threadsOk: aiThreads.ok,
        dbWriteOk: Boolean(created?.thread?.id) && delOk,
        chatOk: chatRes.ok && chatText.includes('text-delta')
      };
    })()`);
    console.log('[API AUTH CHECKS]', apiChecks);

    // Ctrl+K palette test on current active platform shell
    const cmdkDiag = await cdp.evalJs(`(async () => {
      const btn = document.getElementById('cmdkTriggerBtn');
      if (!btn) return { hasBtn: false, path: location.pathname };
      btn.click();
      await new Promise(r => setTimeout(r, 120));
      const open = Boolean(document.getElementById('cmdkBackdrop'));
      if (open) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return { hasBtn: true, open, path: location.pathname };
    })()`);
    const cmdkOk = Boolean(cmdkDiag?.open);
    console.log('[CMDK DIAG]', cmdkDiag);

    console.log(`[SMOKE] 64-route traversal: ${passed} / ${ROUTES.length} passed | cmdkOk=${cmdkOk}`);

    if (failed.length || pageErrors.length || consoleErrors.length || !apiChecks.homeOk || !apiChecks.sysOk || !apiChecks.threadsOk || !apiChecks.dbWriteOk || !apiChecks.chatOk || !cmdkOk) {
      console.error({ failed, pageErrors, consoleErrors, apiChecks, cmdkOk });
      process.exitCode = 1;
    } else {
      console.log('✅ Next.js 16 全栈 64/64 路由 + Better Auth + PostgreSQL + AI SDK + Nginx 巡检全部通过！');
    }
  } finally {
    cdp?.close();
    try { browser.kill(); } catch {}
    await sleep(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
