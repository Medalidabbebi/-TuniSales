import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockAuditLine } from '../stock-audit-line.model';

@Component({
  selector: 'jhi-stock-audit-line-detail',
  templateUrl: './stock-audit-line-detail.component.html',
})
export class StockAuditLineDetailComponent implements OnInit {
  stockAuditLine: IStockAuditLine | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockAuditLine }) => {
      this.stockAuditLine = stockAuditLine;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
