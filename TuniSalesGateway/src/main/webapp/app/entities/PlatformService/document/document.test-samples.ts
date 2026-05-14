import dayjs from 'dayjs/esm';

import { DocumentEntityType } from 'app/entities/enumerations/document-entity-type.model';
import { DocumentType } from 'app/entities/enumerations/document-type.model';

import { IDocument, NewDocument } from './document.model';

export const sampleWithRequiredData: IDocument = {
  id: 70614,
  entityType: DocumentEntityType['CLIENT'],
  entityId: 'Loan Auvergne Kids',
  docType: DocumentType['DELIVERY_NOTE'],
  filename: 'Loan',
  storageUrl: 'a',
  createdAt: dayjs('2026-03-09T14:30'),
};

export const sampleWithPartialData: IDocument = {
  id: 55947,
  tenantId: 8148,
  entityType: DocumentEntityType['CLIENT'],
  entityId: 'Object-based',
  docType: DocumentType['INVOICE'],
  filename: 'b de drive',
  storageUrl: 'monitor forecast User-friendly',
  uploadedByLogin: 'c B2C',
  createdAt: dayjs('2026-03-09T05:58'),
};

export const sampleWithFullData: IDocument = {
  id: 71293,
  tenantId: 61968,
  entityType: DocumentEntityType['CLIENT'],
  entityId: 'Keyboard Metal Dollar',
  docType: DocumentType['AUDIT_REPORT'],
  filename: 'fault-tolerant b',
  storageUrl: 'Account Licensed',
  mimeType: 'Hat navigating',
  sizeBytes: 92777,
  uploadedByLogin: 'high-level',
  createdAt: dayjs('2026-03-08T19:17'),
  updatedAt: dayjs('2026-03-09T02:56'),
};

export const sampleWithNewData: NewDocument = {
  entityType: DocumentEntityType['STOCK_AUDIT'],
  entityId: 'Account system Philippines',
  docType: DocumentType['AMENDMENT'],
  filename: 'wireless',
  storageUrl: 'visualize Chicken',
  createdAt: dayjs('2026-03-08T17:53'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
