import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMission, NewMission } from '../mission.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMission for edit and NewMissionFormGroupInput for create.
 */
type MissionFormGroupInput = IMission | PartialWithRequiredKeyOf<NewMission>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IMission | NewMission> = Omit<T, 'missionDate' | 'createdAt' | 'updatedAt'> & {
  missionDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MissionFormRawValue = FormValueOf<IMission>;

type NewMissionFormRawValue = FormValueOf<NewMission>;

type MissionFormDefaults = Pick<NewMission, 'id' | 'missionDate' | 'createdAt' | 'updatedAt'>;

type MissionFormGroupContent = {
  id: FormControl<MissionFormRawValue['id'] | NewMission['id']>;
  tenantId: FormControl<MissionFormRawValue['tenantId']>;
  assignedToLogin: FormControl<MissionFormRawValue['assignedToLogin']>;
  title: FormControl<MissionFormRawValue['title']>;
  description: FormControl<MissionFormRawValue['description']>;
  missionDate: FormControl<MissionFormRawValue['missionDate']>;
  status: FormControl<MissionFormRawValue['status']>;
  createdAt: FormControl<MissionFormRawValue['createdAt']>;
  updatedAt: FormControl<MissionFormRawValue['updatedAt']>;
};

export type MissionFormGroup = FormGroup<MissionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MissionFormService {
  createMissionFormGroup(mission: MissionFormGroupInput = { id: null }): MissionFormGroup {
    const missionRawValue = this.convertMissionToMissionRawValue({
      ...this.getFormDefaults(),
      ...mission,
    });
    return new FormGroup<MissionFormGroupContent>({
      id: new FormControl(
        { value: missionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(missionRawValue.tenantId, {
        validators: [Validators.required],
      }),
      assignedToLogin: new FormControl(missionRawValue.assignedToLogin, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      title: new FormControl(missionRawValue.title, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      description: new FormControl(missionRawValue.description, {
        validators: [Validators.maxLength(2000)],
      }),
      missionDate: new FormControl(missionRawValue.missionDate, {
        validators: [Validators.required],
      }),
      status: new FormControl(missionRawValue.status, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(missionRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(missionRawValue.updatedAt),
    });
  }

  getMission(form: MissionFormGroup): IMission | NewMission {
    return this.convertMissionRawValueToMission(form.getRawValue() as MissionFormRawValue | NewMissionFormRawValue);
  }

  resetForm(form: MissionFormGroup, mission: MissionFormGroupInput): void {
    const missionRawValue = this.convertMissionToMissionRawValue({ ...this.getFormDefaults(), ...mission });
    form.reset(
      {
        ...missionRawValue,
        id: { value: missionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): MissionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      missionDate: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertMissionRawValueToMission(rawMission: MissionFormRawValue | NewMissionFormRawValue): IMission | NewMission {
    return {
      ...rawMission,
      missionDate: dayjs(rawMission.missionDate, DATE_TIME_FORMAT),
      createdAt: dayjs(rawMission.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawMission.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertMissionToMissionRawValue(
    mission: IMission | (Partial<NewMission> & MissionFormDefaults)
  ): MissionFormRawValue | PartialWithRequiredKeyOf<NewMissionFormRawValue> {
    return {
      ...mission,
      missionDate: mission.missionDate ? mission.missionDate.format(DATE_TIME_FORMAT) : undefined,
      createdAt: mission.createdAt ? mission.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: mission.updatedAt ? mission.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
