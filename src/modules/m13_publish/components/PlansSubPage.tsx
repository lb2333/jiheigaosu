'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Cloud,
  FileText,
  Info,
  Layers,
  Link2,
  Lock,
  Pencil,
  Route,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Tv,
} from 'lucide-react';
import {
  SECTIONS,
  statusTagClass,
  type PublishNavBridge,
  type PublishOrderDTO,
  type PublishPlanDTO,
  type PublishTemplateDTO,
} from '../types';
import { ConfigPlanModal, PlanTriggersModal } from './PublishModalsLazy';

interface PlansResponse {
  plans: PublishPlanDTO[];
  allPlans: PublishPlanDTO[];
  kpis: {
    total: number;
    approved: number;
    met: number;
    pending: number;
  };
  orders: PublishOrderDTO[];
  templates: PublishTemplateDTO[];
}

export function PlansSubPage({
  activeSectionId,
  onSectionChange,
  onNavigate,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  onNavigate: (subPage: string, bridge?: PublishNavBridge) => void;
  showToast: (msg: string) => void;
}) {
  const [sceneFilter, setSceneFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [ifaceFilter, setIfaceFilter] = useState('all');
  const [secFilter, setSecFilter] = useState(activeSectionId ?? 'all');
  const [condFilter, setCondFilter] = useState('all');
  const [selectedPlanId, setSelectedPlanId] = useState('YA-DG-003');

  const [data, setData] = useState<PlansResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTriggersModal, setShowTriggersModal] = useState(false);

  useEffect(() => {
    setSecFilter(activeSectionId ?? 'all');
  }, [activeSectionId]);

  const fetchPlans = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        scene: sceneFilter,
        approval: approvalFilter,
        iface: ifaceFilter,
        sectionId: secFilter,
        cond: condFilter,
      });
      const res = await fetch(`/api/v1/m13/plans?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      const json = (await res.json()) as PlansResponse;
      setData(json);
      if (json.plans.length > 0) {
        setSelectedPlanId((prev) =>
          json.plans.some((p) => p.id === prev) ? prev : json.plans[0].id
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载联动预案失败');
    }
  }, [sceneFilter, approvalFilter, ifaceFilter, secFilter, condFilter, showToast]);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const plans = data?.plans ?? [];
  const allPlans = data?.allPlans ?? [];
  const sel =
    plans.find((p) => p.id === selectedPlanId) ??
    allPlans.find((p) => p.id === selectedPlanId) ??
    plans[0] ??
    allPlans[0] ??
    null;

  const linkedOrder =
    sel?.linkedOrderId
      ? (data?.orders ?? []).find((o) => o.id === sel.linkedOrderId) ?? null
      : null;

  function renderSceneIcon(scene: string) {
    if (scene === '施工导改') return <Route size={17} />;
    if (scene === '天气预警') return <Cloud size={17} />;
    return <TrendingUp size={17} />;
  }

  const planSteps = sel
    ? [
        {
          ico: <Route size={16} />,
          title: '外部事件',
          sub:
            sel.scene === '施工导改'
              ? '导改时段生效'
              : sel.scene === '天气预警'
                ? '气象预警信号'
                : '速度策略推送',
        },
        {
          ico: <Link2 size={16} />,
          title: '计划匹配',
          sub: '接口与预案核验',
        },
        {
          ico: <FileText size={16} />,
          title: '形成发布草稿',
          sub: '匹配对象与文案',
        },
        {
          ico: <Lock size={16} />,
          title: '审核与授权',
          sub: '确认后下发',
        },
        {
          ico: <Tv size={16} />,
          title: '设备反馈',
          sub: '接收与显示核验',
        },
      ]
    : [];

  async function handleSaveConfig(payload: {
    name: string;
    scene: '施工导改' | '天气预警' | '智慧提速';
    approvalStatus: '已批准' | '待批准';
    interfaceStatus: '接口就绪' | '待接入' | '待核验';
    templateId: string;
    validRange: string;
  }) {
    if (!sel) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m13/plans/${encodeURIComponent(sel.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'config', ...payload }),
        }
      );
      const json = (await res.json()) as {
        plan?: PublishPlanDTO;
        error?: string;
      };
      if (!res.ok || !json.plan) {
        throw new Error(json.error || '更新预案配置失败');
      }
      setShowConfigModal(false);
      showToast(`已更新联动预案 ${json.plan.id} 配置`);
      await fetchPlans();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '更新预案配置失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApproveVerify() {
    if (!sel) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m13/plans/${encodeURIComponent(sel.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve_verify' }),
        }
      );
      const json = (await res.json()) as {
        plan?: PublishPlanDTO;
        error?: string;
      };
      if (!res.ok || !json.plan) {
        throw new Error(json.error || '完成核验失败');
      }
      setShowTriggersModal(false);
      showToast(`联动预案 ${json.plan.id} 已满足全部联动条件`);
      await fetchPlans();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '完成核验失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSceneFilter('all');
    setApprovalFilter('all');
    setIfaceFilter('all');
    setSecFilter('all');
    setCondFilter('all');
    onSectionChange(null);
  }

  function handleKpiClick(kind: 'all' | 'approved' | 'met' | 'pending') {
    setSceneFilter('all');
    setSecFilter('all');
    setIfaceFilter('all');
    setApprovalFilter('all');
    setCondFilter('all');
    onSectionChange(null);
    if (kind === 'approved') setApprovalFilter('已批准');
    else if (kind === 'met') setCondFilter('met');
    else if (kind === 'pending') setCondFilter('pending');
  }

  return (
    <div className="m13-page">
      <div className="m13-filter-bar">
        <div className="m13-filter-group">
          <div className="m13-filter-item">
            <label>关联场景</label>
            <select
              className="m13-select"
              value={sceneFilter}
              onChange={(e) => setSceneFilter(e.target.value)}
            >
              <option value="all">全部场景</option>
              <option value="施工导改">施工导改</option>
              <option value="天气预警">天气预警</option>
              <option value="智慧提速">智慧提速</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>预案审批</label>
            <select
              className="m13-select"
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="已批准">已批准</option>
              <option value="待批准">待批准</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>接口状态</label>
            <select
              className="m13-select"
              value={ifaceFilter}
              onChange={(e) => setIfaceFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="接口就绪">接口就绪</option>
              <option value="待接入">待接入</option>
              <option value="待核验">待核验</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>所属工区</label>
            <select
              className="m13-select"
              value={secFilter}
              onChange={(e) => {
                const v = e.target.value;
                setSecFilter(v);
                onSectionChange(v === 'all' ? null : v);
              }}
            >
              <option value="all">全部工区</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m13-filter-actions">
          <button
            type="button"
            className="m13-btn-primary"
            onClick={() => {
              setCondFilter('all');
              void fetchPlans();
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m13-btn-ghost"
            onClick={handleReset}
          >
            <RotateCcw size={14} /> 重置
          </button>
          <button
            type="button"
            className="m13-btn-ghost"
            onClick={() => {
              if (sel) setShowConfigModal(true);
            }}
          >
            <Pencil size={14} /> 配置预案
          </button>
        </div>
      </div>

      <section className="m13-panel">
        <div className="m13-panel-head">
          <div className="m13-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">预案配置概况</span>
            <span className="m13-panel-sub">(2026年11月)</span>
          </div>
        </div>
        <div className="m13-panel-body">
          <div className="m13-kpi-grid-4">
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('all')}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <Layers size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">联动预案</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.total ?? 3}
                  <span className="m13-kpi-unit">项</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('approved')}
            >
              <div className="m13-kpi-ico m13-ico-green">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">已批准</div>
                <div className="m13-kpi-val m13-c-green">
                  {data?.kpis.approved ?? 2}
                  <span className="m13-kpi-unit">项</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('met')}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <Link2 size={17} />
              </div>
              <div>
                <div className="m13-kpi-label">满足联动条件</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.met ?? 1}
                  <span className="m13-kpi-unit">项</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('pending')}
            >
              <div className="m13-kpi-ico m13-ico-gold">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">待补条件</div>
                <div className="m13-kpi-val m13-c-gold">
                  {data?.kpis.pending ?? 2}
                  <span className="m13-kpi-unit">项</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="m13-split-main">
        <div className="m13-left-stack">
          <section className="m13-panel" style={{ flex: 1 }}>
            <div className="m13-panel-head">
              <div className="m13-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">联动预案列表</span>
              </div>
              <span className="m13-panel-sub">
                施工导改 · 天气预警 · 智慧提速
              </span>
            </div>
            <div className="m13-panel-body">
              <div className="m13-plan-list">
                {plans.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#8ab4dc',
                      padding: '28px',
                    }}
                  >
                    暂无匹配联动预案
                  </div>
                ) : (
                  plans.map((p) => (
                    <div
                      key={p.id}
                      className={`m13-plan-card ${
                        sel && p.id === sel.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedPlanId(p.id)}
                    >
                      <div className="m13-plan-left">
                        <div className="m13-plan-ico">
                          {renderSceneIcon(p.scene)}
                        </div>
                        <div>
                          <div className="m13-cell-main">{p.name}</div>
                          <div className="m13-cell-sub">
                            {p.id} &nbsp; {p.subTitle}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="m13-plan-col-lbl">预案审批</div>
                        <span
                          className={`m13-tag ${statusTagClass(
                            p.approvalStatus
                          )}`}
                        >
                          {p.approvalStatus}
                        </span>
                      </div>
                      <div>
                        <div className="m13-plan-col-lbl">联动接口</div>
                        <span
                          className={`m13-tag ${statusTagClass(
                            p.interfaceStatus
                          )}`}
                        >
                          {p.interfaceStatus}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`m13-tag ${
                            p.conditionMet ? 'm13-tag-green' : 'm13-tag-slate'
                          }`}
                        >
                          {p.conditionMet ? '条件满足' : '未启用'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="m13-panel">
            <div className="m13-panel-head">
              <div className="m13-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">联动发布流程</span>
              </div>
            </div>
            <div className="m13-panel-body">
              <div className="m13-flow-strip">
                {planSteps.map((st, idx) => {
                  const flowStage = sel?.flowStage ?? 1;
                  const cls =
                    idx < flowStage
                      ? 'done'
                      : idx === flowStage
                        ? 'active'
                        : 'pending';
                  return (
                    <div
                      key={st.title}
                      style={{
                        display: 'contents',
                      }}
                    >
                      {idx > 0 ? (
                        <div className="m13-flow-arrow">&rsaquo;</div>
                      ) : null}
                      <div className={`m13-flow-step ${cls}`}>
                        <span className="m13-flow-ico">{st.ico}</span>
                        <div className="m13-flow-title">{st.title}</div>
                        <div className="m13-flow-sub">{st.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="m13-note-box">
                <Info size={14} />
                <span>
                  联动规则匹配后形成发布草稿，按审核和授权流程下发。
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">联动条件与发布关联</span>
            </div>
          </div>
          <div className="m13-panel-body">
            {sel ? (
              <>
                <div className="m13-detail-top">
                  <div>
                    <span className="m13-detail-code">{sel.id}</span>
                    <span className="m13-detail-ver">{sel.name}</span>
                  </div>
                  <span
                    className={`m13-tag ${
                      sel.conditionMet ? 'm13-tag-green' : 'm13-tag-amber'
                    }`}
                  >
                    {sel.conditionMet ? '条件满足' : '待补条件'}
                  </span>
                </div>
                <div className="m13-kv-list">
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">关联场景</span>
                    <span className="m13-kv-v">{sel.scene}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">触发事件</span>
                    <span className="m13-kv-v">{sel.triggerEvent}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">接口状态</span>
                    <span className="m13-kv-v">
                      <span
                        className={`m13-tag ${statusTagClass(
                          sel.interfaceStatus
                        )}`}
                      >
                        {sel.interfaceStatus}
                      </span>
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">预案审批</span>
                    <span className="m13-kv-v">
                      <span
                        className={`m13-tag ${statusTagClass(
                          sel.approvalStatus
                        )}`}
                      >
                        {sel.approvalStatus}
                      </span>
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">目标设备组</span>
                    <span className="m13-kv-v">{sel.targetGroup}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">联动有效期</span>
                    <span className="m13-kv-v">{sel.validRange}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">关联内容模板</span>
                    <span className="m13-kv-v">
                      {sel.templateId} · {sel.templateVersion}
                    </span>
                  </div>
                </div>
                <div className="m13-recessed-box">
                  <div className="m13-recessed-title">匹配板面内容</div>
                  <div className="m13-recessed-lines">
                    {sel.line1}
                    <br />
                    {sel.line2}
                  </div>
                </div>
                <div className="m13-recessed-box">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      className="m13-recessed-title"
                      style={{ margin: 0 }}
                    >
                      关联发布单
                    </span>
                    {linkedOrder ? (
                      <span
                        className={`m13-tag ${statusTagClass(
                          linkedOrder.status
                        )}`}
                      >
                        {linkedOrder.status}
                      </span>
                    ) : (
                      <span className="m13-tag m13-tag-slate">未建单</span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: '#38bdf8' }}>
                      {linkedOrder ? linkedOrder.id : '待满足条件后生成'}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#9ec0e6' }}>
                      {sel.linkedOrderNote}
                    </span>
                  </div>
                </div>
                <div className="m13-actions-row">
                  <button
                    type="button"
                    className="m13-btn-primary"
                    onClick={() => {
                      if (linkedOrder) {
                        onNavigate('review', {
                          selectedOrderId: linkedOrder.id,
                        });
                      } else {
                        onNavigate('review', {
                          openCreateOrderWithTplId: sel.templateId,
                        });
                      }
                    }}
                  >
                    <FileText size={15} /> 查看关联发布单
                  </button>
                  <button
                    type="button"
                    className="m13-btn-ghost"
                    onClick={() => setShowTriggersModal(true)}
                  >
                    <Clock size={15} /> 核对触发记录
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>

      {showConfigModal && sel ? (
        <ConfigPlanModal
          plan={sel}
          templates={data?.templates ?? []}
          submitting={submitting}
          onConfirm={handleSaveConfig}
          onClose={() => setShowConfigModal(false)}
        />
      ) : null}

      {showTriggersModal && sel ? (
        <PlanTriggersModal
          plan={sel}
          submitting={submitting}
          onApproveVerify={handleApproveVerify}
          onClose={() => setShowTriggersModal(false)}
        />
      ) : null}
    </div>
  );
}
