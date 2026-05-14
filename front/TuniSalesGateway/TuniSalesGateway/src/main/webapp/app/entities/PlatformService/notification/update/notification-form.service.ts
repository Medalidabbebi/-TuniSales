import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { INotification, NewNotification } from '../notification.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts INotification for edit and NewNotificationFormGroupInput for create.
 */
type NotificationFormGroupInput = INotification | PartialWithRequiredKeyOf<NewNotification>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends INotification | NewNotification> = Omit<T, 'readAt' | 'createdAt'> & {
  readAt?: string | null;
  createdAt?: string | null;
};

type NotificationFormRawValue = FormValueOf<INotification>;

type NewNotificationFormRawValue = FormValueOf<NewNotification>;

type NotificationFormDefaults = Pick<NewNotification, 'id' | 'isRead' | 'readAt' | 'createdAt'>;

type NotificationFormGroupContent = {
  id: FormControl<NotificationFormRawValue['id'] | NewNotification['id']>;
  tenantId: FormControl<NotificationFormRawValue['tenantId']>;
  recipientLogin: FormControl<NotificationFormRawValue['recipientLogin']>;
  type: FormControl<NotificationFormRawValue['type']>;
  title: FormControl<NotificationFormRawValue['title']>;
  body: FormControl<NotificationFormRawValue['body']>;
  payloadJson: FormControl<NotificationFormRawValue['payloadJson']>;
  isRead: FormControl<NotificationFormRawValue['isRead']>;
  readAt: FormControl<NotificationFormRawValue['readAt']>;
  createdAt: FormControl<NotificationFormRawValue['createdAt']>;
};

export type NotificationFormGroup = FormGroup<NotificationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class NotificationFormService {
  createNotificationFormGroup(notification: NotificationFormGroupInput = { id: null }): NotificationFormGroup {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({
      ...this.getFormDefaults(),
      ...notification,
    });
    return new FormGroup<NotificationFormGroupContent>({
      id: new FormControl(
        { value: notificationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(notificationRawValue.tenantId, {
        validators: [Validators.required],
      }),
      recipientLogin: new FormControl(notificationRawValue.recipientLogin, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      type: new FormControl(notificationRawValue.type, {
        validators: [Validators.required],
      }),
      title: new FormControl(notificationRawValue.title, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      body: new FormControl(notificationRawValue.body, {
        validators: [Validators.maxLength(2000)],
      }),
      payloadJson: new FormControl(notificationRawValue.payloadJson),
      isRead: new FormControl(notificationRawValue.isRead, {
        validators: [Validators.required],
      }),
      readAt: new FormControl(notificationRawValue.readAt),
      createdAt: new FormControl(notificationRawValue.createdAt, {
        validators: [Validators.required],
      }),
    });
  }

  getNotification(form: NotificationFormGroup): INotification | NewNotification {
    return this.convertNotificationRawValueToNotification(form.getRawValue() as NotificationFormRawValue | NewNotificationFormRawValue);
  }

  resetForm(form: NotificationFormGroup, notification: NotificationFormGroupInput): void {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({ ...this.getFormDefaults(), ...notification });
    form.reset(
      {
        ...notificationRawValue,
        id: { value: notificationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): NotificationFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isRead: false,
      readAt: currentTime,
      createdAt: currentTime,
    };
  }

  private convertNotificationRawValueToNotification(
    rawNotification: NotificationFormRawValue | NewNotificationFormRawValue
  ): INotification | NewNotification {
    return {
      ...rawNotification,
      readAt: dayjs(rawNotification.readAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawNotification.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertNotificationToNotificationRawValue(
    notification: INotification | (Partial<NewNotification> & NotificationFormDefaults)
  ): NotificationFormRawValue | PartialWithRequiredKeyOf<NewNotificationFormRawValue> {
    return {
      ...notification,
      readAt: notification.readAt ? notification.readAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: notification.createdAt ? notification.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
