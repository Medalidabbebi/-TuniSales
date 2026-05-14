import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IProduct } from '../product.model';

@Component({
  selector: 'jhi-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ product }) => {
      this.product = product;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusBadgeClass(): string {
    return this.product?.isActive ? 'tsg-badge--success' : 'tsg-badge--neutral';
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }
}
