import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IOrderLineItem } from '../order-line-item.model';

@Component({
  selector: 'jhi-order-line-item-detail',
  templateUrl: './order-line-item-detail.component.html',
})
export class OrderLineItemDetailComponent implements OnInit {
  orderLineItem: IOrderLineItem | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ orderLineItem }) => {
      this.orderLineItem = orderLineItem;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
