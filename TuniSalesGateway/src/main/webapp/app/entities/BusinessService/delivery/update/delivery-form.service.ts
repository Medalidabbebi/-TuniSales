import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDelivery, NewDelivery } from '../delivery.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDelivery for edit and NewDeliveryFormGroupInput for create.
 */
type DeliveryFormGroupInput = IDelivery | PartialWithRequiredKeyOf<NewDelivery>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDelivery | NewDelivery> = Omit<T, 'shippedAt' | 'deliveredAt' | 'confirmedAt' | 'createdAt'> & {
  shippedAt?: string | null;
  deliveredAt?: string | null;
  confirmedAt?: string | null;
  createdAt?: string | null;
};

type DeliveryFormRawValue = FormValueOf<IDelivery>;

type NewDeliveryFormRawValue = FormValueOf<NewDelivery>;

type DeliveryFormDefaults = Pick<NewDelivery, 'id' | 'shippedAt' | 'deliveredAt' | 'confirmedAt' | 'createdAt'>;

type DeliveryFormGroupContent = {
  id: FormControl<DeliveryFormRawValue['id'] | NewDelivery['id']>;
  tenantId: FormControl<DeliveryFormRawValue['tenantId']>;
  deliveryNumber: FormControl<DeliveryFormRawValue['deliveryNumber']>;
  status: FormControl<DeliveryFormRawValue['status']>;
  trackingNumber: FormControl<DeliveryFormRawValue['trackingNumber']>;
  shippedAt: FormControl<DeliveryFormRawValue['shippedAt']>;
  deliveredAt: FormControl<DeliveryFormRawValue['deliveredAt']>;
  confirmedAt: FormControl<DeliveryFormRawValue['confirmedAt']>;
  notes: FormControl<DeliveryFormRawValue['notes']>;
  createdAt: FormControl<DeliveryFormRawValue['createdAt']>;
  order: FormControl<DeliveryFormRawValue['order']>;
};

export type DeliveryFormGroup = FormGroup<DeliveryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DeliveryFormService {
  createDeliveryFormGroup(delivery: DeliveryFormGroupInput = { id: null }): DeliveryFormGroup {
    const deliveryRawValue = this.convertDeliveryToDeliveryRawValue({
      ...this.getFormDefaults(),
      ...delivery,
    });
    return new FormGroup<DeliveryFormGroupContent>({
      id: new FormControl(
        { value: deliveryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(deliveryRawValue.tenantId, {
        validators: [Validators.required],
      }),
      deliveryNumber: new FormControl(deliveryRawValue.deliveryNumber, {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(50)],
      }),
      status: new FormControl(deliveryRawValue.status, {
        validators: [Validators.required],
      }),
      trackingNumber: new FormControl(deliveryRawValue.trackingNumber, {
        validators: [Validators.maxLength(100)],
      }),
      shippedAt: new FormControl(deliveryRawValue.shippedAt),
      deliveredAt: new FormControl(deliveryRawValue.deliveredAt),
      confirmedAt: new FormControl(deliveryRawValue.confirmedAt),
      notes: new FormControl(deliveryRawValue.notes, {
        validators: [Validators.maxLength(2000)],
      }),
      createdAt: new FormControl(deliveryRawValue.createdAt, {
        validators: [Validators.required],
      }),
      order: new FormControl(deliveryRawValue.order, {
        validators: [Validators.required],
      }),
    });
  }

  getDelivery(form: DeliveryFormGroup): IDelivery | NewDelivery {
    return this.convertDeliveryRawValueToDelivery(form.getRawValue() as DeliveryFormRawValue | NewDeliveryFormRawValue);
  }

  resetForm(form: DeliveryFormGroup, delivery: DeliveryFormGroupInput): void {
    const deliveryRawValue = this.convertDeliveryToDeliveryRawValue({ ...this.getFormDefaults(), ...delivery });
    form.reset(
      {
        ...deliveryRawValue,
        id: { value: deliveryRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DeliveryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      shippedAt: currentTime,
      deliveredAt: currentTime,
      confirmedAt: currentTime,
      createdAt: currentTime,
    };
  }

  private convertDeliveryRawValueToDelivery(rawDelivery: DeliveryFormRawValue | NewDeliveryFormRawValue): IDelivery | NewDelivery {
    return {
      ...rawDelivery,
      shippedAt: dayjs(rawDelivery.shippedAt, DATE_TIME_FORMAT),
      deliveredAt: dayjs(rawDelivery.deliveredAt, DATE_TIME_FORMAT),
      confirmedAt: dayjs(rawDelivery.confirmedAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawDelivery.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertDeliveryToDeliveryRawValue(
    delivery: IDelivery | (Partial<NewDelivery> & DeliveryFormDefaults)
  ): DeliveryFormRawValue | PartialWithRequiredKeyOf<NewDeliveryFormRawValue> {
    return {
      ...delivery,
      shippedAt: delivery.shippedAt ? delivery.shippedAt.format(DATE_TIME_FORMAT) : undefined,
      deliveredAt: delivery.deliveredAt ? delivery.deliveredAt.format(DATE_TIME_FORMAT) : undefined,
      confirmedAt: delivery.confirmedAt ? delivery.confirmedAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: delivery.createdAt ? delivery.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
