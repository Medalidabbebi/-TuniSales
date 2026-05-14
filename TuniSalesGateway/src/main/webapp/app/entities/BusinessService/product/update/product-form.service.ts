import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IProduct, NewProduct } from '../product.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProduct for edit and NewProductFormGroupInput for create.
 */
type ProductFormGroupInput = IProduct | PartialWithRequiredKeyOf<NewProduct>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IProduct | NewProduct> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ProductFormRawValue = FormValueOf<IProduct>;

type NewProductFormRawValue = FormValueOf<NewProduct>;

type ProductFormDefaults = Pick<NewProduct, 'id' | 'isActive' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

type ProductFormGroupContent = {
  id: FormControl<ProductFormRawValue['id'] | NewProduct['id']>;
  tenantId: FormControl<ProductFormRawValue['tenantId']>;
  sku: FormControl<ProductFormRawValue['sku']>;
  name: FormControl<ProductFormRawValue['name']>;
  brand: FormControl<ProductFormRawValue['brand']>;
  category: FormControl<ProductFormRawValue['category']>;
  price: FormControl<ProductFormRawValue['price']>;
  taxRate: FormControl<ProductFormRawValue['taxRate']>;
  isActive: FormControl<ProductFormRawValue['isActive']>;
  isDeleted: FormControl<ProductFormRawValue['isDeleted']>;
  createdAt: FormControl<ProductFormRawValue['createdAt']>;
  updatedAt: FormControl<ProductFormRawValue['updatedAt']>;
};

export type ProductFormGroup = FormGroup<ProductFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  createProductFormGroup(product: ProductFormGroupInput = { id: null }): ProductFormGroup {
    const productRawValue = this.convertProductToProductRawValue({
      ...this.getFormDefaults(),
      ...product,
    });
    return new FormGroup<ProductFormGroupContent>({
      id: new FormControl(
        { value: productRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(productRawValue.tenantId, {
        validators: [Validators.required],
      }),
      sku: new FormControl(productRawValue.sku, {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      }),
      name: new FormControl(productRawValue.name, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      brand: new FormControl(productRawValue.brand, {
        validators: [Validators.maxLength(100)],
      }),
      category: new FormControl(productRawValue.category, {
        validators: [Validators.maxLength(100)],
      }),
      price: new FormControl(productRawValue.price, {
        validators: [Validators.required, Validators.min(0)],
      }),
      taxRate: new FormControl(productRawValue.taxRate, {
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
      }),
      isActive: new FormControl(productRawValue.isActive, {
        validators: [Validators.required],
      }),
      isDeleted: new FormControl(productRawValue.isDeleted, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(productRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(productRawValue.updatedAt),
    });
  }

  getProduct(form: ProductFormGroup): IProduct | NewProduct {
    return this.convertProductRawValueToProduct(form.getRawValue() as ProductFormRawValue | NewProductFormRawValue);
  }

  resetForm(form: ProductFormGroup, product: ProductFormGroupInput): void {
    const productRawValue = this.convertProductToProductRawValue({ ...this.getFormDefaults(), ...product });
    form.reset(
      {
        ...productRawValue,
        id: { value: productRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ProductFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isActive: false,
      isDeleted: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertProductRawValueToProduct(rawProduct: ProductFormRawValue | NewProductFormRawValue): IProduct | NewProduct {
    return {
      ...rawProduct,
      createdAt: dayjs(rawProduct.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawProduct.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertProductToProductRawValue(
    product: IProduct | (Partial<NewProduct> & ProductFormDefaults)
  ): ProductFormRawValue | PartialWithRequiredKeyOf<NewProductFormRawValue> {
    return {
      ...product,
      createdAt: product.createdAt ? product.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: product.updatedAt ? product.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
