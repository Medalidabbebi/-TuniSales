import dayjs from 'dayjs/esm';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { SwapStatus } from 'app/entities/enumerations/swap-status.model';

export interface ISwap {
  id: number;
  tenantId?: number | null;
  clientId?: number | null;
  clientName?: string | null;
  status?: SwapStatus | null;
  reason?: string | null;
  createdAt?: dayjs.Dayjs | null;
  resolvedAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  outgoingItem?: Pick<IStockItem, 'id' | 'imei'> | null;
  incomingItem?: Pick<IStockItem, 'id' | 'imei'> | null;
}

export type NewSwap = Omit<ISwap, 'id'> & { id: null };
