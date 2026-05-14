import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPerformanceScore, NewPerformanceScore } from '../performance-score.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPerformanceScore for edit and NewPerformanceScoreFormGroupInput for create.
 */
type PerformanceScoreFormGroupInput = IPerformanceScore | PartialWithRequiredKeyOf<NewPerformanceScore>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPerformanceScore | NewPerformanceScore> = Omit<T, 'calculatedAt'> & {
  calculatedAt?: string | null;
};

type PerformanceScoreFormRawValue = FormValueOf<IPerformanceScore>;

type NewPerformanceScoreFormRawValue = FormValueOf<NewPerformanceScore>;

type PerformanceScoreFormDefaults = Pick<NewPerformanceScore, 'id' | 'calculatedAt'>;

type PerformanceScoreFormGroupContent = {
  id: FormControl<PerformanceScoreFormRawValue['id'] | NewPerformanceScore['id']>;
  tenantId: FormControl<PerformanceScoreFormRawValue['tenantId']>;
  userLogin: FormControl<PerformanceScoreFormRawValue['userLogin']>;
  period: FormControl<PerformanceScoreFormRawValue['period']>;
  score: FormControl<PerformanceScoreFormRawValue['score']>;
  classification: FormControl<PerformanceScoreFormRawValue['classification']>;
  breakdownJson: FormControl<PerformanceScoreFormRawValue['breakdownJson']>;
  deltaVsPrevious: FormControl<PerformanceScoreFormRawValue['deltaVsPrevious']>;
  calculatedAt: FormControl<PerformanceScoreFormRawValue['calculatedAt']>;
};

export type PerformanceScoreFormGroup = FormGroup<PerformanceScoreFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PerformanceScoreFormService {
  createPerformanceScoreFormGroup(performanceScore: PerformanceScoreFormGroupInput = { id: null }): PerformanceScoreFormGroup {
    const performanceScoreRawValue = this.convertPerformanceScoreToPerformanceScoreRawValue({
      ...this.getFormDefaults(),
      ...performanceScore,
    });
    return new FormGroup<PerformanceScoreFormGroupContent>({
      id: new FormControl(
        { value: performanceScoreRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(performanceScoreRawValue.tenantId, {
        validators: [Validators.required],
      }),
      userLogin: new FormControl(performanceScoreRawValue.userLogin, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      period: new FormControl(performanceScoreRawValue.period, {
        validators: [Validators.required, Validators.maxLength(7)],
      }),
      score: new FormControl(performanceScoreRawValue.score, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      classification: new FormControl(performanceScoreRawValue.classification, {
        validators: [Validators.required],
      }),
      breakdownJson: new FormControl(performanceScoreRawValue.breakdownJson),
      deltaVsPrevious: new FormControl(performanceScoreRawValue.deltaVsPrevious),
      calculatedAt: new FormControl(performanceScoreRawValue.calculatedAt, {
        validators: [Validators.required],
      }),
    });
  }

  getPerformanceScore(form: PerformanceScoreFormGroup): IPerformanceScore | NewPerformanceScore {
    return this.convertPerformanceScoreRawValueToPerformanceScore(
      form.getRawValue() as PerformanceScoreFormRawValue | NewPerformanceScoreFormRawValue
    );
  }

  resetForm(form: PerformanceScoreFormGroup, performanceScore: PerformanceScoreFormGroupInput): void {
    const performanceScoreRawValue = this.convertPerformanceScoreToPerformanceScoreRawValue({
      ...this.getFormDefaults(),
      ...performanceScore,
    });
    form.reset(
      {
        ...performanceScoreRawValue,
        id: { value: performanceScoreRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): PerformanceScoreFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      calculatedAt: currentTime,
    };
  }

  private convertPerformanceScoreRawValueToPerformanceScore(
    rawPerformanceScore: PerformanceScoreFormRawValue | NewPerformanceScoreFormRawValue
  ): IPerformanceScore | NewPerformanceScore {
    return {
      ...rawPerformanceScore,
      calculatedAt: dayjs(rawPerformanceScore.calculatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertPerformanceScoreToPerformanceScoreRawValue(
    performanceScore: IPerformanceScore | (Partial<NewPerformanceScore> & PerformanceScoreFormDefaults)
  ): PerformanceScoreFormRawValue | PartialWithRequiredKeyOf<NewPerformanceScoreFormRawValue> {
    return {
      ...performanceScore,
      calculatedAt: performanceScore.calculatedAt ? performanceScore.calculatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
