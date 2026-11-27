'use client';

import { type ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = '当前筛选条件下暂无数据',
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyText?: string;
}) {
  if (!rows.length) {
    return <div className="jihei-empty">{emptyText}</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={c.width ? { width: c.width } : undefined}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={rowKey(r, i)}>
            {columns.map((c) => (
              <td key={c.key}>{c.render(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
