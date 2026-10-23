import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Consultation, Row } from '../types/entities';
import { CONSULTATION_MODES } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { consultationsApi } from '../utils/api/consultations';
import { patientsApi } from '../utils/api/patients';
import { doctorsApi } from '../utils/api/doctors';
import { friendlyMessage } from '../utils/api/client';
import { consultationKeys, toConsultation, toDoctor, toPatient } from '../utils/entities';
import { distinctValues, matchesQuery } from '../utils/fields';
import { payloads } from '../utils/api/payloads';
import { formatDate, formatTime, humanise, orDash } from '../utils/format';
import { Badge, DetailList, Panel, toneForStatus } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { EntityForm } from '../components/ui/EntityForm';
import type { FieldDef, FormValues } from '../components/ui/EntityForm';
import { DetailDrawer } from '../components/DetailDrawer';
import { RelatedCollection } from '../components/RelatedCollection';

export function ConsultationsPage() {
  const list = useResource<Row[]>(() => consultationsApi.list(), []);
  const patientList = useResource<Row[]>(() => patientsApi.list(), []);
  const doctorList = useResource<Row[]>(() => doctorsApi.list(), []);

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const consultations = useMemo(() => rows.map(toConsultation), [rows]);
  const patients = useMemo(() => (patientList.data ?? []).map(toPatient), [patientList.data]);
  const doctors = useMemo(() => (doctorList.data ?? []).map(toDoctor), [doctorList.data]);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('');
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [editing, setEditing] = useState<Consultation | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Consultation | null>(null);

  const { submitting, save, remove } = useCrud(consultationsApi, 'consultation', list.refetch);

  /** Status values are read from the data the backend returns — never invented. */
  const statusOptions = useMemo(() => distinctValues(rows, consultationKeys.status), [rows]);
  const modeOptions = useMemo(() => {
    const fromData = distinctValues(rows, consultationKeys.mode);
    return fromData.length > 0 ? fromData : [...CONSULTATION_MODES];
  }, [rows]);

  const patientLabel = useMemo(() => {
    const map: Record<string, string> = {};
    patients.forEach((patient) => {
      map[patient.id] = `${patient.fullName} (#${patient.id})`;
    });
    return map;
  }, [patients]);

  const doctorLabel = useMemo(() => {
    const map: Record<string, string> = {};
    doctors.forEach((doctor) => {
      map[doctor.id] = `${doctor.fullName} (#${doctor.id})`;
    });
    return map;
  }, [doctors]);

  /** ⚠️ VERIFY against the CONSULTATION request DTO. */
  const fields: FieldDef[] = useMemo(
    () => [
    {
      name: 'patientId',
      label: 'Patient',
      type: patients.length > 0 ? 'select' : 'text',
      required: true,
      options: patients.length > 0 ? patients.map((patient) => patient.id) : undefined,
      optionLabels: patientLabel,
      hint: patients.length === 0 ? 'Patient list unavailable — enter the PATIENT_ID directly.' : undefined
    },
    {
      name: 'doctorId',
      label: 'Doctor',
      type: doctors.length > 0 ? 'select' : 'text',
      required: true,
      options: doctors.length > 0 ? doctors.map((doctor) => doctor.id) : undefined,
      optionLabels: doctorLabel,
      hint: doctors.length === 0 ? 'Doctor list unavailable — enter the DOCTOR_ID directly.' : undefined
    },
    { name: 'bookingDate', label: 'Booking date', type: 'date' },
    { name: 'date', label: 'Consultation date', type: 'date', required: true },
    { name: 'startTime', label: 'Start time', type: 'time' },
    { name: 'endTime', label: 'End time', type: 'time' },
    {
      name: 'status',
      label: 'Status',
      type: statusOptions.length > 0 ? 'select' : 'text',
      options: statusOptions.length > 0 ? statusOptions : undefined,
      hint: statusOptions.length === 0 ? 'No status values loaded yet — type the value your schema uses.' : undefined
    },
    { name: 'consultationMode', label: 'Consultation mode', type: 'select', options: modeOptions, required: true },
    { name: 'videoLink', label: 'Video link', type: 'url', full: true },
    { name: 'callNumber', label: 'Call number', type: 'tel' },
    { name: 'chatTranscriptId', label: 'Chat transcript ID' }],

    [patients, doctors, patientLabel, doctorLabel, statusOptions, modeOptions]
  );

  const filtered = useMemo(
    () =>
    consultations.filter(
      (consultation) =>
      matchesQuery(consultation.raw, query) && (
      !status || consultation.status === status) && (
      !mode || consultation.mode === mode)
    ),
    [consultations, query, status, mode]
  );

  const nameFor = (consultation: Consultation): {patient: string;doctor: string;} => ({
    patient: consultation.patientName || patientLabel[consultation.patientId] || (consultation.patientId ? `Patient #${consultation.patientId}` : '—'),
    doctor: consultation.doctorName || doctorLabel[consultation.doctorId] || (consultation.doctorId ? `Doctor #${consultation.doctorId}` : '—')
  });

  const columns: Column<Consultation>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '72px',
    render: (consultation) => <span className="font-mono text-xs text-ink-muted">{orDash(consultation.id)}</span>
  },
  {
    key: 'people',
    header: 'Patient / Doctor',
    render: (consultation) => {
      const names = nameFor(consultation);
      return (
        <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{names.patient}</span>
            <span className="block truncate text-2xs text-ink-soft">with {names.doctor}</span>
          </span>);

    }
  },
  {
    key: 'when',
    header: 'Scheduled',
    render: (consultation) =>
    <span className="min-w-0">
          <span className="block text-ink">{formatDate(consultation.date)}</span>
          <span className="block text-2xs text-ink-soft tabular">
            {consultation.startTime || consultation.endTime ?
        `${formatTime(consultation.startTime)} – ${formatTime(consultation.endTime)}` :
        '—'}
          </span>
        </span>

  },
  { key: 'booked', header: 'Booked', render: (c) => formatDate(c.bookingDate), hideBelow: 'xl' },
  {
    key: 'status',
    header: 'Status',
    render: (consultation) =>
    consultation.status ? <Badge tone={toneForStatus(consultation.status)}>{humanise(consultation.status)}</Badge> : '—'
  },
  { key: 'mode', header: 'Mode', render: (consultation) => humanise(consultation.mode), hideBelow: 'md' },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    width: '110px',
    render: (consultation) =>
    <span className="flex justify-end gap-1">
          <button
        type="button"
        aria-label={`Edit consultation ${consultation.id}`}
        onClick={(event) => {
          event.stopPropagation();
          setEditing(consultation);
          setFormOpen(true);
        }}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink">
        
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
        type="button"
        aria-label={`Delete consultation ${consultation.id}`}
        onClick={(event) => {
          event.stopPropagation();
          setPendingDelete(consultation);
        }}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-status-badbg hover:text-status-bad">
        
            <Trash2Icon size={14} aria-hidden="true" />
          </button>
        </span>

  }];


  const initialValues: FormValues | undefined = editing ?
  {
    patientId: editing.patientId,
    doctorId: editing.doctorId,
    bookingDate: editing.bookingDate.slice(0, 10),
    date: editing.date.slice(0, 10),
    startTime: editing.startTime.slice(0, 5),
    endTime: editing.endTime.slice(0, 5),
    status: editing.status,
    consultationMode: editing.mode,
    videoLink: editing.videoLink,
    callNumber: editing.callNumber,
    chatTranscriptId: editing.chatTranscriptId
  } :
  undefined;

  const handleSubmit = async (values: FormValues) => {
    const body = payloads.consultation(values);
    const ok = await save(editing?.id ?? null, body);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
      setSelected(null);
    }
  };

  const selectedNames = selected ? nameFor(selected) : null;

  return (
    <>
      <Panel>
        <Toolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search consultations by ID, patient, doctor…"
          filters={[
          { id: 'status', label: 'Status', value: status, options: statusOptions, onChange: setStatus },
          { id: 'mode', label: 'Mode', value: mode, options: modeOptions, onChange: setMode }]
          }
          resultLabel={list.loading ? undefined : `${filtered.length} of ${consultations.length}`}
          actionLabel="New consultation"
          onAction={() => {
            setEditing(null);
            setFormOpen(true);
          }} />
        
        <DataTable
          caption="Consultations"
          columns={columns}
          rows={filtered}
          getRowKey={(consultation) => consultation.id}
          loading={list.loading}
          errorMessage={list.error ? friendlyMessage(list.error, 'consultations') : undefined}
          onRetry={list.refetch}
          onRowClick={setSelected}
          selectedKey={selected?.id}
          emptyTitle={consultations.length === 0 ? 'No consultations returned by the backend' : 'No consultations match these filters'}
          emptyHint={
          consultations.length === 0 ?
          'The request succeeded but the CONSULTATION table returned no rows.' :
          'Clear the search or filters to see all records.'
          } />
        
      </Panel>

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Consultation #${orDash(selected.id)}` : ''}
        subtitle={selectedNames ? `${selectedNames.patient} · ${selectedNames.doctor}` : undefined}
        actions={
        selected ?
        <button
          type="button"
          onClick={() => {
            setEditing(selected);
            setFormOpen(true);
          }}
          className="rounded border border-line-strong bg-white px-2.5 py-1 text-xs font-medium text-ink transition-colors duration-150 hover:bg-canvas">
          
              Edit
            </button> :
        null
        }>
        
        {selected ?
        <>
            <DetailList
            items={[
            { label: 'Status', value: selected.status ? <Badge tone={toneForStatus(selected.status)}>{humanise(selected.status)}</Badge> : '—' },
            { label: 'Consultation mode', value: humanise(selected.mode) },
            { label: 'Booking date', value: formatDate(selected.bookingDate) },
            { label: 'Date', value: formatDate(selected.date) },
            { label: 'Start time', value: formatTime(selected.startTime) },
            { label: 'End time', value: formatTime(selected.endTime) },
            {
              label: 'Video link',
              value: selected.videoLink ?
              <a
                href={selected.videoLink}
                target="_blank"
                rel="noreferrer"
                className="break-all text-brand-600 underline underline-offset-2">
                
                      {selected.videoLink}
                    </a> :

              '—'

            },
            { label: 'Call number', value: orDash(selected.callNumber) },
            { label: 'Chat transcript ID', value: orDash(selected.chatTranscriptId) }]
            } />
          
            <RelatedCollection
            title="Payment"
            subject="payment"
            dependency={selected.id}
            loader={() => consultationsApi.payment(selected.id)}
            emptyTitle="No payment recorded for this consultation" />
          
            <RelatedCollection
            title="Prescription"
            subject="prescription"
            dependency={selected.id}
            loader={() => consultationsApi.prescription(selected.id)}
            emptyTitle="No prescription issued for this consultation" />
          
          </> :
        null}
      </DetailDrawer>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit consultation' : 'New consultation'}
        description={editing ? `Updating consultation ${orDash(editing.id)}` : 'Creates a new row in the CONSULTATION table'}
        width="lg">
        
        <EntityForm
          fields={fields}
          initialValues={initialValues}
          submitLabel={editing ? 'Save changes' : 'Create consultation'}
          submitting={submitting}
          note="Consultation mode is sent as consultationMode; Spring Boot maps it to the Oracle consultation_mode column."
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }} />
        
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete consultation"
        message={`This permanently removes consultation #${pendingDelete?.id ?? ''} and may be rejected if a payment or prescription references it.`}
        busy={submitting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const ok = await remove(pendingDelete.id);
          setPendingDelete(null);
          if (ok && selected?.id === pendingDelete.id) setSelected(null);
        }} />
      
    </>);

}
