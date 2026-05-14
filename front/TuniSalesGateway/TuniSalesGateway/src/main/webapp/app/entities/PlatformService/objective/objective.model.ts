import dayjs from 'dayjs/esm';
import { MetricType } from 'app/entities/enumerations/metric-type.model';

export interface IObjective {
  id: number;
  tenantId?: number | null;
  assignedToLogin?: string | null;
  period?: string | null;
  metricType?: MetricType | null;
  targetValue?: number | null;
  achievedValue?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewObjective = Omit<IObjective, 'id'> & { id: null };
