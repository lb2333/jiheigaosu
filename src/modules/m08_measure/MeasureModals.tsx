'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { DonutSvg } from '@/components/ui/SparklineDonut';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { fmtMoney } from './MeasureCharts';
import type {
  MeasureContract,
  MeasureRecord,
  PhysicalCompareItem,
} from './types';

export function statusToBadgeTone(st: string): BadgeTone {
  if (st === '已确认' || st === '已支付' || st === '已回传') return 'ok';
  if (st === '审核中' || st === '办理中') return 'info';
  if (st === '待审核' || st === '待支付') return 'warn';
  return 'muted';
}

export type ActiveModalState =
  | { type: 'originalSystem'; record: MeasureRecord | null }
  | { type: 'recordDetail'; record: MeasureRecord }
  | { type: 'attachment'; record: MeasureRecord; fileType: 'pdf' | 'xlsx' }
  | {
      type: 'physicalItem';
      contract: MeasureContract;
      item: PhysicalCompareItem;
      period: string;
    }
  | { type: 'newRecord' }
  | null;

function ModalFrame({
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
      <div className="modal-box">
        <div className="modal-header">
          <div className="panel-title-group">
            <span className="panel-accent-bar" />
            <span className="panel-title">{title}</span>
          </div>
          <button
            type="button"
            className="panel-toggle-btn"
            aria-label="关闭弹窗"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

const WORK_ITEM_OPTIONS = [
  '路基土方',
  '桥梁桩基',
  '桥梁预制梁',
  '水稳基层',
  '沥青中面层',
  '路基防护',
];

export function MeasureModalHost({
  modal,
  contracts,
  currentPeriod,
  onClose,
  onJumpToRawRecord,
  onOpenAttachment,
  onCreateRecord,
}: {
  modal: ActiveModalState;
  contracts: MeasureContract[];
  currentPeriod: string;
  onClose: () => void;
  onJumpToRawRecord: (recId: string, period?: string) => void;
  onOpenAttachment: (rec: MeasureRecord, fileType: 'pdf' | 'xlsx') => void;
  onCreateRecord: (payload: {
    sectionId: string;
    workItem: string;
    period: string;
    amount: number;
    status: '已确认' | '审核中' | '待审核';
    payStatus: '已支付' | '办理中' | '待支付' | '未回传';
    qtyDesc: string;
  }) => Promise<boolean>;
}) {
  const [newSecId, setNewSecId] = useState('sec2');
  const [newItem, setNewItem] = useState('路基土方');
  const [newAmount, setNewAmount] = useState('186.50');
  const [newQtyDesc, setNewQtyDesc] = useState('路基填筑及压实 4.2 万m³');
  const [newStatus, setNewStatus] = useState<'已确认' | '审核中' | '待审核'>('待审核');
  const [submitting, setSubmitting] = useState(false);

  if (!modal) return null;

  if (modal.type === 'originalSystem') {
    const rec = modal.record;
    const returnedCount = contracts.filter((c) => c.payReturned).length;
    const returnPct = contracts.length
      ? Math.round((returnedCount / contracts.length) * 100)
      : 83;

    return (
      <ModalFrame
        title={`计量支付原系统协同门户${rec ? ` · ${rec.id}` : ''}`}
        onClose={onClose}
      >
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>原系统名称</span>
            <strong style={{ fontSize: 15 }}>公路工程计量支付系统 V4.2</strong>
          </div>
          <div className="detail-stat-card">
            <span>数据同步状态</span>
            <strong style={{ color: '#4ade80' }}>在线已同步</strong>
          </div>
          <div className="detail-stat-card">
            <span>回传通道就绪率</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DonutSvg pct={returnPct} size={46} stroke={5} color="#4ade80" />
              <strong style={{ fontSize: 14 }}>
                {returnedCount} / {contracts.length || 6} 工区
              </strong>
            </div>
          </div>
        </div>

        <table className="data-table">
          <tbody>
            {rec ? (
              <>
                <tr>
                  <th>定位单据</th>
                  <td>{rec.id}</td>
                  <th>所属工区 / 合同段</th>
                  <td>
                    {rec.sectionName} · {rec.contractCode}
                  </td>
                </tr>
                <tr>
                  <th>工程分项</th>
                  <td>{rec.workItem}</td>
                  <th>记录金额</th>
                  <td>
                    {fmtMoney(rec.amount)} 万元（{rec.status}）
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <th>对接接口</th>
                <td>G1211 计量支付原系统 REST/HTTPS 网关</td>
                <th>回传工区</th>
                <td>
                  {returnedCount} / {contracts.length || 6} 工区已回传
                </td>
              </tr>
            )}
            <tr>
              <th>签认审批链</th>
              <td>施工自检上报 → 驻地监理复核 → 总监办审核 → 指挥部核准支付</td>
              <th>校验模式</th>
              <td>电子签章 + 工程量清单台账核验</td>
            </tr>
          </tbody>
        </table>

        <div className="m08-modal-panel">
          <div className="m08-modal-heading">各合同段支付接口回传通道状态</div>
          <DataTable
            rows={contracts}
            rowKey={(c) => c.sectionId}
            columns={[
              {
                key: 'sec',
                header: '工区 / 合同段',
                render: (c) => `${c.sectionName} · ${c.contractCode}`,
              },
              {
                key: 'period',
                header: '计量期次',
                render: () => currentPeriod,
              },
              {
                key: 'paid',
                header: '本期已回传支付 (万元)',
                render: (c) => (
                  <span className="m08-num">
                    {c.payReturned ? fmtMoney(c.paidReturnAmount) : '—'}
                  </span>
                ),
              },
              {
                key: 'state',
                header: '回传状态',
                render: (c) => (
                  <StatusBadge
                    text={c.payReturned ? '已回传' : '未回传'}
                    tone={c.payReturned ? 'ok' : 'warn'}
                  />
                ),
              },
            ]}
          />
        </div>
      </ModalFrame>
    );
  }

  if (modal.type === 'recordDetail') {
    const rec = modal.record;
    return (
      <ModalFrame title={`计量原始记录详情 · ${rec.id}`} onClose={onClose}>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>所属工区 / 合同段</span>
            <strong>
              {rec.sectionName} · {rec.contractCode}
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>记录金额</span>
            <strong>{fmtMoney(rec.amount)} 万元</strong>
          </div>
          <div className="detail-stat-card">
            <span>计量 / 支付状态</span>
            <strong
              style={{
                color: rec.status === '已确认' ? '#4ade80' : '#facc15',
              }}
            >
              {rec.status} · {rec.payStatus}
            </strong>
          </div>
        </div>

        <table className="data-table">
          <tbody>
            <tr>
              <th style={{ width: 120 }}>原始记录编号</th>
              <td>{rec.id}</td>
              <th style={{ width: 120 }}>计量期次</th>
              <td>{rec.period}</td>
            </tr>
            <tr>
              <th>工程分项</th>
              <td>{rec.workItem}</td>
              <th>对应桩号范围</th>
              <td>{rec.stakeRange}</td>
            </tr>
            <tr>
              <th>申报工程量</th>
              <td>{rec.qtyDesc}</td>
              <th>审核单位</th>
              <td>{rec.reviewer}</td>
            </tr>
            <tr>
              <th>已回传支付金额</th>
              <td>
                {rec.paidAmount > 0 ? `${fmtMoney(rec.paidAmount)} 万元` : '—'}
              </td>
              <th>回传时间</th>
              <td>{rec.payTime}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary-glow"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              onJumpToRawRecord(rec.id, rec.period);
            }}
          >
            在「原始记录」台账中定位查阅
          </button>
          <button
            type="button"
            className="dock-btn"
            onClick={() => onOpenAttachment(rec, 'pdf')}
          >
            查看计量确认单 (PDF)
          </button>
        </div>
      </ModalFrame>
    );
  }

  if (modal.type === 'attachment') {
    const { record: rec, fileType } = modal;
    if (fileType === 'pdf') {
      const fileName = `${rec.contractCode}计量确认单.pdf`;
      return (
        <ModalFrame title={`PDF 附件预览 · ${fileName}`} onClose={onClose}>
          <div className="m08-modal-panel">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(56,189,248,0.2)',
                paddingBottom: 8,
              }}
            >
              <strong style={{ color: '#ffffff', fontSize: 14 }}>
                G1211吉黑高速明水至北安段 中间计量支付确认单
              </strong>
              <StatusBadge text={rec.status} tone={statusToBadgeTone(rec.status)} />
            </div>
            <table className="data-table">
              <tbody>
                <tr>
                  <th style={{ width: 120 }}>单据编号</th>
                  <td>{rec.id}</td>
                  <th style={{ width: 120 }}>计量期次</th>
                  <td>{rec.period}</td>
                </tr>
                <tr>
                  <th>合同段</th>
                  <td>
                    {rec.sectionName} · {rec.contractCode}
                  </td>
                  <th>分项工程</th>
                  <td>
                    {rec.workItem}（{rec.stakeRange}）
                  </td>
                </tr>
                <tr>
                  <th>核定计量金额</th>
                  <td className="m08-num" style={{ color: '#38f2ff' }}>
                    {fmtMoney(rec.amount)} 万元
                  </td>
                  <th>监理核签人</th>
                  <td>{rec.reviewer}</td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                background: 'rgba(6,22,52,0.75)',
                fontSize: 12,
                color: '#cfe4ff',
                lineHeight: 1.7,
              }}
            >
              <div>
                核定意见：经现场收方测量及质量检验合格证核对，本周期申报{' '}
                {rec.qtyDesc} 符合设计图纸与施工规范要求，予以计量确认。
              </div>
              <div style={{ marginTop: 6, color: '#7dd3fc' }}>
                电子签章存证：CA-JHGS-{rec.id.slice(-3)} · 同步时间{' '}
                {rec.syncTime}
              </div>
            </div>
          </div>
        </ModalFrame>
      );
    }

    const xlsName = `${rec.workItem}计量计算表.xlsx`;
    const partA = Number((rec.amount * 0.56).toFixed(2));
    const partB = Number((rec.amount * 0.29).toFixed(2));
    const partC = Number((rec.amount - partA - partB).toFixed(2));
    const calcRows = [
      {
        code: '204-1-a',
        name: `${rec.workItem}主线施工段`,
        stake: rec.stakeRange,
        qty: '主体 56%',
        amt: fmtMoney(partA),
      },
      {
        code: '204-1-b',
        name: `${rec.workItem}衔接过渡段`,
        stake: `${rec.stakeRange.split('~')[0].trim()} 扩段`,
        qty: '附属 29%',
        amt: fmtMoney(partB),
      },
      {
        code: '204-1-c',
        name: '质检合格调差与零星工程',
        stake: '全段汇总',
        qty: '调差 15%',
        amt: fmtMoney(partC),
      },
    ];

    return (
      <ModalFrame title={`XLSX 附件预览 · ${xlsName}`} onClose={onClose}>
        <div className="m08-modal-panel">
          <div className="m08-modal-heading">
            工程量清单计量计算明细表（{rec.id} · {rec.contractCode}）
          </div>
          <DataTable
            rows={calcRows}
            rowKey={(r) => r.code}
            columns={[
              { key: 'code', header: '清单子目号', render: (r) => r.code },
              { key: 'name', header: '细目名称', render: (r) => r.name },
              { key: 'stake', header: '计量桩号', render: (r) => r.stake },
              { key: 'qty', header: '本期核定数量', render: (r) => r.qty },
              {
                key: 'amt',
                header: '核定金额 (万元)',
                render: (r) => <span className="m08-num">{r.amt}</span>,
              },
            ]}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 6,
              fontSize: 13,
              fontWeight: 700,
              color: '#38f2ff',
            }}
          >
            <span>本期计量合计：{fmtMoney(rec.amount)} 万元</span>
          </div>
        </div>
      </ModalFrame>
    );
  }

  if (modal.type === 'physicalItem') {
    const { contract, item, period } = modal;
    return (
      <ModalFrame
        title={`实物进度与计量对照详情 · ${item.workItem}`}
        onClose={onClose}
      >
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>合同范围</span>
            <strong>
              {contract.sectionName} · {contract.contractCode}
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>累计计量比例</span>
            <strong>{item.measuredPct.toFixed(1)}%</strong>
          </div>
          <div className="detail-stat-card">
            <span>实物完成率</span>
            <strong style={{ color: '#4ade80' }}>
              {item.physicalPct.toFixed(1)}%
            </strong>
          </div>
        </div>

        <table className="data-table">
          <tbody>
            <tr>
              <th style={{ width: 140 }}>工程分项</th>
              <td>{item.workItem}</td>
              <th style={{ width: 140 }}>计量期次</th>
              <td>{period}</td>
            </tr>
            <tr>
              <th>合同工程量</th>
              <td>
                {item.contractQty} {item.unit}
              </td>
              <th>累计计量工程量</th>
              <td>
                {item.measuredQty} {item.unit}
              </td>
            </tr>
            <tr>
              <th>经审核实物完成量</th>
              <td>
                {item.physicalQty} {item.unit}
              </td>
              <th>数量差额（实物-计量）</th>
              <td>
                {item.diffQty} {item.unit}
              </td>
            </tr>
            <tr>
              <th>本期计量金额</th>
              <td className="m08-num">{fmtMoney(item.periodAmount)} 万元</td>
              <th>关联原始记录</th>
              <td>{item.linkedRecordId}</td>
            </tr>
          </tbody>
        </table>

        <button
          type="button"
          className="btn-primary-glow"
          onClick={() => {
            onClose();
            onJumpToRawRecord(item.linkedRecordId, period);
          }}
        >
          跳转查阅关联原始记录（{item.linkedRecordId}）
        </button>
      </ModalFrame>
    );
  }

  // newRecord modal
  async function handleSubmitNew(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(newAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      const ok = await onCreateRecord({
        sectionId: newSecId,
        workItem: newItem,
        period: currentPeriod,
        amount: parsedAmount,
        status: newStatus,
        payStatus: '未回传',
        qtyDesc: newQtyDesc.trim() || `${newItem}工程量申报`,
      });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalFrame title="新增计量原始申报记录" onClose={onClose}>
      <form
        onSubmit={handleSubmitNew}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="m08-field-label">所属工区 / 合同段</span>
            <select
              className="glass-select"
              value={newSecId}
              onChange={(e) => setNewSecId(e.target.value)}
            >
              {contracts.map((c) => (
                <option key={c.sectionId} value={c.sectionId}>
                  {c.sectionName} · {c.contractCode}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="m08-field-label">工程分项</span>
            <select
              className="glass-select"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            >
              {WORK_ITEM_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="m08-field-label">申报金额（万元）</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              className="m08-input"
              style={{ width: '100%', paddingLeft: 10 }}
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="m08-field-label">初始计量状态</span>
            <select
              className="glass-select"
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as '已确认' | '审核中' | '待审核')
              }
            >
              <option value="待审核">待审核</option>
              <option value="审核中">审核中</option>
              <option value="已确认">已确认</option>
            </select>
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span className="m08-field-label">申报工程量说明</span>
          <input
            type="text"
            required
            className="m08-input"
            style={{ width: '100%', paddingLeft: 10 }}
            value={newQtyDesc}
            onChange={(e) => setNewQtyDesc(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="dock-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="submit"
            className="m08-btn-query"
            disabled={submitting}
          >
            {submitting ? '提交入库中...' : '保存至 PostgreSQL 台账'}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
