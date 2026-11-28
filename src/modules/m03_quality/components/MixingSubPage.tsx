'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChartSvg, DonutChartSvg, RingGaugeSvg } from '../QualityCharts';
import type { QualityMixingRecord } from '../types';
import {
  fmtInt,
  M03KpiSection,
  openGatewayModalPayload,
  PaginationBar,
  PERIOD_FACTORS,
  periodForDate,
  type QualitySubPageProps,
} from './shared';

export function MixingSubPage({
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
  const [mixStation, setMixStation] = useState('');
  const [mixProdType, setMixProdType] = useState('');
  const [mixQuick, setMixQuick] = useState('全部');
  const [mixingRecords, setMixingRecords] = useState<QualityMixingRecord[]>([]);
  const [mixingAlerts, setMixingAlerts] = useState<QualityMixingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
    setMixStation('');
  }, [activeSectionId]);

  const fetchMixing = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (mixStation) qs.set('station', mixStation);
      if (mixProdType) qs.set('prodType', mixProdType);
      if (mixQuick !== '全部') qs.set('quickFilter', mixQuick);
      const res = await fetch(`/api/v1/m03/mixing?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections) && data.sections.length) {
          onSectionsLoaded(data.sections);
        }
        setMixingRecords(data.records ?? []);
        setMixingAlerts(data.alerts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, mixStation, mixProdType, mixQuick, refreshKey, onSectionsLoaded]);

  useEffect(() => {
    void fetchMixing();
  }, [fetchMixing]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];

  function handleReset() {
    onPeriodChange(periodForDate(selectedDate));
    setPage(1);
    setMixStation('');
    setMixProdType('');
    setMixQuick('全部');
    onResetGlobalSection();
    showToast('已重置质量管理筛选条件');
  }

  const effectiveSec =
    activeSectionId ||
    (mixStation ? sections.find((s) => s.stationFull === mixStation)?.sectionId ?? null : null);
  const effMeta = effectiveSec
    ? sections.find((s) => s.sectionId === effectiveSec) ?? null
    : null;

  const totalVol = (
    (effMeta ? effMeta.mixVol : 36.8) *
    pf.mult *
    (mixProdType ? 0.42 : 1)
  ).toFixed(1);
  const baseBatches = effMeta ? Math.round(2460 * (effMeta.mixVol / 36.8)) : 2460;
  const typeRatioMap: Record<string, number> = {
    '': 1,
    水泥混凝土: 0.439,
    水泥稳定碎石: 0.335,
    沥青混合料: 0.226,
  };
  const totalBatches = Math.round(baseBatches * pf.mult * (typeRatioMap[mixProdType] ?? 1));

  const newlyHandled = mixingAlerts.filter(
    (r) => r.handled && r.id !== 'BH-20261124-077'
  ).length;
  const baseWarn = effMeta ? Math.max(3, Math.round(27 * (effMeta.mixVol / 36.8))) : 27;
  const warnCount = Math.round(baseWarn * pf.mult);
  const baseHandled = Math.max(
    0,
    warnCount - Math.max(0, (effectiveSec ? 1 : 2) - newlyHandled)
  );
  const warnHandleRate = warnCount > 0 ? (baseHandled / warnCount) * 100 : 100;
  const mixPassRate = Math.min(
    99.9,
    (effMeta ? 98.7 + (effMeta.qualityRate - 98.7) * 0.6 : 98.9) + pf.passDelta
  );

  const typeSegs = [
    { name: '水泥混凝土', color: '#2563eb', ratio: 1080 / 2460 },
    { name: '水泥稳定碎石', color: '#06b6d4', ratio: 824 / 2460 },
    { name: '沥青混合料', color: '#10b981', ratio: 556 / 2460 },
  ].map((d) => ({ name: d.name, color: d.color, count: Math.round(baseBatches * pf.mult * d.ratio) }));

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(mixingRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = mixingRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const cols: ColumnDef<QualityMixingRecord>[] = [
    { key: 'id', header: '批次编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
    { key: 'section', header: '所属工区', render: (r) => r.section },
    { key: 'station', header: '拌合站', render: (r) => r.station },
    { key: 'type', header: '生产类型', render: (r) => r.prodType },
    { key: 'mixCode', header: '配合比', render: (r) => r.mixCode },
    {
      key: 'volume',
      header: '生产量',
      render: (r) => <span className="tabular-nums">{r.volume.toFixed(1)} m³</span>,
    },
    { key: 'time', header: '生产时间', render: (r) => <span className="tabular-nums">{r.producedAt}</span> },
    {
      key: 'judge',
      header: '质量判定',
      render: (r) => <StatusBadge text={r.judge} tone={r.judge === '合格' ? 'ok' : 'warn'} />,
    },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m03-link-btn"
          onClick={() => onOpenModal({ kind: 'mixing', record: r })}
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
            <span className="m03-field-label">拌合站</span>
            <select
              className="glass-select m03-select"
              value={mixStation}
              onChange={(e) => {
                setMixStation(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部拌合站</option>
              {sections.map((s) => (
                <option key={s.sectionId} value={s.stationFull}>
                  {s.stationFull}
                </option>
              ))}
            </select>
          </div>
          <div className="m03-field">
            <span className="m03-field-label">生产类型</span>
            <select
              className="glass-select m03-select"
              value={mixProdType}
              onChange={(e) => {
                setMixProdType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              <option value="水泥混凝土">水泥混凝土</option>
              <option value="水泥稳定碎石">水泥稳定碎石</option>
              <option value="沥青混合料">沥青混合料</option>
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
              void fetchMixing();
              showToast('已刷新拌合站生产数据');
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
            onClick={() => onOpenModal(openGatewayModalPayload('mixing'))}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <M03KpiSection
        title="拌合站生产概况"
        periodLabel={pf.label}
        cards={[
          { label: '接入拌合站', value: effectiveSec ? '1' : '6', unit: '座', icon: <Building2 size={18} /> },
          { label: '累计产量', value: totalVol, unit: '万m³', icon: <Layers size={18} /> },
          { label: '生产批次', value: fmtInt(totalBatches), unit: '批', icon: <ClipboardCheck size={18} /> },
          { label: '配合比合格率', value: mixPassRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
          { label: '预警批次', value: fmtInt(warnCount), unit: '批', icon: <AlertTriangle size={18} />, tone: 'gold' },
          { label: '已处理批次', value: fmtInt(baseHandled), unit: '批', icon: <CheckCircle2 size={18} />, tone: 'green' },
        ]}
      />

      <div className="m03-charts-row">
        <GlassPanel
          title="各拌合站累计产量"
          headerRight={<span className="m03-header-right">单位 万m³</span>}
          bodyClassName="m03-panel-body-flush"
        >
          <div className="m03-chart-body">
            <BarChartSvg
              idPrefix="mix-vol"
              items={sections.map((s) => ({
                secId: s.sectionId,
                label: s.stationShort,
                value: +(s.mixVol * pf.mult).toFixed(1),
              }))}
              minY={0}
              maxY={+(8 * pf.mult).toFixed(1)}
              ticks={[0, 2, 4, 6, 8].map((v) => ({
                val: +(v * pf.mult).toFixed(1),
                label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1),
              }))}
              valueFormatter={(v) => v.toFixed(1)}
              activeSecId={effectiveSec}
              onBarClick={(secId) => {
                setPage(1);
                onBarToggle(secId);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="生产批次分布" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <DonutChartSvg
              segments={typeSegs}
              centerVal={fmtInt(Math.round(baseBatches * pf.mult))}
              centerUnit="批"
              centerSub="生产批次"
              onSegmentClick={(val) => {
                setMixProdType((prev) => (prev === val ? '' : val));
                setPage(1);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="生产预警处理" bodyClassName="m03-panel-body-flush">
          <div className="m03-chart-body">
            <RingGaugeSvg
              idPrefix="mix-warn"
              pct={warnHandleRate}
              subLabel="预警处理率"
              rows={[
                { label: '预警批次', value: `${fmtInt(warnCount)} 批`, valColor: '#ffffff' },
                { label: '已处理', value: `${fmtInt(baseHandled)} 批`, dotColor: '#22c55e', valColor: '#4ade80' },
                {
                  label: '待处理',
                  value: `${fmtInt(Math.max(0, warnCount - baseHandled))} 批`,
                  dotColor: '#facc15',
                  valColor: '#facc15',
                },
              ]}
            />
          </div>
        </GlassPanel>
      </div>

      <div className="m03-bottom-row">
        <GlassPanel
          title="生产批次记录"
          bodyClassName="m03-panel-body-flush"
          headerRight={
            <div className="m03-quick-pills">
              {['全部', '正常批次', '预警批次'].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`m03-qpill ${mixQuick === q ? 'active' : ''}`}
                  onClick={() => {
                    setMixQuick(q);
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
              emptyText={loading ? '正在加载拌合批次...' : '暂无匹配的生产批次记录'}
            />
          </div>
          <PaginationBar
            totalItems={mixingRecords.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </GlassPanel>

        <GlassPanel title="最新生产预警" className="m03-side-panel" bodyClassName="m03-side-body">
          <div className="m03-side-list">
            {mixingAlerts.slice(0, 3).length ? (
              mixingAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="m03-side-card"
                  onClick={() => onOpenModal({ kind: 'mixing', record: a })}
                >
                  <div className="m03-side-left">
                    <div className={`m03-side-ico ${!a.handled ? 'warn' : ''}`}>
                      {!a.handled ? <AlertTriangle size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <div className="m03-side-title">{a.alertTitle}</div>
                      <div className="m03-side-sub">
                        {a.producedAt} &nbsp;{a.id}
                      </div>
                    </div>
                  </div>
                  <StatusBadge text={a.handled ? '已处理' : '待处理'} tone={a.handled ? 'ok' : 'warn'} />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                当前拌合站无生产预警
              </div>
            )}
          </div>
          <div className="m03-side-footer">
            <span>同步于 {selectedDate} 10:45</span>
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => {
                setMixQuick('预警批次');
                setPage(1);
                showToast('已定位筛选：预警批次');
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
