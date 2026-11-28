'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, MapPin, RotateCcw, Search } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import { fmtMoney, PairedHorizontalBarSvg } from '../MeasureCharts';
import type { ActiveModalState } from '../MeasureModals';
import type { MeasureContract, PhysicalCompareApiResponse } from '../types';
import {
  DEFAULT_SECTIONS,
  MATCHED_WORK_ITEMS,
  PERIOD_OPTIONS,
} from './shared';

export interface PhysicalCompareSubPageProps {
  onOpenModal: (modal: ActiveModalState) => void;
  onJumpToRawRecord: (
    recId?: string,
    targetPeriod?: string,
    payFilter?: string
  ) => void;
  onReset: () => void;
  onContractsChange?: (contracts: MeasureContract[]) => void;
}

export function PhysicalCompareSubPage({
  onOpenModal,
  onJumpToRawRecord,
  onReset,
  onContractsChange,
}: PhysicalCompareSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const showToast = usePlatformStore((s) => s.showToast);
  const measureBridge = usePlatformStore((s) => s.measureBridge);
  const patchMeasureBridge = usePlatformStore((s) => s.patchMeasureBridge);

  const { period, physFallbackSecId, physItemFilter, physSelectedItem } =
    measureBridge;

  const physEffectiveSecId = activeSectionId || physFallbackSecId || 'sec2';

  const [physData, setPhysData] = useState<PhysicalCompareApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPhysicalCompare = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set('sectionId', physEffectiveSecId);
      if (physItemFilter) sp.set('item', physItemFilter);
      sp.set('period', period);

      const res = await fetch(`/api/v1/m08/physical-compare?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as PhysicalCompareApiResponse;
        setPhysData(json);
        if (json.contracts?.length) {
          onContractsChange?.(json.contracts);
        }
        const currentSelected =
          usePlatformStore.getState().measureBridge.physSelectedItem;
        if (
          json.items.length > 0 &&
          !json.items.some((i) => i.workItem === currentSelected)
        ) {
          patchMeasureBridge({ physSelectedItem: json.items[0].workItem });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    physEffectiveSecId,
    physItemFilter,
    period,
    onContractsChange,
    patchMeasureBridge,
  ]);

  useEffect(() => {
    void fetchPhysicalCompare();
  }, [fetchPhysicalCompare]);

  const contracts = physData?.contracts?.length
    ? physData.contracts
    : DEFAULT_SECTIONS;

  const activeContract =
    physData?.contract ??
    contracts.find((c) => c.sectionId === physEffectiveSecId) ??
    contracts[1] ??
    contracts[0];
  const items = physData?.items ?? [];
  const selected =
    items.find((it) => it.workItem === physSelectedItem) ?? items[0] ?? null;

  return (
    <>
      <div className="glass-panel m08-filter-bar">
        <div className="m08-filter-fields">
          <div className="m08-field">
            <span className="m08-field-label">所属工区</span>
            <select
              className="glass-select m08-select"
              value={activeContract.sectionId}
              onChange={(e) => {
                patchMeasureBridge({ physFallbackSecId: e.target.value });
                setActiveSectionId(e.target.value);
              }}
            >
              {contracts.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">合同段</span>
            <select
              className="glass-select m08-select"
              value={activeContract.sectionId}
              onChange={(e) => {
                patchMeasureBridge({ physFallbackSecId: e.target.value });
                setActiveSectionId(e.target.value);
              }}
            >
              {contracts.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.contractCode}
                </option>
              ))}
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">工程分项</span>
            <select
              className="glass-select m08-select"
              value={physItemFilter}
              onChange={(e) =>
                patchMeasureBridge({ physItemFilter: e.target.value })
              }
            >
              <option value="">全部匹配分项</option>
              {MATCHED_WORK_ITEMS.map((it) => (
                <option key={it} value={it}>
                  {it}
                </option>
              ))}
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">计量期次</span>
            <select
              className="glass-select m08-select"
              value={period}
              onChange={(e) => patchMeasureBridge({ period: e.target.value })}
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m08-filter-actions">
          <button
            type="button"
            className="m08-btn-query"
            onClick={() => {
              void fetchPhysicalCompare();
              showToast('已刷新实物进度与计量对照');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={onReset}
          >
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={() => onOpenModal({ type: 'originalSystem', record: null })}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <div className="glass-panel m08-scope-banner">
        <div className="m08-scope-left">
          <div className="m08-scope-ico">
            <MapPin size={16} />
          </div>
          <div>
            <div className="m08-scope-title">
              {activeContract.sectionName} · {activeContract.contractCode}
            </div>
            <div className="m08-scope-sub">
              同一工程范围 &nbsp; {items.length} 个匹配分项（
              {activeContract.stakeRange}）
            </div>
          </div>
        </div>
        <div className="m08-scope-right">
          <span>计量统计截至 {selectedDate}</span>
          <span>实物审核截至 {selectedDate}</span>
          <StatusBadge text="范围与日期已匹配" tone="ok" />
        </div>
      </div>

      <div className="m08-split-compare">
        <GlassPanel
          title="各分项工程量比例对照"
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="m08-compare-legend">
              <span>
                <i
                  className="m08-legend-dot"
                  style={{ background: '#38bdf8' }}
                />
                累计计量比例
              </span>
              <span>
                <i
                  className="m08-legend-dot"
                  style={{ background: '#4ade80' }}
                />
                实物完成率
              </span>
            </div>
          }
        >
          <div style={{ padding: '10px 14px 12px' }}>
            <PairedHorizontalBarSvg
              items={items}
              selectedItem={selected?.workItem ?? ''}
              onPickItem={(w) => patchMeasureBridge({ physSelectedItem: w })}
            />
          </div>
        </GlassPanel>

        <GlassPanel
          title={`选中分项 · ${selected ? selected.workItem : '—'}`}
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <span className="m08-pill-badge">
              {activeContract.contractCode}
            </span>
          }
        >
          {selected ? (
            <div className="m08-selected-body">
              <div className="m08-stat-duo">
                <div className="m08-stat-box">
                  <div className="m08-stat-box-label">累计计量工程量</div>
                  <div className="m08-stat-box-val">
                    {selected.measuredQty}
                    <small>{selected.unit}</small>
                  </div>
                </div>
                <div className="m08-stat-box green">
                  <div className="m08-stat-box-label">经审核实物完成量</div>
                  <div className="m08-stat-box-val">
                    {selected.physicalQty}
                    <small>{selected.unit}</small>
                  </div>
                </div>
              </div>
              <div className="m08-kv-list">
                <div className="m08-kv-row">
                  <span className="m08-kv-k">合同工程量</span>
                  <span className="m08-kv-v">
                    {selected.contractQty} {selected.unit}
                  </span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">实物完成率</span>
                  <span className="m08-kv-v">
                    {selected.physicalPct.toFixed(1)}%
                  </span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">数量差额</span>
                  <span className="m08-kv-v">
                    {selected.diffQty} {selected.unit}
                  </span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">本期计量金额</span>
                  <span className="m08-kv-v">
                    {fmtMoney(selected.periodAmount)} 万元
                  </span>
                </div>
              </div>
              <div className="m08-side-footer">
                <span
                  className="m08-num"
                  style={{ color: '#93b8de', fontWeight: 500 }}
                >
                  {selected.linkedRecordId}
                </span>
                <button
                  type="button"
                  className="m08-link-btn"
                  onClick={() =>
                    onJumpToRawRecord(selected.linkedRecordId, period)
                  }
                >
                  查看原始记录 &gt;
                </button>
              </div>
            </div>
          ) : (
            <div
              className="m08-selected-body"
              style={{ color: '#93b8de', textAlign: 'center' }}
            >
              {loading ? '正在加载分项对照...' : '暂无匹配分项'}
            </div>
          )}
        </GlassPanel>
      </div>

      <GlassPanel
        title="同范围计量与实物明细"
        bodyClassName="m08-panel-body-zero"
        headerRight={
          <div className="m08-header-meta">匹配 {items.length} 项</div>
        }
      >
        <div className="m08-table-wrap">
          <table className="data-table m08-table">
            <thead>
              <tr>
                <th>工程分项</th>
                <th>合同工程量</th>
                <th>累计计量工程量</th>
                <th>经审核实物完成量</th>
                <th>实物完成率</th>
                <th>数量差额¹</th>
                <th>本期计量金额 (万元)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.workItem}
                  className={
                    selected?.workItem === it.workItem ? 'active' : ''
                  }
                  onClick={() =>
                    patchMeasureBridge({ physSelectedItem: it.workItem })
                  }
                >
                  <td>{it.workItem}</td>
                  <td>
                    {it.contractQty} {it.unit}
                  </td>
                  <td>
                    {it.measuredQty} {it.unit}
                  </td>
                  <td>
                    {it.physicalQty} {it.unit}
                  </td>
                  <td className="m08-num" style={{ color: '#4ade80' }}>
                    {it.physicalPct.toFixed(1)}%
                  </td>
                  <td>
                    {it.diffQty} {it.unit}
                  </td>
                  <td className="m08-num">{fmtMoney(it.periodAmount)}</td>
                  <td>
                    <button
                      type="button"
                      className="m08-link-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal({
                          type: 'physicalItem',
                          contract: activeContract,
                          item: it,
                          period,
                        });
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="m08-footnotes">
          <span>¹ 数量差额为经审核实物完成量减累计计量工程量</span>
          <span>工程量比例以各分项合同工程量为基准</span>
        </div>
      </GlassPanel>
    </>
  );
}
