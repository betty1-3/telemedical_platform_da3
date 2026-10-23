import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Aggregate, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { dashboardApi } from '../utils/api/dashboard';
import { formatCurrency, formatNumber, humanise } from '../utils/format';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ChartCard } from '../components/dashboard/ChartCard';

const statusColour = (label: string): string => {
  const key = label.toLowerCase();
  if (key.includes('complet')) return '#10b981';
  if (key.includes('cancel')) return '#ef4444';
  if (key.includes('schedul')) return '#0284c7';
  return '#0d9488';
};

const barColours = ['#0284c7', '#0d9488', '#10b981', '#0ea5e9', '#06b6d4', '#3b82f6'];

const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
  axisLine: { stroke: '#e2e8f0' },
} as const;

const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  cursor: { fill: 'rgba(2, 132, 199, 0.06)' },
} as const;

function HorizontalBars({ data, valueLabel }: { data: Aggregate[]; valueLabel: string }) {
  const rows = data.map((entry) => ({ ...entry, name: humanise(entry.label) }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(228, rows.length * 34)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
        <XAxis type="number" allowDecimals={false} {...axisProps} />
        <YAxis type="category" dataKey="name" width={124} {...axisProps} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => [formatNumber(value), valueLabel]} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
          {rows.map((entry, index) => (
            <Cell key={entry.label} fill={barColours[index % barColours.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardPage() {
  const summary = useResource<Row>(() => dashboardApi.summary(), []);
  const byStatus = useResource<Aggregate[]>(() => dashboardApi.consultationsByStatus(), []);
  const byCity = useResource<Aggregate[]>(() => dashboardApi.patientsByCity(), []);
  const bySpecialization = useResource<Aggregate[]>(() => dashboardApi.doctorsBySpecialization(), []);
  const payments = useResource<Aggregate[]>(() => dashboardApi.paymentSummary(), []);

  const statusRows = byStatus.data ?? [];
  const cityRows = byCity.data ?? [];
  const specRows = bySpecialization.data ?? [];
  const paymentRows = payments.data ?? [];
  const statusTotal = statusRows.reduce((total, entry) => total + entry.count, 0);

  return (
    <div className="space-y-5">
      <SummaryCards data={summary.data} loading={summary.loading} error={summary.error} onRetry={summary.refetch} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Consultations by status"
          description="Distribution across the workflow"
          subject="consultation statuses"
          loading={byStatus.loading}
          error={byStatus.error}
          onRetry={byStatus.refetch}
          isEmpty={statusRows.length === 0}
        >
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={210}>
              <PieChart>
                <Pie data={statusRows} dataKey="count" nameKey="label" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {statusRows.map((entry) => (
                    <Cell key={entry.label} fill={statusColour(entry.label)} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name: string) => [formatNumber(value), humanise(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-2">
              {statusRows.map((entry) => (
                <li key={entry.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColour(entry.label) }}
                    />
                    <span className="truncate text-ink">{humanise(entry.label)}</span>
                  </span>
                  <span className="shrink-0 text-ink-muted tabular">
                    {formatNumber(entry.count)}
                    {statusTotal > 0 ? ` · ${Math.round((entry.count / statusTotal) * 100)}%` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard
          title="Patients by city"
          description="Registered patients per location"
          subject="patient locations"
          loading={byCity.loading}
          error={byCity.error}
          onRetry={byCity.refetch}
          isEmpty={cityRows.length === 0}
        >
          <HorizontalBars data={cityRows} valueLabel="Patients" />
        </ChartCard>

        <ChartCard
          title="Doctors by specialization"
          description="Practitioner coverage"
          subject="specializations"
          loading={bySpecialization.loading}
          error={bySpecialization.error}
          onRetry={bySpecialization.refetch}
          isEmpty={specRows.length === 0}
        >
          <HorizontalBars data={specRows} valueLabel="Doctors" />
        </ChartCard>
      </div>

      <ChartCard
        title="Payment summary"
        description="Volume and value by payment method"
        subject="payment summary data"
        loading={payments.loading}
        error={payments.error}
        onRetry={payments.refetch}
        isEmpty={paymentRows.length === 0}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={paymentRows.map((entry) => ({ ...entry, name: humanise(entry.label) }))}
              margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
            >
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} width={72} tickFormatter={(value: number) => formatNumber(value)} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, name: string) =>
                  name === 'amount' ? [formatCurrency(value), 'Amount'] : [formatNumber(value), 'Payments']
                }
              />
              <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full border-collapse text-xs">
              <caption className="sr-only">Payments and amount by method</caption>
              <thead>
                <tr className="border-b border-line bg-slate-50">
                  <th scope="col" className="px-3.5 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-slate-500">
                    Method
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right text-2xs font-semibold uppercase tracking-wider text-slate-500">
                    Payments
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right text-2xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paymentRows.map((entry) => (
                  <tr key={entry.label} className="bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2.5 text-ink font-medium">{humanise(entry.label)}</td>
                    <td className="px-3.5 py-2.5 text-right text-slate-600 tabular">{formatNumber(entry.count)}</td>
                    <td className="px-3.5 py-2.5 text-right font-semibold text-ink tabular">{formatCurrency(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
