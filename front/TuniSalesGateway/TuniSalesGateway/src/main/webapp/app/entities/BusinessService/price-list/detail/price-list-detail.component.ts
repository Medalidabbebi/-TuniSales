import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPriceList } from '../price-list.model';

@Component({
  selector: 'jhi-price-list-detail',
  templateUrl: './price-list-detail.component.html',
  styleUrls: ['./price-list-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  getStatusBadgeClass(): string {
    return this.priceList?.isActive ? 'tsg-badge--success' : 'tsg-badge--neutral';
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }
}
