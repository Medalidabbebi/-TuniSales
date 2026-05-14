import dayjs from 'dayjs/esm';
import { ScoreClassification } from 'app/entities/enumerations/score-classification.model';

export interface IClientScore {
  id: number;
  tenantId?: number | null;
  clientId?: number | null;
  clientName?: string | null;
  period?: string | null;
  score?: number | null;
  classification?: ScoreClassification | null;
  breakdownJson?: string | null;
  calculatedAt?: dayjs.Dayjs | null;
}

export type NewClientScore = Omit<IClientScore, 'id'> & { id: null };
