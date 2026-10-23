import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Prescription, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { prescriptionsApi } from '../utils/api/prescriptions';
import { consultationsApi } from '../utils/api/consultations';
import { medicinesApi } from '../utils/api/medicines';
import { testsApi } from '../utils/api/tests';
import { friendlyMessage } from '../utils/api/client';
import { toConsultation, toMedicine, toPrescription, toTest } from '../utils/entities';
import { matchesQuery } from '../utils/fields';
import { payloads } from '../utils/api/payloads';
import { formatDate, orDash } from '../utils/format';
import { DetailList, Panel } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { RelatedCollection } from '../components/RelatedCollection';
import { PrescriptionFormModal } from '../components/forms/PrescriptionFormModal';
import type { PrescriptionFormState } from '../components/forms/PrescriptionFormModal';

export function PrescriptionsPage() {
  const list = useResource<Row[]>(() => prescriptionsApi.list(), []);
  const consultationList = useResource<Row[]>(() => consultationsApi.list(), []);
  const medicineList = useResource<Row[]>(() => medicinesApi.list(), []);
  const testList = useResource<Row[]>(() => testsApi.list(), []);

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const prescriptions = useMemo(() => rows.map(toPrescription), [rows]);
  const consultations = useMemo(() => (consultationList.data ?? []).map(toConsultation), [consultationList.data]);
  const medicines = useMemo(() => (medicineList.data ?? []).map(toMedicine), [medicineList.data]);
  const tests = useMemo(() => (testList.data ?? []).map(toTest), [testList.data]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<PrescriptionFormState> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Prescription | null>(null);

  const { submitting, save, remove } = useCrud(prescriptionsApi, 'prescription', list.refetch);

  const consultationLabel = useMemo(() => {
    const map: Record<string, string> = {};
    consultations.forEach((consultation) => {
      const who = consultation.patientName || (consultation.patientId ? `Patient #${consultation.patientId}` : '');
      map[consultation.id] = who ? `#${consultation.id} · ${who}` : `#${consultation.id}`;
    });
    return map;
  }, [consultations]);

  const consultationOptions = useMemo(
    () =>
      consultations.map((c) => ({
        id: c.id,
        label: consultationLabel[c.id] ?? `#${c.id}`
      })),
    [consultations, consultationLabel]
  );

  const medicineOptions = useMemo(
    () => medicines.map((m) => ({ id: m.id, name: m.name, type: m.type })),
    [medicines]
  );

  const testOptions = useMemo(
    () => tests.map((t) => ({ id: t.id, name: t.name, type: t.type })),
    [tests]
  );

  const filtered = useMemo(
    () => prescriptions.filter((prescription) => matchesQuery(prescription.raw, query)),
    [prescriptions, query]
  );

  const openAddForm = () => {
    setEditing(null);
    setFormInitialData(null);
    setFormOpen(true);
  };

  const openEditForm = async (prescription: Prescription) => {
    setEditing(prescription);
    try {
      const full = await prescriptionsApi.get(prescription.id);
      const medicineIds = Array.isArray(full.medicineIds)
        ? (full.medicineIds as number[]).map(Number)
        : [];
      const testIds = Array.isArray(full.testIds)
        ? (full.testIds as number[]).map(Number)
        : [];

      setFormInitialData({
        consultationId: prescription.consultationId,
        prescriptionDate: prescription.prescriptionDate,
        dosage: prescription.dosage,
        medicineIds,
        testIds
      });
    } catch {
      setFormInitialData({
        consultationId: prescription.consultationId,
        prescriptionDate: prescription.prescriptionDate,
        dosage: prescription.dosage,
        medicineIds: [],
        testIds: []
      });
    }
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: PrescriptionFormState) => {
    const payload = payloads.prescription(data, {
      medicineIds: data.medicineIds,
      testIds: data.testIds
    });

    const ok = await save(payload, editing?.id);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
      setRefreshKey((k) => k + 1);
      if (selected && (!editing || editing.id === selected.id)) {
        try {
          const updated = await prescriptionsApi.get(selected.id);
          setSelected(toPrescription(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  const columns: Column<Prescription>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '72px',
      render: (prescription) => <span className="font-mono text-xs text-ink-muted">{orDash(prescription.id)}</span>
    },
    {
      key: 'consultation',
      header: 'Consultation',
      render: (prescription) => (
        <span className="font-medium text-ink">
          {consultationLabel[prescription.consultationId] ??
            (prescription.consultationId ? `#${prescription.consultationId}` : '—')}
        </span>
      )
    },
    { key: 'date', header: 'Prescription date', render: (prescription) => formatDate(prescription.prescriptionDate) },
    {
      key: 'dosage',
      header: 'Dosage',
      render: (prescription) => (
        <span className="block max-w-[280px] truncate text-ink-muted">{orDash(prescription.dosage)}</span>
      ),
      hideBelow: 'md'
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (prescription) => (
        <span className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit prescription #${prescription.id}`}
            onClick={(event) => {
              event.stopPropagation();
              openEditForm(prescription);
            }}
            className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink"
          >
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete prescription #${prescription.id}`}
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(prescription);
            }}
            className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2Icon size={14} aria-hidden="true" />
          </button>
        </span>
      )
    }
  ];

  return (
    <>
      <Panel>
        <Toolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search prescriptions by dosage..."
          actionLabel="Add prescription"
          onAction={openAddForm}
          resultLabel={`${filtered.length} of ${prescriptions.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(prescription) => prescription.id}
          loading={list.loading}
          errorMessage={friendlyMessage(list.error, 'prescriptions')}
          onRetry={list.refetch}
          caption="Prescription records"
          onRowClick={(prescription) => setSelected(prescription)}
          selectedKey={selected?.id}
          emptyTitle={
            prescriptions.length === 0 ? 'No prescriptions returned by the backend' : 'No prescriptions match these filters'
          }
          emptyHint={
            prescriptions.length === 0
              ? 'The request succeeded but the PRESCRIPTION table returned no rows.'
              : 'Clear the search to see all records.'
          }
        />
      </Panel>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Prescription #${orDash(selected.id)}` : ''}
        subtitle={selected ? consultationLabel[selected.consultationId] ?? `Consultation #${orDash(selected.consultationId)}` : undefined}
        actions={
          selected ? (
            <button
              type="button"
              onClick={() => openEditForm(selected)}
              className="rounded-md border border-line-strong bg-white px-2.5 py-1 text-xs font-medium text-ink transition-colors duration-150 hover:bg-slate-50"
            >
              Edit
            </button>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailList
              items={[
                { label: 'Consultation ID', value: orDash(selected.consultationId) },
                { label: 'Prescription date', value: formatDate(selected.prescriptionDate) },
                { label: 'Dosage', value: orDash(selected.dosage) }
              ]}
            />

            <RelatedCollection
              title="Prescribed medicines"
              subject="medicines"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => prescriptionsApi.medicines(selected.id)}
              emptyTitle="No medicines on this prescription"
            />

            <RelatedCollection
              title="Ordered tests"
              subject="tests"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => prescriptionsApi.tests(selected.id)}
              emptyTitle="No tests on this prescription"
            />
          </>
        ) : null}
      </DetailDrawer>

      <PrescriptionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit prescription' : 'Add prescription'}
        description={editing ? `Updating prescription #${orDash(editing.id)} with medicines & tests` : 'Creates prescription with prescribed medicines and ordered tests'}
        initialData={formInitialData}
        consultationOptions={consultationOptions}
        medicineOptions={medicineOptions}
        testOptions={testOptions}
        submitting={submitting}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete prescription"
        message={`This permanently removes prescription #${pendingDelete?.id ?? ''} and its linked medicine and test rows.`}
        busy={submitting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const ok = await remove(pendingDelete.id);
          setPendingDelete(null);
          if (ok && selected?.id === pendingDelete.id) setSelected(null);
        }}
      />
    </>
  );
}
