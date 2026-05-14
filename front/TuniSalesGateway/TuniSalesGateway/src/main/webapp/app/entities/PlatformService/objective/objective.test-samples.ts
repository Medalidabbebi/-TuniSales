import dayjs from 'dayjs/esm';

import { MetricType } from 'app/entities/enumerations/metric-type.model';

import { IObjective, NewObjective } from './objective.model';

export const sampleWithRequiredData: IObjective = {
  id: 18578,
  tenantId: 7420,
  assignedToLogin: 'Havre',
  period: 'Franche',
  metricType: MetricType['CONVERSION_RATE'],
  targetValue: 84748,
  createdAt: dayjs('2026-03-08T18:01'),
};

export const sampleWithPartialData: IObjective = {
  id: 39647,
  tenantId: 32432,
  assignedToLogin: 'target transitional',
  period: 'Dalasi',
  metricType: MetricType['CONVERSION_RATE'],
  targetValue: 72256,
  achievedValue: 29155,
  createdAt: dayjs('2026-03-09T00:41'),
};

export const sampleWithFullData: IObjective = {
  id: 30615,
  tenantId: 98098,
  assignedToLogin: 'executive metrics web-enabled',
  period: 'bifurca',
  metricType: MetricType['REVENUE'],
  targetValue: 84678,
  achievedValue: 91349,
  createdAt: dayjs('2026-03-09T03:01'),
  updatedAt: dayjs('2026-03-09T06:07'),
};

export const sampleWithNewData: NewObjective = {
  tenantId: 51907,
  assignedToLogin: 'Future-proofed optical',
  period: 'definit',
  metricType: MetricType['CONVERSION_RATE'],
  targetValue: 60186,
  createdAt: dayjs('2026-03-08T21:25'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
