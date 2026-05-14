import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { SwapFormService, SwapFormGroup } from './swap-form.service';
import { ISwap } from '../swap.model';
import { SwapService } from '../service/swap.service';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';
import { SwapStatus } from 'app/entities/enumerations/swap-status.model';

@Component({
  selector: 'jhi-swap-update',
  templateUrl: './swap-update.component.html',
})
export class SwapUpdateComponent implements OnInit {
  isSaving = false;
  swap: ISwap | null = null;
  swapStatusValues = Object.keys(SwapStatus);

  stockItemsSharedCollection: IStockItem[] = [];

  editForm: SwapFormGroup = this.swapFormService.createSwapFormGroup();

  constructor(
    protected swapService: SwapService,
    protected swapFormService: SwapFormService,
    protected stockItemService: StockItemService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareStockItem = (o1: IStockItem | null, o2: IStockItem | null): boolean => this.stockItemService.compareStockItem(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ swap }) => {
      this.swap = swap;
      if (swap) {
        this.updateForm(swap);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const swap = this.swapFormService.getSwap(this.editForm);
    if (swap.id !== null) {
      this.subscribeToSaveResponse(this.swapService.update(swap));
    } else {
      this.subscribeToSaveResponse(this.swapService.create(swap));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISwap>>): void {
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

  protected updateForm(swap: ISwap): void {
    this.swap = swap;
    this.swapFormService.resetForm(this.editForm, swap);

    this.stockItemsSharedCollection = this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(
      this.stockItemsSharedCollection,
      swap.outgoingItem,
      swap.incomingItem
    );
  }

  protected loadRelationshipsOptions(): void {
    this.stockItemService
      .query()
      .pipe(map((res: HttpResponse<IStockItem[]>) => res.body ?? []))
      .pipe(
        map((stockItems: IStockItem[]) =>
          this.stockItemService.addStockItemToCollectionIfMissing<IStockItem>(stockItems, this.swap?.outgoingItem, this.swap?.incomingItem)
        )
      )
      .subscribe((stockItems: IStockItem[]) => (this.stockItemsSharedCollection = stockItems));
  }
}
