import type { Row } from '../../types/entities';
import { toArray } from '../fields';
import { api } from './client';

export interface CrudResource {
  list: () => Promise<Row[]>;
  get: (id: string) => Promise<Row>;
  create: (body: Row) => Promise<Row>;
  update: (id: string, body: Row) => Promise<Row>;
  remove: (id: string) => Promise<void>;
  /** Loader for a sub-collection route belonging to this resource. */
  related: (path: string) => Promise<Row[]>;
}

/** Shared CRUD plumbing so no page re-implements fetch logic. */
export function createCrud(base: string, one: (id: string | number) => string): CrudResource {
  return {
    list: async () => toArray(await api.get<unknown>(base)),
    get: (id: string) => api.get<Row>(one(id)),
    create: (body: Row) => api.post<Row>(base, body),
    update: (id: string, body: Row) => api.put<Row>(one(id), body),
    remove: (id: string) => api.delete<void>(one(id)).then(() => undefined),
    related: async (path: string) => toArray(await api.get<unknown>(path))
  };
}