import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Panel';
import { humanise } from '../../utils/format';

interface ConsultationOption {
  id: string;
  label: string;
}

interface MedicineOption {
  id: string;
  name: string;
  type: string;
}

interface TestOption {
  id: string;
  name: string;
  type: string;
}

export interface PrescriptionFormState {
  consultationId: string;
  prescriptionDate: string;
  dosage: string;
  medicineIds: number[];
  testIds: number[];
}

interface PrescriptionFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialData?: Partial<PrescriptionFormState> | null;
  consultationOptions: ConsultationOption[];
  medicineOptions: MedicineOption[];
  testOptions: TestOption[];
  submitting: boolean;
  onSubmit: (data: PrescriptionFormState) => void;
}

const DEFAULT_STATE: PrescriptionFormState = {
  consultationId: '',
  prescriptionDate: new Date().toISOString().slice(0, 10),
  dosage: '',
  medicineIds: [],
  testIds: []
};

export function PrescriptionFormModal({
  open,
  onClose,
  title,
  description,
  initialData,
  consultationOptions,
  medicineOptions,
  testOptions,
  submitting,
  onSubmit
}: PrescriptionFormModalProps) {
  const [values, setValues] = useState<PrescriptionFormState>(DEFAULT_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          consultationId: initialData.consultationId ?? '',
          prescriptionDate: initialData.prescriptionDate
            ? initialData.prescriptionDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          dosage: initialData.dosage ?? '',
          medicineIds: initialData.medicineIds ? [...initialData.medicineIds] : [],
          testIds: initialData.testIds ? [...initialData.testIds] : []
        });
      } else {
        const firstConsultation = consultationOptions[0]?.id ?? '';
        setValues({
          ...DEFAULT_STATE,
          consultationId: firstConsultation,
          prescriptionDate: new Date().toISOString().slice(0, 10)
        });
      }
      setErrors({});
    }
  }, [open, initialData, consultationOptions]);

  const toggleMedicine = (medId: number) => {
    setValues((prev) => {
      const exists = prev.medicineIds.includes(medId);
      return {
        ...prev,
        medicineIds: exists ? prev.medicineIds.filter((id) => id !== medId) : [...prev.medicineIds, medId]
      };
    });
  };

  const toggleTest = (testId: number) => {
    setValues((prev) => {
      const exists = prev.testIds.includes(testId);
      return {
        ...prev,
        testIds: exists ? prev.testIds.filter((id) => id !== testId) : [...prev.testIds, testId]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!values.consultationId.trim()) newErrors.consultationId = 'Consultation is required';
    if (!values.prescriptionDate) newErrors.prescriptionDate = 'Prescription date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  };

  const inputClass =
    'w-full rounded-md border border-line-strong bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-soft transition-colors duration-150 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs';

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} width="lg">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Core fields */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Consultation <span className="text-rose-500">*</span>
            </label>
            <select
              value={values.consultationId}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, consultationId: e.target.value }));
                if (errors.consultationId) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.consultationId;
                    return next;
                  });
                }
              }}
              className={inputClass}
            >
              <option value="">Select consultation...</option>
              {consultationOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.consultationId && <p className="mt-1 text-2xs text-rose-500">{errors.consultationId}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Prescription date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={values.prescriptionDate}
              onChange={(e) => setValues((prev) => ({ ...prev, prescriptionDate: e.target.value }))}
              className={inputClass}
            />
            {errors.prescriptionDate && <p className="mt-1 text-2xs text-rose-500">{errors.prescriptionDate}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Dosage instructions</label>
            <textarea
              rows={2}
              value={values.dosage}
              onChange={(e) => setValues((prev) => ({ ...prev, dosage: e.target.value }))}
              placeholder="e.g. 1 tablet twice daily after meals for 5 days"
              className={inputClass}
            />
          </div>
        </div>

        {/* Junction: Prescribed Medicines */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Prescribed Medicines</label>
            <p className="text-2xs text-slate-500">Select medicines to include from the hospital formulary</p>
          </div>
          {medicineOptions.length === 0 ? (
            <p className="text-2xs text-slate-400 italic">No medicines available in formulary.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/50 p-2.5">
              {medicineOptions.map((med) => {
                const idNum = Number(med.id);
                const selected = values.medicineIds.includes(idNum);
                return (
                  <label
                    key={med.id}
                    className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      selected
                        ? 'border-sky-300 bg-sky-50/80 text-sky-950 font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMedicine(idNum)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="truncate">{med.name}</span>
                    </div>
                    <Badge tone="neutral">{humanise(med.type)}</Badge>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Junction: Ordered Tests */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Ordered Diagnostic Tests</label>
            <p className="text-2xs text-slate-500">Select lab tests to order under this prescription</p>
          </div>
          {testOptions.length === 0 ? (
            <p className="text-2xs text-slate-400 italic">No diagnostic tests available in catalogue.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/50 p-2.5">
              {testOptions.map((test) => {
                const idNum = Number(test.id);
                const selected = values.testIds.includes(idNum);
                return (
                  <label
                    key={test.id}
                    className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      selected
                        ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTest(idNum)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{test.name}</span>
                    </div>
                    <Badge tone="info">{humanise(test.type)}</Badge>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line-strong bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create prescription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
