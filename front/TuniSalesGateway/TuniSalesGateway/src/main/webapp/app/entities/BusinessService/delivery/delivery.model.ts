import dayjs from 'dayjs/esm';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IMission } from 'app/entities/BusinessService/mission/mission.model';
import { IVisit } from 'app/entities/BusinessService/visit/visit.model';
import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';

export interface IDelivery {
  id: number;
  tenantId?: number | null;
  deliveryNumber?: string | null;
  status?: DeliveryStatus | null;
  trackingNumber?: string | null;
  shippedAt?: dayjs.Dayjs | null;
  deliveredAt?: dayjs.Dayjs | null;
  confirmedAt?: dayjs.Dayjs | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  order?: Pick<IOrder, 'id' | 'orderNumber'> | null;
  mission?: Pick<IMission, 'id' | 'title'> | null;
  visit?: Pick<IVisit, 'id' | 'objective'> | null;
}

export type NewDelivery = Omit<IDelivery, 'id'> & { id: null };
