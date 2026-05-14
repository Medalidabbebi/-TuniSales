import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDocument, NewDocument } from '../document.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDocument for edit and NewDocumentFormGroupInput for create.
 */
type DocumentFormGroupInput = IDocument | PartialWithRequiredKeyOf<NewDocument>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDocument | NewDocument> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DocumentFormRawValue = FormValueOf<IDocument>;

type NewDocumentFormRawValue = FormValueOf<NewDocument>;

type DocumentFormDefaults = Pick<NewDocument, 'id' | 'createdAt' | 'updatedAt'>;

type DocumentFormGroupContent = {
  id: FormControl<DocumentFormRawValue['id'] | NewDocument['id']>;
  tenantId: FormControl<DocumentFormRawValue['tenantId']>;
  entityType: FormControl<DocumentFormRawValue['entityType']>;
  entityId: FormControl<DocumentFormRawValue['entityId']>;
  docType: FormControl<DocumentFormRawValue['docType']>;
  filename: FormControl<DocumentFormRawValue['filename']>;
  storageUrl: FormControl<DocumentFormRawValue['storageUrl']>;
  mimeType: FormControl<DocumentFormRawValue['mimeType']>;
  sizeBytes: FormControl<DocumentFormRawValue['sizeBytes']>;
  uploadedByLogin: FormControl<DocumentFormRawValue['uploadedByLogin']>;
  createdAt: FormControl<DocumentFormRawValue['createdAt']>;
  updatedAt: FormControl<DocumentFormRawValue['updatedAt']>;
};

export type DocumentFormGroup = FormGroup<DocumentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DocumentFormService {
  createDocumentFormGroup(document: DocumentFormGroupInput = { id: null }): DocumentFormGroup {
    const documentRawValue = this.convertDocumentToDocumentRawValue({
      ...this.getFormDefaults(),
      ...document,
    });
    return new FormGroup<DocumentFormGroupContent>({
      id: new FormControl(
        { value: documentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(documentRawValue.tenantId),
      entityType: new FormControl(documentRawValue.entityType, {
        validators: [Validators.required],
      }),
      entityId: new FormControl(documentRawValue.entityId, {
        validators: [Validators.required, Validators.maxLength(36)],
      }),
      docType: new FormControl(documentRawValue.docType, {
        validators: [Validators.required],
      }),
      filename: new FormControl(documentRawValue.filename, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      storageUrl: new FormControl(documentRawValue.storageUrl, {
        validators: [Validators.required, Validators.maxLength(1000)],
      }),
      mimeType: new FormControl(documentRawValue.mimeType, {
        validators: [Validators.maxLength(100)],
      }),
      sizeBytes: new FormControl(documentRawValue.sizeBytes, {
        validators: [Validators.min(0)],
      }),
      uploadedByLogin: new FormControl(documentRawValue.uploadedByLogin, {
        validators: [Validators.maxLength(100)],
      }),
      createdAt: new FormControl(documentRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(documentRawValue.updatedAt),
    });
  }

  getDocument(form: DocumentFormGroup): IDocument | NewDocument {
    return this.convertDocumentRawValueToDocument(form.getRawValue() as DocumentFormRawValue | NewDocumentFormRawValue);
  }

  resetForm(form: DocumentFormGroup, document: DocumentFormGroupInput): void {
    const documentRawValue = this.convertDocumentToDocumentRawValue({ ...this.getFormDefaults(), ...document });
    form.reset(
      {
        ...documentRawValue,
        id: { value: documentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DocumentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertDocumentRawValueToDocument(rawDocument: DocumentFormRawValue | NewDocumentFormRawValue): IDocument | NewDocument {
    return {
      ...rawDocument,
      createdAt: dayjs(rawDocument.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawDocument.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertDocumentToDocumentRawValue(
    document: IDocument | (Partial<NewDocument> & DocumentFormDefaults)
  ): DocumentFormRawValue | PartialWithRequiredKeyOf<NewDocumentFormRawValue> {
    return {
      ...document,
      createdAt: document.createdAt ? document.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: document.updatedAt ? document.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
