'use client';

export function PaginationBar({
  totalItems,
  currentPage,
  pageSize,
  unitLabel,
  onPageChange,
}: {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  unitLabel: string;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(1, Math.min(totalPages, currentPage));

  const pagesToShow: Array<number | 'dots'> = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
  } else {
    const shown = new Set<number>([1, 2, 3, totalPages]);
    if (safePage > 2 && safePage < totalPages) {
      shown.add(safePage - 1);
      shown.add(safePage);
      shown.add(safePage + 1);
    }
    const sorted = Array.from(shown)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) pagesToShow.push('dots');
      pagesToShow.push(p);
      prev = p;
    }
  }

  return (
    <div className="m06-pagination">
      <span>
        共 {totalItems} {unitLabel}
      </span>
      <button
        type="button"
        className="m06-page-btn"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="上一页"
      >
        &lt;
      </button>
      {pagesToShow.map((item, idx) =>
        item === 'dots' ? (
          <span key={`dots-${idx}`} className="m06-page-dots">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`m06-page-btn ${item === safePage ? 'active' : ''}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        className="m06-page-btn"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="下一页"
      >
        &gt;
      </button>
    </div>
  );
}
