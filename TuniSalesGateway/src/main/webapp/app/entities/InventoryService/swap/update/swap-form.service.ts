import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISwap, NewSwap } from '../swap.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISwap for edit and NewSwapFormGroupInput for create.
 */
type SwapFormGroupInput = ISwap | PartialWithRequiredKeyOf<NewSwap>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ISwap | NewSwap> = Omit<T, 'createdAt' | 'resolvedAt' | 'updatedAt'> & {
  createdAt?: string | null;
  resolvedAt?: string | null;
  updatedAt?: string | null;
};

type SwapFormRawValue = FormValueOf<ISwap>;

type NewSwapFormRawValue = FormValueOf<NewSwap>;

type SwapFormDefaults = Pick<NewSwap, 'id' | 'createdAt' | 'resolvedAt' | 'updatedAt'>;

type SwapFormGroupContent = {
  id: FormControl<SwapFormRawValue['id'] | NewSwap['id']>;
  tenantId: FormControl<SwapFormRawValue['tenantId']>;
  clientId: FormControl<SwapFormRawValue['clientId']>;
  clientName: FormControl<SwapFormRawValue['clientName']>;
  status: FormControl<SwapFormRawValue['status']>;
  reason: FormControl<SwapFormRawValue['reason']>;
  createdAt: FormControl<SwapFormRawValue['createdAt']>;
  resolvedAt: FormControl<SwapFormRawValue['resolvedAt']>;
  updatedAt: FormControl<SwapFormRawValue['updatedAt']>;
  outgoingItem: FormControl<SwapFormRawValue['outgoingItem']>;
  incomingItem: FormControl<SwapFormRawValue['incomingItem']>;
};

export type SwapFormGroup = FormGroup<SwapFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SwapFormService {
  createSwapFormGroup(swap: SwapFormGroupInput = { id: null }): SwapFormGroup {
    const swapRawValue = this.convertSwapToSwapRawValue({
      ...this.getFormDefaults(),
      ...swap,
    });
    return new FormGroup<SwapFormGroupContent>({
      id: new FormControl(
        { value: swapRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(swapRawValue.tenantId, {
        validators: [Validators.required],
      }),
      clientId: new FormControl(swapRawValue.clientId, {
        validators: [Validators.required],
      }),
      clientName: new FormControl(swapRawValue.clientName, {
        validators: [Validators.maxLength(255)],
      }),
      status: new FormControl(swapRawValue.status, {
        validators: [Validators.required],
      }),
      reason: new FormControl(swapRawValue.reason, {
        validators: [Validators.maxLength(500)],
      }),
      createdAt: new FormControl(swapRawValue.createdAt, {
        validators: [Validators.required],
      }),
      resolvedAt: new FormControl(swapRawValue.resolvedAt),
      updatedAt: new FormControl(swapRawValue.updatedAt),
      outgoingItem: new FormControl(swapRawValue.outgoingItem, {
        validators: [Validators.required],
      }),
      incomingItem: new FormControl(swapRawValue.incomingItem),
    });
  }

  getSwap(form: SwapFormGroup): ISwap | NewSwap {
    return this.convertSwapRawValueToSwap(form.getRawValue() as SwapFormRawValue | NewSwapFormRawValue);
  }

  resetForm(form: SwapFormGroup, swap: SwapFormGroupInput): void {
    const swapRawValue = this.convertSwapToSwapRawValue({ ...this.getFormDefaults(), ...swap });
    form.reset(
      {
        ...swapRawValue,
        id: { value: swapRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): SwapFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      resolvedAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertSwapRawValueToSwap(rawSwap: SwapFormRawValue | NewSwapFormRawValue): ISwap | NewSwap {
    return {
      ...rawSwap,
      createdAt: dayjs(rawSwap.createdAt, DATE_TIME_FORMAT),
      resolvedAt: dayjs(rawSwap.resolvedAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawSwap.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertSwapToSwapRawValue(
    swap: ISwap | (Partial<NewSwap> & SwapFormDefaults)
  ): SwapFormRawValue | PartialWithRequiredKeyOf<NewSwapFormRawValue> {
    return {
      ...swap,
      createdAt: swap.createdAt ? swap.createdAt.format(DATE_TIME_FORMAT) : undefined,
      resolvedAt: swap.resolvedAt ? swap.resolvedAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: swap.updatedAt ? swap.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
