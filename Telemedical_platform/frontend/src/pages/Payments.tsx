import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Payment, Row } from '../types/entities';
import { PAYMENT_METHODS } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { paymentsApi } from '../utils/api/payments';
import { consultationsApi } from '../utils/api/consultations';
import { friendlyMessage } from '../utils/api/client';
import { paymentKeys, toConsultation, toPayment } from '../utils/entities';
import { distinctValues, matchesQuery } from '../utils/fields';
import { payloads } from '../utils/api/payloads';
import { formatCurrency, formatNumber, humanise, orDash } from '../utils/format';
import { Badge, Panel } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { EntityForm } from '../components/ui/EntityForm';
import type { FieldDef, FormValues } from '../components/ui/EntityForm';

export function PaymentsPage() {
  const list = useResource<Row[]>(() => paymentsApi.list(), []);
  const consultationList = useResource<Row[]>(() => consultationsApi.list(), []);

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const payments = useMemo(() => rows.map(toPayment), [rows]);
  const consultations = useMemo(() => (consultationList.data ?? []).map(toConsultation), [consultationList.data]);

  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('');
  const [editing, setEditing] = useState<Payment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const { submitting, save, remove } = useCrud(paymentsApi, 'payment', list.refetch);

  const methodOptions = useMemo(() => {
    const fromData = distinctValues(rows, paymentKeys.paidBy);
    return fromData.length > 0 ? fromData : [...PAYMENT_METHODS];
  }, [rows]);

  const consultationLabel = useMemo(() => {
    const map: Record<string, string> = {};
    consultations.forEach((consultation) => {
      const who = consultation.patientName || (consultation.patientId ? `Patient #${consultation.patientId}` : '');
      map[consultation.id] = who ? `#${consultation.id} · ${who}` : `#${consultation.id}`;
    });
    return map;
  }, [consultations]);

  const fields: FieldDef[] = useMemo(
    () => [
    {
      name: 'consultationId',
      label: 'Consultation',
      type: consultations.length > 0 ? 'select' : 'text',
      required: true,
      options: consultations.length > 0 ? consultations.map((consultation) => consultation.id) : undefined,
      optionLabels: consultationLabel,
      hint: consultations.length === 0 ? 'Consultation list unavailable — enter the CONSULTATION_ID directly.' : undefined
    },
    { name: 'amount', label: 'Payment amount', type: 'number', min: 0, required: true },
    { name: 'paidBy', label: 'Paid by', type: 'select', options: methodOptions, required: true }],

    [consultations, consultationLabel, methodOptions]
  );

  const filtered = useMemo(
    () => payments.filter((payment) => matchesQuery(payment.raw, query) && (!method || payment.paidBy === method)),
    [payments, query, method]
  );

  /** Totals are derived from the rows the backend returned — nothing is assumed. */
  const totals = useMemo(() => {
    const byMethod = new Map<string, {count: number;amount: number;}>();
    let amount = 0;
    filtered.forEach((payment) => {
      const value = payment.amount ?? 0;
      amount += value;
      const key = payment.paidBy || 'Unspecified';
      const current = byMethod.get(key) ?? { count: 0, amount: 0 };
      byMethod.set(key, { count: current.count + 1, amount: current.amount + value });
    });
    return {
      amount,
      count: filtered.length,
      breakdown: Array.from(byMethod.entries()).sort((a, b) => b[1].amount - a[1].amount)
    };
  }, [filtered]);

  const columns: Column<Payment>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '72px',
    render: (payment) => <span className="font-mono text-xs text-ink-muted">{orDash(payment.id)}</span>
  },
  {
    key: 'consultation',
    header: 'Consultation',
    render: (payment) =>
    <span className="font-medium text-ink">
          {consultationLabel[payment.consultationId] ?? (payment.consultationId ? `#${payment.consultationId}` : '—')}
        </span>

  },
  { key: 'paidBy', header: 'Paid by', render: (payment) => payment.paidBy ? <Badge>{humanise(payment.paidBy)}</Badge> : '—' },
  { key: 'amount', header: 'Amount', align: 'right', render: (payment) => formatCurrency(payment.amount) },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    width: '110px',
    render: (payment) =>
    <span className="flex justify-end gap-1">
          <button
        type="button"
        aria-label={`Edit payment ${payment.id}`}
        onClick={() => {
          setEditing(payment);
          setFormOpen(true);
        }}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink">
        
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
        type="button"
        aria-label={`Delete payment ${payment.id}`}
        onClick={() => setPendingDelete(payment)}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-status-badbg hover:text-status-bad">
        
            <Trash2Icon size={14} aria-hidden="true" />
          </button>
        </span>

  }];


  const handleSubmit = async (values: FormValues) => {
    const body = payloads.payment(values);
    const ok = await save(editing?.id ?? null, body);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <section className="rounded-lg border border-sky-900/40 bg-gradient-to-br from-[#0c233c] via-[#0f2d4a] to-[#0a394a] p-4 text-white shadow-panel">
            <p className="text-2xs font-semibold uppercase tracking-wider text-teal-300">Amount in view</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular">
              {list.loading ? <span className="inline-block h-7 w-32 animate-pulse rounded bg-white/15" /> : formatCurrency(totals.amount)}
            </p>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-soft">Payments in view</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink tabular">
              {list.loading ? <span className="inline-block h-7 w-14 animate-pulse rounded bg-canvas" /> : formatNumber(totals.count)}
            </p>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-soft">Method breakdown</p>
            {totals.breakdown.length === 0 ?
            <p className="mt-1.5 text-sm text-ink-muted">—</p> :

            <ul className="mt-1.5 space-y-1">
                {totals.breakdown.map(([key, value]) =>
              <li key={key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-ink">{humanise(key)}</span>
                    <span className="shrink-0 text-ink-muted tabular">
                      {formatNumber(value.count)} · {formatCurrency(value.amount)}
                    </span>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>

        <Panel>
          <Toolbar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search payments by ID, consultation, method…"
            filters={[{ id: 'method', label: 'Method', value: method, options: methodOptions, onChange: setMethod }]}
            resultLabel={list.loading ? undefined : `${filtered.length} of ${payments.length}`}
            actionLabel="Record payment"
            onAction={() => {
              setEditing(null);
              setFormOpen(true);
            }} />
          
          <DataTable
            caption="Consultation payments"
            columns={columns}
            rows={filtered}
            getRowKey={(payment) => payment.id}
            loading={list.loading}
            errorMessage={list.error ? friendlyMessage(list.error, 'payments') : undefined}
            onRetry={list.refetch}
            emptyTitle={payments.length === 0 ? 'No payments returned by the backend' : 'No payments match these filters'}
            emptyHint={
            payments.length === 0 ?
            'The request succeeded but the PAYMENT table returned no rows.' :
            'Clear the search or filter to see all records.'
            } />
          
        </Panel>
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit payment' : 'Record payment'}
        description={editing ? `Updating payment ${orDash(editing.id)}` : 'Creates a new row in the PAYMENT table'}>
        
        <EntityForm
          fields={fields}
          initialValues={
          editing ?
          {
            consultationId: editing.consultationId,
            amount: editing.amount === undefined ? '' : String(editing.amount),
            paidBy: editing.paidBy
          } :
          undefined
          }
          submitLabel={editing ? 'Save changes' : 'Record payment'}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }} />
        
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete payment"
        message={`This permanently removes payment #${pendingDelete?.id ?? ''} from the billing record.`}
        busy={submitting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
        }} />
      
    </>);

}
