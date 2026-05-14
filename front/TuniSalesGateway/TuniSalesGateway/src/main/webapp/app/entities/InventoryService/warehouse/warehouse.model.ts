import dayjs from 'dayjs/esm';
import { WarehouseType } from 'app/entities/enumerations/warehouse-type.model';

export interface IWarehouse {
  id: number;
  tenantId?: number | null;
  name?: string | null;
  type?: WarehouseType | null;
  address?: string | null;
  city?: string | null;
  minThreshold?: number | null;
  isActive?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewWarehouse = Omit<IWarehouse, 'id'> & { id: null };
