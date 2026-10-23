import { createCrud } from './crud';
import { endpoints } from './config';

const crud = createCrud(endpoints.patients.base, endpoints.patients.one);

export const patientsApi = {
  ...crud,
  phones: (id: string) => crud.related(endpoints.patients.phones(id)),
  medicalRecords: (id: string) => crud.related(endpoints.patients.medicalRecords(id)),
  feedback: (id: string) => crud.related(endpoints.patients.feedback(id))
};
