import dayjs from 'dayjs/esm';

import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';

import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 91509,
  tenantId: 62071,
  invoiceNumber: 'Rustic content',
  amountHt: 48480,
  taxAmount: 49437,
  amountTtc: 45303,
  status: InvoiceStatus['DRAFT'],
  issueDate: dayjs('2026-03-09T03:17'),
  dueDate: dayjs('2026-03-09T08:49'),
  isDeleted: true,
  createdAt: dayjs('2026-03-08T23:41'),
};

export const sampleWithPartialData: IInvoice = {
  id: 89149,
  tenantId: 58319,
  invoiceNumber: 'users',
  amountHt: 35028,
  taxAmount: 55119,
  amountTtc: 89329,
  status: InvoiceStatus['PARTIALLY_PAID'],
  issueDate: dayjs('2026-03-09T09:39'),
  dueDate: dayjs('2026-03-08T17:54'),
  paidAt: dayjs('2026-03-09T04:21'),
  isDeleted: true,
  createdAt: dayjs('2026-03-09T09:12'),
  updatedAt: dayjs('2026-03-09T03:09'),
};

export const sampleWithFullData: IInvoice = {
  id: 17005,
  tenantId: 69991,
  invoiceNumber: 'Rubber',
  amountHt: 75162,
  taxAmount: 35861,
  amountTtc: 91014,
  status: InvoiceStatus['CANCELLED'],
  issueDate: dayjs('2026-03-08T20:50'),
  dueDate: dayjs('2026-03-08T18:05'),
  paidAt: dayjs('2026-03-09T14:13'),
  isDeleted: false,
  createdAt: dayjs('2026-03-09T13:52'),
  updatedAt: dayjs('2026-03-09T04:31'),
};

export const sampleWithNewData: NewInvoice = {
  tenantId: 39937,
  invoiceNumber: 'Cheese Bedfordshire online',
  amountHt: 73083,
  taxAmount: 76587,
  amountTtc: 49039,
  status: InvoiceStatus['PAID'],
  issueDate: dayjs('2026-03-08T20:57'),
  dueDate: dayjs('2026-03-09T10:01'),
  isDeleted: true,
  createdAt: dayjs('2026-03-09T02:26'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
