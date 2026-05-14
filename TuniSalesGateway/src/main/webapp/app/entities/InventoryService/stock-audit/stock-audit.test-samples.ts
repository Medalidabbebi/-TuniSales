import dayjs from 'dayjs/esm';

import { AuditStatus } from 'app/entities/enumerations/audit-status.model';

import { IStockAudit, NewStockAudit } from './stock-audit.model';

export const sampleWithRequiredData: IStockAudit = {
  id: 63849,
  tenantId: 15406,
  status: AuditStatus['IN_PROGRESS'],
  auditorLogin: 'back-end optimize',
  startedAt: dayjs('2026-03-09T16:30'),
};

export const sampleWithPartialData: IStockAudit = {
  id: 30508,
  tenantId: 40429,
  status: AuditStatus['IN_PROGRESS'],
  physicalCount: 62124,
  auditorLogin: 'demand-driven policy e-enable',
  startedAt: dayjs('2026-03-08T18:36'),
  closedAt: dayjs('2026-03-09T00:36'),
};

export const sampleWithFullData: IStockAudit = {
  id: 49062,
  tenantId: 88054,
  status: AuditStatus['CLOSED'],
  theoreticalCount: 25635,
  physicalCount: 1771,
  discrepancyCount: 89366,
  notes: 'Multi-tiered edge',
  auditorLogin: 'alarm optical',
  startedAt: dayjs('2026-03-09T05:31'),
  closedAt: dayjs('2026-03-08T23:24'),
};

export const sampleWithNewData: NewStockAudit = {
  tenantId: 22526,
  status: AuditStatus['CANCELLED'],
  auditorLogin: 'Liechtenstein generate',
  startedAt: dayjs('2026-03-09T09:39'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
