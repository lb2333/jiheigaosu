'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  SECTIONS,
  secLabel,
  statusTagClass,
  type LinkedSafetyOption,
  type MapPoiItem,
  type UavClueDTO,
  type UavFleetDTO,
  type UavHangarDTO,
  type UavLiveEventDTO,
  type UavReportDTO,
  type UavRouteDTO,
  type UavTaskDTO,
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

export function PoiDetailModal({
  poi,
  onClose,
  onNavigate,
}: {
  poi: MapPoiItem;
  onClose: () => void;
  onNavigate: (subPage: string) => void;
}) {
  return (
    <ModalShell title={`巡检点位详情 · ${poi.name}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>所属工区</span>
          <strong>{secLabel(poi.secId)}</strong>
        </div>
        <div className="detail-stat-card">
          <span>巡检场景</span>
          <strong>{poi.scene}</strong>
        </div>
        <div className="detail-stat-card">
          <span>经纬度坐标</span>
          <strong>
            {poi.lon.toFixed(4)}, {poi.lat.toFixed(4)}
          </strong>
        </div>
      </div>
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(12,42,92,0.55)',
          border: '1px solid rgba(56,189,248,0.25)',
          fontSize: '13px',
          color: '#e6f2ff',
          marginBottom: '12px',
        }}
      >
        {poi.desc}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          className="m09-btn"
          onClick={() => {
            onClose();
            onNavigate('routes');
          }}
        >
          查看规划航线
        </button>
        <button
          type="button"
          className="m09-btn primary"
          onClick={() => {
            onClose();
            onNavigate('live');
          }}
        >
          进入实时巡检
        </button>
      </div>
    </ModalShell>
  );
}

export function HangarDetailModal({
  hangar,
  onClose,
}: {
  hangar: UavHangarDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`机巢运行状态 · ${hangar.name}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>所属工区</span>
          <strong>{secLabel(hangar.sectionId)}</strong>
        </div>
        <div className="detail-stat-card">
          <span>在线状态</span>
          <strong style={{ color: '#22c55e' }}>{hangar.status}</strong>
        </div>
        <div className="detail-stat-card">
          <span>舱内温度</span>
          <strong>{hangar.temp}</strong>
        </div>
      </div>
      <div className="meta-table">
        <div className="meta-row">
          <span className="meta-key">备电状态</span>
          <span className="meta-val">{hangar.batterySlot}</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">部署坐标</span>
          <span className="meta-val">
            {hangar.lon.toFixed(4)}, {hangar.lat.toFixed(4)}
          </span>
        </div>
      </div>
    </ModalShell>
  );
}

export function FleetModal({
  fleet,
  hangars,
  onClose,
}: {
  fleet: UavFleetDTO[];
  hangars: UavHangarDTO[];
  onClose: () => void;
}) {
  return (
    <ModalShell title="无人机与机巢在线监控台账" onClose={onClose}>
      <table className="data-table" style={{ marginBottom: '12px' }}>
        <thead>
          <tr>
            <th>设备编号</th>
            <th>设备型号</th>
            <th>归属工区</th>
            <th>配属机巢</th>
            <th>电量</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {fleet.map((f) => (
            <tr key={f.id}>
              <td style={{ fontWeight: 700, color: '#fff' }}>{f.name}</td>
              <td>{f.model}</td>
              <td>{secLabel(f.sectionId)}</td>
              <td>{f.hangarName}</td>
              <td>{f.battery}%</td>
              <td>
                <span
                  className={`status-tag ${
                    f.status === '执行中' ? 'info' : f.status === '待命' ? 'ok' : 'warn'
                  }`}
                >
                  {f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="data-table">
        <thead>
          <tr>
            <th>机巢名称</th>
            <th>归属工区</th>
            <th>舱温</th>
            <th>备电状态</th>
            <th>通信状态</th>
          </tr>
        </thead>
        <tbody>
          {hangars.map((h) => (
            <tr key={h.id}>
              <td style={{ fontWeight: 700, color: '#fff' }}>{h.name}</td>
              <td>{secLabel(h.sectionId)}</td>
              <td>{h.temp}</td>
              <td>{h.batterySlot}</td>
              <td>
                <span className="status-tag ok">{h.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function OverviewRecordModal({
  task,
  onClose,
  onNavigate,
}: {
  task: UavTaskDTO;
  onClose: () => void;
  onNavigate: (subPage: string) => void;
}) {
  return (
    <ModalShell title={`巡检记录详情 · ${task.id}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>巡检任务</span>
          <strong>{task.name}</strong>
        </div>
        <div className="detail-stat-card">
          <span>工区与对象</span>
          <strong>
            {secLabel(task.sectionId)}·{task.target}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>当前状态</span>
          <strong>{task.status}</strong>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
        <button
          type="button"
          className="m09-btn"
          onClick={() => {
            onClose();
            onNavigate('tasks');
          }}
        >
          查看任务详情
        </button>
        <button
          type="button"
          className="m09-btn primary"
          onClick={() => {
            onClose();
            onNavigate(task.status === '执行中' ? 'live' : 'reports');
          }}
        >
          {task.status === '执行中' ? '进入实时监控' : '查看巡检报告'}
        </button>
      </div>
    </ModalShell>
  );
}

export function TaskCalendarModal({
  tasks,
  onClose,
}: {
  tasks: UavTaskDTO[];
  onClose: () => void;
}) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <ModalShell title="巡检任务月度排程日历 · 2026年11月" onClose={onClose}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          fontSize: '11.5px',
          marginBottom: '8px',
          color: '#93c5fd',
          textAlign: 'center',
        }}
      >
        <span>周日</span>
        <span>周一</span>
        <span>周二</span>
        <span>周三</span>
        <span>周四</span>
        <span>周五</span>
        <span>周六</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map((d) => {
          const ds = `2026-11-${String(d).padStart(2, '0')}`;
          const dayTasks = tasks.filter((t) => t.planTime.startsWith(ds));
          return (
            <div
              key={d}
              style={{
                minHeight: '58px',
                padding: '5px',
                borderRadius: '6px',
                background:
                  d === 26 ? 'rgba(14,116,210,0.3)' : 'rgba(10,34,78,0.62)',
                border: `1px solid ${d === 26 ? '#38f2ff' : 'rgba(56,189,248,0.2)'}`,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: d === 26 ? '#38f2ff' : '#cfe6ff',
                  marginBottom: '3px',
                }}
              >
                {d}
              </div>
              {dayTasks.slice(0, 2).map((dt) => (
                <div
                  key={dt.id}
                  style={{
                    fontSize: '10px',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    background:
                      dt.status === '执行中'
                        ? 'rgba(34,211,238,0.28)'
                        : dt.status === '待执行'
                          ? 'rgba(250,204,21,0.25)'
                          : 'rgba(34,197,94,0.22)',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '2px',
                  }}
                >
                  {dt.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function PreflightModal({
  task,
  submitting,
  onConfirm,
  onClose,
  showToast,
}: {
  task: UavTaskDTO;
  submitting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  const items = [
    { k: 'eq', label: `1. 设备与电池自检（${task.uav} / ${task.hangar} 满电就绪）` },
    { k: 'comm', label: '2. RTK 差分链路及图传通信正常（延迟 < 80ms）' },
    { k: 'wx', label: '3. 作业气象条件满足（风速 3.2 m/s，无降水结冰）' },
    { k: 'site', label: `4. 现场起降净空及作业人员避让确认（${task.target}）` },
    { k: 'auth', label: `5. 空域及航线版本授权核验通过（${task.routeCode}）` },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [it.k, task.preflightPassed]))
  );

  const allChecked = items.every((it) => checked[it.k]);

  return (
    <ModalShell title={`飞行前安全检查 · ${task.id}`} onClose={onClose}>
      <div style={{ fontSize: '12.5px', color: '#bae6fd', marginBottom: '10px' }}>
        请逐项完成 5 项飞前核验，全部确认通过后即可解锁「下发任务」指令：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {items.map((it) => (
          <label
            key={it.k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '8px 10px',
              borderRadius: '7px',
              background: 'rgba(12,42,92,0.58)',
              border: '1px solid rgba(56,189,248,0.28)',
              cursor: 'pointer',
              fontSize: '12.5px',
              color: '#fff',
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(checked[it.k])}
              onChange={(e) =>
                setChecked((prev) => ({ ...prev, [it.k]: e.target.checked }))
              }
              style={{ accentColor: '#22c55e', width: '15px', height: '15px' }}
            />
            <span>{it.label}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="m09-btn"
          onClick={() =>
            setChecked(Object.fromEntries(items.map((it) => [it.k, true])))
          }
        >
          一键全选核验
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() => {
            if (!allChecked) {
              showToast('请先完成全部 5 项飞前核验勾选');
              return;
            }
            void onConfirm();
          }}
        >
          {submitting ? '提交中...' : '确认通过飞前检查'}
        </button>
      </div>
    </ModalShell>
  );
}

export function NewTaskModal({
  submitting,
  onSubmit,
  onClose,
}: {
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    sectionId: string;
    target: string;
    type: '专项' | '全面' | '应急';
    planTime: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('二工区桥梁边坡联合巡检');
  const [sectionId, setSectionId] = useState('sec2');
  const [target, setTarget] = useState('桥梁示例A');
  const [type, setType] = useState<'专项' | '全面' | '应急'>('专项');
  const [planTime, setPlanTime] = useState('2026-11-26 15:30');

  return (
    <ModalShell title="新建无人机巡检任务" onClose={onClose}>
      <div className="m09-form-grid-2" style={{ marginBottom: '12px' }}>
        <div className="m09-form-item" style={{ gridColumn: '1 / -1' }}>
          <span className="m09-form-lbl">任务名称</span>
          <input
            className="m09-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">所属工区</span>
          <select
            className="m09-select"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            {SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">巡检对象</span>
          <input
            className="m09-input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">巡检类型</span>
          <select
            className="m09-select"
            value={type}
            onChange={(e) => setType(e.target.value as '专项' | '全面' | '应急')}
          >
            <option value="专项">专项巡检</option>
            <option value="全面">全面巡检</option>
            <option value="应急">应急巡检</option>
          </select>
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">计划执行时间</span>
          <input
            className="m09-input"
            value={planTime}
            onChange={(e) => setPlanTime(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() =>
            void onSubmit({
              name: name.trim() || '新建巡检任务',
              sectionId,
              target: target.trim() || '现场示范点位',
              type,
              planTime: planTime.trim() || '2026-11-26 15:30',
            })
          }
        >
          {submitting ? '创建中...' : '创建任务计划'}
        </button>
      </div>
    </ModalShell>
  );
}

export function NewRouteModal({
  submitting,
  onSubmit,
  onClose,
}: {
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    code: string;
    sectionId: string;
    targetName: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('三工区路基边坡航线');
  const [code, setCode] = useState('LJ-C V1.0');
  const [sectionId, setSectionId] = useState('sec3');
  const [targetName, setTargetName] = useState('路基示例段');

  return (
    <ModalShell title="新建巡检航线" onClose={onClose}>
      <div className="m09-form-grid-2" style={{ marginBottom: '12px' }}>
        <div className="m09-form-item">
          <span className="m09-form-lbl">航线名称</span>
          <input
            className="m09-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">版本号</span>
          <input
            className="m09-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">归属工区</span>
          <select
            className="m09-select"
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
        <div className="m09-form-item">
          <span className="m09-form-lbl">巡检对象</span>
          <input
            className="m09-input"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() =>
            void onSubmit({
              name: name.trim() || '新巡检航线',
              code: code.trim() || 'NEW V1.0',
              sectionId,
              targetName: targetName.trim() || '路基示例段',
            })
          }
        >
          {submitting ? '生成中...' : '生成航线模板'}
        </button>
      </div>
    </ModalShell>
  );
}

export function RouteHistoryModal({
  route,
  onClose,
}: {
  route: UavRouteDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`航线历史版本 · ${route.name}`} onClose={onClose}>
      <table className="data-table">
        <thead>
          <tr>
            <th>版本</th>
            <th>修订日期</th>
            <th>修订人</th>
            <th>状态</th>
            <th>修订说明</th>
          </tr>
        </thead>
        <tbody>
          {route.history.map((h, i) => (
            <tr key={`${h.ver}-${i}`}>
              <td style={{ fontWeight: 700, color: '#38f2ff' }}>{h.ver}</td>
              <td>{h.date}</td>
              <td>{h.author}</td>
              <td>
                <span className={`status-tag ${h.status === '已审核' ? 'ok' : 'info'}`}>
                  {h.status}
                </span>
              </td>
              <td>{h.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function LiveTaskDetailModal({
  task,
  onClose,
}: {
  task: UavTaskDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`任务详情 · ${task.id}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>任务名称</span>
          <strong>{task.name}</strong>
        </div>
        <div className="detail-stat-card">
          <span>巡检对象</span>
          <strong>
            {secLabel(task.sectionId)}·{task.target}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>关联航线</span>
          <strong>{task.routeCode}</strong>
        </div>
      </div>
      <div className="meta-table">
        <div className="meta-row">
          <span className="meta-key">执行设备</span>
          <span className="meta-val">{task.uav}</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">关联机巢</span>
          <span className="meta-val">{task.hangar}</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">检查内容</span>
          <span className="meta-val">{task.checks.join('、')}</span>
        </div>
      </div>
    </ModalShell>
  );
}

export function LiveMarkClueModal({
  defaultWaypoint,
  submitting,
  onSubmit,
  onClose,
}: {
  defaultWaypoint: string;
  submitting: boolean;
  onSubmit: (payload: { title: string; category: string; waypoint: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('疑似材料占道堆放');
  const [category, setCategory] = useState('消防通道占用');
  const [waypoint, setWaypoint] = useState(defaultWaypoint);

  return (
    <ModalShell title="标记巡检疑似隐患线索" onClose={onClose}>
      <div className="m09-form-grid-2" style={{ marginBottom: '12px' }}>
        <div className="m09-form-item" style={{ gridColumn: '1 / -1' }}>
          <span className="m09-form-lbl">线索标题</span>
          <input
            className="m09-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">隐患类别</span>
          <input
            className="m09-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">关联航点</span>
          <input
            className="m09-input"
            value={waypoint}
            onChange={(e) => setWaypoint(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() =>
            void onSubmit({
              title: title.trim() || '疑似现场安全线索',
              category: category.trim() || '消防通道占用',
              waypoint: waypoint.trim() || defaultWaypoint,
            })
          }
        >
          {submitting ? '保存中...' : '保存并推送至隐患识别'}
        </button>
      </div>
    </ModalShell>
  );
}

export function LiveGimbalModal({
  pitch,
  yaw,
  zoom,
  onChange,
  onReset,
  onClose,
}: {
  pitch: number;
  yaw: number;
  zoom: number;
  onChange: (next: { pitch: number; yaw: number; zoom: number }) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="云台相机姿态控制（模拟）" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label className="m09-form-item">
          <span className="m09-form-lbl">
            俯仰角 Pitch (<strong>{pitch}°</strong>)
          </span>
          <input
            type="range"
            min={-90}
            max={0}
            value={pitch}
            onChange={(e) => onChange({ pitch: Number(e.target.value), yaw, zoom })}
          />
        </label>
        <label className="m09-form-item">
          <span className="m09-form-lbl">
            偏航角 Yaw (<strong>{yaw}°</strong>)
          </span>
          <input
            type="range"
            min={-45}
            max={45}
            value={yaw}
            onChange={(e) => onChange({ pitch, yaw: Number(e.target.value), zoom })}
          />
        </label>
        <label className="m09-form-item">
          <span className="m09-form-lbl">
            光学变焦 (<strong>{zoom.toFixed(1)}×</strong>)
          </span>
          <input
            type="range"
            min={1}
            max={2.2}
            step={0.1}
            value={zoom}
            onChange={(e) => onChange({ pitch, yaw, zoom: Number(e.target.value) })}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="m09-btn" onClick={onReset}>
            归中复位
          </button>
          <button type="button" className="m09-btn primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function LiveFullscreenModal({
  taskId,
  imgUrl,
  onClose,
}: {
  taskId: string;
  imgUrl: string;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`全屏实时画面 · ${taskId}`} onClose={onClose}>
      <img
        src={imgUrl}
        alt="全屏实时画面"
        style={{
          width: '100%',
          borderRadius: '8px',
          border: '1px solid rgba(56,189,248,0.4)',
        }}
      />
    </ModalShell>
  );
}

export function LiveRthModal({
  hangar,
  onConfirm,
  onClose,
}: {
  hangar: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="确认一键返航指令" onClose={onClose}>
      <p style={{ fontSize: '13px', color: '#e6f2ff', margin: '0 0 14px' }}>
        是否向 <strong>无人机A01</strong> 发送安全返航（RTH）指令？无人机将沿预设安全高度返回{' '}
        <strong>{hangar}</strong>。
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button type="button" className="m09-btn primary" onClick={onConfirm}>
          确认立即返航
        </button>
      </div>
    </ModalShell>
  );
}

export function LiveTakeoverModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('JIHEI-UAV-01');
  return (
    <ModalShell title="申请远程人工接管" onClose={onClose}>
      <div style={{ fontSize: '12.5px', color: '#fde68a', marginBottom: '10px' }}>
        人工接管将切换为摇杆/指点飞行模式，需校验飞手资质授权码：
      </div>
      <div className="m09-form-item" style={{ marginBottom: '12px' }}>
        <span className="m09-form-lbl">接管口令（默认：JIHEI-UAV-01）</span>
        <input
          className="m09-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          className="m09-btn gold"
          onClick={() => onConfirm(code)}
        >
          验证并接管控制权
        </button>
      </div>
    </ModalShell>
  );
}

export function LiveEventsModal({
  taskId,
  events,
  onClose,
}: {
  taskId: string;
  events: UavLiveEventDTO[];
  onClose: () => void;
}) {
  return (
    <ModalShell title={`飞行事件日志 · ${taskId}`} onClose={onClose}>
      <table className="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>事件记录</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td style={{ color: '#38f2ff', fontWeight: 700 }}>{ev.eventTime}</td>
              <td>{ev.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function ClueFullImageModal({
  clue,
  onClose,
}: {
  clue: UavClueDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`原始高清取证影像 · ${clue.imgName}`} onClose={onClose}>
      <img
        src={`/assets/${clue.imgSrc || 'milestone_before.jpg'}`}
        alt={clue.title}
        style={{
          width: '100%',
          borderRadius: '8px',
          border: '1px solid rgba(56,189,248,0.4)',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#bae6fd',
          marginTop: '8px',
        }}
      >
        <span>
          {clue.location} · {clue.waypoint}
        </span>
        <span>{clue.foundTime}</span>
      </div>
    </ModalShell>
  );
}

export function ClueLocateMapModal({
  clue,
  onClose,
  onJumpRoutes,
}: {
  clue: UavClueDTO;
  onClose: () => void;
  onJumpRoutes: () => void;
}) {
  return (
    <ModalShell title={`线索点位三维定位 · ${clue.id}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>工程位置</span>
          <strong>{clue.location}</strong>
        </div>
        <div className="detail-stat-card">
          <span>关联航点</span>
          <strong>{clue.waypoint}</strong>
        </div>
        <div className="detail-stat-card">
          <span>坐标示意</span>
          <strong>126.1152°E, 47.5105°N</strong>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
        <button
          type="button"
          className="m09-btn primary"
          onClick={() => {
            onClose();
            onJumpRoutes();
          }}
        >
          前往三维航线地图查看
        </button>
      </div>
    </ModalShell>
  );
}

export function LinkedSafetyLedgerModal({
  onClose,
  onJumpSafety,
}: {
  onClose: () => void;
  onJumpSafety: () => void;
}) {
  return (
    <ModalShell title="关联安全台账 · AQ-202611-018" onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>隐患编号</span>
          <strong>AQ-202611-018</strong>
        </div>
        <div className="detail-stat-card">
          <span>隐患名称</span>
          <strong>临边防护缺失</strong>
        </div>
        <div className="detail-stat-card">
          <span>当前状态</span>
          <strong style={{ color: '#facc15' }}>待复查</strong>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
        <button
          type="button"
          className="m09-btn primary"
          onClick={() => {
            onClose();
            onJumpSafety();
          }}
        >
          进入「安全管理」台账
        </button>
      </div>
    </ModalShell>
  );
}

export function LinkDuplicateModal({
  clue,
  options,
  submitting,
  onConfirm,
  onClose,
}: {
  clue: UavClueDTO;
  options: LinkedSafetyOption[];
  submitting: boolean;
  onConfirm: (hazardId: string) => Promise<void>;
  onClose: () => void;
}) {
  const displayOptions =
    options.length > 0
      ? options.slice(0, 5)
      : [
          {
            id: 'AQ-202611-018',
            description: '二工区桥梁2号墩临边防护缺失',
            location: '二工区',
            status: '待复查',
          },
          {
            id: 'AQ-202611-041',
            description: '二工区料场A消防通道占用',
            location: '二工区',
            status: '待派发',
          },
          {
            id: 'AQ-202611-021',
            description: '一工区保通段导改水马偏移',
            location: '一工区',
            status: '已销项',
          },
        ];

  const [picked, setPicked] = useState(displayOptions[0]?.id ?? 'AQ-202611-018');

  return (
    <ModalShell title={`关联已有安全隐患 · ${clue.id}`} onClose={onClose}>
      <div style={{ fontSize: '12.5px', color: '#bae6fd', marginBottom: '10px' }}>
        请选择要关联归并的现有安全管理台账记录：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
        {displayOptions.map((item) => (
          <label
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '7px',
              background: 'rgba(12,42,92,0.58)',
              border: '1px solid rgba(56,189,248,0.28)',
              cursor: 'pointer',
              fontSize: '12.5px',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="m09LinkAq"
                value={item.id}
                checked={picked === item.id}
                onChange={() => setPicked(item.id)}
                style={{ accentColor: '#38f2ff' }}
              />
              <span>
                {item.id} · {item.description}
              </span>
            </span>
            <span className={`status-tag ${statusTagClass(item.status)}`}>{item.status}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() => void onConfirm(picked)}
        >
          {submitting ? '关联中...' : '确认关联为重复线索'}
        </button>
      </div>
    </ModalShell>
  );
}

export function A4ReportSheet({
  report,
  pageNo,
}: {
  report: UavReportDTO;
  pageNo: 1 | 2;
}) {
  if (pageNo === 2) {
    return (
      <div className="m09-a4-sheet">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#64748b',
            fontSize: '11.5px',
          }}
        >
          <span>吉黑高速明水至北安段</span>
          <span>第 2 页 / 共 2 页</span>
        </div>
        <div className="m09-a4-title">{report.title} · 飞行与取证附表</div>
        <div className="m09-a4-sec-h">三、飞行参数与航点取证清单</div>
        <table className="m09-a4-meta">
          <tbody>
            <tr>
              <td className="k">航点序号</td>
              <td className="k">部位名称</td>
              <td className="k">相对航高</td>
              <td className="k">采集影像</td>
            </tr>
            <tr>
              <td>WP-01</td>
              <td>起降点与机巢核验</td>
              <td>30 m</td>
              <td>2 张全景</td>
            </tr>
            <tr>
              <td>WP-03</td>
              <td>{report.location}</td>
              <td>42 m</td>
              <td>{report.mediaSummary}</td>
            </tr>
            <tr>
              <td>WP-07</td>
              <td>同点位复查核验区</td>
              <td>40 m</td>
              <td>同角度对比影像</td>
            </tr>
          </tbody>
        </table>
        <div className="m09-a4-sec-h">四、核查意见与归档签章</div>
        <p style={{ margin: '4px 0 8px' }}>
          本报告由无人机巡检子系统自动汇总飞行轨迹、遥测参数及人工核查结论生成。
        </p>
        <div className="m09-a4-note">
          归档校验码：JH-{report.id.slice(-8)} · 归档时间：{report.archiveTime}
        </div>
      </div>
    );
  }

  return (
    <div className="m09-a4-sheet">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#64748b',
          fontSize: '11.5px',
        }}
      >
        <span>吉黑高速明水至北安段</span>
        <span>报告示意</span>
      </div>
      <div className="m09-a4-title">{report.title}</div>
      <table className="m09-a4-meta">
        <tbody>
          <tr>
            <td className="k">报告编号</td>
            <td>{report.id}</td>
            <td className="k">关联任务</td>
            <td>{report.taskId}</td>
          </tr>
          <tr>
            <td className="k">复查位置</td>
            <td>{report.location}</td>
            <td className="k">复查日期</td>
            <td>{report.reportDate}</td>
          </tr>
          <tr>
            <td className="k">新采影像</td>
            <td>{report.mediaSummary}</td>
            <td className="k">原巡检任务</td>
            <td>{report.origTaskId}</td>
          </tr>
        </tbody>
      </table>
      <div className="m09-a4-sec-h">一、复查概况</div>
      <p style={{ margin: '4px 0 10px', color: '#334155' }}>{report.summary}</p>
      <div className="m09-a4-sec-h">二、关联隐患与证据</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: '12px',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
          <div>
            <span style={{ color: '#64748b' }}>关联隐患</span> &nbsp;{' '}
            <strong>{report.hazardId}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>问题描述</span> &nbsp;{' '}
            <strong>{report.hazardDesc}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>复查取证</span> &nbsp;{' '}
            {report.recheckEvidence}
          </div>
          <div>
            <span style={{ color: '#64748b' }}>办理状态</span> &nbsp;{' '}
            <strong style={{ color: '#b45309' }}>{report.handleStatus}</strong>
          </div>
        </div>
        <img
          src="/assets/milestone_after.jpg"
          alt="复查影像"
          style={{
            width: '100%',
            height: '112px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
          }}
        />
      </div>
      <div className="m09-a4-note">
        原巡检与复查影像已随报告归档，隐患办理状态以安全管理台账为准。
      </div>
    </div>
  );
}

export function ReportPdfModal({
  report,
  onDownload,
  onClose,
}: {
  report: UavReportDTO;
  onDownload: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`导出巡检报告 PDF · ${report.id}`} onClose={onClose}>
      <div style={{ maxHeight: '62vh', overflowY: 'auto', marginBottom: '12px' }}>
        <A4ReportSheet report={report} pageNo={1} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={() => window.print()}>
          浏览器打印 / 另存为 PDF
        </button>
        <button type="button" className="m09-btn primary" onClick={onDownload}>
          立即下载文档
        </button>
      </div>
    </ModalShell>
  );
}

export function ReportCompareModal({
  report,
  onClose,
}: {
  report: UavReportDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`同点位影像对比 · ${report.hazardId}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#fde68a',
              marginBottom: '6px',
            }}
          >
            原巡检取证（{report.origTime}）
          </div>
          <img
            src="/assets/milestone_before.jpg"
            alt="原巡检取证"
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1.5px solid #facc15',
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#86efac',
              marginBottom: '6px',
            }}
          >
            无人机复查取证（{report.recheckTime}）
          </div>
          <img
            src="/assets/milestone_after.jpg"
            alt="无人机复查取证"
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1.5px solid #22c55e',
            }}
          />
        </div>
      </div>
    </ModalShell>
  );
}

export function NewReportDraftModal({
  tasks,
  submitting,
  onSubmit,
  onClose,
}: {
  tasks: UavTaskDTO[];
  submitting: boolean;
  onSubmit: (payload: {
    title: string;
    taskId: string;
    type: '专项巡检报告' | '全面巡检报告' | '复查报告';
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('二工区料场巡检复核报告（草稿）');
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? 'UAV-20261126-02');
  const [type, setType] = useState<'专项巡检报告' | '全面巡检报告' | '复查报告'>('专项巡检报告');

  return (
    <ModalShell title="生成无人机巡检报告草稿" onClose={onClose}>
      <div className="m09-form-grid-2" style={{ marginBottom: '12px' }}>
        <div className="m09-form-item" style={{ gridColumn: '1 / -1' }}>
          <span className="m09-form-lbl">报告标题</span>
          <input
            className="m09-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">关联任务</span>
          <select
            className="m09-select"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="m09-form-item">
          <span className="m09-form-lbl">报告类型</span>
          <select
            className="m09-select"
            value={type}
            onChange={(e) =>
              setType(e.target.value as '专项巡检报告' | '全面巡检报告' | '复查报告')
            }
          >
            <option value="专项巡检报告">专项巡检报告</option>
            <option value="全面巡检报告">全面巡检报告</option>
            <option value="复查报告">复查报告</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" className="m09-btn" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="m09-btn primary"
          disabled={submitting}
          onClick={() =>
            void onSubmit({
              title: title.trim() || '新建巡检报告草稿',
              taskId,
              type,
            })
          }
        >
          {submitting ? '生成中...' : '生成报告草稿'}
        </button>
      </div>
    </ModalShell>
  );
}
