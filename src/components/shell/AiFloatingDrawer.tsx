'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { X, Send } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

const WELCOME_MESSAGES: UIMessage[] = [
  {
    id: 'welcome-drawer',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: '您好！我是 G1211吉黑高速建设平台 AI 助手（已接入 PostgreSQL 实时台账）。您可以查询工区进度、关键节点，或指令我联动三维视角与业务模块。',
      },
    ],
  },
];

const QUICK_PROMPTS = [
  { label: '二工区进度', q: '二工区当前进度如何？' },
  { label: '桥梁示例A', q: '桥梁示例A建设详情并飞抵查看' },
  { label: '本月关键节点', q: '本月有哪些关键节点？' },
  { label: '切换里程碑对比', q: '打开建设里程碑对比' },
];

export function AiFloatingDrawer() {
  const router = useRouter();
  const [input, setInput] = useState('');

  const aiDrawerOpen = usePlatformStore((s) => s.aiDrawerOpen);
  const setAiDrawerOpen = usePlatformStore((s) => s.setAiDrawerOpen);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setSelectedPoiId = usePlatformStore((s) => s.setSelectedPoiId);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: { scenario: 'drawer' },
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: WELCOME_MESSAGES,
  });

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

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    // Quick local intent navigation for immediate twin responsiveness
    if (trimmed.includes('里程碑')) router.push('/home/milestone');
    else if (trimmed.includes('二工区')) {
      setActiveSectionId('sec2');
      const ces = getGlobalCesiumEngine();
      if (ces.ready) ces.flyToSection('sec2');
    } else if (trimmed.includes('桥梁')) {
      setSelectedPoiId('bridgeA');
      const ces = getGlobalCesiumEngine();
      if (ces.ready) ces.flyToPoi('bridgeA');
    }
    sendMessage({ text: trimmed });
  }

  return (
    <>
      <div className="floating-br">
        <button
          type="button"
          className="ai-fab"
          id="aiFabBtn"
          title="打开智能工程AI助手"
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
        >
          <span className="ai-fab-label">AI助手</span>
          <span className="ai-fab-avatar">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <line x1="18" y1="4" x2="18" y2="9" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="18" cy="4" r="2.2" fill="#38f2ff" />
              <rect x="6" y="9" width="24" height="19" rx="9" fill="#e0f2fe" stroke="#38f2ff" strokeWidth="1.6" />
              <rect x="10" y="13" width="16" height="10" rx="5" fill="#09214d" />
              <circle cx="14.5" cy="18" r="2.1" fill="#38f2ff" />
              <circle cx="21.5" cy="18" r="2.1" fill="#38f2ff" />
              <path d="M15 24.5c1.8 1.2 4.2 1.2 6 0" stroke="#0c4a9e" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>
        <div className="watermark-pill">Next.js 全栈平台 · 实时数据</div>
      </div>

      <aside className={`ai-drawer ${aiDrawerOpen ? 'open' : ''}`} id="aiDrawer">
        <div className="modal-header ai-drawer-header">
          <div className="panel-title-group ai-drawer-title-group">
            <span className="panel-accent-bar" />
            <span className="panel-title">吉黑高速 · 智能AI助手</span>
          </div>
          <div className="ai-drawer-actions">
            <button
              type="button"
              className="ai-workbench-btn"
              id="aiWorkbenchBtn"
              onClick={() => {
                setAiDrawerOpen(false);
                router.push('/ai/exhibition');
              }}
            >
              进入 AI 助手全屏工作台
            </button>
            <button
              type="button"
              className="panel-toggle-btn"
              id="aiCloseBtn"
              title="关闭AI助手"
              onClick={() => setAiDrawerOpen(false)}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="ai-messages" id="aiMessages">
          {messages.map((m) => (
            <div key={m.id} className={`ai-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
              {m.parts.map((part, idx) => {
                if (part.type === 'text') {
                  return (
                    <div key={`${m.id}-${idx}`} className="whitespace-pre-wrap">
                      {part.text}
                    </div>
                  );
                }
                if (part.type.startsWith('tool-')) {
                  return (
                    <div
                      key={`${m.id}-${idx}`}
                      className="mt-1.5 px-2 py-1 rounded bg-sky-950/80 border border-cyan-400/35 text-[11px] text-cyan-200"
                    >
                      已调用工程工具：{part.type.replace('tool-', '')}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>

        <div className="ai-quick-prompts" id="aiQuickPrompts">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="ai-chip"
              onClick={() => handleSend(p.q)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form
          className="ai-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const val = input;
            setInput('');
            handleSend(val);
          }}
        >
          <input
            id="aiInput"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入工程问题或指令，如“二工区进度如何”..."
          />
          <button type="submit" className="dock-btn primary" id="aiSendBtn" disabled={isBusy}>
            <Send size={12} />
            <span>{isBusy ? '研判中' : '发送'}</span>
          </button>
        </form>
      </aside>
    </>
  );
}
