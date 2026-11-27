'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  DIRECTION_LIST,
  STAGE_LIST,
  STAGE_META,
  type PinganFeaturedResultDTO,
  type PinganShowcaseResponse,
  type PinganTopicDTO,
} from '../types';
import {
  DeliverablesModal,
  FeaturedResultModal,
  MediaDetailModal,
  StageHudSvg,
  VideoPlayerModal,
} from './PinganModals';

export function ShowcaseSubPage({
  activeSectionId,
  onJumpTopics,
  showToast,
}: {
  activeSectionId: string | null;
  onJumpTopics: (topicId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [direction, setDirection] = useState('全部方向');
  const [stage, setStage] = useState('全部阶段');
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState('KT-04');
  const [data, setData] = useState<PinganShowcaseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [videoModalIdx, setVideoModalIdx] = useState<number | null>(null);
  const [mediaDetailIdx, setMediaDetailIdx] = useState<number | null>(null);
  const [deliverablesModal, setDeliverablesModal] = useState<{
    topic: PinganTopicDTO;
    categoryKey: 'midterm' | 'patent' | 'acceptance';
  } | null>(null);
  const [featuredModal, setFeaturedModal] =
    useState<PinganFeaturedResultDTO | null>(null);

  const loadData = useCallback(
    async (dirVal: string, stageVal: string) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (dirVal && dirVal !== '全部方向') qs.set('direction', dirVal);
        if (stageVal && stageVal !== '全部阶段') qs.set('stage', stageVal);
        const res = await fetch(`/api/v1/m12/showcase?${qs.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as PinganShowcaseResponse;
          setData(json);
          return json;
        }
      } finally {
        setLoading(false);
      }
      return null;
    },
    []
  );

  useEffect(() => {
    void loadData(direction, stage);
  }, [direction, stage, loadData]);

  const topics = useMemo(() => data?.topics ?? [], [data]);
  const slides = useMemo(() => data?.slides ?? [], [data]);
  const featuredResults = useMemo(() => data?.featuredResults ?? [], [data]);
  const overview = data?.overview;
  const lastUpdated = data?.lastUpdated ?? '2026-11-25 10:45';

  useEffect(() => {
    if (!activeSectionId || topics.length === 0) return;
    const match = topics.find((t) => t.sectionId === activeSectionId);
    if (match) {
      setSelectedTopicId(match.id);
    }
  }, [activeSectionId, topics]);

  const safeSlideIdx =
    slides.length > 0 ? ((slideIdx % slides.length) + slides.length) % slides.length : 0;
  const activeSlide = slides[safeSlideIdx] ?? null;

  async function handleQuery() {
    const json = await loadData(direction, stage);
    const cnt = json?.topics.length ?? topics.length;
    showToast(`已筛选出 ${cnt} 项平安工地课题`);
  }

  function handleReset() {
    setDirection('全部方向');
    setStage('全部阶段');
    setSelectedTopicId('KT-04');
    showToast('已重置筛选条件');
  }

  return (
    <div className="m12-page">
      {/* Top Filter Bar */}
      <div className="m12-filter-bar">
        <div className="m12-filter-group">
          <div className="m12-filter-item">
            <label htmlFor="m12ScDir">研究方向</label>
            <select
              id="m12ScDir"
              className="m12-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
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
            <label htmlFor="m12ScStage">推进阶段</label>
            <select
              id="m12ScStage"
              className="m12-select"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
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
          <span className="m12-updated-tag">更新于 {lastUpdated}</span>
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            onClick={() => void handleQuery()}
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
        </div>
      </div>

      {/* Top Split: Media Carousel + Project Overview */}
      <div className="m12-showcase-top">
        <section className="m12-panel">
          <div className="m12-panel-head">
            <div className="m12-panel-title-wrap">
              <span className="panel-accent-bar" />
              <span className="panel-title">成果图片与视频</span>
            </div>
            <button
              type="button"
              className="m12-head-link"
              onClick={() => {
                if (slides.length > 0) setVideoModalIdx(1);
              }}
            >
              <Play size={13} />
              播放专题视频
            </button>
          </div>

          <div className="m12-media-grid">
            <div
              className="m12-stage-card"
              title="点击查看成果详情或播放视频"
              onClick={() => {
                if (!activeSlide) return;
                if (activeSlide.kind === 'video') {
                  setVideoModalIdx(safeSlideIdx);
                } else {
                  setMediaDetailIdx(safeSlideIdx);
                }
              }}
            >
              {activeSlide ? (
                <>
                  <img
                    className="m12-stage-img"
                    src={activeSlide.imgPath}
                    alt={activeSlide.title}
                  />
                  <StageHudSvg slide={activeSlide} />
                  <div className="m12-stage-grad" />
                  {activeSlide.kind === 'video' ? (
                    <button
                      type="button"
                      className="m12-stage-play-overlay"
                      aria-label="播放专题视频"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoModalIdx(safeSlideIdx);
                      }}
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  ) : null}
                  <div className="m12-stage-footer">
                    <div>
                      <div className="m12-stage-title">{activeSlide.title}</div>
                      <div className="m12-stage-sub">{activeSlide.subtitle}</div>
                    </div>
                    <div
                      className="m12-carousel-pill"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="m12-carousel-btn"
                        aria-label="上一张"
                        onClick={() =>
                          setSlideIdx(
                            (prev) => (prev - 1 + slides.length) % slides.length
                          )
                        }
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <span className="m12-carousel-idx">
                        {safeSlideIdx + 1} / {slides.length}
                      </span>
                      <button
                        type="button"
                        className="m12-carousel-btn"
                        aria-label="下一张"
                        onClick={() =>
                          setSlideIdx((prev) => (prev + 1) % slides.length)
                        }
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="m12-empty-cell">
                  {loading ? '正在加载成果影像...' : '暂无成果影像'}
                </div>
              )}
            </div>

            <div className="m12-thumb-stack">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`m12-thumb-card ${idx === safeSlideIdx ? 'active' : ''}`}
                  onClick={() => {
                    setSlideIdx(idx);
                    if (s.topicId) setSelectedTopicId(s.topicId);
                  }}
                >
                  <div className="m12-thumb-pic">
                    <img src={s.imgPath} alt={s.title} />
                    {s.kind === 'video' ? (
                      <span className="m12-thumb-play">
                        <Play size={11} fill="currentColor" />
                      </span>
                    ) : null}
                  </div>
                  <div className="m12-thumb-info">
                    <div className="m12-thumb-title">{s.title}</div>
                    <div className="m12-thumb-sub">{s.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="m12-panel">
          <div className="m12-panel-head">
            <div className="m12-panel-title-wrap">
              <span className="panel-accent-bar" />
              <span className="panel-title">项目简介</span>
            </div>
          </div>
          <div className="m12-intro-body">
            <div className="m12-intro-heading">
              {overview?.title ?? '吉黑高速明水至北安段'}
            </div>
            <div className="m12-intro-desc">
              {overview?.desc ??
                '项目按双向四车道高速公路标准建设。平安百年品质工程创建聚焦寒区改扩建品质提升、工业化建造、智慧提速和绿色低碳。'}
            </div>
            <div className="m12-intro-stats">
              {(
                overview?.stats ?? [
                  { label: '路线全长', value: '142.608', unit: 'km' },
                  { label: '建设里程', value: '120.528', unit: 'km' },
                  { label: '施工工区', value: '6', unit: '个' },
                ]
              ).map((st) => (
                <div key={st.label} className="m12-stat-card">
                  <div className="m12-stat-label">{st.label}</div>
                  <div className="m12-stat-val">
                    <strong>{st.value}</strong>
                    <span>{st.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="m12-results-head">
              <h4>阶段成果</h4>
              <span>成果示例</span>
            </div>
            <div className="m12-results-list">
              {featuredResults.map((res) => (
                <div
                  key={res.id}
                  className="m12-result-row"
                  onClick={() => setFeaturedModal(res)}
                >
                  <span className="m12-result-left">
                    <FileText size={14} />
                    <span>{res.title}</span>
                  </span>
                  <span className="m12-result-right">{res.topicLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Matrix Panel */}
      <section className="m12-panel">
        <div className="m12-panel-head">
          <div className="m12-panel-title-wrap">
            <span className="panel-accent-bar" />
            <span className="panel-title">课题进度矩阵</span>
          </div>
          <div className="m12-legend">
            <span className="m12-legend-item">
              <span className="m12-stage-done">✓</span>已完成
            </span>
            <span className="m12-legend-item">
              <span className="m12-dot-blue" />
              当前阶段
            </span>
            <span className="m12-legend-item">
              <span className="m12-stage-none">—</span>未开始
            </span>
          </div>
        </div>

        <div className="m12-table-wrap">
          <table className="m12-matrix-table">
            <thead>
              <tr>
                <th>课题名称</th>
                <th>立项</th>
                <th>计划与设计</th>
                <th>研究执行</th>
                <th>成果整理</th>
                <th>验收与推广</th>
                <th>中期评审资料</th>
                <th>专利 / 论文 / 标准</th>
                <th>验收与推广资料</th>
              </tr>
            </thead>
            <tbody>
              {topics.length > 0 ? (
                topics.map((t) => {
                  const stageIdx = (STAGE_META[t.stage] ?? { index: 0 }).index;
                  const isSelected = t.id === selectedTopicId;

                  const renderDeliverableCell = (
                    catKey: 'midterm' | 'patent' | 'acceptance'
                  ) => {
                    const list = t.deliverables?.[catKey] ?? [];
                    if (list.length === 0) {
                      return (
                        <td>
                          <span className="m12-stage-none">—</span>
                        </td>
                      );
                    }
                    return (
                      <td>
                        <button
                          type="button"
                          className="m12-doc-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeliverablesModal({ topic: t, categoryKey: catKey });
                          }}
                        >
                          {list.length} 份
                        </button>
                      </td>
                    );
                  };

                  return (
                    <tr
                      key={t.id}
                      className={`m12-matrix-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTopicId(t.id)}
                      onDoubleClick={() => onJumpTopics(t.id)}
                    >
                      <td>
                        <span className="m12-kt-code">{t.id}</span>
                        {t.shortName}
                      </td>
                      {STAGE_LIST.map((stageName, i) => {
                        if (i < stageIdx) {
                          return (
                            <td key={stageName}>
                              <span className="m12-stage-done">✓</span>
                            </td>
                          );
                        }
                        if (i === stageIdx) {
                          return (
                            <td key={stageName}>
                              <span className="m12-stage-current">进行中</span>
                            </td>
                          );
                        }
                        return (
                          <td key={stageName}>
                            <span className="m12-stage-none">—</span>
                          </td>
                        );
                      })}
                      {renderDeliverableCell('midterm')}
                      {renderDeliverableCell('patent')}
                      {renderDeliverableCell('acceptance')}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="m12-empty-cell">
                    {loading
                      ? '正在加载课题进度矩阵...'
                      : '当前筛选条件下暂无匹配课题，请调整研究方向或推进阶段。'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {videoModalIdx !== null && slides.length > 0 ? (
        <VideoPlayerModal
          slides={slides}
          initialChapterIdx={videoModalIdx}
          onClose={() => setVideoModalIdx(null)}
        />
      ) : null}

      {mediaDetailIdx !== null && slides[mediaDetailIdx] ? (
        <MediaDetailModal
          slide={slides[mediaDetailIdx]}
          topic={
            topics.find((t) => t.id === slides[mediaDetailIdx].topicId) ?? null
          }
          onJumpTopic={(tid) => {
            setMediaDetailIdx(null);
            onJumpTopics(tid);
          }}
          onSwitchToVideo={() => {
            const idx = mediaDetailIdx;
            setMediaDetailIdx(null);
            setVideoModalIdx(idx);
          }}
          onClose={() => setMediaDetailIdx(null)}
        />
      ) : null}

      {deliverablesModal ? (
        <DeliverablesModal
          topic={deliverablesModal.topic}
          categoryKey={deliverablesModal.categoryKey}
          onJumpTopic={(tid) => {
            setDeliverablesModal(null);
            onJumpTopics(tid);
          }}
          onClose={() => setDeliverablesModal(null)}
        />
      ) : null}

      {featuredModal ? (
        <FeaturedResultModal
          result={featuredModal}
          topic={topics.find((t) => t.id === featuredModal.topicId) ?? null}
          onJumpTopic={(tid) => {
            setFeaturedModal(null);
            onJumpTopics(tid);
          }}
          onClose={() => setFeaturedModal(null)}
        />
      ) : null}
    </div>
  );
}
