'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg, RingGaugeSvg } from '../QualityCharts';
import type { QualityIssueRecord } from '../types';
import {
  fmtInt,
  M03KpiSection,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  type QualitySubPageProps,
} from './shared';

export function IssuesSubPage({
  activeSectionId,
  selectedDate,
  period,
  sections,
  refreshKey,
  onSectionSelect,
  onBarToggle,
  onPeriodChange,
  onSectionsLoaded,
  onOpenModal,
  onResetGlobalSection,
  showToast,
}: QualitySubPageProps) {
  const [page, setPage] = useState(1);
  const [issueType, setIssueType] = useState('');
  const [issueStatus, setIssueStatus] = useState('');
  const [issueQuick, setIssueQuick] = useState('全部');
  const [issueRecords, setIssueRecords] = useState<QualityIssueRecord[]>([]);
  const [issueScopedRecords, setIssueScopedRecords] = useState<QualityIssueRecord[]>([]);
  const [sectionIssueCounts, setSectionIssueCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeSectionId]);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (issueType) qs.set('issueType', issueType);
      if (issueStatus) qs.set('status', issueStatus);
      if (issueQuick !== '全部') qs.set('quickFilter', issueQuick);
      const res = await fetch(`/api/v1/m03/issues?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setIssueRecords(data.records ?? []);
        setIssueScopedRecords(data.scopedRecords ?? []);
        setSectionIssueCounts(data.sectionIssueCounts ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, issueType, issueStatus, issueQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchIssues();
  }, [fetchIssues]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setIssueType('');
    setIssueStatus('');
    setIssueQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const totalCount = issueScopedRecords.length;
  const doneList = issueScopedRecords.filter((i) => i.status === '已整改');
  const ingList = issueScopedRecords.filter((i) => i.status === '整改中');
  const overList = issueScopedRecords.filter((i) => i.status === '已超期');
  const rectifyPct = totalCount > 0 ? (doneList.length / totalCount) * 100 : 100;
  const avgDays =
    doneList.length > 0
      ? (doneList.reduce((s, i) => s + (i.daysUsed ?? 2.3), 0) / doneList.length).toFixed(1)
      : '0.0';

  const typeDefs = [
    { name: '原材料质量', color: '#2563eb' },
    { name: '施工工艺', color: '#06b6d4' },
    { name: '检测异常', color: '#10b981' },
    { name: '构件质量', color: '#f59e0b' },
    { name: '其他', color: '#f43f5e' },
  ];
  const donutSegs = typeDefs
    .map((td) => ({
      name: td.name,
      color: td.color,
      count: issueScopedRecords.filter((i) => i.issueType === td.name).length,
    }))
    .filter((d) => d.count > 0 || !activeSectionId);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(issueRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = issueRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingIssue = ingList[0] ?? overList[0] ?? null;

  const cols: ColumnDef<QualityIssueRecord>[] = [
    { key: 'id', header: '问题编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
    { key: 'section', header: '所属工区', render: (r) => r.section },
    { key: 'type', header: '问题类型', render: (r) => r.issueType },
    { key: 'desc', header: '问题描述', render: (r) => r.description },
    { key: 'unit', header: '整改责任单位', render: (r) => r.unit },
    { key: 'deadline', header: '整改期限', render: (r) => <span className="tabular-nums">{r.deadline}</span> },
    {
      key: 'status',
      header: '状态',
      render: (r) => (
        <StatusBadge
          text={r.status}
          tone={r.status === '已整改' ? 'ok' : r.status === '已超期' ? 'danger' : 'info'}
        />
      ),
    },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m03-link-btn"
          onClick={() => onOpenModal({ kind: 'issue', record: r })}
        >
          详情
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="glass-panel m03-filter-panel">
        <div className="m03-filter-fields">
          <div className="m03-field">
            <span className="m03-field-label">所属工区</span>
            <select
              className="glass-select m03-select"
              value={activeSectionId ?? ''}
              onChange={(e) => {
                setPage(1);
                onSectionSelect(e.target.value);
              }}
            >
              <option value="">全部工区</option>
              {sections.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">问题类型</span>
            <select
              className="glass-select m03-select"
              value={issueType}
              onChange={(e) => {
                setIssueType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              {typeDefs.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">整改状态</span>
            <select
              className="glass-select m03-select"
              value={issueStatus}
              onChange={(e) => {
                setIssueStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="整改中">整改中</option>
              <option value="已整改">已整改</option>
              <option value="已超期">已超期</option>
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">统计周期</span>
            <select
              className="glass-select m03-select"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
            >
              {Object.keys(PERIOD_FACTORS).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m03-filter-actions">
          <button
            type="button"
            className="m03-btn-query"
            onClick={() => {
              setPage(1);
              void fetchIssues();
              showToast('已刷新质量问题整改台账');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      <M03KpiSection
        title="质量问题与整改概况"
        periodLabel={pf.label}
        cards={[
          { label: '本期问题', value: fmtInt(totalCount), unit: '项', icon: <ClipboardCheck size={18} /> },
          { label: '已整改', value: fmtInt(doneList.length), unit: '项', icon: <CheckCircle2 size={18} />, tone: 'green' },
          { label: '整改中', value: fmtInt(ingList.length), unit: '项', icon: <Clock size={18} />, tone: 'blue' },
          { label: '已超期', value: fmtInt(overList.length), unit: '项', icon: <AlertTriangle size={18} />, tone: 'gold' },
          { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: <ShieldCheck size={18} />, tone: 'green' },
          { label: '平均整改用时', value: avgDays, unit: '天', icon: <Clock size={18} /> },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel
          title="各工区问题数量"
          headerRight={<span className="m03-header-right">单位 项</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="iss-cnt"
              items={sections.map((s) => ({
                secId: s.sectionId,
                label: s.shortName,
                value: sectionIssueCounts[s.sectionId] ?? 0,
              }))}
              minY={0}
              maxY={Math.max(4, ...sections.map((s) => sectionIssueCounts[s.sectionId] ?? 0))}
              ticks={[0, 1, 2, 3, 4].map((v) => ({ val: v, label: String(v) }))}
              valueFormatter={(v) => fmtInt(v)}
              activeSecId={activeSectionId}
              onBarClick={(secId) => {
                setPage(1);
                onBarToggle(secId);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="质量问题类型分布" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <DonutChartSvg
              segments={donutSegs}
              centerVal={fmtInt(totalCount)}
              centerUnit="项"
              centerSub="问题总数"
              onSegmentClick={(val) => {
                setIssueType((prev) => (prev === val ? '' : val));
                setPage(1);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="整改进展" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <RingGaugeSvg
              idPrefix="iss-rectify"
              pct={rectifyPct}
              subLabel="整改完成率"
              rows={[
                { label: '问题总数', value: `${fmtInt(totalCount)} 项`, valColor: '#ffffff' },
                { label: '已整改', value: `${fmtInt(doneList.length)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
                { label: '整改中', value: `${fmtInt(ingList.length)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
                { label: '已超期', value: `${fmtInt(overList.length)} 项`, dotColor: '#f87171', valColor: '#f87171' },
              ]}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="质量问题台账"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '整改中', '已整改', '已超期'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${issueQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setIssueQuick(q);
                    setPage(1);
                  }}
                >
                  {q}
                </button>
              ))}
              <button
                type="button"
                className="m03-qpill"
                onClick={() =>
                  onOpenModal({ kind: 'createIssue', defaultSectionId: activeSectionId })
                }
              >
                <Plus size={12} style={{ display: 'inline', marginRight: '3px' }} />
                上报问题
              </button>
            </div>
          }
        >
          <div className="m03-table-wrap">
            <DataTable
              columns={cols}
              rows={pagedRows}
              rowKey={(r) => r.id}
              emptyText={loading ? '正在加载质量问题台账...' : '当前筛选条件下暂无质量问题记录'}
            />
          </div>
          <PaginationBar
            totalItems={issueRecords.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="待整改事项" className="m03-side-panel" bodyClassName="m03-side-body">
          {pendingIssue ? (
            <>
              <div className="m03-pending-card">
                <div className="m03-pending-top">
                  <span className="m03-pending-code">{pendingIssue.id}</span>
                  <StatusBadge
                    text={pendingIssue.status}
                    tone={pendingIssue.status === '已超期' ? 'danger' : 'info'}
                  />
                </div>
                <div className="m03-pending-title">
                  {pendingIssue.section} · {pendingIssue.title}
                </div>
                <div className="m03-pending-desc">{pendingIssue.description}</div>
                <div className="m03-pending-kv">
                  <span className="m03-pending-k">整改责任单位</span>
                  <span className="m03-pending-v">{pendingIssue.unit}</span>
                </div>
                <div className="m03-pending-kv">
                  <span className="m03-pending-k">发现时间</span>
                  <span className="m03-pending-v">{pendingIssue.foundAt}</span>
                </div>
                <div className="m03-pending-kv">
                  <span className="m03-pending-k">整改期限</span>
                  <span className="m03-pending-v">{pendingIssue.deadline}</span>
                </div>
              </div>
              <div className="m03-side-footer">
                <span>待整改 {ingList.length + overList.length} 项</span>
                <button
                  type="button"
                  className="m03-link-btn"
                  onClick={() => onOpenModal({ kind: 'issue', record: pendingIssue })}
                >
                  查看详情 &gt;
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="m03-pending-card" style={{ textAlign: 'center', padding: '28px 16px' }}>
                <div style={{ color: '#4ade80', fontSize: '15px', fontWeight: 700 }}>
                  当前范围已全部整改销号
                </div>
                <div style={{ color: '#93b8de', fontSize: '12px' }}>
                  全部质量问题均已完成闭环复验（整改率 100.0%）
                </div>
              </div>
              <div className="m03-side-footer">
                <span>待整改 0 项</span>
                <button
                  type="button"
                  className="m03-link-btn"
                  onClick={() => {
                    setIssueQuick('全部');
                    setPage(1);
                  }}
                >
                  查看全部 &gt;
                </button>
              </div>
            </>
          )}
        </GlassPanel>
      </div>
    </>
  );
}
