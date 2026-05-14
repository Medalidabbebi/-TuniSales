import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockMovement } from '../stock-movement.model';

@Component({
  selector: 'jhi-stock-movement-detail',
  templateUrl: './stock-movement-detail.component.html',
})
export class StockMovementDetailComponent implements OnInit {
  stockMovement: IStockMovement | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockMovement }) => {
      this.stockMovement = stockMovement;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
