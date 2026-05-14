import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOrder, NewOrder } from '../order.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';

type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

type OrderFormGroupInput = IOrder | PartialWithRequiredKeyOf<NewOrder>;

type FormValueOf<T extends IOrder | NewOrder> = Omit<T, 'dueDate' | 'submittedAt' | 'validatedAt' | 'createdAt' | 'updatedAt'> & {
  dueDate?: string | null;
  submittedAt?: string | null;
  validatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type OrderFormRawValue = FormValueOf<IOrder>;
type NewOrderFormRawValue = FormValueOf<NewOrder>;
type OrderFormDefaults = Pick<NewOrder, 'id' | 'dueDate' | 'submittedAt' | 'validatedAt' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

type OrderFormGroupContent = {
  id: FormControl<OrderFormRawValue['id'] | NewOrder['id']>;
  tenantId: FormControl<OrderFormRawValue['tenantId']>;
  orderNumber: FormControl<OrderFormRawValue['orderNumber']>;
  status: FormControl<OrderFormRawValue['status']>;
  paymentMethod: FormControl<PaymentMethod | null>;
  discountPercent: FormControl<number | null>;
  subtotal: FormControl<OrderFormRawValue['subtotal']>;
  discountAmount: FormControl<OrderFormRawValue['discountAmount']>;
  taxAmount: FormControl<OrderFormRawValue['taxAmount']>;
  totalAmount: FormControl<OrderFormRawValue['totalAmount']>;
  paymentTermsDays: FormControl<OrderFormRawValue['paymentTermsDays']>;
  dueDate: FormControl<OrderFormRawValue['dueDate']>;
  rejectionReason: FormControl<OrderFormRawValue['rejectionReason']>;
  submittedAt: FormControl<OrderFormRawValue['submittedAt']>;
  validatedAt: FormControl<OrderFormRawValue['validatedAt']>;
  isDeleted: FormControl<OrderFormRawValue['isDeleted']>;
  createdAt: FormControl<OrderFormRawValue['createdAt']>;
  updatedAt: FormControl<OrderFormRawValue['updatedAt']>;
  client: FormControl<OrderFormRawValue['client']>;
};

export type OrderFormGroup = FormGroup<OrderFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrderFormService {
  createOrderFormGroup(order: OrderFormGroupInput = { id: null }): OrderFormGroup {
    const orderRawValue = this.convertOrderToOrderRawValue({
      ...this.getFormDefaults(),
      ...order,
    });
    return new FormGroup<OrderFormGroupContent>({
      id: new FormControl({ value: orderRawValue.id, disabled: true }, { nonNullable: true, validators: [Validators.required] }),
      tenantId: new FormControl(orderRawValue.tenantId),
      orderNumber: new FormControl(orderRawValue.orderNumber, {
        validators: [Validators.minLength(5), Validators.maxLength(50)],
      }),
      status: new FormControl(orderRawValue.status),
      paymentMethod: new FormControl<PaymentMethod | null>(
        (orderRawValue as any).paymentMethod ?? null,
        Validators.required
      ),
      discountPercent: new FormControl<number | null>(
        (orderRawValue as any).discountPercent ?? 0,
        [Validators.min(0), Validators.max(100)]
      ),
      subtotal: new FormControl(orderRawValue.subtotal, { validators: [Validators.min(0)] }),
      discountAmount: new FormControl(orderRawValue.discountAmount, { validators: [Validators.min(0)] }),
      taxAmount: new FormControl(orderRawValue.taxAmount, { validators: [Validators.min(0)] }),
      totalAmount: new FormControl(orderRawValue.totalAmount, { validators: [Validators.min(0)] }),
      paymentTermsDays: new FormControl(orderRawValue.paymentTermsDays, { validators: [Validators.min(0)] }),
      dueDate: new FormControl(orderRawValue.dueDate),
      rejectionReason: new FormControl(orderRawValue.rejectionReason, { validators: [Validators.maxLength(1000)] }),
      submittedAt: new FormControl(orderRawValue.submittedAt),
      validatedAt: new FormControl(orderRawValue.validatedAt),
      isDeleted: new FormControl(orderRawValue.isDeleted ?? false),
      createdAt: new FormControl(orderRawValue.createdAt),
      updatedAt: new FormControl(orderRawValue.updatedAt),
      client: new FormControl(orderRawValue.client, { validators: [Validators.required] }),
    });
  }

  getOrder(form: OrderFormGroup): IOrder | NewOrder {
    return this.convertOrderRawValueToOrder(form.getRawValue() as OrderFormRawValue | NewOrderFormRawValue);
  }

  resetForm(form: OrderFormGroup, order: OrderFormGroupInput): void {
    const orderRawValue = this.convertOrderToOrderRawValue({ ...this.getFormDefaults(), ...order });
    form.reset({ ...orderRawValue, id: { value: orderRawValue.id, disabled: true } } as any);
  }

  private getFormDefaults(): OrderFormDefaults {
    const currentTime = dayjs();
    return {
      id: null,
      dueDate: currentTime,
      submittedAt: currentTime,
      validatedAt: currentTime,
      isDeleted: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertOrderRawValueToOrder(rawOrder: OrderFormRawValue | NewOrderFormRawValue): IOrder | NewOrder {
    return {
      ...rawOrder,
      dueDate: rawOrder.dueDate ? dayjs(rawOrder.dueDate, DATE_TIME_FORMAT) : undefined,
      submittedAt: rawOrder.submittedAt ? dayjs(rawOrder.submittedAt, DATE_TIME_FORMAT) : undefined,
      validatedAt: rawOrder.validatedAt ? dayjs(rawOrder.validatedAt, DATE_TIME_FORMAT) : undefined,
      createdAt: rawOrder.createdAt ? dayjs(rawOrder.createdAt, DATE_TIME_FORMAT) : undefined,
      updatedAt: rawOrder.updatedAt ? dayjs(rawOrder.updatedAt, DATE_TIME_FORMAT) : undefined,
    };
  }

  private convertOrderToOrderRawValue(
    order: IOrder | (Partial<NewOrder> & OrderFormDefaults)
  ): OrderFormRawValue | PartialWithRequiredKeyOf<NewOrderFormRawValue> {
    return {
      ...order,
      dueDate: order.dueDate ? order.dueDate.format(DATE_TIME_FORMAT) : undefined,
      submittedAt: order.submittedAt ? order.submittedAt.format(DATE_TIME_FORMAT) : undefined,
      validatedAt: order.validatedAt ? order.validatedAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: order.createdAt ? order.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: order.updatedAt ? order.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
