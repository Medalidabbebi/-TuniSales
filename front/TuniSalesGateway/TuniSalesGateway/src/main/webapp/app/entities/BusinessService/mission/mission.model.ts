import dayjs from 'dayjs/esm';
import { MissionStatus } from 'app/entities/enumerations/mission-status.model';

export interface IMission {
  id: number;
  tenantId?: number | null;
  assignedToLogin?: string | null;
  title?: string | null;
  description?: string | null;
  missionDate?: dayjs.Dayjs | null;
  status?: MissionStatus | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewMission = Omit<IMission, 'id'> & { id: null };
