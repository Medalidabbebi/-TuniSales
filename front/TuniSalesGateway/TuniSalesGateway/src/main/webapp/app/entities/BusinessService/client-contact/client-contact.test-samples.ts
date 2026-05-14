import dayjs from 'dayjs/esm';

import { ContactRole } from 'app/entities/enumerations/contact-role.model';

import { IClientContact, NewClientContact } from './client-contact.model';

export const sampleWithRequiredData: IClientContact = {
  id: 26953,
  fullName: 'a',
  isPrimary: false,
  createdAt: dayjs('2026-03-09T15:56'),
};

export const sampleWithPartialData: IClientContact = {
  id: 95776,
  fullName: 'sensor',
  email: 'Briac6@yahoo.fr',
  phone: '0727414756',
  role: ContactRole['OTHER'],
  isPrimary: true,
  createdAt: dayjs('2026-03-09T15:41'),
};

export const sampleWithFullData: IClientContact = {
  id: 44529,
  fullName: 'Pizza c',
  email: 'Gwenalle83@yahoo.fr',
  phone: '0540507228',
  role: ContactRole['BUYER'],
  isPrimary: false,
  createdAt: dayjs('2026-03-09T00:15'),
};

export const sampleWithNewData: NewClientContact = {
  fullName: 'Tasty',
  isPrimary: false,
  createdAt: dayjs('2026-03-09T03:51'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
