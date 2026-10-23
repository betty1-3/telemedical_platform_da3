import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Medicine, Row } from '../types/entities';
import { MEDICINE_TYPES } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { medicinesApi } from '../utils/api/medicines';
import { friendlyMessage } from '../utils/api/client';
import { medicineKeys, toMedicine } from '../utils/entities';
import { distinctValues, matchesQuery } from '../utils/fields';
import { payloads } from '../utils/api/payloads';
import { humanise, orDash } from '../utils/format';
import { Badge, Panel } from '../components/ui/Panel';
import { Toolbar } from '../components/ui/Toolbar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { EntityForm } from '../components/ui/EntityForm';
import type { FieldDef, FormValues } from '../components/ui/EntityForm';

/** ⚠️ VERIFY against the MEDICINE request DTO. */
const fields: FieldDef[] = [
{ name: 'medicineName', label: 'Medicine name', required: true },
{ name: 'medicineType', label: 'Medicine type', type: 'select', options: MEDICINE_TYPES, required: true }];


export function MedicinesPage() {
  const list = useResource<Row[]>(() => medicinesApi.list(), []);
  const rows = useMemo(() => list.data ?? [], [list.data]);
  const medicines = useMemo(() => rows.map(toMedicine), [rows]);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Medicine | null>(null);

  const { submitting, save, remove } = useCrud(medicinesApi, 'medicine', list.refetch);

  const typeOptions = useMemo(() => {
    const fromData = distinctValues(rows, medicineKeys.type);
    return fromData.length > 0 ? fromData : [...MEDICINE_TYPES];
  }, [rows]);

  const filtered = useMemo(
    () => medicines.filter((medicine) => matchesQuery(medicine.raw, query) && (!type || medicine.type === type)),
    [medicines, query, type]
  );

  const columns: Column<Medicine>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '72px',
    render: (medicine) => <span className="font-mono text-xs text-ink-muted">{orDash(medicine.id)}</span>
  },
  { key: 'name', header: 'Medicine', render: (medicine) => <span className="font-medium text-ink">{orDash(medicine.name)}</span> },
  { key: 'type', header: 'Type', render: (medicine) => medicine.type ? <Badge>{humanise(medicine.type)}</Badge> : '—' },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    width: '110px',
    render: (medicine) =>
    <span className="flex justify-end gap-1">
          <button
        type="button"
        aria-label={`Edit ${medicine.name}`}
        onClick={() => {
          setEditing(medicine);
          setFormOpen(true);
        }}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink">
        
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
        type="button"
        aria-label={`Delete ${medicine.name}`}
        onClick={() => setPendingDelete(medicine)}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-status-badbg hover:text-status-bad">
        
            <Trash2Icon size={14} aria-hidden="true" />
          </button>
        </span>

  }];


  const handleSubmit = async (values: FormValues) => {
    const body = payloads.medicine(values);
    const ok = await save(editing?.id ?? null, body);
    if (ok) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  return (
    <>
      <Panel>
        <Toolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search the formulary…"
          filters={[{ id: 'type', label: 'Type', value: type, options: typeOptions, onChange: setType }]}
          resultLabel={list.loading ? undefined : `${filtered.length} of ${medicines.length}`}
          actionLabel="Add medicine"
          onAction={() => {
            setEditing(null);
            setFormOpen(true);
          }} />
        
        <DataTable
          caption="Medicine formulary"
          columns={columns}
          rows={filtered}
          getRowKey={(medicine) => medicine.id || medicine.name}
          loading={list.loading}
          errorMessage={list.error ? friendlyMessage(list.error, 'medicines') : undefined}
          onRetry={list.refetch}
          emptyTitle={medicines.length === 0 ? 'No medicines returned by the backend' : 'No medicines match these filters'}
          emptyHint={
          medicines.length === 0 ?
          'The request succeeded but the MEDICINE table returned no rows.' :
          'Clear the search or filter to see all records.'
          } />
        
      </Panel>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit medicine' : 'Add medicine'}
        description={editing ? `Updating medicine ${orDash(editing.id)}` : 'Creates a new row in the MEDICINE table'}
        width="sm">
        
        <EntityForm
          fields={fields}
          initialValues={editing ? { medicineName: editing.name, medicineType: editing.type } : undefined}
          submitLabel={editing ? 'Save changes' : 'Create medicine'}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }} />
        
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete medicine"
        message={`This permanently removes ${pendingDelete?.name ?? 'this medicine'} and may be rejected if prescriptions reference it.`}
        busy={submitting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
        }} />
      
    </>);

}
