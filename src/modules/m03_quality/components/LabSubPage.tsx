'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  FlaskConical,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg, TrendLineSvg } from '../QualityCharts';
import type { QualityLabRecord } from '../types';
import {
  fmtInt,
  M03KpiSection,
  openGatewayModalPayload,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  type QualitySubPageProps,
} from './shared';

export function LabSubPage({
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
  const [labName, setLabName] = useState('');
  const [labCategory, setLabCategory] = useState('');
  const [labQuick, setLabQuick] = useState('全部');
  const [labRecords, setLabRecords] = useState<QualityLabRecord[]>([]);
  const [labAlerts, setLabAlerts] = useState<QualityLabRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
    setLabName('');
  }, [activeSectionId]);

  const fetchLab = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (labName) qs.set('labName', labName);
      if (labCategory) qs.set('category', labCategory);
      if (labQuick !== '全部') qs.set('quickFilter', labQuick);
      const res = await fetch(`/api/v1/m03/lab?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setLabRecords(data.records ?? []);
        setLabAlerts(data.alerts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, labName, labCategory, labQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchLab();
  }, [fetchLab]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setLabName('');
    setLabCategory('');
    setLabQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const effectiveSec =
    activeSectionId ||
    (labName ? sections.find((s) => s.labName === labName)?.sectionId ?? null : null);
  const effMeta = effectiveSec
    ? sections.find((s) => s.sectionId === effectiveSec) ?? null
    : null;

  const catRatioMap: Record<string, number> = {
    '': 1,
    原材料: 0.37,
    混合料: 0.266,
    混凝土: 0.173,
    路基路面: 0.12,
    其他: 0.071,
  };
  const catRatio = catRatioMap[labCategory] ?? 1;
  const baseBatches = effMeta ? effMeta.labBatches : 8436;
  const totalBatches = Math.round(baseBatches * pf.mult * catRatio);
  const passRate = Math.min(99.9, (effMeta ? effMeta.labPassRate : 98.7) + pf.passDelta);
  const passBatches = Math.round(totalBatches * (passRate / 100));
  const failBatches = Math.max(0, totalBatches - passBatches);
  const reportCount = Math.max(0, totalBatches - Math.round(34 * pf.mult * (effMeta ? 0.17 : 1)));

  const distItems = [
    { name: '原材料', color: '#2563eb', ratio: 0.37 },
    { name: '混合料', color: '#06b6d4', ratio: 0.266 },
    { name: '混凝土', color: '#10b981', ratio: 0.173 },
    { name: '路基路面', color: '#f59e0b', ratio: 0.12 },
    { name: '其他', color: '#8b5cf6', ratio: 0.071 },
  ].map((d) => ({
    name: d.name,
    color: d.color,
    count: Math.round(baseBatches * pf.mult * d.ratio),
  }));

  const baseTrend = [98.2, 98.6, 98.5, 99.0, 98.8, 98.9];
  const trendShift = (effMeta ? effMeta.labPassRate - 98.7 : 0) + pf.passDelta;
  const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
    label: lbl,
    value: +Math.min(99.9, Math.max(97.1, baseTrend[i] + trendShift)).toFixed(1),
  }));

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(labRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = labRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const cols: ColumnDef<QualityLabRecord>[] = [
    { key: 'id', header: '检测编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
    { key: 'lab', header: '实验室', render: (r) => r.lab },
    { key: 'sample', header: '样品名称', render: (r) => r.sample },
    { key: 'item', header: '检测项目', render: (r) => r.item },
    { key: 'time', header: '检测时间', render: (r) => <span className="tabular-nums">{r.testedAt}</span> },
    {
      key: 'result',
      header: '检测结论',
      render: (r) => <StatusBadge text={r.result} tone={r.result === '合格' ? 'ok' : 'danger'} />,
    },
    {
      key: 'report',
      header: '报告',
      render: (r) =>
        r.reportState === '待出具' ? (
          <button
            type="button"
            className="m03-tag muted"
            style={{ cursor: 'pointer' }}
            onClick={() => onOpenModal({ kind: 'lab', record: r })}
          >
            待出具
          </button>
        ) : (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => onOpenModal({ kind: 'lab', record: r })}
          >
            查看报告
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
            <span className="m03-field-label">实验室</span>
            <select
              className="glass-select m03-select"
              value={labName}
              onChange={(e) => {
                setLabName(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部实验室</option>
              {sections.map((s) => (
                <option key={s.sectionId} value={s.labName}>
                  {s.labName}
                </option>
              ))}
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">检测类别</span>
            <select
              className="glass-select m03-select"
              value={labCategory}
              onChange={(e) => {
                setLabCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类别</option>
              <option value="原材料">原材料</option>
              <option value="混合料">混合料</option>
              <option value="混凝土">混凝土</option>
              <option value="路基路面">路基路面</option>
              <option value="其他">其他</option>
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
              void fetchLab();
              showToast('已刷新实验室检测数据');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
          <button
            type="button"
            className="dock-btn m03-btn-outline"
            onClick={() => onOpenModal(openGatewayModalPayload('lab'))}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <M03KpiSection
        title="实验室检测概况"
        periodLabel={pf.label}
        cards={[
          { label: '接入实验室', value: effectiveSec ? '1' : '6', unit: '座', icon: <FlaskConical size={18} /> },
          { label: '检测批次', value: fmtInt(totalBatches), unit: '批', icon: <ClipboardCheck size={18} /> },
          { label: '合格批次', value: fmtInt(passBatches), unit: '批', icon: <CheckCircle2 size={18} />, tone: 'green' },
          { label: '不合格批次', value: fmtInt(failBatches), unit: '批', icon: <AlertTriangle size={18} />, tone: 'gold' },
          { label: '检测合格率', value: passRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
          { label: '已出具报告', value: fmtInt(reportCount), unit: '份', icon: <FileText size={18} /> },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel
          title="各工区检测批次"
          headerRight={<span className="m03-header-right">单位 批</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="lab-batches"
              items={sections.map((s) => ({
                secId: s.sectionId,
                label: s.shortName,
                value: Math.round(s.labBatches * pf.mult),
              }))}
              minY={0}
              maxY={Math.round(1600 * pf.mult)}
              ticks={[0, 400, 800, 1200, 1600].map((v) => ({
                val: Math.round(v * pf.mult),
                label: fmtInt(v * pf.mult),
              }))}
              valueFormatter={(v) => fmtInt(v)}
              activeSecId={effectiveSec}
              onBarClick={(secId) => {
                setPage(1);
                onBarToggle(secId);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="检测类别分布" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <DonutChartSvg
              segments={distItems}
              centerVal={fmtInt(Math.round(baseBatches * pf.mult))}
              centerUnit="批"
              centerSub="检测批次"
              onSegmentClick={(val) => {
                setLabCategory((prev) => (prev === val ? '' : val));
                setPage(1);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel
          title="检测合格率趋势"
          headerRight={<span className="m03-header-right">{pf.shortMonth}</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <TrendLineSvg
              idPrefix="lab-trend"
              points={trendPts}
              minY={97}
              maxY={100}
              ticks={[97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="检测记录"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '合格', '不合格'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${labQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setLabQuick(q);
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
              emptyText={loading ? '正在加载检测记录...' : '暂无匹配的检测记录'}
            />
          </div>
          <PaginationBar
            totalItems={labRecords.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="最新不合格记录" className="m03-side-panel" bodyClassName="m03-side-body">
          <div className="m03-side-list">
            {labAlerts.length ? (
              labAlerts.map((a) => {
                const secName = sections.find((s) => s.sectionId === a.sectionId)?.name ?? '';
                return (
                  <div
                    key={a.id}
                    className="m03-side-card"
                    onClick={() => onOpenModal({ kind: 'lab', record: a })}
                  >
                    <div className="m03-side-left">
                      <div className={`m03-side-ico ${a.retestState === '待复检' ? 'warn' : ''}`}>
                        {a.retestState === '待复检' ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>
                      <div>
                        <div className="m03-side-title">
                          {secName} · {a.sample}
                          {a.item.replace('含量', '')}
                        </div>
                        <div className="m03-side-sub">
                          {a.testedAt} &nbsp;{a.id}
                        </div>
                      </div>
                    </div>
                    <StatusBadge
                      text={a.retestState}
                      tone={a.retestState === '已复检' ? 'ok' : 'warn'}
                    />
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                本工区暂无不合格检测记录
              </div>
            )}
          </div>
          <div className="m03-side-footer">
            <span>同步于 {selectedDate} 10:45</span>
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => {
                setLabQuick('不合格');
                setPage(1);
                showToast('已定位筛选：不合格');
              }}
            >
              查看全部 &gt;
            </button>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
