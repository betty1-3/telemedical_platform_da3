import { createCrud } from './crud';
import { endpoints } from './config';

export const testsApi = createCrud(endpoints.tests.base, endpoints.tests.one);