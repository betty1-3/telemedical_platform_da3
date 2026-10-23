import { createCrud } from './crud';
import { endpoints } from './config';

export const medicinesApi = createCrud(endpoints.medicines.base, endpoints.medicines.one);