import dayjs from 'dayjs/esm';
import { ScoreClassification } from 'app/entities/enumerations/score-classification.model';

export interface IPerformanceScore {
  id: number;
  tenantId?: number | null;
  userLogin?: string | null;
  period?: string | null;
  score?: number | null;
  classification?: ScoreClassification | null;
  breakdownJson?: string | null;
  deltaVsPrevious?: number | null;
  calculatedAt?: dayjs.Dayjs | null;
}

export type NewPerformanceScore = Omit<IPerformanceScore, 'id'> & { id: null };
