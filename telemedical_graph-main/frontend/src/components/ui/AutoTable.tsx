import React, { useMemo } from 'react';
import type { Row } from '../../types/entities';
import { fieldLabel, orDash } from '../../utils/format';

/**
 * Renders a related collection whose DTO shape is owned by the backend
 * (phones, qualifications, medical records, feedback…). Columns are derived
 * from the response itself, so no field naming is assumed here.
 */
export function AutoTable({ rows, maxColumns = 6 }: {rows: Row[];maxColumns?: number;}) {
  const keys = useMemo(() => {
    const set = new Set<string>();
    rows.slice(0, 5).forEach((row) => {
      Object.keys(row).forEach((key) => {
        const value = row[key];
        if (value === null || typeof value !== 'object') set.add(key);
      });
    });
    return Array.from(set).slice(0, maxColumns);
  }, [rows, maxColumns]);

  if (keys.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded border border-line">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-line bg-canvas/70">
            {keys.map((key) =>
            <th key={key} scope="col" className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                {fieldLabel(key)}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) =>
          <tr key={index} className="bg-white">
              {keys.map((key) =>
            <td key={key} className="px-3 py-2 align-top text-ink">
                  {orDash(row[key] as string | number | null | undefined)}
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}