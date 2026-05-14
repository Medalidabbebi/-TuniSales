import dayjs from 'dayjs/esm';

import { IProduct, NewProduct } from './product.model';

export const sampleWithRequiredData: IProduct = {
  id: 77672,
  tenantId: 31113,
  sku: 'Fresh',
  name: 'collaborative SSL Concrete',
  price: 31634,
  taxRate: 40,
  isActive: true,
  isDeleted: false,
  createdAt: dayjs('2026-03-09T07:13'),
};

export const sampleWithPartialData: IProduct = {
  id: 304,
  tenantId: 45804,
  sku: 'calculate neural Automotive',
  name: 'driver du b',
  brand: 'Plastic Incredible Agent',
  price: 67547,
  taxRate: 26,
  isActive: false,
  isDeleted: true,
  createdAt: dayjs('2026-03-09T08:02'),
  updatedAt: dayjs('2026-03-09T15:58'),
};

export const sampleWithFullData: IProduct = {
  id: 55546,
  tenantId: 30768,
  sku: 'c copying Tuna',
  name: 'Soft Multi-lateral calculate',
  brand: 'Marcadet withdrawal architectures',
  category: 'Universal bricks-and-clicks',
  price: 72638,
  taxRate: 84,
  isActive: false,
  isDeleted: false,
  createdAt: dayjs('2026-03-09T07:52'),
  updatedAt: dayjs('2026-03-08T22:44'),
};

export const sampleWithNewData: NewProduct = {
  tenantId: 27616,
  sku: 'Franc',
  name: 'pixel Pound copy',
  price: 62414,
  taxRate: 17,
  isActive: true,
  isDeleted: false,
  createdAt: dayjs('2026-03-08T23:50'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
