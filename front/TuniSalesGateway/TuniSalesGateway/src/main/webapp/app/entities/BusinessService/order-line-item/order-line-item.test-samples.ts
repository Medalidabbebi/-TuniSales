import dayjs from 'dayjs/esm';

import { IOrderLineItem, NewOrderLineItem } from './order-line-item.model';

export const sampleWithRequiredData: IOrderLineItem = {
  id: 64159,
  stockItemId: 43893,
  assignedAt: dayjs('2026-03-08T19:58'),
};

export const sampleWithPartialData: IOrderLineItem = {
  id: 94424,
  stockItemId: 42815,
  assignedAt: dayjs('2026-03-08T19:56'),
};

export const sampleWithFullData: IOrderLineItem = {
  id: 9395,
  stockItemId: 28558,
  stockItemImei: 'b THX',
  assignedAt: dayjs('2026-03-08T21:54'),
};

export const sampleWithNewData: NewOrderLineItem = {
  stockItemId: 79649,
  assignedAt: dayjs('2026-03-09T05:23'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
