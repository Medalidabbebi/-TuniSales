import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IStockItem, NewStockItem } from '../stock-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStockItem for edit and NewStockItemFormGroupInput for create.
 */
type StockItemFormGroupInput = IStockItem | PartialWithRequiredKeyOf<NewStockItem>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IStockItem | NewStockItem> = Omit<T, 'acquiredAt' | 'updatedAt'> & {
  acquiredAt?: string | null;
  updatedAt?: string | null;
};

type StockItemFormRawValue = FormValueOf<IStockItem>;

type NewStockItemFormRawValue = FormValueOf<NewStockItem>;

type StockItemFormDefaults = Pick<NewStockItem, 'id' | 'isDeleted' | 'acquiredAt' | 'updatedAt'>;

type StockItemFormGroupContent = {
  id: FormControl<StockItemFormRawValue['id'] | NewStockItem['id']>;
  tenantId: FormControl<StockItemFormRawValue['tenantId']>;
  productId: FormControl<StockItemFormRawValue['productId']>;
  productName: FormControl<StockItemFormRawValue['productName']>;
  imei: FormControl<StockItemFormRawValue['imei']>;
  status: FormControl<StockItemFormRawValue['status']>;
  isDeleted: FormControl<StockItemFormRawValue['isDeleted']>;
  acquiredAt: FormControl<StockItemFormRawValue['acquiredAt']>;
  updatedAt: FormControl<StockItemFormRawValue['updatedAt']>;
  warehouse: FormControl<StockItemFormRawValue['warehouse']>;
};

export type StockItemFormGroup = FormGroup<StockItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StockItemFormService {
  createStockItemFormGroup(stockItem: StockItemFormGroupInput = { id: null }): StockItemFormGroup {
    const stockItemRawValue = this.convertStockItemToStockItemRawValue({
      ...this.getFormDefaults(),
      ...stockItem,
    });
    return new FormGroup<StockItemFormGroupContent>({
      id: new FormControl(
        { value: stockItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(stockItemRawValue.tenantId, {
        validators: [Validators.required],
      }),
      productId: new FormControl(stockItemRawValue.productId, {
        validators: [Validators.required],
      }),
      productName: new FormControl(stockItemRawValue.productName, {
        validators: [Validators.maxLength(255)],
      }),
      imei: new FormControl(stockItemRawValue.imei, {
        validators: [Validators.required, Validators.minLength(15), Validators.maxLength(15)],
      }),
      status: new FormControl(stockItemRawValue.status, {
        validators: [Validators.required],
      }),
      isDeleted: new FormControl(stockItemRawValue.isDeleted, {
        validators: [Validators.required],
      }),
      acquiredAt: new FormControl(stockItemRawValue.acquiredAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(stockItemRawValue.updatedAt),
      warehouse: new FormControl(stockItemRawValue.warehouse, {
        validators: [Validators.required],
      }),
    });
  }

  getStockItem(form: StockItemFormGroup): IStockItem | NewStockItem {
    return this.convertStockItemRawValueToStockItem(form.getRawValue() as StockItemFormRawValue | NewStockItemFormRawValue);
  }

  resetForm(form: StockItemFormGroup, stockItem: StockItemFormGroupInput): void {
    const stockItemRawValue = this.convertStockItemToStockItemRawValue({ ...this.getFormDefaults(), ...stockItem });
    form.reset(
      {
        ...stockItemRawValue,
        id: { value: stockItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): StockItemFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isDeleted: false,
      acquiredAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertStockItemRawValueToStockItem(rawStockItem: StockItemFormRawValue | NewStockItemFormRawValue): IStockItem | NewStockItem {
    return {
      ...rawStockItem,
      acquiredAt: dayjs(rawStockItem.acquiredAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawStockItem.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertStockItemToStockItemRawValue(
    stockItem: IStockItem | (Partial<NewStockItem> & StockItemFormDefaults)
  ): StockItemFormRawValue | PartialWithRequiredKeyOf<NewStockItemFormRawValue> {
    return {
      ...stockItem,
      acquiredAt: stockItem.acquiredAt ? stockItem.acquiredAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: stockItem.updatedAt ? stockItem.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
