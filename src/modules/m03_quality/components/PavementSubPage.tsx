'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Gauge,
  Layers,
  RotateCcw,
  Ruler,
  Search,
  Thermometer,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg, TrendLineSvg } from '../QualityCharts';
import type { QualityPavementRecord } from '../types';
import {
  fmtInt,
  M03KpiSection,
  openGatewayModalPayload,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  RoadIcon,
  type QualitySubPageProps,
} from './shared';

export function PavementSubPage({
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
  const [pavDirection, setPavDirection] = useState('');
  const [pavLayer, setPavLayer] = useState('');
  const [pavQuick, setPavQuick] = useState('全部');
  const [pavementRecords, setPavementRecords] = useState<QualityPavementRecord[]>([]);
  const [pavementAlerts, setPavementAlerts] = useState<QualityPavementRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeSectionId]);

  const fetchPavement = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (pavDirection) qs.set('direction', pavDirection);
      if (pavLayer) qs.set('layer', pavLayer);
      if (pavQuick !== '全部') qs.set('quickFilter', pavQuick);
      const res = await fetch(`/api/v1/m03/pavement?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setPavementRecords(data.records ?? []);
        setPavementAlerts(data.alerts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, pavDirection, pavLayer, pavQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchPavement();
  }, [fetchPavement]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];
  const secMeta = useMemo(
    () => (activeSectionId ? sections.find((s) => s.sectionId === activeSectionId) ?? null : null),
    [sections, activeSectionId]
  );

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setPavDirection('');
    setPavLayer('');
    setPavQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const segCount = Math.round(
    (secMeta ? secMeta.pavSegments : 18) *
      (period === '2026年11月' ? 1 : pf.mult) *
      (pavLayer ? 0.35 : 1) *
      (pavDirection ? 0.5 : 1)
  );
  const pavKm = (
    (secMeta ? secMeta.pavKm : 42.6) *
    (period === '2026年11月' ? 1 : pf.mult) *
    (pavLayer ? 0.38 : 1) *
    (pavDirection ? 0.5 : 1)
  ).toFixed(1);
  const tempRate = Math.min(
    99.9,
    99.1 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.4 : 0)
  ).toFixed(1);
  const compRate = Math.min(
    99.9,
    98.6 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0)
  ).toFixed(1);
  const thickRate = Math.min(
    99.9,
    99.0 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.3 : 0)
  ).toFixed(1);

  const warnRatio = secMeta ? secMeta.pavKm / 42.6 : 1;
  const mult = period === '2026年11月' ? 1 : pf.mult;
  const warnSegs = [
    { name: '厚度偏差', color: '#2563eb', count: Math.max(activeSectionId ? 0 : 1, Math.round(3 * warnRatio * mult)) },
    { name: '压实度不足', color: '#06b6d4', count: Math.max(activeSectionId ? 0 : 1, Math.round(2 * warnRatio * mult)) },
    { name: '摊铺温度偏低', color: '#f59e0b', count: Math.max(activeSectionId ? 0 : 1, Math.round(2 * warnRatio * mult)) },
    { name: '碾压遍数不足', color: '#f43f5e', count: Math.max(0, Math.round(1 * warnRatio * mult)) },
  ];
  const totalWarn = Math.max(1, warnSegs.reduce((s, d) => s + d.count, 0));

  const trendBase = [98.0, 98.3, 98.5, 99.0, 98.7, 99.1];
  const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
    label: lbl,
    value: +Math.min(
      99.9,
      Math.max(97.2, trendBase[i] + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0))
    ).toFixed(1),
  }));

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(pavementRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = pavementRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const cols: ColumnDef<QualityPavementRecord>[] = [
    { key: 'section', header: '所属工区', render: (r) => r.section },
    { key: 'stake', header: '施工桩号', render: (r) => <span className="tabular-nums">{r.stake}</span> },
    { key: 'layer', header: '层位', render: (r) => r.layer },
    { key: 'temp', header: '摊铺温度', render: (r) => <span className="tabular-nums">{r.temp} ℃</span> },
    { key: 'passes', header: '碾压遍数', render: (r) => `${r.passes} 遍` },
    {
      key: 'compaction',
      header: '压实度',
      render: (r) => <span className="tabular-nums">{r.compaction.toFixed(1)}%</span>,
    },
    {
      key: 'thickness',
      header: '实测厚度',
      render: (r) => <span className="tabular-nums">{r.thickness.toFixed(1)} cm</span>,
    },
    {
      key: 'judge',
      header: '判定',
      render: (r) => <StatusBadge text={r.judge} tone={r.judge === '合格' ? 'ok' : 'warn'} />,
    },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m03-link-btn"
          onClick={() => onOpenModal({ kind: 'pavement', record: r })}
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
            <span className="m03-field-label">路线方向</span>
            <select
              className="glass-select m03-select"
              value={pavDirection}
              onChange={(e) => {
                setPavDirection(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部方向</option>
              <option value="左幅（明水→北安）">左幅（明水→北安）</option>
              <option value="右幅（北安→明水）">右幅（北安→明水）</option>
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">施工层位</span>
            <select
              className="glass-select m03-select"
              value={pavLayer}
              onChange={(e) => {
                setPavLayer(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部层位</option>
              <option value="上面层">上面层</option>
              <option value="中面层">中面层</option>
              <option value="下面层">下面层</option>
              <option value="水稳基层">水稳基层</option>
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
              void fetchPavement();
              showToast('已刷新路面施工质量数据');
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
            onClick={() => onOpenModal(openGatewayModalPayload('pavement'))}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <M03KpiSection
        title="路面施工质量概况"
        periodLabel={pf.label}
        cards={[
          { label: '施工段', value: fmtInt(Math.max(1, segCount)), unit: '段', icon: <RoadIcon /> },
          { label: '摊铺里程', value: pavKm, unit: 'km', icon: <Layers size={18} /> },
          { label: '摊铺温度合格率', value: tempRate, unit: '%', icon: <Thermometer size={18} /> },
          { label: '压实度合格率', value: compRate, unit: '%', icon: <Gauge size={18} /> },
          { label: '厚度合格率', value: thickRate, unit: '%', icon: <Ruler size={18} /> },
          {
            label: '质量预警',
            value: fmtInt(activeSectionId ? pavementAlerts.length : totalWarn),
            unit: '条',
            icon: <AlertTriangle size={18} />,
            tone: 'gold',
          },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel
          title="各工区摊铺里程"
          headerRight={<span className="m03-header-right">单位 km</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="pav-km"
              items={sections.map((s) => ({
                secId: s.sectionId,
                label: s.shortName,
                value: +(s.pavKm * pf.mult).toFixed(1),
              }))}
              minY={0}
              maxY={+(10 * pf.mult).toFixed(1)}
              ticks={[0, 2, 4, 6, 8, 10].map((v) => ({
                val: +(v * pf.mult).toFixed(1),
                label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1),
              }))}
              valueFormatter={(v) => v.toFixed(1)}
              activeSecId={activeSectionId}
              onBarClick={(secId) => {
                setPage(1);
                onBarToggle(secId);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel
          title="压实度合格率趋势"
          headerRight={<span className="m03-header-right">{pf.shortMonth}</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <TrendLineSvg
              idPrefix="pav-trend"
              points={trendPts}
              minY={97}
              maxY={100}
              ticks={[97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="路面质量预警分布" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <DonutChartSvg
              segments={warnSegs.filter((w) => w.count > 0)}
              centerVal={fmtInt(totalWarn)}
              centerUnit="条"
              centerSub="质量预警"
            />
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="摊铺碾压与检测记录"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '合格', '预警'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${pavQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setPavQuick(q);
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
              emptyText={loading ? '正在加载路面质控记录...' : '暂无匹配的路面检测记录'}
            />
          </div>
          <PaginationBar
            totalItems={pavementRecords.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="最新路面质量预警" className="m03-side-panel" bodyClassName="m03-side-body">
          <div className="m03-side-list">
            {pavementAlerts.length ? (
              pavementAlerts.map((a) => (
                <div
                  key={a.id}
                  className="m03-side-card"
                  onClick={() => onOpenModal({ kind: 'pavement', record: a })}
                >
                  <div className="m03-side-left">
                    <div className={`m03-side-ico ${!a.verified ? 'warn' : ''}`}>
                      {a.judge.includes('厚度') ? (
                        <Ruler size={18} />
                      ) : a.judge.includes('压实') ? (
                        <Gauge size={18} />
                      ) : (
                        <Thermometer size={18} />
                      )}
                    </div>
                    <div>
                      <div className="m03-side-title">{a.alertTitle}</div>
                      <div className="m03-side-sub">
                        {a.recordedAt} &nbsp;{a.stake}
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    text={a.verified ? '已核查' : '待核查'}
                    tone={a.verified ? 'ok' : 'warn'}
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                本工区暂无路面预警
              </div>
            )}
          </div>
          <div className="m03-side-footer">
            <span>同步于 {selectedDate} 10:45</span>
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => {
                setPavQuick('预警');
                setPage(1);
                showToast('已定位筛选：预警');
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
