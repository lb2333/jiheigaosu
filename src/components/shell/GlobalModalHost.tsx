'use client';

import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { usePlatformStore, type ModalBlock } from '@/lib/store/platform-store';
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

  function handleResetDemo() {
    const cleared = resetDemoState();
    const ces = getGlobalCesiumEngine();
    if (ces.ready) ces.flyToOverview(1.2);
    router.push('/home/overview');
    showToast(`已重置全平台演示状态与本地缓存（清理 ${cleared} 项）`);
  }

  function renderBlock(block: ModalBlock, idx: number) {
    switch (block.type) {
      case 'paragraph': {
        const color = block.tone === 'cyan' ? '#bae6fd' : block.tone === 'muted' ? '#93c5fd' : '#dbeafe';
        return (
          <p key={idx} style={{ color, lineHeight: 1.7 }}>
            {block.text}
          </p>
        );
      }
      case 'stats':
        return (
          <div key={idx} className="detail-grid">
            {block.items.map((item) => (
              <div key={item.label} className="detail-stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        );
      case 'kvTable':
        return (
          <table key={idx} className="data-table">
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.cells.map((cell) => (
                    <Fragment key={cell.label}>
                      <th style={{ width: 130 }}>{cell.label}</th>
                      <td colSpan={cell.colSpan}>
                        {cell.tone ? (
                          <span className={`status-tag ${cell.tone}`}>{cell.value}</span>
                        ) : cell.code ? (
                          <>
                            {cell.value}
                            <code>{cell.code}</code>
                          </>
                        ) : (
                          cell.value
                        )}
                      </td>
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'dataTable':
        return (
          <table key={idx} className="data-table">
            <thead>
              <tr>
                {block.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, cIdx) => (
                    <td key={cIdx}>
                      {cell.badge ? (
                        <span className={`status-tag ${cell.badge.tone ?? 'info'}`}>{cell.badge.text}</span>
                      ) : cell.action ? (
                        <button
                          type="button"
                          className="dock-btn"
                          onClick={() => {
                            if (cell.action?.previewDocName) {
                              showToast(`正在在线预览归档资料：${cell.action.previewDocName}`);
                            }
                          }}
                        >
                          {cell.action.label}
                        </button>
                      ) : (
                        cell.text
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'media':
        return (
          <Fragment key={idx}>
            <div className="media-card playing" style={{ margin: 0 }}>
              <img src={block.src} alt={block.alt} loading="lazy" decoding="async" />
              <div className="media-top-badges">
                <span className="live-pill">
                  <span className="live-dot" />
                  {block.liveLabel}
                </span>
                {block.camLabel ? <span className="cam-pill">{block.camLabel}</span> : null}
              </div>
            </div>
            {block.caption ? <p style={{ color: '#dbeafe', marginTop: 10 }}>{block.caption}</p> : null}
          </Fragment>
        );
      case 'resetDemoFooter':
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 8,
              borderTop: '1px solid rgba(56,189,248,0.2)',
            }}
          >
            <span style={{ fontSize: 12, color: '#93c5fd' }}>{block.hint}</span>
            <button type="button" className="dock-btn primary" onClick={handleResetDemo}>
              {block.buttonLabel}
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div
        className={`modal-backdrop ${modal.open ? 'open' : ''}`}
        id="globalModal"
        onClick={(e) => {
          if ((e.target as HTMLElement).id === 'globalModal') {
            closeModal();
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
          <div className="modal-body" id="modalBody">
            {(modal.blocks ?? []).map((b, idx) => renderBlock(b, idx))}
          </div>
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
