import React from 'react';

interface PanelProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyPadding?: boolean;
}

export function Panel({ title, description, actions, children, className = '', bodyPadding = false }: PanelProps) {
  return (
    <section className={`rounded-lg border border-line bg-white shadow-panel ${className}`}>
      {title ?
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-2xs text-ink-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header> :
      null}
      <div className={bodyPadding ? 'p-4' : ''}>{children}</div>
    </section>);

}

type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted border-line-strong',
  ok: 'bg-status-okbg text-status-ok border-status-ok/20',
  warn: 'bg-status-warnbg text-status-warn border-status-warn/20',
  bad: 'bg-status-badbg text-status-bad border-status-bad/20',
  info: 'bg-status-infobg text-status-info border-status-info/20'
};

export function Badge({ children, tone = 'neutral' }: {children: React.ReactNode;tone?: Tone;}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide ${toneClass[tone]}`}>
      
      {children}
    </span>);

}

/** Maps backend status/mode strings onto a visual tone without inventing values. */
export function toneForStatus(value: string): Tone {
  const key = value.toLowerCase();
  if (key.includes('complet') || key.includes('paid') || key.includes('success')) return 'ok';
  if (key.includes('cancel') || key.includes('fail') || key.includes('reject')) return 'bad';
  if (key.includes('schedul') || key.includes('pending') || key.includes('book')) return 'info';
  return 'neutral';
}

export function DetailList({ items }: {items: Array<{label: string;value: React.ReactNode;}>;}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((entry) =>
      <div key={entry.label} className="min-w-0">
          <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">{entry.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink">{entry.value}</dd>
        </div>
      )}
    </dl>);

}