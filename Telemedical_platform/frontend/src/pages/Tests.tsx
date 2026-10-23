import React, { useMemo, useState } from 'react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { MedicalTest, Row } from '../types/entities';
import { TEST_TYPES } from '../types/entities';
import { useResource } from '../hooks/useResource';
import { useCrud } from '../hooks/useCrud';
import { testsApi } from '../utils/api/tests';
import { friendlyMessage } from '../utils/api/client';
import { testKeys, toTest } from '../utils/entities';
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

/** ⚠️ VERIFY against the TEST request DTO. */
const fields: FieldDef[] = [
{ name: 'testName', label: 'Test name', required: true },
{ name: 'testType', label: 'Test type', type: 'select', options: TEST_TYPES, required: true }];


export function TestsPage() {
  const list = useResource<Row[]>(() => testsApi.list(), []);
  const rows = useMemo(() => list.data ?? [], [list.data]);
  const tests = useMemo(() => rows.map(toTest), [rows]);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [editing, setEditing] = useState<MedicalTest | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MedicalTest | null>(null);

  const { submitting, save, remove } = useCrud(testsApi, 'test', list.refetch);

  const typeOptions = useMemo(() => {
    const fromData = distinctValues(rows, testKeys.type);
    return fromData.length > 0 ? fromData : [...TEST_TYPES];
  }, [rows]);

  const filtered = useMemo(
    () => tests.filter((test) => matchesQuery(test.raw, query) && (!type || test.type === type)),
    [tests, query, type]
  );

  const columns: Column<MedicalTest>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '72px',
    render: (test) => <span className="font-mono text-xs text-ink-muted">{orDash(test.id)}</span>
  },
  { key: 'name', header: 'Test', render: (test) => <span className="font-medium text-ink">{orDash(test.name)}</span> },
  { key: 'type', header: 'Type', render: (test) => test.type ? <Badge>{humanise(test.type)}</Badge> : '—' },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    width: '110px',
    render: (test) =>
    <span className="flex justify-end gap-1">
          <button
        type="button"
        aria-label={`Edit ${test.name}`}
        onClick={() => {
          setEditing(test);
          setFormOpen(true);
        }}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink">
        
            <PencilIcon size={14} aria-hidden="true" />
          </button>
          <button
        type="button"
        aria-label={`Delete ${test.name}`}
        onClick={() => setPendingDelete(test)}
        className="rounded p-1.5 text-ink-soft transition-colors duration-150 hover:bg-status-badbg hover:text-status-bad">
        
            <Trash2Icon size={14} aria-hidden="true" />
          </button>
        </span>

  }];


  const handleSubmit = async (values: FormValues) => {
    const body = payloads.test(values);
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
          searchPlaceholder="Search diagnostic tests…"
          filters={[{ id: 'type', label: 'Type', value: type, options: typeOptions, onChange: setType }]}
          resultLabel={list.loading ? undefined : `${filtered.length} of ${tests.length}`}
          actionLabel="Add test"
          onAction={() => {
            setEditing(null);
            setFormOpen(true);
          }} />
        
        <DataTable
          caption="Diagnostic test catalogue"
          columns={columns}
          rows={filtered}
          getRowKey={(test) => test.id || test.name}
          loading={list.loading}
          errorMessage={list.error ? friendlyMessage(list.error, 'tests') : undefined}
          onRetry={list.refetch}
          emptyTitle={tests.length === 0 ? 'No tests returned by the backend' : 'No tests match these filters'}
          emptyHint={
          tests.length === 0 ?
          'The request succeeded but the TEST table returned no rows.' :
          'Clear the search or filter to see all records.'
          } />
        
      </Panel>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit test' : 'Add test'}
        description={editing ? `Updating test ${orDash(editing.id)}` : 'Creates a new row in the TEST table'}
        width="sm">
        
        <EntityForm
          fields={fields}
          initialValues={editing ? { testName: editing.name, testType: editing.type } : undefined}
          submitLabel={editing ? 'Save changes' : 'Create test'}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }} />
        
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete test"
        message={`This permanently removes ${pendingDelete?.name ?? 'this test'} and may be rejected if prescriptions reference it.`}
        busy={submitting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
        }} />
      
    </>);

}
