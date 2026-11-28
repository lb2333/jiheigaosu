'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg, RingGaugeSvg } from '../QualityCharts';
import type { QualityInspectionRecord, QualityIssueRecord } from '../types';
import {
  BeamIcon,
  fmtInt,
  M03KpiSection,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  type QualitySubPageProps,
} from './shared';

export function OverviewSubPage({
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
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [ovCategory, setOvCategory] = useState('');
  const [ovQuick, setOvQuick] = useState('全部');
  const [inspections, setInspections] = useState<QualityInspectionRecord[]>([]);
  const [overviewIssues, setOverviewIssues] = useState<QualityIssueRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeSectionId]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (ovCategory) qs.set('category', ovCategory);
      if (ovQuick !== '全部') qs.set('quickFilter', ovQuick);
      const res = await fetch(`/api/v1/m03/overview?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setInspections(data.inspections ?? []);
        setOverviewIssues(data.issues ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, ovCategory, ovQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];
  const secMeta = useMemo(
    () => (activeSectionId ? sections.find((s) => s.sectionId === activeSectionId) ?? null : null),
    [sections, activeSectionId]
  );

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setOvCategory('');
    setOvQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const pageSize = 5;
  const baseIssueCount = overviewIssues.length;
  const doneCount = overviewIssues.filter((i) => i.status === '已整改').length;
  const ingCount = overviewIssues.filter((i) => i.status === '整改中').length;
  const overCount = overviewIssues.filter((i) => i.status === '已超期').length;
  const issueMult = period === '2026年11月' || period === '2026年10月' ? 1 : pf.mult;
  const dispTotalIssues =
    period === '2026年11月' ? baseIssueCount : Math.max(1, Math.round(baseIssueCount * issueMult));
  const dispDone =
    period === '2026年11月' ? doneCount : Math.max(1, Math.round(doneCount * issueMult));
  const dispIng =
    period === '2026年11月' ? ingCount : Math.max(0, dispTotalIssues - dispDone - overCount);
  const rectifyPct = dispTotalIssues > 0 ? (dispDone / dispTotalIssues) * 100 : 100;

  const catFactor = ovCategory ? 0.28 : 1;
  const rawBatches = secMeta ? secMeta.labBatches : 8436;
  const batches = Math.round(rawBatches * pf.mult * catFactor);
  const passRate = Math.min(99.9, (secMeta ? secMeta.qualityRate : 98.7) + pf.passDelta);
  const mixVol = (
    (secMeta ? secMeta.mixVol : 36.8) *
    pf.mult *
    (ovCategory === '桥梁工程' ? 0.52 : ovCategory ? 0.35 : 1)
  ).toFixed(1);
  const beams = Math.round(
    (secMeta ? secMeta.beams : 640) *
      pf.mult *
      (ovCategory && ovCategory !== '桥梁工程' ? 0.25 : 1)
  );

  const typeDefs = [
    { name: '原材料质量', filterVal: '原材料', color: '#2563eb' },
    { name: '施工工艺', filterVal: '施工工艺', color: '#06b6d4' },
    { name: '检测异常', filterVal: '检测', color: '#10b981' },
    { name: '构件质量', filterVal: '构件质量', color: '#f59e0b' },
    { name: '其他', filterVal: '全部', color: '#f43f5e' },
  ];
  const donutSegs = typeDefs
    .map((td) => {
      const cnt = overviewIssues.filter((i) => i.issueType === td.name).length;
      return {
        name: td.name,
        filterVal: td.filterVal,
        color: td.color,
        count: period === '2026年11月' ? cnt : Math.round(cnt * issueMult),
      };
    })
    .filter((s) => s.count > 0 || !activeSectionId);

  const totalPages = Math.max(1, Math.ceil(inspections.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = inspections.slice((safePage - 1) * pageSize, safePage * pageSize);

  const cols: ColumnDef<QualityInspectionRecord>[] = [
    {
      key: 'idx',
      header: '序号',
      render: (r) => {
        const idx = inspections.findIndex((x) => x.id === r.id);
        return idx >= 0 ? idx + 1 : 1;
      },
    },
    { key: 'section', header: '所属工区', render: (r) => r.section },
    { key: 'target', header: '检查对象', render: (r) => r.target },
    { key: 'content', header: '检查内容', render: (r) => r.content },
    {
      key: 'result',
      header: '检查结果',
      render: (r) => <StatusBadge text={r.result} tone={r.result === '合格' ? 'ok' : 'danger'} />,
    },
    { key: 'desc', header: '问题描述', render: (r) => r.description },
    {
      key: 'rectify',
      header: '整改状态',
      render: (r) =>
        r.rectify === '—' ? (
          '—'
        ) : (
          <StatusBadge text={r.rectify} tone={r.rectify === '已整改' ? 'ok' : 'info'} />
        ),
    },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m03-link-btn"
          onClick={() => onOpenModal({ kind: 'inspection', record: r })}
        >
          查看
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
            <span className="m03-field-label">工程类别</span>
            <select
              className="glass-select m03-select"
              value={ovCategory}
              onChange={(e) => {
                setOvCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类别</option>
              <option value="路基工程">路基工程</option>
              <option value="桥梁工程">桥梁工程</option>
              <option value="路面工程">路面工程</option>
              <option value="场站工程">场站工程</option>
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
              void fetchOverview();
              showToast('已按当前筛选条件刷新质量数据');
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
        title="质量概况"
        periodLabel={pf.label}
        cards={[
          { label: '检测批次', value: fmtInt(batches), unit: '批', icon: <ClipboardCheck size={18} /> },
          { label: '质量合格率', value: passRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
          { label: '拌合站生产量', value: mixVol, unit: '万m³', icon: <Layers size={18} /> },
          { label: '梁片生产数量', value: fmtInt(beams), unit: '片', icon: <BeamIcon /> },
          { label: '质量问题', value: fmtInt(dispTotalIssues), unit: '项', icon: <AlertTriangle size={18} />, tone: 'gold' },
          { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: <CheckCircle2 size={18} />, tone: 'green' },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel title="各工区质量合格率" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="ov-rate"
              items={sections.map((s) => ({
                secId: s.sectionId,
                label: s.shortName,
                value: +(s.qualityRate + pf.passDelta).toFixed(1),
              }))}
              minY={90}
              maxY={100}
              ticks={[90, 92, 94, 96, 98, 100].map((v) => ({ val: v, label: `${v}%` }))}
              valueFormatter={(v) => `${v.toFixed(1)}%`}
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
              centerVal={fmtInt(dispTotalIssues)}
              centerUnit="项"
              centerSub="问题总数"
              onSegmentClick={(val) => {
                setOvQuick(val);
                setPage(1);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="整改进展" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <RingGaugeSvg
              idPrefix="ov-rectify"
              pct={rectifyPct}
              subLabel="整改完成率"
              rows={[
                { label: '问题总数', value: `${fmtInt(dispTotalIssues)} 项`, valColor: '#ffffff' },
                { label: '已整改', value: `${fmtInt(dispDone)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
                { label: '整改中', value: `${fmtInt(dispIng)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
                { label: '已超期', value: `${fmtInt(overCount)} 项`, dotColor: '#f87171', valColor: '#f87171' },
              ]}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="质量检查记录"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '原材料', '施工工艺', '检测', '构件质量'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${ovQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setOvQuick(q);
                    setPage(1);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          }
        >
          <div className="m03-table-wrap">
            <DataTable
              columns={cols}
              rows={pagedRows}
              rowKey={(r) => r.id}
              emptyText={loading ? '正在加载质量检查记录...' : '当前筛选条件下暂无质量检查记录'}
            />
          </div>
          <PaginationBar
            totalItems={inspections.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="关键场站质量状态" className="m03-side-panel" bodyClassName="m03-side-body">
          <div className="m03-side-list">
            <div className="m03-side-card" onClick={() => router.push('/quality/mixing')}>
              <div className="m03-side-left">
                <div className="m03-side-ico">
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="m03-side-title">拌合站 ({activeSectionId ? '1座' : '6座'})</div>
                  <div className="m03-side-sub">生产及配合比数据已同步</div>
                </div>
              </div>
              <StatusBadge text="运行正常" tone="ok" />
            </div>

            <div className="m03-side-card" onClick={() => router.push('/quality/beamYard')}>
              <div className="m03-side-left">
                <div className="m03-side-ico">
                  <BeamIcon />
                </div>
                <div>
                  <div className="m03-side-title">梁场 ({activeSectionId ? '1座' : '2座'})</div>
                  <div className="m03-side-sub">梁片及工序数据已同步</div>
                </div>
              </div>
              <StatusBadge text="运行正常" tone="ok" />
            </div>

            <div className="m03-side-card" onClick={() => router.push('/quality/lab')}>
              <div className="m03-side-left">
                <div className="m03-side-ico">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <div className="m03-side-title">实验室 ({activeSectionId ? '1座' : '6座'})</div>
                  <div className="m03-side-sub">检测及报告数据已同步</div>
                </div>
              </div>
              <StatusBadge text="运行正常" tone="ok" />
            </div>
          </div>

          <div className="m03-side-footer">
            <span>同步于 {selectedDate} 10:45</span>
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => onOpenModal({ kind: 'stations', sections, activeSectionId })}
            >
              查看场站 &gt;
            </button>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
