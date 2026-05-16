import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockAudit } from '../stock-audit.model';
import { AuditStatus } from 'app/entities/enumerations/audit-status.model';

@Component({
  selector: 'jhi-stock-audit-detail',
  templateUrl: './stock-audit-detail.component.html',
  styleUrls: ['./stock-audit-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockAuditDetailComponent implements OnInit {
  stockAudit: IStockAudit | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockAudit }) => {
      this.stockAudit = stockAudit;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusClass(status: AuditStatus | null | undefined): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'sad-status--progress',
      CLOSED:      'sad-status--closed',
      CANCELLED:   'sad-status--cancelled',
    };
    return map[status ?? ''] || 'sad-status--neutral';
  }

  getStatusLabel(status: AuditStatus | null | undefined): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'En cours',
      CLOSED:      'Clôturé',
      CANCELLED:   'Annulé',
    };
    return map[status ?? ''] || (status ?? '—');
  }

  getDiscrepancyClass(discrepancy: number | null | undefined): string {
    if (discrepancy == null || discrepancy === 0) return 'sad-kpi--green';
    return 'sad-kpi--red';
  }
}
