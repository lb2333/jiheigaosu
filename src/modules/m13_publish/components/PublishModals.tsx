'use client';

import { useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  Plus,
  Send,
  ShieldCheck,
  Undo2,
  X,
} from 'lucide-react';
import {
  BOARD_SPECS,
  SECTIONS,
  TEMPLATE_CATEGORIES,
  secName,
  type PublishBoardDTO,
  type PublishOrderDTO,
  type PublishPlanDTO,
  type PublishReceiptDTO,
  type PublishTemplateDTO,
} from '../types';
import { LedBoardPreview } from './LedBoardPreview';

export function ModalShell({
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
            onClick={onClose}
            aria-label="关闭弹窗"
          >
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function AddTemplateModal({
  submitting,
  onSubmit,
  onClose,
}: {
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    category: '常用文本' | '板面模板' | '预案内容';
    spec: '单黄LED 128×48' | '全彩LED 192×64';
    status: '有效' | '待启用';
    line1: string;
    line2: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<'常用文本' | '板面模板' | '预案内容'>('常用文本');
  const [spec, setSpec] =
    useState<'单黄LED 128×48' | '全彩LED 192×64'>('单黄LED 128×48');
  const [status, setStatus] = useState<'有效' | '待启用'>('有效');
  const [line1, setLine1] = useState('前方夜间施工');
  const [line2, setLine2] = useState('注意减速慢行');

  return (
    <ModalShell title="新增情报板内容模板" onClose={onClose}>
      <div className="m13-modal-grid">
        <div className="m13-field">
          <label>模板名称</label>
          <input
            type="text"
            className="m13-input"
            placeholder="例如：夜间施工警示提示"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>模板分类</label>
          <select
            className="m13-select"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as '常用文本' | '板面模板' | '预案内容'
              )
            }
          >
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="m13-field">
          <label>适配规格</label>
          <select
            className="m13-select"
            value={spec}
            onChange={(e) =>
              setSpec(e.target.value as '单黄LED 128×48' | '全彩LED 192×64')
            }
          >
            {BOARD_SPECS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="m13-field">
          <label>模板状态</label>
          <select
            className="m13-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as '有效' | '待启用')}
          >
            <option value="有效">有效</option>
            <option value="待启用">待启用</option>
          </select>
        </div>
        <div className="m13-field">
          <label>第一行文案（上限 8 字）</label>
          <input
            type="text"
            className="m13-input"
            maxLength={10}
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>第二行文案（上限 8 字）</label>
          <input
            type="text"
            className="m13-input"
            maxLength={10}
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
          />
        </div>
      </div>

      <LedBoardPreview line1={line1} line2={line2} spec={spec} />

      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-ghost" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m13-btn-primary"
          disabled={submitting}
          onClick={() =>
            void onSubmit({
              name: name.trim() || '自定义安全提示模板',
              category,
              spec,
              status,
              line1: line1.trim() || '前方施工区域',
              line2: line2.trim() || '减速谨慎驾驶',
            })
          }
        >
          <Plus size={14} />
          {submitting ? '提交中...' : '确认新增模板'}
        </button>
      </div>
    </ModalShell>
  );
}

export function CreateOrderModal({
  templates,
  boards,
  initialTemplateId,
  submitting,
  showToast,
  onSubmit,
  onClose,
}: {
  templates: PublishTemplateDTO[];
  boards: PublishBoardDTO[];
  initialTemplateId?: string;
  submitting: boolean;
  showToast: (msg: string) => void;
  onSubmit: (payload: {
    templateId: string;
    sectionId: string;
    title: string;
    validRange: string;
    line1: string;
    line2: string;
    boardIds: string[];
  }) => Promise<void>;
  onClose: () => void;
}) {
  const initialTpl =
    templates.find((t) => t.id === initialTemplateId) ?? templates[0];
  const [tplId, setTplId] = useState(initialTpl?.id ?? 'MB-202611-003');
  const [sectionId, setSectionId] = useState('sec1');
  const [title, setTitle] = useState(initialTpl?.name ?? '施工导改提示');
  const [validRange, setValidRange] = useState('11-26 14:00–20:00');
  const [line1, setLine1] = useState(initialTpl?.line1 ?? '前方施工导改');
  const [line2, setLine2] = useState(initialTpl?.line2 ?? '请按标志通行');
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>(() =>
    boards.slice(0, 3).map((b) => b.id)
  );

  const chosenTpl = templates.find((t) => t.id === tplId) ?? initialTpl;

  function handleTplChange(nextId: string) {
    setTplId(nextId);
    const nextTpl = templates.find((t) => t.id === nextId);
    if (nextTpl) {
      setTitle(nextTpl.name);
      setLine1(nextTpl.line1);
      setLine2(nextTpl.line2);
    }
  }

  function toggleBoard(bid: string) {
    setSelectedBoardIds((prev) =>
      prev.includes(bid) ? prev.filter((x) => x !== bid) : [...prev, bid]
    );
  }

  return (
    <ModalShell title="新建信息发布单" onClose={onClose}>
      <div className="m13-modal-grid">
        <div className="m13-field">
          <label>引用内容模板</label>
          <select
            className="m13-select"
            value={tplId}
            onChange={(e) => handleTplChange(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} · {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="m13-field">
          <label>所属工区</label>
          <select
            className="m13-select"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="m13-field">
          <label>发布内容标题</label>
          <input
            type="text"
            className="m13-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>发布有效期</label>
          <input
            type="text"
            className="m13-input"
            value={validRange}
            onChange={(e) => setValidRange(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>第一行板面文案</label>
          <input
            type="text"
            className="m13-input"
            maxLength={10}
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>第二行板面文案</label>
          <input
            type="text"
            className="m13-input"
            maxLength={10}
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
          />
        </div>
      </div>

      <LedBoardPreview
        line1={line1}
        line2={line2}
        spec={chosenTpl?.spec ?? '单黄LED 128×48'}
      />

      <div className="m13-field" style={{ marginTop: '10px' }}>
        <label>选择目标情报板（至少选择 1 块）</label>
        <div className="m13-modal-checks">
          {boards.slice(0, 12).map((b) => (
            <label key={b.id} className="m13-modal-chk">
              <input
                type="checkbox"
                checked={selectedBoardIds.includes(b.id)}
                onChange={() => toggleBoard(b.id)}
              />
              <span>
                {b.id}（{secName(b.sectionId)} · {b.pointName}）
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-ghost" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m13-btn-primary"
          disabled={submitting}
          onClick={() => {
            if (selectedBoardIds.length === 0) {
              showToast('请至少选择 1 块目标情报板');
              return;
            }
            void onSubmit({
              templateId: tplId,
              sectionId,
              title: title.trim() || chosenTpl?.name || '新建发布单',
              validRange: validRange.trim() || '11-26 14:00–20:00',
              line1: line1.trim() || chosenTpl?.line1 || '前方施工区域',
              line2: line2.trim() || chosenTpl?.line2 || '减速谨慎驾驶',
              boardIds: selectedBoardIds,
            });
          }}
        >
          <Plus size={14} />
          {submitting ? '提交中...' : '提交审核发布单'}
        </button>
      </div>
    </ModalShell>
  );
}

export function AuditOrderModal({
  order,
  submitting,
  onPass,
  onReject,
  onClose,
}: {
  order: PublishOrderDTO;
  submitting: boolean;
  onPass: (payload: {
    reviewer: string;
    scheduleTime: string;
    comment: string;
  }) => Promise<void>;
  onReject: (payload: { reviewer: string; comment: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [reviewer, setReviewer] = useState('审核员B（演示）');
  const [scheduleTime, setScheduleTime] = useState(
    order.scheduleTime === '待安排' ? '11-26 11:45' : order.scheduleTime
  );
  const [comment, setComment] = useState(
    '文案内容符合高速公路施工保通信息发布规范，同意进入授权环节。'
  );

  return (
    <ModalShell title={`内容审核 — ${order.id}`} onClose={onClose}>
      <div className="detail-grid" style={{ marginBottom: '10px' }}>
        <div className="detail-stat-card">
          <span>发布单编号</span>
          <strong>{order.id}</strong>
        </div>
        <div className="detail-stat-card">
          <span>内容模板</span>
          <strong>
            {order.templateId} · {order.version}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>目标情报板</span>
          <strong>{order.boardIds.length} 块</strong>
        </div>
      </div>

      <LedBoardPreview
        line1={order.line1}
        line2={order.line2}
        spec={order.spec}
      />

      <div className="m13-modal-grid" style={{ marginTop: '10px' }}>
        <div className="m13-field">
          <label>审核人</label>
          <input
            type="text"
            className="m13-input"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>计划下发时间</label>
          <input
            type="text"
            className="m13-input"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>
      </div>
      <div className="m13-field">
        <label>审核意见</label>
        <textarea
          className="m13-textarea"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="m13-modal-footer">
        <button
          type="button"
          className="m13-btn-gold"
          disabled={submitting}
          onClick={() =>
            void onReject({
              reviewer: reviewer.trim() || '审核员B（演示）',
              comment: comment.trim(),
            })
          }
        >
          退回撤销
        </button>
        <button
          type="button"
          className="m13-btn-primary"
          disabled={submitting}
          onClick={() =>
            void onPass({
              reviewer: reviewer.trim() || '审核员B（演示）',
              scheduleTime: scheduleTime.trim() || '11-26 11:45',
              comment: comment.trim(),
            })
          }
        >
          <ShieldCheck size={15} />
          {submitting ? '提交中...' : '审核通过（流转至待授权）'}
        </button>
      </div>
    </ModalShell>
  );
}

export function AuthorizeOrderModal({
  order,
  boards,
  submitting,
  onConfirm,
  onClose,
}: {
  order: PublishOrderDTO;
  boards: PublishBoardDTO[];
  submitting: boolean;
  onConfirm: (authorizer: string) => Promise<void>;
  onClose: () => void;
}) {
  const [authorizer, setAuthorizer] = useState('授权员C（演示）');
  const boardMap = new Map(boards.map((b) => [b.id, b]));

  return (
    <ModalShell title={`授权确认与下发 — ${order.id}`} onClose={onClose}>
      <div className="detail-grid" style={{ marginBottom: '10px' }}>
        <div className="detail-stat-card">
          <span>发布单编号</span>
          <strong>{order.id}</strong>
        </div>
        <div className="detail-stat-card">
          <span>审核人</span>
          <strong>{order.reviewer}</strong>
        </div>
        <div className="detail-stat-card">
          <span>下发对象</span>
          <strong>{order.boardIds.length} 块情报板</strong>
        </div>
      </div>

      <LedBoardPreview
        line1={order.line1}
        line2={order.line2}
        spec={order.spec}
      />

      <div className="m13-recessed-box" style={{ marginTop: '10px', marginBottom: '10px' }}>
        <div className="m13-recessed-title">即将下发的目标情报板</div>
        <div style={{ fontSize: '12.5px', color: '#e2f0ff' }}>
          {order.boardIds
            .map((id) => {
              const b = boardMap.get(id);
              return b
                ? `${b.id}（${b.stake} · ${b.online ? '在线' : '离线'}）`
                : id;
            })
            .join('、')}
        </div>
      </div>

      <div className="m13-modal-grid">
        <div className="m13-field">
          <label>授权人</label>
          <input
            type="text"
            className="m13-input"
            value={authorizer}
            onChange={(e) => setAuthorizer(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>授权核验方式</label>
          <input
            type="text"
            className="m13-input"
            value="数字签名已核验（二级授权）"
            readOnly
          />
        </div>
      </div>

      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-ghost" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m13-btn-primary"
          disabled={submitting}
          onClick={() =>
            void onConfirm(authorizer.trim() || '授权员C（演示）')
          }
        >
          <Send size={15} />
          {submitting ? '下发中...' : '确认授权并下发情报板'}
        </button>
      </div>
    </ModalShell>
  );
}

export function RevokeOrderModal({
  order,
  submitting,
  onConfirm,
  onClose,
}: {
  order: PublishOrderDTO;
  submitting: boolean;
  onConfirm: (authorizer: string) => Promise<void>;
  onClose: () => void;
}) {
  const [authorizer, setAuthorizer] = useState('授权员C（演示）');

  return (
    <ModalShell title={`撤销发布单 — ${order.id}`} onClose={onClose}>
      <div className="m13-recessed-box" style={{ marginBottom: '10px' }}>
        <div className="m13-recessed-title">撤销确认</div>
        <div className="m13-recessed-lines">
          确定撤销发布单 <strong>{order.id}</strong>（{order.title}）？
          <br />
          撤销后将停止跟踪回执，并标记为「已撤销」。
        </div>
      </div>
      <div className="m13-field">
        <label>授权复核人</label>
        <input
          type="text"
          className="m13-input"
          value={authorizer}
          onChange={(e) => setAuthorizer(e.target.value)}
        />
      </div>
      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-ghost" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m13-btn-gold"
          disabled={submitting}
          onClick={() =>
            void onConfirm(authorizer.trim() || order.authorizer || '授权员C（演示）')
          }
        >
          <Undo2 size={14} />
          {submitting ? '撤销中...' : '确认授权撤销'}
        </button>
      </div>
    </ModalShell>
  );
}

export function ConfigPlanModal({
  plan,
  templates,
  submitting,
  onConfirm,
  onClose,
}: {
  plan: PublishPlanDTO;
  templates: PublishTemplateDTO[];
  submitting: boolean;
  onConfirm: (payload: {
    name: string;
    scene: '施工导改' | '天气预警' | '智慧提速';
    approvalStatus: '已批准' | '待批准';
    interfaceStatus: '接口就绪' | '待接入' | '待核验';
    templateId: string;
    validRange: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(plan.name);
  const [scene, setScene] = useState<'施工导改' | '天气预警' | '智慧提速'>(
    (plan.scene as '施工导改' | '天气预警' | '智慧提速') || '施工导改'
  );
  const [approvalStatus, setApprovalStatus] = useState<'已批准' | '待批准'>(
    (plan.approvalStatus as '已批准' | '待批准') || '待批准'
  );
  const [interfaceStatus, setInterfaceStatus] = useState<
    '接口就绪' | '待接入' | '待核验'
  >(
    (plan.interfaceStatus as '接口就绪' | '待接入' | '待核验') || '待接入'
  );
  const [templateId, setTemplateId] = useState(plan.templateId);
  const [validRange, setValidRange] = useState(plan.validRange);

  return (
    <ModalShell title={`配置联动预案 — ${plan.id}`} onClose={onClose}>
      <div className="m13-modal-grid">
        <div className="m13-field">
          <label>预案名称</label>
          <input
            type="text"
            className="m13-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="m13-field">
          <label>关联场景</label>
          <select
            className="m13-select"
            value={scene}
            onChange={(e) =>
              setScene(
                e.target.value as '施工导改' | '天气预警' | '智慧提速'
              )
            }
          >
            <option value="施工导改">施工导改</option>
            <option value="天气预警">天气预警</option>
            <option value="智慧提速">智慧提速</option>
          </select>
        </div>
        <div className="m13-field">
          <label>预案审批状态</label>
          <select
            className="m13-select"
            value={approvalStatus}
            onChange={(e) =>
              setApprovalStatus(e.target.value as '已批准' | '待批准')
            }
          >
            <option value="已批准">已批准</option>
            <option value="待批准">待批准</option>
          </select>
        </div>
        <div className="m13-field">
          <label>联动接口状态</label>
          <select
            className="m13-select"
            value={interfaceStatus}
            onChange={(e) =>
              setInterfaceStatus(
                e.target.value as '接口就绪' | '待接入' | '待核验'
              )
            }
          >
            <option value="接口就绪">接口就绪</option>
            <option value="待接入">待接入</option>
            <option value="待核验">待核验</option>
          </select>
        </div>
        <div className="m13-field">
          <label>关联内容模板</label>
          <select
            className="m13-select"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} · {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="m13-field">
          <label>联动有效期</label>
          <input
            type="text"
            className="m13-input"
            value={validRange}
            onChange={(e) => setValidRange(e.target.value)}
          />
        </div>
      </div>

      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-ghost" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m13-btn-primary"
          disabled={submitting}
          onClick={() =>
            void onConfirm({
              name: name.trim() || plan.name,
              scene,
              approvalStatus,
              interfaceStatus,
              templateId,
              validRange: validRange.trim() || plan.validRange,
            })
          }
        >
          {submitting ? '保存中...' : '保存预案配置'}
        </button>
      </div>
    </ModalShell>
  );
}

export function PlanTriggersModal({
  plan,
  submitting,
  onApproveVerify,
  onClose,
}: {
  plan: PublishPlanDTO;
  submitting: boolean;
  onApproveVerify: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`触发核对记录 — ${plan.id} ${plan.name}`}
      onClose={onClose}
    >
      <div className="detail-grid" style={{ marginBottom: '10px' }}>
        <div className="detail-stat-card">
          <span>预案编号</span>
          <strong>{plan.id}</strong>
        </div>
        <div className="detail-stat-card">
          <span>预案审批</span>
          <strong>{plan.approvalStatus}</strong>
        </div>
        <div className="detail-stat-card">
          <span>接口状态</span>
          <strong>{plan.interfaceStatus}</strong>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>记录时间</th>
            <th>联动触发核对事件</th>
            <th>状态结果</th>
          </tr>
        </thead>
        <tbody>
          {plan.triggerLogs.map((log, idx) => (
            <tr key={`${log.time}-${idx}`}>
              <td>{log.time}</td>
              <td>{log.event}</td>
              <td>
                <span
                  className={`status-tag ${
                    log.result === '匹配成功' || log.result === '已下发'
                      ? 'ok'
                      : log.result === '已建单' || log.result === '已接收'
                        ? 'info'
                        : 'warn'
                  }`}
                >
                  {log.result}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="m13-modal-footer">
        {!plan.conditionMet ? (
          <button
            type="button"
            className="m13-btn-green"
            disabled={submitting}
            onClick={() => void onApproveVerify()}
          >
            <CheckCircle2 size={15} />
            {submitting ? '核验中...' : '完成审批与接口核验'}
          </button>
        ) : null}
        <button type="button" className="m13-btn-primary" onClick={onClose}>
          关闭
        </button>
      </div>
    </ModalShell>
  );
}

export function AuditTrailModal({
  order,
  receipts,
  onClose,
}: {
  order: PublishOrderDTO;
  receipts: PublishReceiptDTO[];
  onClose: () => void;
}) {
  const confirmedCount = receipts.filter(
    (r) => r.confirmStatus === '已确认显示'
  ).length;
  const allConfirmed =
    receipts.length > 0 && confirmedCount === receipts.length;

  return (
    <ModalShell title={`审核与授权留痕记录 — ${order.id}`} onClose={onClose}>
      <div className="detail-grid" style={{ marginBottom: '10px' }}>
        <div className="detail-stat-card">
          <span>发布单号</span>
          <strong>{order.id}</strong>
        </div>
        <div className="detail-stat-card">
          <span>模板版本</span>
          <strong>
            {order.templateId} · {order.version}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>发布状态</span>
          <strong>{order.status}</strong>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>环节</th>
            <th>经办人 / 责任角色</th>
            <th>时间</th>
            <th>核验结论</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>内容编排</td>
            <td>{order.operator}</td>
            <td>
              {order.date} {order.stepTimes.compose}
            </td>
            <td>
              <span className="status-tag ok">已提交</span>
            </td>
          </tr>
          <tr>
            <td>内容审核</td>
            <td>{order.reviewer}</td>
            <td>
              {order.stepTimes.review === '待审核'
                ? '—'
                : `${order.date} ${order.stepTimes.review}`}
            </td>
            <td>
              <span
                className={`status-tag ${
                  order.stepTimes.review === '待审核' ? 'warn' : 'ok'
                }`}
              >
                {order.stepTimes.review === '待审核' ? '待审核' : '审核通过'}
              </span>
            </td>
          </tr>
          <tr>
            <td>授权确认</td>
            <td>{order.authorizer}</td>
            <td>
              {order.stepTimes.auth === '待授权'
                ? '—'
                : `${order.date} ${order.stepTimes.auth}`}
            </td>
            <td>
              <span
                className={`status-tag ${order.authorized ? 'ok' : 'warn'}`}
              >
                {order.authorized ? '授权已核验' : '待授权'}
              </span>
            </td>
          </tr>
          <tr>
            <td>系统下发</td>
            <td>信息发布网关</td>
            <td>{order.fullTime}</td>
            <td>
              <span className="status-tag info">{order.status}</span>
            </td>
          </tr>
          <tr>
            <td>现场核验</td>
            <td>巡查员D（演示）</td>
            <td>
              {confirmedCount} / {receipts.length} 块已确认
            </td>
            <td>
              <span className={`status-tag ${allConfirmed ? 'ok' : 'warn'}`}>
                {allConfirmed ? '全部确认' : '跟踪中'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="m13-modal-footer">
        <button type="button" className="m13-btn-primary" onClick={onClose}>
          关闭
        </button>
      </div>
    </ModalShell>
  );
}
