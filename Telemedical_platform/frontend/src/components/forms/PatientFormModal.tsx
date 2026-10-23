import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { GENDERS, GENDER_LABELS } from '../../types/entities';
import { MultiInput } from './MultiInput';
import { Modal } from '../ui/Modal';

export interface PatientFormState {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  city: string;
  area: string;
  pincode: string;
  phones: string[];
  medicalRecords: Array<{ medicalRecordId?: string; symptoms: string; diagnoses: string }>;
  feedbacks: Array<{ feedbackId?: string; feedbackComment: string; rating: number }>;
}

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialData?: Partial<PatientFormState> | null;
  submitting: boolean;
  onSubmit: (data: PatientFormState) => void;
}

const DEFAULT_STATE: PatientFormState = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'M',
  city: '',
  area: '',
  pincode: '',
  phones: [],
  medicalRecords: [],
  feedbacks: []
};

export function PatientFormModal({
  open,
  onClose,
  title,
  description,
  initialData,
  submitting,
  onSubmit
}: PatientFormModalProps) {
  const [values, setValues] = useState<PatientFormState>(DEFAULT_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValues({
          firstName: initialData.firstName ?? '',
          lastName: initialData.lastName ?? '',
          dob: initialData.dob ? initialData.dob.slice(0, 10) : '',
          gender: initialData.gender ?? 'M',
          city: initialData.city ?? '',
          area: initialData.area ?? '',
          pincode: initialData.pincode ?? '',
          phones: initialData.phones ? [...initialData.phones] : [],
          medicalRecords: initialData.medicalRecords ? initialData.medicalRecords.map((m) => ({ ...m })) : [],
          feedbacks: initialData.feedbacks ? initialData.feedbacks.map((f) => ({ ...f })) : []
        });
      } else {
        setValues(DEFAULT_STATE);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field: keyof PatientFormState, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddMedicalRecord = () => {
    setValues((prev) => ({
      ...prev,
      medicalRecords: [...prev.medicalRecords, { symptoms: '', diagnoses: '' }]
    }));
  };

  const handleRemoveMedicalRecord = (index: number) => {
    setValues((prev) => ({
      ...prev,
      medicalRecords: prev.medicalRecords.filter((_, i) => i !== index)
    }));
  };

  const handleMedicalRecordChange = (index: number, key: 'symptoms' | 'diagnoses', val: string) => {
    setValues((prev) => {
      const next = [...prev.medicalRecords];
      next[index] = { ...next[index], [key]: val };
      return { ...prev, medicalRecords: next };
    });
  };

  const handleAddFeedback = () => {
    setValues((prev) => ({
      ...prev,
      feedbacks: [...prev.feedbacks, { feedbackComment: '', rating: 5 }]
    }));
  };

  const handleRemoveFeedback = (index: number) => {
    setValues((prev) => ({
      ...prev,
      feedbacks: prev.feedbacks.filter((_, i) => i !== index)
    }));
  };

  const handleFeedbackChange = (index: number, key: 'feedbackComment' | 'rating', val: any) => {
    setValues((prev) => {
      const next = [...prev.feedbacks];
      next[index] = { ...next[index], [key]: key === 'rating' ? Number(val) : val };
      return { ...prev, feedbacks: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!values.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!values.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!values.dob) newErrors.dob = 'Date of birth is required';
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              First name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClass}
              placeholder="e.g. Aarav"
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
              placeholder="e.g. Sharma"
            />
            {errors.lastName && <p className="mt-1 text-2xs text-rose-500">{errors.lastName}</p>}
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
            <label className="mb-1 block text-xs font-semibold text-slate-700">Area</label>
            <input
              type="text"
              value={values.area}
              onChange={(e) => handleChange('area', e.target.value)}
              className={inputClass}
              placeholder="e.g. Andheri"
            />
          </div>

          <div className="sm:col-span-2">
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

        {/* Multivalued attribute: Phone numbers */}
        <div className="border-t border-slate-200/80 pt-3">
          <MultiInput
            label="Phone numbers (Multivalued)"
            items={values.phones}
            onChange={(phones) => handleChange('phones', phones)}
            placeholder="e.g. 9876500001"
            addButtonLabel="Add phone"
            type="tel"
          />
        </div>

        {/* Medical Records (One-to-many child table) */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Medical Records</label>
              <p className="text-2xs text-slate-500">Record symptoms and clinical diagnoses</p>
            </div>
            <button
              type="button"
              onClick={handleAddMedicalRecord}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
            >
              <PlusIcon size={12} />
              Add record
            </button>
          </div>

          {values.medicalRecords.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 text-2xs text-slate-400">
              No medical records entered. Click &quot;Add record&quot; to add.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {values.medicalRecords.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={rec.symptoms}
                      onChange={(e) => handleMedicalRecordChange(index, 'symptoms', e.target.value)}
                      placeholder="Symptoms (e.g. Fever and body ache)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={rec.diagnoses}
                      onChange={(e) => handleMedicalRecordChange(index, 'diagnoses', e.target.value)}
                      placeholder="Diagnoses (e.g. Viral fever)"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicalRecord(index)}
                    aria-label={`Remove medical record #${index + 1}`}
                    className="mt-1 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback (One-to-many child table) */}
        <div className="border-t border-slate-200/80 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Patient Feedback</label>
              <p className="text-2xs text-slate-500">Record consultation feedback comments and rating</p>
            </div>
            <button
              type="button"
              onClick={handleAddFeedback}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
            >
              <PlusIcon size={12} />
              Add feedback
            </button>
          </div>

          {values.feedbacks.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 text-2xs text-slate-400">
              No feedback entered. Click &quot;Add feedback&quot; to add.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {values.feedbacks.map((fb, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-2">
                  <div className="flex-[2]">
                    <input
                      type="text"
                      value={fb.feedbackComment}
                      onChange={(e) => handleFeedbackChange(index, 'feedbackComment', e.target.value)}
                      placeholder="Feedback comment..."
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={fb.rating}
                      onChange={(e) => handleFeedbackChange(index, 'rating', e.target.value)}
                      className={inputClass}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeedback(index)}
                    aria-label={`Remove feedback #${index + 1}`}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
            {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
