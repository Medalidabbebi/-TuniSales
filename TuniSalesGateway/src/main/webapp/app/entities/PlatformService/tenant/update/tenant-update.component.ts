import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TenantFormService, TenantFormGroup } from './tenant-form.service';
import { ITenant } from '../tenant.model';
import { TenantService } from '../service/tenant.service';
import { TenantStatus } from 'app/entities/enumerations/tenant-status.model';

@Component({
  selector: 'jhi-tenant-update',
  templateUrl: './tenant-update.component.html',
})
export class TenantUpdateComponent implements OnInit {
  isSaving = false;
  tenant: ITenant | null = null;
  tenantStatusValues = Object.keys(TenantStatus);

  editForm: TenantFormGroup = this.tenantFormService.createTenantFormGroup();

  constructor(
    protected tenantService: TenantService,
    protected tenantFormService: TenantFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tenant }) => {
      this.tenant = tenant;
      if (tenant) {
        this.updateForm(tenant);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const tenant = this.tenantFormService.getTenant(this.editForm);
    if (tenant.id !== null) {
      this.subscribeToSaveResponse(this.tenantService.update(tenant));
    } else {
      this.subscribeToSaveResponse(this.tenantService.create(tenant));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITenant>>): void {
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

  protected updateForm(tenant: ITenant): void {
    this.tenant = tenant;
    this.tenantFormService.resetForm(this.editForm, tenant);
  }
}
