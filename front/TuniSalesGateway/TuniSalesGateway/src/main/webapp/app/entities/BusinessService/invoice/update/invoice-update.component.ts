import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { InvoiceFormService, InvoiceFormGroup } from './invoice-form.service';
import { IInvoice } from '../invoice.model';
import { InvoiceService } from '../service/invoice.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';
import { ITenant } from 'app/entities/PlatformService/tenant/tenant.model';
import { TenantService } from 'app/entities/PlatformService/tenant/service/tenant.service';

@Component({
  selector: 'jhi-invoice-update',
  templateUrl: './invoice-update.component.html',
  styleUrls: ['./invoice-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InvoiceUpdateComponent implements OnInit {
  isSaving = false;
  invoice: IInvoice | null = null;
  invoiceStatusValues = Object.keys(InvoiceStatus);

  clientsSharedCollection: IClient[] = [];
  ordersSharedCollection: IOrder[] = [];
  tenantsCollection: ITenant[] = [];

  editForm: InvoiceFormGroup = this.invoiceFormService.createInvoiceFormGroup();

  /** Non-null when navigated from order detail "Facturer" button */
  fromOrderData: {
    orderId: number | null;
    clientId: number | null;
    amountHt: number;
    taxAmount: number;
    amountTtc: number;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
  } | null = null;

  constructor(
    protected invoiceService: InvoiceService,
    protected invoiceFormService: InvoiceFormService,
    protected clientService: ClientService,
    protected orderService: OrderService,
    protected tenantService: TenantService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  /** Returns the iu-status--* CSS class for the given InvoiceStatus */
  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'iu-status--draft',
      ISSUED:         'iu-status--issued',
      PARTIALLY_PAID: 'iu-status--partially-paid',
      PAID:           'iu-status--paid',
      OVERDUE:        'iu-status--overdue',
      CANCELLED:      'iu-status--cancelled',
    };
    return map[status ?? ''] || 'iu-status--draft';
  }

  /** Returns the French label for an InvoiceStatus */
  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'Brouillon',
      ISSUED:         'Émise',
      PARTIALLY_PAID: 'Partiellement payée',
      PAID:           'Payée',
      OVERDUE:        'En retard',
      CANCELLED:      'Annulée',
    };
    return map[status ?? ''] || 'Inconnu';
  }

  ngOnInit(): void {
    // Detect pre-fill from order detail
    const qp = this.activatedRoute.snapshot.queryParamMap;
    if (qp.get('fromOrder') === 'true') {
      this.fromOrderData = {
        orderId:       qp.get('orderId')       ? +qp.get('orderId')!       : null,
        clientId:      qp.get('clientId')      ? +qp.get('clientId')!      : null,
        amountHt:      qp.get('amountHt')      ? +qp.get('amountHt')!      : 0,
        taxAmount:     qp.get('taxAmount')     ? +qp.get('taxAmount')!     : 0,
        amountTtc:     qp.get('amountTtc')     ? +qp.get('amountTtc')!     : 0,
        invoiceNumber: qp.get('invoiceNumber') ?? '',
        issueDate:     qp.get('issueDate')     ?? dayjs().format('YYYY-MM-DDTHH:mm'),
        dueDate:       qp.get('dueDate')       ?? dayjs().add(30, 'day').format('YYYY-MM-DDTHH:mm'),
      };
      // Pre-fill scalar fields immediately
      this.editForm.patchValue({
        invoiceNumber: this.fromOrderData.invoiceNumber,
        amountHt:      this.fromOrderData.amountHt,
        taxAmount:     this.fromOrderData.taxAmount,
        amountTtc:     this.fromOrderData.amountTtc,
        status:        InvoiceStatus.ISSUED,
        issueDate:     this.fromOrderData.issueDate,
        dueDate:       this.fromOrderData.dueDate,
      });
    }

    this.activatedRoute.data.subscribe(({ invoice }) => {
      this.invoice = invoice;
      if (invoice) {
        this.updateForm(invoice);
      }
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const invoice = this.invoiceFormService.getInvoice(this.editForm);
    if (invoice.id !== null) {
      this.subscribeToSaveResponse(this.invoiceService.update(invoice));
    } else {
      this.subscribeToSaveResponse(this.invoiceService.create(invoice));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IInvoice>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(invoice: IInvoice): void {
    this.invoice = invoice;
    this.invoiceFormService.resetForm(this.editForm, invoice);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, invoice.client);
    this.ordersSharedCollection = this.orderService.addOrderToCollectionIfMissing<IOrder>(this.ordersSharedCollection, invoice.order);
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.invoice?.client)))
      .subscribe((clients: IClient[]) => {
        this.clientsSharedCollection = clients;
        // Auto-select client when coming from order
        if (this.fromOrderData?.clientId) {
          const match = clients.find(c => c.id === this.fromOrderData!.clientId);
          if (match) this.editForm.patchValue({ client: match });
        }
      });

    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.invoice?.order)))
      .subscribe((orders: IOrder[]) => {
        this.ordersSharedCollection = orders;
        // Auto-select order when coming from order detail
        if (this.fromOrderData?.orderId) {
          const match = orders.find(o => o.id === this.fromOrderData!.orderId);
          if (match) this.editForm.patchValue({ order: match });
        }
      });

    this.tenantService
      .queryAll()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .subscribe((tenants: ITenant[]) => {
        this.tenantsCollection = tenants;
        // Auto-select first (and usually only) tenant when coming from order
        if (this.fromOrderData && tenants.length === 1) {
          this.editForm.patchValue({ tenantId: tenants[0].id });
        }
      });
  }
}
