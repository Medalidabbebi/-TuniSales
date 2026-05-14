import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IWarehouse, NewWarehouse } from '../warehouse.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IWarehouse for edit and NewWarehouseFormGroupInput for create.
 */
type WarehouseFormGroupInput = IWarehouse | PartialWithRequiredKeyOf<NewWarehouse>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IWarehouse | NewWarehouse> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type WarehouseFormRawValue = FormValueOf<IWarehouse>;

type NewWarehouseFormRawValue = FormValueOf<NewWarehouse>;

type WarehouseFormDefaults = Pick<NewWarehouse, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;

type WarehouseFormGroupContent = {
  id: FormControl<WarehouseFormRawValue['id'] | NewWarehouse['id']>;
  tenantId: FormControl<WarehouseFormRawValue['tenantId']>;
  name: FormControl<WarehouseFormRawValue['name']>;
  type: FormControl<WarehouseFormRawValue['type']>;
  address: FormControl<WarehouseFormRawValue['address']>;
  city: FormControl<WarehouseFormRawValue['city']>;
  minThreshold: FormControl<WarehouseFormRawValue['minThreshold']>;
  isActive: FormControl<WarehouseFormRawValue['isActive']>;
  createdAt: FormControl<WarehouseFormRawValue['createdAt']>;
  updatedAt: FormControl<WarehouseFormRawValue['updatedAt']>;
};

export type WarehouseFormGroup = FormGroup<WarehouseFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WarehouseFormService {
  createWarehouseFormGroup(warehouse: WarehouseFormGroupInput = { id: null }): WarehouseFormGroup {
    const warehouseRawValue = this.convertWarehouseToWarehouseRawValue({
      ...this.getFormDefaults(),
      ...warehouse,
    });
    return new FormGroup<WarehouseFormGroupContent>({
      id: new FormControl(
        { value: warehouseRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(warehouseRawValue.tenantId, {
        validators: [Validators.required],
      }),
      name: new FormControl(warehouseRawValue.name, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      type: new FormControl(warehouseRawValue.type, {
        validators: [Validators.required],
      }),
      address: new FormControl(warehouseRawValue.address, {
        validators: [Validators.maxLength(500)],
      }),
      city: new FormControl(warehouseRawValue.city, {
        validators: [Validators.maxLength(100)],
      }),
      minThreshold: new FormControl(warehouseRawValue.minThreshold, {
        validators: [Validators.min(0)],
      }),
      isActive: new FormControl(warehouseRawValue.isActive, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(warehouseRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(warehouseRawValue.updatedAt),
    });
  }

  getWarehouse(form: WarehouseFormGroup): IWarehouse | NewWarehouse {
    return this.convertWarehouseRawValueToWarehouse(form.getRawValue() as WarehouseFormRawValue | NewWarehouseFormRawValue);
  }

  resetForm(form: WarehouseFormGroup, warehouse: WarehouseFormGroupInput): void {
    const warehouseRawValue = this.convertWarehouseToWarehouseRawValue({ ...this.getFormDefaults(), ...warehouse });
    form.reset(
      {
        ...warehouseRawValue,
        id: { value: warehouseRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): WarehouseFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isActive: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertWarehouseRawValueToWarehouse(rawWarehouse: WarehouseFormRawValue | NewWarehouseFormRawValue): IWarehouse | NewWarehouse {
    return {
      ...rawWarehouse,
      createdAt: dayjs(rawWarehouse.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawWarehouse.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertWarehouseToWarehouseRawValue(
    warehouse: IWarehouse | (Partial<NewWarehouse> & WarehouseFormDefaults)
  ): WarehouseFormRawValue | PartialWithRequiredKeyOf<NewWarehouseFormRawValue> {
    return {
      ...warehouse,
      createdAt: warehouse.createdAt ? warehouse.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: warehouse.updatedAt ? warehouse.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
