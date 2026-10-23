import React from 'react';
import type { Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { ApiError, friendlyMessage } from '../utils/api/client';
import { AutoTable } from './ui/AutoTable';
import { EmptyState, ErrorState } from './ui/StateBlock';

interface RelatedCollectionProps {
  title: string;
  subject: string;
  loader: () => Promise<Row[]>;
  dependency: string;
  render?: (rows: Row[]) => React.ReactNode;
  emptyTitle?: string;
}

/**
 * Loads one related sub-collection for a detail panel. If the Spring Boot app
 * does not expose the route yet, this degrades to a clear "not available"
 * notice rather than inventing records.
 */
export function RelatedCollection({ title, subject, loader, dependency, render, emptyTitle }: RelatedCollectionProps) {
  const { data, loading, error, refetch } = useResource<Row[]>(loader, [dependency], Boolean(dependency));
  const rows = data ?? [];

  return (
    <section className="mt-5">
      <h4 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-ink-soft">{title}</h4>
      {loading ?
      <div className="h-16 animate-pulse rounded border border-line bg-canvas" aria-hidden="true" /> :
      error ?
      <div className="rounded border border-line bg-canvas">
          <ErrorState
          compact
          message={
          error instanceof ApiError && error.status === 404 ?
          `${title} is not exposed by the backend at this route.` :
          friendlyMessage(error, subject)
          }
          onRetry={error instanceof ApiError && error.status === 404 ? undefined : refetch} />
        
        </div> :
      rows.length === 0 ?
      <div className="rounded border border-line bg-canvas">
          <EmptyState compact title={emptyTitle ?? `No ${subject} recorded`} />
        </div> :
      render ?
      render(rows) :

      <AutoTable rows={rows} />
      }
    </section>);

}