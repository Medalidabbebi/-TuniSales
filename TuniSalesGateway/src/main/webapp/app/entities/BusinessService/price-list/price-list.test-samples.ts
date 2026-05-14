import dayjs from 'dayjs/esm';

import { IPriceList, NewPriceList } from './price-list.model';

export const sampleWithRequiredData: IPriceList = {
  id: 49490,
  unitPrice: 24290,
  validFrom: dayjs('2026-03-08T18:12'),
  validTo: dayjs('2026-03-08T21:05'),
  isActive: false,
  createdAt: dayjs('2026-03-09T03:23'),
};

export const sampleWithPartialData: IPriceList = {
  id: 25379,
  unitPrice: 35015,
  validFrom: dayjs('2026-03-08T20:31'),
  validTo: dayjs('2026-03-09T02:58'),
  isActive: true,
  createdAt: dayjs('2026-03-09T12:35'),
};

export const sampleWithFullData: IPriceList = {
  id: 54709,
  unitPrice: 39216,
  maxDiscountPct: 69,
  validFrom: dayjs('2026-03-08T21:49'),
  validTo: dayjs('2026-03-09T05:26'),
  isActive: false,
  createdAt: dayjs('2026-03-09T01:50'),
};

export const sampleWithNewData: NewPriceList = {
  unitPrice: 87122,
  validFrom: dayjs('2026-03-09T12:03'),
  validTo: dayjs('2026-03-09T14:35'),
  isActive: true,
  createdAt: dayjs('2026-03-09T02:08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
