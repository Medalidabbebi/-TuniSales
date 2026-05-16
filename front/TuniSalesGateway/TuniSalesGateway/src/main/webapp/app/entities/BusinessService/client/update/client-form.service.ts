import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IClient, NewClient } from '../client.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClient for edit and NewClientFormGroupInput for create.
 */
type ClientFormGroupInput = IClient | PartialWithRequiredKeyOf<NewClient>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IClient | NewClient> = Omit<T, 'lastOrderAt' | 'createdAt' | 'updatedAt'> & {
  lastOrderAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ClientFormRawValue = FormValueOf<IClient>;

type NewClientFormRawValue = FormValueOf<NewClient>;

type ClientFormDefaults = Pick<NewClient, 'id' | 'lastOrderAt' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

type ClientFormGroupContent = {
  id: FormControl<ClientFormRawValue['id'] | NewClient['id']>;
  tenantId: FormControl<ClientFormRawValue['tenantId']>;
  name: FormControl<ClientFormRawValue['name']>;
  taxId: FormControl<ClientFormRawValue['taxId']>;
  clientType: FormControl<ClientFormRawValue['clientType']>;
  creditLimit: FormControl<ClientFormRawValue['creditLimit']>;
  creditUsed: FormControl<ClientFormRawValue['creditUsed']>;
  paymentTermsDays: FormControl<ClientFormRawValue['paymentTermsDays']>;
  status: FormControl<ClientFormRawValue['status']>;
  lastOrderAt: FormControl<ClientFormRawValue['lastOrderAt']>;
  isDeleted: FormControl<ClientFormRawValue['isDeleted']>;
  createdAt: FormControl<ClientFormRawValue['createdAt']>;
  updatedAt: FormControl<ClientFormRawValue['updatedAt']>;
};

export type ClientFormGroup = FormGroup<ClientFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClientFormService {
  createClientFormGroup(client: ClientFormGroupInput = { id: null }): ClientFormGroup {
    const clientRawValue = this.convertClientToClientRawValue({
      ...this.getFormDefaults(),
      ...client,
    });
    return new FormGroup<ClientFormGroupContent>({
      id: new FormControl(
        { value: clientRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(clientRawValue.tenantId, {
        validators: [Validators.required],
      }),
      name: new FormControl(clientRawValue.name, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      taxId: new FormControl(clientRawValue.taxId, {
        validators: [Validators.maxLength(50)],
      }),
      clientType: new FormControl(clientRawValue.clientType, {
        validators: [Validators.required],
      }),
      creditLimit: new FormControl(clientRawValue.creditLimit, {
        validators: [Validators.min(0)],
      }),
      creditUsed: new FormControl(clientRawValue.creditUsed, {
        validators: [Validators.min(0)],
      }),
      paymentTermsDays: new FormControl(clientRawValue.paymentTermsDays, {
        validators: [Validators.min(0)],
      }),
      status: new FormControl(clientRawValue.status, {
        validators: [Validators.required],
      }),
      lastOrderAt: new FormControl(clientRawValue.lastOrderAt),
      isDeleted: new FormControl(clientRawValue.isDeleted, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(clientRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(clientRawValue.updatedAt),
    });
  }

  getClient(form: ClientFormGroup): IClient | NewClient {
    return this.convertClientRawValueToClient(form.getRawValue() as ClientFormRawValue | NewClientFormRawValue);
  }

  resetForm(form: ClientFormGroup, client: ClientFormGroupInput): void {
    const clientRawValue = this.convertClientToClientRawValue({ ...this.getFormDefaults(), ...client });
    form.reset(
      {
        ...clientRawValue,
        id: { value: clientRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ClientFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lastOrderAt: currentTime,
      isDeleted: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertClientRawValueToClient(rawClient: ClientFormRawValue | NewClientFormRawValue): IClient | NewClient {
    return {
      ...rawClient,
      lastOrderAt: dayjs(rawClient.lastOrderAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawClient.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawClient.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertClientToClientRawValue(
    client: IClient | (Partial<NewClient> & ClientFormDefaults)
  ): ClientFormRawValue | PartialWithRequiredKeyOf<NewClientFormRawValue> {
    return {
      ...client,
      lastOrderAt: client.lastOrderAt ? client.lastOrderAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: client.createdAt ? client.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: client.updatedAt ? client.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
