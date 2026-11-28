'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Bot, Sparkles, Send, Plus, Trash2, MapPin, Navigation, Cpu } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

interface ThreadRow {
  id: string;
  scenario: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
}

interface StoredMsg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<Record<string, unknown>>;
}

const SCENARIO_CONFIG: Record<
  string,
  {
    name: string;
    subtitle: string;
    contextBadge: string;
    quickPrompts: string[];
    sandboxViews: Array<{ id: string; title: string; stake: string; desc: string; targetType: 'section' | 'poi'; targetId: string; img: string }>;
  }
> = {
  exhibition: {
    name: '展厅讲解',
    subtitle: '语音导览与沙盘视角联动',
    contextBadge: '平安工地 / 展厅汇报',
    quickPrompts: [
      '介绍一下明北段工程与二工区场站情况',
      '查询桥梁示例A建设进展并飞抵查看',
      '本月有哪些重点关键节点？',
    ],
    sandboxViews: [
      { id: 'sv-1', title: '二工区全段俯视', stake: 'K24+500 ~ K48+200', desc: '二工区走廊与重点场站群', targetType: 'section', targetId: 'sec2', img: '/assets/corridor_aerial.jpg' },
      { id: 'sv-2', title: '桥梁示例A 主跨架设', stake: 'K34+280', desc: '预制箱梁 56/80 片架设现场', targetType: 'poi', targetId: 'bridgeA', img: '/assets/milestone_after.jpg' },
      { id: 'sv-3', title: '梁场示例A 智慧生产区', stake: 'K35+120', desc: '智能张拉与压浆标准化示范', targetType: 'poi', targetId: 'beamYardA', img: '/assets/showcase_viaduct.jpg' },
    ],
  },
  analysis: {
    name: '管理研判',
    subtitle: '多维工程数据查库与风险分析',
    contextBadge: '进度 / 质量 / 安全协同',
    quickPrompts: [
      '对比全线一至六工区当前进度情况',
      '列出当前待协同处置的重点问题清单',
      '分析二工区质量与安全指标表现',
    ],
    sandboxViews: [
      { id: 'sv-a1', title: '一工区起点段', stake: 'BK0+000', desc: '路基交验与底基层施工', targetType: 'section', targetId: 'sec1', img: '/assets/corridor_aerial.jpg' },
      { id: 'sv-a2', title: '拌合站示例A', stake: 'K33+860', desc: 'C50 混凝土配合比动态监测', targetType: 'poi', targetId: 'batchPlantA', img: '/assets/showcase_viaduct.jpg' },
    ],
  },
  field: {
    name: '一线办理',
    subtitle: '现场协同处置与业务模块直达',
    contextBadge: '移动端 / 现场工程师',
    quickPrompts: [
      '打开进度管理模块查看进度报表',
      '二工区拌合站温控校准事项详情',
      '切换至黑土地保护遥感影像对比',
    ],
    sandboxViews: [
      { id: 'sv-f1', title: '桥梁示例A 作业面', stake: 'K34+280', desc: '01号摄像机在线盯控', targetType: 'poi', targetId: 'bridgeA', img: '/assets/milestone_after.jpg' },
      { id: 'sv-f2', title: '四工区跨河中桥', stake: 'K72+800 ~ K96+000', desc: '本月重点盯控盖梁浇筑', targetType: 'section', targetId: 'sec4', img: '/assets/milestone_before.jpg' },
    ],
  },
};

