import type { Row } from '../types/entities';

/**
 * Oracle + Spring Boot can surface the same column as FIRST_NAME, first_name,
 * firstName or "Date". Every read goes through a normalised lookup so the UI
 * never depends on a guessed casing convention.
 */
const normalise = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const valueCache = new WeakMap<object, Map<string, unknown>>();
const nameCache = new WeakMap<object, Map<string, string>>();

function buildIndex(row: Row): {values: Map<string, unknown>;names: Map<string, string>;} {
  const cachedValues = valueCache.get(row);
  const cachedNames = nameCache.get(row);
  if (cachedValues && cachedNames) return { values: cachedValues, names: cachedNames };

  const values = new Map<string, unknown>();
  const names = new Map<string, string>();
  Object.keys(row).forEach((key) => {
    const n = normalise(key);
    if (!values.has(n)) {
      values.set(n, row[key]);
      names.set(n, key);
    }
  });
  valueCache.set(row, values);
  nameCache.set(row, names);
  return { values, names };
}

export function pick(row: Row | null | undefined, keys: string[]): unknown {
  if (!row || typeof row !== 'object') return undefined;
  const { values } = buildIndex(row);
  for (const key of keys) {
    const value = values.get(normalise(key));
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

export function pickString(row: Row | null | undefined, keys: string[], fallback = ''): string {
  const value = pick(row, keys);
  if (value === undefined) return fallback;
  if (typeof value === 'object') return fallback;
  return String(value);
}

export function pickNumber(row: Row | null | undefined, keys: string[]): number | undefined {
  const value = pick(row, keys);
  if (value === undefined) return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Returns the backend's own spelling of a key, if the row has it. */
export function actualKey(row: Row | null | undefined, key: string): string | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const { names } = buildIndex(row);
  return names.get(normalise(key));
}

/** Accepts a bare array or a common Spring wrapper (content/data/items/...). */
export function toArray(payload: unknown): Row[] {
  if (Array.isArray(payload)) return payload as Row[];
  if (payload && typeof payload === 'object') {
    const container = payload as Record<string, unknown>;
    for (const key of ['content', 'data', 'items', 'results', 'rows', 'list']) {
      if (Array.isArray(container[key])) return container[key] as Row[];
    }
  }
  return [];
}

/** Distinct, sorted, non-empty values of a logical field across rows. */
export function distinctValues(rows: Row[], keys: string[]): string[] {
  const seen = new Set<string>();
  rows.forEach((row) => {
    const value = pickString(row, keys).trim();
    if (value) seen.add(value);
  });
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function matchesQuery(row: Row, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return Object.values(row).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return false;
    return String(value).toLowerCase().includes(needle);
  });
}
