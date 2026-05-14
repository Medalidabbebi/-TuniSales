import dayjs from 'dayjs/esm';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { MovementType } from 'app/entities/enumerations/movement-type.model';

export interface IStockMovement {
  id: number;
  movementType?: MovementType | null;
  reason?: string | null;
  reference?: string | null;
  quantity?: number | null;
  performedByLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  fromWarehouse?: Pick<IWarehouse, 'id' | 'name'> | null;
  toWarehouse?: Pick<IWarehouse, 'id' | 'name'> | null;
  stockItem?: Pick<IStockItem, 'id' | 'imei'> | null;
}

export type NewStockMovement = Omit<IStockMovement, 'id'> & { id: null };
