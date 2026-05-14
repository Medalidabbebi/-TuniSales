import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { InvoiceFormService, InvoiceFormGroup } from './invoice-form.service';
import { IInvoice } from '../invoice.model';
import { InvoiceService } from '../service/invoice.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';

@Component({
  selector: 'jhi-invoice-update',
  template: `<div class="tsg-form-page">
  <!-- Invoice edit layout -->
  <form name="editForm" role="form" novalidate (ngSubmit)="save()" [formGroup]="editForm" class="tsg-form-shell">
    <div class="tsg-page-header">
      <div>
        <h1 class="tsg-page-header__title" id="jhi-invoice-heading" data-cy="InvoiceCreateUpdateHeading" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.home.createOrEditLabel">
          Create or edit invoice
        </h1>
        <p class="tsg-page-header__subtitle">Update financial details, timeline, and linked entities in one place.</p>
      </div>
      <div class="tsg-page-header__actions">
        <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="tsg-btn tsg-btn--secondary" (click)="previousState()">
          <fa-icon icon="ban"></fa-icon>
          <span jhiTranslate="entity.action.cancel">Cancel</span>
        </button>

        <button type="submit" id="save-entity" data-cy="entityCreateSaveButton" [disabled]="editForm.invalid || isSaving" class="tsg-btn tsg-btn--primary">
          <fa-icon icon="save"></fa-icon>
          <span jhiTranslate="entity.action.save">Save</span>
        </button>
      </div>
    </div>

    <jhi-alert-error></jhi-alert-error>

    <div class="tsg-summary-grid">
      <div class="tsg-summary-card">
        <div class="tsg-summary-card__label">Invoice number</div>
        <div class="tsg-summary-card__value">{{ editForm.get('invoiceNumber')?.value || 'Draft invoice' }}</div>
        <div class="tsg-summary-card__meta">Tenant {{ editForm.get('tenantId')?.value || '—' }}</div>
      </div>
      <div class="tsg-summary-card">
        <div class="tsg-summary-card__label">Total amount</div>
        <div class="tsg-summary-card__value">{{ editForm.get('amountTtc')?.value || '—' }}</div>
        <div class="tsg-summary-card__meta">HT {{ editForm.get('amountHt')?.value || '—' }} | Tax {{ editForm.get('taxAmount')?.value || '—' }}</div>
      </div>
      <div class="tsg-summary-card">
        <div class="tsg-summary-card__label">Status</div>
        <div class="tsg-summary-card__value">
          <span class="tsg-badge" [ngClass]="editForm.get('status')?.value === 'PAID' ? 'tsg-badge--success' : 'tsg-badge--issued'">
            {{ editForm.get('status')?.value || 'DRAFT' }}
          </span>
        </div>
        <div class="tsg-summary-card__meta">Current lifecycle state</div>
      </div>
      <div class="tsg-summary-card">
        <div class="tsg-summary-card__label">Linked entities</div>
        <div class="tsg-summary-card__value">{{ editForm.get('client')?.value?.name || 'Unassigned' }}</div>
        <div class="tsg-summary-card__meta">Order {{ editForm.get('order')?.value?.orderNumber || '—' }}</div>
      </div>
    </div>

    <div class="tsg-form-grid">
      <section class="tsg-form-card">
        <div class="tsg-form-card__header">
          <h2>Billing</h2>
        </div>

        <div class="tsg-form-group" *ngIf="editForm.controls.id.value !== null">
          <label class="form-label" jhiTranslate="global.field.id" for="field_id">ID</label>
          <input type="number" class="tsg-input" name="id" id="field_id" data-cy="id" formControlName="id" [readonly]="true" />
        </div>

        <div class="tsg-form-group">
          <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.tenantId" for="field_tenantId">Tenant Id</label>
          <input type="number" class="tsg-input" name="tenantId" id="field_tenantId" data-cy="tenantId" formControlName="tenantId" />
          <div *ngIf="editForm.get('tenantId')!.invalid && (editForm.get('tenantId')!.dirty || editForm.get('tenantId')!.touched)">
            <small class="tsg-field-error" *ngIf="editForm.get('tenantId')?.errors?.required" jhiTranslate="entity.validation.required">
              This field is required.
            </small>
            <small class="tsg-field-error" [hidden]="!editForm.get('tenantId')?.errors?.number" jhiTranslate="entity.validation.number">
              This field must be a number.
            </small>
          </div>
        </div>

        <div class="tsg-form-group">
          <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.invoiceNumber" for="field_invoiceNumber">Invoice Number</label>
          <input type="text" class="tsg-input" name="invoiceNumber" id="field_invoiceNumber" data-cy="invoiceNumber" formControlName="invoiceNumber" />
          <div *ngIf="editForm.get('invoiceNumber')!.invalid && (editForm.get('invoiceNumber')!.dirty || editForm.get('invoiceNumber')!.touched)">
            <small class="tsg-field-error" *ngIf="editForm.get('invoiceNumber')?.errors?.required" jhiTranslate="entity.validation.required">
              This field is required.
            </small>
            <small class="tsg-field-error" *ngIf="editForm.get('invoiceNumber')?.errors?.minlength" jhiTranslate="entity.validation.minlength" [translateValues]="{ min: 5 }">
              This field must be at least 5 characters long.
            </small>
            <small class="tsg-field-error" *ngIf="editForm.get('invoiceNumber')?.errors?.maxlength" jhiTranslate="entity.validation.maxlength" [translateValues]="{ max: 50 }">
              This field cannot exceed 50 characters.
            </small>
          </div>
        </div>

        <div class="tsg-form-grid--two">
          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.amountHt" for="field_amountHt">Amount Ht</label>
            <input type="number" class="tsg-input" name="amountHt" id="field_amountHt" data-cy="amountHt" formControlName="amountHt" />
            <div *ngIf="editForm.get('amountHt')!.invalid && (editForm.get('amountHt')!.dirty || editForm.get('amountHt')!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get('amountHt')?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
              <small class="tsg-field-error" *ngIf="editForm.get('amountHt')?.errors?.min" jhiTranslate="entity.validation.min" [translateValues]="{ min: 0 }">
                This field must be greater than or equal to 0.
              </small>
              <small class="tsg-field-error" [hidden]="!editForm.get('amountHt')?.errors?.number" jhiTranslate="entity.validation.number">
                This field must be a number.
              </small>
            </div>
          </div>

          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.taxAmount" for="field_taxAmount">Tax Amount</label>
            <input type="number" class="tsg-input" name="taxAmount" id="field_taxAmount" data-cy="taxAmount" formControlName="taxAmount" />
            <div *ngIf="editForm.get('taxAmount')!.invalid && (editForm.get('taxAmount')!.dirty || editForm.get('taxAmount')!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get('taxAmount')?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
              <small class="tsg-field-error" *ngIf="editForm.get('taxAmount')?.errors?.min" jhiTranslate="entity.validation.min" [translateValues]="{ min: 0 }">
                This field must be greater than or equal to 0.
              </small>
              <small class="tsg-field-error" [hidden]="!editForm.get('taxAmount')?.errors?.number" jhiTranslate="entity.validation.number">
                This field must be a number.
              </small>
            </div>
          </div>
        </div>

        <div class="tsg-form-group">
          <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.amountTtc" for="field_amountTtc">Amount Ttc</label>
          <input type="number" class="tsg-input" name="amountTtc" id="field_amountTtc" data-cy="amountTtc" formControlName="amountTtc" />
          <div *ngIf="editForm.get('amountTtc')!.invalid && (editForm.get('amountTtc')!.dirty || editForm.get('amountTtc')!.touched)">
            <small class="tsg-field-error" *ngIf="editForm.get('amountTtc')?.errors?.required" jhiTranslate="entity.validation.required">
              This field is required.
            </small>
            <small class="tsg-field-error" *ngIf="editForm.get('amountTtc')?.errors?.min" jhiTranslate="entity.validation.min" [translateValues]="{ min: 0 }">
              This field must be greater than or equal to 0.
            </small>
            <small class="tsg-field-error" [hidden]="!editForm.get('amountTtc')?.errors?.number" jhiTranslate="entity.validation.number">
              This field must be a number.
            </small>
          </div>
        </div>
      </section>

      <section class="tsg-form-card">
        <div class="tsg-form-card__header">
          <h2>Status and timing</h2>
        </div>

        <div class="tsg-form-group">
          <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.status" for="field_status">Status</label>
          <select class="tsg-input" name="status" formControlName="status" id="field_status" data-cy="status">
            <option [ngValue]="null">{{ 'tuniSalesGatewayApp.InvoiceStatus.null' | translate }}</option>
            <option *ngFor="let invoiceStatus of invoiceStatusValues" [value]="invoiceStatus">
              {{ 'tuniSalesGatewayApp.InvoiceStatus.' + invoiceStatus | translate }}
            </option>
          </select>
          <div *ngIf="editForm.get('status')!.invalid && (editForm.get('status')!.dirty || editForm.get('status')!.touched)">
            <small class="tsg-field-error" *ngIf="editForm.get('status')?.errors?.required" jhiTranslate="entity.validation.required">
              This field is required.
            </small>
          </div>
        </div>

        <div class="tsg-form-grid--two">
          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.issueDate" for="field_issueDate">Issue Date</label>
            <input id="field_issueDate" data-cy="issueDate" type="datetime-local" class="tsg-input" name="issueDate" formControlName="issueDate" placeholder="YYYY-MM-DD HH:mm" />
            <div *ngIf="editForm.get('issueDate')!.invalid && (editForm.get('issueDate')!.dirty || editForm.get('issueDate')!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get('issueDate')?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
              <small class="tsg-field-error" [hidden]="!editForm.get('issueDate')?.errors?.datetimelocal" jhiTranslate="entity.validation.datetimelocal">
                This field must be a date and time.
              </small>
            </div>
          </div>

          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.dueDate" for="field_dueDate">Due Date</label>
            <input id="field_dueDate" data-cy="dueDate" type="datetime-local" class="tsg-input" name="dueDate" formControlName="dueDate" placeholder="YYYY-MM-DD HH:mm" />
            <div *ngIf="editForm.get('dueDate')!.invalid && (editForm.get('dueDate')!.dirty || editForm.get('dueDate')!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get('dueDate')?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
              <small class="tsg-field-error" [hidden]="!editForm.get('dueDate')?.errors?.datetimelocal" jhiTranslate="entity.validation.datetimelocal">
                This field must be a date and time.
              </small>
            </div>
          </div>
        </div>

        <div class="tsg-form-group">
          <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.paidAt" for="field_paidAt">Paid At</label>
          <input id="field_paidAt" data-cy="paidAt" type="datetime-local" class="tsg-input" name="paidAt" formControlName="paidAt" placeholder="YYYY-MM-DD HH:mm" />
        </div>

        <div class="tsg-form-group">
          <label class="tsg-checkbox" for="field_isDeleted">
            <input type="checkbox" name="isDeleted" id="field_isDeleted" data-cy="isDeleted" formControlName="isDeleted" />
            <span jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.isDeleted">Is Deleted</span>
          </label>
          <div *ngIf="editForm.get('isDeleted')!.invalid && (editForm.get('isDeleted')!.dirty || editForm.get('isDeleted')!.touched)">
            <small class="tsg-field-error" *ngIf="editForm.get('isDeleted')?.errors?.required" jhiTranslate="entity.validation.required">
              This field is required.
            </small>
          </div>
        </div>
      </section>

      <section class="tsg-form-card tsg-form-card--wide">
        <div class="tsg-form-card__header">
          <h2>Relations</h2>
        </div>

        <div class="tsg-form-grid--two">
          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.client" for="field_client">Client</label>
            <select class="tsg-input" id="field_client" data-cy="client" name="client" formControlName="client" [compareWith]="compareClient">
              <option *ngIf="!editForm.get('client')!.value" [ngValue]="null" selected></option>
              <option [ngValue]="clientOption" *ngFor="let clientOption of clientsSharedCollection">{{ clientOption.name }}</option>
            </select>
            <div *ngIf="editForm.get(['client'])!.invalid && (editForm.get(['client'])!.dirty || editForm.get(['client'])!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get(['client'])?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
            </div>
          </div>

          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.order" for="field_order">Order</label>
            <select class="tsg-input" id="field_order" data-cy="order" name="order" formControlName="order" [compareWith]="compareOrder">
              <option *ngIf="editForm.get(['order'])!.value == null" [ngValue]="null" selected></option>
              <option [ngValue]="orderOption" *ngFor="let orderOption of ordersSharedCollection">{{ orderOption.orderNumber }}</option>
            </select>
            <div *ngIf="editForm.get(['order'])!.invalid && (editForm.get(['order'])!.dirty || editForm.get(['order'])!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get(['order'])?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
            </div>
          </div>
        </div>

        <div class="tsg-form-grid--two">
          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.createdAt" for="field_createdAt">Created At</label>
            <input id="field_createdAt" data-cy="createdAt" type="datetime-local" class="tsg-input" name="createdAt" formControlName="createdAt" placeholder="YYYY-MM-DD HH:mm" />
            <div *ngIf="editForm.get('createdAt')!.invalid && (editForm.get('createdAt')!.dirty || editForm.get('createdAt')!.touched)">
              <small class="tsg-field-error" *ngIf="editForm.get('createdAt')?.errors?.required" jhiTranslate="entity.validation.required">
                This field is required.
              </small>
              <small class="tsg-field-error" [hidden]="!editForm.get('createdAt')?.errors?.datetimelocal" jhiTranslate="entity.validation.datetimelocal">
                This field must be a date and time.
              </small>
            </div>
          </div>

          <div class="tsg-form-group">
            <label class="form-label" jhiTranslate="tuniSalesGatewayApp.businessServiceInvoice.updatedAt" for="field_updatedAt">Updated At</label>
            <input id="field_updatedAt" data-cy="updatedAt" type="datetime-local" class="tsg-input" name="updatedAt" formControlName="updatedAt" placeholder="YYYY-MM-DD HH:mm" />
          </div>
        </div>
      </section>
    </div>
  </form>
</div>`,
  styleUrls: ['./invoice-update.component.scss'],
})
export class InvoiceUpdateComponent implements OnInit {
  isSaving = false;
  invoice: IInvoice | null = null;
  invoiceStatusValues = Object.keys(InvoiceStatus);

  clientsSharedCollection: IClient[] = [];
  ordersSharedCollection: IOrder[] = [];

  editForm: InvoiceFormGroup = this.invoiceFormService.createInvoiceFormGroup();

  constructor(
    protected invoiceService: InvoiceService,
    protected invoiceFormService: InvoiceFormService,
    protected clientService: ClientService,
    protected orderService: OrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ invoice }) => {
      this.invoice = invoice;
      if (invoice) {
        this.updateForm(invoice);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const invoice = this.invoiceFormService.getInvoice(this.editForm);
    if (invoice.id !== null) {
      this.subscribeToSaveResponse(this.invoiceService.update(invoice));
    } else {
      this.subscribeToSaveResponse(this.invoiceService.create(invoice));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IInvoice>>): void {
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

  protected updateForm(invoice: IInvoice): void {
    this.invoice = invoice;
    this.invoiceFormService.resetForm(this.editForm, invoice);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, invoice.client);
    this.ordersSharedCollection = this.orderService.addOrderToCollectionIfMissing<IOrder>(this.ordersSharedCollection, invoice.order);
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.invoice?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));

    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.invoice?.order)))
      .subscribe((orders: IOrder[]) => (this.ordersSharedCollection = orders));
  }
}
