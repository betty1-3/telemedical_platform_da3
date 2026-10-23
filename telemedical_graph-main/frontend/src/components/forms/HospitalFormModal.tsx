import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { MultiInput } from './MultiInput';
import { Modal } from '../ui/Modal';

interface DoctorOption {
  id: string;
  fullName: string;
}

export interface HospitalFormState {
  hospitalName: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  phones: string[];
  doctors: Array<{ doctorId: string; role: string }>;
}

interface HospitalFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialData?: Partial<HospitalFormState> | null;
  doctorOptions: DoctorOption[];
  submitting: boolean;
  onSubmit: (data: HospitalFormState) => void;
}

const DEFAULT_STATE: HospitalFormState = {
  hospitalName: '',
  street: '',
  area: '',
  city: '',
  pincode: '',
  phones: [],
  doctors: []
};

export function HospitalFormModal({
  open,
  onClose,
  title,
  description,
  initialData,
  doctorOptions,
  submitting,
  onSubmit
}: HospitalFormModalProps) {
  const [values, setValues] = useState<HospitalFormState>(DEFAULT_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          hospitalName: initialData.hospitalName ?? '',
          street: initialData.street ?? '',
          area: initialData.area ?? '',
          city: initialData.city ?? '',
          pincode: initialData.pincode ?? '',
          phones: initialData.phones ? [...initialData.phones] : [],
          doctors: initialData.doctors ? initialData.doctors.map((d) => ({ ...d })) : []
        });
      } else {
        setValues(DEFAULT_STATE);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field: keyof HospitalFormState, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddDoctor = () => {
    const firstDoc = doctorOptions[0]?.id ?? '';
    setValues((prev) => ({
      ...prev,
      doctors: [...prev.doctors, { doctorId: firstDoc, role: 'Consultant' }]
    }));
  };

  const handleRemoveDoctor = (index: number) => {
    setValues((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((_, i) => i !== index)
    }));
  };

  const handleDoctorChange = (index: number, key: 'doctorId' | 'role', val: string) => {
    setValues((prev) => {
      const next = [...prev.doctors];
      next[index] = { ...next[index], [key]: val };
      return { ...prev, doctors: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!values.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required';
    if (!values.city.trim()) newErrors.city = 'City is required';

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
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Hospital name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.hospitalName}
              onChange={(e) => handleChange('hospitalName', e.target.value)}
              className={inputClass}
              placeholder="e.g. City Care Hospital"
            />
            {errors.hospitalName && <p className="mt-1 text-2xs text-rose-500">{errors.hospitalName}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Street</label>
            <input
              type="text"
              value={values.street}
              onChange={(e) => handleChange('street', e.target.value)}
              className={inputClass}
              placeholder="e.g. Link Road"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Area</label>
            <input
              type="text"
              value={values.area}
              onChange={(e) => handleChange('area', e.target.value)}
              className={inputClass}
              placeholder="e.g. Andheri"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={inputClass}
              placeholder="e.g. Mumbai"
            />
            {errors.city && <p className="mt-1 text-2xs text-rose-500">{errors.city}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Pincode</label>
            <input
              type="text"
              value={values.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className={inputClass}
              placeholder="e.g. 400053"
            />
          </div>
        </div>

        {/* Multivalued attribute: Contact Numbers */}
        <div className="border-t border-slate-200/80 pt-3">
          <MultiInput
            label="Contact numbers / Phone (Multivalued)"
            items={values.phones}
            onChange={(phones) => handleChange('phones', phones)}
            placeholder="e.g. 02240001001"
            addButtonLabel="Add contact number"
            type="tel"
          />
        </div>

        {/* Doctor Affiliations (Many-to-many relationship) */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Affiliated Doctors</label>
              <p className="text-2xs text-slate-500">Attach practicing doctors with hospital roles</p>
            </div>
            <button
              type="button"
              onClick={handleAddDoctor}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
            >
              <PlusIcon size={12} />
              Add doctor
            </button>
          </div>

          {values.doctors.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 text-2xs text-slate-400">
              No doctors linked yet. Click &quot;Add doctor&quot; to affiliate a practitioner.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {values.doctors.map((aff, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                  <div className="flex-1">
                    <label className="block text-2xs font-medium text-slate-500">Doctor</label>
                    <select
                      value={aff.doctorId}
                      onChange={(e) => handleDoctorChange(index, 'doctorId', e.target.value)}
                      className={inputClass}
                    >
                      {doctorOptions.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fullName} (#{doc.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-2xs font-medium text-slate-500">Role</label>
                    <input
                      type="text"
                      value={aff.role}
                      onChange={(e) => handleDoctorChange(index, 'role', e.target.value)}
                      placeholder="e.g. Consultant, Visiting Consultant"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoctor(index)}
                    aria-label={`Remove doctor #${index + 1}`}
                    className="mt-4 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              ))}
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
            {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create hospital'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
