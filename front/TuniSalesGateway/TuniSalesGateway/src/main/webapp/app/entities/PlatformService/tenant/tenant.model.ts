import dayjs from 'dayjs/esm';
import { TenantStatus } from 'app/entities/enumerations/tenant-status.model';

export interface ITenant {
  id: number;
  name?: string | null;
  code?: string | null;
  status?: TenantStatus | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewTenant = Omit<ITenant, 'id'> & { id: null };
