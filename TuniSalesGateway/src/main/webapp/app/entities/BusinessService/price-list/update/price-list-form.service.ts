import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPriceList, NewPriceList } from '../price-list.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPriceList for edit and NewPriceListFormGroupInput for create.
 */
type PriceListFormGroupInput = IPriceList | PartialWithRequiredKeyOf<NewPriceList>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPriceList | NewPriceList> = Omit<T, 'validFrom' | 'validTo' | 'createdAt'> & {
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string | null;
};

type PriceListFormRawValue = FormValueOf<IPriceList>;

type NewPriceListFormRawValue = FormValueOf<NewPriceList>;

type PriceListFormDefaults = Pick<NewPriceList, 'id' | 'validFrom' | 'validTo' | 'isActive' | 'createdAt'>;

type PriceListFormGroupContent = {
  id: FormControl<PriceListFormRawValue['id'] | NewPriceList['id']>;
  unitPrice: FormControl<PriceListFormRawValue['unitPrice']>;
  maxDiscountPct: FormControl<PriceListFormRawValue['maxDiscountPct']>;
  validFrom: FormControl<PriceListFormRawValue['validFrom']>;
  validTo: FormControl<PriceListFormRawValue['validTo']>;
  isActive: FormControl<PriceListFormRawValue['isActive']>;
  createdAt: FormControl<PriceListFormRawValue['createdAt']>;
  product: FormControl<PriceListFormRawValue['product']>;
  client: FormControl<PriceListFormRawValue['client']>;
};

export type PriceListFormGroup = FormGroup<PriceListFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PriceListFormService {
  createPriceListFormGroup(priceList: PriceListFormGroupInput = { id: null }): PriceListFormGroup {
    const priceListRawValue = this.convertPriceListToPriceListRawValue({
      ...this.getFormDefaults(),
      ...priceList,
    });
    return new FormGroup<PriceListFormGroupContent>({
      id: new FormControl(
        { value: priceListRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      unitPrice: new FormControl(priceListRawValue.unitPrice, {
        validators: [Validators.required, Validators.min(0)],
      }),
      maxDiscountPct: new FormControl(priceListRawValue.maxDiscountPct, {
        validators: [Validators.min(0), Validators.max(100)],
      }),
      validFrom: new FormControl(priceListRawValue.validFrom, {
        validators: [Validators.required],
      }),
      validTo: new FormControl(priceListRawValue.validTo, {
        validators: [Validators.required],
      }),
      isActive: new FormControl(priceListRawValue.isActive, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(priceListRawValue.createdAt, {
        validators: [Validators.required],
      }),
      product: new FormControl(priceListRawValue.product, {
        validators: [Validators.required],
      }),
      client: new FormControl(priceListRawValue.client, {
        validators: [Validators.required],
      }),
    });
  }

  getPriceList(form: PriceListFormGroup): IPriceList | NewPriceList {
    return this.convertPriceListRawValueToPriceList(form.getRawValue() as PriceListFormRawValue | NewPriceListFormRawValue);
  }

  resetForm(form: PriceListFormGroup, priceList: PriceListFormGroupInput): void {
    const priceListRawValue = this.convertPriceListToPriceListRawValue({ ...this.getFormDefaults(), ...priceList });
    form.reset(
      {
        ...priceListRawValue,
        id: { value: priceListRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): PriceListFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      validFrom: currentTime,
      validTo: currentTime,
      isActive: false,
      createdAt: currentTime,
    };
  }

  private convertPriceListRawValueToPriceList(rawPriceList: PriceListFormRawValue | NewPriceListFormRawValue): IPriceList | NewPriceList {
    return {
      ...rawPriceList,
      validFrom: dayjs(rawPriceList.validFrom, DATE_TIME_FORMAT),
      validTo: dayjs(rawPriceList.validTo, DATE_TIME_FORMAT),
      createdAt: dayjs(rawPriceList.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertPriceListToPriceListRawValue(
    priceList: IPriceList | (Partial<NewPriceList> & PriceListFormDefaults)
  ): PriceListFormRawValue | PartialWithRequiredKeyOf<NewPriceListFormRawValue> {
    return {
      ...priceList,
      validFrom: priceList.validFrom ? priceList.validFrom.format(DATE_TIME_FORMAT) : undefined,
      validTo: priceList.validTo ? priceList.validTo.format(DATE_TIME_FORMAT) : undefined,
      createdAt: priceList.createdAt ? priceList.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
