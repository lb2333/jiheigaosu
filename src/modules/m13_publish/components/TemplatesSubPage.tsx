'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlignLeft,
  Calendar,
  FileText,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import {
  BOARD_SPECS,
  TEMPLATE_CATEGORIES,
  statusTagClass,
  type PublishNavBridge,
  type PublishTemplateDTO,
} from '../types';
import { LedBoardPreview } from './LedBoardPreview';
import { Pager } from './Pager';
import { AddTemplateModal } from './PublishModalsLazy';

interface TemplatesResponse {
  templates: PublishTemplateDTO[];
  allTemplates: PublishTemplateDTO[];
  pageItems: PublishTemplateDTO[];
  total: number;
  page: number;
  totalPages: number;
  kpis: {
    total: number;
    textCount: number;
    boardCount: number;
    planCount: number;
  };
}

interface TemplateDraft {
  id: string;
  category: string;
  spec: string;
  line1: string;
  line2: string;
  startTime: string;
  endTime: string;
}

export function TemplatesSubPage({
  onNavigate,
  showToast,
}: {
  onNavigate: (subPage: string, bridge?: PublishNavBridge) => void;
  showToast: (msg: string) => void;
}) {
  const [catFilter, setCatFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kwInput, setKwInput] = useState('');
  const [appliedKw, setAppliedKw] = useState('');
  const [page, setPage] = useState(1);

  const [selectedTplId, setSelectedTplId] = useState('MB-202611-003');
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<TemplatesResponse | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        category: catFilter,
        spec: specFilter,
        status: statusFilter,
        kw: appliedKw,
        page: String(page),
        pageSize: '6',
      });
      const res = await fetch(`/api/v1/m13/templates?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      const json = (await res.json()) as TemplatesResponse;
      setData(json);
      if (json.pageItems.length > 0) {
        setSelectedTplId((prev) =>
          json.templates.some((t) => t.id === prev) ? prev : json.pageItems[0].id
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载内容模板失败');
    }
  }, [catFilter, specFilter, statusFilter, appliedKw, page, showToast]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const sel =
    data?.templates.find((t) => t.id === selectedTplId) ??
    data?.allTemplates.find((t) => t.id === selectedTplId) ??
    data?.pageItems[0] ??
    data?.allTemplates[0] ??
    null;

  useEffect(() => {
    if (!sel) return;
    setDraft((prev) => {
      if (prev && prev.id === sel.id) return prev;
      return {
        id: sel.id,
        category: sel.category,
        spec: sel.spec,
        line1: sel.line1,
        line2: sel.line2,
        startTime: sel.startTime,
        endTime: sel.endTime,
      };
    });
  }, [sel]);

  const activeDraft: TemplateDraft | null =
    draft && sel && draft.id === sel.id
      ? draft
      : sel
        ? {
            id: sel.id,
            category: sel.category,
            spec: sel.spec,
            line1: sel.line1,
            line2: sel.line2,
            startTime: sel.startTime,
            endTime: sel.endTime,
          }
        : null;

  const charCap = activeDraft && activeDraft.spec.includes('192') ? 10 : 8;

  async function handleAddTemplate(payload: {
    name: string;
    category: '常用文本' | '板面模板' | '预案内容';
    spec: '单黄LED 128×48' | '全彩LED 192×64';
    status: '有效' | '待启用';
    line1: string;
    line2: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m13/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        template?: PublishTemplateDTO;
        error?: string;
      };
      if (!res.ok || !json.template) {
        throw new Error(json.error || '新增模板失败');
      }
      setShowAddModal(false);
      setSelectedTplId(json.template.id);
      setDraft(null);
      setPage(1);
      showToast(`已新增模板 ${json.template.id}（${json.template.name}）`);
      await fetchTemplates();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '新增模板失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTemplate(andUseInOrder = false) {
    if (!sel || !activeDraft) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m13/templates/${encodeURIComponent(sel.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: activeDraft.category,
            spec: activeDraft.spec,
            line1: activeDraft.line1.trim() || sel.line1,
            line2: activeDraft.line2.trim() || sel.line2,
            startTime: activeDraft.startTime.trim() || sel.startTime,
            endTime: activeDraft.endTime.trim() || sel.endTime,
            bumpVer: !andUseInOrder,
          }),
        }
      );
      const json = (await res.json()) as {
        template?: PublishTemplateDTO;
        error?: string;
      };
      if (!res.ok || !json.template) {
        throw new Error(json.error || '保存模板失败');
      }
      if (andUseInOrder) {
        onNavigate('review', { openCreateOrderWithTplId: json.template.id });
        return;
      }
      setDraft({
        id: json.template.id,
        category: json.template.category,
        spec: json.template.spec,
        line1: json.template.line1,
        line2: json.template.line2,
        startTime: json.template.startTime,
        endTime: json.template.endTime,
      });
      showToast(`已保存模板 ${json.template.id}（${json.template.version}）`);
      await fetchTemplates();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存模板失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCatFilter('all');
    setSpecFilter('all');
    setStatusFilter('all');
    setKwInput('');
    setAppliedKw('');
    setPage(1);
  }

  const pageItems = data?.pageItems ?? [];

  return (
    <div className="m13-page">
      <div className="m13-filter-bar">
        <div className="m13-filter-group">
          <div className="m13-filter-item">
            <label>模板分类</label>
            <select
              className="m13-select"
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部分类</option>
              {TEMPLATE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="m13-filter-item">
            <label>适配规格</label>
            <select
              className="m13-select"
              value={specFilter}
              onChange={(e) => {
                setSpecFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部规格</option>
              {BOARD_SPECS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="m13-filter-item">
            <label>有效状态</label>
            <select
              className="m13-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部状态</option>
              <option value="有效">有效</option>
              <option value="待启用">待启用</option>
            </select>
          </div>
          <div className="m13-filter-item">
            <label>关键词</label>
            <div className="m13-search-box">
              <Search size={15} />
              <input
                type="text"
                className="m13-input"
                placeholder="模板编号 / 名称"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setAppliedKw(kwInput);
                    setPage(1);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="m13-filter-actions">
          <button
            type="button"
            className="m13-btn-primary"
            onClick={() => {
              setAppliedKw(kwInput);
              setPage(1);
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m13-btn-ghost"
            onClick={handleReset}
          >
            <RotateCcw size={14} /> 重置
          </button>
          <button
            type="button"
            className="m13-btn-ghost"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} /> 新增模板
          </button>
        </div>
      </div>

      <section className="m13-panel">
        <div className="m13-panel-head">
          <div className="m13-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">模板分类统计</span>
            <span className="m13-panel-sub">(2026年11月)</span>
          </div>
        </div>
        <div className="m13-panel-body">
          <div className="m13-kpi-grid-4">
            <div
              className="m13-kpi-card"
              onClick={() => {
                setCatFilter('all');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <Layers size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">模板总数</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.total ?? 8}
                  <span className="m13-kpi-unit">个</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setCatFilter('常用文本');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-blue">
                <AlignLeft size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">常用文本</div>
                <div className="m13-kpi-val m13-c-blue">
                  {data?.kpis.textCount ?? 3}
                  <span className="m13-kpi-unit">个</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setCatFilter('板面模板');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-cyan">
                <Tv size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">板面模板</div>
                <div className="m13-kpi-val m13-c-cyan">
                  {data?.kpis.boardCount ?? 3}
                  <span className="m13-kpi-unit">个</span>
                </div>
              </div>
            </div>
            <div
              className="m13-kpi-card"
              onClick={() => {
                setCatFilter('预案内容');
                setPage(1);
              }}
            >
              <div className="m13-kpi-ico m13-ico-green">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="m13-kpi-label">预案内容</div>
                <div className="m13-kpi-val m13-c-green">
                  {data?.kpis.planCount ?? 2}
                  <span className="m13-kpi-unit">个</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="m13-split-main">
        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">情报板内容模板</span>
            </div>
            <span className="m13-panel-sub">按分类与设备规格筛选</span>
          </div>
          <div className="m13-panel-body">
            <div className="m13-table-wrap">
              <table className="m13-table">
                <thead>
                  <tr>
                    <th>模板名称 / 编号</th>
                    <th>模板分类</th>
                    <th>内容版本</th>
                    <th>适配规格</th>
                    <th>有效期</th>
                    <th>模板状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: 'center',
                          color: '#8ab4dc',
                          padding: '28px',
                        }}
                      >
                        暂无匹配模板
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((t) => (
                      <tr
                        key={t.id}
                        className={
                          sel && t.id === sel.id ? 'm13-row-selected' : ''
                        }
                        onClick={() => {
                          setSelectedTplId(t.id);
                          setDraft(null);
                        }}
                      >
                        <td>
                          <div className="m13-cell-main">{t.name}</div>
                          <div className="m13-cell-sub">{t.id}</div>
                        </td>
                        <td>{t.category}</td>
                        <td>{t.version}</td>
                        <td>{t.spec}</td>
                        <td>{t.validText}</td>
                        <td>
                          <span className={`m13-tag ${statusTagClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m13-act-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTplId(t.id);
                              setDraft(null);
                            }}
                          >
                            编辑
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager
              totalCount={data?.total ?? 0}
              pageSize={6}
              currentPage={data?.page ?? page}
              unitLabel="个模板"
              onPageChange={setPage}
            />
          </div>
        </section>

        <section className="m13-panel">
          <div className="m13-panel-head">
            <div className="m13-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">编辑内容模板</span>
            </div>
            <span className="m13-head-chip">
              {activeDraft?.category ?? '预案内容'}
            </span>
          </div>
          <div className="m13-panel-body">
            {sel && activeDraft ? (
              <>
                <div className="m13-detail-top">
                  <div>
                    <span className="m13-detail-code">{sel.id}</span>
                    <span className="m13-detail-ver">{sel.version}</span>
                  </div>
                  <span className={`m13-tag ${statusTagClass(sel.status)}`}>
                    {sel.status}
                  </span>
                </div>
                <div className="m13-subhead-row">
                  <span>板面预览</span>
                  <span className="m13-panel-sub">{activeDraft.spec}</span>
                </div>
                <LedBoardPreview
                  line1={activeDraft.line1}
                  line2={activeDraft.line2}
                  spec={activeDraft.spec}
                />
                <div className="m13-led-caption">
                  <span>{sel.name}</span>
                  <span>双行显示 每行上限 {charCap} 字</span>
                </div>
                <div className="m13-form-grid-2">
                  <div className="m13-field">
                    <label>模板分类</label>
                    <select
                      className="m13-select"
                      value={activeDraft.category}
                      onChange={(e) =>
                        setDraft({ ...activeDraft, category: e.target.value })
                      }
                    >
                      <option value="预案内容">预案内容</option>
                      <option value="常用文本">常用文本</option>
                      <option value="板面模板">板面模板</option>
                    </select>
                  </div>
                  <div className="m13-field">
                    <label>适配规格</label>
                    <select
                      className="m13-select"
                      value={activeDraft.spec}
                      onChange={(e) =>
                        setDraft({ ...activeDraft, spec: e.target.value })
                      }
                    >
                      {BOARD_SPECS.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="m13-field">
                    <label>第一行文案</label>
                    <input
                      type="text"
                      className="m13-input"
                      maxLength={12}
                      value={activeDraft.line1}
                      onChange={(e) =>
                        setDraft({ ...activeDraft, line1: e.target.value })
                      }
                    />
                  </div>
                  <div className="m13-field">
                    <label>第二行文案</label>
                    <input
                      type="text"
                      className="m13-input"
                      maxLength={12}
                      value={activeDraft.line2}
                      onChange={(e) =>
                        setDraft({ ...activeDraft, line2: e.target.value })
                      }
                    />
                  </div>
                  <div className="m13-field">
                    <label>生效时间</label>
                    <div className="m13-input-icon-wrap">
                      <input
                        type="text"
                        className="m13-input"
                        value={activeDraft.startTime}
                        onChange={(e) =>
                          setDraft({
                            ...activeDraft,
                            startTime: e.target.value,
                          })
                        }
                      />
                      <Calendar size={14} />
                    </div>
                  </div>
                  <div className="m13-field">
                    <label>失效时间</label>
                    <div className="m13-input-icon-wrap">
                      <input
                        type="text"
                        className="m13-input"
                        value={activeDraft.endTime}
                        onChange={(e) =>
                          setDraft({ ...activeDraft, endTime: e.target.value })
                        }
                      />
                      <Calendar size={14} />
                    </div>
                  </div>
                </div>
                <div className="m13-actions-row">
                  <button
                    type="button"
                    className="m13-btn-primary"
                    disabled={submitting}
                    onClick={() => void handleSaveTemplate(false)}
                  >
                    <Pencil size={14} /> 保存模板
                  </button>
                  <button
                    type="button"
                    className="m13-btn-ghost"
                    disabled={submitting}
                    onClick={() => void handleSaveTemplate(true)}
                  >
                    <FileText size={14} /> 引用到发布单
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>

      {showAddModal ? (
        <AddTemplateModal
          submitting={submitting}
          onSubmit={handleAddTemplate}
          onClose={() => setShowAddModal(false)}
        />
      ) : null}
    </div>
  );
}
