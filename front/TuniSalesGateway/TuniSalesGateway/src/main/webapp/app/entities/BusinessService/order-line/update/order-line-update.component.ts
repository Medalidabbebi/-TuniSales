import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { OrderLineFormService, OrderLineFormGroup } from './order-line-form.service';
import { IOrderLine } from '../order-line.model';
import { OrderLineService } from '../service/order-line.service';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { ProductService } from 'app/entities/BusinessService/product/service/product.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';

@Component({
  selector: 'jhi-order-line-update',
  templateUrl: './order-line-update.component.html',
})
export class OrderLineUpdateComponent implements OnInit {
  isSaving = false;
  orderLine: IOrderLine | null = null;

  productsSharedCollection: IProduct[] = [];
  ordersSharedCollection: IOrder[] = [];

  editForm: OrderLineFormGroup = this.orderLineFormService.createOrderLineFormGroup();

  constructor(
    protected orderLineService: OrderLineService,
    protected orderLineFormService: OrderLineFormService,
    protected productService: ProductService,
    protected orderService: OrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ orderLine }) => {
      this.orderLine = orderLine;
      if (orderLine) {
        this.updateForm(orderLine);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const orderLine = this.orderLineFormService.getOrderLine(this.editForm);
    if (orderLine.id !== null) {
      this.subscribeToSaveResponse(this.orderLineService.update(orderLine));
    } else {
      this.subscribeToSaveResponse(this.orderLineService.create(orderLine));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOrderLine>>): void {
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

  protected updateForm(orderLine: IOrderLine): void {
    this.orderLine = orderLine;
    this.orderLineFormService.resetForm(this.editForm, orderLine);

    this.productsSharedCollection = this.productService.addProductToCollectionIfMissing<IProduct>(
      this.productsSharedCollection,
      orderLine.product
    );
    this.ordersSharedCollection = this.orderService.addOrderToCollectionIfMissing<IOrder>(this.ordersSharedCollection, orderLine.order);
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.orderLine?.product)))
      .subscribe((products: IProduct[]) => (this.productsSharedCollection = products));

    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.orderLine?.order)))
      .subscribe((orders: IOrder[]) => (this.ordersSharedCollection = orders));
  }
}
