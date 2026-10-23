import React from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { humanise } from '../../utils/format';

export interface FilterDef {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: FilterDef[];
  actionLabel?: string;
  onAction?: () => void;
  resultLabel?: string;
}

export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  actionLabel,
  onAction,
  resultLabel
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
      <div className="relative min-w-[200px] flex-1">
        <SearchIcon
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-md border border-line-strong bg-white py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-soft transition-colors duration-150 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs" />
        
      </div>

      {filters.map((filter) =>
      <div key={filter.id} className="flex items-center gap-1.5">
          <label htmlFor={`filter-${filter.id}`} className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
            {filter.label}
          </label>
          <select
          id={`filter-${filter.id}`}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
          className="rounded-md border border-line-strong bg-white px-2 py-1.5 text-sm text-ink transition-colors duration-150 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs">
          
            <option value="">All</option>
            {filter.options.map((option) =>
          <option key={option} value={option}>
                {humanise(option)}
              </option>
          )}
          </select>
        </div>
      )}

      {resultLabel ? <span className="text-2xs text-ink-soft tabular font-medium">{resultLabel}</span> : null}

      {actionLabel && onAction ?
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-sky-700">
        
          <PlusIcon size={14} aria-hidden="true" />
          {actionLabel}
        </button> :
      null}
    </div>);

}
