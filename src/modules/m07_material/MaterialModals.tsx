'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { SvgGateCamera, SvgUavInspection, SvgYardAerial } from './MaterialSvgs';
import {
  DEFAULT_YARDS,
  fmtNum,
  getPeriodObj,
  statusTone,
  type MaterialBatchDTO,
  type MaterialInventoryDTO,
  type MaterialReportDTO,
  type MaterialYardDTO,
} from './types';

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box" style={{ maxWidth: '760px', width: '92vw' }}>
        <div className="modal-header">
          <div className="panel-title-group">
            <span className="panel-accent-bar" />
            <span className="panel-title">{title}</span>
          </div>
          <button type="button" className="panel-toggle-btn" onClick={onClose} aria-label="关闭弹窗">
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function InventoryDetailModal({
  item,
  period,
  onClose,
  onJumpYard,
  onJumpInspect,
}: {
  item: MaterialInventoryDTO;
  period: string;
  onClose: () => void;
  onJumpYard: (sectionId: string, material: string) => void;
  onJumpInspect: (sectionId: string, material: string) => void;
}) {
  const periodObj = getPeriodObj(period);
  const ratio = item.planQty > 0 ? ((item.arrivalQty / item.planQty) * 100).toFixed(1) : '0.0';

  return (
    <ModalShell title={`备料明细台账 — ${item.sectionName} · ${item.material}`} onClose={onClose}>
      <div className="m07-modal-grid">
        <div className="m07-modal-kv">
          <div className="k">所属工区 / 料场</div>
          <div className="v">
            {item.sectionName} · {item.yardName}
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">材料及规格</div>
          <div className="v">
            {item.material}（{item.spec}）
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">计划量 / 累计进场量</div>
          <div className="v">
            {fmtNum(item.planQty)} t / {fmtNum(item.arrivalQty)} t（{ratio}%）
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">实物库存 / 可用库存</div>
          <div className="v">
            {fmtNum(item.physicalQty)} t / <span style={{ color: '#2be695' }}>{fmtNum(item.usableQty)} t</span>
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">待检及隔离量</div>
          <div className="v" style={{ color: item.quarantineQty > 0 ? '#facc15' : '#93c5fd' }}>
            {fmtNum(item.quarantineQty)} t
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">当前备料缺口</div>
          <div className="v" style={{ color: '#facc15' }}>
            {fmtNum(item.gapQty)} t
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(8,28,64,0.75)',
          border: '1px solid rgba(56,189,248,0.25)',
          fontSize: '12.5px',
          color: '#cfe6ff',
          marginBottom: '14px',
        }}
      >
        <div>
          <strong>校验公式：</strong>可用库存（{fmtNum(item.usableQty)} t）= 实物库存（
          {fmtNum(item.physicalQty)} t）- 待检及隔离量（{fmtNum(item.quarantineQty)} t）
        </div>
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            <strong>统计口径：</strong>
            {period} · 统计截至 {periodObj.cutoff} · 检验状态：
          </span>
          <StatusBadge text={item.status} tone={statusTone(item.status)} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          className="m07-btn-outline"
          onClick={() => {
            onClose();
            onJumpYard(item.sectionId, item.material);
          }}
        >
          查看料场详情
        </button>
        <button
          type="button"
          className="m07-btn-primary"
          onClick={() => {
            onClose();
            onJumpInspect(item.sectionId, item.material);
          }}
        >
          查看检验与现场关联
        </button>
      </div>
    </ModalShell>
  );
}

export function ReportFilePreviewModal({
  report,
  versionLabel,
  items,
  onClose,
}: {
  report: MaterialReportDTO;
  versionLabel?: string;
  items: MaterialInventoryDTO[];
  onClose: () => void;
}) {
  const ver = versionLabel || report.version;
  const cols: ColumnDef<MaterialInventoryDTO>[] = [
    { key: 'sec', header: '工区', render: (r) => r.sectionName },
    { key: 'yard', header: '料场', render: (r) => r.yardName },
    { key: 'mat', header: '材料', render: (r) => r.material },
    { key: 'spec', header: '规格', render: (r) => r.spec },
    { key: 'plan', header: '计划量(t)', render: (r) => fmtNum(r.planQty) },
    { key: 'arr', header: '累计进场(t)', render: (r) => fmtNum(r.arrivalQty) },
    { key: 'phys', header: '实物库存(t)', render: (r) => fmtNum(r.physicalQty) },
    {
      key: 'usable',
      header: '可用库存(t)',
      render: (r) => <span className="m07-num-green">{fmtNum(r.usableQty)}</span>,
    },
    {
      key: 'gap',
      header: '缺口(t)',
      render: (r) => <span className="m07-num-gold">{fmtNum(r.gapQty)}</span>,
    },
  ];

  return (
    <ModalShell title={`上传报表数据预览 — ${report.code} (${ver})`} onClose={onClose}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          fontSize: '12.5px',
          color: '#b8d7f7',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>
          文件：<strong>{report.fileName}</strong>（{ver}）
        </span>
        <span>
          模板：{report.templateVer} · 统计截至 {report.cutoffFull}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={cols} rows={items} rowKey={(r) => r.id} emptyText="暂无报表明细行" />
      </div>

      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="m07-btn-outline" onClick={onClose}>
          关闭预览
        </button>
      </div>
    </ModalShell>
  );
}

