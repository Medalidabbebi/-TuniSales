import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWarehouse } from '../warehouse.model';

@Component({
  selector: 'jhi-warehouse-detail',
  templateUrl: './warehouse-detail.component.html',
})
export class WarehouseDetailComponent implements OnInit {
  warehouse: IWarehouse | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ warehouse }) => {
      this.warehouse = warehouse;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
