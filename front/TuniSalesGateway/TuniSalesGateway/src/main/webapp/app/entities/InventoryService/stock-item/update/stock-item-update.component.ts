import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

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
  serverError: string | null = null;

  warehousesSharedCollection: IWarehouse[] = [];

  editForm: StockItemFormGroup = this.stockItemFormService.createStockItemFormGroup();

  constructor(
    protected stockItemService: StockItemService,
    protected stockItemFormService: StockItemFormService,
    protected warehouseService: WarehouseService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWarehouse = (o1: IWarehouse | null, o2: IWarehouse | null): boolean => this.warehouseService.compareWarehouse(o1, o2);

  trackWarehouseById = (_index: number, item: IWarehouse): number => this.warehouseService.getWarehouseIdentifier(item);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockItem }) => {
      this.stockItem = stockItem;
      if (stockItem) {
        this.updateForm(stockItem);
      } else {
        // Nouveau stock item : pré-remplir les champs requis masqués
        this.editForm.patchValue({
          isDeleted: false,
          imei: null,
          tenantId: 1,
          acquiredAt: dayjs().format(DATE_TIME_FORMAT),
        });
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
      error: (err) => this.onSaveError(err),
    });
  }

  protected onSaveSuccess(): void {
    this.serverError = null;
    this.previousState();
  }

  protected onSaveError(err: any): void {
    console.error('[StockItemUpdate] Save error:', err);
    let errorMsg = 'Erreur interne du serveur.';
    
    if (err?.error?.detail) {
      errorMsg = err.error.detail;
    } else if (err?.error?.message) {
      errorMsg = err.error.message;
    } else if (err?.error?.title) {
      errorMsg = err.error.title;
    } else if (err?.message) {
      errorMsg = err.message;
    } else if (err?.status) {
      errorMsg = `Erreur HTTP ${err.status}`;
    }
    
    this.serverError = errorMsg;
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
