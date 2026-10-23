import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface MultiInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addButtonLabel?: string;
  type?: 'text' | 'tel';
}

export function MultiInput({
  label,
  items,
  onChange,
  placeholder = 'Enter value...',
  addButtonLabel = 'Add',
  type = 'text'
}: MultiInputProps) {
  const handleItemChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, '']);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 text-2xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
        >
          <PlusIcon size={12} />
          {addButtonLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2 text-2xs text-slate-400">
          None added yet. Click &quot;{addButtonLabel}&quot; above to add.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type={type}
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-line-strong bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-soft transition-colors duration-150 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${label} #${index + 1}`}
                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Trash2Icon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
