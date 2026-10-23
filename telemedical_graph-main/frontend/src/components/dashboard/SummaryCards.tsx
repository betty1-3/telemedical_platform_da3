import React from "react";
import { Building2Icon, CalendarClockIcon, CreditCardIcon, FileTextIcon, StethoscopeIcon, UsersIcon, LucideIcon } from "lucide-react";
import { Row } from "../../types/entities";
import { pickNumber } from "../../utils/fields";
import { formatCurrency, formatNumber } from "../../utils/format";
import { friendlyMessage } from "../../utils/api/client";
import { ErrorState } from "../ui/StateBlock";

const metrics: Array<{
  label: string;
  keys: string[];
  icon: LucideIcon;
  badgeBg: string;
  iconColor: string;
  cardBg: string;
  border: string;
}> = [
  {
    label: 'Patients',
    keys: ['totalPatients'],
    icon: UsersIcon,
    badgeBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    cardBg: 'bg-sky-50/70',
    border: 'border-sky-200/80',
  },
  {
    label: 'Doctors',
    keys: ['totalDoctors'],
    icon: StethoscopeIcon,
    badgeBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    cardBg: 'bg-emerald-50/70',
    border: 'border-emerald-200/80',
  },
  {
    label: 'Hospitals',
    keys: ['totalHospitals'],
    icon: Building2Icon,
    badgeBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    cardBg: 'bg-teal-50/70',
    border: 'border-teal-200/80',
  },
  {
    label: 'Consultations',
    keys: ['totalConsultations'],
    icon: CalendarClockIcon,
    badgeBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    cardBg: 'bg-blue-50/70',
    border: 'border-blue-200/80',
  },
  {
    label: 'Prescriptions',
    keys: ['totalPrescriptions'],
    icon: FileTextIcon,
    badgeBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    cardBg: 'bg-cyan-50/70',
    border: 'border-cyan-200/80',
  },
  {
    label: 'Payments',
    keys: ['totalPayments'],
    icon: CreditCardIcon,
    badgeBg: 'bg-slate-100',
    iconColor: 'text-emerald-600',
    cardBg: 'bg-white',
    border: 'border-line',
  },
];

const revenueKeys = ['totalRevenue'];

interface SummaryCardsProps {
  data: Row | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function SummaryCards({
  data,
  loading,
  error,
  onRetry
}: SummaryCardsProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-line bg-white shadow-panel">
        <ErrorState message={friendlyMessage(error, 'the dashboard summary')} onRetry={onRetry} />
      </div>
    );
  }

  const revenue = pickNumber(data, revenueKeys);

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-4">
      <section className="rounded-lg border border-sky-900/40 bg-gradient-to-br from-[#0c233c] via-[#0f2d4a] to-[#0a394a] p-5 text-white shadow-panel lg:row-span-2 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-2xs font-semibold uppercase tracking-wider text-teal-300">Total revenue</p>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400/15 text-teal-300">
              <CreditCardIcon size={13} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white tabular">
            {loading ? <span className="inline-block h-8 w-36 animate-pulse rounded bg-white/15" /> : formatCurrency(revenue)}
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-sky-200/80">
          Settled across all recorded payments returned by the dashboard summary endpoint.
        </p>
      </section>

      {metrics.map((metric) => {
        const value = pickNumber(data, metric.keys);
        return (
          <section
            key={metric.label}
            className={`rounded-lg border ${metric.border} ${metric.cardBg} p-4 shadow-panel transition-all duration-150 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${metric.badgeBg} ${metric.iconColor}`}>
                <metric.icon size={15} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular">
              {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-slate-200/60" /> : formatNumber(value)}
            </p>
          </section>
        );
      })}
    </div>
  );
}
