import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';

export interface IOrder {
  id: number;
  tenantId?: number | null;
  orderNumber?: string | null;
  status?: OrderStatus | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  paymentTermsDays?: number | null;
  dueDate?: dayjs.Dayjs | null;
  rejectionReason?: string | null;
  submittedAt?: dayjs.Dayjs | null;
  validatedAt?: dayjs.Dayjs | null;
  isDeleted?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  client?: Pick<IClient, 'id' | 'name'> | null;
}

export type NewOrder = Omit<IOrder, 'id'> & { id: null };
