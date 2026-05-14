import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ContactRole } from 'app/entities/enumerations/contact-role.model';

export interface IClientContact {
  id: number;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: ContactRole | null;
  isPrimary?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  client?: Pick<IClient, 'id' | 'name'> | null;
}

export type NewClientContact = Omit<IClientContact, 'id'> & { id: null };
