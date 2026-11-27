'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type {
  DirectionKey,
  SpeedAlgoRecordDTO,
  SpeedDirectionMetrics,
  SpeedFeedbackBatchDTO,
  SpeedFeedbackDevice,
  SpeedPilotSegmentDTO,
  SpeedReplayScenarioDTO,
  SpeedStrategyDTO,
} from '../types';
import { formatMinClock } from '../types';
import { drawTrafficCameraFrame } from './SpeedCesiumHelper';

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

export function TrafficVideoModal({
  segment,
  dirData,
  initialTick,
  onClose,
  onGoAlgorithm,
}: {
  segment: SpeedPilotSegmentDTO;
  dirData: SpeedDirectionMetrics;
  initialTick: number;
  onClose: () => void;
  onGoAlgorithm: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let tick = initialTick;
    drawTrafficCameraFrame(canvasRef.current, segment, dirData, tick);
    const timer = window.setInterval(() => {
      tick += 1;
      drawTrafficCameraFrame(canvasRef.current, segment, dirData, tick);
    }, 90);
    return () => window.clearInterval(timer);
  }, [segment, dirData, initialTick]);

  return (
    <ModalShell
      title={`${segment.name} · 路侧实时视频与雷达融合画面（${segment.camId}）`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(56,189,248,0.45)',
            background: '#071426',
          }}
        >
          <canvas
            ref={canvasRef}
            width={660}
            height={290}
            style={{ width: '100%', display: 'block' }}
          />
        </div>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>内侧 / 外侧车速</span>
            <strong>
              {dirData.innerSpeed} / {dirData.outerSpeed} km/h
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>硬路肩识别状态</span>
            <strong
              style={{
                color: dirData.shoulderOccupied ? '#facc15' : '#4ade80',
              }}
            >
              {dirData.shoulderStatus}
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>实测排队 / 流量</span>
            <strong>
              {dirData.queueM} m / {dirData.flow} 辆/h
            </strong>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#b4d2f4',
          }}
        >
          <span>
            桩号位置：{segment.stake}（{segment.sectionName}） · 气象：
            {segment.weather.temp} / 能见度 {segment.weather.vis}
          </span>
          <button
            type="button"
            className="m11-btn-primary"
            onClick={() => {
              onClose();
              onGoAlgorithm();
            }}
          >
            进入算法研判 &gt;
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function AlgoHistoryModal({
  records,
  onClose,
}: {
  records: SpeedAlgoRecordDTO[];
  onClose: () => void;
}) {
  return (
    <ModalShell
      title="专项算法研判历史台账（2026-11-25 ~ 11-26）"
      onClose={onClose}
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>研判编号</th>
            <th>试点区段</th>
            <th>研判类型</th>
            <th>分析时间</th>
            <th>状态识别</th>
            <th>实测/预测队列</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.id}</strong>
              </td>
              <td>{r.segName}</td>
              <td>{r.type}</td>
              <td>{r.fullTime}</td>
              <td>{r.stateDetect}</td>
              <td>
                {r.measuredQueue} m /{' '}
                <span style={{ color: '#c084fc' }}>{r.predictedQueue} m</span>
              </td>
              <td>
                <span
                  className={`status-tag ${r.status === '已生成' ? 'ok' : 'warn'}`}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function StrategyAuditModal({
  strategy,
  direction,
  submitting,
  onSubmit,
  onClose,
}: {
  strategy: SpeedStrategyDTO;
  direction: DirectionKey;
  submitting: boolean;
  onSubmit: (payload: {
    innerSpeed: number;
    outerSpeed: number;
    vmsMessage: string;
    direction: DirectionKey;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [innerSpeed, setInnerSpeed] = useState<number>(strategy.suggestInner);
  const [outerSpeed, setOuterSpeed] = useState<number>(strategy.suggestOuter);
  const [vmsMessage, setVmsMessage] = useState<string>(strategy.vmsMessage);

  const isPending = strategy.auditStatus === '待审核';

  return (
    <ModalShell
      title={`策略审核记录与动态下发 — ${strategy.segName} (${strategy.segId})`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作节点</th>
              <th>审核与执行内容</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {strategy.auditHistory.map((h, idx) => (
              <tr key={`${h.time}-${idx}`}>
                <td>{h.time}</td>
                <td>{h.actor}</td>
                <td>{h.action}</td>
                <td>
                  <span
                    className={`status-tag ${h.result.includes('待') ? 'warn' : 'ok'}`}
                  >
                    {h.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="m11-sub-box">
          <div className="m11-sub-box-hdr">
            <span>动态限速策略审核下发（{strategy.latestStrategyId}）</span>
            <span className={isPending ? 'm11-pill-warn' : 'm11-pill-ok'}>
              {strategy.auditStatus}
            </span>
          </div>
          <div className="m11-modal-form-grid">
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#9ec4ea',
                  marginBottom: '4px',
                }}
              >
                内侧车道下发限速 (km/h)
              </div>
              <select
                className="m11-modal-input"
                value={innerSpeed}
                onChange={(e) => setInnerSpeed(Number.parseInt(e.target.value, 10))}
              >
                {[50, 60, 70, 80].map((v) => (
                  <option key={v} value={v}>
                    {v} km/h
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#9ec4ea',
                  marginBottom: '4px',
                }}
              >
                外侧车道下发限速 (km/h)
              </div>
              <select
                className="m11-modal-input"
                value={outerSpeed}
                onChange={(e) => setOuterSpeed(Number.parseInt(e.target.value, 10))}
              >
                {[50, 60, 70, 80].map((v) => (
                  <option key={v} value={v}>
                    {v} km/h
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                fontSize: '11.5px',
                color: '#9ec4ea',
                marginBottom: '4px',
              }}
            >
              情报板同步警示内容
            </div>
            <input
              type="text"
              className="m11-modal-input"
              value={vmsMessage}
              onChange={(e) => setVmsMessage(e.target.value)}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <button type="button" className="m11-btn-ghost" onClick={onClose}>
              关闭
            </button>
            <button
              type="button"
              className="m11-btn-primary"
              disabled={submitting}
              onClick={() =>
                void onSubmit({
                  innerSpeed,
                  outerSpeed,
                  vmsMessage: vmsMessage.trim() || strategy.vmsMessage,
                  direction,
                })
              }
            >
              {submitting ? '提交中...' : '审核通过并下发限速指令'}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export function FeedbackHistoryModal({
  batches,
  onSelectBatch,
  onClose,
}: {
  batches: SpeedFeedbackBatchDTO[];
  onSelectBatch: (batchId: string, segId: string) => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="信息发布批次历史记录" onClose={onClose}>
      <table className="data-table">
        <thead>
          <tr>
            <th>发布批次</th>
            <th>试点区段</th>
            <th>关联策略</th>
            <th>下发时间</th>
            <th>成功 / 异常</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => {
            const okN = b.devices.filter((d) => d.status === '回执成功').length;
            const errN = b.devices.length - okN;
            return (
              <tr key={b.batchId}>
                <td>
                  <strong>{b.batchId}</strong>
                </td>
                <td>{b.segName}</td>
                <td>{b.strategyId}</td>
                <td>{b.publishTime}</td>
                <td>
                  <span className="status-tag ok">{okN} 成功</span>{' '}
                  {errN > 0 ? (
                    <span className="status-tag warn">{errN} 异常</span>
                  ) : null}
                </td>
                <td>
                  <button
                    type="button"
                    className="m11-hud-link"
                    onClick={() => {
                      onSelectBatch(b.batchId, b.segId);
                      onClose();
                    }}
                  >
                    切至该批次
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function FeedbackBatchModal({
  batch,
  selectedDevice,
  submitting,
  onRetry,
  onClose,
}: {
  batch: SpeedFeedbackBatchDTO;
  selectedDevice: SpeedFeedbackDevice;
  submitting: boolean;
  onRetry: (batchId: string, deviceId: string) => Promise<void>;
  onClose: () => void;
}) {
  const hasErr = selectedDevice.status !== '回执成功';

  return (
    <ModalShell
      title={`发布批次指令核查与补发 — ${batch.batchId}`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>关联试点区段</span>
            <strong>{batch.segName}</strong>
          </div>
          <div className="detail-stat-card">
            <span>关联策略编号</span>
            <strong>{batch.strategyId}</strong>
          </div>
          <div className="detail-stat-card">
            <span>下发时间</span>
            <strong>{batch.publishTime}</strong>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>设备编号</th>
              <th>设备类型</th>
              <th>指令内容</th>
              <th>回执状态</th>
              <th>回执时间</th>
            </tr>
          </thead>
          <tbody>
            {batch.devices.map((d) => (
              <tr key={d.id}>
                <td>
                  <strong>{d.id}</strong>
                </td>
                <td>{d.type}</td>
                <td>{d.cmd}</td>
                <td>
                  <span
                    className={`status-tag ${d.status === '回执成功' ? 'ok' : 'warn'}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td>{d.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasErr ? (
          <div
            className="m11-sub-box"
            style={{ borderColor: 'rgba(250,204,21,0.55)' }}
          >
            <div
              style={{
                fontSize: '12.5px',
                color: '#fde047',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              异常处理建议（{selectedDevice.id}）
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#dbeafe',
                marginBottom: '10px',
              }}
            >
              检测到 4G/RS-485 链路首轮握手超时（{selectedDevice.exceptionTime}
              ），建议通过备用光纤通道重新下发当前批次情报板指令。
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="m11-btn-ghost"
                onClick={onClose}
              >
                取消
              </button>
              <button
                type="button"
                className="m11-btn-primary"
                disabled={submitting}
                onClick={() => void onRetry(batch.batchId, selectedDevice.id)}
              >
                {submitting
                  ? '补发中...'
                  : `重新下发指令至 ${selectedDevice.id}`}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="m11-btn-primary"
              onClick={onClose}
            >
              确认关闭
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export function FeedbackLogModal({
  batch,
  device,
  onClose,
}: {
  batch: SpeedFeedbackBatchDTO;
  device: SpeedFeedbackDevice;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`设备通信与回执日志 — ${device.id} (${device.name})`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '12px', color: '#b4d2f4' }}>
          发布批次：{batch.batchId} · 当前状态：
          <strong
            style={{
              color: device.status === '回执成功' ? '#4ade80' : '#fca5a5',
            }}
          >
            {device.status}
          </strong>
        </div>
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: '#040f24',
            border: '1px solid rgba(56,189,248,0.3)',
            fontFamily: 'Consolas, monospace',
            fontSize: '12px',
            lineHeight: 1.7,
            color: '#cce6ff',
          }}
        >
          {device.logs.map((line, i) => (
            <div key={`${i}-${line.slice(0, 12)}`}>{line}</div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

export function ReplayLinkedModal({
  scenario,
  currentMin,
  onClose,
  onGoAlgorithm,
  onGoFeedback,
}: {
  scenario: SpeedReplayScenarioDTO;
  currentMin: number;
  onClose: () => void;
  onGoAlgorithm: () => void;
  onGoFeedback: () => void;
}) {
  const latestClock = formatMinClock(scenario.xTicks, currentMin);

  return (
    <ModalShell
      title={`关联业务闭环记录 — ${scenario.title} (${scenario.id})`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>回放区段</span>
            <strong>{scenario.segName}</strong>
          </div>
          <div className="detail-stat-card">
            <span>场景类型</span>
            <strong>{scenario.mode}</strong>
          </div>
          <div className="detail-stat-card">
            <span>当前回放时点</span>
            <strong>{latestClock}</strong>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>发生时间</th>
              <th>事件节点</th>
              <th>关联闭环说明</th>
            </tr>
          </thead>
          <tbody>
            {scenario.timeline.map((st, idx) => (
              <tr key={`${st.clock}-${idx}`}>
                <td>
                  <strong>{st.clock}</strong>
                </td>
                <td>{st.title}</td>
                <td>{st.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            className="m11-btn-ghost"
            onClick={() => {
              onClose();
              onGoAlgorithm();
            }}
          >
            查看算法研判
          </button>
          <button
            type="button"
            className="m11-btn-primary"
            onClick={() => {
              onClose();
              onGoFeedback();
            }}
          >
            查看执行反馈
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
