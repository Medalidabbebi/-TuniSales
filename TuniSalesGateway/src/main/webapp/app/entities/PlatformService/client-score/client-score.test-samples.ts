import dayjs from 'dayjs/esm';

import { ScoreClassification } from 'app/entities/enumerations/score-classification.model';

import { IClientScore, NewClientScore } from './client-score.model';

export const sampleWithRequiredData: IClientScore = {
  id: 65316,
  tenantId: 9130,
  clientId: 22288,
  period: 'Towels',
  score: 9,
  classification: ScoreClassification['AVERAGE'],
  calculatedAt: dayjs('2026-03-09T13:17'),
};

export const sampleWithPartialData: IClientScore = {
  id: 45043,
  tenantId: 44172,
  clientId: 94934,
  period: 'virtual',
  score: 67,
  classification: ScoreClassification['AVERAGE'],
  breakdownJson: '../fake-data/blob/hipster.txt',
  calculatedAt: dayjs('2026-03-08T22:13'),
};

export const sampleWithFullData: IClientScore = {
  id: 55331,
  tenantId: 19498,
  clientId: 99556,
  clientName: 'users Cotton',
  period: 'SQL Buc',
  score: 57,
  classification: ScoreClassification['AVERAGE'],
  breakdownJson: '../fake-data/blob/hipster.txt',
  calculatedAt: dayjs('2026-03-09T01:52'),
};

export const sampleWithNewData: NewClientScore = {
  tenantId: 90617,
  clientId: 2478,
  period: 'c',
  score: 93,
  classification: ScoreClassification['POOR'],
  calculatedAt: dayjs('2026-03-09T12:19'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
