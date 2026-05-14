import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IClientScore, NewClientScore } from '../client-score.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClientScore for edit and NewClientScoreFormGroupInput for create.
 */
type ClientScoreFormGroupInput = IClientScore | PartialWithRequiredKeyOf<NewClientScore>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IClientScore | NewClientScore> = Omit<T, 'calculatedAt'> & {
  calculatedAt?: string | null;
};

type ClientScoreFormRawValue = FormValueOf<IClientScore>;

type NewClientScoreFormRawValue = FormValueOf<NewClientScore>;

type ClientScoreFormDefaults = Pick<NewClientScore, 'id' | 'calculatedAt'>;

type ClientScoreFormGroupContent = {
  id: FormControl<ClientScoreFormRawValue['id'] | NewClientScore['id']>;
  tenantId: FormControl<ClientScoreFormRawValue['tenantId']>;
  clientId: FormControl<ClientScoreFormRawValue['clientId']>;
  clientName: FormControl<ClientScoreFormRawValue['clientName']>;
  period: FormControl<ClientScoreFormRawValue['period']>;
  score: FormControl<ClientScoreFormRawValue['score']>;
  classification: FormControl<ClientScoreFormRawValue['classification']>;
  breakdownJson: FormControl<ClientScoreFormRawValue['breakdownJson']>;
  calculatedAt: FormControl<ClientScoreFormRawValue['calculatedAt']>;
};

export type ClientScoreFormGroup = FormGroup<ClientScoreFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClientScoreFormService {
  createClientScoreFormGroup(clientScore: ClientScoreFormGroupInput = { id: null }): ClientScoreFormGroup {
    const clientScoreRawValue = this.convertClientScoreToClientScoreRawValue({
      ...this.getFormDefaults(),
      ...clientScore,
    });
    return new FormGroup<ClientScoreFormGroupContent>({
      id: new FormControl(
        { value: clientScoreRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(clientScoreRawValue.tenantId, {
        validators: [Validators.required],
      }),
      clientId: new FormControl(clientScoreRawValue.clientId, {
        validators: [Validators.required],
      }),
      clientName: new FormControl(clientScoreRawValue.clientName, {
        validators: [Validators.maxLength(255)],
      }),
      period: new FormControl(clientScoreRawValue.period, {
        validators: [Validators.required, Validators.maxLength(7)],
      }),
      score: new FormControl(clientScoreRawValue.score, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      classification: new FormControl(clientScoreRawValue.classification, {
        validators: [Validators.required],
      }),
      breakdownJson: new FormControl(clientScoreRawValue.breakdownJson),
      calculatedAt: new FormControl(clientScoreRawValue.calculatedAt, {
        validators: [Validators.required],
      }),
    });
  }

  getClientScore(form: ClientScoreFormGroup): IClientScore | NewClientScore {
    return this.convertClientScoreRawValueToClientScore(form.getRawValue() as ClientScoreFormRawValue | NewClientScoreFormRawValue);
  }

  resetForm(form: ClientScoreFormGroup, clientScore: ClientScoreFormGroupInput): void {
    const clientScoreRawValue = this.convertClientScoreToClientScoreRawValue({ ...this.getFormDefaults(), ...clientScore });
    form.reset(
      {
        ...clientScoreRawValue,
        id: { value: clientScoreRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ClientScoreFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      calculatedAt: currentTime,
    };
  }

  private convertClientScoreRawValueToClientScore(
    rawClientScore: ClientScoreFormRawValue | NewClientScoreFormRawValue
  ): IClientScore | NewClientScore {
    return {
      ...rawClientScore,
      calculatedAt: dayjs(rawClientScore.calculatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertClientScoreToClientScoreRawValue(
    clientScore: IClientScore | (Partial<NewClientScore> & ClientScoreFormDefaults)
  ): ClientScoreFormRawValue | PartialWithRequiredKeyOf<NewClientScoreFormRawValue> {
    return {
      ...clientScore,
      calculatedAt: clientScore.calculatedAt ? clientScore.calculatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
