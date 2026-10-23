import { createCrud } from './crud';
import { endpoints } from './config';

const crud = createCrud(endpoints.hospitals.base, endpoints.hospitals.one);

export const hospitalsApi = {
  ...crud,
  phones: (id: string) => crud.related(endpoints.hospitals.phones(id)),
  doctors: (id: string) => crud.related(endpoints.hospitals.doctors(id))
};