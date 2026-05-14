import dayjs from 'dayjs/esm';
import { ClientType } from 'app/entities/enumerations/client-type.model';
import { ClientStatus } from 'app/entities/enumerations/client-status.model';

export interface IClient {
  id: number;
  tenantId?: number | null;
  name?: string | null;
  taxId?: string | null;
  clientType?: ClientType | null;
  creditLimit?: number | null;
  creditUsed?: number | null;
  paymentTermsDays?: number | null;
  status?: ClientStatus | null;
  lastOrderAt?: dayjs.Dayjs | null;
  isDeleted?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewClient = Omit<IClient, 'id'> & { id: null };
