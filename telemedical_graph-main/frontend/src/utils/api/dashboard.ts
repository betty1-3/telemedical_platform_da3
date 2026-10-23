import type { Aggregate, Row } from '../../types/entities';
import { toAggregate } from '../entities';
import { toArray } from '../fields';
import { api } from './client';
import { endpoints } from './config';

async function aggregate(path: string, labelKeys: string[]): Promise<Aggregate[]> {
  const payload = await api.get<unknown>(path);
  return toArray(payload).map((row) => toAggregate(row, labelKeys));
}

export const dashboardApi = {
  summary: () => api.get<Row>(endpoints.dashboard.summary),
  consultationsByStatus: () => aggregate(endpoints.dashboard.consultationsByStatus, ['status']),
  patientsByCity: () => aggregate(endpoints.dashboard.patientsByCity, ['city']),
  doctorsBySpecialization: () => aggregate(endpoints.dashboard.doctorsBySpecialization, ['specialization']),
  paymentSummary: () => aggregate(endpoints.dashboard.paymentSummary, ['paid_by'])
};
