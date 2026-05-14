import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IStockMovement, NewStockMovement } from '../stock-movement.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStockMovement for edit and NewStockMovementFormGroupInput for create.
 */
type StockMovementFormGroupInput = IStockMovement | PartialWithRequiredKeyOf<NewStockMovement>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IStockMovement | NewStockMovement> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type StockMovementFormRawValue = FormValueOf<IStockMovement>;

type NewStockMovementFormRawValue = FormValueOf<NewStockMovement>;

type StockMovementFormDefaults = Pick<NewStockMovement, 'id' | 'createdAt'>;

type StockMovementFormGroupContent = {
  id: FormControl<StockMovementFormRawValue['id'] | NewStockMovement['id']>;
  movementType: FormControl<StockMovementFormRawValue['movementType']>;
  reason: FormControl<StockMovementFormRawValue['reason']>;
  reference: FormControl<StockMovementFormRawValue['reference']>;
  quantity: FormControl<StockMovementFormRawValue['quantity']>;
  performedByLogin: FormControl<StockMovementFormRawValue['performedByLogin']>;
  createdAt: FormControl<StockMovementFormRawValue['createdAt']>;
  fromWarehouse: FormControl<StockMovementFormRawValue['fromWarehouse']>;
  toWarehouse: FormControl<StockMovementFormRawValue['toWarehouse']>;
  stockItem: FormControl<StockMovementFormRawValue['stockItem']>;
};

export type StockMovementFormGroup = FormGroup<StockMovementFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StockMovementFormService {
  createStockMovementFormGroup(stockMovement: StockMovementFormGroupInput = { id: null }): StockMovementFormGroup {
    const stockMovementRawValue = this.convertStockMovementToStockMovementRawValue({
      ...this.getFormDefaults(),
      ...stockMovement,
    });
    return new FormGroup<StockMovementFormGroupContent>({
      id: new FormControl(
        { value: stockMovementRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      movementType: new FormControl(stockMovementRawValue.movementType, {
        validators: [Validators.required],
      }),
      reason: new FormControl(stockMovementRawValue.reason, {
        validators: [Validators.maxLength(500)],
      }),
      reference: new FormControl(stockMovementRawValue.reference, {
        validators: [Validators.maxLength(100)],
      }),
      quantity: new FormControl(stockMovementRawValue.quantity, {
        validators: [Validators.required, Validators.min(1)],
      }),
      performedByLogin: new FormControl(stockMovementRawValue.performedByLogin, {
        validators: [Validators.maxLength(100)],
      }),
      createdAt: new FormControl(stockMovementRawValue.createdAt, {
        validators: [Validators.required],
      }),
      fromWarehouse: new FormControl(stockMovementRawValue.fromWarehouse),
      toWarehouse: new FormControl(stockMovementRawValue.toWarehouse),
      stockItem: new FormControl(stockMovementRawValue.stockItem, {
        validators: [Validators.required],
      }),
    });
  }

  getStockMovement(form: StockMovementFormGroup): IStockMovement | NewStockMovement {
    return this.convertStockMovementRawValueToStockMovement(form.getRawValue() as StockMovementFormRawValue | NewStockMovementFormRawValue);
  }

  resetForm(form: StockMovementFormGroup, stockMovement: StockMovementFormGroupInput): void {
    const stockMovementRawValue = this.convertStockMovementToStockMovementRawValue({ ...this.getFormDefaults(), ...stockMovement });
    form.reset(
      {
        ...stockMovementRawValue,
        id: { value: stockMovementRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): StockMovementFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
    };
  }

  private convertStockMovementRawValueToStockMovement(
    rawStockMovement: StockMovementFormRawValue | NewStockMovementFormRawValue
  ): IStockMovement | NewStockMovement {
    return {
      ...rawStockMovement,
      createdAt: dayjs(rawStockMovement.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertStockMovementToStockMovementRawValue(
    stockMovement: IStockMovement | (Partial<NewStockMovement> & StockMovementFormDefaults)
  ): StockMovementFormRawValue | PartialWithRequiredKeyOf<NewStockMovementFormRawValue> {
    return {
      ...stockMovement,
      createdAt: stockMovement.createdAt ? stockMovement.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
