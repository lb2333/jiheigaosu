'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FileText,
  Info,
  Lock,
  Monitor,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Tv,
  Undo2,
} from 'lucide-react';
import {
  SECTIONS,
  statusTagClass,
  type PublishBoardDTO,
  type PublishNavBridge,
  type PublishOrderDTO,
  type PublishReceiptDTO,
  type PublishTemplateDTO,
} from '../types';
import { LedBoardPreview } from './LedBoardPreview';
import { Pager } from './Pager';
import {
  AuditOrderModal,
  AuthorizeOrderModal,
  CreateOrderModal,
  RevokeOrderModal,
} from './PublishModals';

interface OrdersResponse {
  orders: PublishOrderDTO[];
  allOrders: PublishOrderDTO[];
  pageItems: PublishOrderDTO[];
  total: number;
  page: number;
  totalPages: number;
  kpis: {
    total: number;
    pendingReview: number;
    pendingAuth: number;
    issued: number;
    revoked: number;
  };
  boards: PublishBoardDTO[];
  templates: PublishTemplateDTO[];
  receiptsByOrder: Record<string, PublishReceiptDTO[]>;
}

export function ReviewSubPage({
  activeSectionId,
  initialSelectedOrderId,
  initialCreateWithTplId,
  onSectionChange,
  onNavigate,
  showToast,
}: {
  activeSectionId: string | null;
  initialSelectedOrderId?: string;
  initialCreateWithTplId?: string;
  onSectionChange: (secId: string | null) => void;
  onNavigate: (subPage: string, bridge?: PublishNavBridge) => void;
  showToast: (msg: string) => void;
}) {
  const [secFilter, setSecFilter] = useState<string>(activeSectionId ?? 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('2026年11月');
  const [kwInput, setKwInput] = useState<string>('');
  const [appliedKw, setAppliedKw] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialSelectedOrderId || 'FB-20261126-007'
  );

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [didInitOrderPage, setDidInitOrderPage] = useState(false);

  const [createModalTplId, setCreateModalTplId] = useState<string | null>(
    initialCreateWithTplId ?? null
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(
    Boolean(initialCreateWithTplId)
  );
  const [auditOrderId, setAuditOrderId] = useState<string | null>(null);
  const [authOrderId, setAuthOrderId] = useState<string | null>(null);
  const [revokeOrderId, setRevokeOrderId] = useState<string | null>(null);

  useEffect(() => {
    const nextSec = activeSectionId ?? 'all';
    setSecFilter(nextSec);
    setPage(1);
  }, [activeSectionId]);

  const fetchOrders = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        sectionId: secFilter,
        status: statusFilter,
        period: periodFilter,
        kw: appliedKw,
        page: String(page),
        pageSize: '5',
      });
      const res = await fetch(`/api/v1/m13/orders?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      const json = (await res.json()) as OrdersResponse;
      setData(json);
      if (initialSelectedOrderId && !didInitOrderPage) {
        setDidInitOrderPage(true);
        const idx = json.orders.findIndex((o) => o.id === initialSelectedOrderId);
        if (idx >= 0) {
          const targetPage = Math.floor(idx / 5) + 1;
          if (targetPage !== page) {
            setPage(targetPage);
            return;
          }
        }
      }
      if (json.pageItems.length > 0) {
        setSelectedOrderId((prev) =>
          json.orders.some((o) => o.id === prev) ? prev : json.pageItems[0].id
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载发布单列表失败');
    }
  }, [
    secFilter,
    statusFilter,
    periodFilter,
    appliedKw,
    page,
    initialSelectedOrderId,
    didInitOrderPage,
    showToast,
  ]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const allOrders = data?.allOrders ?? [];
  const boards = data?.boards ?? [];
  const templates = data?.templates ?? [];
  const boardMap = new Map(boards.map((b) => [b.id, b]));
  const pageItems = data?.pageItems ?? [];

  const sel =
    data?.orders.find((o) => o.id === selectedOrderId) ??
    allOrders.find((o) => o.id === selectedOrderId) ??
    pageItems[0] ??
    allOrders[0] ??
    null;

  const recs = sel ? data?.receiptsByOrder?.[sel.id] ?? [] : [];
  const confirmedCount = recs.filter((r) => r.confirmStatus === '已确认显示').length;
  const firstBoard = sel ? boardMap.get(sel.boardIds[0]) : undefined;

  const isReviewDone = sel
    ? ['待授权', '已下发', '已撤销'].includes(sel.status)
    : false;
  const isAuthDone = sel ? ['已下发', '已撤销'].includes(sel.status) : false;
  const isDispatchDone = sel
    ? ['已下发', '已撤销'].includes(sel.status)
    : false;

  function stepClass(idx: number): string {
    if (!sel) return 'pending';
    if (idx === 0) return 'done';
    if (idx === 1)
      return isReviewDone ? 'done' : sel.status === '待审核' ? 'active' : 'pending';
    if (idx === 2)
      return isAuthDone ? 'done' : sel.status === '待授权' ? 'active' : 'pending';
    if (idx === 3) return isDispatchDone ? 'done' : 'pending';
    if (idx === 4)
      return sel.status === '已下发'
        ? 'active'
        : sel.status === '已撤销'
          ? 'done'
          : 'pending';
    return 'pending';
  }

  const authBadgeText = !sel
    ? ''
    : sel.status === '已下发'
      ? '授权已核验'
      : sel.status === '待授权'
        ? '待授权确认'
        : sel.status === '待审核'
          ? '待内容审核'
          : '已撤销发布';
  const authBadgeCls = !sel
    ? 'm13-tag-slate'
    : sel.status === '已下发'
      ? 'm13-tag-green'
      : sel.status === '已撤销'
        ? 'm13-tag-slate'
        : 'm13-tag-amber';

  async function handleCreateOrder(payload: {
    templateId: string;
    sectionId: string;
    title: string;
    validRange: string;
    line1: string;
    line2: string;
    boardIds: string[];
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m13/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        order?: PublishOrderDTO;
        error?: string;
      };
      if (!res.ok || !json.order) {
        throw new Error(json.error || '新建发布单失败');
      }
      setShowCreateModal(false);
      setCreateModalTplId(null);
      setSelectedOrderId(json.order.id);
      setStatusFilter('all');
      setPage(1);
      showToast(`已新建发布单 ${json.order.id}，等待内容审核`);
      await fetchOrders();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '新建发布单失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function runOrderAction(
    orderId: string,
    payload: {
      action:
        | 'review_pass'
        | 'review_reject'
        | 'authorize_dispatch'
        | 'revoke'
        | 'restore'
        | 'resubmit';
      reviewer?: string;
      authorizer?: string;
      scheduleTime?: string;
      comment?: string;
    },
    successMsg: string
  ) {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m13/orders/${encodeURIComponent(orderId)}/action`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as {
        order?: PublishOrderDTO;
        error?: string;
      };
      if (!res.ok || !json.order) {
        throw new Error(json.error || '操作失败');
      }
      setAuditOrderId(null);
      setAuthOrderId(null);
      setRevokeOrderId(null);
      showToast(successMsg);
      await fetchOrders();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '发布单操作失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSecFilter('all');
    setStatusFilter('all');
    setPeriodFilter('2026年11月');
    setKwInput('');
    setAppliedKw('');
    setPage(1);
    onSectionChange(null);
  }

  const auditOrderTarget = auditOrderId
    ? allOrders.find((o) => o.id === auditOrderId) ?? null
    : null;
  const authOrderTarget = authOrderId
    ? allOrders.find((o) => o.id === authOrderId) ?? null
    : null;
  const revokeOrderTarget = revokeOrderId
    ? allOrders.find((o) => o.id === revokeOrderId) ?? null
    : null;

  return (
    <div className="m13-page">
      <div className="m13-filter-bar">
        <div className="m13-filter-group">
          <div className="m13-filter-item">
            <label>所属工区</label>
            <select
              className="m13-select"
              value={secFilter}
              onChange={(e) => {
                const v = e.target.value;
                setSecFilter(v);
                setPage(1);
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
          <div className="m13-filter-item">
            <label>发布状态</label>
            <select
              className="m13-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部状态</option>
              <option value="待审核">待审核</option>
              <option value="待授权">待授权</option>
              <option value="已下发">已下发</option>
              <option value="已撤销">已撤销</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>统计周期</label>
            <select
              className="m13-select"
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="2026年11月">2026年11月</option>
              <option value="近7日">近7日</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>关键词</label>
            <div className="m13-search-box">
              <Search size={15} />
              <input
                type="text"
                className="m13-input"
                placeholder="发布编号 / 内容"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setAppliedKw(kwInput);
                    setPage(1);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="m13-filter-actions">
          <button
            type="button"
            className="m13-btn-primary"
            onClick={() => {
              setAppliedKw(kwInput);
              setPage(1);
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
              setCreateModalTplId(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={14} /> 新建发布单
          </button>
        </div>
      </div>

      <section className="m13-panel">
        <div className="m13-panel-head">
          <div className="m13-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">发布办理概况</span>
            <span className="m13-panel-sub">(2026年11月)</span>
          </div>
        </div>
        <div className="m13-panel-body">
          <div className="m13-kpi-grid-5">
            <div
              className="m13-kpi-card"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <FileText size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">本期发布单</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.total ?? 8}
                  <span className="m13-kpi-unit">条</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setStatusFilter('待审核');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-gold">
                <Search size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">待审核</div>
                <div className="m13-kpi-val m13-c-gold">
                  {data?.kpis.pendingReview ?? 2}
                  <span className="m13-kpi-unit">条</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setStatusFilter('待授权');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-blue">
                <Lock size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">待授权</div>
                <div className="m13-kpi-val m13-c-blue">
                  {data?.kpis.pendingAuth ?? 2}
                  <span className="m13-kpi-unit">条</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setStatusFilter('已下发');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-green">
                <Send size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">已下发</div>
                <div className="m13-kpi-val m13-c-green">
                  {data?.kpis.issued ?? 3}
                  <span className="m13-kpi-unit">条</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setStatusFilter('已撤销');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-slate">
                <Undo2 size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">已撤销</div>
                <div className="m13-kpi-val m13-c-slate">
                  {data?.kpis.revoked ?? 1}
                  <span className="m13-kpi-unit">条</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="m13-split-main">
        <div className="m13-left-stack">
          <section className="m13-panel">
            <div className="m13-panel-head">
              <div className="m13-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">审核与发布单</span>
              </div>
              <span className="m13-panel-sub">已下发状态按系统发送统计</span>
            </div>
            <div className="m13-panel-body">
              <div className="m13-table-wrap">
                <table className="m13-table">
                  <thead>
                    <tr>
                      <th>发布单编号</th>
                      <th>发布内容</th>
                      <th>版本</th>
                      <th>对象数</th>
                      <th>计划 / 下发时间</th>
                      <th>发布状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: 'center',
                            color: '#8ab4dc',
                            padding: '24px',
                          }}
                        >
                          暂无匹配发布单
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((o) => (
                        <tr
                          key={o.id}
                          className={
                            sel && o.id === sel.id ? 'm13-row-selected' : ''
                          }
                          onClick={() => setSelectedOrderId(o.id)}
                        >
                          <td>
                            <span className="m13-cell-main">{o.id}</span>
                          </td>
                          <td>{o.title}</td>
                          <td>{o.version}</td>
                          <td>{o.boardIds.length} 块</td>
                          <td>{o.scheduleTime}</td>
                          <td>
                            <span
                              className={`m13-tag ${statusTagClass(o.status)}`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td>
                            {o.status === '待审核' ? (
                              <button
                                type="button"
                                className="m13-act-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderId(o.id);
                                  setAuditOrderId(o.id);
                                }}
                              >
                                审核
                              </button>
                            ) : o.status === '待授权' ? (
                              <button
                                type="button"
                                className="m13-act-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderId(o.id);
                                  setAuthOrderId(o.id);
                                }}
                              >
                                授权下发
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="m13-act-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderId(o.id);
                                }}
                              >
                                查看
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pager
                totalCount={data?.total ?? 0}
                pageSize={5}
                currentPage={data?.page ?? page}
                unitLabel="条发布单"
                onPageChange={setPage}
              />
            </div>
          </section>

          <section className="m13-panel">
            <div className="m13-panel-head">
              <div className="m13-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">本单发布流程</span>
              </div>
              {sel ? (
                <button
                  type="button"
                  className="m13-text-link"
                  onClick={() =>
                    onNavigate('receipts', {
                      selectedOrderId: sel.id,
                      selectedBoardId: sel.boardIds[0],
                    })
                  }
                >
                  查看回执记录 &gt;
                </button>
              ) : null}
            </div>
            <div className="m13-panel-body">
              <div className="m13-flow-strip">
                <div className={`m13-flow-step ${stepClass(0)}`}>
                  <span className="m13-flow-ico">
                    <Pencil size={14} />
                  </span>
                  <div className="m13-flow-title">内容编排</div>
                  <div className="m13-flow-sub">
                    {sel?.stepTimes.compose ?? '—'}
                  </div>
                </div>
                <div className="m13-flow-arrow">&rsaquo;</div>
                <div className={`m13-flow-step ${stepClass(1)}`}>
                  <span className="m13-flow-ico">
                    <ShieldCheck size={16} />
                  </span>
                  <div className="m13-flow-title">内容审核</div>
                  <div className="m13-flow-sub">
                    {sel?.stepTimes.review ?? '—'}
                  </div>
                </div>
                <div className="m13-flow-arrow">&rsaquo;</div>
                <div className={`m13-flow-step ${stepClass(2)}`}>
                  <span className="m13-flow-ico">
                    <Lock size={16} />
                  </span>
                  <div className="m13-flow-title">授权确认</div>
                  <div className="m13-flow-sub">
                    {sel?.stepTimes.auth ?? '—'}
                  </div>
                </div>
                <div className="m13-flow-arrow">&rsaquo;</div>
                <div className={`m13-flow-step ${stepClass(3)}`}>
                  <span className="m13-flow-ico">
                    <Send size={16} />
                  </span>
                  <div className="m13-flow-title">下发情报板</div>
                  <div className="m13-flow-sub">
                    {sel?.stepTimes.dispatch ?? '—'}
                  </div>
                </div>
                <div className="m13-flow-arrow">&rsaquo;</div>
                <div className={`m13-flow-step ${stepClass(4)}`}>
                  <span className="m13-flow-ico">
                    <Tv size={16} />
                  </span>
                  <div className="m13-flow-title">回执跟踪</div>
                  <div className="m13-flow-sub">
                    {sel?.status === '已下发'
                      ? `${confirmedCount} / ${sel.boardIds.length} 块确认显示`
                      : sel?.status === '已撤销'
                        ? '已撤销停止跟踪'
                        : '待下发后跟踪'}
                  </div>
                </div>
              </div>
              <div className="m13-note-box">
                <Info size={14} />
                <span>发布单授权通过后下发，显示反馈按设备分别记录。</span>
              </div>
            </div>
          </section>
        </div>

        <section className="m13-panel m13-review-detail">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">发布对象与授权</span>
            </div>
          </div>
          <div className="m13-panel-body">
            {sel ? (
              <>
                <div className="m13-detail-top">
                  <div>
                    <span className="m13-detail-code">{sel.id}</span>
                    <span className="m13-detail-ver">{sel.version}</span>
                  </div>
                  <span className={`m13-tag ${statusTagClass(sel.status)}`}>
                    {sel.status}
                  </span>
                </div>
                <div className="m13-kv-list">
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">内容模板 / 版本</span>
                    <span className="m13-kv-v">
                      {sel.templateId} · {sel.version}
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">发布有效期</span>
                    <span className="m13-kv-v">{sel.validRange}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">审核 / 授权</span>
                    <span className="m13-kv-v">
                      {sel.reviewer} / {sel.authorizer}
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">
                      {(firstBoard?.id || 'A01').split('-').pop()}原板面
                    </span>
                    <span className="m13-kv-v">{sel.prevBoardSummary}</span>
                  </div>
                </div>
                <div className="m13-subhead-row">
                  <span>{sel.title}</span>
                  <span className={`m13-tag ${authBadgeCls}`}>
                    {authBadgeText}
                  </span>
                </div>
                <LedBoardPreview
                  line1={sel.line1}
                  line2={sel.line2}
                  spec={sel.spec}
                />
                <div className="m13-subhead-row">
                  <span>已确认发布对象</span>
                  <span className="m13-panel-sub">
                    {sel.boardIds.length} 块 · {sel.groupLabel}
                  </span>
                </div>
                <div className="m13-target-list">
                  {sel.boardIds.map((bid) => {
                    const b = boardMap.get(bid);
                    return (
                      <div key={bid} className="m13-target-row">
                        <div className="m13-target-left">
                          <span
                            style={{ color: '#7dd3fc', display: 'inline-flex' }}
                          >
                            <Monitor size={15} />
                          </span>
                          <span className="m13-target-code">
                            {b?.id ?? bid}
                          </span>
                          <span className="m13-target-loc">
                            {b ? `${b.stake} · ${b.pointName}` : ''}
                          </span>
                        </div>
                        <span className="m13-tag m13-tag-blue">已确认对象</span>
                      </div>
                    );
                  })}
                </div>
                <div className="m13-actions-row">
                  {sel.status === '待审核' ? (
                    <>
                      <button
                        type="button"
                        className="m13-btn-primary"
                        onClick={() => setAuditOrderId(sel.id)}
                      >
                        <ShieldCheck size={15} /> 内容审核
                      </button>
                      <button
                        type="button"
                        className="m13-btn-ghost"
                        onClick={() =>
                          onNavigate('receipts', {
                            selectedOrderId: sel.id,
                            selectedBoardId: sel.boardIds[0],
                          })
                        }
                      >
                        <Monitor size={15} /> 查看回执
                      </button>
                    </>
                  ) : sel.status === '待授权' ? (
                    <>
                      <button
                        type="button"
                        className="m13-btn-primary"
                        onClick={() => setAuthOrderId(sel.id)}
                      >
                        <Lock size={15} /> 授权并下发
                      </button>
                      <button
                        type="button"
                        className="m13-btn-ghost"
                        onClick={() =>
                          onNavigate('receipts', {
                            selectedOrderId: sel.id,
                            selectedBoardId: sel.boardIds[0],
                          })
                        }
                      >
                        <Monitor size={15} /> 查看回执
                      </button>
                    </>
                  ) : sel.status === '已下发' ? (
                    <>
                      <button
                        type="button"
                        className="m13-btn-gold"
                        onClick={() => setRevokeOrderId(sel.id)}
                      >
                        <Undo2 size={14} /> 撤销发布
                      </button>
                      <button
                        type="button"
                        className="m13-btn-ghost"
                        disabled={submitting}
                        onClick={() =>
                          void runOrderAction(
                            sel.id,
                            { action: 'restore' },
                            `已授权恢复 ${sel.id} 涉及 ${sel.boardIds.length} 块情报板的原板面内容`
                          )
                        }
                      >
                        <RotateCcw size={14} /> 恢复原内容
                      </button>
                      <button
                        type="button"
                        className="m13-btn-primary"
                        onClick={() =>
                          onNavigate('receipts', {
                            selectedOrderId: sel.id,
                            selectedBoardId: sel.boardIds[0],
                          })
                        }
                      >
                        <Monitor size={15} /> 查看回执
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="m13-btn-ghost"
                        disabled={submitting}
                        onClick={() =>
                          void runOrderAction(
                            sel.id,
                            { action: 'resubmit' },
                            `发布单 ${sel.id} 已重新提交至待审核`
                          )
                        }
                      >
                        <RotateCcw size={14} /> 重新提交审核
                      </button>
                      <button
                        type="button"
                        className="m13-btn-primary"
                        onClick={() =>
                          onNavigate('receipts', {
                            selectedOrderId: sel.id,
                            selectedBoardId: sel.boardIds[0],
                          })
                        }
                      >
                        <Monitor size={15} /> 查看回执
                      </button>
                    </>
                  )}
                </div>
                <div className="m13-note-box">
                  <Info size={14} />
                  <span>
                    恢复按各设备发布前的板面记录执行，撤销与恢复均需授权。
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>

      {showCreateModal && data ? (
        <CreateOrderModal
          templates={templates}
          boards={boards}
          initialTemplateId={createModalTplId ?? undefined}
          submitting={submitting}
          showToast={showToast}
          onSubmit={handleCreateOrder}
          onClose={() => {
            setShowCreateModal(false);
            setCreateModalTplId(null);
          }}
        />
      ) : null}

      {auditOrderTarget ? (
        <AuditOrderModal
          order={auditOrderTarget}
          submitting={submitting}
          onPass={(p) =>
            runOrderAction(
              auditOrderTarget.id,
              { action: 'review_pass', ...p },
              `发布单 ${auditOrderTarget.id} 内容审核通过，已流转至待授权`
            )
          }
          onReject={(p) =>
            runOrderAction(
              auditOrderTarget.id,
              { action: 'review_reject', ...p },
              `发布单 ${auditOrderTarget.id} 已退回并标记为已撤销`
            )
          }
          onClose={() => setAuditOrderId(null)}
        />
      ) : null}

      {authOrderTarget ? (
        <AuthorizeOrderModal
          order={authOrderTarget}
          boards={boards}
          submitting={submitting}
          onConfirm={(authorizer) =>
            runOrderAction(
              authOrderTarget.id,
              { action: 'authorize_dispatch', authorizer },
              `发布单 ${authOrderTarget.id} 已授权并下发至 ${authOrderTarget.boardIds.length} 块情报板`
            )
          }
          onClose={() => setAuthOrderId(null)}
        />
      ) : null}

      {revokeOrderTarget ? (
        <RevokeOrderModal
          order={revokeOrderTarget}
          submitting={submitting}
          onConfirm={(authorizer) =>
            runOrderAction(
              revokeOrderTarget.id,
              { action: 'revoke', authorizer },
              `发布单 ${revokeOrderTarget.id} 已授权撤销`
            )
          }
          onClose={() => setRevokeOrderId(null)}
        />
      ) : null}
    </div>
  );
}
