import dayjs from 'dayjs/esm';
import { IOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';

export interface IOrderLineItem {
  id: number;
  stockItemId?: number | null;
  stockItemImei?: string | null;
  assignedAt?: dayjs.Dayjs | null;
  orderLine?: Pick<IOrderLine, 'id'> | null;
}

export type NewOrderLineItem = Omit<IOrderLineItem, 'id'> & { id: null };
