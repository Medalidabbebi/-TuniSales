import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockAudit } from '../stock-audit.model';

@Component({
  selector: 'jhi-stock-audit-detail',
  templateUrl: './stock-audit-detail.component.html',
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
}
