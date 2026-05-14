import dayjs from 'dayjs/esm';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';

export interface IPriceList {
  id: number;
  unitPrice?: number | null;
  maxDiscountPct?: number | null;
  validFrom?: dayjs.Dayjs | null;
  validTo?: dayjs.Dayjs | null;
  isActive?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  product?: Pick<IProduct, 'id' | 'name'> | null;
  client?: Pick<IClient, 'id' | 'name'> | null;
}

export type NewPriceList = Omit<IPriceList, 'id'> & { id: null };
