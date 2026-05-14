import dayjs from 'dayjs/esm';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { AuditStatus } from 'app/entities/enumerations/audit-status.model';

export interface IStockAudit {
  id: number;
  tenantId?: number | null;
  status?: AuditStatus | null;
  theoreticalCount?: number | null;
  physicalCount?: number | null;
  discrepancyCount?: number | null;
  notes?: string | null;
  auditorLogin?: string | null;
  startedAt?: dayjs.Dayjs | null;
  closedAt?: dayjs.Dayjs | null;
  warehouse?: Pick<IWarehouse, 'id' | 'name'> | null;
}

export type NewStockAudit = Omit<IStockAudit, 'id'> & { id: null };
