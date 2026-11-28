'use client';

import type { UavReportDTO } from '../types';

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
          loading="lazy"
          decoding="async"
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
