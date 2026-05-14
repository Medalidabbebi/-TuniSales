import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IVisit, NewVisit } from '../visit.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVisit for edit and NewVisitFormGroupInput for create.
 */
type VisitFormGroupInput = IVisit | PartialWithRequiredKeyOf<NewVisit>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IVisit | NewVisit> = Omit<T, 'checkinAt' | 'checkoutAt' | 'createdAt'> & {
  checkinAt?: string | null;
  checkoutAt?: string | null;
  createdAt?: string | null;
};

type VisitFormRawValue = FormValueOf<IVisit>;

type NewVisitFormRawValue = FormValueOf<NewVisit>;

type VisitFormDefaults = Pick<NewVisit, 'id' | 'checkinAt' | 'checkoutAt' | 'createdAt'>;

type VisitFormGroupContent = {
  id: FormControl<VisitFormRawValue['id'] | NewVisit['id']>;
  visitOrder: FormControl<VisitFormRawValue['visitOrder']>;
  objective: FormControl<VisitFormRawValue['objective']>;
  status: FormControl<VisitFormRawValue['status']>;
  latitude: FormControl<VisitFormRawValue['latitude']>;
  longitude: FormControl<VisitFormRawValue['longitude']>;
  checkinAt: FormControl<VisitFormRawValue['checkinAt']>;
  checkoutAt: FormControl<VisitFormRawValue['checkoutAt']>;
  notes: FormControl<VisitFormRawValue['notes']>;
  createdAt: FormControl<VisitFormRawValue['createdAt']>;
  client: FormControl<VisitFormRawValue['client']>;
  mission: FormControl<VisitFormRawValue['mission']>;
};

export type VisitFormGroup = FormGroup<VisitFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VisitFormService {
  createVisitFormGroup(visit: VisitFormGroupInput = { id: null }): VisitFormGroup {
    const visitRawValue = this.convertVisitToVisitRawValue({
      ...this.getFormDefaults(),
      ...visit,
    });
    return new FormGroup<VisitFormGroupContent>({
      id: new FormControl(
        { value: visitRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      visitOrder: new FormControl(visitRawValue.visitOrder, {
        validators: [Validators.required, Validators.min(1)],
      }),
      objective: new FormControl(visitRawValue.objective, {
        validators: [Validators.required],
      }),
      status: new FormControl(visitRawValue.status, {
        validators: [Validators.required],
      }),
      latitude: new FormControl(visitRawValue.latitude),
      longitude: new FormControl(visitRawValue.longitude),
      checkinAt: new FormControl(visitRawValue.checkinAt),
      checkoutAt: new FormControl(visitRawValue.checkoutAt),
      notes: new FormControl(visitRawValue.notes, {
        validators: [Validators.maxLength(2000)],
      }),
      createdAt: new FormControl(visitRawValue.createdAt, {
        validators: [Validators.required],
      }),
      client: new FormControl(visitRawValue.client, {
        validators: [Validators.required],
      }),
      mission: new FormControl(visitRawValue.mission, {
        validators: [Validators.required],
      }),
    });
  }

  getVisit(form: VisitFormGroup): IVisit | NewVisit {
    return this.convertVisitRawValueToVisit(form.getRawValue() as VisitFormRawValue | NewVisitFormRawValue);
  }

  resetForm(form: VisitFormGroup, visit: VisitFormGroupInput): void {
    const visitRawValue = this.convertVisitToVisitRawValue({ ...this.getFormDefaults(), ...visit });
    form.reset(
      {
        ...visitRawValue,
        id: { value: visitRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): VisitFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      checkinAt: currentTime,
      checkoutAt: currentTime,
      createdAt: currentTime,
    };
  }

  private convertVisitRawValueToVisit(rawVisit: VisitFormRawValue | NewVisitFormRawValue): IVisit | NewVisit {
    return {
      ...rawVisit,
      checkinAt: dayjs(rawVisit.checkinAt, DATE_TIME_FORMAT),
      checkoutAt: dayjs(rawVisit.checkoutAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawVisit.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertVisitToVisitRawValue(
    visit: IVisit | (Partial<NewVisit> & VisitFormDefaults)
  ): VisitFormRawValue | PartialWithRequiredKeyOf<NewVisitFormRawValue> {
    return {
      ...visit,
      checkinAt: visit.checkinAt ? visit.checkinAt.format(DATE_TIME_FORMAT) : undefined,
      checkoutAt: visit.checkoutAt ? visit.checkoutAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: visit.createdAt ? visit.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
