'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';

const AiFloatingDrawerBody = dynamic(
  () => import('./AiFloatingDrawerBody').then((m) => m.AiFloatingDrawerBody),
  {
    ssr: false,
    loading: () => (
      <div className="ai-messages flex items-center justify-center py-8 text-xs text-sky-200/80">
        正在加载智能 AI 对话模块...
      </div>
    ),
  }
);

function preloadDrawerBody() {
  if (typeof window !== 'undefined') {
    void import('./AiFloatingDrawerBody');
  }
}

export function AiFloatingDrawer() {
  const router = useRouter();
  const aiDrawerOpen = usePlatformStore((s) => s.aiDrawerOpen);
  const setAiDrawerOpen = usePlatformStore((s) => s.setAiDrawerOpen);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (aiDrawerOpen) {
      setHasOpened(true);
    }
  }, [aiDrawerOpen]);

  return (
    <>
      <div className="floating-br">
        <button
          type="button"
          className="ai-fab"
          id="aiFabBtn"
          title="打开智能工程AI助手"
          onMouseEnter={preloadDrawerBody}
          onFocus={preloadDrawerBody}
          onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
        >
          <span className="ai-fab-label">AI助手</span>
          <span className="ai-fab-avatar">
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
              <line x1="18" y1="4" x2="18" y2="9" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="18" cy="4" r="2.2" fill="#67e8f9" />
              <rect x="6" y="9" width="24" height="19" rx="9" fill="#e0f2fe" stroke="#67e8f9" strokeWidth="1.6" />
              <rect x="10" y="13" width="16" height="10" rx="5" fill="#09214d" />
              <circle cx="14.5" cy="18" r="2.1" fill="#67e8f9" />
              <circle cx="21.5" cy="18" r="2.1" fill="#67e8f9" />
              <path d="M15 24.5c1.8 1.2 4.2 1.2 6 0" stroke="#0c4a9e" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>
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

        {hasOpened ? <AiFloatingDrawerBody /> : null}
      </aside>
    </>
  );
}
