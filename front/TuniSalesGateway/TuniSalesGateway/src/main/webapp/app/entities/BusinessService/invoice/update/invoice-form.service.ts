import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IInvoice, NewInvoice } from '../invoice.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IInvoice for edit and NewInvoiceFormGroupInput for create.
 */
type InvoiceFormGroupInput = IInvoice | PartialWithRequiredKeyOf<NewInvoice>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IInvoice | NewInvoice> = Omit<T, 'issueDate' | 'dueDate' | 'paidAt' | 'createdAt' | 'updatedAt'> & {
  issueDate?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type InvoiceFormRawValue = FormValueOf<IInvoice>;

type NewInvoiceFormRawValue = FormValueOf<NewInvoice>;

type InvoiceFormDefaults = Pick<NewInvoice, 'id' | 'issueDate' | 'dueDate' | 'paidAt' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

type InvoiceFormGroupContent = {
  id: FormControl<InvoiceFormRawValue['id'] | NewInvoice['id']>;
  tenantId: FormControl<InvoiceFormRawValue['tenantId']>;
  invoiceNumber: FormControl<InvoiceFormRawValue['invoiceNumber']>;
  amountHt: FormControl<InvoiceFormRawValue['amountHt']>;
  taxAmount: FormControl<InvoiceFormRawValue['taxAmount']>;
  amountTtc: FormControl<InvoiceFormRawValue['amountTtc']>;
  status: FormControl<InvoiceFormRawValue['status']>;
  issueDate: FormControl<InvoiceFormRawValue['issueDate']>;
  dueDate: FormControl<InvoiceFormRawValue['dueDate']>;
  paidAt: FormControl<InvoiceFormRawValue['paidAt']>;
  isDeleted: FormControl<InvoiceFormRawValue['isDeleted']>;
  createdAt: FormControl<InvoiceFormRawValue['createdAt']>;
  updatedAt: FormControl<InvoiceFormRawValue['updatedAt']>;
  client: FormControl<InvoiceFormRawValue['client']>;
  order: FormControl<InvoiceFormRawValue['order']>;
};

export type InvoiceFormGroup = FormGroup<InvoiceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class InvoiceFormService {
  createInvoiceFormGroup(invoice: InvoiceFormGroupInput = { id: null }): InvoiceFormGroup {
    const invoiceRawValue = this.convertInvoiceToInvoiceRawValue({
      ...this.getFormDefaults(),
      ...invoice,
    });
    return new FormGroup<InvoiceFormGroupContent>({
      id: new FormControl(
        { value: invoiceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tenantId: new FormControl(invoiceRawValue.tenantId, {
        validators: [Validators.required],
      }),
      invoiceNumber: new FormControl(invoiceRawValue.invoiceNumber, {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(50)],
      }),
      amountHt: new FormControl(invoiceRawValue.amountHt, {
        validators: [Validators.required, Validators.min(0)],
      }),
      taxAmount: new FormControl(invoiceRawValue.taxAmount, {
        validators: [Validators.required, Validators.min(0)],
      }),
      amountTtc: new FormControl(invoiceRawValue.amountTtc, {
        validators: [Validators.required, Validators.min(0)],
      }),
      status: new FormControl(invoiceRawValue.status, {
        validators: [Validators.required],
      }),
      issueDate: new FormControl(invoiceRawValue.issueDate, {
        validators: [Validators.required],
      }),
      dueDate: new FormControl(invoiceRawValue.dueDate, {
        validators: [Validators.required],
      }),
      paidAt: new FormControl(invoiceRawValue.paidAt),
      isDeleted: new FormControl(invoiceRawValue.isDeleted, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(invoiceRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(invoiceRawValue.updatedAt),
      client: new FormControl(invoiceRawValue.client, {
        validators: [Validators.required],
      }),
      order: new FormControl(invoiceRawValue.order, {
        validators: [Validators.required],
      }),
    });
  }

  getInvoice(form: InvoiceFormGroup): IInvoice | NewInvoice {
    return this.convertInvoiceRawValueToInvoice(form.getRawValue() as InvoiceFormRawValue | NewInvoiceFormRawValue);
  }

  resetForm(form: InvoiceFormGroup, invoice: InvoiceFormGroupInput): void {
    const invoiceRawValue = this.convertInvoiceToInvoiceRawValue({ ...this.getFormDefaults(), ...invoice });
    form.reset(
      {
        ...invoiceRawValue,
        id: { value: invoiceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): InvoiceFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      issueDate: currentTime,
      dueDate: currentTime,
      paidAt: currentTime,
      isDeleted: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertInvoiceRawValueToInvoice(rawInvoice: InvoiceFormRawValue | NewInvoiceFormRawValue): IInvoice | NewInvoice {
    return {
      ...rawInvoice,
      issueDate: dayjs(rawInvoice.issueDate, DATE_TIME_FORMAT),
      dueDate: dayjs(rawInvoice.dueDate, DATE_TIME_FORMAT),
      paidAt: dayjs(rawInvoice.paidAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawInvoice.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawInvoice.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertInvoiceToInvoiceRawValue(
    invoice: IInvoice | (Partial<NewInvoice> & InvoiceFormDefaults)
  ): InvoiceFormRawValue | PartialWithRequiredKeyOf<NewInvoiceFormRawValue> {
    return {
      ...invoice,
      issueDate: invoice.issueDate ? invoice.issueDate.format(DATE_TIME_FORMAT) : undefined,
      dueDate: invoice.dueDate ? invoice.dueDate.format(DATE_TIME_FORMAT) : undefined,
      paidAt: invoice.paidAt ? invoice.paidAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: invoice.createdAt ? invoice.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: invoice.updatedAt ? invoice.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
