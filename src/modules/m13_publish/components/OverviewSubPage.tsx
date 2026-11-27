'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Monitor,
  Radio,
  RotateCcw,
  Search,
  Tv,
  WifiOff,
} from 'lucide-react';
import {
  BOARD_GROUPS,
  SECTIONS,
  secName,
  statusTagClass,
  type PublishBoardDTO,
  type PublishNavBridge,
  type PublishReceiptDTO,
} from '../types';
import { LedBoardPreview } from './LedBoardPreview';
import { Pager } from './Pager';

interface OverviewResponse {
  boards: PublishBoardDTO[];
  allBoards: PublishBoardDTO[];
  pageItems: PublishBoardDTO[];
  total: number;
  page: number;
  totalPages: number;
  kpis: {
    totalBoards: number;
    onlineBoards: number;
    offlineBoards: number;
    totalOrders: number;
    pendingConfirmCount: number;
  };
  latestIssuedOrderId: string;
  receiptsByOrder: Record<string, PublishReceiptDTO[]>;
  lastUpdated: string;
}

export function OverviewSubPage({
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
  const [secFilter, setSecFilter] = useState<string>(activeSectionId ?? 'all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState<string>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [kwInput, setKwInput] = useState<string>('');
  const [appliedKw, setAppliedKw] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('VMS-BT-A01');

  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const nextSec = activeSectionId ?? 'all';
    setSecFilter(nextSec);
    setPage(1);
  }, [activeSectionId]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        sectionId: secFilter,
        group: groupFilter,
        online: onlineFilter,
        feedback: feedbackFilter,
        kw: appliedKw,
        page: String(page),
        pageSize: '6',
      });
      const res = await fetch(`/api/v1/m13/overview?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      const json = (await res.json()) as OverviewResponse;
      setData(json);
      if (json.pageItems.length > 0) {
        setSelectedBoardId((prev) =>
          json.boards.some((b) => b.id === prev) ? prev : json.pageItems[0].id
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载情报板总览失败');
    } finally {
      setLoading(false);
    }
  }, [secFilter, groupFilter, onlineFilter, feedbackFilter, appliedKw, page, showToast]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const pageItems = data?.pageItems ?? [];
  const allBoards = data?.allBoards ?? [];
  const boardMap = new Map(allBoards.map((b) => [b.id, b]));
  const sel =
    data?.boards.find((b) => b.id === selectedBoardId) ??
    allBoards.find((b) => b.id === selectedBoardId) ??
    pageItems[0] ??
    allBoards[0] ??
    null;

  const contextOrderId =
    sel?.lastOrderId || data?.latestIssuedOrderId || 'FB-20261126-007';
  const contextRecs = data?.receiptsByOrder?.[contextOrderId] ?? [];
  const pendingRecs = contextRecs.filter((r) => r.confirmStatus !== '已确认显示');

  function handleQuery() {
    setFeedbackFilter('all');
    setAppliedKw(kwInput);
    setPage(1);
    onSectionChange(secFilter === 'all' ? null : secFilter);
  }

  function handleReset() {
    setSecFilter('all');
    setGroupFilter('all');
    setOnlineFilter('all');
    setFeedbackFilter('all');
    setKwInput('');
    setAppliedKw('');
    setPage(1);
    onSectionChange(null);
  }

  function handleKpiClick(kind: 'all' | 'online' | 'offline' | 'pending') {
    setSecFilter('all');
    setGroupFilter('all');
    setKwInput('');
    setAppliedKw('');
    setPage(1);
    onSectionChange(null);
    if (kind === 'online') {
      setOnlineFilter('online');
      setFeedbackFilter('all');
    } else if (kind === 'offline') {
      setOnlineFilter('offline');
      setFeedbackFilter('all');
    } else if (kind === 'pending') {
      setOnlineFilter('all');
      setFeedbackFilter('pending');
    } else {
      setOnlineFilter('all');
      setFeedbackFilter('all');
    }
  }

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
            <label>设备分组</label>
            <select
              className="m13-select"
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部分组</option>
              {BOARD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="m13-filter-item">
            <label>在线状态</label>
            <select
              className="m13-select"
              value={onlineFilter}
              onChange={(e) => {
                setOnlineFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>关键词</label>
            <div className="m13-search-box">
              <Search size={15} />
              <input
                type="text"
                className="m13-input"
                placeholder="桩号 / 设备编号"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuery();
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
            onClick={handleQuery}
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
            <span className="panel-title">情报板运行概况</span>
            <span className="m13-panel-sub">(2026年11月)</span>
          </div>
        </div>
        <div className="m13-panel-body">
          <div className="m13-kpi-grid-5">
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('all')}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <Tv size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">接入情报板</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.totalBoards ?? 24}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('online')}
            >
              <div className="m13-kpi-ico m13-ico-green">
                <Radio size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">在线</div>
                <div className="m13-kpi-val m13-c-green">
                  {data?.kpis.onlineBoards ?? 22}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => handleKpiClick('offline')}
            >
              <div className="m13-kpi-ico m13-ico-slate">
                <WifiOff size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">离线</div>
                <div className="m13-kpi-val m13-c-slate">
                  {data?.kpis.offlineBoards ?? 2}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => onNavigate('review')}
            >
              <div className="m13-kpi-ico m13-ico-blue">
                <FileText size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">本期发布单</div>
                <div className="m13-kpi-val m13-c-blue">
                  {data?.kpis.totalOrders ?? 8}
                  <span className="m13-kpi-unit">条</span>
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
                <div className="m13-kpi-label">最新发布待确认</div>
                <div className="m13-kpi-val m13-c-gold">
                  {data?.kpis.pendingConfirmCount ?? 2}
                  <span className="m13-kpi-unit">块</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="m13-split-main">
        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">情报板设备列表</span>
            </div>
            <span className="m13-panel-sub">
              更新于 {data?.lastUpdated ?? '11-26 10:45'}
            </span>
          </div>
          <div className="m13-panel-body">
            <div className="m13-table-wrap">
              <table className="m13-table">
                <thead>
                  <tr>
                    <th>设备编号</th>
                    <th>工区与点位</th>
                    <th>设备分组</th>
                    <th>在线状态</th>
                    <th>最近确认板面</th>
                    <th>最近发布</th>
                    <th>显示反馈</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: 'center',
                          color: '#8ab4dc',
                          padding: '28px',
                        }}
                      >
                        正在加载情报板设备...
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: 'center',
                          color: '#8ab4dc',
                          padding: '28px',
                        }}
                      >
                        暂无匹配的情报板设备
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((b) => (
                      <tr
                        key={b.id}
                        className={
                          sel && b.id === sel.id ? 'm13-row-selected' : ''
                        }
                        onClick={() => setSelectedBoardId(b.id)}
                      >
                        <td>
                          <span className="m13-cell-main">{b.id}</span>
                        </td>
                        <td>
                          <div className="m13-cell-main">
                            {secName(b.sectionId)} · {b.pointName}
                          </div>
                          <div className="m13-cell-sub">{b.stake}</div>
                        </td>
                        <td>{b.group}</td>
                        <td>
                          <span
                            className={`m13-tag ${
                              b.online ? 'm13-tag-green' : 'm13-tag-slate'
                            }`}
                          >
                            {b.online ? '在线' : '离线'}
                          </span>
                        </td>
                        <td>{b.confirmedTitle}</td>
                        <td>
                          <div className="m13-cell-main">{b.lastTime}</div>
                          <div className="m13-cell-sub">{b.lastOrderId}</div>
                        </td>
                        <td>
                          <span
                            className={`m13-tag ${statusTagClass(
                              b.feedbackStatus
                            )}`}
                          >
                            {b.feedbackStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m13-act-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBoardId(b.id);
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager
              totalCount={data?.total ?? 0}
              pageSize={6}
              currentPage={data?.page ?? page}
              unitLabel="块情报板"
              onPageChange={setPage}
            />
          </div>
        </section>

        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">情报板详情</span>
            </div>
            <span className="m13-head-chip">
              {sel?.direction ?? '北安方向'}
            </span>
          </div>
          <div className="m13-panel-body">
            {sel ? (
              <>
                <div className="m13-detail-top">
                  <span className="m13-detail-code">{sel.id}</span>
                  <span
                    className={`m13-tag ${
                      sel.online ? 'm13-tag-green' : 'm13-tag-slate'
                    }`}
                  >
                    {sel.online ? '在线' : '离线'}
                  </span>
                </div>
                <div className="m13-kv-list">
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">工程位置</span>
                    <span className="m13-kv-v">
                      {secName(sel.sectionId)} · {sel.stake} · {sel.pointName}
                    </span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">设备分组</span>
                    <span className="m13-kv-v">{sel.groupDetail}</span>
                  </div>
                  <div className="m13-kv-row">
                    <span className="m13-kv-k">设备规格</span>
                    <span className="m13-kv-v">{sel.spec}</span>
                  </div>
                </div>
                <div className="m13-subhead-row">
                  <span>当前已确认板面</span>
                  <span
                    className={`m13-tag ${statusTagClass(sel.feedbackStatus)}`}
                  >
                    {sel.feedbackStatus}
                  </span>
                </div>
                <LedBoardPreview
                  line1={sel.line1}
                  line2={sel.line2}
                  spec={sel.spec}
                />
                <div className="m13-led-caption">
                  <span>发布单 {sel.lastOrderId}</span>
                  <span>
                    {sel.feedbackStatus === '已确认显示'
                      ? `现场核验 ${sel.verifyTime}`
                      : '等待现场显示确认'}
                  </span>
                </div>
                <div className="m13-alert-list">
                  {pendingRecs.length === 0 ? (
                    <div className="m13-note-box">
                      <CheckCircle2 size={15} />
                      <span>
                        关联发布单 {contextOrderId} 全部目标设备已完成显示确认
                      </span>
                    </div>
                  ) : (
                    pendingRecs.map((r) => {
                      const rb = boardMap.get(r.boardId);
                      const hint =
                        rb && !rb.online
                          ? '离线，接收回执待返回'
                          : r.receiveStatus === '已接收'
                            ? '已接收，显示回读待返回'
                            : '已下发，接收回执待返回';
                      return (
                        <div
                          key={r.boardId}
                          className="m13-alert-row"
                          onClick={() =>
                            onNavigate('receipts', {
                              selectedOrderId: contextOrderId,
                              selectedBoardId: r.boardId,
                            })
                          }
                        >
                          <div className="m13-alert-left">
                            <span className="m13-alert-ico">
                              <AlertTriangle size={16} />
                            </span>
                            <span>
                              <strong>{r.boardId}</strong> {hint}
                            </span>
                          </div>
                          <span className="m13-tag m13-tag-amber">
                            {r.confirmStatus}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="m13-actions-row">
                  <button
                    type="button"
                    className="m13-btn-ghost"
                    onClick={() =>
                      onNavigate('review', {
                        selectedOrderId: sel.lastOrderId,
                      })
                    }
                  >
                    <FileText size={15} /> 查看发布单
                  </button>
                  <button
                    type="button"
                    className="m13-btn-primary"
                    onClick={() =>
                      onNavigate('receipts', {
                        selectedOrderId: sel.lastOrderId,
                        selectedBoardId: sel.id,
                      })
                    }
                  >
                    <Monitor size={15} /> 查看回执记录
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
