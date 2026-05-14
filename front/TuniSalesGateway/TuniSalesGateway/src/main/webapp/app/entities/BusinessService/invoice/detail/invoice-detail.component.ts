import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IInvoice } from '../invoice.model';

@Component({
  selector: 'jhi-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent implements OnInit {
  invoice: IInvoice | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ invoice }) => {
      this.invoice = invoice;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusBadgeClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT: 'tsg-badge--draft',
      ISSUED: 'tsg-badge--issued',
      PARTIALLY_PAID: 'tsg-badge--warning',
      PAID: 'tsg-badge--success',
      OVERDUE: 'tsg-badge--danger',
      CANCELLED: 'tsg-badge--danger',
    };
    return map[status || ''] || 'tsg-badge--neutral';
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }
}
