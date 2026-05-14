import dayjs from 'dayjs/esm';
import { DocumentEntityType } from 'app/entities/enumerations/document-entity-type.model';
import { DocumentType } from 'app/entities/enumerations/document-type.model';

export interface IDocument {
  id: number;
  tenantId?: number | null;
  entityType?: DocumentEntityType | null;
  entityId?: string | null;
  docType?: DocumentType | null;
  filename?: string | null;
  storageUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  uploadedByLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewDocument = Omit<IDocument, 'id'> & { id: null };
