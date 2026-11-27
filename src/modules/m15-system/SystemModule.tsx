'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, Server, Sliders, FileText, History, Plus, RefreshCw, Download } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import { usePlatformStore } from '@/lib/store/platform-store';

interface SectionRow {
  id: string;
  name: string;
  stakeRange: string;
  keyWorksCount: number;
  yardsCount: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  department: string;
  sectionScope: string;
  createdAt: string;
}

interface ConfigRow {
  key: string;
  category: string;
  label: string;
  value: Record<string, unknown>;
  updatedBy: string;
  updatedAt: string;
}

interface AuditLogRow {
  id: number;
  userName: string;
  action: string;
  moduleId: string;
  target: string;
  detail: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const SUB_META: Record<string, { title: string; badge: string }> = {
  base: { title: '工程基础资料维护', badge: '工区与重点工程主数据' },
  rbac: { title: '用户与 RBAC 权限管理', badge: 'Better Auth + PostgreSQL 实时持久化' },
  integration: { title: '外部系统接入网关监控', badge: 'BIM / IoT / 无人机 / 天地图 / 视频网关' },
  metrics: { title: '指标口径与考核阈值配置', badge: '工程质量安全核心算法口径' },
  content: { title: '平台与展厅展示内容配置', badge: '大屏标题 / 展厅轮播 / 三维引擎参数' },
  logs: { title: '全平台操作审计日志档案', badge: 'PostgreSQL 审计留痕与 CSV 导出' },
};

export function SystemModule({ subPageId }: { subPageId: string }) {
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [sections, setSections] = useState<SectionRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Create user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('Jihei@2026');
  const [newRole, setNewRole] = useState<'admin' | 'engineer' | 'supervisor' | 'viewer'>('engineer');
  const [newDept, setNewDept] = useState('二工区项目部');

  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [baseRes, userRes, cfgRes, logRes] = await Promise.all([
        fetch('/api/system/base'),
        fetch('/api/system/users'),
        fetch('/api/system/configs'),
        fetch('/api/system/logs?limit=60'),
      ]);
      if (baseRes.ok) {
        const d = await baseRes.json();
        setSections(d.workSections ?? []);
      }
      if (userRes.ok) {
        const d = await userRes.json();
        setUsers(d.users ?? []);
      }
      if (cfgRes.ok) {
        const d = await cfgRes.json();
        setConfigs(d.configs ?? []);
      }
      if (logRes.ok) {
        const d = await logRes.json();
        setLogs(d.logs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, [subPageId]);

  const meta = SUB_META[subPageId] ?? SUB_META.base;

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/system/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newEmail,
        name: newName,
        password: newPass,
        role: newRole,
        department: newDept,
        sectionScope: 'all',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || '新增用户失败');
      return;
    }
    setNewEmail('');
    setNewName('');
    showToast(`已新增账号：${data.user.email}`);
    refreshAll();
  }

  async function handleUpdateUser(id: string, patch: Record<string, unknown>) {
    const res = await fetch('/api/system/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || '操作失败');
      return;
    }
    showToast('账号权限状态已更新并写入审计日志');
    refreshAll();
  }

  async function handleSaveContent(cfg: ConfigRow, nextTitle: string, nextSubtitle: string) {
    const res = await fetch('/api/system/configs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: cfg.key,
        category: cfg.category,
        label: cfg.label,
        value: { ...cfg.value, platformTitle: nextTitle, platformSubtitle: nextSubtitle },
      }),
    });
    if (res.ok) {
      showToast('配置已持久化到 PostgreSQL');
      refreshAll();
    } else {
      const d = await res.json();
      showToast(d.error || '保存失败');
    }
  }

  const integrationList =
    ((configs.find((c) => c.key === 'integration.sources')?.value?.items as Array<Record<string, unknown>>) ?? []);
  const metricList =
    ((configs.find((c) => c.key === 'metrics.definitions')?.value?.items as Array<Record<string, unknown>>) ?? []);
  const contentCfg = configs.find((c) => c.key === 'content.platform');

  return (
    <section className="module-stage-host active mode-opaque" id="moduleStageHost">
      <div className="w-full min-h-full p-4 pb-24 flex flex-col gap-3 text-[#f1f7ff]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0a2656]/95 to-[#081e44]/90 border border-cyan-400/35 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-cyan-300/55 text-sky-300 text-xs font-bold">
              <Shield size={14} />
              15. 系统管理
            </span>
            <h2 className="text-sm font-bold text-white">{meta.title}</h2>
            <span className="text-xs text-sky-300/80">{meta.badge}</span>
          </div>
          <button
            type="button"
            className="dock-btn"
            onClick={() => refreshAll()}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>刷新实时库数据</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="纳管施工工区" value={sections.length || 6} unit="个" trend="全线 146.8 km" />
          <KpiCard label="平台注册用户" value={users.length} unit="人" tone="green" trend="Better Auth" />
          <KpiCard label="在线接入网关" value={integrationList.length || 5} unit="套" />
          <KpiCard label="审计日志留痕" value={logs.length} unit="条" tone="gold" trend="PostgreSQL" />
        </div>

        {subPageId === 'base' ? (
          <GlassPanel title="全线工区基础台账（PostgreSQL 实时维护）">
            <DataTable
              rows={sections}
              rowKey={(r) => r.id}
              columns={[
                { key: 'id', header: '工区编号', width: '100px', render: (r) => <span className="font-mono text-cyan-300">{r.id}</span> },
                { key: 'name', header: '工区名称', render: (r) => <strong>{r.name}</strong> },
                { key: 'stake', header: '起讫桩号范围', render: (r) => r.stakeRange },
                { key: 'kw', header: '重点工程数', render: (r) => `${r.keyWorksCount} 处` },
                { key: 'yd', header: '智慧场站数', render: (r) => `${r.yardsCount} 处` },
                {
                  key: 'op',
                  header: '操作',
                  render: (r) => (
                    <button
                      type="button"
                      className="dock-btn"
                      onClick={async () => {
                        const res = await fetch('/api/system/base', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: r.id, keyWorksCount: r.keyWorksCount + 1 }),
                        });
                        if (res.ok) {
                          showToast(`已递增 ${r.name} 重点工程数量并留痕`);
                          refreshAll();
                        } else {
                          const d = await res.json();
                          showToast(d.error || '无权限或更新失败');
                        }
                      }}
                    >
                      +1 重点工程
                    </button>
                  ),
                },
              ]}
            />
          </GlassPanel>
        ) : null}

        {subPageId === 'rbac' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <GlassPanel title="新增平台账号（写入 Better Auth）" className="xl:col-span-1">
              <form className="space-y-3" onSubmit={handleCreateUser}>
                <div>
                  <label className="block text-xs text-sky-200 mb-1">姓名 / 岗位标识</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：刘伟（三工区总工）"
                    className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none focus:border-cyan-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sky-200 mb-1">登录邮箱</label>
                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@jihei.cn"
                    className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none focus:border-cyan-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-sky-200 mb-1">初始密码</label>
                    <input
                      required
                      minLength={6}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-sky-200 mb-1">RBAC 角色</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as typeof newRole)}
                      className="glass-select h-9"
                    >
                      <option value="admin">admin (管理员)</option>
                      <option value="engineer">engineer (工区总工)</option>
                      <option value="supervisor">supervisor (监理)</option>
                      <option value="viewer">viewer (展厅访客)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-sky-200 mb-1">所属部门 / 工区</label>
                  <input
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary-glow">
                  <Plus size={14} />
                  <span>创建并授权账号</span>
                </button>
              </form>
            </GlassPanel>

            <GlassPanel title="平台用户与角色权限列表" className="xl:col-span-2">
              <DataTable
                rows={users}
                rowKey={(u) => u.id}
                columns={[
                  { key: 'name', header: '姓名', render: (u) => <strong>{u.name}</strong> },
                  { key: 'email', header: '账号', render: (u) => <span className="font-mono text-xs text-sky-200">{u.email}</span> },
                  { key: 'dept', header: '部门', render: (u) => u.department },
                  {
                    key: 'role',
                    header: '角色',
                    render: (u) => (
                      <select
                        className="glass-select py-1 text-xs"
                        value={u.role || 'viewer'}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                      >
                        <option value="admin">admin</option>
                        <option value="engineer">engineer</option>
                        <option value="supervisor">supervisor</option>
                        <option value="viewer">viewer</option>
                      </select>
                    ),
                  },
                  {
                    key: 'status',
                    header: '状态',
                    render: (u) => (
                      <StatusBadge text={u.banned ? '已禁用' : '正常'} tone={u.banned ? 'danger' : 'ok'} />
                    ),
                  },
                  {
                    key: 'op',
                    header: '启停操作',
                    render: (u) => (
                      <button
                        type="button"
                        className="dock-btn"
                        onClick={() => handleUpdateUser(u.id, { banned: !u.banned })}
                      >
                        {u.banned ? '启用' : '禁用'}
                      </button>
                    ),
                  },
                ]}
              />
            </GlassPanel>
          </div>
        ) : null}

        {subPageId === 'integration' ? (
          <GlassPanel title="外部物联网与空间服务接入清单">
            <DataTable
              rows={integrationList}
              rowKey={(r, i) => String(r.id ?? i)}
              columns={[
                { key: 'name', header: '接入系统名称', render: (r) => <strong>{String(r.name)}</strong> },
                { key: 'proto', header: '通信协议', render: (r) => <StatusBadge text={String(r.protocol)} tone="info" /> },
                { key: 'endpoint', header: '服务地址', render: (r) => <span className="font-mono text-xs">{String(r.endpoint)}</span> },
                { key: 'latency', header: '响应延迟', render: (r) => `${String(r.latencyMs)} ms` },
                { key: 'freq', header: '同步频率', render: (r) => String(r.syncFreq) },
                {
                  key: 'st',
                  header: '运行状态',
                  render: (r) => (
                    <StatusBadge text={r.status === 'online' ? '在线正常' : '轻微抖动'} tone={r.status === 'online' ? 'ok' : 'warn'} />
                  ),
                },
              ]}
            />
          </GlassPanel>
        ) : null}

        {subPageId === 'metrics' ? (
          <GlassPanel title="全平台核心业务指标统计口径">
            <DataTable
              rows={metricList}
              rowKey={(r, i) => String(r.code ?? i)}
              columns={[
                { key: 'code', header: '口径编码', render: (r) => <span className="font-mono text-cyan-300">{String(r.code)}</span> },
                { key: 'name', header: '指标名称', render: (r) => <strong>{String(r.name)}</strong> },
                { key: 'formula', header: '计算公式', render: (r) => <span className="text-xs text-sky-100">{String(r.formula)}</span> },
                { key: 'threshold', header: '预警阈值', render: (r) => <StatusBadge text={String(r.threshold)} tone="info" /> },
                { key: 'owner', header: '归口部门', render: (r) => String(r.owner) },
              ]}
            />
          </GlassPanel>
        ) : null}

        {subPageId === 'content' ? (
          <ContentConfigPanel config={contentCfg} onSave={handleSaveContent} />
        ) : null}

        {subPageId === 'logs' ? (
          <GlassPanel
            title="系统审计日志档案"
            headerRight={
              <button
                type="button"
                className="dock-btn"
                onClick={() => {
                  const csv = [
                    'ID,时间,操作人,模块,动作,目标,IP',
                    ...logs.map((l) => `${l.id},${l.createdAt},${l.userName},${l.moduleId},${l.action},${l.target},${l.ipAddress ?? ''}`),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `jihei-audit-logs-${Date.now()}.csv`;
                  a.click();
                }}
              >
                <Download size={13} />
                <span>导出 CSV</span>
              </button>
            }
          >
            <DataTable
              rows={logs}
              rowKey={(l) => String(l.id)}
              columns={[
                { key: 'id', header: '序号', width: '70px', render: (l) => l.id },
                { key: 'time', header: '时间', render: (l) => <span className="text-xs font-mono">{new Date(l.createdAt).toLocaleString('zh-CN')}</span> },
                { key: 'user', header: '操作人', render: (l) => l.userName },
                { key: 'action', header: '动作', render: (l) => <StatusBadge text={l.action} tone="info" /> },
                { key: 'target', header: '操作对象', render: (l) => l.target },
                { key: 'ip', header: '来源 IP', render: (l) => <span className="font-mono text-xs">{l.ipAddress || '127.0.0.1'}</span> },
              ]}
            />
          </GlassPanel>
        ) : null}
      </div>
    </section>
  );
}

function ContentConfigPanel({
  config,
  onSave,
}: {
  config?: ConfigRow;
  onSave: (cfg: ConfigRow, t: string, s: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(String(config?.value?.platformTitle ?? 'G1211吉黑高速明水至北安段'));
  const [subtitle, setSubtitle] = useState(String(config?.value?.platformSubtitle ?? '工程建设项目综合管理平台'));

  useEffect(() => {
    if (config?.value) {
      setTitle(String(config.value.platformTitle ?? 'G1211吉黑高速明水至北安段'));
      setSubtitle(String(config.value.platformSubtitle ?? '工程建设项目综合管理平台'));
    }
  }, [config]);

  return (
    <GlassPanel title="平台与展厅展示内容配置（PostgreSQL 持久化）">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label className="block text-xs text-sky-200 mb-1.5">平台主标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-sky-200 mb-1.5">平台副标题</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-[#06183a] border border-sky-400/40 text-xs text-white outline-none"
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="dock-btn primary"
          onClick={() => config && onSave(config, title, subtitle)}
        >
          <Sliders size={14} />
          <span>保存配置到数据库</span>
        </button>
      </div>
    </GlassPanel>
  );
}
