import dayjs from 'dayjs/esm';

import { VisitObjective } from 'app/entities/enumerations/visit-objective.model';
import { VisitStatus } from 'app/entities/enumerations/visit-status.model';

import { IVisit, NewVisit } from './visit.model';

export const sampleWithRequiredData: IVisit = {
  id: 31906,
  visitOrder: 13005,
  objective: VisitObjective['PROSPECTING'],
  status: VisitStatus['MISSED'],
  createdAt: dayjs('2026-03-09T16:38'),
};

export const sampleWithPartialData: IVisit = {
  id: 36769,
  visitOrder: 55215,
  objective: VisitObjective['SUPPORT'],
  status: VisitStatus['MISSED'],
  latitude: 68689,
  createdAt: dayjs('2026-03-09T02:34'),
};

export const sampleWithFullData: IVisit = {
  id: 12101,
  visitOrder: 46705,
  objective: VisitObjective['COLLECTION'],
  status: VisitStatus['IN_PROGRESS'],
  latitude: 77647,
  longitude: 98987,
  checkinAt: dayjs('2026-03-09T06:22'),
  checkoutAt: dayjs('2026-03-08T22:15'),
  notes: 'optical des',
  createdAt: dayjs('2026-03-08T22:33'),
};

export const sampleWithNewData: NewVisit = {
  visitOrder: 87404,
  objective: VisitObjective['PROSPECTING'],
  status: VisitStatus['CANCELLED'],
  createdAt: dayjs('2026-03-09T02:35'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
