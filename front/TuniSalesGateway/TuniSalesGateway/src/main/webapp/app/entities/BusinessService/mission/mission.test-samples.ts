import dayjs from 'dayjs/esm';

import { MissionStatus } from 'app/entities/enumerations/mission-status.model';

import { IMission, NewMission } from './mission.model';

export const sampleWithRequiredData: IMission = {
  id: 13680,
  tenantId: 51134,
  assignedToLogin: 'Sleek payment Developpeur',
  title: 'scale Awesome cultivate',
  missionDate: dayjs('2026-03-09T07:06'),
  status: MissionStatus['IN_PROGRESS'],
  createdAt: dayjs('2026-03-08T23:47'),
};

export const sampleWithPartialData: IMission = {
  id: 14141,
  tenantId: 7125,
  assignedToLogin: 'functionalities markets visualize',
  title: 'compressing Kirghizistan SSL',
  missionDate: dayjs('2026-03-08T20:19'),
  status: MissionStatus['COMPLETED'],
  createdAt: dayjs('2026-03-09T04:50'),
};

export const sampleWithFullData: IMission = {
  id: 9316,
  tenantId: 85578,
  assignedToLogin: 'e-business',
  title: 'Hat Awesome Peso',
  description: 'lime Granite Intelligent',
  missionDate: dayjs('2026-03-08T17:47'),
  status: MissionStatus['IN_PROGRESS'],
  createdAt: dayjs('2026-03-09T10:29'),
  updatedAt: dayjs('2026-03-08T21:57'),
};

export const sampleWithNewData: NewMission = {
  tenantId: 79562,
  assignedToLogin: 'Fresh',
  title: 'Granite',
  missionDate: dayjs('2026-03-09T11:39'),
  status: MissionStatus['IN_PROGRESS'],
  createdAt: dayjs('2026-03-09T13:52'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
