import dayjs from 'dayjs/esm';

export interface IProduct {
  id: number;
  tenantId?: number | null;
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  price?: number | null;
  taxRate?: number | null;
  isActive?: boolean | null;
  isDeleted?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewProduct = Omit<IProduct, 'id'> & { id: null };
