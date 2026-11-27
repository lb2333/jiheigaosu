/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   共享 UI 工具库 + 本地演示数据持久化底座 (window.JIHEI_UI)
   零外部依赖，全平台 16 模块通用复用
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_PREFIX = 'jihei_proto_v1_';

  function escHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtNum(n, digits) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '-';
    return digits !== undefined ? num.toFixed(digits) : num.toLocaleString('zh-CN');
  }

  function fmtPct(n, digits) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '0.0%';
    return `${Math.max(0, Math.min(100, num)).toFixed(digits !== undefined ? digits : 1)}%`;
  }

  /* ------------------------------------------------------------------------
     轻量 localStorage 演示状态持久化 (JIHEI_UI.store)
     ------------------------------------------------------------------------ */
  const store = {
    prefix: STORAGE_PREFIX,
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
      } catch (e) {}
    },
    listKeys() {
      const keys = [];
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keys.push(k.slice(STORAGE_PREFIX.length));
          }
        }
      } catch (e) {}
      return keys;
    },
    resetAll() {
      const keys = this.listKeys();
      keys.forEach(k => this.remove(k));
      return keys.length;
    }
  };

  /* ------------------------------------------------------------------------
     标准可复用 UI HTML 生成器
     ------------------------------------------------------------------------ */
  function renderStatusBadge(text, tone) {
    const cls = ['ok', 'warn', 'danger', 'info', 'muted'].includes(tone) ? tone : 'info';
    return `<span class="jihei-badge ${cls}">${escHtml(text)}</span>`;
  }

  function renderKpiCard(opts) {
    opts = opts || {};
    const toneClass = opts.tone ? ` tone-${escHtml(opts.tone)}` : '';
    const trendHtml = opts.trend
      ? `<span class="jihei-kpi-trend">${escHtml(opts.trend)}</span>`
      : '';
    return `
      <div class="jihei-kpi-card${toneClass}">
        <div class="jihei-kpi-label">${escHtml(opts.label || '')}</div>
        <div class="jihei-kpi-val-row">
          <strong class="jihei-kpi-val">${escHtml(opts.value != null ? opts.value : '-')}</strong>
          ${opts.unit ? `<span class="jihei-kpi-unit">${escHtml(opts.unit)}</span>` : ''}
          ${trendHtml}
        </div>
      </div>
    `;
  }

  function renderEmptyState(message) {
    return `
      <div class="jihei-empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.65">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <line x1="7" y1="9" x2="17" y2="9"/>
          <line x1="7" y1="13" x2="13" y2="13"/>
        </svg>
        <span>${escHtml(message || '当前筛选条件下暂无数据')}</span>
      </div>
    `;
  }

  function renderPagination(opts) {
    const page = Math.max(1, Number(opts.page) || 1);
    const pageSize = Math.max(1, Number(opts.pageSize) || 10);
    const total = Math.max(0, Number(opts.total) || 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const attrName = opts.attrName || 'data-page';
    return `
      <div class="jihei-pagination">
        <span class="jihei-page-info">共 <strong>${total}</strong> 条 · 第 ${page} / ${totalPages} 页</span>
        <div class="jihei-page-btns">
          <button type="button" class="dock-btn" ${attrName}="${Math.max(1, page - 1)}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
          <button type="button" class="dock-btn" ${attrName}="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     零依赖纯 SVG 轻量图表组件（迷你趋势线 / 进度环）
     ------------------------------------------------------------------------ */
  function renderSparklineSvg(values, opts) {
    opts = opts || {};
    const arr = Array.isArray(values) && values.length ? values.map(Number) : [0, 0];
    const w = opts.width || 140;
    const h = opts.height || 36;
    const pad = 4;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const span = max - min || 1;
    const color = opts.color || '#38f2ff';
    const pts = arr.map((v, i) => {
      const x = pad + (i / Math.max(1, arr.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const area = `${pad},${h - pad} ${pts.join(' ')} ${w - pad},${h - pad}`;
    return `
      <svg class="jihei-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
        <polygon points="${area}" fill="${color}" fill-opacity="0.16"/>
        <polyline points="${pts.join(' ')}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function renderDonutSvg(pct, opts) {
    opts = opts || {};
    const size = opts.size || 64;
    const stroke = opts.stroke || 6;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
    const offset = c * (1 - clamped / 100);
    const color = opts.color || '#38f2ff';
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(56,189,248,0.18)" stroke-width="${stroke}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
                stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
                stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/>
        <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="${Math.round(size * 0.22)}" font-weight="700">${clamped.toFixed(0)}%</text>
      </svg>
    `;
  }

  window.JIHEI_UI = {
    escHtml,
    fmtNum,
    fmtPct,
    store,
    renderStatusBadge,
    renderKpiCard,
    renderEmptyState,
    renderPagination,
    renderSparklineSvg,
    renderDonutSvg
  };
})();
