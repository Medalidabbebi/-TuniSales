import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ProductFormService, ProductFormGroup } from './product-form.service';
import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';
import { ITenant } from 'app/entities/PlatformService/tenant/tenant.model';
import { TenantService } from 'app/entities/PlatformService/tenant/service/tenant.service';

@Component({
  selector: 'jhi-product-update',
  templateUrl: './product-update.component.html',
  styleUrls: ['./product-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductUpdateComponent implements OnInit {
  isSaving = false;
  product: IProduct | null = null;
  tenantsCollection: ITenant[] = [];

  editForm: ProductFormGroup = this.productFormService.createProductFormGroup();

  constructor(
    protected productService: ProductService,
    protected productFormService: ProductFormService,
    protected tenantService: TenantService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ product }) => {
      this.product = product;
      if (product) {
        this.updateForm(product);
      }
    });

    this.tenantService
      .query({ size: 1000 })
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .subscribe((tenants: ITenant[]) => (this.tenantsCollection = tenants));
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

  getProductSnapshotName(): string {
    return this.editForm.get('name')?.value || this.editForm.get('sku')?.value || 'Draft product';
  }

  save(): void {
    this.isSaving = true;
    const product = this.productFormService.getProduct(this.editForm);
    const normalizedProduct = {
      ...product,
      tenantId: product.tenantId !== null && product.tenantId !== undefined ? Number(product.tenantId) : product.tenantId,
      price: product.price !== null && product.price !== undefined ? Number(product.price) : product.price,
      taxRate: product.taxRate !== null && product.taxRate !== undefined ? Number(product.taxRate) : product.taxRate,
      isActive: Boolean(product.isActive),
      isDeleted: Boolean(product.isDeleted),
      sku: product.sku?.trim() ?? null,
      name: product.name?.trim() ?? null,
      brand: product.brand?.trim() || null,
      category: product.category?.trim() || null,
    };

    // Temporary diagnostic to compare the exact payload sent to the API.
    console.debug('Product save payload', normalizedProduct);

    if (normalizedProduct.id !== null) {
      this.subscribeToSaveResponse(this.productService.update(normalizedProduct));
    } else {
      this.subscribeToSaveResponse(this.productService.create(normalizedProduct));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProduct>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: (error: HttpErrorResponse) => this.onSaveError(error),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(error: HttpErrorResponse): void {
    const parsedBody = this.parseErrorBody(error.error);
    console.error('Product save failed', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      body: this.stringifyErrorBody(parsedBody),
      violations: this.extractViolations(parsedBody),
    });
  }

  private parseErrorBody(body: unknown): unknown {
    if (typeof body !== 'string') {
      return body;
    }

    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  private extractViolations(body: unknown): string[] {
    if (!body || typeof body !== 'object') {
      return [];
    }

    const possibleFieldErrors = (body as { fieldErrors?: Array<{ field?: string; message?: string }> }).fieldErrors;
    if (Array.isArray(possibleFieldErrors)) {
      return possibleFieldErrors.map(item => `${item.field ?? 'unknown'}: ${item.message ?? 'unknown'}`);
    }

    return [];
  }

  private stringifyErrorBody(body: unknown): string {
    if (body === null || body === undefined) {
      return 'null';
    }

    if (typeof body === 'string') {
      return body;
    }

    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(product: IProduct): void {
    this.product = product;
    this.productFormService.resetForm(this.editForm, product);
  }
}