export function AiWorkbenchModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const scenario = SCENARIO_CONFIG[subPageId] ? subPageId : 'exhibition';
  const cfg = SCENARIO_CONFIG[scenario];

  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setSelectedPoiId = usePlatformStore((s) => s.setSelectedPoiId);
  const showToast = usePlatformStore((s) => s.showToast);

  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, StoredMsg[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [providerLabel, setProviderLabel] = useState('检测模型配置中...');
  const [providerMode, setProviderMode] = useState<string>('local-db-fallback');
  const [input, setInput] = useState('');

  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode]);

  useEffect(() => {
    fetch('/api/ai/provider-info')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setProviderLabel(d.modelLabel);
          setProviderMode(d.mode);
        }
      })
      .catch(() => {});
  }, []);

  async function loadThreads(targetScenario: string) {
    const res = await fetch(`/api/ai/threads?scenario=${encodeURIComponent(targetScenario)}`);
    if (!res.ok) return;
    const d = await res.json();
    const list: ThreadRow[] = d.threads ?? [];
    setThreads(list);
    setMessagesByThread(d.messagesByThread ?? {});
    if (list.length) {
      setActiveThreadId((prev) => (list.some((t) => t.id === prev) ? prev : list[0].id));
    } else {
      setActiveThreadId('');
    }
  }

  useEffect(() => {
    loadThreads(scenario);
  }, [scenario]);

  const initialMessages = useMemo<UIMessage[]>(() => {
    const raw = messagesByThread[activeThreadId] ?? [];
    return raw.map((m) => ({
      id: m.id,
      role: m.role,
      parts: (m.parts as UIMessage['parts']) ?? [{ type: 'text', text: '' }],
    }));
  }, [activeThreadId, messagesByThread]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: { scenario, threadId: activeThreadId || undefined },
      }),
    [activeThreadId, scenario]
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    id: activeThreadId || `sc-${scenario}`,
    transport,
    messages: initialMessages,
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  const isBusy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    for (const part of last.parts) {
      if (part.type.startsWith('tool-') && 'output' in part && part.output && typeof part.output === 'object') {
        const out = part.output as Record<string, unknown>;
        if (out.clientAction === 'flyCesium') {
          const ces = getGlobalCesiumEngine();
          if (out.targetType === 'section' && typeof out.targetId === 'string') {
            setActiveSectionId(out.targetId);
            if (ces.ready) ces.flyToSection(out.targetId);
          } else if (out.targetType === 'poi' && typeof out.targetId === 'string') {
            setSelectedPoiId(out.targetId);
            if (ces.ready) ces.flyToPoi(out.targetId);
          }
        } else if (out.clientAction === 'navigateModule' && typeof out.moduleId === 'string') {
          router.push(`/${out.moduleId}/${typeof out.subPageId === 'string' ? out.subPageId : 'overview'}`);
        }
      }
    }
  }, [messages, router, setActiveSectionId, setSelectedPoiId]);

  async function handleNewThread() {
    const res = await fetch('/api/ai/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario,
        title: `${cfg.name}新会话 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      await loadThreads(scenario);
      if (d.thread?.id) setActiveThreadId(d.thread.id);
    }
  }

  async function handleDeleteThread(id: string) {
    await fetch(`/api/ai/threads?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadThreads(scenario);
  }

  function handleSend(text: string) {
    const t = text.trim();
    if (!t || isBusy) return;
    if (t.includes('进度管理')) router.push('/progress/report');
    else if (t.includes('黑土地')) router.push('/blacksoil/compare');
    sendMessage({ text: t });
  }

  return (
    <section className="module-stage-host active mode-opaque" id="moduleStageHost">
      <div className="w-full h-full p-4 pb-6 flex flex-col gap-3 text-[#f1f7ff]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0a2656]/95 to-[#081e44]/90 border border-cyan-400/35">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-300/55 text-cyan-300 text-xs font-bold">
              <Bot size={14} />
              16. AI助手 · {cfg.name}
            </span>
            <span className="text-xs text-sky-200">{cfg.subtitle}</span>
            <StatusBadge text={cfg.contextBadge} tone="info" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Cpu size={14} className="text-cyan-300" />
            <span className="text-sky-200">{providerLabel}</span>
            <StatusBadge
              text={providerMode === 'local-db-fallback' ? '内置查库模式' : '实时大模型'}
              tone={providerMode === 'local-db-fallback' ? 'warn' : 'ok'}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Threads & Quick Prompts */}
          <GlassPanel
            title="会话列表"
            className="lg:col-span-3 flex flex-col min-h-0"
            bodyClassName="flex flex-col gap-2.5 overflow-y-auto min-h-0"
            headerRight={
              <button type="button" className="dock-btn primary" onClick={handleNewThread}>
                <Plus size={12} />
                <span>新建</span>
              </button>
            }
          >
            <div className="space-y-1.5">
              {threads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${
                    t.id === activeThreadId
                      ? 'bg-sky-500/25 border-cyan-300/70 text-white'
                      : 'bg-sky-950/60 border-sky-400/25 text-sky-200 hover:border-sky-300/50'
                  }`}
                >
                  <span className="truncate font-medium">{t.title}</span>
                  <button
                    type="button"
                    className="opacity-70 hover:opacity-100 text-sky-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThread(t.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-sky-400/20">
              <div className="text-[11.5px] font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>场景快捷指令</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cfg.quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="text-left px-2.5 py-2 rounded-lg bg-[#092452]/80 border border-sky-400/30 hover:border-cyan-300 text-xs text-sky-100 cursor-pointer"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Center Chat Stream */}
          <GlassPanel
            title="智能交互工作区"
            subtitle="Vercel AI SDK 流式输出"
            className="lg:col-span-6 flex flex-col min-h-0"
            bodyClassName="flex flex-col min-h-0 flex-1"
          >
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 mb-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed border ${
                      m.role === 'user'
                        ? 'bg-gradient-to-b from-blue-600/85 to-blue-700/85 border-sky-300/60 text-white'
                        : 'bg-[#0b2a5c]/85 border-cyan-400/35 text-sky-50'
                    }`}
                  >
                    {m.parts.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <div key={`${m.id}-${i}`} className="whitespace-pre-wrap">
                            {part.text}
                          </div>
                        );
                      }
                      if (part.type.startsWith('tool-')) {
                        return (
                          <div
                            key={`${m.id}-${i}`}
                            className="mt-2 p-2 rounded-lg bg-[#051838]/90 border border-cyan-400/35 text-xs text-cyan-200"
                          >
                            <div className="font-semibold mb-1">
                              调用工程工具：{part.type.replace('tool-', '')}
                            </div>
                            {'output' in part && part.output ? (
                              <pre className="text-[11px] text-sky-200 overflow-x-auto max-h-32">
                                {JSON.stringify(part.output, null, 2)}
                              </pre>
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>

            <form
              className="flex items-center gap-2 pt-2 border-t border-sky-400/25"
              onSubmit={(e) => {
                e.preventDefault();
                const val = input;
                setInput('');
                handleSend(val);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`在「${cfg.name}」场景提问，支持查库与三维联动...`}
                className="flex-1 h-10 px-3.5 rounded-lg bg-[#06183a] border border-sky-400/45 text-sm text-white outline-none focus:border-cyan-300"
              />
              <button
                type="submit"
                disabled={isBusy}
                className="h-10 px-4 rounded-lg bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-300/60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Send size={13} />
                <span>{isBusy ? '生成中' : '发送'}</span>
              </button>
            </form>
          </GlassPanel>

          {/* Right Sandbox Views */}
          <GlassPanel
            title="沙盘联动视角"
            className="lg:col-span-3 flex flex-col min-h-0"
            bodyClassName="space-y-3 overflow-y-auto min-h-0"
          >
            {cfg.sandboxViews.map((sv) => (
              <div
                key={sv.id}
                className="rounded-xl overflow-hidden border border-sky-400/30 bg-[#092350]/75"
              >
                <img src={sv.img} alt={sv.title} loading="lazy" decoding="async" className="w-full h-24 object-cover" />
                <div className="p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-white">{sv.title}</strong>
                    <span className="text-[10.5px] text-cyan-300 font-mono">{sv.stake}</span>
                  </div>
                  <p className="text-[11px] text-sky-200/85 mt-1 mb-2">{sv.desc}</p>
                  <button
                    type="button"
                    className="dock-btn primary w-full justify-center"
                    onClick={() => {
                      const ces = getGlobalCesiumEngine();
                      if (sv.targetType === 'section') {
                        setActiveSectionId(sv.targetId);
                        if (ces.ready) ces.flyToSection(sv.targetId);
                      } else {
                        setSelectedPoiId(sv.targetId);
                        if (ces.ready) ces.flyToPoi(sv.targetId);
                      }
                      router.push('/home/overview');
                      showToast(`已联动切换三维视角：${sv.title}`);
                    }}
                  >
                    <Navigation size={12} />
                    <span>飞抵三维实景</span>
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="dock-btn w-full justify-center"
              onClick={() => router.push('/home/overview')}
            >
              <MapPin size={12} />
              <span>返回全线三维沙盘</span>
            </button>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
