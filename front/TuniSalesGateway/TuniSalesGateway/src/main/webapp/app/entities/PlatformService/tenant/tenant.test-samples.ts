import dayjs from 'dayjs/esm';

import { TenantStatus } from 'app/entities/enumerations/tenant-status.model';

import { ITenant, NewTenant } from './tenant.model';

export const sampleWithRequiredData: ITenant = {
  id: 41639,
  name: 'Right-sized',
  code: 'parsing',
  status: TenantStatus['INACTIVE'],
  createdAt: dayjs('2026-03-08T17:15'),
};

export const sampleWithPartialData: ITenant = {
  id: 55705,
  name: 'Gloves',
  code: 'Joubert (EURCO)',
  status: TenantStatus['TRIAL'],
  createdAt: dayjs('2026-03-09T09:03'),
};

export const sampleWithFullData: ITenant = {
  id: 9972,
  name: 'generate',
  code: 'leading-edge productize',
  status: TenantStatus['ACTIVE'],
  createdAt: dayjs('2026-03-09T14:15'),
  updatedAt: dayjs('2026-03-09T02:21'),
};

export const sampleWithNewData: NewTenant = {
  name: 'navigate',
  code: 'Belgique instruction',
  status: TenantStatus['TRIAL'],
  createdAt: dayjs('2026-03-08T19:49'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
