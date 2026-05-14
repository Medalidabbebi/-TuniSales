import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPriceList } from '../price-list.model';

@Component({
  selector: 'jhi-price-list-detail',
  templateUrl: './price-list-detail.component.html',
})
export class PriceListDetailComponent implements OnInit {
  priceList: IPriceList | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ priceList }) => {
      this.priceList = priceList;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
