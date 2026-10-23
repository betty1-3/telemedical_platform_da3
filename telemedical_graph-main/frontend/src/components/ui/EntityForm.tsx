import React, { useMemo, useState } from 'react';
import { humanise } from '../../utils/format';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'url' | 'tel';
  required?: boolean;
  options?: readonly string[];
  /** Human labels for option values that are opaque (e.g. foreign-key ids). */
  optionLabels?: Record<string, string>;
  hint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
  full?: boolean;
}

export type FormValues = Record<string, string>;

interface EntityFormProps {
  fields: FieldDef[];
  initialValues?: FormValues;
  submitLabel: string;
  submitting?: boolean;
  note?: string;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

function validate(fields: FieldDef[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    const value = (values[field.name] ?? '').trim();
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`;
      return;
    }
    if (!value) return;
    if (field.type === 'number') {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) errors[field.name] = `${field.label} must be a number`;else
      if (field.min !== undefined && numeric < field.min) errors[field.name] = `${field.label} must be ${field.min} or more`;else
      if (field.max !== undefined && numeric > field.max) errors[field.name] = `${field.label} must be ${field.max} or less`;
    }
    if (field.type === 'date' && Number.isNaN(new Date(value).getTime())) {
      errors[field.name] = `${field.label} must be a valid date`;
    }
    if (field.options && field.options.length > 0 && !field.options.includes(value)) {
      errors[field.name] = `Select a valid ${field.label.toLowerCase()}`;
    }
    if (field.pattern && !field.pattern.test(value)) {
      errors[field.name] = field.patternMessage ?? `${field.label} is not in the expected format`;
    }
  });
  return errors;
}

export function EntityForm({
  fields,
  initialValues,
  submitLabel,
  submitting = false,
  note,
  onSubmit,
  onCancel
}: EntityFormProps) {
  const defaults = useMemo<FormValues>(() => {
    const base: FormValues = {};
    fields.forEach((field) => {
      base[field.name] = initialValues?.[field.name] ?? '';
    });
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, initialValues]);

  const [values, setValues] = useState<FormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(fields, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(values);
  };

  const inputClass =
  'w-full rounded border border-line-strong bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-soft transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldId = `field-${field.name}`;
          const error = errors[field.name];
          return (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : undefined}>
              <label htmlFor={fieldId} className="mb-1 block text-xs font-medium text-ink">
                {field.label}
                {field.required ? <span className="ml-0.5 text-status-bad">*</span> : null}
              </label>
              {field.type === 'select' ?
              <select
                id={fieldId}
                value={values[field.name] ?? ''}
                onChange={(event) => setValue(field.name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                className={inputClass}>
                
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) =>
                <option key={option} value={option}>
                      {field.optionLabels?.[option] ?? humanise(option)}
                    </option>
                )}
                </select> :
              field.type === 'textarea' ?
              <textarea
                id={fieldId}
                rows={3}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => setValue(field.name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                className={inputClass} /> :


              <input
                id={fieldId}
                type={field.type === 'number' ? 'number' : field.type ?? 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => setValue(field.name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                className={inputClass} />

              }
              {error ?
              <p id={`${fieldId}-error`} className="mt-1 text-2xs text-status-bad">
                  {error}
                </p> :
              field.hint ?
              <p className="mt-1 text-2xs text-ink-soft">{field.hint}</p> :
              null}
            </div>);

        })}
      </div>

      {note ?
      <p className="mt-4 rounded border border-line bg-canvas px-3 py-2 text-2xs leading-relaxed text-ink-muted">{note}</p> :
      null}

      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-line-strong bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-canvas">
          
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-brand-700 px-3.5 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-800 disabled:opacity-60">
          
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>);

}