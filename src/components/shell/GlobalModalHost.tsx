'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

export function GlobalModalHost() {
  const router = useRouter();
  const modal = usePlatformStore((s) => s.modal);
  const closeModal = usePlatformStore((s) => s.closeModal);
  const toasts = usePlatformStore((s) => s.toasts);
  const showToast = usePlatformStore((s) => s.showToast);
  const resetDemoState = usePlatformStore((s) => s.resetDemoState);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && usePlatformStore.getState().modal.open) {
        closeModal();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  return (
    <>
      <div
        className={`modal-backdrop ${modal.open ? 'open' : ''}`}
        id="globalModal"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.id === 'globalModal') {
            closeModal();
            return;
          }
          const previewBtn = target.closest<HTMLElement>('[data-doc-preview]');
          if (previewBtn?.dataset.docPreview) {
            showToast(`正在在线预览归档资料：${previewBtn.dataset.docPreview}`);
          }
          if (target.closest('[data-reset-demo]')) {
            const cleared = resetDemoState();
            const ces = getGlobalCesiumEngine();
            if (ces.ready) ces.flyToOverview(1.2);
            router.push('/home/overview');
            showToast(`已重置全平台演示状态与本地缓存（清理 ${cleared} 项）`);
          }
        }}
      >
        <div className="modal-box">
          <div className="modal-header">
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title" id="modalTitle">
                {modal.title}
              </span>
            </div>
            <button type="button" className="panel-toggle-btn" id="modalCloseBtn" onClick={closeModal}>
              <X size={15} />
            </button>
          </div>
          <div
            className="modal-body"
            id="modalBody"
            dangerouslySetInnerHTML={modal.htmlBody ? { __html: modal.htmlBody } : undefined}
          />
        </div>
      </div>

      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className="toast-item">
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
