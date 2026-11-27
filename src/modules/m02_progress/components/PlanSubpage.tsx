'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Link2, RotateCcw, Search } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { M02PlanNode, M02PlanResponse, M02PlanTask } from '../types';
import { M02Icon } from './M02Icon';
import { M02Modal } from './M02Modal';

const TREE_CATEGORIES = [
  { name: '路基工程', icon: 'subgrade' },
  { name: '桥梁工程', icon: 'bridge' },
  { name: '路面工程', icon: 'pavement' },
  { name: '场站工程', icon: 'yard' },
  { name: '交安工程', icon: 'guardrail' },
  { name: '绿化工程', icon: 'leaf' },
];

const GANTT_MONTHS = [
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
  '2026-12',
];

function toneOf(t: string): BadgeTone {
  if (t === 'ok') return 'ok';
  if (t === 'warn') return 'warn';
  if (t === 'danger') return 'danger';
  return 'info';
}

export function PlanSubpage() {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const showToast = usePlatformStore((s) => s.showToast);

  const [secFilter, setSecFilter] = useState<string>(activeSectionId ?? 'all');
  const [level, setLevel] = useState<string>('total');
  const [range, setRange] = useState<string>('2026');
  const [keyword, setKeyword] = useState<string>('');
  const [treeCat, setTreeCat] = useState<string>('桥梁工程');
  const [applied, setApplied] = useState({
    secId: activeSectionId ?? 'all',
    level: 'total',
    range: '2026',
    keyword: '',
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('n4');
  const [data, setData] = useState<M02PlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [taskModal, setTaskModal] = useState<M02PlanTask | null>(null);
  const [assocModalNode, setAssocModalNode] = useState<M02PlanNode | null>(null);
  const [editNode, setEditNode] = useState<M02PlanNode | null>(null);
  const [editStatus, setEditStatus] = useState<string>('按计划推进');
  const [editDate, setEditDate] = useState<string>('2026-11-20');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const nextSec = activeSectionId ?? 'all';
    setSecFilter(nextSec);
    setApplied((prev) => ({ ...prev, secId: nextSec }));
  }, [activeSectionId]);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        sectionId: applied.secId,
        level: applied.level,
        range: applied.range,
        category: treeCat,
        keyword: applied.keyword,
      });
      const res = await fetch(`/api/v1/m02/plan?${qs.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as M02PlanResponse;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [applied, treeCat]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const sections = data?.sections ?? [
    { id: 'sec1', name: '一工区' },
    { id: 'sec2', name: '二工区' },
    { id: 'sec3', name: '三工区' },
    { id: 'sec4', name: '四工区' },
    { id: 'sec5', name: '五工区' },
    { id: 'sec6', name: '六工区' },
  ];
  const tasks = data?.tasks ?? [];
  const allNodes = data?.nodes ?? [];
  const shortListNodes = data?.shortListNodes ?? [];
  const assocNodes = data?.assocNodes ?? [];
  const activeNode =
    allNodes.find((n) => n.id === selectedNodeId) ?? allNodes[3] ?? allNodes[0] ?? null;

  const kpis = data?.kpis ?? {
    totalNodesCount: 18,
    monthTodoCount: 4,
    expiringCount: 3,
    stageLabel: '施工高峰期',
  };

  const stepperIds = ['n1', 'n2', 'n3', 'n4', 'n7'];
  const stepperNodes = stepperIds
    .map((id) => allNodes.find((n) => n.id === id))
    .filter((n): n is M02PlanNode => !!n);

  function applyFilter() {
    setApplied({ secId: secFilter, level, range, keyword });
  }

  async function handleSaveNode(e: React.FormEvent) {
    e.preventDefault();
    if (!editNode) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/m02/plan/nodes/${editNode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          planDate: editDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || '节点状态更新失败（需工程师/监理/管理员权限）');
        return;
      }
      setEditNode(null);
      showToast(`已更新节点「${json.node.title}」状态为 ${json.node.status}`);
      await fetchPlan();
    } finally {
      setSaving(false);
    }
  }

  // Gantt SVG geometry
  const W = 920;
  const rowH = 22;
  const padL = 118;
  const padR = 16;
  const padT = 54;
  const padB = 8;
  const H = padT + Math.max(1, tasks.length) * rowH + padB;
  const plotW = W - padL - padR;
  const colW = plotW / GANTT_MONTHS.length;
  const progressX = padL + 6.9 * colW;

  return (
    <div className="m02-page m02-plan-page">
      {/* Top Filter Bar */}
      <div className="m02-filter-bar">
        <div className="m02-filter-row">
          <div className="m02-filter-left">
            <span className="m02-filter-label">所属工区</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 115px' }}
              value={secFilter}
              onChange={(e) => setSecFilter(e.target.value)}
            >
              <option value="all">全线</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="m02-filter-label">计划层级</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 128px' }}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="total">总体计划</option>
              <option value="year">年度阶段计划</option>
              <option value="month">月度滚动计划</option>
            </select>
            <span className="m02-filter-label">时间范围</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 120px' }}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="2026">2026年</option>
              <option value="2026-2027">2026—2027年</option>
            </select>
            <input
              className="m02-input"
              type="text"
              placeholder="工程对象 / 关键词搜索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilter();
              }}
            />
          </div>
          <div className="m02-filter-right">
            <button
              type="button"
              className="dock-btn primary"
              style={{ padding: '6px 18px' }}
              onClick={applyFilter}
            >
              <Search size={13} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '6px 14px' }}
              onClick={() => {
                setSecFilter('all');
                setLevel('total');
                setRange('2026');
                setKeyword('');
                setTreeCat('all');
                setApplied({ secId: 'all', level: 'total', range: '2026', keyword: '' });
              }}
            >
              <RotateCcw size={13} />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="m02-plan-kpi-4">
        <KpiCard label="关键节点总数" value={kpis.totalNodesCount} unit="项" />
        <KpiCard label="本月待完成" value={kpis.monthTodoCount} unit="项" tone="gold" />
        <KpiCard label="即将到期" value={kpis.expiringCount} unit="项" tone="gold" />
        <KpiCard label="当前阶段" value={kpis.stageLabel} tone="green" trend="受控推进" />
      </div>

      {/* 3-Column Main Grid */}
      <div className="m02-plan-grid">
        {/* Left Column */}
        <div className="m02-plan-col">
          <GlassPanel title="计划结构">
            <div className="m02-tree-list">
              <button
                type="button"
                className={`m02-tree-root ${treeCat === 'all' ? 'active' : ''}`}
                onClick={() => setTreeCat('all')}
              >
                <span>▾</span>
                <span>📁</span>
                <span>总体计划</span>
              </button>
              {TREE_CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`m02-tree-item ${treeCat === c.name ? 'active' : ''}`}
                  onClick={() => setTreeCat(c.name)}
                >
                  <M02Icon name={c.icon} size={15} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel title="计划说明">
            <div className="m02-note-list">
              <div>
                • <strong>总体计划</strong> 2026年3月—2027年5月，统筹路基、桥梁、路面等各专业工程。
              </div>
              <div>
                • <strong>阶段目标</strong> 2026年12月底前完成桥梁主体及路面基层施工，为2027年上半年路面贯通创造条件。
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Center Column */}
        <div className="m02-plan-col">
          <GlassPanel
            title="总体计划与阶段计划"
            headerRight={
              <span className="text-[11.5px] text-[var(--text-sub)]">
                {applied.level === 'month'
                  ? '月度滚动计划'
                  : applied.level === 'year'
                    ? '年度阶段计划'
                    : '总体计划'}{' '}
                · {applied.range === '2026-2027' ? '2026—2027年' : '2026年'} ·{' '}
                {treeCat === 'all' ? '全专业' : treeCat}
              </span>
            }
          >
            <div className="m02-gantt-wrap">
              <svg className="m02-gantt-svg" viewBox={`0 0 ${W} ${H}`}>
                <defs>
                  <linearGradient id="m02-ganttGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#38f2ff" />
                  </linearGradient>
                </defs>
                <text x="8" y={padT - 11} fill="#93c5fd" fontSize="11.5" fontWeight="700">
                  工程任务
                </text>
                {GANTT_MONTHS.map((m, i) => {
                  const x = padL + i * colW;
                  return (
                    <g key={m}>
                      <line
                        x1={x}
                        y1={padT - 5}
                        x2={x}
                        y2={H - 4}
                        stroke="rgba(125,211,252,0.14)"
                      />
                      <text
                        x={x + colW / 2}
                        y={padT - 11}
                        fill="#cfe4ff"
                        fontSize="11.5"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {m}
                      </text>
                    </g>
                  );
                })}
                <line
                  x1={W - padR}
                  y1={padT - 5}
                  x2={W - padR}
                  y2={H - 4}
                  stroke="rgba(125,211,252,0.14)"
                />
                {tasks.map((t, i) => {
                  const cy = padT + i * rowH + rowH / 2;
                  const x1 = padL + t.startMonthIdx * colW;
                  const x2 = padL + t.endMonthIdx * colW;
                  const ax2 = padL + t.actualMonthIdx * colW;
                  const planW = Math.max(12, x2 - x1);
                  const actW = Math.max(8, ax2 - x1);
                  const mx = t.milestoneMonthIdx !== null ? padL + t.milestoneMonthIdx * colW : null;
                  return (
                    <g
                      key={t.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setTaskModal(t)}
                    >
                      <line
                        x1="0"
                        y1={padT + (i + 1) * rowH}
                        x2={W}
                        y2={padT + (i + 1) * rowH}
                        stroke="rgba(56,189,248,0.12)"
                      />
                      <text x="8" y={cy + 4} fill="#eaf4ff" fontSize="12" fontWeight="600">
                        {t.name}
                      </text>
                      <rect
                        x={x1}
                        y={cy - 4.5}
                        width={planW}
                        height="9"
                        rx="4.5"
                        fill="rgba(30, 64, 124, 0.85)"
                        stroke="rgba(56,189,248,0.3)"
                      />
                      <rect
                        x={x1}
                        y={cy - 4.5}
                        width={actW}
                        height="9"
                        rx="4.5"
                        fill="url(#m02-ganttGrad)"
                      />
                      {mx !== null ? (
                        <polygon
                          points={`${mx},${cy - 5} ${mx + 5},${cy} ${mx},${cy + 5} ${mx - 5},${cy}`}
                          fill="#facc15"
                          stroke="#fff"
                          strokeWidth="0.8"
                        />
                      ) : null}
                    </g>
                  );
                })}
                <line
                  x1={progressX}
                  y1={padT - 5}
                  x2={progressX}
                  y2={H - 4}
                  stroke="#38f2ff"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
                <rect
                  x={progressX - 42}
                  y="2"
                  width="84"
                  height="17"
                  rx="8.5"
                  fill="rgba(10,42,92,0.96)"
                  stroke="#38f2ff"
                  strokeWidth="1"
                />
                <text
                  x={progressX}
                  y="14"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  2026-09-28
                </text>
              </svg>
            </div>
            <div className="m02-gantt-legend">
              <span className="m02-legend-item">
                <span className="inline-block w-3.5 h-1.5 rounded-[3px] bg-[#1e3a6e]" />
                计划工期
              </span>
              <span className="m02-legend-item">
                <span className="inline-block w-3.5 h-1.5 rounded-[3px] bg-[#22d3ee]" />
                实际进度
              </span>
              <span className="m02-legend-item">
                <span className="inline-block w-2.5 h-2.5 rotate-45 bg-[#facc15]" />
                关键节点
              </span>
              <span className="m02-legend-item">
                <span className="inline-block w-3.5 border-t-2 border-dashed border-[#38f2ff]" />
                当前进度线 (2026-09-28)
              </span>
            </div>
          </GlassPanel>

          <GlassPanel title="关键建设节点">
            <div className="m02-ms-stepper">
              <div className="m02-ms-line" />
              {stepperNodes.map((node) => {
                const done = node.status === '已完成';
                const active = activeNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`m02-ms-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div className="m02-ms-box">
                      <div className="m02-ms-title">{node.title}</div>
                      <div className="m02-ms-date">{node.planDate}</div>
                    </div>
                    <div className="m02-ms-dot">{done ? '✓' : ''}</div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>

          <GlassPanel title="节点关联工程" bodyClassName="m02-table-wrap">
            <table className="data-table m02-assoc-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>节点名称</th>
                  <th>关联工程</th>
                  <th>责任专业</th>
                  <th>计划日期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {assocNodes.map((n, idx) => (
                  <tr
                    key={n.id}
                    className={`m02-row-clickable ${activeNode?.id === n.id ? 'm02-row-selected' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    <td>{idx + 1}</td>
                    <td className="font-bold text-white">{n.title}</td>
                    <td>{n.taskName}</td>
                    <td>{n.specialty}</td>
                    <td className="tabular-nums">{n.planDate}</td>
                    <td>
                      <StatusBadge text={n.status} tone={toneOf(n.statusTone)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        </div>

        {/* Right Column */}
        <div className="m02-plan-col">
          <GlassPanel title="节点清单" subtitle="(近期关键节点)" bodyClassName="m02-table-wrap">
            <table className="data-table m02-node-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>节点名称</th>
                  <th>计划日期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {shortListNodes.map((n, idx) => (
                  <tr
                    key={n.id}
                    className={`m02-row-clickable ${activeNode?.id === n.id ? 'm02-row-selected' : ''}`}
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    <td>{n.listOrder || idx + 1}</td>
                    <td className="font-bold text-white">{n.title}</td>
                    <td className="tabular-nums text-[11.5px]">{n.planDate}</td>
                    <td>
                      <StatusBadge text={n.status} tone={toneOf(n.statusTone)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>

          <GlassPanel
            title="节点详情"
            headerRight={
              activeNode ? (
                <button
                  type="button"
                  className="m02-action-link inline-flex items-center gap-1"
                  onClick={() => {
                    setEditNode(activeNode);
                    setEditStatus(activeNode.status);
                    setEditDate(activeNode.planDate);
                  }}
                >
                  <Edit3 size={12} />
                  <span>调整状态</span>
                </button>
              ) : null
            }
          >
            {activeNode ? (
              <>
                <div className="flex items-center gap-2 text-base font-extrabold text-white mb-3">
                  <M02Icon name="bridge" size={18} />
                  <span>{activeNode.title}</span>
                  {loading ? <span className="text-[11px] text-sky-300 font-normal">同步中</span> : null}
                </div>
                <div className="m02-kv-list">
                  <div className="m02-kv-row">
                    <span className="m02-kv-k">
                      <M02Icon name="layers" size={14} />
                      所属工区
                    </span>
                    <span className="m02-kv-v">{activeNode.sectionName}</span>
                  </div>
                  <div className="m02-kv-row">
                    <span className="m02-kv-k">
                      <M02Icon name="bridge" size={14} />
                      工程对象
                    </span>
                    <span className="m02-kv-v">{activeNode.objectName}</span>
                  </div>
                  <div className="m02-kv-row">
                    <span className="m02-kv-k">
                      <M02Icon name="calendar" size={14} />
                      计划日期
                    </span>
                    <span className="m02-kv-v">{activeNode.planDate}</span>
                  </div>
                  <div className="m02-kv-row">
                    <span className="m02-kv-k">
                      <M02Icon name="doc" size={14} />
                      关联工程
                    </span>
                    <span className="m02-kv-v">{activeNode.taskName}</span>
                  </div>
                  <div className="m02-kv-row" style={{ borderBottom: 'none' }}>
                    <span className="m02-kv-k">
                      <M02Icon name="flag" size={14} />
                      当前状态
                    </span>
                    <StatusBadge text={activeNode.status} tone={toneOf(activeNode.statusTone)} />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary-glow"
                  onClick={() => setAssocModalNode(activeNode)}
                >
                  <Link2 size={15} />
                  <span>查看关联工程</span>
                </button>
              </>
            ) : (
              <div className="jihei-empty">暂无节点数据</div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Gantt Task Detail Modal */}
      <M02Modal
        open={!!taskModal}
        title={taskModal ? `计划任务详情 · ${taskModal.name}` : ''}
        onClose={() => setTaskModal(null)}
      >
        {taskModal ? (
          <>
            <div className="detail-grid">
              <div className="detail-stat-card">
                <span>专业分类</span>
                <strong>{taskModal.category}</strong>
              </div>
              <div className="detail-stat-card">
                <span>计划周期</span>
                <strong>
                  2026-{String(Math.floor(taskModal.startMonthIdx) + 3).padStart(2, '0')} ~ 2026-
                  {String(Math.min(12, Math.ceil(taskModal.endMonthIdx) + 3)).padStart(2, '0')}
                </strong>
              </div>
              <div className="detail-stat-card">
                <span>当前状态</span>
                <strong>{taskModal.status}</strong>
              </div>
            </div>
            <p className="text-[#dbeafe] leading-relaxed text-sm">
              该工序任务受控推进，已关联至工区月度计划与关键里程碑节点控制线。
            </p>
          </>
        ) : null}
      </M02Modal>

      {/* Associated Engineering Modal */}
      <M02Modal
        open={!!assocModalNode}
        title={assocModalNode ? `节点关联工程 · ${assocModalNode.objectName}` : ''}
        onClose={() => setAssocModalNode(null)}
      >
        {assocModalNode ? (
          <>
            <div className="detail-grid">
              <div className="detail-stat-card">
                <span>所属工区</span>
                <strong>{assocModalNode.sectionName}</strong>
              </div>
              <div className="detail-stat-card">
                <span>计划日期</span>
                <strong>{assocModalNode.planDate}</strong>
              </div>
              <div className="detail-stat-card">
                <span>节点状态</span>
                <strong>{assocModalNode.status}</strong>
              </div>
            </div>
            <table className="data-table">
              <tbody>
                <tr>
                  <th style={{ width: '120px' }}>节点名称</th>
                  <td>{assocModalNode.title}</td>
                  <th style={{ width: '120px' }}>关联工程任务</th>
                  <td>{assocModalNode.taskName}</td>
                </tr>
                <tr>
                  <th>责任专业</th>
                  <td>{assocModalNode.specialty}</td>
                  <th>管控层级</th>
                  <td>总体控制性节点</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                className="dock-btn primary"
                onClick={() => {
                  const secId = assocModalNode.sectionId || 'sec2';
                  setAssocModalNode(null);
                  router.push(`/progress/bim_a?sectionId=${secId}&objectId=bridgeA`);
                }}
              >
                进入三维 BIM 进度模拟
              </button>
            </div>
          </>
        ) : null}
      </M02Modal>

      {/* Edit Plan Node Status / Date Modal */}
      <M02Modal
        open={!!editNode}
        title={editNode ? `调整关键节点进度 · ${editNode.title}` : ''}
        onClose={() => setEditNode(null)}
      >
        {editNode ? (
          <form onSubmit={handleSaveNode} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
              <span>节点状态</span>
              <select
                className="glass-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="已完成">已完成</option>
                <option value="按计划推进">按计划推进</option>
                <option value="正常">正常</option>
                <option value="滞后预警">滞后预警</option>
                <option value="规划节点">规划节点</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
              <span>计划日期</span>
              <input
                type="date"
                className="m02-input"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="dock-btn" onClick={() => setEditNode(null)}>
                取消
              </button>
              <button type="submit" className="dock-btn primary" disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </button>
            </div>
          </form>
        ) : null}
      </M02Modal>
    </div>
  );
}
