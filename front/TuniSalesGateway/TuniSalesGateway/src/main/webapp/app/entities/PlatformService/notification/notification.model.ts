import dayjs from 'dayjs/esm';
import { NotificationType } from 'app/entities/enumerations/notification-type.model';

export interface INotification {
  id: number;
  tenantId?: number | null;
  recipientLogin?: string | null;
  type?: NotificationType | null;
  title?: string | null;
  body?: string | null;
  payloadJson?: string | null;
  isRead?: boolean | null;
  readAt?: dayjs.Dayjs | null;
  createdAt?: dayjs.Dayjs | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
