import dayjs from 'dayjs/esm';

import { ClientType } from 'app/entities/enumerations/client-type.model';
import { ClientStatus } from 'app/entities/enumerations/client-status.model';

import { IClient, NewClient } from './client.model';

export const sampleWithRequiredData: IClient = {
  id: 71655,
  tenantId: 33198,
  name: 'Cotton primary Poitou-Charentes',
  clientType: ClientType['NATIONAL_DISTRIBUTOR'],
  status: ClientStatus['ACTIVE'],
  isDeleted: true,
  createdAt: dayjs('2026-03-08T18:15'),
};

export const sampleWithPartialData: IClient = {
  id: 90261,
  tenantId: 26444,
  name: 'Gorgeous Devolved',
  clientType: ClientType['INDEPENDENT_POS'],
  creditUsed: 92213,
  paymentTermsDays: 89820,
  status: ClientStatus['CHURN_RISK'],
  lastOrderAt: dayjs('2026-03-08T23:15'),
  isDeleted: false,
  createdAt: dayjs('2026-03-09T16:21'),
  updatedAt: dayjs('2026-03-09T11:09'),
};

export const sampleWithFullData: IClient = {
  id: 75745,
  tenantId: 77323,
  name: 'Steel',
  taxId: 'reinvent PNG seamless',
  clientType: ClientType['REGIONAL_WHOLESALER'],
  creditLimit: 16446,
  creditUsed: 8145,
  paymentTermsDays: 70359,
  status: ClientStatus['CHURN_RISK'],
  lastOrderAt: dayjs('2026-03-09T16:24'),
  isDeleted: true,
  createdAt: dayjs('2026-03-09T05:49'),
  updatedAt: dayjs('2026-03-09T12:24'),
};

export const sampleWithNewData: NewClient = {
  tenantId: 38965,
  name: 'Soft',
  clientType: ClientType['INDEPENDENT_POS'],
  status: ClientStatus['INACTIVE'],
  isDeleted: false,
  createdAt: dayjs('2026-03-09T09:28'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
