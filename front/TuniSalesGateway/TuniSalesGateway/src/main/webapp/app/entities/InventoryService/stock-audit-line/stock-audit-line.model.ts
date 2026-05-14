import dayjs from 'dayjs/esm';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { IStockAudit } from 'app/entities/InventoryService/stock-audit/stock-audit.model';
import { AuditResolution } from 'app/entities/enumerations/audit-resolution.model';

export interface IStockAuditLine {
  id: number;
  foundPhysically?: boolean | null;
  resolution?: AuditResolution | null;
  resolutionNote?: string | null;
  createdAt?: dayjs.Dayjs | null;
  stockItem?: Pick<IStockItem, 'id' | 'imei'> | null;
  audit?: Pick<IStockAudit, 'id'> | null;
}

export type NewStockAuditLine = Omit<IStockAuditLine, 'id'> & { id: null };
