import React from 'react';
import { friendlyMessage } from '../../utils/api/client';
import { BlockSkeleton, EmptyState, ErrorState } from '../ui/StateBlock';
import { Panel } from '../ui/Panel';

interface ChartCardProps {
  title: string;
  description?: string;
  subject: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  isEmpty: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  subject,
  loading,
  error,
  onRetry,
  isEmpty,
  children,
  className = ''
}: ChartCardProps) {
  return (
    <Panel title={title} description={description} className={className} bodyPadding>
      {loading ?
      <BlockSkeleton height={228} /> :
      error ?
      <ErrorState compact message={friendlyMessage(error, subject)} onRetry={onRetry} /> :
      isEmpty ?
      <EmptyState compact title={`No ${subject} returned`} hint="The backend responded successfully with no rows." /> :

      children
      }
    </Panel>);

}