import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Hospital, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { hospitalsApi } from '../utils/api/hospitals';
import { doctorsApi } from '../utils/api/doctors';
import { friendlyMessage } from '../utils/api/client';
import { toDoctor, toHospital } from '../utils/entities';
import { distinctValues, matchesQuery } from '../utils/fields';
import { payloads } from '../utils/api/payloads';
import { orDash } from '../utils/format';
import { DetailList, Panel } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { RelatedCollection } from '../components/RelatedCollection';
import { HospitalFormModal } from '../components/forms/HospitalFormModal';
import type { HospitalFormState } from '../components/forms/HospitalFormModal';

export function HospitalsPage() {
  const list = useResource<Row[]>(() => hospitalsApi.list(), []);
  const doctorList = useResource<Row[]>(() => doctorsApi.list(), []);

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const hospitals = useMemo(() => rows.map(toHospital), [rows]);
  const doctors = useMemo(() => (doctorList.data ?? []).map(toDoctor), [doctorList.data]);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [editing, setEditing] = useState<Hospital | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<HospitalFormState> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Hospital | null>(null);

  const { submitting, save, remove } = useCrud(hospitalsApi, 'hospital', list.refetch);

  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ id: d.id, fullName: d.fullName })),
    [doctors]
  );

  const cityOptions = useMemo(() => distinctValues(rows, ['city']), [rows]);

  const filtered = useMemo(
    () => hospitals.filter((hospital) => matchesQuery(hospital.raw, query) && (!city || hospital.city === city)),
    [hospitals, query, city]
  );

  const openAddForm = () => {
    setEditing(null);
    setFormInitialData(null);
    setFormOpen(true);
  };

  const openEditForm = async (hospital: Hospital) => {
    setEditing(hospital);
    try {
      const full = await hospitalsApi.get(hospital.id);
      const phones = Array.isArray(full.phones) ? (full.phones as string[]) : [];
      const linkedDoctors = Array.isArray(full.doctors)
        ? (full.doctors as Array<{ doctorId?: number | string; doctor_id?: number | string; role?: string }>).map((d) => ({
            doctorId: String(d.doctorId ?? d.doctor_id ?? ''),
            role: d.role ?? ''
          }))
        : [];

      setFormInitialData({
        hospitalName: hospital.name,
        street: hospital.street,
        area: hospital.area,
        city: hospital.city,
        pincode: hospital.pincode,
        phones,
        doctors: linkedDoctors
      });
    } catch {
      setFormInitialData({
        hospitalName: hospital.name,
        street: hospital.street,
        area: hospital.area,
        city: hospital.city,
        pincode: hospital.pincode,
        phones: [],
        doctors: []
      });
    }
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: HospitalFormState) => {
    const payload = payloads.hospital(data, {
      phones: data.phones.filter((p) => p.trim().length > 0),
      doctors: data.doctors.filter((d) => d.doctorId).map((d) => ({ doctorId: d.doctorId, role: d.role }))
    });

    const ok = await save(payload, editing?.id);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
      setRefreshKey((k) => k + 1);
      if (selected && (!editing || editing.id === selected.id)) {
        try {
          const updated = await hospitalsApi.get(selected.id);
          setSelected(toHospital(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  const columns: Column<Hospital>[] = [
    {
      key: 'name',
      header: 'Hospital',
      render: (hospital) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{hospital.name}</span>
          <span className="block text-2xs text-ink-soft">ID {orDash(hospital.id)}</span>
        </span>
      )
    },
    { key: 'street', header: 'Street', render: (hospital) => orDash(hospital.street) },
    { key: 'area', header: 'Area', render: (hospital) => orDash(hospital.area), hideBelow: 'md' },
    { key: 'city', header: 'City', render: (hospital) => orDash(hospital.city) },
    { key: 'pincode', header: 'Pincode', render: (hospital) => orDash(hospital.pincode), hideBelow: 'lg' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (hospital) => (
        <span className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${hospital.name}`}
            onClick={(event) => {
              event.stopPropagation();
              openEditForm(hospital);
            }}
            className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink"
          >
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${hospital.name}`}
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(hospital);
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
          searchPlaceholder="Search hospitals by name, city..."
          filters={[
            {
              id: 'city',
              label: 'City',
              value: city,
              options: cityOptions,
              onChange: setCity
            }
          ]}
          actionLabel="Add hospital"
          onAction={openAddForm}
          resultLabel={`${filtered.length} of ${hospitals.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(hospital) => hospital.id}
          loading={list.loading}
          errorMessage={friendlyMessage(list.error, 'hospitals')}
          onRetry={list.refetch}
          caption="Hospital facility directory"
          onRowClick={(hospital) => setSelected(hospital)}
          selectedKey={selected?.id}
          emptyTitle={hospitals.length === 0 ? 'No hospitals returned by the backend' : 'No hospitals match these filters'}
          emptyHint={
            hospitals.length === 0
              ? 'The request succeeded but the HOSPITAL table returned no rows.'
              : 'Clear the search or filters to see all records.'
          }
        />
      </Panel>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? `Hospital ID ${orDash(selected.id)}` : undefined}
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
                { label: 'Street', value: orDash(selected.street) },
                { label: 'Area', value: orDash(selected.area) },
                { label: 'City', value: orDash(selected.city) },
                { label: 'Pincode', value: orDash(selected.pincode) }
              ]}
            />

            <RelatedCollection
              title="Phone numbers"
              subject="phone numbers"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => hospitalsApi.phones(selected.id)}
            />

            <RelatedCollection
              title="Doctors at this hospital"
              subject="doctors"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => hospitalsApi.doctors(selected.id)}
            />
          </>
        ) : null}
      </DetailDrawer>

      <HospitalFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit hospital' : 'Add hospital'}
        description={editing ? `Updating hospital ${orDash(editing.id)} and practitioner links` : 'Creates hospital with contact numbers and affiliated doctors'}
        initialData={formInitialData}
        doctorOptions={doctorOptions}
        submitting={submitting}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete hospital"
        message={`This permanently removes ${pendingDelete?.name ?? 'this hospital'} and all its registered phone numbers and doctor affiliations.`}
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
