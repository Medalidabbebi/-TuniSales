import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IStockAudit, NewStockAudit } from '../stock-audit.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStockAudit for edit and NewStockAuditFormGroupInput for create.
 */
type StockAuditFormGroupInput = IStockAudit | PartialWithRequiredKeyOf<NewStockAudit>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IStockAudit | NewStockAudit> = Omit<T, 'startedAt' | 'closedAt'> & {
  startedAt?: string | null;
  closedAt?: string | null;
};

type StockAuditFormRawValue = FormValueOf<IStockAudit>;

type NewStockAuditFormRawValue = FormValueOf<NewStockAudit>;

type StockAuditFormDefaults = Pick<NewStockAudit, 'id' | 'startedAt' | 'closedAt'>;

type StockAuditFormGroupContent = {
  id: FormControl<StockAuditFormRawValue['id'] | NewStockAudit['id']>;
  tenantId: FormControl<StockAuditFormRawValue['tenantId']>;
  status: FormControl<StockAuditFormRawValue['status']>;
  theoreticalCount: FormControl<StockAuditFormRawValue['theoreticalCount']>;
  physicalCount: FormControl<StockAuditFormRawValue['physicalCount']>;
  discrepancyCount: FormControl<StockAuditFormRawValue['discrepancyCount']>;
  notes: FormControl<StockAuditFormRawValue['notes']>;
  auditorLogin: FormControl<StockAuditFormRawValue['auditorLogin']>;
  startedAt: FormControl<StockAuditFormRawValue['startedAt']>;
  closedAt: FormControl<StockAuditFormRawValue['closedAt']>;
  warehouse: FormControl<StockAuditFormRawValue['warehouse']>;
};

export type StockAuditFormGroup = FormGroup<StockAuditFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StockAuditFormService {
  createStockAuditFormGroup(stockAudit: StockAuditFormGroupInput = { id: null }): StockAuditFormGroup {
    const stockAuditRawValue = this.convertStockAuditToStockAuditRawValue({
      ...this.getFormDefaults(),
      ...stockAudit,
    });
    return new FormGroup<StockAuditFormGroupContent>({
      id: new FormControl(
        { value: stockAuditRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(stockAuditRawValue.tenantId, {
        validators: [Validators.required],
      }),
      status: new FormControl(stockAuditRawValue.status, {
        validators: [Validators.required],
      }),
      theoreticalCount: new FormControl(stockAuditRawValue.theoreticalCount, {
        validators: [Validators.min(0)],
      }),
      physicalCount: new FormControl(stockAuditRawValue.physicalCount, {
        validators: [Validators.min(0)],
      }),
      discrepancyCount: new FormControl(stockAuditRawValue.discrepancyCount, {
        validators: [Validators.min(0)],
      }),
      notes: new FormControl(stockAuditRawValue.notes, {
        validators: [Validators.maxLength(2000)],
      }),
      auditorLogin: new FormControl(stockAuditRawValue.auditorLogin, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      startedAt: new FormControl(stockAuditRawValue.startedAt, {
        validators: [Validators.required],
      }),
      closedAt: new FormControl(stockAuditRawValue.closedAt),
      warehouse: new FormControl(stockAuditRawValue.warehouse, {
        validators: [Validators.required],
      }),
    });
  }

  getStockAudit(form: StockAuditFormGroup): IStockAudit | NewStockAudit {
    return this.convertStockAuditRawValueToStockAudit(form.getRawValue() as StockAuditFormRawValue | NewStockAuditFormRawValue);
  }

  resetForm(form: StockAuditFormGroup, stockAudit: StockAuditFormGroupInput): void {
    const stockAuditRawValue = this.convertStockAuditToStockAuditRawValue({ ...this.getFormDefaults(), ...stockAudit });
    form.reset(
      {
        ...stockAuditRawValue,
        id: { value: stockAuditRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): StockAuditFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      startedAt: currentTime,
      closedAt: currentTime,
    };
  }

  private convertStockAuditRawValueToStockAudit(
    rawStockAudit: StockAuditFormRawValue | NewStockAuditFormRawValue
  ): IStockAudit | NewStockAudit {
    return {
      ...rawStockAudit,
      startedAt: dayjs(rawStockAudit.startedAt, DATE_TIME_FORMAT),
      closedAt: dayjs(rawStockAudit.closedAt, DATE_TIME_FORMAT),
    };
  }

  private convertStockAuditToStockAuditRawValue(
    stockAudit: IStockAudit | (Partial<NewStockAudit> & StockAuditFormDefaults)
  ): StockAuditFormRawValue | PartialWithRequiredKeyOf<NewStockAuditFormRawValue> {
    return {
      ...stockAudit,
      startedAt: stockAudit.startedAt ? stockAudit.startedAt.format(DATE_TIME_FORMAT) : undefined,
      closedAt: stockAudit.closedAt ? stockAudit.closedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
