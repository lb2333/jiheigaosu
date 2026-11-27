'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  Plane,
  RotateCcw,
  Route,
  Save,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  SECTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
  secLabel,
  statusTagClass,
  type UavTaskDTO,
} from '../types';
import {
  NewTaskModal,
  PreflightModal,
  TaskCalendarModal,
} from './UavModals';

interface TasksResponse {
  tasks: UavTaskDTO[];
  allTasks: UavTaskDTO[];
  pageItems: UavTaskDTO[];
  total: number;
  page: number;
  totalPages: number;
  kpis: { total: number; todo: number; doing: number; pending: number; done: number };
}

export function TasksSubPage({
  activeSectionId,
  initialStatusFilter,
  initialSelectedTaskId,
  onSectionChange,
  onNavigateLive,
  showToast,
}: {
  activeSectionId: string | null;
  initialStatusFilter?: string;
  initialSelectedTaskId?: string;
  onSectionChange: (secId: string | null) => void;
  onNavigateLive: (taskId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [type, setType] = useState('全部类型');
  const [status, setStatus] = useState(initialStatusFilter || '全部状态');
  const [period, setPeriod] = useState('2026年11月');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(initialSelectedTaskId || 'UAV-20261126-01');
  const [data, setData] = useState<TasksResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showPreflight, setShowPreflight] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);

  // Editable draft form state synced with selected task
  const [draftName, setDraftName] = useState('');
  const [draftSecId, setDraftSecId] = useState('sec1');
  const [draftTarget, setDraftTarget] = useState('');
  const [draftType, setDraftType] = useState<'专项' | '全面' | '应急'>('专项');
  const [draftPlanTime, setDraftPlanTime] = useState('');
  const [draftUav, setDraftUav] = useState('无人机A02');
  const [draftOwner, setDraftOwner] = useState('巡检员B（演示）');
  const [draftRoute, setDraftRoute] = useState('BT-A V1.3');
  const [draftHangar, setDraftHangar] = useState('机巢A02');
  const [draftChecks, setDraftChecks] = useState<string[]>([]);

  const secParam = activeSectionId ?? 'all';

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: secParam,
      type,
      status,
      period,
      page: String(page),
      pageSize: '6',
    });
    const res = await fetch(`/api/v1/m09/tasks?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as TasksResponse;
      setData(json);
    }
  }, [secParam, type, status, period, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pageItems = useMemo(() => data?.pageItems ?? [], [data]);
  const allTasks = useMemo(() => data?.allTasks ?? [], [data]);

  const selTask = useMemo(() => {
    return (
      allTasks.find((t) => t.id === selectedId) ??
      pageItems[0] ??
      allTasks[0] ??
      null
    );
  }, [allTasks, pageItems, selectedId]);

  useEffect(() => {
    if (!selTask) return;
    setDraftName(selTask.name);
    setDraftSecId(selTask.sectionId);
    setDraftTarget(selTask.target);
    setDraftType((selTask.type as '专项' | '全面' | '应急') || '专项');
    setDraftPlanTime(selTask.planTime);
    setDraftUav(selTask.uav);
    setDraftOwner(selTask.owner);
    setDraftRoute(selTask.routeCode);
    setDraftHangar(selTask.hangar);
    setDraftChecks(selTask.checks);
  }, [selTask]);

  async function handleSavePlan() {
    if (!selTask) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m09/tasks/${encodeURIComponent(selTask.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'savePlan',
          name: draftName.trim() || selTask.name,
          sectionId: draftSecId,
          target: draftTarget.trim() || selTask.target,
          type: draftType,
          planTime: draftPlanTime.trim() || selTask.planTime,
          uav: draftUav,
          owner: draftOwner,
          routeCode: draftRoute,
          hangar: draftHangar,
          checks: draftChecks.length ? draftChecks : selTask.allChecks,
        }),
      });
      if (res.ok) {
        showToast(`已保存任务计划：${selTask.id}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '保存任务计划失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmPreflight() {
    if (!selTask) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m09/tasks/${encodeURIComponent(selTask.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'passPreflight' }),
      });
      if (res.ok) {
        setShowPreflight(false);
        showToast(`${selTask.id} 飞前检查已通过，现可点击「下发任务」`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '飞前检查确认失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDispatch() {
    if (!selTask || !selTask.preflightPassed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m09/tasks/${encodeURIComponent(selTask.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dispatch' }),
      });
      if (res.ok) {
        showToast(`已向 ${selTask.hangar} / ${selTask.uav} 下发巡检任务 ${selTask.id}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '下发任务失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTask(payload: {
    name: string;
    sectionId: string;
    target: string;
    type: '专项' | '全面' | '应急';
    planTime: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m09/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = (await res.json()) as { task: UavTaskDTO };
        setShowNewTask(false);
        setSelectedId(json.task.id);
        setPage(1);
        showToast(`已新建巡检任务 ${json.task.id}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '新建巡检任务失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const kpis = data?.kpis ?? { total: 24, todo: 4, doing: 1, pending: 3, done: 16 };
  const total = data?.total ?? 24;
  const totalPages = data?.totalPages ?? 4;
  const curPage = data?.page ?? page;

  const stages = [
    { idx: 1, name: '任务配置', icon: <FileText size={14} /> },
    { idx: 2, name: '航线规划', icon: <Route size={14} /> },
    { idx: 3, name: '飞行前检查', icon: <ShieldCheck size={14} /> },
    { idx: 4, name: '执行巡检与取证', icon: <Plane size={14} /> },
    { idx: 5, name: '识别与人工核查', icon: <Search size={14} /> },
    { idx: 6, name: '复查与报告归档', icon: <Save size={14} /> },
  ];

  const activeStage = selTask
    ? selTask.status === '已完成'
      ? 6
      : selTask.status === '待整理'
        ? 5
        : selTask.status === '执行中'
          ? 4
          : selTask.preflightPassed
            ? 4
            : 3
    : 3;

  return (
    <div className="m09-opaque-page">
      {/* Top Filter Bar */}
      <div className="m09-filter-bar">
        <div className="m09-filter-group">
          <label className="m09-field-inline">
            所属工区
            <select
              className="m09-select"
              value={secParam}
              onChange={(e) => {
                setPage(1);
                onSectionChange(e.target.value === 'all' ? null : e.target.value);
              }}
            >
              <option value="all">全部工区</option>
              {SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            巡检类型
            <select
              className="m09-select"
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              {TASK_TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            任务状态
            <select
              className="m09-select"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              {TASK_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            统计周期
            <select
              className="m09-select"
              value={period}
              onChange={(e) => {
                setPage(1);
                setPeriod(e.target.value);
              }}
            >
              <option value="2026年11月">2026年11月</option>
              <option value="2026年10月">2026年10月</option>
            </select>
          </label>
        </div>
        <div className="m09-filter-group">
          <button
            type="button"
            className="m09-btn primary"
            onClick={() => {
              void loadData();
              showToast(`已筛选出 ${total} 项巡检任务`);
            }}
          >
            <Search size={13} /> 查询
          </button>
          <button
            type="button"
            className="m09-btn"
            onClick={() => {
              onSectionChange(null);
              setType('全部类型');
              setStatus('全部状态');
              setPage(1);
            }}
          >
            <RotateCcw size={13} /> 重置
          </button>
          <button
            type="button"
            className="m09-btn"
            onClick={() => setShowNewTask(true)}
          >
            + 新建巡检任务
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="m09-section-title">
        <span className="panel-accent-bar" /> 任务执行概况 <small>({period})</small>
      </div>
      <div className="m09-kpi-5">
        <div
          className="m09-kpi-card"
          onClick={() => {
            setStatus('全部状态');
            setPage(1);
          }}
        >
          <div className="m09-kpi-icon">
            <FileText size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">本期任务</div>
            <div className="m09-kpi-num">
              {kpis.total}
              <span>项</span>
            </div>
          </div>
        </div>
        <div
          className="m09-kpi-card"
          onClick={() => {
            setStatus('待执行');
            setPage(1);
          }}
        >
          <div className="m09-kpi-icon gold">
            <Calendar size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">待执行</div>
            <div className="m09-kpi-num gold">
              {kpis.todo}
              <span>项</span>
            </div>
          </div>
        </div>
        <div
          className="m09-kpi-card"
          onClick={() => {
            setStatus('执行中');
            setPage(1);
          }}
        >
          <div className="m09-kpi-icon">
            <Plane size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">执行中</div>
            <div className="m09-kpi-num">
              {kpis.doing}
              <span>项</span>
            </div>
          </div>
        </div>
        <div
          className="m09-kpi-card"
          onClick={() => {
            setStatus('待整理');
            setPage(1);
          }}
        >
          <div className="m09-kpi-icon">
            <FileText size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">待整理</div>
            <div className="m09-kpi-num">
              {kpis.pending}
              <span>项</span>
            </div>
          </div>
        </div>
        <div
          className="m09-kpi-card"
          onClick={() => {
            setStatus('已完成');
            setPage(1);
          }}
        >
          <div className="m09-kpi-icon green">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">已完成</div>
            <div className="m09-kpi-num green">
              {kpis.done}
              <span>项</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower 2-Column Split */}
      <div className="m09-split-63-37">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div className="glass-panel">
            <div className="panel-header" style={{ cursor: 'default' }}>
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">任务列表</span>
              </div>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => setShowCalendar(true)}
              >
                日历视图 <Calendar size={13} />
              </button>
            </div>
            <div className="panel-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>任务编号</th>
                    <th>巡检任务</th>
                    <th>工区与巡检对象</th>
                    <th>类型</th>
                    <th>计划时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((t) => {
                    const isSel = selTask?.id === t.id;
                    const actLbl =
                      t.status === '待执行' ? '编辑' : t.status === '执行中' ? '监控' : '查看';
                    return (
                      <tr
                        key={t.id}
                        className={`m09-tr ${isSel ? 'selected' : ''}`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <td style={{ fontWeight: 700, color: '#eaf4ff' }}>{t.id}</td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{t.name}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{secLabel(t.sectionId)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {t.target}
                          </div>
                        </td>
                        <td>{t.type}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>{t.shortTime}</td>
                        <td>
                          <span className={`status-tag ${statusTagClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m09-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(t.id);
                              if (actLbl === '监控') onNavigateLive(t.id);
                            }}
                          >
                            {actLbl}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="m09-pager">
                <span style={{ marginRight: '4px' }}>共 {total} 项任务</span>
                <button
                  type="button"
                  className="m09-page-btn"
                  disabled={curPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`m09-page-btn ${p === curPage ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="m09-page-btn"
                  disabled={curPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* 6-Stage Stepper */}
          <div className="glass-panel">
            <div className="panel-header" style={{ cursor: 'default' }}>
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">任务执行流程</span>
              </div>
              <span className="panel-subtitle">{selTask?.id ?? ''}</span>
            </div>
            <div className="panel-body">
              <div className="m09-stepper">
                {stages.map((st) => {
                  const cls =
                    st.idx < activeStage ? 'done' : st.idx === activeStage ? 'active' : '';
                  return (
                    <div key={st.idx} className={`m09-step-box ${cls}`}>
                      {st.icon}
                      <span>{st.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="m09-hint-box">
                ⓘ 飞前检查包括设备、通信、气象、现场条件及授权核验。
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector: 任务详情与配置 */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">任务详情与配置</span>
            </div>
          </div>
          <div className="panel-body">
            {selTask ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{selTask.id}</strong>
                  <span className={`status-tag ${statusTagClass(selTask.status)}`}>
                    {selTask.status}
                  </span>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '8px' }}>
                  <span className="m09-form-lbl">任务名称</span>
                  <input
                    className="m09-input"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>
                <div className="m09-form-grid-2">
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">所属工区</span>
                    <select
                      className="m09-select"
                      value={draftSecId}
                      onChange={(e) => setDraftSecId(e.target.value)}
                    >
                      {SECTIONS.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">巡检对象</span>
                    <input
                      className="m09-input"
                      value={draftTarget}
                      onChange={(e) => setDraftTarget(e.target.value)}
                    />
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">巡检类型</span>
                    <select
                      className="m09-select"
                      value={draftType}
                      onChange={(e) =>
                        setDraftType(e.target.value as '专项' | '全面' | '应急')
                      }
                    >
                      <option value="专项">专项巡检</option>
                      <option value="全面">全面巡检</option>
                      <option value="应急">应急巡检</option>
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">计划执行</span>
                    <input
                      className="m09-input"
                      value={draftPlanTime}
                      onChange={(e) => setDraftPlanTime(e.target.value)}
                    />
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">执行设备</span>
                    <select
                      className="m09-select"
                      value={draftUav}
                      onChange={(e) => setDraftUav(e.target.value)}
                    >
                      {['无人机A01', '无人机A02', '无人机A03', '无人机B01', '无人机B02'].map(
                        (u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">巡检负责人</span>
                    <select
                      className="m09-select"
                      value={draftOwner}
                      onChange={(e) => setDraftOwner(e.target.value)}
                    >
                      {[
                        '巡检员A（演示）',
                        '巡检员B（演示）',
                        '巡检员C（演示）',
                        '巡检员D（演示）',
                      ].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">关联航线</span>
                    <select
                      className="m09-select"
                      value={draftRoute}
                      onChange={(e) => setDraftRoute(e.target.value)}
                    >
                      {['BT-A V1.3', 'LC-A V2.0', 'QL-A V1.1', 'LJ-C V1.0', 'LC-B V1.2'].map(
                        (r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">机巢</span>
                    <select
                      className="m09-select"
                      value={draftHangar}
                      onChange={(e) => setDraftHangar(e.target.value)}
                    >
                      {['机巢A01', '机巢A02', '机巢B01', '机巢B02'].map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                  }}
                >
                  <span className="m09-form-lbl">检查内容</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {selTask.scene}
                  </span>
                </div>
                <div className="m09-chip-row">
                  {selTask.allChecks.map((ch) => {
                    const on = draftChecks.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        className={`m09-check-chip ${on ? 'on' : ''}`}
                        onClick={() => {
                          setDraftChecks((prev) =>
                            prev.includes(ch)
                              ? prev.filter((x) => x !== ch)
                              : [...prev, ch]
                          );
                        }}
                      >
                        {on ? '✓ ' : ''}
                        {ch}
                      </button>
                    );
                  })}
                </div>
                <div
                  className="m09-hint-box"
                  style={{
                    marginBottom: '10px',
                    borderColor: selTask.preflightPassed
                      ? 'rgba(34,197,94,0.55)'
                      : undefined,
                    color: selTask.preflightPassed ? '#bbf7d0' : undefined,
                  }}
                >
                  {selTask.preflightPassed
                    ? selTask.status === '执行中'
                      ? '✓ 任务已下发执行中，可点击列表「监控」进入实时画面。'
                      : '✓ 飞前检查已通过，已解锁「下发任务」。'
                    : 'ⓘ 航线已审核，飞行前检查待完成。'}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.15fr 1fr',
                    gap: '7px',
                  }}
                >
                  <button
                    type="button"
                    className="m09-btn"
                    disabled={submitting}
                    onClick={() => void handleSavePlan()}
                  >
                    <Save size={13} /> 保存计划
                  </button>
                  <button
                    type="button"
                    className="m09-btn primary"
                    disabled={submitting}
                    onClick={() => setShowPreflight(true)}
                  >
                    <ShieldCheck size={13} /> 去飞前检查
                  </button>
                  <button
                    type="button"
                    className={`m09-btn ${
                      selTask.preflightPassed && selTask.status === '待执行' ? 'gold' : ''
                    }`}
                    disabled={
                      submitting ||
                      !selTask.preflightPassed ||
                      selTask.status !== '待执行'
                    }
                    onClick={() => void handleDispatch()}
                  >
                    <Lock size={13} /> 下发任务
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-sub)', padding: '20px 0', textAlign: 'center' }}>
                正在加载巡检任务配置...
              </div>
            )}
          </div>
        </div>
      </div>

      {showCalendar ? (
        <TaskCalendarModal tasks={allTasks} onClose={() => setShowCalendar(false)} />
      ) : null}

      {showPreflight && selTask ? (
        <PreflightModal
          task={selTask}
          submitting={submitting}
          onConfirm={handleConfirmPreflight}
          onClose={() => setShowPreflight(false)}
          showToast={showToast}
        />
      ) : null}

      {showNewTask ? (
        <NewTaskModal
          submitting={submitting}
          onSubmit={handleCreateTask}
          onClose={() => setShowNewTask(false)}
        />
      ) : null}
    </div>
  );
}
