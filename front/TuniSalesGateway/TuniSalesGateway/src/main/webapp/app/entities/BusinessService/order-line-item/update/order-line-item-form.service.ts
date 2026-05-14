import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOrderLineItem, NewOrderLineItem } from '../order-line-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOrderLineItem for edit and NewOrderLineItemFormGroupInput for create.
 */
type OrderLineItemFormGroupInput = IOrderLineItem | PartialWithRequiredKeyOf<NewOrderLineItem>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IOrderLineItem | NewOrderLineItem> = Omit<T, 'assignedAt'> & {
  assignedAt?: string | null;
};

type OrderLineItemFormRawValue = FormValueOf<IOrderLineItem>;

type NewOrderLineItemFormRawValue = FormValueOf<NewOrderLineItem>;

type OrderLineItemFormDefaults = Pick<NewOrderLineItem, 'id' | 'assignedAt'>;

type OrderLineItemFormGroupContent = {
  id: FormControl<OrderLineItemFormRawValue['id'] | NewOrderLineItem['id']>;
  stockItemId: FormControl<OrderLineItemFormRawValue['stockItemId']>;
  stockItemImei: FormControl<OrderLineItemFormRawValue['stockItemImei']>;
  assignedAt: FormControl<OrderLineItemFormRawValue['assignedAt']>;
  orderLine: FormControl<OrderLineItemFormRawValue['orderLine']>;
};

export type OrderLineItemFormGroup = FormGroup<OrderLineItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrderLineItemFormService {
  createOrderLineItemFormGroup(orderLineItem: OrderLineItemFormGroupInput = { id: null }): OrderLineItemFormGroup {
    const orderLineItemRawValue = this.convertOrderLineItemToOrderLineItemRawValue({
      ...this.getFormDefaults(),
      ...orderLineItem,
    });
    return new FormGroup<OrderLineItemFormGroupContent>({
      id: new FormControl(
        { value: orderLineItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      stockItemId: new FormControl(orderLineItemRawValue.stockItemId, {
        validators: [Validators.required],
      }),
      stockItemImei: new FormControl(orderLineItemRawValue.stockItemImei, {
        validators: [Validators.maxLength(15)],
      }),
      assignedAt: new FormControl(orderLineItemRawValue.assignedAt, {
        validators: [Validators.required],
      }),
      orderLine: new FormControl(orderLineItemRawValue.orderLine, {
        validators: [Validators.required],
      }),
    });
  }

  getOrderLineItem(form: OrderLineItemFormGroup): IOrderLineItem | NewOrderLineItem {
    return this.convertOrderLineItemRawValueToOrderLineItem(form.getRawValue() as OrderLineItemFormRawValue | NewOrderLineItemFormRawValue);
  }

  resetForm(form: OrderLineItemFormGroup, orderLineItem: OrderLineItemFormGroupInput): void {
    const orderLineItemRawValue = this.convertOrderLineItemToOrderLineItemRawValue({ ...this.getFormDefaults(), ...orderLineItem });
    form.reset(
      {
        ...orderLineItemRawValue,
        id: { value: orderLineItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): OrderLineItemFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      assignedAt: currentTime,
    };
  }

  private convertOrderLineItemRawValueToOrderLineItem(
    rawOrderLineItem: OrderLineItemFormRawValue | NewOrderLineItemFormRawValue
  ): IOrderLineItem | NewOrderLineItem {
    return {
      ...rawOrderLineItem,
      assignedAt: dayjs(rawOrderLineItem.assignedAt, DATE_TIME_FORMAT),
    };
  }

  private convertOrderLineItemToOrderLineItemRawValue(
    orderLineItem: IOrderLineItem | (Partial<NewOrderLineItem> & OrderLineItemFormDefaults)
  ): OrderLineItemFormRawValue | PartialWithRequiredKeyOf<NewOrderLineItemFormRawValue> {
    return {
      ...orderLineItem,
      assignedAt: orderLineItem.assignedAt ? orderLineItem.assignedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
