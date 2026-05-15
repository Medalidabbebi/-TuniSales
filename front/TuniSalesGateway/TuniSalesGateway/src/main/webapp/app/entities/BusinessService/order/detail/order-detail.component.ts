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
    { key: OrderStatus.DRAFT, label: 'Draft' },
    { key: OrderStatus.SUBMITTED, label: 'Submitted' },
    { key: OrderStatus.UNDER_REVIEW, label: 'Under Review' },
    { key: OrderStatus.APPROVED, label: 'Approved' },
    { key: OrderStatus.IN_PREPARATION, label: 'Preparation' },
    { key: OrderStatus.SHIPPED, label: 'Shipped' },
    { key: OrderStatus.DELIVERED, label: 'Delivered' },
    { key: OrderStatus.INVOICED, label: 'Invoiced' },
    { key: OrderStatus.PAID, label: 'Paid' },
  ];

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

  getStepState(stepKey: string): string {
    if (!this.order?.status) {
      return 'pending';
    }
    const currentIndex = this.pipelineSteps.findIndex(s => s.key === this.order!.status);
    const stepIndex = this.pipelineSteps.findIndex(s => s.key === stepKey);

    if (stepIndex < currentIndex) {
      return 'completed';
    }
    if (stepIndex === currentIndex) {
      return 'active';
    }
    return 'pending';
  }

  getStatusBadgeClass(): string {
    const map: Record<string, string> = {
      DRAFT: 'tsg-badge--draft',
      PENDING: 'tsg-badge--submitted',
      SUBMITTED: 'tsg-badge--submitted',
      UNDER_REVIEW: 'tsg-badge--under-review',
      APPROVED: 'tsg-badge--approved',
      IN_PREPARATION: 'tsg-badge--in-progress',
      SHIPPED: 'tsg-badge--shipped',
      DELIVERED: 'tsg-badge--delivered',
      INVOICED: 'tsg-badge--invoiced',
      PAID: 'tsg-badge--paid',
      REJECTED: 'tsg-badge--rejected',
      CANCELLED: 'tsg-badge--cancelled',
    };
    return map[this.order?.status || ''] || 'tsg-badge--neutral';
  }

  isTerminalStatus(): boolean {
    return this.order?.status === OrderStatus.REJECTED || this.order?.status === OrderStatus.CANCELLED;
  }

  canAdminReview(): boolean {
    return (
      (this.order?.status === OrderStatus.SUBMITTED || this.order?.status === OrderStatus.PENDING) &&
      (this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_ADMIN_COMMERCIAL']))
    );
  }

  moveToUnderReview(): void {
    if (!this.order?.id) return;
    this.isActionLoading = true;
    this.orderService.validate(this.order.id, 'UNDER_REVIEW').subscribe({
      next: res => {
        this.order = res.body;
        this.isActionLoading = false;
      },
      error: () => { this.isActionLoading = false; }
    });
  }

  cancelOrder(): void {
    if (!this.order?.id) return;
    this.isActionLoading = true;
    this.orderService.validate(this.order.id, 'CANCELLED').subscribe({
      next: res => {
        this.order = res.body;
        this.isActionLoading = false;
      },
      error: () => { this.isActionLoading = false; }
    });
  }
}
