import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { StockItemFormService, StockItemFormGroup } from './stock-item-form.service';
import { IStockItem } from '../stock-item.model';
import { StockItemService } from '../service/stock-item.service';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { WarehouseService } from 'app/entities/InventoryService/warehouse/service/warehouse.service';
import { StockItemStatus } from 'app/entities/enumerations/stock-item-status.model';

@Component({
  selector: 'jhi-stock-item-update',
  templateUrl: './stock-item-update.component.html',
})
export class StockItemUpdateComponent implements OnInit {
  isSaving = false;
  stockItem: IStockItem | null = null;
  stockItemStatusValues = Object.keys(StockItemStatus);

  warehousesSharedCollection: IWarehouse[] = [];

  editForm: StockItemFormGroup = this.stockItemFormService.createStockItemFormGroup();

  constructor(
    protected stockItemService: StockItemService,
    protected stockItemFormService: StockItemFormService,
    protected warehouseService: WarehouseService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWarehouse = (o1: IWarehouse | null, o2: IWarehouse | null): boolean => this.warehouseService.compareWarehouse(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockItem }) => {
      this.stockItem = stockItem;
      if (stockItem) {
        this.updateForm(stockItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const stockItem = this.stockItemFormService.getStockItem(this.editForm);
    if (stockItem.id !== null) {
      this.subscribeToSaveResponse(this.stockItemService.update(stockItem));
    } else {
      this.subscribeToSaveResponse(this.stockItemService.create(stockItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStockItem>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(stockItem: IStockItem): void {
    this.stockItem = stockItem;
    this.stockItemFormService.resetForm(this.editForm, stockItem);

    this.warehousesSharedCollection = this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(
      this.warehousesSharedCollection,
      stockItem.warehouse
    );
  }

  protected loadRelationshipsOptions(): void {
    this.warehouseService
      .query()
      .pipe(map((res: HttpResponse<IWarehouse[]>) => res.body ?? []))
      .pipe(
        map((warehouses: IWarehouse[]) =>
          this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(warehouses, this.stockItem?.warehouse)
        )
      )
      .subscribe((warehouses: IWarehouse[]) => (this.warehousesSharedCollection = warehouses));
  }
}
