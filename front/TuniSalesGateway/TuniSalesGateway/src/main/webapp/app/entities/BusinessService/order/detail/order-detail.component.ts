import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import dayjs from 'dayjs/esm';

import { IOrder } from '../order.model';
import { IOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { OrderService } from '../service/order.service';
import { OrderLineService } from 'app/entities/BusinessService/order-line/service/order-line.service';
import { InvoiceService } from 'app/entities/BusinessService/invoice/service/invoice.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderDetailComponent implements OnInit {
  order: IOrder | null = null;
  orderLines: IOrderLine[] = [];
  isActionLoading = false;
  isLoadingLines = false;
  createdInvoice: IInvoice | null = null;
  invoiceError: string | null = null;

  pipelineSteps = [
    { key: OrderStatus.DRAFT,          label: 'Brouillon' },
    { key: OrderStatus.SUBMITTED,      label: 'Soumis' },
    { key: OrderStatus.UNDER_REVIEW,   label: 'En révision' },
    { key: OrderStatus.APPROVED,       label: 'Approuvé' },
    { key: OrderStatus.IN_PREPARATION, label: 'Préparation' },
    { key: OrderStatus.SHIPPED,        label: 'Expédié' },
    { key: OrderStatus.DELIVERED,      label: 'Livré' },
    { key: OrderStatus.INVOICED,       label: 'Facturé' },
    { key: OrderStatus.PAID,           label: 'Payé' },
  ];

  private nextStatus: Record<string, string> = {
    [OrderStatus.SUBMITTED]:      OrderStatus.UNDER_REVIEW,
    [OrderStatus.UNDER_REVIEW]:   OrderStatus.APPROVED,
    [OrderStatus.APPROVED]:       OrderStatus.IN_PREPARATION,
    [OrderStatus.IN_PREPARATION]: OrderStatus.SHIPPED,
    [OrderStatus.SHIPPED]:        OrderStatus.DELIVERED,
    [OrderStatus.DELIVERED]:      OrderStatus.INVOICED,
    [OrderStatus.INVOICED]:       OrderStatus.PAID,
  };

  private advanceLabel: Record<string, string> = {
    [OrderStatus.SUBMITTED]:      'Mettre en révision',
    [OrderStatus.UNDER_REVIEW]:   'Approuver',
    [OrderStatus.APPROVED]:       'Lancer préparation',
    [OrderStatus.IN_PREPARATION]: 'Expédier',
    [OrderStatus.SHIPPED]:        'Marquer livré',
    [OrderStatus.DELIVERED]:      'Facturer',
    [OrderStatus.INVOICED]:       'Marquer payé',
  };

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected orderService: OrderService,
    protected orderLineService: OrderLineService,
    protected invoiceService: InvoiceService,
    protected accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ order }) => {
      this.order = order;
      if (order?.id) {
        this.loadOrderLines(order.id);
      }
    });
  }

  private loadOrderLines(orderId: number): void {
    this.isLoadingLines = true;
    this.orderLineService.query({ 'orderId.equals': orderId, size: 200 }).subscribe({
      next: res => { this.orderLines = res.body ?? []; this.isLoadingLines = false; },
      error: () => { this.isLoadingLines = false; },
    });
  }

  previousState(): void {
    window.history.back();
  }

  isAdmin(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_ADMIN_COMMERCIAL']);
  }

  getNextStatus(): string | null {
    return this.nextStatus[this.order?.status || ''] ?? null;
  }

  getAdvanceLabel(): string {
    return this.advanceLabel[this.order?.status || ''] ?? 'Avancer';
  }

  canAdvance(): boolean {
    return this.isAdmin() && !!this.getNextStatus() && !this.isTerminalStatus();
  }

  canCancel(): boolean {
    return this.isAdmin() && !this.isTerminalStatus() && this.order?.status !== OrderStatus.PAID;
  }

  advance(): void {
    const next = this.getNextStatus();
    if (!this.order?.id || !next) return;
    this.isActionLoading = true;
    this.createdInvoice = null;
    this.invoiceError = null;

    this.orderService.validate(this.order.id, next).pipe(
      switchMap(res => {
        this.order = res.body;
        // Auto-create invoice when order reaches INVOICED status
        if (res.body?.status === OrderStatus.INVOICED) {
          return this.createInvoiceFromOrder(res.body);
        }
        return of(null);
      })
    ).subscribe({
      next: inv => {
        if (inv) this.createdInvoice = inv.body;
        this.isActionLoading = false;
      },
      error: () => { this.isActionLoading = false; }
    });
  }

  private createInvoiceFromOrder(order: IOrder) {
    const today = dayjs();
    const dueDate = today.add(order.paymentTermsDays ?? 30, 'day');
    const pad = (n: number): string => String(n).padStart(2, '0');
    const invoiceNumber = `FAC-${today.year()}${pad(today.month() + 1)}${pad(today.date())}-${order.id}`;

    const amountHt = (order.subtotal ?? 0) - (order.discountAmount ?? 0);

    return this.invoiceService.create({
      id: null,
      invoiceNumber,
      amountHt,
      taxAmount: order.taxAmount ?? 0,
      amountTtc: order.totalAmount ?? 0,
      status: InvoiceStatus.ISSUED,
      issueDate: today,
      dueDate,
      client: order.client ? { id: order.client.id, name: order.client.name } : null,
      order: { id: order.id, orderNumber: order.orderNumber ?? null },
    });
  }

  cancelOrder(): void {
    if (!this.order?.id) return;
    this.isActionLoading = true;
    this.orderService.validate(this.order.id, 'CANCELLED').subscribe({
      next: res => { this.order = res.body; this.isActionLoading = false; },
      error: () => { this.isActionLoading = false; }
    });
  }

  getStepState(stepKey: string): string {
    if (!this.order?.status) return 'pending';
    const currentIndex = this.pipelineSteps.findIndex(s => s.key === this.order!.status);
    const stepIndex    = this.pipelineSteps.findIndex(s => s.key === stepKey);
    if (stepIndex < currentIndex)  return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  }

  getStatusBadgeClass(): string {
    const map: Record<string, string> = {
      DRAFT:          'tsg-badge--draft',
      PENDING:        'tsg-badge--submitted',
      SUBMITTED:      'tsg-badge--submitted',
      UNDER_REVIEW:   'tsg-badge--under-review',
      APPROVED:       'tsg-badge--approved',
      IN_PREPARATION: 'tsg-badge--in-progress',
      SHIPPED:        'tsg-badge--shipped',
      DELIVERED:      'tsg-badge--delivered',
      INVOICED:       'tsg-badge--invoiced',
      PAID:           'tsg-badge--paid',
      REJECTED:       'tsg-badge--rejected',
      CANCELLED:      'tsg-badge--cancelled',
    };
    return map[this.order?.status || ''] || 'tsg-badge--neutral';
  }

  isTerminalStatus(): boolean {
    return this.order?.status === OrderStatus.REJECTED
        || this.order?.status === OrderStatus.CANCELLED;
  }

  getLineSubtotal(line: IOrderLine): number {
    const qty = line.quantity ?? 0;
    const price = line.unitPrice ?? 0;
    const disc = line.discountPct ?? 0;
    return qty * price * (1 - disc / 100);
  }
}
