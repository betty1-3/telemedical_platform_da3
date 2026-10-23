import React from 'react';
import { ChevronRightIcon, ServerIcon } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api/config';
import type { NavItem } from '../../data/navigation';

interface TopbarProps {
  section: string;
  item: NavItem;
}

export function Topbar({ section, item }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-2xs text-ink-soft">
              <li className="hover:text-ink transition-colors">MediCore</li>
              <li aria-hidden="true">
                <ChevronRightIcon size={11} />
              </li>
              <li className="hover:text-ink transition-colors">{section}</li>
              <li aria-hidden="true">
                <ChevronRightIcon size={11} />
              </li>
              <li className="font-semibold text-brand-700" aria-current="page">
                {item.label}
              </li>
            </ol>
          </nav>
          <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-ink">{item.label}</h1>
          <p className="truncate text-xs text-ink-muted">{item.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1.5 text-2xs text-emerald-800 shadow-xs">
          <ServerIcon size={12} aria-hidden="true" className="text-emerald-600" />
          <span className="font-mono font-medium">{API_BASE_URL}</span>
        </div>
      </div>
    </header>
  );
}
