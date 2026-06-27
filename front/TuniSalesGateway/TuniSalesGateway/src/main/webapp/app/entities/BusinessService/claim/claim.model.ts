import dayjs from 'dayjs/esm';

export enum ClaimType {
  RECLAMATION = 'RECLAMATION',
  RECUPERATION = 'RECUPERATION',
}

export enum ClaimStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export interface IClaim {
  id: number;
  tenantId?: number | null;
  type?: ClaimType | null;
  subject?: string | null;
  description?: string | null;
  status?: ClaimStatus | null;
  createdByLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  resolvedAt?: dayjs.Dayjs | null;
}

export type NewClaim = Omit<IClaim, 'id'> & { id: null };
