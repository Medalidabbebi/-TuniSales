import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IStockAuditLine, NewStockAuditLine } from '../stock-audit-line.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStockAuditLine for edit and NewStockAuditLineFormGroupInput for create.
 */
type StockAuditLineFormGroupInput = IStockAuditLine | PartialWithRequiredKeyOf<NewStockAuditLine>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IStockAuditLine | NewStockAuditLine> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type StockAuditLineFormRawValue = FormValueOf<IStockAuditLine>;

type NewStockAuditLineFormRawValue = FormValueOf<NewStockAuditLine>;

type StockAuditLineFormDefaults = Pick<NewStockAuditLine, 'id' | 'foundPhysically' | 'createdAt'>;

type StockAuditLineFormGroupContent = {
  id: FormControl<StockAuditLineFormRawValue['id'] | NewStockAuditLine['id']>;
  foundPhysically: FormControl<StockAuditLineFormRawValue['foundPhysically']>;
  resolution: FormControl<StockAuditLineFormRawValue['resolution']>;
  resolutionNote: FormControl<StockAuditLineFormRawValue['resolutionNote']>;
  createdAt: FormControl<StockAuditLineFormRawValue['createdAt']>;
  stockItem: FormControl<StockAuditLineFormRawValue['stockItem']>;
  audit: FormControl<StockAuditLineFormRawValue['audit']>;
};

export type StockAuditLineFormGroup = FormGroup<StockAuditLineFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StockAuditLineFormService {
  createStockAuditLineFormGroup(stockAuditLine: StockAuditLineFormGroupInput = { id: null }): StockAuditLineFormGroup {
    const stockAuditLineRawValue = this.convertStockAuditLineToStockAuditLineRawValue({
      ...this.getFormDefaults(),
      ...stockAuditLine,
    });
    return new FormGroup<StockAuditLineFormGroupContent>({
      id: new FormControl(
        { value: stockAuditLineRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      foundPhysically: new FormControl(stockAuditLineRawValue.foundPhysically, {
        validators: [Validators.required],
      }),
      resolution: new FormControl(stockAuditLineRawValue.resolution),
      resolutionNote: new FormControl(stockAuditLineRawValue.resolutionNote, {
        validators: [Validators.maxLength(500)],
      }),
      createdAt: new FormControl(stockAuditLineRawValue.createdAt, {
        validators: [Validators.required],
      }),
      stockItem: new FormControl(stockAuditLineRawValue.stockItem, {
        validators: [Validators.required],
      }),
      audit: new FormControl(stockAuditLineRawValue.audit, {
        validators: [Validators.required],
      }),
    });
  }

  getStockAuditLine(form: StockAuditLineFormGroup): IStockAuditLine | NewStockAuditLine {
    return this.convertStockAuditLineRawValueToStockAuditLine(
      form.getRawValue() as StockAuditLineFormRawValue | NewStockAuditLineFormRawValue
    );
  }

  resetForm(form: StockAuditLineFormGroup, stockAuditLine: StockAuditLineFormGroupInput): void {
    const stockAuditLineRawValue = this.convertStockAuditLineToStockAuditLineRawValue({ ...this.getFormDefaults(), ...stockAuditLine });
    form.reset(
      {
        ...stockAuditLineRawValue,
        id: { value: stockAuditLineRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): StockAuditLineFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      foundPhysically: false,
      createdAt: currentTime,
    };
  }

  private convertStockAuditLineRawValueToStockAuditLine(
    rawStockAuditLine: StockAuditLineFormRawValue | NewStockAuditLineFormRawValue
  ): IStockAuditLine | NewStockAuditLine {
    return {
      ...rawStockAuditLine,
      createdAt: dayjs(rawStockAuditLine.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertStockAuditLineToStockAuditLineRawValue(
    stockAuditLine: IStockAuditLine | (Partial<NewStockAuditLine> & StockAuditLineFormDefaults)
  ): StockAuditLineFormRawValue | PartialWithRequiredKeyOf<NewStockAuditLineFormRawValue> {
    return {
      ...stockAuditLine,
      createdAt: stockAuditLine.createdAt ? stockAuditLine.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