export function UploadReportModal({
  defaultSectionId,
  yards,
  submitting,
  onClose,
  onSubmit,
}: {
  defaultSectionId: string;
  yards: MaterialYardDTO[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (sectionId: string, fileName: string) => void;
}) {
  const yardList = yards.length > 0 ? yards : DEFAULT_YARDS;
  const initSec = defaultSectionId || 'sec2';
  const initYard = yardList.find((y) => y.sectionId === initSec) ?? yardList[1] ?? yardList[0];

  const [sectionId, setSectionId] = useState(initYard.sectionId);
  const [fileName, setFileName] = useState(`${initYard.sectionName}备料报表_20261126_补报.xlsx`);

  return (
    <ModalShell title="上传备料报表（模板 V1.0）" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
        <div>
          <label style={{ display: 'block', color: '#9bc0e6', marginBottom: '5px' }}>选择填报工区</label>
          <select
            className="glass-select"
            style={{ width: '100%', height: '34px' }}
            value={sectionId}
            onChange={(e) => {
              const nextSec = e.target.value;
              setSectionId(nextSec);
              const matched = yardList.find((y) => y.sectionId === nextSec);
              if (matched) {
                setFileName(`${matched.sectionName}备料报表_20261126_新版.xlsx`);
              }
            }}
          >
            {yardList.map((y) => (
              <option key={y.sectionId} value={y.sectionId}>
                {y.sectionName}（{y.name}）
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#9bc0e6', marginBottom: '5px' }}>
            报表文件名称（固定模板 V1.0）
          </label>
          <input
            className="m07-input"
            style={{ width: '100%', paddingLeft: '10px' }}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '7px',
            background: 'rgba(14,52,108,0.55)',
            border: '1px solid rgba(56,189,248,0.3)',
            color: '#b7dcff',
          }}
        >
          上传后将自动执行 12 列必填字段校验、数量单位（t）校验与「可用库存 ≤ 实物库存」逻辑校验，状态标记为
          <strong>待确认</strong>。
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <button type="button" className="m07-btn-outline" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button
            type="button"
            className="m07-btn-primary"
            disabled={submitting || !fileName.trim()}
            onClick={() => onSubmit(sectionId, fileName.trim())}
          >
            {submitting ? '校验上传中...' : '执行校验并上传'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function LabReportModal({
  batch,
  yard,
  updating,
  onClose,
  onEnterLab,
  onUpdateStatus,
}: {
  batch: MaterialBatchDTO;
  yard: MaterialYardDTO;
  updating: boolean;
  onClose: () => void;
  onEnterLab: () => void;
  onUpdateStatus?: (batchId: string, nextStatus: '合格' | '复检中' | '不合格') => void;
}) {
  return (
    <ModalShell title={`实验室检验报告 — ${batch.reportId}`} onClose={onClose}>
      <div className="m07-modal-grid">
        <div className="m07-modal-kv">
          <div className="k">检验报告编号</div>
          <div className="v">{batch.reportId}</div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">关联进场批次</div>
          <div className="v">{batch.batchId}</div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">材料及规格 / 数量</div>
          <div className="v">
            {batch.material} · {batch.spec} / {batch.qty} t
          </div>
        </div>
        <div className="m07-modal-kv">
          <div className="k">检验实验室 / 判定</div>
          <div className="v" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{yard.labName}</span>
            <StatusBadge text={batch.status} tone={statusTone(batch.status)} />
          </div>
        </div>
      </div>

      <table className="data-table m07-table" style={{ marginBottom: '12px' }}>
        <thead>
          <tr>
            <th>检测项目</th>
            <th>标准要求</th>
            <th>实测结果</th>
            <th>单项判定</th>
          </tr>
        </thead>
        <tbody>
          {batch.items.map((it) => (
            <tr key={it.name}>
              <td>{it.name}</td>
              <td>{it.std}</td>
              <td>{it.val}</td>
              <td>
                <StatusBadge
                  text={it.pass === true ? '合格' : it.pass === false ? '不合格' : '待定/检测中'}
                  tone={it.pass === true ? 'ok' : it.pass === false ? 'danger' : 'warn'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {batch.quarantineNote ? (
        <div
          style={{
            padding: '9px 12px',
            borderRadius: '7px',
            background: 'rgba(239,68,68,0.16)',
            border: '1px solid rgba(248,113,113,0.45)',
            color: '#fecaca',
            fontSize: '12.5px',
            marginBottom: '12px',
          }}
        >
          <strong>隔离处置：</strong>
          {batch.quarantineNote}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {onUpdateStatus ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {batch.status !== '合格' ? (
              <button
                type="button"
                className="m07-btn-outline"
                disabled={updating}
                onClick={() => onUpdateStatus(batch.batchId, '合格')}
              >
                {updating ? '提交中...' : '判定合格放行'}
              </button>
            ) : null}
            {batch.status === '待检' ? (
              <button
                type="button"
                className="m07-btn-outline"
                disabled={updating}
                onClick={() => onUpdateStatus(batch.batchId, '复检中')}
              >
                转入平行复检
              </button>
            ) : null}
          </div>
        ) : (
          <span />
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="m07-btn-outline" onClick={onClose}>
            关闭
          </button>
          <button
            type="button"
            className="m07-btn-primary"
            onClick={() => {
              onClose();
              onEnterLab();
            }}
          >
            进入实验室模块
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function MediaPreviewModal({
  type,
  yard,
  batch,
  onClose,
}: {
  type: 'aerial' | 'gate' | 'uav';
  yard: MaterialYardDTO;
  batch?: MaterialBatchDTO | null;
  onClose: () => void;
}) {
  const isAerial = type === 'aerial';
  const isGate = type === 'gate';

  const title = isAerial
    ? `料场空间位置与分区示意 — ${yard.sectionName} · ${yard.name}`
    : isGate
      ? `料场出入口录像回放 — ${yard.camId}（${yard.name} · 主入口）`
      : `无人机料场巡检成果 — ${yard.uavId}（${yard.waypoint}）`;

  const infoLine = isAerial
    ? `位置：${yard.sectionName} · ${yard.stake} ｜ 主入口桩号：${yard.gateStake} ｜ 料仓结构：3 座全封闭蓝棚 + 2 处露天骨料堆区 + 拌合楼配料区`
    : isGate
      ? `点位编号：${yard.camId} ｜ 关联批次：${batch?.batchId ?? '—'} ｜ 车牌识别：${batch?.plateNo ?? '黑M·86219'} ｜ 过磅时刻：${batch?.videoTime ?? '2026-11-26 08:16:20'}`
      : `架次编号：${yard.uavId} ｜ 航点：${yard.waypoint} ｜ 影像文件：${batch?.uavFile ?? '料场全面巡检 · IMG_0018.jpg'} ｜ 回传状态：已归档`;

  return (
    <ModalShell title={title} onClose={onClose}>
      <div
        style={{
          borderRadius: '9px',
          overflow: 'hidden',
          border: '1px solid rgba(56,220,255,0.45)',
          marginBottom: '10px',
        }}
      >
        {isAerial ? (
          <SvgYardAerial yard={yard} />
        ) : isGate ? (
          <SvgGateCamera timeLabel={batch?.videoTime ?? '2026-11-26 08:16:20'} />
        ) : (
          <SvgUavInspection timeLabel={batch?.uavTime ?? '2026-11-26 09:27:18'} />
        )}
      </div>

      <div
        style={{
          padding: '9px 12px',
          borderRadius: '7px',
          background: 'rgba(12,40,88,0.68)',
          border: '1px solid rgba(56,189,248,0.26)',
          fontSize: '12.5px',
          color: '#cfe6ff',
          marginBottom: '12px',
        }}
      >
        {infoLine}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="m07-btn-outline" onClick={onClose}>
          关闭
        </button>
      </div>
    </ModalShell>
  );
}

export function EntryLedgerModal({
  yard,
  batches,
  onClose,
}: {
  yard: MaterialYardDTO;
  batches: MaterialBatchDTO[];
  onClose: () => void;
}) {
  const cols: ColumnDef<MaterialBatchDTO>[] = [
    { key: 'id', header: '进场批次', render: (b) => b.batchId },
    { key: 'mat', header: '材料规格', render: (b) => `${b.material}（${b.spec}）` },
    { key: 'qty', header: '进场量', render: (b) => `${b.qty} t` },
    { key: 'time', header: '进场时间', render: (b) => b.entryTime },
    { key: 'sup', header: '供应单位', render: (b) => b.supplier },
    { key: 'plate', header: '运料车辆', render: (b) => b.plateNo },
    {
      key: 'status',
      header: '检验状态',
      render: (b) => <StatusBadge text={b.status} tone={statusTone(b.status)} />,
    },
  ];

  return (
    <ModalShell title={`进场批次明细台账 — ${yard.sectionName} · ${yard.name}`} onClose={onClose}>
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={cols} rows={batches} rowKey={(b) => b.batchId} emptyText="暂无进场批次记录" />
      </div>
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="m07-btn-outline" onClick={onClose}>
          关闭
        </button>
      </div>
    </ModalShell>
  );
}
