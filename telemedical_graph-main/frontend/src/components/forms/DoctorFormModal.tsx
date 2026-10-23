import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { GENDERS, GENDER_LABELS, SPECIALIZATIONS } from '../../types/entities';
import { MultiInput } from './MultiInput';
import { Modal } from '../ui/Modal';
import { humanise } from '../../utils/format';

interface HospitalOption {
  id: string;
  name: string;
}

export interface DoctorFormState {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  dateJoined: string;
  licenseNumber: string;
  experience: string;
  specialization: string;
  rating: string;
  phones: string[];
  qualifications: string[];
  hospitals: Array<{ hospitalId: string; role: string }>;
}

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialData?: Partial<DoctorFormState> | null;
  hospitalOptions: HospitalOption[];
  submitting: boolean;
  onSubmit: (data: DoctorFormState) => void;
}

const DEFAULT_STATE: DoctorFormState = {
  firstName: '',
  lastName: '',
  gender: 'M',
  dob: '',
  dateJoined: new Date().toISOString().slice(0, 10),
  licenseNumber: '',
  experience: '0',
  specialization: 'GENERAL_PHYSICIAN',
  rating: '',
  phones: [],
  qualifications: [],
  hospitals: []
};

export function DoctorFormModal({
  open,
  onClose,
  title,
  description,
  initialData,
  hospitalOptions,
  submitting,
  onSubmit
}: DoctorFormModalProps) {
  const [values, setValues] = useState<DoctorFormState>(DEFAULT_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          firstName: initialData.firstName ?? '',
          lastName: initialData.lastName ?? '',
          gender: initialData.gender ?? 'M',
          dob: initialData.dob ? initialData.dob.slice(0, 10) : '',
          dateJoined: initialData.dateJoined ? initialData.dateJoined.slice(0, 10) : new Date().toISOString().slice(0, 10),
          licenseNumber: initialData.licenseNumber ?? '',
          experience: initialData.experience ? String(initialData.experience) : '0',
          specialization: initialData.specialization ?? '',
          rating: initialData.rating ? String(initialData.rating) : '',
          phones: initialData.phones ? [...initialData.phones] : [],
          qualifications: initialData.qualifications ? [...initialData.qualifications] : [],
          hospitals: initialData.hospitals ? initialData.hospitals.map(h => ({ ...h })) : []
        });
      } else {
        setValues(DEFAULT_STATE);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field: keyof DoctorFormState, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddHospital = () => {
    const firstAvailable = hospitalOptions[0]?.id ?? '';
    setValues((prev) => ({
      ...prev,
      hospitals: [...prev.hospitals, { hospitalId: firstAvailable, role: 'Consultant' }]
    }));
  };

  const handleRemoveHospital = (index: number) => {
    setValues((prev) => ({
      ...prev,
      hospitals: prev.hospitals.filter((_, i) => i !== index)
    }));
  };

  const handleHospitalChange = (index: number, key: 'hospitalId' | 'role', val: string) => {
    setValues((prev) => {
      const next = [...prev.hospitals];
      next[index] = { ...next[index], [key]: val };
      return { ...prev, hospitals: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!values.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!values.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!values.dob) newErrors.dob = 'Date of birth is required';
    if (!values.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (values.experience === '' || Number(values.experience) < 0) newErrors.experience = 'Experience must be 0 or more';

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
              First name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClass}
              placeholder="e.g. Meera"
            />
            {errors.firstName && <p className="mt-1 text-2xs text-rose-500">{errors.firstName}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Last name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={inputClass}
              placeholder="e.g. Nair"
            />
            {errors.lastName && <p className="mt-1 text-2xs text-rose-500">{errors.lastName}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              value={values.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className={inputClass}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Date of birth <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={values.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className={inputClass}
            />
            {errors.dob && <p className="mt-1 text-2xs text-rose-500">{errors.dob}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Date joined</label>
            <input
              type="date"
              value={values.dateJoined}
              onChange={(e) => handleChange('dateJoined', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              License number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              className={inputClass}
              placeholder="e.g. MH-10001"
            />
            {errors.licenseNumber && <p className="mt-1 text-2xs text-rose-500">{errors.licenseNumber}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Experience (years)</label>
            <input
              type="number"
              min="0"
              max="70"
              value={values.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              className={inputClass}
            />
            {errors.experience && <p className="mt-1 text-2xs text-rose-500">{errors.experience}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Specialization</label>
            <select
              value={values.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className={inputClass}
            >
              <option value="">Select specialization...</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {humanise(spec)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">Rating (1 to 5)</label>
            <select
              value={values.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
              className={inputClass}
            >
              <option value="">No rating recorded</option>
              <option value="5">★★★★★ (5 - Excellent)</option>
              <option value="4">★★★★☆ (4 - Very Good)</option>
              <option value="3">★★★☆☆ (3 - Good)</option>
              <option value="2">★★☆☆☆ (2 - Fair)</option>
              <option value="1">★☆☆☆☆ (1 - Poor)</option>
            </select>
          </div>
        </div>

        {/* Multivalued attributes: Phones & Qualifications */}
        <div className="border-t border-slate-200/80 pt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MultiInput
              label="Phone numbers (Multivalued)"
              items={values.phones}
              onChange={(phones) => handleChange('phones', phones)}
              placeholder="e.g. 9123400001"
              addButtonLabel="Add phone"
              type="tel"
            />
            <MultiInput
              label="Qualifications (Multivalued)"
              items={values.qualifications}
              onChange={(quals) => handleChange('qualifications', quals)}
              placeholder="e.g. MBBS, MD General Medicine"
              addButtonLabel="Add qualification"
            />
          </div>
        </div>

        {/* Hospital Affiliations */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Hospital Affiliations</label>
              <p className="text-2xs text-slate-500">Attach doctor to hospitals with designated practitioner roles</p>
            </div>
            <button
              type="button"
              onClick={handleAddHospital}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
            >
              <PlusIcon size={12} />
              Add affiliation
            </button>
          </div>

          {values.hospitals.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 text-2xs text-slate-400">
              No hospital affiliations added yet. Click &quot;Add affiliation&quot; to link a hospital.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {values.hospitals.map((aff, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                  <div className="flex-1">
                    <label className="block text-2xs font-medium text-slate-500">Hospital</label>
                    <select
                      value={aff.hospitalId}
                      onChange={(e) => handleHospitalChange(index, 'hospitalId', e.target.value)}
                      className={inputClass}
                    >
                      {hospitalOptions.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} (#{h.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-2xs font-medium text-slate-500">Role</label>
                    <input
                      type="text"
                      value={aff.role}
                      onChange={(e) => handleHospitalChange(index, 'role', e.target.value)}
                      placeholder="e.g. Consultant, Visiting Consultant"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHospital(index)}
                    aria-label={`Remove affiliation #${index + 1}`}
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
            {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
