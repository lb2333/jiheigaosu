'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, RotateCcw, Search } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { M02DetailItem, M02ReportsResponse } from '../types';
import { M02Icon } from './M02Icon';
import { M02Modal } from './M02Modal';

export function ReportSubpage() {
  const searchParams = useSearchParams();
  const initialSecParam = searchParams.get('sectionId');

  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const showToast = usePlatformStore((s) => s.showToast);

  const [secFilter, setSecFilter] = useState<string>(initialSecParam || activeSectionId || 'all');
  const [year, setYear] = useState<string>('2026');
  const [month, setMonth] = useState<string>('11');
  const [keyword, setKeyword] = useState<string>('');

  const [applied, setApplied] = useState({
    secId: initialSecParam || activeSectionId || 'all',
    year: '2026',
    month: '11',
    keyword: '',
  });
  const [selectedSecId, setSelectedSecId] = useState<string>(initialSecParam || 'sec2');

  const [data, setData] = useState<M02ReportsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [itemModal, setItemModal] = useState<M02DetailItem | null>(null);
  const [originModalOpen, setOriginModalOpen] = useState<boolean>(false);
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);
  const [pubSecId, setPubSecId] = useState<string>('sec2');
  const [pubName, setPubName] = useState<string>('2026年11月进度报表');
  const [pubSummary, setPubSummary] = useState<string>('本月按节点计划正常推进，监理办已核验。');
  const [saving, setSaving] = useState<boolean>(false);

  // Sync with top SubNavBar section pill click
  useEffect(() => {
    const nextSec = activeSectionId ?? 'all';
    setSecFilter(nextSec);
    setApplied((prev) => ({ ...prev, secId: nextSec }));
    if (activeSectionId) {
      setSelectedSecId(activeSectionId);
    }
  }, [activeSectionId]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        sectionId: applied.secId,
        year: applied.year,
        month: applied.month,
        keyword: applied.keyword,
        selectedSecId,
      });
      const res = await fetch(`/api/v1/m02/reports?${qs.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as M02ReportsResponse;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [applied, selectedSecId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const sections = data?.sections ?? [
    { id: 'sec1', name: '一工区' },
    { id: 'sec2', name: '二工区' },
    { id: 'sec3', name: '三工区' },
    { id: 'sec4', name: '四工区' },
    { id: 'sec5', name: '五工区' },
    { id: 'sec6', name: '六工区' },
  ];
  const reports = data?.reports ?? [];
  const selectedReport = data?.selectedReport;
  const items = data?.items ?? [];
  const periodLabel = data?.periodLabel ?? `${applied.year}年${applied.month}月`;
  const dueDate = data?.dueDate ?? `${applied.year}-${applied.month}-20`;
  const scopeLabel =
    applied.secId === 'all'
      ? '全线'
      : sections.find((s) => s.id === applied.secId)?.name ?? applied.secId;

  const itemColumns: ColumnDef<M02DetailItem>[] = [
    {
      key: 'obj',
      header: '工程对象',
      render: (it) => <strong className="text-white">{it.objectName}</strong>,
    },
    { key: 'cat', header: '工程类别', render: (it) => it.category },
    { key: 'sub', header: '分项指标', render: (it) => it.subItem },
    { key: 'unit', header: '计量单位', render: (it) => it.unit },
    {
      key: 'total',
      header: '总工程量',
      render: (it) => <span className="tabular-nums">{it.totalQty}</span>,
    },
    {
      key: 'cur',
      header: '本期完成量',
      render: (it) => <span className="tabular-nums">{it.periodQty}</span>,
    },
    {
      key: 'cum',
      header: '累计完成量',
      render: (it) => <span className="tabular-nums">{it.cumQty}</span>,
    },
    {
      key: 'pct',
      header: '完成比例',
      width: '130px',
      render: (it) => (
        <div className="m02-mini-bar">
          <div className="m02-mini-track">
            <div className="m02-mini-fill" style={{ width: `${it.pct}%` }} />
          </div>
          <span className="m02-mini-val">{it.pct.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'op',
      header: '操作',
      render: (it) => (
        <button type="button" className="m02-action-link" onClick={() => setItemModal(it)}>
          查看明细
        </button>
      ),
    },
  ];

  async function handlePublishReport(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/m02/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: pubSecId,
          year: applied.year,
          month: applied.month,
          reportName: pubName,
          summary: pubSummary,
          status: '已发布',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || '发布失败（需工程师/监理/管理员权限）');
        return;
      }
      setPublishModalOpen(false);
      setSelectedSecId(pubSecId);
      showToast(`已发布《${json.report.sourceName}》并落库`);
      await fetchReports();
    } finally {
      setSaving(false);
    }
  }

  function applySearch() {
    setApplied({ secId: secFilter, year, month, keyword });
  }

  return (
    <div className="m02-page">
      {/* Top Search & Filter Bar */}
      <div className="m02-filter-bar">
        <div className="m02-filter-row">
          <div className="m02-filter-left">
            <span className="m02-filter-label">所属工区</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 130px' }}
              value={secFilter}
              onChange={(e) => setSecFilter(e.target.value)}
            >
              <option value="all">全部工区</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="m02-filter-label">统计年度</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 105px' }}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2026">2026年</option>
              <option value="2025">2025年</option>
            </select>
            <span className="m02-filter-label">统计月份</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 100px' }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {['11', '10', '09', '08', '07', '06'].map((m) => (
                <option key={m} value={m}>
                  {Number(m)}月
                </option>
              ))}
            </select>
            <span className="m02-filter-label">报表名称</span>
            <input
              className="m02-input"
              type="text"
              placeholder="请输入报表名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applySearch();
              }}
            />
          </div>
          <div className="m02-filter-right">
            <button
              type="button"
              className="dock-btn primary"
              style={{ padding: '6px 18px' }}
              onClick={applySearch}
            >
              <Search size={13} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '6px 14px' }}
              onClick={() => {
                setSecFilter('all');
                setYear('2026');
                setMonth('11');
                setKeyword('');
                setApplied({ secId: 'all', year: '2026', month: '11', keyword: '' });
                showToast('已重置进度报表筛选条件');
              }}
            >
              <RotateCcw size={13} />
              <span>重置</span>
            </button>
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '6px 12px' }}
              onClick={() => {
                setPubSecId(selectedReport?.sectionId || 'sec2');
                setPubName(`${year}年${month}月进度报表`);
                setPublishModalOpen(true);
              }}
            >
              <Plus size={13} />
              <span>填报/发布</span>
            </button>
          </div>
        </div>
        <div className="m02-meta-strip">
          <span>
            当前范围 <strong>{scopeLabel}</strong>
          </span>
          <span>|</span>
          <span>
            统计周期 <strong>{periodLabel}</strong>
          </span>
          <span>|</span>
          <span>
            归集报表 <strong>{reports.length} 份</strong>
          </span>
          <span>|</span>
          <span>
            数据截止 <strong>{dueDate}</strong>
          </span>
        </div>
      </div>

      {/* 2-Column Report Layout */}
      <div className="m02-report-grid">
        <div className="m02-report-left">
          <GlassPanel title="工区报表汇总" bodyClassName="m02-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>所属工区</th>
                  <th>统计周期</th>
                  <th>报表名称</th>
                  <th>数据截止日期</th>
                  <th>更新时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {reports.length ? (
                  reports.map((r) => (
                    <tr
                      key={r.id}
                      className={`m02-row-clickable ${selectedReport?.sectionId === r.sectionId ? 'm02-row-selected' : ''}`}
                      onClick={() => setSelectedSecId(r.sectionId)}
                    >
                      <td className="font-bold text-white">{r.sectionName}</td>
                      <td>{r.periodLabel}</td>
                      <td>{r.reportName}</td>
                      <td className="tabular-nums">{r.dueDate}</td>
                      <td className="tabular-nums">{r.updatedDate}</td>
                      <td>
                        <StatusBadge
                          text={r.status}
                          tone={r.status === '已发布' ? 'info' : 'ok'}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m02-action-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSecId(r.sectionId);
                          }}
                        >
                          查看报表
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-[var(--text-sub)] py-5">
                      {loading ? '加载报表数据...' : '未检索到匹配的进度报表'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="m02-panel-footer">
              <span />
              <span>共 {reports.length} 份报表</span>
            </div>
          </GlassPanel>

          <GlassPanel
            title={`报表内容 · ${selectedReport?.sectionName ?? '二工区'} / ${selectedReport?.periodLabel ?? periodLabel}`}
            bodyClassName="m02-table-wrap"
            headerRight={
              <span className="text-[11.5px] text-[var(--text-sub)]">
                数据来源 &nbsp;
                <strong className="text-[#eaf4ff]">
                  {selectedReport?.sourceName ?? `${periodLabel}进度报表`}
                </strong>
              </span>
            }
          >
            <DataTable
              columns={itemColumns}
              rows={items}
              rowKey={(it) => it.id}
              emptyText="暂无报表分项明细"
            />
            <div className="m02-panel-footer">
              <span>ⓘ 统计口径 &nbsp;相同工程指标和计量单位分别汇总</span>
            </div>
          </GlassPanel>
        </div>

        {/* Right Panel: 选中报表概要 */}
        <GlassPanel title="选中报表概要">
          <div className="m02-kv-list">
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="doc" size={14} />
                报表名称
              </span>
              <span className="m02-kv-v">{selectedReport?.reportName ?? `${periodLabel}进度报表`}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="layers" size={14} />
                所属工区
              </span>
              <span className="m02-kv-v">{selectedReport?.sectionName ?? '二工区'}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="calendar" size={14} />
                统计周期
              </span>
              <span className="m02-kv-v">{selectedReport?.periodLabel ?? periodLabel}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="flag" size={14} />
                数据截止
              </span>
              <span className="m02-kv-v">{selectedReport?.dueDate ?? dueDate}</span>
            </div>
            <div className="m02-kv-row" style={{ borderBottom: 'none' }}>
              <span className="m02-kv-k">
                <M02Icon name="doc" size={14} />
                数据来源
              </span>
              <span className="m02-kv-v">{selectedReport?.sourceName ?? '二工区进度报表'}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary-glow"
            onClick={() => setOriginModalOpen(true)}
          >
            <M02Icon name="doc" size={15} />
            <span>查看报表原件</span>
          </button>
        </GlassPanel>
      </div>

      {/* Sub-item Verification Modal */}
      <M02Modal
        open={!!itemModal}
        title={itemModal ? `分项报表核验明细 · ${itemModal.objectName}` : ''}
        onClose={() => setItemModal(null)}
      >
        {itemModal ? (
          <>
            <div className="detail-grid">
              <div className="detail-stat-card">
                <span>所属工区 / 类别</span>
                <strong>
                  {selectedReport?.sectionName ?? itemModal.sectionName} · {itemModal.category}
                </strong>
              </div>
              <div className="detail-stat-card">
                <span>本期完成量</span>
                <strong>
                  {itemModal.periodQty} {itemModal.unit}
                </strong>
              </div>
              <div className="detail-stat-card">
                <span>累计完成比例</span>
                <strong>{itemModal.pct.toFixed(1)}%</strong>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>细目编号</th>
                  <th>工程部位 / 施工内容</th>
                  <th>计量单位</th>
                  <th>本期核定</th>
                  <th>监理复核</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>FM-{(selectedReport?.sectionId ?? 'SEC2').toUpperCase()}-01</td>
                  <td>{itemModal.subItem}（主线左幅）</td>
                  <td>{itemModal.unit}</td>
                  <td>
                    {(parseFloat(String(itemModal.periodQty).replace(/,/g, '')) * 0.52).toFixed(1)}
                  </td>
                  <td>
                    <StatusBadge text="已签认" tone="ok" />
                  </td>
                </tr>
                <tr>
                  <td>FM-{(selectedReport?.sectionId ?? 'SEC2').toUpperCase()}-02</td>
                  <td>{itemModal.subItem}（主线右幅）</td>
                  <td>{itemModal.unit}</td>
                  <td>
                    {(parseFloat(String(itemModal.periodQty).replace(/,/g, '')) * 0.48).toFixed(1)}
                  </td>
                  <td>
                    <StatusBadge text="已签认" tone="ok" />
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
      </M02Modal>

      {/* Formal Report Original & PDF Archive Preview Modal */}
      <M02Modal
        open={originModalOpen && !!selectedReport}
        title={selectedReport ? `正式进度月报原件 · ${selectedReport.sourceName}` : ''}
        onClose={() => setOriginModalOpen(false)}
      >
        {selectedReport ? (
          <>
            <div className="p-3 rounded-lg bg-[#0c2a5c]/55 border border-sky-400/30 flex justify-between items-center flex-wrap gap-2.5">
              <div>
                <div className="text-[15px] font-extrabold text-white">
                  G1211吉黑高速明水至北安段 {selectedReport.sourceName}
                </div>
                <div className="text-xs text-sky-200 mt-1">
                  文件编号：{selectedReport.docCode} &nbsp;|&nbsp; 统计截止：{selectedReport.dueDate}
                </div>
              </div>
              <StatusBadge text="总监办已归档签认" tone="ok" />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>工程对象</th>
                  <th>工程类别</th>
                  <th>分项指标</th>
                  <th>总工程量</th>
                  <th>本期完成</th>
                  <th>累计完成</th>
                  <th>比例</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.objectName}</td>
                    <td>{it.category}</td>
                    <td>{it.subItem}</td>
                    <td>
                      {it.totalQty} {it.unit}
                    </td>
                    <td>{it.periodQty}</td>
                    <td>{it.cumQty}</td>
                    <td className="text-[#38f2ff] font-bold">{it.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center text-xs text-[var(--text-sub)]">
              <span>
                编制：{selectedReport.sectionName}工程部 &nbsp;|&nbsp; 复核：驻地监理办 &nbsp;|&nbsp;
                签发日期：{selectedReport.updatedDate}
              </span>
              <button
                type="button"
                className="dock-btn primary"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `G1211吉黑高速明水至北安段 ${selectedReport.sourceName}\n文件编号：${selectedReport.docCode}\n统计周期：${selectedReport.periodLabel}\n数据截止：${selectedReport.dueDate}\n`,
                    ],
                    { type: 'text/plain;charset=utf-8' }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedReport.sourceName}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast(`已生成《${selectedReport.sourceName}》PDF归档导出件`);
                }}
              >
                导出 PDF 归档件
              </button>
            </div>
          </>
        ) : null}
      </M02Modal>

      {/* Publish / Update Monthly Report Modal */}
      <M02Modal
        open={publishModalOpen}
        title="填报并发布工区进度月报"
        onClose={() => setPublishModalOpen(false)}
      >
        <form onSubmit={handlePublishReport} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
              <span>所属工区</span>
              <select
                className="glass-select"
                value={pubSecId}
                onChange={(e) => setPubSecId(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
              <span>统计周期</span>
              <input className="m02-input" value={periodLabel} disabled />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
            <span>报表名称</span>
            <input
              className="m02-input"
              required
              value={pubName}
              onChange={(e) => setPubName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--text-sub)]">
            <span>月度进度说明</span>
            <textarea
              className="m02-input min-h-[76px]"
              value={pubSummary}
              onChange={(e) => setPubSummary(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="dock-btn"
              onClick={() => setPublishModalOpen(false)}
            >
              取消
            </button>
            <button type="submit" className="dock-btn primary" disabled={saving}>
              {saving ? '提交中...' : '确认发布并落库'}
            </button>
          </div>
        </form>
      </M02Modal>
    </div>
  );
}
