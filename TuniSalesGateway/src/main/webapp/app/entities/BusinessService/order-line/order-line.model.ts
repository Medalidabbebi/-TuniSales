import dayjs from 'dayjs/esm';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { IOrder } from 'app/entities/BusinessService/order/order.model';

export interface IOrderLine {
  id: number;
  quantity?: number | null;
  unitPrice?: number | null;
  discountPct?: number | null;
  lineTotal?: number | null;
  createdAt?: dayjs.Dayjs | null;
  product?: Pick<IProduct, 'id' | 'name'> | null;
  order?: Pick<IOrder, 'id' | 'orderNumber'> | null;
}

export type NewOrderLine = Omit<IOrderLine, 'id'> & { id: null };
