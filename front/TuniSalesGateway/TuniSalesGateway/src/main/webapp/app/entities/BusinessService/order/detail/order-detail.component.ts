import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IOrder } from '../order.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { OrderService } from '../service/order.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: IOrder | null = null;
  isActionLoading = false;

  pipelineSteps = [
    { key: OrderStatus.DRAFT,          label: 'Draft' },
    { key: OrderStatus.SUBMITTED,      label: 'Submitted' },
    { key: OrderStatus.UNDER_REVIEW,   label: 'Under Review' },
    { key: OrderStatus.APPROVED,       label: 'Approved' },
    { key: OrderStatus.IN_PREPARATION, label: 'Preparation' },
    { key: OrderStatus.SHIPPED,        label: 'Shipped' },
    { key: OrderStatus.DELIVERED,      label: 'Delivered' },
    { key: OrderStatus.INVOICED,       label: 'Invoiced' },
    { key: OrderStatus.PAID,           label: 'Paid' },
  ];

  // next status for each step
  private nextStatus: Record<string, string> = {
    [OrderStatus.SUBMITTED]:      OrderStatus.UNDER_REVIEW,
    [OrderStatus.UNDER_REVIEW]:   OrderStatus.APPROVED,
    [OrderStatus.APPROVED]:       OrderStatus.IN_PREPARATION,
    [OrderStatus.IN_PREPARATION]: OrderStatus.SHIPPED,
    [OrderStatus.SHIPPED]:        OrderStatus.DELIVERED,
    [OrderStatus.DELIVERED]:      OrderStatus.INVOICED,
    [OrderStatus.INVOICED]:       OrderStatus.PAID,
  };

  // label for the advance button at each step
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
    protected accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ order }) => {
      this.order = order;
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
    this.orderService.validate(this.order.id, next).subscribe({
      next: res => { this.order = res.body; this.isActionLoading = false; },
      error: () => { this.isActionLoading = false; }
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
}
