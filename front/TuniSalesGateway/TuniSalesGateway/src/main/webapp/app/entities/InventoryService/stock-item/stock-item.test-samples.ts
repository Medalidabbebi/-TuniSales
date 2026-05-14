import dayjs from 'dayjs/esm';

import { StockItemStatus } from 'app/entities/enumerations/stock-item-status.model';

import { IStockItem, NewStockItem } from './stock-item.model';

export const sampleWithRequiredData: IStockItem = {
  id: 89819,
  tenantId: 9840,
  productId: 52729,
  imei: 'RubberXXXXXXXXX',
  status: StockItemStatus['IN_TRANSIT'],
  isDeleted: true,
  acquiredAt: dayjs('2026-03-08T18:01'),
};

export const sampleWithPartialData: IStockItem = {
  id: 55284,
  tenantId: 14367,
  productId: 76072,
  productName: 'Mali',
  imei: 'navigating Lice',
  status: StockItemStatus['ALLOCATED'],
  isDeleted: false,
  acquiredAt: dayjs('2026-03-09T04:43'),
};

export const sampleWithFullData: IStockItem = {
  id: 78855,
  tenantId: 28250,
  productId: 43047,
  productName: 'b Fantastic de',
  imei: 'Dollar AutoXXXX',
  status: StockItemStatus['DEPLOYED'],
  isDeleted: false,
  acquiredAt: dayjs('2026-03-09T08:54'),
  updatedAt: dayjs('2026-03-08T20:41'),
};

export const sampleWithNewData: NewStockItem = {
  tenantId: 47021,
  productId: 8013,
  imei: 'database blueto',
  status: StockItemStatus['IN_TRANSIT'],
  isDeleted: true,
  acquiredAt: dayjs('2026-03-09T04:14'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
