'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Info,
  Monitor,
  RotateCcw,
  Search,
  Send,
  Tv,
} from 'lucide-react';
import {
  secName,
  statusTagClass,
  type PublishBoardDTO,
  type PublishOrderDTO,
  type PublishReceiptDTO,
} from '../types';
import { LedBoardPreview } from './LedBoardPreview';
import { AuditTrailModal } from './PublishModals';

interface ReceiptsResponse {
  order: PublishOrderDTO | null;
  allOrders: PublishOrderDTO[];
  receipts: PublishReceiptDTO[];
  allReceiptsForOrder: PublishReceiptDTO[];
  boards: PublishBoardDTO[];
  groupOptions: string[];
  kpis: {
    target: number;
    dispatched: number;
    received: number;
    confirmed: number;
    pending: number;
  };
}

export function ReceiptsSubPage({
  selectedDate,
  initialOrderId,
  initialBoardId,
  showToast,
}: {
  selectedDate: string;
  initialOrderId?: string;
  initialBoardId?: string;
  showToast: (msg: string) => void;
}) {
  const [orderId, setOrderId] = useState(
    initialOrderId || 'FB-20261126-007'
  );
  const [groupFilter, setGroupFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(
    initialOrderId ? 'all' : '2026-11-26'
  );
  const [kwInput, setKwInput] = useState('');
  const [appliedKw, setAppliedKw] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(
    initialBoardId || 'VMS-BT-A01'
  );

  const [data, setData] = useState<ReceiptsResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const prevGlobalDate = useRef(selectedDate);
  useEffect(() => {
    if (prevGlobalDate.current !== selectedDate) {
      prevGlobalDate.current = selectedDate;
      if (selectedDate === '2026-11-25' || selectedDate === '2026-11-26') {
        setDateFilter(selectedDate);
      }
    }
  }, [selectedDate]);

  const fetchReceipts = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        orderId,
        group: groupFilter,
        date: dateFilter,
        kw: appliedKw,
      });
      const res = await fetch(`/api/v1/m13/receipts?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      const json = (await res.json()) as ReceiptsResponse;
      setData(json);
      if (json.receipts.length > 0) {
        setSelectedBoardId((prev) =>
          json.receipts.some((r) => r.boardId === prev)
            ? prev
            : json.receipts[0].boardId
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载回执记录失败');
    }
  }, [orderId, groupFilter, dateFilter, appliedKw, showToast]);

  useEffect(() => {
    void fetchReceipts();
  }, [fetchReceipts]);

  const order = data?.order ?? null;
  const allOrders = data?.allOrders ?? [];
  const receipts = data?.receipts ?? [];
  const allReceiptsForOrder = data?.allReceiptsForOrder ?? [];
  const boards = data?.boards ?? [];
  const boardMap = new Map(boards.map((b) => [b.id, b]));

  const selRec =
    receipts.find((r) => r.boardId === selectedBoardId) ??
    allReceiptsForOrder.find((r) => r.boardId === selectedBoardId) ??
    receipts[0] ??
    allReceiptsForOrder[0] ??
    null;
  const selBoard =
    (selRec ? boardMap.get(selRec.boardId) : undefined) ??
    (order?.boardIds[0] ? boardMap.get(order.boardIds[0]) : undefined) ??
    boards[0] ??
    null;

  async function handleReceiptAction(
    action: 'collect_readback' | 'confirm_display'
  ) {
    if (!order || !selBoard) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m13/receipts/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          orderId: order.id,
          boardId: selBoard.id,
        }),
      });
      const json = (await res.json()) as {
        receipt?: PublishReceiptDTO;
        error?: string;
      };
      if (!res.ok || !json.receipt) {
        throw new Error(json.error || '操作失败');
      }
      showToast(
        action === 'collect_readback'
          ? `已采集 ${selBoard.id} 设备回读：板面内容一致`
          : `${selBoard.id} 已完成现场显示确认`
      );
      await fetchReceipts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '回执操作失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setGroupFilter('all');
    setDateFilter('all');
    setKwInput('');
    setAppliedKw('');
  }

  return (
    <div className="m13-page">
      <div className="m13-filter-bar">
        <div className="m13-filter-group">
          <div className="m13-filter-item">
            <label>发布单</label>
            <select
              className="m13-select"
              value={order?.id ?? orderId}
              onChange={(e) => {
                const nextOrdId = e.target.value;
                setOrderId(nextOrdId);
                const chosen = allOrders.find((o) => o.id === nextOrdId);
                setDateFilter(chosen ? chosen.date : 'all');
                setGroupFilter('all');
                setSelectedBoardId(chosen?.boardIds[0] ?? '');
              }}
            >
              {allOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id}
                </option>
              ))}
            </select>
          </div>
          <div className="m13-filter-item">
            <label>设备分组</label>
            <select
              className="m13-select"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">全部分组</option>
              {(data?.groupOptions ?? []).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="m13-filter-item">
            <label>反馈日期</label>
            <select
              className="m13-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">全部日期</option>
              <option value="2026-11-26">2026-11-26</option>
              <option value="2026-11-25">2026-11-25</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>关键词</label>
            <div className="m13-search-box">
              <Search size={15} />
              <input
                type="text"
                className="m13-input"
                placeholder="设备编号 / 桩号"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setAppliedKw(kwInput);
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
            onClick={() => setAppliedKw(kwInput)}
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
        </div>
      </div>

      <section className="m13-panel">
        <div className="m13-panel-head">
          <div className="m13-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">本单设备反馈</span>
            <span className="m13-panel-sub">(2026年11月)</span>
          </div>
          <span className="m13-panel-sub">
            发布单 {order?.id ?? orderId} · {order?.title ?? ''}
          </span>
        </div>
        <div className="m13-panel-body">
          <div className="m13-kpi-grid-5">
            <div className="m13-kpi-card">
              <div className="m13-kpi-ico m13-ico-cyan">
                <Tv size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">发布对象</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.target ?? 0}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div className="m13-kpi-card">
              <div className="m13-kpi-ico m13-ico-blue">
                <Send size={17} />
              </div>
              <div>
                <div className="m13-kpi-label">已下发</div>
                <div className="m13-kpi-val m13-c-blue">
                  {data?.kpis.dispatched ?? 0}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div className="m13-kpi-card">
              <div className="m13-kpi-ico m13-ico-cyan">
                <Inbox size={17} />
              </div>
              <div>
                <div className="m13-kpi-label">已接收</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.received ?? 0}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div className="m13-kpi-card">
              <div className="m13-kpi-ico m13-ico-green">
                <CheckCircle2 size={17} />
              </div>
              <div>
                <div className="m13-kpi-label">已确认显示</div>
                <div className="m13-kpi-val m13-c-green">
                  {data?.kpis.confirmed ?? 0}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div className="m13-kpi-card">
              <div className="m13-kpi-ico m13-ico-gold">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">待确认显示</div>
                <div className="m13-kpi-val m13-c-gold">
                  {data?.kpis.pending ?? 0}
                  <span className="m13-kpi-unit">块</span>
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
                <span className="panel-title">逐设备反馈明细</span>
              </div>
              <span className="m13-panel-sub">
                {order?.date ?? '2026-11-26'} &nbsp; {order?.id ?? orderId}
              </span>
            </div>
            <div className="m13-panel-body">
              <div className="m13-table-wrap">
                <table className="m13-table">
                  <thead>
                    <tr>
                      <th>设备与点位</th>
                      <th>下发状态</th>
                      <th>接收回执</th>
                      <th>设备回读</th>
                      <th>显示确认</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            color: '#8ab4dc',
                            padding: '24px',
                          }}
                        >
                          暂无匹配的设备反馈记录
                        </td>
                      </tr>
                    ) : (
                      receipts.map((r) => {
                        const b = boardMap.get(r.boardId);
                        return (
                          <tr
                            key={r.boardId}
                            className={
                              selRec && r.boardId === selRec.boardId
                                ? 'm13-row-selected'
                                : ''
                            }
                            onClick={() => setSelectedBoardId(r.boardId)}
                          >
                            <td>
                              <div className="m13-cell-main">
                                {b?.id ?? r.boardId}
                              </div>
                              <div className="m13-cell-sub">
                                {b ? `${b.stake} · ${b.pointName}` : ''}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div>
                                <span
                                  className={`m13-tag ${statusTagClass(
                                    r.dispatchStatus
                                  )}`}
                                >
                                  {r.dispatchStatus}
                                </span>
                              </div>
                              <div className="m13-cell-sub">
                                {r.dispatchTime}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div>
                                <span
                                  className={`m13-tag ${statusTagClass(
                                    r.receiveStatus
                                  )}`}
                                >
                                  {r.receiveStatus}
                                </span>
                              </div>
                              <div className="m13-cell-sub">
                                {r.receiveTime}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div>
                                <span
                                  className={`m13-tag ${statusTagClass(
                                    r.readbackStatus
                                  )}`}
                                >
                                  {r.readbackStatus}
                                </span>
                              </div>
                              <div className="m13-cell-sub">
                                {r.readbackTime}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div>
                                <span
                                  className={`m13-tag ${statusTagClass(
                                    r.confirmStatus
                                  )}`}
                                >
                                  {r.confirmStatus}
                                </span>
                              </div>
                              <div className="m13-cell-sub">
                                {r.confirmTime}
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="m13-act-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBoardId(r.boardId);
                                }}
                              >
                                查看
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="m13-note-box" style={{ marginTop: 'auto' }}>
                <Info size={14} />
                <span>显示确认时间取自现场核验记录。</span>
              </div>
            </div>
          </section>

          <section className="m13-panel">
            <div className="m13-panel-head">
              <div className="m13-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">发布过程留痕</span>
              </div>
              {order ? (
                <button
                  type="button"
                  className="m13-text-link"
                  onClick={() => setShowAuditModal(true)}
                >
                  查看审核与授权记录 &gt;
                </button>
              ) : null}
            </div>
            <div className="m13-panel-body">
              <div className="m13-trace-grid">
                <div className="m13-trace-card">
                  <div className="m13-trace-k">发布编号</div>
                  <div className="m13-trace-v">{order?.id ?? '—'}</div>
                </div>
                <div className="m13-trace-card">
                  <div className="m13-trace-k">内容版本</div>
                  <div className="m13-trace-v">
                    {order ? `${order.templateId} · ${order.version}` : '—'}
                  </div>
                </div>
                <div className="m13-trace-card">
                  <div className="m13-trace-k">发布操作人</div>
                  <div className="m13-trace-v">{order?.operator ?? '—'}</div>
                </div>
                <div className="m13-trace-card">
                  <div className="m13-trace-k">审核人</div>
                  <div className="m13-trace-v">{order?.reviewer ?? '—'}</div>
                </div>
                <div className="m13-trace-card">
                  <div className="m13-trace-k">授权人</div>
                  <div className="m13-trace-v">{order?.authorizer ?? '—'}</div>
                </div>
                <div className="m13-trace-card">
                  <div className="m13-trace-k">发布时间</div>
                  <div className="m13-trace-v">{order?.fullTime ?? '—'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">设备回读与显示确认</span>
            </div>
          </div>
          <div className="m13-panel-body">
            {order && selBoard ? (
              <>
                <div className="m13-detail-top">
                  <span className="m13-detail-code">{selBoard.id}</span>
                  <span
                    className={`m13-tag ${statusTagClass(
                      selRec?.confirmStatus ?? '待确认显示'
                    )}`}
                  >
                    {selRec?.confirmStatus ?? '待确认显示'}
                  </span>
                </div>
                <div className="m13-kv-list">
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">设备位置</span>
                    <span className="m13-kv-v">
                      {secName(selBoard.sectionId)} · {selBoard.stake} ·{' '}
                      {selBoard.pointName}
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">关联发布单</span>
                    <span className="m13-kv-v">
                      {order.id} · {order.version}
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">核验记录</span>
                    <span className="m13-kv-v">
                      {selRec?.verifyRecord ?? '—'}
                    </span>
                  </div>
                </div>
                <div className="m13-subhead-row">
                  <span>设备回读板面</span>
                  <span
                    className={`m13-tag ${statusTagClass(
                      selRec?.readbackStatus ?? '未回读'
                    )}`}
                  >
                    {selRec?.readbackStatus === '内容一致'
                      ? '内容一致'
                      : '回读待返回'}
                  </span>
                </div>
                <LedBoardPreview
                  line1={order.line1}
                  line2={order.line2}
                  spec={selBoard.spec}
                  dimmed={!selRec || selRec.readbackStatus !== '内容一致'}
                  dimmedLabel={
                    selBoard.online ? '等待设备回读校验' : '设备离线暂未回读'
                  }
                />
                <div className="m13-led-caption">
                  <span>回读时间 {selRec?.readbackTime ?? '—'}</span>
                  <span>{selBoard.spec}</span>
                </div>
                <div className="m13-step-timeline">
                  <div className="m13-step-row">
                    <div className="m13-step-row-left">
                      <span style={{ color: '#38bdf8', display: 'inline-flex' }}>
                        <Send size={15} />
                      </span>
                      <span className="m13-step-time">
                        {selRec?.dispatchTime ?? '—'}
                      </span>
                      <span className="m13-step-text">系统向设备发送</span>
                    </div>
                    <span
                      className={`m13-tag ${statusTagClass(
                        selRec?.dispatchStatus ?? '待下发'
                      )}`}
                    >
                      {selRec?.dispatchStatus ?? '待下发'}
                    </span>
                  </div>
                  <div className="m13-step-row">
                    <div className="m13-step-row-left">
                      <span style={{ color: '#38bdf8', display: 'inline-flex' }}>
                        <Inbox size={15} />
                      </span>
                      <span className="m13-step-time">
                        {selRec?.receiveTime ?? '—'}
                      </span>
                      <span className="m13-step-text">
                        {selRec?.receiveStatus === '已接收'
                          ? '收到设备接收回执'
                          : '等待设备返回接收回执'}
                      </span>
                    </div>
                    <span
                      className={`m13-tag ${statusTagClass(
                        selRec?.receiveStatus ?? '未回执'
                      )}`}
                    >
                      {selRec?.receiveStatus ?? '未回执'}
                    </span>
                  </div>
                  <div className="m13-step-row">
                    <div className="m13-step-row-left">
                      <span style={{ color: '#4ade80', display: 'inline-flex' }}>
                        <Monitor size={15} />
                      </span>
                      <span className="m13-step-time">
                        {selRec?.readbackTime ?? '—'}
                      </span>
                      <span className="m13-step-text">
                        {selRec?.readbackStatus === '内容一致'
                          ? '设备回读板面与发布版本一致'
                          : '待采集设备板面回读数据'}
                      </span>
                    </div>
                    <span
                      className={`m13-tag ${statusTagClass(
                        selRec?.readbackStatus ?? '未回读'
                      )}`}
                    >
                      {selRec?.readbackStatus ?? '未回读'}
                    </span>
                  </div>
                  <div className="m13-step-row">
                    <div className="m13-step-row-left">
                      <span
                        style={{
                          color:
                            selRec?.confirmStatus === '已确认显示'
                              ? '#4ade80'
                              : '#facc15',
                          display: 'inline-flex',
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </span>
                      <span className="m13-step-time">
                        {selRec?.confirmTime ?? '—'}
                      </span>
                      <span className="m13-step-text">现场核验</span>
                    </div>
                    <span
                      className={`m13-tag ${statusTagClass(
                        selRec?.confirmStatus ?? '待确认显示'
                      )}`}
                    >
                      {selRec?.confirmStatus ?? '待确认显示'}
                    </span>
                  </div>
                </div>
                {selRec &&
                order.status === '已下发' &&
                selRec.confirmStatus !== '已确认显示' ? (
                  <div className="m13-actions-row">
                    {selRec.readbackStatus !== '内容一致' ? (
                      <button
                        type="button"
                        className="m13-btn-ghost"
                        disabled={submitting}
                        onClick={() =>
                          void handleReceiptAction('collect_readback')
                        }
                      >
                        <RotateCcw size={14} /> 采集设备回读
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="m13-btn-green"
                      disabled={submitting}
                      onClick={() =>
                        void handleReceiptAction('confirm_display')
                      }
                    >
                      <CheckCircle2 size={15} /> 现场确认显示
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      </div>

      {showAuditModal && order ? (
        <AuditTrailModal
          order={order}
          receipts={allReceiptsForOrder}
          onClose={() => setShowAuditModal(false)}
        />
      ) : null}
    </div>
  );
}
