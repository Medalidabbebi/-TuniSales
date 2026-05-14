import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';

export interface IInvoice {
  id: number;
  tenantId?: number | null;
  invoiceNumber?: string | null;
  amountHt?: number | null;
  taxAmount?: number | null;
  amountTtc?: number | null;
  status?: InvoiceStatus | null;
  issueDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  paidAt?: dayjs.Dayjs | null;
  isDeleted?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  client?: Pick<IClient, 'id' | 'name'> | null;
  order?: Pick<IOrder, 'id' | 'orderNumber'> | null;
}

export type NewInvoice = Omit<IInvoice, 'id'> & { id: null };
