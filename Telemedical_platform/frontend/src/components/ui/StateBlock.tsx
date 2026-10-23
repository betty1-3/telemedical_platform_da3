import React from 'react';
import { AlertTriangleIcon, InboxIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? 'py-8 px-4' : 'py-14 px-6'}`}>
      
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-status-badbg text-status-bad">
        <AlertTriangleIcon size={18} aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry ?
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded border border-line-strong bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-150 hover:bg-canvas">
        
          <RefreshCwIcon size={13} aria-hidden="true" />
          Try again
        </button> :
      null}
    </div>);

}

interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, hint, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-center ${compact ? 'py-8 px-4' : 'py-14 px-6'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink-soft">
        <InboxIcon size={18} aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-ink-muted">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>);

}

export function TableSkeleton({ rows = 6, columns = 5 }: {rows?: number;columns?: number;}) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) =>
      <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }).map((__, colIndex) =>
        <div
          key={colIndex}
          className="h-3 animate-pulse rounded-full bg-canvas"
          style={{ width: colIndex === 0 ? '18%' : `${Math.max(9, 22 - colIndex * 2)}%` }} />

        )}
        </div>
      )}
    </div>);

}

export function BlockSkeleton({ height = 220 }: {height?: number;}) {
  return <div className="w-full animate-pulse rounded bg-canvas" style={{ height }} aria-hidden="true" />;
}