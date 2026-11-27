'use client';

export function Pager({
  totalCount,
  pageSize,
  currentPage,
  unitLabel,
  onPageChange,
}: {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  unitLabel: string;
  onPageChange: (nextPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const cur = Math.min(Math.max(1, currentPage), totalPages);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="m13-pager">
      <span className="m13-pager-info">
        共 {totalCount} {unitLabel}
      </span>
      <button
        type="button"
        className="m13-pg-btn"
        disabled={cur <= 1}
        onClick={() => onPageChange(cur - 1)}
      >
        &lt;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`m13-pg-btn ${p === cur ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="m13-pg-btn"
        disabled={cur >= totalPages}
        onClick={() => onPageChange(cur + 1)}
      >
        &gt;
      </button>
    </div>
  );
}
