import { createCrud } from './crud';
import { endpoints } from './config';

const crud = createCrud(endpoints.doctors.base, endpoints.doctors.one);

export const doctorsApi = {
  ...crud,
  phones: (id: string) => crud.related(endpoints.doctors.phones(id)),
  qualifications: (id: string) => crud.related(endpoints.doctors.qualifications(id)),
  ratings: (id: string) => crud.related(endpoints.doctors.ratings(id)),
  specializations: (id: string) => crud.related(endpoints.doctors.specializations(id)),
  hospitals: (id: string) => crud.related(endpoints.doctors.hospitals(id)),
  allSpecializations: () => crud.related(endpoints.doctors.specializationsBase)
};
