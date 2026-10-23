import React from 'react';
import { EmptyState, ErrorState, TableSkeleton } from './StateBlock';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
  hideBelow?: 'md' | 'lg' | 'xl';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  emptyTitle: string;
  emptyHint?: string;
  caption: string;
}

const hideClass: Record<string, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell'
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  errorMessage,
  onRetry,
  onRowClick,
  selectedKey,
  emptyTitle,
  emptyHint,
  caption
}: DataTableProps<T>) {
  if (loading) return <TableSkeleton columns={Math.min(columns.length, 6)} />;
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={onRetry} />;
  if (rows.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-slate-50/80">
            {columns.map((column) =>
            <th
              key={column.key}
              scope="col"
              style={column.width ? { width: column.width } : undefined}
              className={`px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-slate-500 ${
              column.align === 'right' ? 'text-right' : 'text-left'} ${
              column.hideBelow ? hideClass[column.hideBelow] : ''}`}>
              
                {column.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const key = getRowKey(row);
            const selected = selectedKey !== undefined && selectedKey === key;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                onRowClick ?
                (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } :
                undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                aria-selected={onRowClick ? selected : undefined}
                className={`transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-sky-50/50 focus:bg-sky-50/50 focus:outline-none' : ''} ${
                selected ? 'bg-sky-50/70' : 'bg-white'}`}>
                
                {columns.map((column) =>
                <td
                  key={column.key}
                  className={`px-4 py-3 align-middle text-ink ${
                  column.align === 'right' ? 'text-right tabular' : 'text-left'} ${
                  column.hideBelow ? hideClass[column.hideBelow] : ''}`}>
                  
                    {column.render(row)}
                  </td>
                )}
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}
