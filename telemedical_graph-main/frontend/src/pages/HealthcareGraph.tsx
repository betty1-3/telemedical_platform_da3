import { useMemo, useState } from 'react';
import { NetworkIcon, RouteIcon, SearchIcon, Share2Icon } from 'lucide-react';
import type { Doctor, Patient, Row } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { doctorsApi } from '../utils/api/doctors';
import { patientsApi } from '../utils/api/patients';
import type { GraphReferralPath } from '../utils/api/graph';
import { graphApi } from '../utils/api/graph';
import { friendlyMessage } from '../utils/api/client';
import { toDoctor, toPatient } from '../utils/entities';
import { formatDate, humanise } from '../utils/format';
import { Badge, Panel, toneForStatus } from '../components/ui/Panel';
import { BlockSkeleton, EmptyState, ErrorState } from '../components/ui/StateBlock';
import { GraphDiagram } from '../components/graph/GraphDiagram';

const selectClass = 'mt-1 w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function HealthcareGraphPage() {
  const patientRows = useResource<Row[]>(() => patientsApi.list(), []);
  const doctorRows = useResource<Row[]>(() => doctorsApi.list(), []);
  const patients = useMemo(() => (patientRows.data ?? []).map(toPatient), [patientRows.data]);
  const doctors = useMemo(() => (doctorRows.data ?? []).map(toDoctor), [doctorRows.data]);
  const specializations = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))).sort(),
    [doctors]
  );

  const [specialization, setSpecialization] = useState('');
  const [excludeDoctorId, setExcludeDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [referralDoctorId, setReferralDoctorId] = useState('');
  const [referralTargetId, setReferralTargetId] = useState('');
  const [graphPatientId, setGraphPatientId] = useState('9001');
  const [graphPatientFirstName, setGraphPatientFirstName] = useState('Demo');
  const [graphPatientLastName, setGraphPatientLastName] = useState('Patient');
  const [graphPatientDob, setGraphPatientDob] = useState('1990-01-01');
  const [graphPatientGender, setGraphPatientGender] = useState('');
  const [graphPatientCity, setGraphPatientCity] = useState('Demo City');
  const [graphPatientArea, setGraphPatientArea] = useState('');
  const [graphPatientPincode, setGraphPatientPincode] = useState('');
  const [graphCrudMessage, setGraphCrudMessage] = useState('');
  const [graphCrudBusy, setGraphCrudBusy] = useState(false);
  const patientBody = () => ({
    firstName: graphPatientFirstName.trim(),
    lastName: graphPatientLastName.trim(),
    dob: graphPatientDob,
    gender: graphPatientGender || undefined,
    city: graphPatientCity.trim(),
    area: graphPatientArea || undefined,
    pincode: graphPatientPincode || undefined
  });

  async function runGraphPatientAction(action: 'read' | 'create' | 'update' | 'delete') {
    const id = Number(graphPatientId);
    if ((action !== 'create' && (!Number.isSafeInteger(id) || id < 1)) ||
        !graphPatientFirstName.trim() || !graphPatientLastName.trim() || !graphPatientDob || !graphPatientCity.trim()) {
      setGraphCrudMessage('Enter the patient name, date of birth, city, and a valid ID for read/update/delete.');
      return;
    }
    setGraphCrudBusy(true);
    setGraphCrudMessage('');
    try {
      if (action === 'read') {
        const [node, row] = await Promise.all([graphApi.patientNode(String(id)), patientsApi.get(String(id))]);
        const patient = toPatient(row);
        setGraphPatientFirstName(patient.firstName);
        setGraphPatientLastName(patient.lastName);
        setGraphPatientDob(patient.dob);
        setGraphPatientGender(patient.gender);
        setGraphPatientCity(patient.city);
        setGraphPatientArea(patient.area);
        setGraphPatientPincode(patient.pincode);
        setGraphCrudMessage(`Found ${node.label} in Neo4j and loaded its Oracle record.`);
      } else if (action === 'create') {
        const node = await graphApi.createPatientNode(patientBody());
        const createdId = node.id.replace('Patient:', '');
        setGraphPatientId(createdId);
        setGraphCrudMessage(`Created patient ${createdId} in Oracle and refreshed Neo4j.`);
      } else if (action === 'update') {
        await graphApi.updatePatientNode(String(id), patientBody());
        setGraphCrudMessage(`Updated patient ${id} in Oracle and refreshed Neo4j.`);
      } else {
        await graphApi.deletePatientNode(String(id));
        setGraphCrudMessage(`Deleted patient ${id} from Oracle and refreshed Neo4j. Oracle foreign keys may prevent deletion when related records exist.`);
      }
    } catch (error) {
      setGraphCrudMessage(friendlyMessage(error, 'graph patient') ?? 'Graph operation failed.');
    } finally {
      setGraphCrudBusy(false);
    }
  }

  const discovery = useResource(
    () => graphApi.discoverDoctors(specialization, excludeDoctorId || undefined),
    [specialization, excludeDoctorId],
    Boolean(specialization)
  );
  const journey = useResource(() => graphApi.patientJourney(patientId), [patientId], Boolean(patientId));
  const referrals = useResource(() => graphApi.referrals(referralDoctorId), [referralDoctorId], Boolean(referralDoctorId));
  const referralPaths = useResource(
    () => graphApi.referralPaths(referralDoctorId, referralTargetId),
    [referralDoctorId, referralTargetId],
    Boolean(referralDoctorId && referralTargetId && referralDoctorId !== referralTargetId)
  );
  const graph = useResource(() => graphApi.patientVisualization(patientId), [patientId], Boolean(patientId));

  return (
    <div className="space-y-5">
      <Panel
        title="Doctor Discovery"
        description="Searches Neo4j by specialization; results are not copied into the frontend."
        bodyPadding
        actions={<SearchIcon size={16} aria-hidden="true" className="text-brand-600" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-ink">
            Specialization
            <select value={specialization} onChange={(event) => setSpecialization(event.target.value)} className={selectClass}>
              <option value="">Choose a specialization</option>
              {specializations.map((item) => <option key={item} value={item}>{humanise(item)}</option>)}
            </select>
          </label>
          <DoctorSelect label="Exclude currently treating doctor" doctors={doctors} value={excludeDoctorId} onChange={setExcludeDoctorId} optional />
        </div>

        {!specialization ? <p className="mt-4 text-xs text-ink-muted">Choose a specialization to query the Healthcare Graph.</p> : null}
        {discovery.loading ? <div className="mt-4"><BlockSkeleton height={96} /></div> : null}
        {discovery.error ? <ErrorState compact message={friendlyMessage(discovery.error, 'doctor discovery') ?? 'Unable to load doctor discovery.'} onRetry={discovery.refetch} /> : null}
        {discovery.data && discovery.data.length === 0 ? <EmptyState compact title="No graph doctors match this specialization" hint="The graph returned an empty result; try another specialization or remove the exclusion." /> : null}
        {discovery.data && discovery.data.length > 0 ? (
          <ul className="mt-4 divide-y divide-line rounded-md border border-line">
            {discovery.data.map((doctor) => (
              <li key={doctor.doctorId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{doctor.name}</span>
                  <span className="block text-2xs text-ink-muted">Doctor ID {doctor.doctorId}</span>
                </span>
                <Badge tone="info">{humanise(doctor.specialization)}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Patient Care Journey"
          description="Appointments and doctors linked in Neo4j. Graph responses expose patient IDs, not patient names."
          bodyPadding
          actions={<RouteIcon size={16} aria-hidden="true" className="text-brand-600" />}
        >
          <PatientSelect patients={patients} value={patientId} onChange={setPatientId} />
          {patientRows.error ? <ErrorState compact message={friendlyMessage(patientRows.error, 'patients') ?? 'Unable to load patients.'} onRetry={patientRows.refetch} /> : null}
          {!patientId ? <p className="mt-4 text-xs text-ink-muted">Choose a relational patient record to request its graph journey.</p> : null}
          {journey.loading ? <div className="mt-4"><BlockSkeleton height={170} /></div> : null}
          {journey.error ? <ErrorState compact message={friendlyMessage(journey.error, 'patient journey') ?? 'Unable to load the patient journey.'} onRetry={journey.refetch} /> : null}
          {journey.data && journey.data.length === 0 ? <EmptyState compact title="No appointments are linked in Neo4j" hint="The relational record may exist without a graph projection." /> : null}
          {journey.data && journey.data.length > 0 ? (
            <ol className="mt-4 space-y-2">
              {journey.data.map((item) => (
                <li key={item.appointmentId} className="rounded-md border border-line bg-slate-50 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium text-ink">Appointment #{item.appointmentId} · {item.doctorName}</span>
                      <span className="block text-2xs text-ink-muted">Doctor ID {item.doctorId} · {formatDate(item.appointmentDate)} · {humanise(item.mode)}</span>
                    </span>
                    <Badge tone={toneForStatus(item.status)}>{humanise(item.status)}</Badge>
                  </div>
                  {item.consulted ? <p className="mt-1 text-2xs font-medium text-emerald-700">Completed consultation linked</p> : null}
                </li>
              ))}
            </ol>
          ) : null}
        </Panel>

        <Panel
          title="Doctor Referral Network"
          description="REFERRED_TO is graph-only synthetic prototype data, never inferred from Oracle records."
          bodyPadding
          actions={<Share2Icon size={16} aria-hidden="true" className="text-brand-600" />}
        >
          <DoctorSelect label="Referring doctor" doctors={doctors} value={referralDoctorId} onChange={setReferralDoctorId} />
          <DoctorSelect label="Find a path to (optional)" doctors={doctors.filter((doctor) => doctor.id !== referralDoctorId)} value={referralTargetId} onChange={setReferralTargetId} optional extraClass="mt-3" />
          {!referralDoctorId ? <p className="mt-4 text-xs text-ink-muted">Choose a doctor to inspect outgoing graph-only referral records.</p> : null}
          {referrals.loading ? <div className="mt-4"><BlockSkeleton height={120} /></div> : null}
          {referrals.error ? <ErrorState compact message={friendlyMessage(referrals.error, 'referral network') ?? 'Unable to load referrals.'} onRetry={referrals.refetch} /> : null}
          {referrals.data && referrals.data.length === 0 ? <EmptyState compact title="No outgoing referrals" hint="This doctor exists in Neo4j but has no direct referral edges." /> : null}
          {referrals.data && referrals.data.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {referrals.data.map((referral) => (
                <li key={`${referral.fromDoctorId}-${referral.toDoctorId}`} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-medium text-ink">{referral.fromDoctorName} → {referral.toDoctorName}</p>
                  <p className="mt-0.5 text-2xs text-ink-muted">{referral.reason || 'No reason provided'} · {formatDate(referral.referredOn || '')}</p>
                  <p className="mt-1 text-2xs font-medium text-amber-700">Graph-only synthetic referral</p>
                </li>
              ))}
            </ul>
          ) : null}
          {referralPaths.loading ? <div className="mt-4"><BlockSkeleton height={72} /></div> : null}
          {referralPaths.error ? <ErrorState compact message={friendlyMessage(referralPaths.error, 'referral paths') ?? 'Unable to load referral paths.'} onRetry={referralPaths.refetch} /> : null}
          {referralTargetId && referralDoctorId && referralDoctorId !== referralTargetId && referralPaths.data && referralPaths.data.length === 0 ? <EmptyState compact title="No referral path found" hint="No directed path connects the selected doctors within three hops." /> : null}
          {referralPaths.data && referralPaths.data.length > 0 ? <div className="mt-4 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-xs text-brand-900"><span className="font-semibold">Path found: </span>{pathLabel(referralPaths.data[0])}</div> : null}
        </Panel>
      </div>

      <Panel
        title="Patient CRUD through the Graph API"
        description="These requests write to Oracle and then refresh the Neo4j projection. Oracle generates the ID; deletion follows Oracle foreign key rules."
        bodyPadding
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-ink">Patient ID (for read/update/delete)<input type="number" min="1" value={graphPatientId} onChange={(event) => setGraphPatientId(event.target.value)} className={selectClass} /></label>
          <label className="text-xs font-medium text-ink">First name<input value={graphPatientFirstName} onChange={(event) => setGraphPatientFirstName(event.target.value)} className={selectClass} maxLength={50} /></label>
          <label className="text-xs font-medium text-ink">Last name<input value={graphPatientLastName} onChange={(event) => setGraphPatientLastName(event.target.value)} className={selectClass} maxLength={50} /></label>
          <label className="text-xs font-medium text-ink">Date of birth<input type="date" value={graphPatientDob} onChange={(event) => setGraphPatientDob(event.target.value)} className={selectClass} /></label>
          <label className="text-xs font-medium text-ink">Gender<select value={graphPatientGender} onChange={(event) => setGraphPatientGender(event.target.value)} className={selectClass}><option value="">Not specified</option><option value="F">Female</option><option value="M">Male</option><option value="O">Other</option></select></label>
          <label className="text-xs font-medium text-ink">City<input value={graphPatientCity} onChange={(event) => setGraphPatientCity(event.target.value)} className={selectClass} maxLength={80} /></label>
          <label className="text-xs font-medium text-ink">Area<input value={graphPatientArea} onChange={(event) => setGraphPatientArea(event.target.value)} className={selectClass} maxLength={80} /></label>
          <label className="text-xs font-medium text-ink">Pincode<input value={graphPatientPincode} onChange={(event) => setGraphPatientPincode(event.target.value)} className={selectClass} maxLength={10} /></label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['read', 'create', 'update', 'delete'] as const).map((action) => <button key={action} type="button" disabled={graphCrudBusy} onClick={() => void runGraphPatientAction(action)} className="rounded-md border border-line-strong px-3 py-1.5 text-xs font-semibold capitalize text-ink hover:bg-slate-50 disabled:opacity-50">{action}</button>)}
        </div>
        {graphCrudMessage ? <p role="status" className="mt-3 text-xs text-ink-muted">{graphCrudMessage}</p> : null}
      </Panel>

      <Panel
        title="Interactive Graph"
        description="A bounded rendering of the Neo4j graph API. Select a node to inspect its stable ID and type."
        bodyPadding
        actions={<NetworkIcon size={16} aria-hidden="true" className="text-brand-600" />}
      >
        {!patientId ? <EmptyState compact title="Choose a patient care journey first" hint="The graph visualizer will request the same patient ID from the Neo4j graph API." /> : null}
        {graph.loading ? <BlockSkeleton height={350} /> : null}
        {graph.error ? <ErrorState compact message={friendlyMessage(graph.error, 'graph visualization') ?? 'Unable to load graph visualization.'} onRetry={graph.refetch} /> : null}
        {graph.data && graph.data.nodes.length === 0 ? <EmptyState compact title="No connected graph nodes were returned" hint="The graph record may be incomplete or absent." /> : null}
        {graph.data && graph.data.nodes.length > 0 ? <GraphDiagram graph={graph.data} /> : null}
      </Panel>
    </div>
  );
}

function PatientSelect({ patients, value, onChange }: { patients: Patient[]; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-medium text-ink">Patient record<select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}><option value="">Choose a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} (#{patient.id})</option>)}</select></label>;
}

function DoctorSelect({ label, doctors, value, onChange, optional = false, extraClass = '' }: { label: string; doctors: Doctor[]; value: string; onChange: (value: string) => void; optional?: boolean; extraClass?: string }) {
  return <label className={`block text-xs font-medium text-ink ${extraClass}`}>{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}><option value="">{optional ? 'Do not select a doctor' : 'Choose a doctor'}</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName} (#{doctor.id})</option>)}</select></label>;
}

function pathLabel(path: GraphReferralPath): string {
  if (path.steps.length === 0) return 'No steps';
  return [...path.steps.map((step) => step.fromDoctorName), path.steps[path.steps.length - 1].toDoctorName].join(' → ');
}
