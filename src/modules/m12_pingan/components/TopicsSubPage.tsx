'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Flag,
  Layers,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  DIRECTION_LIST,
  STAGE_LIST,
  STAGE_META,
  type PinganTopicDTO,
  type PinganTopicsResponse,
} from '../types';
import { AddTopicModal } from './PinganModals';

export function TopicsSubPage({
  activeSectionId,
  initialSelectedTopicId,
  showToast,
}: {
  activeSectionId: string | null;
  initialSelectedTopicId?: string;
  showToast: (msg: string) => void;
}) {
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [direction, setDirection] = useState('全部方向');
  const [stage, setStage] = useState('全部阶段');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedId, setSelectedId] = useState(initialSelectedTopicId || 'KT-04');
  const [data, setData] = useState<PinganTopicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Inline edit form state
  const [editName, setEditName] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editDirection, setEditDirection] = useState<string>(DIRECTION_LIST[0]);
  const [editStage, setEditStage] = useState<string>(STAGE_LIST[0]);
  const [editAchievements, setEditAchievements] = useState('');
  const [editNote, setEditNote] = useState('');

  const editNameRef = useRef<HTMLInputElement | null>(null);

  const loadData = useCallback(
    async (opts?: {
      kw?: string;
      dir?: string;
      st?: string;
      pg?: number;
    }) => {
      setLoading(true);
      try {
        const kw = opts?.kw ?? keyword;
        const dir = opts?.dir ?? direction;
        const st = opts?.st ?? stage;
        const pg = opts?.pg ?? page;

        const qs = new URLSearchParams({
          page: String(pg),
          pageSize: String(pageSize),
        });
        if (kw.trim()) qs.set('keyword', kw.trim());
        if (dir && dir !== '全部方向') qs.set('direction', dir);
        if (st && st !== '全部阶段') qs.set('stage', st);

        const res = await fetch(`/api/v1/m12/topics?${qs.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as PinganTopicsResponse;
          setData(json);
          return json;
        }
      } finally {
        setLoading(false);
      }
      return null;
    },
    [keyword, direction, stage, page]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const stageCounts = data?.stageCounts ?? {
    total: 0,
    立项: 0,
    计划与设计: 0,
    研究执行: 0,
    成果整理: 0,
    验收与推广: 0,
  };
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = data?.page ?? page;
  const lastUpdated = data?.lastUpdated ?? '2026-11-25 10:45';

  useEffect(() => {
    if (!activeSectionId || items.length === 0) return;
    const match = items.find((t) => t.sectionId === activeSectionId);
    if (match) {
      setSelectedId(match.id);
    }
  }, [activeSectionId, items]);

  const selectedTopic: PinganTopicDTO | null = useMemo(() => {
    return items.find((t) => t.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedId]);

  const syncFormFromTopic = useCallback((topic: PinganTopicDTO | null) => {
    if (!topic) return;
    setEditName(topic.name);
    setEditSummary(topic.summary);
    setEditDirection(topic.direction);
    setEditStage(topic.stage);
    setEditAchievements(topic.achievements);
    setEditNote(topic.note);
  }, []);

  useEffect(() => {
    syncFormFromTopic(selectedTopic);
  }, [selectedTopic, syncFormFromTopic]);

  const nextIdPreview = useMemo(() => {
    let maxN = Math.max(8, data?.allTopicsCount ?? 8);
    for (const t of items) {
      const m = /^KT-(\d+)$/i.exec(t.id);
      if (m) maxN = Math.max(maxN, Number.parseInt(m[1], 10));
    }
    return `KT-${String(maxN + 1).padStart(2, '0')}`;
  }, [data?.allTopicsCount, items]);

  const kpiCards = [
    {
      key: '全部阶段',
      label: '全部课题',
      count: stageCounts.total ?? 0,
      color: '#38f2ff',
      icon: <ClipboardList size={18} />,
    },
    {
      key: '立项',
      label: '立项',
      count: stageCounts['立项'] ?? 0,
      color: '#38f2ff',
      icon: <Flag size={18} />,
    },
    {
      key: '计划与设计',
      label: '计划与设计',
      count: stageCounts['计划与设计'] ?? 0,
      color: '#38f2ff',
      icon: <Layers size={18} />,
    },
    {
      key: '研究执行',
      label: '研究执行',
      count: stageCounts['研究执行'] ?? 0,
      color: '#facc15',
      icon: <Clock size={18} />,
    },
    {
      key: '成果整理',
      label: '成果整理',
      count: stageCounts['成果整理'] ?? 0,
      color: '#4ade80',
      icon: <FileText size={18} />,
    },
    {
      key: '验收与推广',
      label: '验收与推广',
      count: stageCounts['验收与推广'] ?? 0,
      color: '#38f2ff',
      icon: <CheckCircle2 size={18} />,
    },
  ];

  async function handleQuery(withToast = true) {
    setKeyword(keywordDraft);
    setPage(1);
    const json = await loadData({ kw: keywordDraft, pg: 1 });
    if (withToast && json) {
      showToast(`共查询到 ${json.total} 项专题`);
    }
  }

  function handleReset() {
    setKeywordDraft('');
    setKeyword('');
    setDirection('全部方向');
    setStage('全部阶段');
    setPage(1);
    showToast('已重置专题筛选条件');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTopic) return;
    const trimmedName = editName.trim();
    if (!trimmedName) {
      showToast('专题名称不能为空');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/m12/topics/${encodeURIComponent(selectedTopic.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            summary: editSummary.trim(),
            direction: editDirection,
            stage: editStage,
            achievements: editAchievements.trim(),
            note: editNote.trim(),
          }),
        }
      );

      const json = (await res.json().catch(() => null)) as
        | { topic?: PinganTopicDTO; error?: string }
        | null;

      if (!res.ok || !json?.topic) {
        showToast(json?.error ?? `保存失败 (${res.status})`);
        return;
      }

      showToast(`已保存 ${json.topic.id} 的专题修改`);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTopic(payload: {
    name: string;
    direction: string;
    stage: string;
    achievements: string;
    summary: string;
    note: string;
  }) {
    if (!payload.name || !payload.summary) {
      showToast('请填写专题名称和项目简介');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/v1/m12/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { topic?: PinganTopicDTO; error?: string }
        | null;

      if (!res.ok || !json?.topic) {
        showToast(json?.error ?? `新增失败 (${res.status})`);
        return;
      }

      const created = json.topic;
      setAddModalOpen(false);
      setKeywordDraft('');
      setKeyword('');
      setDirection('全部方向');
      setStage('全部阶段');
      setSelectedId(created.id);
      const nextTotal = (data?.allTopicsCount ?? 8) + 1;
      const targetPage = Math.max(1, Math.ceil(nextTotal / pageSize));
      setPage(targetPage);
      await loadData({
        kw: '',
        dir: '全部方向',
        st: '全部阶段',
        pg: targetPage,
      });
      showToast(`已新增专题 ${created.id}：${created.shortName}`);
    } finally {
      setCreating(false);
    }
  }

  const selMeta = selectedTopic
    ? (STAGE_META[selectedTopic.stage] ?? STAGE_META['立项'])
    : STAGE_META['立项'];

  return (
    <div className="m12-page">
      {/* Top Filter Bar */}
      <div className="m12-filter-bar">
        <div className="m12-filter-group">
          <div className="m12-filter-item">
            <label htmlFor="m12TpKeyword">课题名称</label>
            <div className="m12-search-wrap">
              <span className="m12-search-ico">
                <Search size={14} />
              </span>
              <input
                id="m12TpKeyword"
                className="m12-input"
                type="text"
                placeholder="请输入课题名称"
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleQuery(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="m12-filter-item">
            <label htmlFor="m12TpDir">研究方向</label>
            <select
              id="m12TpDir"
              className="m12-select"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                setPage(1);
              }}
            >
              <option value="全部方向">全部方向</option>
              {DIRECTION_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="m12-filter-item">
            <label htmlFor="m12TpStage">项目进度</label>
            <select
              id="m12TpStage"
              className="m12-select"
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setPage(1);
              }}
            >
              <option value="全部阶段">全部阶段</option>
              {STAGE_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m12-filter-actions">
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            onClick={() => void handleQuery(true)}
          >
            <Search size={14} />
            查询
          </button>
          <button
            type="button"
            className="m12-btn m12-btn-ghost"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            重置
          </button>
          <button
            type="button"
            className="m12-btn m12-btn-add"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={14} />
            新增专题
          </button>
        </div>
      </div>

      {/* 6-Card KPI Progress Strip */}
      <section className="m12-panel">
        <div className="m12-panel-head">
          <div className="m12-panel-title-wrap">
            <span className="panel-accent-bar" />
            <span className="panel-title">课题进展</span>
            <span className="m12-panel-sub">(2026年11月)</span>
          </div>
        </div>
        <div className="m12-kpi-grid">
          {kpiCards.map((c) => {
            const isActive = stage === c.key && c.key !== '全部阶段';
            return (
              <button
                key={c.key}
                type="button"
                className={`m12-kpi-card ${isActive ? 'active' : ''}`}
                title={`点击按「${c.label}」快速筛选`}
                onClick={() => {
                  const nextStage =
                    c.key !== '全部阶段' && stage === c.key ? '全部阶段' : c.key;
                  setStage(nextStage);
                  setPage(1);
                }}
              >
                <span className="m12-kpi-icon" style={{ color: c.color }}>
                  {c.icon}
                </span>
                <span className="m12-kpi-meta">
                  <span className="m12-kpi-label">{c.label}</span>
                  <span className="m12-kpi-num">
                    <strong style={{ color: c.color }}>{c.count}</strong>
                    <span>项</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom Split: Topics Table + Inline Edit Panel */}
      <div className="m12-topics-split">
        <section className="m12-panel">
          <div className="m12-panel-head">
            <div className="m12-panel-title-wrap">
              <span className="panel-accent-bar" />
              <span className="panel-title">专题列表</span>
            </div>
          </div>

          <div className="m12-table-wrap">
            <table className="m12-topics-table">
              <thead>
                <tr>
                  <th>专题名称</th>
                  <th>项目简介</th>
                  <th>项目进度</th>
                  <th>已有成果</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((t) => {
                    const meta = STAGE_META[t.stage] ?? STAGE_META['立项'];
                    const isSelected = selectedTopic?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        className={`m12-topic-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <td style={{ fontWeight: 500, minWidth: '155px' }}>
                          {t.shortName}
                        </td>
                        <td style={{ color: '#cbdcf5', minWidth: '210px' }}>
                          {t.summary}
                        </td>
                        <td>
                          <span className={`m12-stage-pill ${meta.tagClass}`}>
                            {t.stage}
                          </span>
                        </td>
                        <td style={{ color: '#d6e6fa', minWidth: '155px' }}>
                          {t.achievements}
                        </td>
                        <td style={{ color: '#9cb8dc', minWidth: '118px' }}>
                          {t.note}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m12-edit-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(t.id);
                              setTimeout(() => editNameRef.current?.focus(), 0);
                            }}
                          >
                            编辑
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="m12-empty-cell">
                      {loading
                        ? '正在加载专题列表...'
                        : '未找到匹配的专题记录，请重置筛选条件或点击“+ 新增专题”。'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="m12-pager">
            <span>共 {total} 项课题</span>
            <span>每页 {pageSize} 项</span>
            <div className="m12-page-btns">
              <button
                type="button"
                className="m12-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="上一页"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  className={`m12-page-btn ${pNum === safePage ? 'active' : ''}`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                className="m12-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="下一页"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>

        <section className="m12-panel">
          <div className="m12-panel-head">
            <div className="m12-panel-title-wrap">
              <span className="panel-accent-bar" />
              <span className="panel-title">编辑专题</span>
            </div>
          </div>

          {selectedTopic ? (
            <form className="m12-edit-body" onSubmit={(e) => void handleSaveEdit(e)}>
              <div className="m12-edit-meta">
                <span className="m12-edit-code">
                  课题编号 <strong>{selectedTopic.id}</strong>
                </span>
                <span className={`m12-stage-pill ${selMeta.tagClass}`}>
                  {selectedTopic.stage}
                </span>
              </div>

              <div className="m12-field">
                <label htmlFor="m12EditName">专题名称</label>
                <input
                  ref={editNameRef}
                  id="m12EditName"
                  className="m12-input"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="m12-field">
                <label htmlFor="m12EditIntro">项目简介</label>
                <textarea
                  id="m12EditIntro"
                  className="m12-textarea"
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                />
              </div>

              <div className="m12-field-row2">
                <div className="m12-field">
                  <label htmlFor="m12EditDir">研究方向</label>
                  <select
                    id="m12EditDir"
                    className="m12-select"
                    value={editDirection}
                    onChange={(e) => setEditDirection(e.target.value)}
                  >
                    {DIRECTION_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="m12-field">
                  <label htmlFor="m12EditStage">项目进度</label>
                  <select
                    id="m12EditStage"
                    className="m12-select"
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                  >
                    {STAGE_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="m12-field">
                <label htmlFor="m12EditResults">已有成果</label>
                <input
                  id="m12EditResults"
                  className="m12-input"
                  type="text"
                  value={editAchievements}
                  onChange={(e) => setEditAchievements(e.target.value)}
                />
              </div>

              <div className="m12-field">
                <label htmlFor="m12EditRemark">备注</label>
                <textarea
                  id="m12EditRemark"
                  className="m12-textarea"
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              <div className="m12-edit-actions">
                <button
                  type="submit"
                  className="m12-btn m12-btn-primary"
                  disabled={saving}
                >
                  <CheckCircle2 size={14} />
                  {saving ? '保存中...' : '保存修改'}
                </button>
                <button
                  type="button"
                  className="m12-btn m12-btn-ghost"
                  disabled={saving}
                  onClick={() => {
                    syncFormFromTopic(selectedTopic);
                    showToast('已还原为当前已保存内容');
                  }}
                >
                  取消
                </button>
              </div>

              <div className="m12-edit-foot">
                更新于 {selectedTopic.updatedAt || lastUpdated}
              </div>
            </form>
          ) : (
            <div className="m12-empty-cell">请选择左侧列表中的专题进行编辑</div>
          )}
        </section>
      </div>

      {addModalOpen ? (
        <AddTopicModal
          nextIdPreview={nextIdPreview}
          submitting={creating}
          onSubmit={handleCreateTopic}
          onClose={() => setAddModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
