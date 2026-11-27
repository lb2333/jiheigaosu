'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  PATROL_STATUS_OPTIONS,
  type EquipmentDTO,
  type KeyArchiveDTO,
  type PatrolLogDTO,
  type ReminderConfigDTO,
  type ReminderDateField,
} from '../types';

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

export function EquipmentModal({
  equipment,
  saving,
  onSaveStatus,
  onJumpArchive,
  onClose,
}: {
  equipment: EquipmentDTO;
  saving: boolean;
  onSaveStatus: (
    code: string,
    payload: { entryStatus: string; useStatus: string; location: string }
  ) => Promise<void>;
  onJumpArchive: (code: string) => void;
  onClose: () => void;
}) {
  const [entryStatus, setEntryStatus] = useState(equipment.entryStatus);
  const [useStatus, setUseStatus] = useState(equipment.useStatus);
  const [location, setLocation] = useState(equipment.location);

  const cm = equipment.certMeta;
  const dirty =
    entryStatus !== equipment.entryStatus ||
    useStatus !== equipment.useStatus ||
    location.trim() !== equipment.location;

  return (
    <ModalShell title={`机械设备台账详情 · ${equipment.code}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>设备名称 / 型号</span>
          <strong>
            {equipment.name} · {equipment.model}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>所属工区 / 进退场</span>
          <strong>
            {equipment.sectionName} · {entryStatus}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>当前使用状态</span>
          <strong
            style={{
              color:
                useStatus === '在用'
                  ? '#4ade80'
                  : useStatus === '停用'
                    ? '#facc15'
                    : '#38bdf8',
            }}
          >
            {useStatus}
          </strong>
        </div>
      </div>

      <table className="data-table">
        <tbody>
          <tr>
            <th style={{ width: '120px' }}>设备类型</th>
            <td>{equipment.type}</td>
            <th style={{ width: '120px' }}>所属单位</th>
            <td>{equipment.unit}</td>
          </tr>
          <tr>
            <th>技术规格</th>
            <td>{equipment.spec}</td>
            <th>生产厂家</th>
            <td>{equipment.manufacturer}</td>
          </tr>
          <tr>
            <th>作业位置</th>
            <td>{equipment.location}</td>
            <th>操作手 / 责任人</th>
            <td>{equipment.operator}</td>
          </tr>
          <tr>
            <th>进场日期</th>
            <td>{equipment.entryDate}</td>
            <th>退场日期</th>
            <td>{equipment.exitDate}</td>
          </tr>
          {equipment.isKey && cm ? (
            <tr>
              <th>重点档案编号</th>
              <td>{equipment.archiveId}</td>
              <th>检验状态</th>
              <td>
                <span className={`m06-tag ${cm.tagCls}`}>
                  {cm.status}（{cm.remindText}）
                </span>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="m06-modal-sheet">
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#dbeafe' }}>
          设备状态变更（写入台账并记录审计日志）
        </div>
        <div className="m06-form-grid">
          <div className="m06-form-field">
            <label>进退场状态</label>
            <select
              className="glass-select m06-select"
              value={entryStatus}
              onChange={(e) => {
                const nextEntry = e.target.value;
                setEntryStatus(nextEntry);
                if (nextEntry === '已退场') setUseStatus('—');
                else if (useStatus === '—') setUseStatus('待用');
              }}
            >
              <option value="在场">在场</option>
              <option value="已退场">已退场</option>
            </select>
          </div>
          <div className="m06-form-field">
            <label>使用状态</label>
            <select
              className="glass-select m06-select"
              value={useStatus}
              disabled={entryStatus === '已退场'}
              onChange={(e) => setUseStatus(e.target.value)}
            >
              {entryStatus === '已退场' ? (
                <option value="—">—（已退场）</option>
              ) : (
                <>
                  <option value="在用">在用</option>
                  <option value="待用">待用</option>
                  <option value="停用">停用</option>
                </>
              )}
            </select>
          </div>
        </div>
        <div className="m06-form-field">
          <label>作业位置</label>
          <input
            type="text"
            className="m06-form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
        {equipment.isKey ? (
          <button
            type="button"
            className="dock-btn"
            onClick={() => onJumpArchive(equipment.code)}
          >
            进入重点机械一机一档 &gt;
          </button>
        ) : null}
        <button
          type="button"
          className="btn-primary-glow"
          disabled={saving || !dirty}
          onClick={() =>
            void onSaveStatus(equipment.code, {
              entryStatus,
              useStatus,
              location: location.trim() || equipment.location,
            })
          }
        >
          {saving ? '保存中...' : '保存状态变更'}
        </button>
        <button type="button" className="dock-btn" onClick={onClose}>
          关闭
        </button>
      </div>
    </ModalShell>
  );
}

export function ArchiveModal({
  archive,
  onPreviewDoc,
  onClose,
}: {
  archive: KeyArchiveDTO;
  onPreviewDoc: (kind: 'inspect' | 'register') => void;
  onClose: () => void;
}) {
  const cm = archive.certMeta;

  return (
    <ModalShell title={`重点机械一机一档 · ${archive.archiveId}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>设备编号 / 名称</span>
          <strong>
            {archive.code} · {archive.name}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>检验有效期至</span>
          <strong>{cm.displayDate}</strong>
        </div>
        <div className="detail-stat-card">
          <span>证书状态</span>
          <strong style={{ color: cm.remindColor }}>{cm.status}</strong>
        </div>
      </div>

      <table className="data-table">
        <tbody>
          <tr>
            <th style={{ width: '120px' }}>所属工区</th>
            <td>
              {archive.sectionName}（{archive.unit}）
            </td>
            <th style={{ width: '120px' }}>型号规格</th>
            <td>
              {archive.model} · {archive.spec}
            </td>
          </tr>
          <tr>
            <th>检验报告编号</th>
            <td>{archive.inspectNo}</td>
            <th>检验日期</th>
            <td>{archive.inspectDate}</td>
          </tr>
          <tr>
            <th>安装告知有效期</th>
            <td>{archive.installValidUntil}</td>
            <th>到期提醒</th>
            <td style={{ color: cm.remindColor, fontWeight: 700 }}>{cm.remindText}</td>
          </tr>
          <tr>
            <th>作业部位</th>
            <td>{archive.location}</td>
            <th>特种作业人员</th>
            <td>{archive.operator}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          className="dock-btn"
          onClick={() => onPreviewDoc('inspect')}
        >
          预览定期检验报告
        </button>
        <button
          type="button"
          className="btn-primary-glow"
          onClick={() => onPreviewDoc('register')}
        >
          预览使用登记资料
        </button>
      </div>
    </ModalShell>
  );
}

export function DocPreviewModal({
  archive,
  docKind,
  saving,
  onSupplementReport,
  onDownload,
  onClose,
}: {
  archive: KeyArchiveDTO;
  docKind: 'inspect' | 'register';
  saving: boolean;
  onSupplementReport: (
    code: string,
    payload: {
      inspectNo: string;
      inspectDate: string;
      validUntil: string;
      installValidUntil: string;
      useStatus: '在用' | '待用' | '停用';
    }
  ) => Promise<void>;
  onDownload: (filename: string) => void;
  onClose: () => void;
}) {
  const isInspect = docKind === 'inspect';
  const cm = archive.certMeta;
  const title = isInspect
    ? `PDF 预览 · ${archive.code} 定期检验报告.pdf`
    : `PDF 预览 · ${archive.code} 设备使用登记资料.pdf`;

  const defaultNo =
    archive.inspectNo === 'JY-待补录'
      ? `JY-2026-${String(880 + (archive.keyOrder || 1)).padStart(4, '0')}`
      : archive.inspectNo;

  const [inspectNo, setInspectNo] = useState(defaultNo);
  const [inspectDate, setInspectDate] = useState(
    archive.inspectDate === '—' ? '2026-11-26' : archive.inspectDate
  );
  const [validUntil, setValidUntil] = useState(
    archive.validUntil === '—' ? '2027-06-30' : archive.validUntil
  );
  const [installValidUntil, setInstallValidUntil] = useState(
    archive.installValidUntil === '—' ? '2027-08-30' : archive.installValidUntil
  );

  return (
    <ModalShell title={title} onClose={onClose}>
      {isInspect ? (
        <>
          <div className="m06-modal-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  黑龙江省特种设备监督检验研究院 · 定期检验报告（电子归档件）
                </div>
                <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '3px' }}>
                  报告编号：{archive.inspectNo} &nbsp;|&nbsp; 档案号：{archive.archiveId}
                </div>
              </div>
              <span className="m06-seal-stamp">
                {archive.missingDocs ? '待补录盖章件' : '特检机构检验专用章'}
              </span>
            </div>

            <table className="data-table">
              <tbody>
                <tr>
                  <th style={{ width: '120px' }}>使用单位</th>
                  <td>{archive.unit}</td>
                  <th style={{ width: '120px' }}>设备名称</th>
                  <td>
                    {archive.name}（{archive.model}）
                  </td>
                </tr>
                <tr>
                  <th>设备代码</th>
                  <td>{archive.code}</td>
                  <th>制造单位</th>
                  <td>{archive.manufacturer}</td>
                </tr>
                <tr>
                  <th>检验日期</th>
                  <td>{archive.inspectDate}</td>
                  <th>下次检验日期</th>
                  <td style={{ color: cm.remindColor, fontWeight: 700 }}>{archive.validUntil}</td>
                </tr>
                <tr>
                  <th>主要检验项目</th>
                  <td colSpan={3}>
                    金属结构焊缝无损检测（合格）、起升/变幅机构及制动器（合格）、力矩限制器与高度限位（合格）、1.25倍静载及1.1倍动载试验（合格）
                  </td>
                </tr>
                <tr>
                  <th>检验结论</th>
                  <td colSpan={3}>
                    <span className={`m06-tag ${cm.tagCls}`}>
                      {archive.missingDocs ? '资料待补齐后复核' : `检验合格（状态：${cm.status}）`}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {archive.missingDocs ? (
            <div className="m06-modal-sheet">
              <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 600 }}>
                该设备缺少盖章版定期检验报告，可模拟补录扫描件并更新有效期：
              </div>
              <div className="m06-form-grid">
                <div className="m06-form-field">
                  <label>检验报告编号</label>
                  <input
                    type="text"
                    className="m06-form-input"
                    value={inspectNo}
                    onChange={(e) => setInspectNo(e.target.value)}
                  />
                </div>
                <div className="m06-form-field">
                  <label>检验日期</label>
                  <input
                    type="date"
                    className="m06-form-input"
                    value={inspectDate}
                    onChange={(e) => setInspectDate(e.target.value)}
                  />
                </div>
                <div className="m06-form-field">
                  <label>检验有效期至</label>
                  <input
                    type="date"
                    className="m06-form-input"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
                <div className="m06-form-field">
                  <label>安装告知有效期</label>
                  <input
                    type="date"
                    className="m06-form-input"
                    value={installValidUntil}
                    onChange={(e) => setInstallValidUntil(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="dock-btn" onClick={onClose}>
                  取消
                </button>
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={saving}
                  onClick={() =>
                    void onSupplementReport(archive.code, {
                      inspectNo: inspectNo.trim() || defaultNo,
                      inspectDate,
                      validUntil,
                      installValidUntil,
                      useStatus: '待用',
                    })
                  }
                >
                  {saving ? '补录中...' : `模拟补录检验报告（有效期至 ${validUntil}）`}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="dock-btn"
                onClick={() => onDownload(`${archive.code}_定期检验报告.pdf`)}
              >
                下载电子档 PDF
              </button>
              <button type="button" className="btn-primary-glow" onClick={onClose}>
                完成查阅
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="m06-modal-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  特种设备使用登记表与安装告知备案资料
                </div>
                <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '3px' }}>
                  登记证编号：车10黑M-{archive.code.replace(/-/g, '')} &nbsp;|&nbsp; 档案号：{archive.archiveId}
                </div>
              </div>
              <span className="m06-seal-stamp">设备备案登记有效</span>
            </div>
            <table className="data-table">
              <tbody>
                <tr>
                  <th style={{ width: '120px' }}>工程项目</th>
                  <td>G1211吉黑高速明水至北安段</td>
                  <th style={{ width: '120px' }}>责任工区</th>
                  <td>
                    {archive.sectionName}（{archive.unit}）
                  </td>
                </tr>
                <tr>
                  <th>安装位置</th>
                  <td>{archive.location}</td>
                  <th>安装告知有效期</th>
                  <td>{archive.installValidUntil}</td>
                </tr>
                <tr>
                  <th>操作人员</th>
                  <td colSpan={3}>{archive.operator}（持证在岗，年度安全教育考核合格）</td>
                </tr>
                <tr>
                  <th>资料清单</th>
                  <td colSpan={3}>
                    1. 特种设备使用登记证；2. 安装告知受理回执；3. 联合验收合格表；4. 操作人员特种作业资格证复印件。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="dock-btn"
              onClick={() => onDownload(`${archive.code}_使用登记资料.pdf`)}
            >
              下载电子档 PDF
            </button>
            <button type="button" className="btn-primary-glow" onClick={onClose}>
              完成查阅
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

export function PatrolModal({
  archive,
  patrol,
  mode,
  saving,
  onCreatePatrol,
  onClose,
}: {
  archive: KeyArchiveDTO;
  patrol: PatrolLogDTO | null;
  mode: 'view' | 'create';
  saving: boolean;
  onCreatePatrol: (payload: {
    equipmentCode: string;
    content: string;
    status: '记录正常' | '已处理' | '已归档';
    inspector: string;
    detail: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [content, setContent] = useState('起重设备专项巡查');
  const [status, setStatus] = useState<'记录正常' | '已处理' | '已归档'>('记录正常');
  const [inspector, setInspector] = useState('周明');
  const [detail, setDetail] = useState(
    `对 ${archive.sectionName} ${archive.name}（${archive.code}）吊具、限位开关及制动器进行现场复核，运行受控。`
  );

  if (mode === 'view' && patrol) {
    return (
      <ModalShell title={`关联巡查记录详情 · ${patrol.id}`} onClose={onClose}>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>关联机械</span>
            <strong>
              {archive.name} ({archive.code})
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>巡查时间 / 人员</span>
            <strong>
              {patrol.patrolTime} · {patrol.inspector}
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>处理状态</span>
            <strong style={{ color: '#4ade80' }}>{patrol.status}</strong>
          </div>
        </div>
        <table className="data-table">
          <tbody>
            <tr>
              <th style={{ width: '120px' }}>巡查内容</th>
              <td>{patrol.content}</td>
              <th style={{ width: '120px' }}>所属工区</th>
              <td>
                {archive.sectionName} · {archive.location}
              </td>
            </tr>
            <tr>
              <th>现场检查纪要</th>
              <td colSpan={3} style={{ lineHeight: 1.65 }}>
                {patrol.detail}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-primary-glow" onClick={onClose}>
            确认并关闭
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={`新增关联巡查记录 · ${archive.code}`} onClose={onClose}>
      <div className="m06-form-grid">
        <div className="m06-form-field">
          <label>巡查主题</label>
          <input
            type="text"
            className="m06-form-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="如：起重设备例行巡查"
          />
        </div>
        <div className="m06-form-field">
          <label>巡查人员</label>
          <input
            type="text"
            className="m06-form-input"
            value={inspector}
            onChange={(e) => setInspector(e.target.value)}
            placeholder="巡查人员姓名"
          />
        </div>
      </div>

      <div className="m06-form-field">
        <label>处理状态</label>
        <select
          className="glass-select m06-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as '记录正常' | '已处理' | '已归档')}
        >
          {PATROL_STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="m06-form-field">
        <label>现场检查纪要</label>
        <textarea
          rows={3}
          className="m06-form-textarea"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" className="dock-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="btn-primary-glow"
          disabled={saving || !content.trim() || !inspector.trim() || !detail.trim()}
          onClick={() =>
            void onCreatePatrol({
              equipmentCode: archive.code,
              content: content.trim(),
              status,
              inspector: inspector.trim(),
              detail: detail.trim(),
            })
          }
        >
          {saving ? '提交中...' : '提交巡查记录'}
        </button>
      </div>
    </ModalShell>
  );
}

export function ReminderConfigModal({
  config,
  totalKeyCount,
  saving,
  onSave,
  onClose,
}: {
  config: ReminderConfigDTO;
  totalKeyCount: number;
  saving: boolean;
  onSave: (payload: {
    dateField: ReminderDateField;
    remindDays: number;
    notifySystem: boolean;
    autoBlockExpired: boolean;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [dateField, setDateField] = useState<ReminderDateField>(config.dateField);
  const [remindDays, setRemindDays] = useState<number>(config.remindDays);
  const [notifySystem, setNotifySystem] = useState<boolean>(config.notifySystem);
  const [autoBlockExpired, setAutoBlockExpired] = useState<boolean>(config.autoBlockExpired);

  return (
    <ModalShell title="重点机械到期提醒规则配置" onClose={onClose}>
      <div className="m06-form-row">
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff' }}>预警触发日期字段</div>
          <div style={{ fontSize: '11.5px', color: '#93b8de' }}>
            选择用于计算证书倒计时的基准期限字段
          </div>
        </div>
        <select
          className="glass-select m06-select"
          value={dateField}
          onChange={(e) => setDateField(e.target.value as ReminderDateField)}
        >
          <option value="validUntil">检验有效期至</option>
          <option value="installValidUntil">安装告知有效期</option>
        </select>
      </div>

      <div className="m06-form-row">
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff' }}>提前提醒阈值（天）</div>
          <div style={{ fontSize: '11.5px', color: '#93b8de' }}>
            剩余有效期小于等于该天数时标为“即将到期”
          </div>
        </div>
        <select
          className="glass-select m06-select"
          value={remindDays}
          onChange={(e) => setRemindDays(Number(e.target.value) || 30)}
        >
          <option value={15}>提前 15 天</option>
          <option value={30}>提前 30 天</option>
          <option value={45}>提前 45 天</option>
          <option value={60}>提前 60 天</option>
        </select>
      </div>

      <div className="m06-form-row">
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff' }}>平台工作台站内消息推送</div>
          <div style={{ fontSize: '11.5px', color: '#93b8de' }}>
            向对应工区设备管理员与专职安全员发送预警
          </div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={notifySystem}
            onChange={(e) => setNotifySystem(e.target.checked)}
          />
          <span>启用</span>
        </label>
      </div>

      <div className="m06-form-row">
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff' }}>超期自动标记停用管控</div>
          <div style={{ fontSize: '11.5px', color: '#93b8de' }}>
            证书超期且未续检的重点机械禁止派工签发
          </div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoBlockExpired}
            onChange={(e) => setAutoBlockExpired(e.target.checked)}
          />
          <span>启用</span>
        </label>
      </div>

      <div style={{ fontSize: '12px', color: '#93c5fd' }}>
        当前共纳入 {totalKeyCount} 台重点机械监控（点击保存后将持久化配置并实时刷新统计）。
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" className="dock-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="btn-primary-glow"
          disabled={saving}
          onClick={() =>
            void onSave({
              dateField,
              remindDays,
              notifySystem,
              autoBlockExpired,
            })
          }
        >
          {saving ? '保存中...' : '保存配置并生效'}
        </button>
      </div>
    </ModalShell>
  );
}
