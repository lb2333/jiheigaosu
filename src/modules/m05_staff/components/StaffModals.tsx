'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ROLE_DUTY_MAP,
  type RoleDetailResponse,
  type StaffAnomalyDTO,
  type StaffKeyRoleDTO,
  type StaffMemberDTO,
} from '../types';

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

export function StaffArchiveModal({
  person,
  submitting,
  onToggleStatus,
  onJumpToRole,
  onClose,
}: {
  person: StaffMemberDTO;
  submitting: boolean;
  onToggleStatus: (staffId: string, nextStatus: '在岗' | '暂未在岗', offReason: string) => Promise<void>;
  onJumpToRole: (roleCode: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(person.offReason || '正常在岗履职，持证有效。');
  const nextStatus: '在岗' | '暂未在岗' = person.status === '在岗' ? '暂未在岗' : '在岗';

  return (
    <ModalShell title={`人员档案详情 · ${person.name} (${person.id})`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>所属单位 / 工区</span>
          <strong>
            {person.orgName} · {person.sectionName}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>当前岗位</span>
          <strong>{person.role}</strong>
        </div>
        <div className="detail-stat-card">
          <span>在岗状态</span>
          <strong style={{ color: person.status === '在岗' ? '#4ade80' : '#facc15' }}>
            {person.status}
          </strong>
        </div>
      </div>

      <table className="data-table">
        <tbody>
          <tr>
            <th style={{ width: '120px' }}>人员编号</th>
            <td>{person.id}</td>
            <th style={{ width: '120px' }}>组织类型</th>
            <td>{person.orgType}</td>
          </tr>
          <tr>
            <th>联系电话</th>
            <td>{person.phone}</td>
            <th>入场日期</th>
            <td>{person.joinDate}</td>
          </tr>
          <tr>
            <th>执业/岗位证书</th>
            <td>{person.cert}</td>
            <th>证书有效期至</th>
            <td>{person.certValid}</td>
          </tr>
          <tr>
            <th>关键岗位任职</th>
            <td>
              {person.keyRole
                ? `${person.keyRole.code} (${person.keyRole.roleName})`
                : '一般岗位人员'}
            </td>
            <th>三级安全教育</th>
            <td>
              <StatusBadge text="已培训考核合格" tone="ok" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="m05-modal-box">
        <div className="m05-modal-title">主要职责与履职说明</div>
        <div style={{ color: '#dbeafe', lineHeight: 1.6 }}>{person.duty}</div>
        {person.offReason ? (
          <div style={{ color: '#facc15', fontSize: '12px' }}>
            离岗/调休备注：{person.offReason}
          </div>
        ) : null}
      </div>

      <div className="m05-modal-box">
        <div className="m05-modal-title">台账在岗状态维护</div>
        <textarea
          className="m05-modal-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="输入在岗调整或休假/返岗说明..."
        />
        <div className="m05-modal-actions">
          <button
            type="button"
            className="btn-primary-glow"
            disabled={submitting}
            onClick={() => void onToggleStatus(person.id, nextStatus, note)}
          >
            {submitting
              ? '提交中...'
              : person.status === '在岗'
                ? '标记为「暂未在岗」'
                : '确认返岗并标记「在岗」'}
          </button>
          {person.keyRole ? (
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '8px 14px' }}
              onClick={() => onJumpToRole(person.keyRole!.code)}
            >
              查看岗位配置 ({person.keyRole.code})
            </button>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}

export function KeyRoleModal({
  role,
  attendanceDate,
  submitting,
  onAssign,
  onUnassign,
  onJumpProfile,
  onClose,
}: {
  role: StaffKeyRoleDTO;
  attendanceDate: string;
  submitting: boolean;
  onAssign: (roleCode: string, holderId: string, assignDate: string) => Promise<void>;
  onUnassign: (roleCode: string) => Promise<void>;
  onJumpProfile: (staffId: string) => void;
  onClose: () => void;
}) {
  const [candidates, setCandidates] = useState<RoleDetailResponse['candidates']>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (role.holder) return;
    let active = true;
    setLoadingCandidates(true);
    fetch(`/api/v1/m05/roles/${encodeURIComponent(role.code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RoleDetailResponse | null) => {
        if (!active || !data) return;
        setCandidates(data.candidates ?? []);
        if (data.candidates?.length) {
          setSelectedCandidateId(data.candidates[0].id);
        }
      })
      .finally(() => {
        if (active) setLoadingCandidates(false);
      });
    return () => {
      active = false;
    };
  }, [role.code, role.holder]);

  const holder = role.holder;

  return (
    <ModalShell title={`关键岗位配置详情 · ${role.code}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>责任单位 / 工区</span>
          <strong>
            {role.orgName} · {role.sectionName}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>关键岗位</span>
          <strong>{role.roleName}</strong>
        </div>
        <div className="detail-stat-card">
          <span>配置状态</span>
          <strong style={{ color: holder ? '#4ade80' : '#facc15' }}>
            {holder ? '已配置' : '待配置'}
          </strong>
        </div>
      </div>

      {holder ? (
        <>
          <table className="data-table">
            <tbody>
              <tr>
                <th style={{ width: '120px' }}>责任人</th>
                <td>
                  {holder.name} ({holder.id})
                </td>
                <th style={{ width: '120px' }}>台账状态</th>
                <td>
                  <StatusBadge
                    text={holder.status}
                    tone={holder.status === '在岗' ? 'ok' : 'warn'}
                  />
                </td>
              </tr>
              <tr>
                <th>入岗日期</th>
                <td>{role.assignDate || holder.joinDate}</td>
                <th>资格证书</th>
                <td>
                  {holder.cert} (有效期至 {holder.certValid})
                </td>
              </tr>
              <tr>
                <th>考勤日期</th>
                <td>{attendanceDate}</td>
                <th>岗位职责</th>
                <td>{ROLE_DUTY_MAP[role.roleName] || holder.duty}</td>
              </tr>
            </tbody>
          </table>

          <div className="m05-modal-actions">
            <button
              type="button"
              className="btn-primary-glow"
              onClick={() => onJumpProfile(holder.id)}
            >
              查看责任人完整档案
            </button>
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '8px 14px' }}
              disabled={submitting}
              onClick={() => void onUnassign(role.code)}
            >
              {submitting ? '处理中...' : '调离/设为待配置'}
            </button>
          </div>
        </>
      ) : (
        <div className="m05-modal-box">
          <div className="m05-modal-title">空缺岗位指派责任人</div>
          <div style={{ color: '#dbeafe', fontSize: '12.5px' }}>
            该岗位当前为「待配置」状态，请从本单位/同工区在册人员中选择具备相应执业资格的人员上岗：
          </div>
          <select
            className="glass-select"
            style={{ width: '100%', height: '34px' }}
            value={selectedCandidateId}
            disabled={loadingCandidates || candidates.length === 0}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
          >
            {loadingCandidates ? (
              <option value="">加载候选人员...</option>
            ) : candidates.length === 0 ? (
              <option value="">暂无可用候选人员</option>
            ) : (
              candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) · {c.role} · {c.status}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            className="btn-primary-glow"
            disabled={submitting || !selectedCandidateId}
            onClick={() => void onAssign(role.code, selectedCandidateId, attendanceDate)}
          >
            {submitting ? '配置提交中...' : '确认配置到岗并更新台账'}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

export function AnomalyModal({
  anomaly,
  submitting,
  onResolve,
  onClose,
}: {
  anomaly: StaffAnomalyDTO;
  submitting: boolean;
  onResolve: (anomalyId: string, handleNote: string) => Promise<void>;
  onClose: () => void;
}) {
  const [handleNote, setHandleNote] = useState(
    anomaly.handleNote || '已电话核实并比对现场带班巡检轨迹，确认处置结果无误。'
  );

  return (
    <ModalShell
      title={`考勤异常核查处置 · ${anomaly.staffName || anomaly.staffId}`}
      onClose={onClose}
    >
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>所属组织 / 工区</span>
          <strong>
            {anomaly.orgName} · {anomaly.sectionName}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>异常类型</span>
          <strong style={{ color: '#facc15' }}>{anomaly.type}</strong>
        </div>
        <div className="detail-stat-card">
          <span>记录时间</span>
          <strong>
            {anomaly.date} {anomaly.time}
          </strong>
        </div>
      </div>

      <table className="data-table">
        <tbody>
          <tr>
            <th style={{ width: '120px' }}>异常单号</th>
            <td>{anomaly.id}</td>
            <th style={{ width: '120px' }}>责任岗位</th>
            <td>{anomaly.roleName}</td>
          </tr>
          <tr>
            <th>异常说明</th>
            <td colSpan={3}>{anomaly.note}</td>
          </tr>
        </tbody>
      </table>

      <div className="m05-modal-box">
        <div className="m05-modal-title">现场核查与闭环处理</div>
        <textarea
          className="m05-modal-textarea"
          value={handleNote}
          onChange={(e) => setHandleNote(e.target.value)}
        />
        <div className="m05-modal-actions">
          <button
            type="button"
            className="btn-primary-glow"
            disabled={submitting}
            onClick={() => void onResolve(anomaly.id, handleNote)}
          >
            {submitting ? '提交中...' : '核实到岗 / 完成异常销号'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
