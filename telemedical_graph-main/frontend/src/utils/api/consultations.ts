import { createCrud } from './crud';
import { endpoints } from './config';
import { api } from './client';
import { toArray } from '../fields';

const crud = createCrud(endpoints.consultations.base, endpoints.consultations.one);

export const consultationsApi = {
  ...crud,
  // The backend has no nested consultation routes. Filter the live resource
  // collections instead of calling endpoints that do not exist.
  payment: async (id: string) =>
    toArray(await api.get<unknown>(endpoints.payments.base)).filter((row) => String(row.consultationId) === id),
  prescription: async (id: string) =>
    toArray(await api.get<unknown>(endpoints.prescriptions.base)).filter((row) => String(row.consultationId) === id)
};
