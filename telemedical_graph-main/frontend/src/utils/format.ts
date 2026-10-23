const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const plainNumber = new Intl.NumberFormat('en-IN');

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—';
  return currency.format(value);
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—';
  return plainNumber.format(value);
}

/** Accepts ISO strings, Oracle date strings and epoch millis. */
export function formatDate(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  const raw = String(value);
  const parsed = new Date(typeof value === 'number' ? value : raw.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(value: string | undefined | null): string {
  if (!value) return '—';
  const match = /(\d{1,2}):(\d{2})/.exec(String(value));
  if (!match) return String(value);
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes} ${suffix}`;
}

/** GENERAL_PHYSICIAN -> General physician */
export function humanise(value: string | undefined | null): string {
  if (!value) return '—';
  const cleaned = String(value).replace(/[_-]+/g, ' ').trim().toLowerCase();
  if (!cleaned) return '—';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function formatGender(value: string | undefined | null): string {
  if (value === 'M') return 'Male';
  if (value === 'F') return 'Female';
  if (value === 'O') return 'Other';
  return humanise(value);
}

/** FEEDBACK_COMMENT / feedbackComment / "Date" -> "Feedback comment" / "Date" */
export function fieldLabel(key: string): string {
  return humanise(key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
}

export function initials(first: string, last: string): string {
  const value = `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase();
  return value || '?';
}

export function orDash(value: string | number | undefined | null): string {
  if (value === undefined || value === null || String(value).trim() === '') return '—';
  return String(value);
}
