import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOrderLine, NewOrderLine } from '../order-line.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOrderLine for edit and NewOrderLineFormGroupInput for create.
 */
type OrderLineFormGroupInput = IOrderLine | PartialWithRequiredKeyOf<NewOrderLine>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IOrderLine | NewOrderLine> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type OrderLineFormRawValue = FormValueOf<IOrderLine>;

type NewOrderLineFormRawValue = FormValueOf<NewOrderLine>;

type OrderLineFormDefaults = Pick<NewOrderLine, 'id' | 'createdAt'>;

type OrderLineFormGroupContent = {
  id: FormControl<OrderLineFormRawValue['id'] | NewOrderLine['id']>;
  quantity: FormControl<OrderLineFormRawValue['quantity']>;
  unitPrice: FormControl<OrderLineFormRawValue['unitPrice']>;
  discountPct: FormControl<OrderLineFormRawValue['discountPct']>;
  lineTotal: FormControl<OrderLineFormRawValue['lineTotal']>;
  createdAt: FormControl<OrderLineFormRawValue['createdAt']>;
  product: FormControl<OrderLineFormRawValue['product']>;
  order: FormControl<OrderLineFormRawValue['order']>;
};

export type OrderLineFormGroup = FormGroup<OrderLineFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrderLineFormService {
  createOrderLineFormGroup(orderLine: OrderLineFormGroupInput = { id: null }): OrderLineFormGroup {
    const orderLineRawValue = this.convertOrderLineToOrderLineRawValue({
      ...this.getFormDefaults(),
      ...orderLine,
    });
    return new FormGroup<OrderLineFormGroupContent>({
      id: new FormControl(
        { value: orderLineRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      quantity: new FormControl(orderLineRawValue.quantity, {
        validators: [Validators.required, Validators.min(1)],
      }),
      unitPrice: new FormControl(orderLineRawValue.unitPrice, {
        validators: [Validators.required, Validators.min(0)],
      }),
      discountPct: new FormControl(orderLineRawValue.discountPct, {
        validators: [Validators.min(0), Validators.max(100)],
      }),
      lineTotal: new FormControl(orderLineRawValue.lineTotal, {
        validators: [Validators.required, Validators.min(0)],
      }),
      createdAt: new FormControl(orderLineRawValue.createdAt, {
        validators: [Validators.required],
      }),
      product: new FormControl(orderLineRawValue.product, {
        validators: [Validators.required],
      }),
      order: new FormControl(orderLineRawValue.order, {
        validators: [Validators.required],
      }),
    });
  }

  getOrderLine(form: OrderLineFormGroup): IOrderLine | NewOrderLine {
    return this.convertOrderLineRawValueToOrderLine(form.getRawValue() as OrderLineFormRawValue | NewOrderLineFormRawValue);
  }

  resetForm(form: OrderLineFormGroup, orderLine: OrderLineFormGroupInput): void {
    const orderLineRawValue = this.convertOrderLineToOrderLineRawValue({ ...this.getFormDefaults(), ...orderLine });
    form.reset(
      {
        ...orderLineRawValue,
        id: { value: orderLineRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): OrderLineFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
    };
  }

  private convertOrderLineRawValueToOrderLine(rawOrderLine: OrderLineFormRawValue | NewOrderLineFormRawValue): IOrderLine | NewOrderLine {
    return {
      ...rawOrderLine,
      createdAt: dayjs(rawOrderLine.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertOrderLineToOrderLineRawValue(
    orderLine: IOrderLine | (Partial<NewOrderLine> & OrderLineFormDefaults)
  ): OrderLineFormRawValue | PartialWithRequiredKeyOf<NewOrderLineFormRawValue> {
    return {
      ...orderLine,
      createdAt: orderLine.createdAt ? orderLine.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
