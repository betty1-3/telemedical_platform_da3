import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Patient, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { patientsApi } from '../utils/api/patients';
import { friendlyMessage } from '../utils/api/client';
import { toPatient } from '../utils/entities';
import { distinctValues, matchesQuery } from '../utils/fields';
import { formatDate, formatGender, initials, orDash } from '../utils/format';
import { payloads } from '../utils/api/payloads';
import { Panel, DetailList } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { RelatedCollection } from '../components/RelatedCollection';
import { PatientFormModal } from '../components/forms/PatientFormModal';
import type { PatientFormState } from '../components/forms/PatientFormModal';

export function PatientsPage() {
  const list = useResource<Row[]>(() => patientsApi.list(), []);
  const rows = useMemo(() => list.data ?? [], [list.data]);
  const patients = useMemo(() => rows.map(toPatient), [rows]);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<PatientFormState> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);

  const { submitting, save, remove } = useCrud(patientsApi, 'patient', list.refetch);

  const cityOptions = useMemo(() => distinctValues(rows, ['city']), [rows]);

  const filtered = useMemo(
    () =>
      patients.filter(
        (patient) =>
          matchesQuery(patient.raw, query) && (!city || patient.city === city) && (!gender || patient.gender === gender)
      ),
    [patients, query, city, gender]
  );

  const openAddForm = () => {
    setEditing(null);
    setFormInitialData(null);
    setFormOpen(true);
  };

  const openEditForm = async (patient: Patient) => {
    setEditing(patient);
    try {
      const full = await patientsApi.get(patient.id);
      const phones = Array.isArray(full.phones) ? (full.phones as string[]) : [];
      const medicalRecords = Array.isArray(full.medicalRecords)
        ? (full.medicalRecords as Array<{ medicalRecordId?: string | number; symptoms?: string; diagnoses?: string }>).map((m) => ({
            medicalRecordId: String(m.medicalRecordId ?? ''),
            symptoms: m.symptoms ?? '',
            diagnoses: m.diagnoses ?? ''
          }))
        : [];
      const feedbacks = Array.isArray(full.feedbacks)
        ? (full.feedbacks as Array<{ feedbackId?: string | number; feedbackComment?: string; rating?: number }>).map((f) => ({
            feedbackId: String(f.feedbackId ?? ''),
            feedbackComment: f.feedbackComment ?? '',
            rating: f.rating ? Number(f.rating) : 5
          }))
        : [];

      setFormInitialData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob,
        gender: patient.gender,
        city: patient.city,
        area: patient.area,
        pincode: patient.pincode,
        phones,
        medicalRecords,
        feedbacks
      });
    } catch {
      setFormInitialData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob,
        gender: patient.gender,
        city: patient.city,
        area: patient.area,
        pincode: patient.pincode,
        phones: [],
        medicalRecords: [],
        feedbacks: []
      });
    }
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: PatientFormState) => {
    const payload = payloads.patient(data, {
      phones: data.phones.filter((p) => p.trim().length > 0),
      medicalRecords: data.medicalRecords.filter((m) => m.symptoms.trim() || m.diagnoses.trim()),
      feedbacks: data.feedbacks.filter((f) => f.feedbackComment.trim() || f.rating)
    });

    const ok = await save(payload, editing?.id);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
      setRefreshKey((k) => k + 1);
      if (selected && (!editing || editing.id === selected.id)) {
        try {
          const updated = await patientsApi.get(selected.id);
          setSelected(toPatient(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      render: (patient) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-2xs font-bold text-sky-700 ring-1 ring-sky-200/60">
            {initials(patient.firstName, patient.lastName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{patient.fullName}</span>
            <span className="block text-2xs text-ink-soft">ID {orDash(patient.id)}</span>
          </span>
        </span>
      )
    },
    { key: 'gender', header: 'Gender', render: (patient) => formatGender(patient.gender) },
    { key: 'dob', header: 'Date of birth', render: (patient) => formatDate(patient.dob), hideBelow: 'md' },
    { key: 'city', header: 'City', render: (patient) => orDash(patient.city) },
    { key: 'area', header: 'Area', render: (patient) => orDash(patient.area), hideBelow: 'lg' },
    { key: 'pincode', header: 'Pincode', render: (patient) => orDash(patient.pincode), hideBelow: 'lg' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (patient) => (
        <span className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${patient.fullName}`}
            onClick={(event) => {
              event.stopPropagation();
              openEditForm(patient);
            }}
            className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink"
          >
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${patient.fullName}`}
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(patient);
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
          searchPlaceholder="Search patients by name, city, ID..."
          filters={[
            {
              id: 'city',
              label: 'City',
              value: city,
              options: cityOptions,
              onChange: setCity
            },
            {
              id: 'gender',
              label: 'Gender',
              value: gender,
              options: ['M', 'F', 'O'],
              onChange: setGender
            }
          ]}
          actionLabel="Add patient"
          onAction={openAddForm}
          resultLabel={`${filtered.length} of ${patients.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(patient) => patient.id}
          loading={list.loading}
          errorMessage={friendlyMessage(list.error, 'patients')}
          onRetry={list.refetch}
          caption="Patient registry"
          onRowClick={(patient) => setSelected(patient)}
          selectedKey={selected?.id}
          emptyTitle={patients.length === 0 ? 'No patients returned by the backend' : 'No patients match these filters'}
          emptyHint={
            patients.length === 0
              ? 'The request succeeded but the PATIENT table returned no rows.'
              : 'Clear the search or filters to see all records.'
          }
        />
      </Panel>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.fullName ?? ''}
        subtitle={selected ? `Patient ID ${orDash(selected.id)}` : undefined}
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
                { label: 'First name', value: orDash(selected.firstName) },
                { label: 'Last name', value: orDash(selected.lastName) },
                { label: 'Date of birth', value: formatDate(selected.dob) },
                { label: 'Gender', value: formatGender(selected.gender) },
                { label: 'City', value: orDash(selected.city) },
                { label: 'Area', value: orDash(selected.area) },
                { label: 'Pincode', value: orDash(selected.pincode) }
              ]}
            />

            <RelatedCollection
              title="Phone numbers"
              subject="phone numbers"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => patientsApi.phones(selected.id)}
            />

            <RelatedCollection
              title="Medical records"
              subject="medical records"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => patientsApi.medicalRecords(selected.id)}
            />

            <RelatedCollection
              title="Feedback"
              subject="feedback"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => patientsApi.feedback(selected.id)}
            />
          </>
        ) : null}
      </DetailDrawer>

      <PatientFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit patient' : 'Add patient'}
        description={editing ? `Updating patient ${orDash(editing.id)} and clinical records` : 'Creates a new patient with phones, medical records, and feedback'}
        initialData={formInitialData}
        submitting={submitting}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete patient"
        message={`This permanently removes ${pendingDelete?.fullName ?? 'this patient'} and their associated phone numbers, medical records, and feedback history.`}
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
