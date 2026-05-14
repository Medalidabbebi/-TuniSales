import dayjs from 'dayjs/esm';

import { WarehouseType } from 'app/entities/enumerations/warehouse-type.model';

import { IWarehouse, NewWarehouse } from './warehouse.model';

export const sampleWithRequiredData: IWarehouse = {
  id: 25959,
  tenantId: 5894,
  name: 'Soft compelling',
  type: WarehouseType['DEFECTIVE'],
  isActive: false,
  createdAt: dayjs('2026-03-09T10:36'),
};

export const sampleWithPartialData: IWarehouse = {
  id: 77208,
  tenantId: 93875,
  name: 'Progressive Basse-Normandie digital',
  type: WarehouseType['SITE'],
  city: 'Denisport',
  isActive: false,
  createdAt: dayjs('2026-03-08T23:31'),
  updatedAt: dayjs('2026-03-09T03:22'),
};

export const sampleWithFullData: IWarehouse = {
  id: 38175,
  tenantId: 90118,
  name: 'leverage cultivate',
  type: WarehouseType['MISSING'],
  address: 'Incredible',
  city: 'Béziers',
  minThreshold: 53247,
  isActive: true,
  createdAt: dayjs('2026-03-09T15:27'),
  updatedAt: dayjs('2026-03-09T12:07'),
};

export const sampleWithNewData: NewWarehouse = {
  tenantId: 33023,
  name: 'Bretagne sensor',
  type: WarehouseType['MISSING'],
  isActive: true,
  createdAt: dayjs('2026-03-09T00:16'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
