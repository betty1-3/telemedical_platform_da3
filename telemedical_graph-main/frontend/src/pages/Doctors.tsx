import React, { useMemo, useState } from 'react';
import { PencilIcon, StarIcon, Trash2Icon } from 'lucide-react';
import type { Doctor, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { doctorsApi } from '../utils/api/doctors';
import { hospitalsApi } from '../utils/api/hospitals';
import { friendlyMessage } from '../utils/api/client';
import { toDoctor, toHospital } from '../utils/entities';
import { matchesQuery, pickString } from '../utils/fields';
import { formatDate, formatGender, humanise, initials, orDash } from '../utils/format';
import { payloads } from '../utils/api/payloads';
import { Badge, DetailList, Panel } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { RelatedCollection } from '../components/RelatedCollection';
import { DoctorFormModal } from '../components/forms/DoctorFormModal';
import type { DoctorFormState } from '../components/forms/DoctorFormModal';

export function DoctorsPage() {
  const list = useResource<Row[]>(() => doctorsApi.list(), []);
  const specializationList = useResource<Row[]>(() => doctorsApi.allSpecializations(), []);
  const hospitalList = useResource<Row[]>(() => hospitalsApi.list(), []);

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const hospitals = useMemo(() => (hospitalList.data ?? []).map(toHospital), [hospitalList.data]);

  const specializationByDoctor = useMemo(() => {
    const map: Record<string, string> = {};
    (specializationList.data ?? []).forEach((row) => {
      const doctorId = pickString(row, ['doctor_id', 'doctorId']);
      if (doctorId && !map[doctorId]) map[doctorId] = pickString(row, ['specialization']);
    });
    return map;
  }, [specializationList.data]);

  const doctors = useMemo(
    () =>
      rows.map((row) => {
        const d = toDoctor(row);
        const spec = d.specialization || specializationByDoctor[d.id] || '';
        return { ...d, specialization: spec };
      }),
    [rows, specializationByDoctor]
  );

  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [gender, setGender] = useState('');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<DoctorFormState> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null);

  const { submitting, save, remove } = useCrud(doctorsApi, 'doctor', list.refetch);

  const hospitalOptions = useMemo(
    () => hospitals.map((h) => ({ id: h.id, name: h.name })),
    [hospitals]
  );

  const specializationOptions = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) set.add(d.specialization);
    });
    return Array.from(set);
  }, [doctors]);

  const filtered = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          matchesQuery(doctor.raw, query) &&
          (!specialization || doctor.specialization === specialization) &&
          (!gender || doctor.gender === gender)
      ),
    [doctors, query, specialization, gender]
  );

  const openAddForm = () => {
    setEditing(null);
    setFormInitialData(null);
    setFormOpen(true);
  };

  const openEditForm = async (doctor: Doctor) => {
    setEditing(doctor);
    try {
      const full = await doctorsApi.get(doctor.id);
      const phones = Array.isArray(full.phones) ? (full.phones as string[]) : [];
      const qualifications = Array.isArray(full.qualifications) ? (full.qualifications as string[]) : [];
      const spec = typeof full.specialization === 'string' ? full.specialization : doctor.specialization;
      const ratingVal = full.rating !== undefined && full.rating !== null ? String(full.rating) : doctor.rating;
      const linkedHospitals = Array.isArray(full.hospitals)
        ? (full.hospitals as Array<{ hospitalId?: number | string; hospital_id?: number | string; role?: string }>).map((h) => ({
            hospitalId: String(h.hospitalId ?? h.hospital_id ?? ''),
            role: h.role ?? ''
          }))
        : [];

      setFormInitialData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        gender: doctor.gender,
        dob: doctor.dob,
        dateJoined: doctor.dateJoined,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        specialization: spec,
        rating: ratingVal,
        phones,
        qualifications,
        hospitals: linkedHospitals
      });
    } catch {
      setFormInitialData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        gender: doctor.gender,
        dob: doctor.dob,
        dateJoined: doctor.dateJoined,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        specialization: doctor.specialization,
        rating: doctor.rating,
        phones: [],
        qualifications: [],
        hospitals: []
      });
    }
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: DoctorFormState) => {
    const payload = payloads.doctor(data, {
      phones: data.phones.filter((p) => p.trim().length > 0),
      qualifications: data.qualifications.filter((q) => q.trim().length > 0),
      specialization: data.specialization.trim(),
      rating: data.rating ? Number(data.rating) : null,
      hospitals: data.hospitals.filter((h) => h.hospitalId).map((h) => ({ hospitalId: h.hospitalId, role: h.role }))
    });

    const ok = await save(payload, editing?.id);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
      setRefreshKey((k) => k + 1);
      if (selected && (!editing || editing.id === selected.id)) {
        try {
          const updated = await doctorsApi.get(selected.id);
          setSelected(toDoctor(updated));
        } catch {
          // ignore
        }
      }
    }
  };

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      render: (doctor) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-2xs font-bold text-teal-700 ring-1 ring-teal-200/60">
            {initials(doctor.firstName, doctor.lastName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{doctor.fullName}</span>
            <span className="block text-2xs text-ink-soft">ID {orDash(doctor.id)}</span>
          </span>
        </span>
      )
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (doctor) => (doctor.specialization ? <Badge tone="info">{humanise(doctor.specialization)}</Badge> : '—')
    },
    { key: 'license', header: 'License', render: (doctor) => orDash(doctor.licenseNumber), hideBelow: 'lg' },
    {
      key: 'experience',
      header: 'Experience',
      align: 'right',
      render: (doctor) => (doctor.experience ? `${doctor.experience} yrs` : '—'),
      hideBelow: 'md'
    },
    {
      key: 'rating',
      header: 'Rating',
      align: 'right',
      render: (doctor) =>
        doctor.rating ? (
          <span className="inline-flex items-center justify-end gap-1 tabular">
            <StarIcon size={12} aria-hidden="true" className="text-amber-500 fill-amber-400" />
            {doctor.rating}
          </span>
        ) : (
          '—'
        ),
      hideBelow: 'md'
    },
    { key: 'joined', header: 'Joined', render: (doctor) => formatDate(doctor.dateJoined), hideBelow: 'xl' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (doctor) => (
        <span className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${doctor.fullName}`}
            onClick={(event) => {
              event.stopPropagation();
              openEditForm(doctor);
            }}
            className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-slate-100 hover:text-ink"
          >
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${doctor.fullName}`}
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(doctor);
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
          searchPlaceholder="Search doctors by name, license..."
          filters={[
            {
              id: 'specialization',
              label: 'Specialization',
              value: specialization,
              options: specializationOptions,
              onChange: setSpecialization
            },
            {
              id: 'gender',
              label: 'Gender',
              value: gender,
              options: ['M', 'F', 'O'],
              onChange: setGender
            }
          ]}
          actionLabel="Add doctor"
          onAction={openAddForm}
          resultLabel={`${filtered.length} of ${doctors.length}`}
        />

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(doctor) => doctor.id}
          loading={list.loading}
          errorMessage={friendlyMessage(list.error, 'doctors')}
          onRetry={list.refetch}
          caption="Practitioner registry"
          onRowClick={(doctor) => setSelected(doctor)}
          selectedKey={selected?.id}
          emptyTitle={doctors.length === 0 ? 'No doctors returned by the backend' : 'No doctors match these filters'}
          emptyHint={
            doctors.length === 0
              ? 'The request succeeded but the DOCTOR table returned no rows.'
              : 'Clear the search or filters to see all records.'
          }
        />
      </Panel>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.fullName ?? ''}
        subtitle={selected ? `Doctor ID ${orDash(selected.id)}` : undefined}
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
                { label: 'Gender', value: formatGender(selected.gender) },
                { label: 'Date of birth', value: formatDate(selected.dob) },
                { label: 'Date joined', value: formatDate(selected.dateJoined) },
                { label: 'License number', value: orDash(selected.licenseNumber) },
                { label: 'Experience', value: selected.experience ? `${selected.experience} years` : '—' },
                { label: 'Rating', value: orDash(selected.rating) }
              ]}
            />

            <RelatedCollection
              title="Specializations"
              subject="specializations"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => doctorsApi.specializations(selected.id)}
            />

            <RelatedCollection
              title="Qualifications"
              subject="qualifications"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => doctorsApi.qualifications(selected.id)}
            />

            <RelatedCollection
              title="Ratings"
              subject="ratings"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => doctorsApi.ratings(selected.id)}
            />

            <RelatedCollection
              title="Phone numbers"
              subject="phone numbers"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => doctorsApi.phones(selected.id)}
            />

            <RelatedCollection
              title="Associated hospitals"
              subject="hospital affiliations"
              dependency={`${selected.id}-${refreshKey}`}
              loader={() => doctorsApi.hospitals(selected.id)}
            />
          </>
        ) : null}
      </DetailDrawer>

      <DoctorFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit doctor' : 'Add doctor'}
        description={editing ? `Updating doctor ${orDash(editing.id)} and related records` : 'Creates doctor with qualifications, phones, specialization, and affiliations'}
        initialData={formInitialData}
        hospitalOptions={hospitalOptions}
        submitting={submitting}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete doctor"
        message={`This permanently removes ${pendingDelete?.fullName ?? 'this doctor'} and all their associated phones, qualifications, ratings, and hospital links.`}
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
