import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { IMission } from 'app/entities/BusinessService/mission/mission.model';
import { VisitObjective } from 'app/entities/enumerations/visit-objective.model';
import { VisitStatus } from 'app/entities/enumerations/visit-status.model';

export interface IVisit {
  id: number;
  visitOrder?: number | null;
  objective?: VisitObjective | null;
  status?: VisitStatus | null;
  latitude?: number | null;
  longitude?: number | null;
  checkinAt?: dayjs.Dayjs | null;
  checkoutAt?: dayjs.Dayjs | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  client?: Pick<IClient, 'id' | 'name'> | null;
  mission?: Pick<IMission, 'id' | 'title'> | null;
}

export type NewVisit = Omit<IVisit, 'id'> & { id: null };
