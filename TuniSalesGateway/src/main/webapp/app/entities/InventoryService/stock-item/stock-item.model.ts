import dayjs from 'dayjs/esm';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { StockItemStatus } from 'app/entities/enumerations/stock-item-status.model';

export interface IStockItem {
  id: number;
  tenantId?: number | null;
  productId?: number | null;
  productName?: string | null;
  imei?: string | null;
  status?: StockItemStatus | null;
  isDeleted?: boolean | null;
  acquiredAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  warehouse?: Pick<IWarehouse, 'id' | 'name'> | null;
}

export type NewStockItem = Omit<IStockItem, 'id'> & { id: null };
