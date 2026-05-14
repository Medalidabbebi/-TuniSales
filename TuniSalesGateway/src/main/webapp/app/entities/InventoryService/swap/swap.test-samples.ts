import dayjs from 'dayjs/esm';

import { SwapStatus } from 'app/entities/enumerations/swap-status.model';

import { ISwap, NewSwap } from './swap.model';

export const sampleWithRequiredData: ISwap = {
  id: 19243,
  tenantId: 7010,
  clientId: 25162,
  status: SwapStatus['IN_PROGRESS'],
  createdAt: dayjs('2026-03-08T21:37'),
};

export const sampleWithPartialData: ISwap = {
  id: 90805,
  tenantId: 49127,
  clientId: 83891,
  status: SwapStatus['PENDING'],
  createdAt: dayjs('2026-03-08T20:34'),
  updatedAt: dayjs('2026-03-09T07:10'),
};

export const sampleWithFullData: ISwap = {
  id: 69947,
  tenantId: 44170,
  clientId: 37352,
  clientName: 'Producteur monitor transmit',
  status: SwapStatus['IN_PROGRESS'],
  reason: 'applications a withdrawal',
  createdAt: dayjs('2026-03-09T00:23'),
  resolvedAt: dayjs('2026-03-09T11:33'),
  updatedAt: dayjs('2026-03-09T14:18'),
};

export const sampleWithNewData: NewSwap = {
  tenantId: 55530,
  clientId: 34558,
  status: SwapStatus['IN_PROGRESS'],
  createdAt: dayjs('2026-03-09T04:58'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
