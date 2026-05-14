import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IObjective, NewObjective } from '../objective.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IObjective for edit and NewObjectiveFormGroupInput for create.
 */
type ObjectiveFormGroupInput = IObjective | PartialWithRequiredKeyOf<NewObjective>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IObjective | NewObjective> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ObjectiveFormRawValue = FormValueOf<IObjective>;

type NewObjectiveFormRawValue = FormValueOf<NewObjective>;

type ObjectiveFormDefaults = Pick<NewObjective, 'id' | 'createdAt' | 'updatedAt'>;

type ObjectiveFormGroupContent = {
  id: FormControl<ObjectiveFormRawValue['id'] | NewObjective['id']>;
  tenantId: FormControl<ObjectiveFormRawValue['tenantId']>;
  assignedToLogin: FormControl<ObjectiveFormRawValue['assignedToLogin']>;
  period: FormControl<ObjectiveFormRawValue['period']>;
  metricType: FormControl<ObjectiveFormRawValue['metricType']>;
  targetValue: FormControl<ObjectiveFormRawValue['targetValue']>;
  achievedValue: FormControl<ObjectiveFormRawValue['achievedValue']>;
  createdAt: FormControl<ObjectiveFormRawValue['createdAt']>;
  updatedAt: FormControl<ObjectiveFormRawValue['updatedAt']>;
};

export type ObjectiveFormGroup = FormGroup<ObjectiveFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ObjectiveFormService {
  createObjectiveFormGroup(objective: ObjectiveFormGroupInput = { id: null }): ObjectiveFormGroup {
    const objectiveRawValue = this.convertObjectiveToObjectiveRawValue({
      ...this.getFormDefaults(),
      ...objective,
    });
    return new FormGroup<ObjectiveFormGroupContent>({
      id: new FormControl(
        { value: objectiveRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(objectiveRawValue.tenantId, {
        validators: [Validators.required],
      }),
      assignedToLogin: new FormControl(objectiveRawValue.assignedToLogin, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      period: new FormControl(objectiveRawValue.period, {
        validators: [Validators.required, Validators.maxLength(7)],
      }),
      metricType: new FormControl(objectiveRawValue.metricType, {
        validators: [Validators.required],
      }),
      targetValue: new FormControl(objectiveRawValue.targetValue, {
        validators: [Validators.required, Validators.min(0)],
      }),
      achievedValue: new FormControl(objectiveRawValue.achievedValue, {
        validators: [Validators.min(0)],
      }),
      createdAt: new FormControl(objectiveRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(objectiveRawValue.updatedAt),
    });
  }

  getObjective(form: ObjectiveFormGroup): IObjective | NewObjective {
    return this.convertObjectiveRawValueToObjective(form.getRawValue() as ObjectiveFormRawValue | NewObjectiveFormRawValue);
  }

  resetForm(form: ObjectiveFormGroup, objective: ObjectiveFormGroupInput): void {
    const objectiveRawValue = this.convertObjectiveToObjectiveRawValue({ ...this.getFormDefaults(), ...objective });
    form.reset(
      {
        ...objectiveRawValue,
        id: { value: objectiveRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ObjectiveFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertObjectiveRawValueToObjective(rawObjective: ObjectiveFormRawValue | NewObjectiveFormRawValue): IObjective | NewObjective {
    return {
      ...rawObjective,
      createdAt: dayjs(rawObjective.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawObjective.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertObjectiveToObjectiveRawValue(
    objective: IObjective | (Partial<NewObjective> & ObjectiveFormDefaults)
  ): ObjectiveFormRawValue | PartialWithRequiredKeyOf<NewObjectiveFormRawValue> {
    return {
      ...objective,
      createdAt: objective.createdAt ? objective.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: objective.updatedAt ? objective.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
