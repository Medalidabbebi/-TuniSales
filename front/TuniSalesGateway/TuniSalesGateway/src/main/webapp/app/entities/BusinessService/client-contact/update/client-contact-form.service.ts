import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IClientContact, NewClientContact } from '../client-contact.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClientContact for edit and NewClientContactFormGroupInput for create.
 */
type ClientContactFormGroupInput = IClientContact | PartialWithRequiredKeyOf<NewClientContact>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IClientContact | NewClientContact> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type ClientContactFormRawValue = FormValueOf<IClientContact>;

type NewClientContactFormRawValue = FormValueOf<NewClientContact>;

type ClientContactFormDefaults = Pick<NewClientContact, 'id' | 'isPrimary' | 'createdAt'>;

type ClientContactFormGroupContent = {
  id: FormControl<ClientContactFormRawValue['id'] | NewClientContact['id']>;
  fullName: FormControl<ClientContactFormRawValue['fullName']>;
  email: FormControl<ClientContactFormRawValue['email']>;
  phone: FormControl<ClientContactFormRawValue['phone']>;
  role: FormControl<ClientContactFormRawValue['role']>;
  isPrimary: FormControl<ClientContactFormRawValue['isPrimary']>;
  createdAt: FormControl<ClientContactFormRawValue['createdAt']>;
  client: FormControl<ClientContactFormRawValue['client']>;
};

export type ClientContactFormGroup = FormGroup<ClientContactFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClientContactFormService {
  createClientContactFormGroup(clientContact: ClientContactFormGroupInput = { id: null }): ClientContactFormGroup {
    const clientContactRawValue = this.convertClientContactToClientContactRawValue({
      ...this.getFormDefaults(),
      ...clientContact,
    });
    return new FormGroup<ClientContactFormGroupContent>({
      id: new FormControl(
        { value: clientContactRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      fullName: new FormControl(clientContactRawValue.fullName, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      email: new FormControl(clientContactRawValue.email, {
        validators: [Validators.maxLength(255)],
      }),
      phone: new FormControl(clientContactRawValue.phone, {
        validators: [Validators.maxLength(30)],
      }),
      role: new FormControl(clientContactRawValue.role),
      isPrimary: new FormControl(clientContactRawValue.isPrimary, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(clientContactRawValue.createdAt, {
        validators: [Validators.required],
      }),
      client: new FormControl(clientContactRawValue.client, {
        validators: [Validators.required],
      }),
    });
  }

  getClientContact(form: ClientContactFormGroup): IClientContact | NewClientContact {
    return this.convertClientContactRawValueToClientContact(form.getRawValue() as ClientContactFormRawValue | NewClientContactFormRawValue);
  }

  resetForm(form: ClientContactFormGroup, clientContact: ClientContactFormGroupInput): void {
    const clientContactRawValue = this.convertClientContactToClientContactRawValue({ ...this.getFormDefaults(), ...clientContact });
    form.reset(
      {
        ...clientContactRawValue,
        id: { value: clientContactRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ClientContactFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isPrimary: false,
      createdAt: currentTime,
    };
  }

  private convertClientContactRawValueToClientContact(
    rawClientContact: ClientContactFormRawValue | NewClientContactFormRawValue
  ): IClientContact | NewClientContact {
    return {
      ...rawClientContact,
      createdAt: dayjs(rawClientContact.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertClientContactToClientContactRawValue(
    clientContact: IClientContact | (Partial<NewClientContact> & ClientContactFormDefaults)
  ): ClientContactFormRawValue | PartialWithRequiredKeyOf<NewClientContactFormRawValue> {
    return {
      ...clientContact,
      createdAt: clientContact.createdAt ? clientContact.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
