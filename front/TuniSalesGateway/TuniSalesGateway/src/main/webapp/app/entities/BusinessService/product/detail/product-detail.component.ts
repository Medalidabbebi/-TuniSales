import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IProduct } from '../product.model';

@Component({
  selector: 'jhi-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  getStatusClass(isActive: boolean | null | undefined): string {
    return isActive ? 'pd-status--active' : 'pd-status--inactive';
  }

  getStatusLabel(isActive: boolean | null | undefined): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatPrice(value: number | null | undefined): string {
    if (value == null) return '—';
    return value.toLocaleString('fr-TN');
  }
}
