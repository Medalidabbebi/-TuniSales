import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { OrderLineItemFormService, OrderLineItemFormGroup } from './order-line-item-form.service';
import { IOrderLineItem } from '../order-line-item.model';
import { OrderLineItemService } from '../service/order-line-item.service';
import { IOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { OrderLineService } from 'app/entities/BusinessService/order-line/service/order-line.service';

@Component({
  selector: 'jhi-order-line-item-update',
  templateUrl: './order-line-item-update.component.html',
})
export class OrderLineItemUpdateComponent implements OnInit {
  isSaving = false;
  orderLineItem: IOrderLineItem | null = null;

  orderLinesSharedCollection: IOrderLine[] = [];

  editForm: OrderLineItemFormGroup = this.orderLineItemFormService.createOrderLineItemFormGroup();

  constructor(
    protected orderLineItemService: OrderLineItemService,
    protected orderLineItemFormService: OrderLineItemFormService,
    protected orderLineService: OrderLineService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareOrderLine = (o1: IOrderLine | null, o2: IOrderLine | null): boolean => this.orderLineService.compareOrderLine(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ orderLineItem }) => {
      this.orderLineItem = orderLineItem;
      if (orderLineItem) {
        this.updateForm(orderLineItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const orderLineItem = this.orderLineItemFormService.getOrderLineItem(this.editForm);
    if (orderLineItem.id !== null) {
      this.subscribeToSaveResponse(this.orderLineItemService.update(orderLineItem));
    } else {
      this.subscribeToSaveResponse(this.orderLineItemService.create(orderLineItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOrderLineItem>>): void {
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

  protected updateForm(orderLineItem: IOrderLineItem): void {
    this.orderLineItem = orderLineItem;
    this.orderLineItemFormService.resetForm(this.editForm, orderLineItem);

    this.orderLinesSharedCollection = this.orderLineService.addOrderLineToCollectionIfMissing<IOrderLine>(
      this.orderLinesSharedCollection,
      orderLineItem.orderLine
    );
  }

  protected loadRelationshipsOptions(): void {
    this.orderLineService
      .query()
      .pipe(map((res: HttpResponse<IOrderLine[]>) => res.body ?? []))
      .pipe(
        map((orderLines: IOrderLine[]) =>
          this.orderLineService.addOrderLineToCollectionIfMissing<IOrderLine>(orderLines, this.orderLineItem?.orderLine)
        )
      )
      .subscribe((orderLines: IOrderLine[]) => (this.orderLinesSharedCollection = orderLines));
  }
}
