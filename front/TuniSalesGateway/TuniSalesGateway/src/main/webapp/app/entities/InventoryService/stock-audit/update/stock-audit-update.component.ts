import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { StockAuditFormService, StockAuditFormGroup } from './stock-audit-form.service';
import { IStockAudit } from '../stock-audit.model';
import { StockAuditService } from '../service/stock-audit.service';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { WarehouseService } from 'app/entities/InventoryService/warehouse/service/warehouse.service';
import { AuditStatus } from 'app/entities/enumerations/audit-status.model';

@Component({
  selector: 'jhi-stock-audit-update',
  templateUrl: './stock-audit-update.component.html',
})
export class StockAuditUpdateComponent implements OnInit {
  isSaving = false;
  stockAudit: IStockAudit | null = null;
  auditStatusValues = Object.keys(AuditStatus);

  warehousesSharedCollection: IWarehouse[] = [];

  editForm: StockAuditFormGroup = this.stockAuditFormService.createStockAuditFormGroup();

  constructor(
    protected stockAuditService: StockAuditService,
    protected stockAuditFormService: StockAuditFormService,
    protected warehouseService: WarehouseService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWarehouse = (o1: IWarehouse | null, o2: IWarehouse | null): boolean => this.warehouseService.compareWarehouse(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockAudit }) => {
      this.stockAudit = stockAudit;
      if (stockAudit) {
        this.updateForm(stockAudit);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const stockAudit = this.stockAuditFormService.getStockAudit(this.editForm);
    if (stockAudit.id !== null) {
      this.subscribeToSaveResponse(this.stockAuditService.update(stockAudit));
    } else {
      this.subscribeToSaveResponse(this.stockAuditService.create(stockAudit));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStockAudit>>): void {
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

  protected updateForm(stockAudit: IStockAudit): void {
    this.stockAudit = stockAudit;
    this.stockAuditFormService.resetForm(this.editForm, stockAudit);

    this.warehousesSharedCollection = this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(
      this.warehousesSharedCollection,
      stockAudit.warehouse
    );
  }

  protected loadRelationshipsOptions(): void {
    this.warehouseService
      .query()
      .pipe(map((res: HttpResponse<IWarehouse[]>) => res.body ?? []))
      .pipe(
        map((warehouses: IWarehouse[]) =>
          this.warehouseService.addWarehouseToCollectionIfMissing<IWarehouse>(warehouses, this.stockAudit?.warehouse)
        )
      )
      .subscribe((warehouses: IWarehouse[]) => (this.warehousesSharedCollection = warehouses));
  }
}
