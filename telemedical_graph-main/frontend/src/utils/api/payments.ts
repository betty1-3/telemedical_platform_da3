import { createCrud } from './crud';
import { endpoints } from './config';

export const paymentsApi = createCrud(endpoints.payments.base, endpoints.payments.one);