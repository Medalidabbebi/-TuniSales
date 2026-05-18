import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockItem } from '../stock-item.model';

@Component({
  selector: 'jhi-stock-item-detail',
  templateUrl: './stock-item-detail.component.html',
  styleUrls: ['./stock-item-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockItemDetailComponent implements OnInit {
  stockItem: IStockItem | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockItem }) => {
      this.stockItem = stockItem;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
