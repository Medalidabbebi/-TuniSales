import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { PriceListFormService, PriceListFormGroup } from './price-list-form.service';
import { IPriceList } from '../price-list.model';
import { PriceListService } from '../service/price-list.service';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { ProductService } from 'app/entities/BusinessService/product/service/product.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';

@Component({
  selector: 'jhi-price-list-update',
  templateUrl: './price-list-update.component.html',
  styleUrls: ['./price-list-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PriceListUpdateComponent implements OnInit {
  isSaving = false;
  priceList: IPriceList | null = null;

  productsSharedCollection: IProduct[] = [];
  clientsSharedCollection: IClient[] = [];

  editForm: PriceListFormGroup = this.priceListFormService.createPriceListFormGroup();

  constructor(
    protected priceListService: PriceListService,
    protected priceListFormService: PriceListFormService,
    protected productService: ProductService,
    protected clientService: ClientService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ priceList }) => {
      this.priceList = priceList;
      if (priceList) {
        this.updateForm(priceList);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusClass(): string {
    return this.editForm.get('isActive')?.value ? 'tsg-badge--success' : 'tsg-badge--neutral';
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }

  getPriceListSnapshotName(): string {
    const product = this.editForm.get('product')?.value;
    const client = this.editForm.get('client')?.value;
    const productName = product?.name || 'No product';
    const clientName = client?.name || 'No client';
    return `${productName} / ${clientName}`;
  }

  save(): void {
    this.isSaving = true;
    const priceList = this.priceListFormService.getPriceList(this.editForm);
    if (priceList.id !== null) {
      this.subscribeToSaveResponse(this.priceListService.update(priceList));
    } else {
      this.subscribeToSaveResponse(this.priceListService.create(priceList));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPriceList>>): void {
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

  protected updateForm(priceList: IPriceList): void {
    this.priceList = priceList;
    this.priceListFormService.resetForm(this.editForm, priceList);

    this.productsSharedCollection = this.productService.addProductToCollectionIfMissing<IProduct>(
      this.productsSharedCollection,
      priceList.product
    );
    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(
      this.clientsSharedCollection,
      priceList.client
    );
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.priceList?.product)))
      .subscribe((products: IProduct[]) => (this.productsSharedCollection = products));

    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.priceList?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));
  }
}
