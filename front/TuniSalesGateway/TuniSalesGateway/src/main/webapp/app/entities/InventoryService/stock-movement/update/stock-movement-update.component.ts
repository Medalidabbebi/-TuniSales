import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { StockMovementFormService, StockMovementFormGroup } from './stock-movement-form.service';
import { IStockMovement } from '../stock-movement.model';
import { StockMovementService } from '../service/stock-movement.service';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { WarehouseService } from 'app/entities/InventoryService/warehouse/service/warehouse.service';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';
import { MovementType } from 'app/entities/enumerations/movement-type.model';

@Component({
  selector: 'jhi-stock-movement-update',
  templateUrl: './stock-movement-update.component.html',
  styleUrls: ['./stock-movement-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockMovementUpdateComponent implements OnInit {
  isSaving = false;
  stockMovement: IStockMovement | null = null;
  movementTypeValues = Object.keys(MovementType);

  warehousesSharedCollection: IWarehouse[] = [];
  stockItemsSharedCollection: IStockItem[] = [];

  editForm: StockMovementFormGroup = this.stockMovementFormService.createStockMovementFormGroup();

  constructor(
    protected stockMovementService: StockMovementService,
    protected stockMovementFormService: StockMovementFormService,
    protected warehouseService: WarehouseService,
    protected stockItemService: StockItemService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWarehouse = (o1: IWarehouse | null, o2: IWarehouse | null): boolean => this.warehouseService.compareWarehouse(o1, o2);

  compareStockItem = (o1: IStockItem | null, o2: IStockItem | null): boolean => this.stockItemService.compareStockItem(o1, o2);

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      INBOUND:              'Entrée',
      OUTBOUND:             'Sortie',
      TRANSFER:             'Transfert',
      RETURN:               'Retour',
      SWAP_OUT:             'Échange sortant',
      SWAP_IN:              'Échange entrant',
      INVENTORY_ADJUSTMENT: 'Ajustement inventaire',
    };
    return map[type] || type;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockMovement }) => {
      this.stockMovement = stockMovement;
      if (stockMovement) {
        this.updateForm(stockMovement);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const stockMovement = this.stockMovementFormService.getStockMovement(this.editForm);
    if (stockMovement.id !== null) {
      this.subscribeToSaveResponse(this.stockMovementService.update(stockMovement));
    } else {
      if (!(stockMovement as any).createdAt || !(stockMovement as any).createdAt.isValid?.()) {
        (stockMovement as any).createdAt = dayjs();
      }
      this.subscribeToSaveResponse(this.stockMovementService.create(stockMovement));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStockMovement>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // error displayed via jhi-alert-error
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(stockMovement: IStockMovement): void {
    this.stockMovement = stockMovement;
    this.stockMovementFormService.resetForm(this.editForm, stockMovement);

    this.warehousesSharedCollection = this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(
      this.warehousesSharedCollection,
      stockMovement.fromWarehouse,
      stockMovement.toWarehouse
    );
    this.stockItemsSharedCollection = this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(
      this.stockItemsSharedCollection,
      stockMovement.stockItem
    );
  }

  protected loadRelationshipsOptions(): void {
    this.warehouseService
      .query()
      .pipe(map((res: HttpResponse<IWarehouse[]>) => res.body ?? []))
      .pipe(
        map((warehouses: IWarehouse[]) =>
          this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(
            warehouses,
            this.stockMovement?.fromWarehouse,
            this.stockMovement?.toWarehouse
          )
        )
      )
      .subscribe((warehouses: IWarehouse[]) => (this.warehousesSharedCollection = warehouses));

    this.stockItemService
      .query()
      .pipe(map((res: HttpResponse<IStockItem[]>) => res.body ?? []))
      .pipe(
        map((stockItems: IStockItem[]) =>
          this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(stockItems, this.stockMovement?.stockItem)
        )
      )
      .subscribe((stockItems: IStockItem[]) => (this.stockItemsSharedCollection = stockItems));
  }
}
