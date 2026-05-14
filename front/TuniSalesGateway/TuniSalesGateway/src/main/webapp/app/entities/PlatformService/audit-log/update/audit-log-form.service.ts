import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAuditLog, NewAuditLog } from '../audit-log.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAuditLog for edit and NewAuditLogFormGroupInput for create.
 */
type AuditLogFormGroupInput = IAuditLog | PartialWithRequiredKeyOf<NewAuditLog>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAuditLog | NewAuditLog> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type AuditLogFormRawValue = FormValueOf<IAuditLog>;

type NewAuditLogFormRawValue = FormValueOf<NewAuditLog>;

type AuditLogFormDefaults = Pick<NewAuditLog, 'id' | 'createdAt'>;

type AuditLogFormGroupContent = {
  id: FormControl<AuditLogFormRawValue['id'] | NewAuditLog['id']>;
  tenantId: FormControl<AuditLogFormRawValue['tenantId']>;
  entityType: FormControl<AuditLogFormRawValue['entityType']>;
  entityId: FormControl<AuditLogFormRawValue['entityId']>;
  action: FormControl<AuditLogFormRawValue['action']>;
  beforeJson: FormControl<AuditLogFormRawValue['beforeJson']>;
  afterJson: FormControl<AuditLogFormRawValue['afterJson']>;
  ipAddress: FormControl<AuditLogFormRawValue['ipAddress']>;
  userAgent: FormControl<AuditLogFormRawValue['userAgent']>;
  performedByLogin: FormControl<AuditLogFormRawValue['performedByLogin']>;
  createdAt: FormControl<AuditLogFormRawValue['createdAt']>;
};

export type AuditLogFormGroup = FormGroup<AuditLogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AuditLogFormService {
  createAuditLogFormGroup(auditLog: AuditLogFormGroupInput = { id: null }): AuditLogFormGroup {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({
      ...this.getFormDefaults(),
      ...auditLog,
    });
    return new FormGroup<AuditLogFormGroupContent>({
      id: new FormControl(
        { value: auditLogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(auditLogRawValue.tenantId),
      entityType: new FormControl(auditLogRawValue.entityType, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      entityId: new FormControl(auditLogRawValue.entityId, {
        validators: [Validators.maxLength(36)],
      }),
      action: new FormControl(auditLogRawValue.action, {
        validators: [Validators.required],
      }),
      beforeJson: new FormControl(auditLogRawValue.beforeJson),
      afterJson: new FormControl(auditLogRawValue.afterJson),
      ipAddress: new FormControl(auditLogRawValue.ipAddress, {
        validators: [Validators.maxLength(45)],
      }),
      userAgent: new FormControl(auditLogRawValue.userAgent, {
        validators: [Validators.maxLength(500)],
      }),
      performedByLogin: new FormControl(auditLogRawValue.performedByLogin, {
        validators: [Validators.maxLength(100)],
      }),
      createdAt: new FormControl(auditLogRawValue.createdAt, {
        validators: [Validators.required],
      }),
    });
  }

  getAuditLog(form: AuditLogFormGroup): IAuditLog | NewAuditLog {
    return this.convertAuditLogRawValueToAuditLog(form.getRawValue() as AuditLogFormRawValue | NewAuditLogFormRawValue);
  }

  resetForm(form: AuditLogFormGroup, auditLog: AuditLogFormGroupInput): void {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({ ...this.getFormDefaults(), ...auditLog });
    form.reset(
      {
        ...auditLogRawValue,
        id: { value: auditLogRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): AuditLogFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
    };
  }

  private convertAuditLogRawValueToAuditLog(rawAuditLog: AuditLogFormRawValue | NewAuditLogFormRawValue): IAuditLog | NewAuditLog {
    return {
      ...rawAuditLog,
      createdAt: dayjs(rawAuditLog.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertAuditLogToAuditLogRawValue(
    auditLog: IAuditLog | (Partial<NewAuditLog> & AuditLogFormDefaults)
  ): AuditLogFormRawValue | PartialWithRequiredKeyOf<NewAuditLogFormRawValue> {
    return {
      ...auditLog,
      createdAt: auditLog.createdAt ? auditLog.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
