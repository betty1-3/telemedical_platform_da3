import { createCrud } from './crud';
import { endpoints } from './config';

const crud = createCrud(endpoints.prescriptions.base, endpoints.prescriptions.one);

export const prescriptionsApi = {
  ...crud,
  medicines: (id: string) => crud.related(endpoints.prescriptions.medicines(id)),
  tests: (id: string) => crud.related(endpoints.prescriptions.tests(id))
};