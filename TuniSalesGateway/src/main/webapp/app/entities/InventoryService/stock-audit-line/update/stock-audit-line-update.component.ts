import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { StockAuditLineFormService, StockAuditLineFormGroup } from './stock-audit-line-form.service';
import { IStockAuditLine } from '../stock-audit-line.model';
import { StockAuditLineService } from '../service/stock-audit-line.service';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';
import { IStockAudit } from 'app/entities/InventoryService/stock-audit/stock-audit.model';
import { StockAuditService } from 'app/entities/InventoryService/stock-audit/service/stock-audit.service';
import { AuditResolution } from 'app/entities/enumerations/audit-resolution.model';

@Component({
  selector: 'jhi-stock-audit-line-update',
  templateUrl: './stock-audit-line-update.component.html',
})
export class StockAuditLineUpdateComponent implements OnInit {
  isSaving = false;
  stockAuditLine: IStockAuditLine | null = null;
  auditResolutionValues = Object.keys(AuditResolution);

  stockItemsSharedCollection: IStockItem[] = [];
  stockAuditsSharedCollection: IStockAudit[] = [];

  editForm: StockAuditLineFormGroup = this.stockAuditLineFormService.createStockAuditLineFormGroup();

  constructor(
    protected stockAuditLineService: StockAuditLineService,
    protected stockAuditLineFormService: StockAuditLineFormService,
    protected stockItemService: StockItemService,
    protected stockAuditService: StockAuditService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareStockItem = (o1: IStockItem | null, o2: IStockItem | null): boolean => this.stockItemService.compareStockItem(o1, o2);

  compareStockAudit = (o1: IStockAudit | null, o2: IStockAudit | null): boolean => this.stockAuditService.compareStockAudit(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockAuditLine }) => {
      this.stockAuditLine = stockAuditLine;
      if (stockAuditLine) {
        this.updateForm(stockAuditLine);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const stockAuditLine = this.stockAuditLineFormService.getStockAuditLine(this.editForm);
    if (stockAuditLine.id !== null) {
      this.subscribeToSaveResponse(this.stockAuditLineService.update(stockAuditLine));
    } else {
      this.subscribeToSaveResponse(this.stockAuditLineService.create(stockAuditLine));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStockAuditLine>>): void {
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

  protected updateForm(stockAuditLine: IStockAuditLine): void {
    this.stockAuditLine = stockAuditLine;
    this.stockAuditLineFormService.resetForm(this.editForm, stockAuditLine);

    this.stockItemsSharedCollection = this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(
      this.stockItemsSharedCollection,
      stockAuditLine.stockItem
    );
    this.stockAuditsSharedCollection = this.stockAuditService.addStockAuditToCollectionIfMissing<IStockAudit>(
      this.stockAuditsSharedCollection,
      stockAuditLine.audit
    );
  }

  protected loadRelationshipsOptions(): void {
    this.stockItemService
      .query()
      .pipe(map((res: HttpResponse<IStockItem[]>) => res.body ?? []))
      .pipe(
        map((stockItems: IStockItem[]) =>
          this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(stockItems, this.stockAuditLine?.stockItem)
        )
      )
      .subscribe((stockItems: IStockItem[]) => (this.stockItemsSharedCollection = stockItems));

    this.stockAuditService
      .query()
      .pipe(map((res: HttpResponse<IStockAudit[]>) => res.body ?? []))
      .pipe(
        map((stockAudits: IStockAudit[]) =>
          this.stockAuditService.addStockAuditToCollectionIfMissing<IStockAudit>(stockAudits, this.stockAuditLine?.audit)
        )
      )
      .subscribe((stockAudits: IStockAudit[]) => (this.stockAuditsSharedCollection = stockAudits));
  }
}
