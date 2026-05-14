import dayjs from 'dayjs/esm';

import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';

import { IDelivery, NewDelivery } from './delivery.model';

export const sampleWithRequiredData: IDelivery = {
  id: 76194,
  tenantId: 30398,
  deliveryNumber: 'Soft Cambridgeshire Provence-Alpes-Côte',
  status: DeliveryStatus['PENDING'],
  createdAt: dayjs('2026-03-09T07:10'),
};

export const sampleWithPartialData: IDelivery = {
  id: 35202,
  tenantId: 88358,
  deliveryNumber: 'Manager Tuna',
  status: DeliveryStatus['IN_PREPARATION'],
  trackingNumber: 'b integrated Gibraltar',
  deliveredAt: dayjs('2026-03-08T23:46'),
  confirmedAt: dayjs('2026-03-09T01:46'),
  notes: 'Soap repurpose',
  createdAt: dayjs('2026-03-09T13:05'),
};

export const sampleWithFullData: IDelivery = {
  id: 49566,
  tenantId: 18090,
  deliveryNumber: 'Kwanza matrix Norwegian',
  status: DeliveryStatus['SHIPPED'],
  trackingNumber: 'leverage array flexibility',
  shippedAt: dayjs('2026-03-09T13:16'),
  deliveredAt: dayjs('2026-03-09T02:41'),
  confirmedAt: dayjs('2026-03-09T03:03'),
  notes: 'clear-thinking',
  createdAt: dayjs('2026-03-09T04:18'),
};

export const sampleWithNewData: NewDelivery = {
  tenantId: 83358,
  deliveryNumber: 'syndicate calculating',
  status: DeliveryStatus['PENDING'],
  createdAt: dayjs('2026-03-08T19:56'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
