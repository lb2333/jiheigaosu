'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  ExternalLink,
  FlaskConical,
  Gauge,
  RotateCcw,
  Search,
  ShieldCheck,
  Thermometer,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg } from '../QualityCharts';
import type { QualityBeamRecord } from '../types';
import {
  beamBadgeTone,
  BeamIcon,
  fmtInt,
  M03KpiSection,
  openGatewayModalPayload,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  type QualitySubPageProps,
} from './shared';

export function BeamYardSubPage({
  activeSectionId,
  selectedDate,
  period,
  sections,
  refreshKey,
  onSectionSelect,
  onPeriodChange,
  onSectionsLoaded,
  onOpenModal,
  onResetGlobalSection,
  showToast,
}: QualitySubPageProps) {
  const [page, setPage] = useState(1);
  const [beamYard, setBeamYard] = useState('');
  const [beamType, setBeamType] = useState('');
  const [beamQuick, setBeamQuick] = useState('全部');
  const [beamRecords, setBeamRecords] = useState<QualityBeamRecord[]>([]);
  const [beamAlerts, setBeamAlerts] = useState<QualityBeamRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeSectionId]);

  const fetchBeamYard = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (beamYard) qs.set('yard', beamYard);
      if (beamType) qs.set('beamType', beamType);
      if (beamQuick !== '全部') qs.set('quickFilter', beamQuick);
      const res = await fetch(`/api/v1/m03/beam-yard?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setBeamRecords(data.records ?? []);
        setBeamAlerts(data.alerts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, beamYard, beamType, beamQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchBeamYard();
  }, [fetchBeamYard]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];
  const secMeta = useMemo(
    () => (activeSectionId ? sections.find((s) => s.sectionId === activeSectionId) ?? null : null),
    [sections, activeSectionId]
  );

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setBeamYard('');
    setBeamType('');
    setBeamQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const targetYard = beamYard || (secMeta ? secMeta.yardName : '');
  const baseTotal = secMeta ? secMeta.beams : beamYard ? 320 : 640;
  const typeRatioMap: Record<string, number> = {
    '': 1,
    '30 m 箱梁': 360 / 640,
    '40 m 箱梁': 220 / 640,
    '20 m 空心板梁': 60 / 640,
  };
  const totalBeams = Math.round(baseTotal * pf.mult * (typeRatioMap[beamType] ?? 1));
  const prodRatio = baseTotal / 640;

  const trendBars = [
    { label: '01—05日', value: Math.round(104 * prodRatio * pf.mult) },
    { label: '06—10日', value: Math.round(121 * prodRatio * pf.mult) },
    { label: '11—15日', value: Math.round(123 * prodRatio * pf.mult) },
    { label: '16—20日', value: Math.round(148 * prodRatio * pf.mult) },
    { label: '21—25日', value: Math.round(144 * prodRatio * pf.mult) },
  ];

  const beamTypesDist = [
    { name: '30 m 箱梁', color: '#2563eb', count: Math.round(360 * prodRatio * pf.mult) },
    { name: '40 m 箱梁', color: '#06b6d4', count: Math.round(220 * prodRatio * pf.mult) },
    { name: '20 m 空心板梁', color: '#10b981', count: Math.round(60 * prodRatio * pf.mult) },
  ];

  const tensionPct = Math.min(99.9, 99.5 + pf.passDelta);
  const groutPct = Math.min(99.9, 99.7 + pf.passDelta);
  const inspectPct = Math.min(99.9, 99.2 + pf.passDelta);
  const warnTotal = Math.max(
    beamAlerts.length,
    Math.round(5 * prodRatio * (period === '2026年11月' ? 1 : pf.mult))
  );

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(beamRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = beamRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const cols: ColumnDef<QualityBeamRecord>[] = [
    { key: 'id', header: '梁片编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
    { key: 'yard', header: '所属梁场', render: (r) => r.yard },
    { key: 'type', header: '梁型', render: (r) => r.beamType },
    { key: 'date', header: '浇筑日期', render: (r) => <span className="tabular-nums">{r.castDate}</span> },
    { key: 'curing', header: '养护状态', render: (r) => <StatusBadge text={r.curing} tone={beamBadgeTone(r.curing)} /> },
    { key: 'tension', header: '张拉', render: (r) => <StatusBadge text={r.tension} tone={beamBadgeTone(r.tension)} /> },
    { key: 'grout', header: '压浆', render: (r) => <StatusBadge text={r.grout} tone={beamBadgeTone(r.grout)} /> },
    { key: 'inspect', header: '检验', render: (r) => <StatusBadge text={r.inspect} tone={beamBadgeTone(r.inspect)} /> },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m03-link-btn"
          onClick={() => onOpenModal({ kind: 'beamYard', record: r })}
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
            <span className="m03-field-label">梁场</span>
            <select
              className="glass-select m03-select"
              value={beamYard}
              onChange={(e) => {
                setBeamYard(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部梁场</option>
              <option value="一号梁场">一号梁场</option>
              <option value="二号梁场">二号梁场</option>
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">梁型</span>
            <select
              className="glass-select m03-select"
              value={beamType}
              onChange={(e) => {
                setBeamType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部梁型</option>
              <option value="30 m 箱梁">30 m 箱梁</option>
              <option value="40 m 箱梁">40 m 箱梁</option>
              <option value="20 m 空心板梁">20 m 空心板梁</option>
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
              void fetchBeamYard();
              showToast('已刷新智慧梁场生产与工序数据');
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
            onClick={() => onOpenModal(openGatewayModalPayload('beamYard'))}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <M03KpiSection
        title="梁片生产质量概况"
        periodLabel={pf.label}
        cards={[
          { label: '接入梁场', value: targetYard ? '1' : '2', unit: '座', icon: <Building2 size={18} /> },
          { label: '累计生产', value: fmtInt(totalBeams), unit: '片', icon: <BeamIcon /> },
          { label: '成品检验合格率', value: inspectPct.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
          { label: '张拉合格率', value: tensionPct.toFixed(1), unit: '%', icon: <Gauge size={18} /> },
          { label: '压浆合格率', value: groutPct.toFixed(1), unit: '%', icon: <FlaskConical size={18} /> },
          { label: '工序预警', value: fmtInt(warnTotal), unit: '条', icon: <AlertTriangle size={18} />, tone: 'gold' },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel
          title="梁片生产趋势"
          headerRight={<span className="m03-header-right">单位 片</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="beam-trend"
              items={trendBars}
              minY={0}
              maxY={Math.round(160 * prodRatio * pf.mult)}
              ticks={[0, 40, 80, 120, 160].map((v) => ({
                val: Math.round(v * prodRatio * pf.mult),
                label: fmtInt(v * prodRatio * pf.mult),
              }))}
              valueFormatter={(v) => fmtInt(v)}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="梁型分布" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <DonutChartSvg
              segments={beamTypesDist}
              centerVal={fmtInt(Math.round(baseTotal * pf.mult))}
              centerUnit="片"
              centerSub="累计生产"
              onSegmentClick={(val) => {
                setBeamType((prev) => (prev === val ? '' : val));
                setPage(1);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="关键工序合格率" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <div className="m03-proc-bars">
              <div>
                <div className="m03-proc-top">
                  <span className="m03-proc-name">预应力张拉</span>
                  <span className="m03-proc-val">{tensionPct.toFixed(1)}%</span>
                </div>
                <div className="m03-proc-track">
                  <div
                    className="m03-proc-fill"
                    style={{
                      width: `${tensionPct}%`,
                      background: 'linear-gradient(90deg,#0284c7,#38f2ff)',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="m03-proc-top">
                  <span className="m03-proc-name">孔道压浆</span>
                  <span className="m03-proc-val" style={{ color: '#4ade80' }}>
                    {groutPct.toFixed(1)}%
                  </span>
                </div>
                <div className="m03-proc-track">
                  <div
                    className="m03-proc-fill"
                    style={{
                      width: `${groutPct}%`,
                      background: 'linear-gradient(90deg,#0d9488,#22c55e)',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="m03-proc-top">
                  <span className="m03-proc-name">成品检验</span>
                  <span className="m03-proc-val" style={{ color: '#60a5fa' }}>
                    {inspectPct.toFixed(1)}%
                  </span>
                </div>
                <div className="m03-proc-track">
                  <div
                    className="m03-proc-fill"
                    style={{
                      width: `${inspectPct}%`,
                      background: 'linear-gradient(90deg,#1d4ed8,#38bdf8)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="梁片生产与工序记录"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '生产中', '已检验'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${beamQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setBeamQuick(q);
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
              emptyText={loading ? '正在加载梁片台账...' : '暂无匹配的梁片记录'}
            />
          </div>
          <PaginationBar
            totalItems={beamRecords.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="最新工序预警" className="m03-side-panel" bodyClassName="m03-side-body">
          <div className="m03-side-list">
            {beamAlerts.length ? (
              beamAlerts.map((a) => (
                <div
                  key={a.id}
                  className="m03-side-card"
                  onClick={() => onOpenModal({ kind: 'beamYard', record: a })}
                >
                  <div className="m03-side-left">
                    <div className={`m03-side-ico ${a.alertState === '待复检' ? 'warn' : ''}`}>
                      {a.alertTitle.includes('温度') ? (
                        <Thermometer size={18} />
                      ) : (
                        <Gauge size={18} />
                      )}
                    </div>
                    <div>
                      <div className="m03-side-title">{a.alertTitle}</div>
                      <div className="m03-side-sub">
                        {a.alertTime} &nbsp;{a.id}
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    text={a.alertState}
                    tone={
                      a.alertState === '已处理'
                        ? 'ok'
                        : a.alertState === '跟踪中'
                          ? 'info'
                          : 'warn'
                    }
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                当前梁场暂无工序预警
              </div>
            )}
          </div>
          <div className="m03-side-footer">
            <span>同步于 {selectedDate} 10:45</span>
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => {
                setBeamQuick('生产中');
                setPage(1);
                showToast('已定位筛选：生产中');
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
