import dayjs from 'dayjs/esm';
import { AuditAction } from 'app/entities/enumerations/audit-action.model';

export interface IAuditLog {
  id: number;
  tenantId?: number | null;
  entityType?: string | null;
  entityId?: string | null;
  action?: AuditAction | null;
  beforeJson?: string | null;
  afterJson?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  performedByLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
}

export type NewAuditLog = Omit<IAuditLog, 'id'> & { id: null };
