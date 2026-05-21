import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import dayjs from 'dayjs/esm';
import { WarehouseFormService, WarehouseFormGroup } from './warehouse-form.service';
import { IWarehouse } from '../warehouse.model';
import { WarehouseService } from '../service/warehouse.service';
import { WarehouseType } from 'app/entities/enumerations/warehouse-type.model';

@Component({
  selector: 'jhi-warehouse-update',
  templateUrl: './warehouse-update.component.html',
  styleUrls: ['./warehouse-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseUpdateComponent implements OnInit {
  isSaving = false;
  warehouse: IWarehouse | null = null;
  warehouseTypeValues = Object.keys(WarehouseType);

  editForm: WarehouseFormGroup = this.warehouseFormService.createWarehouseFormGroup();

  constructor(
    protected warehouseService: WarehouseService,
    protected warehouseFormService: WarehouseFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ warehouse }) => {
      this.warehouse = warehouse;
      if (warehouse) {
        this.updateForm(warehouse);
      }
    });
  }

  get isNew(): boolean {
    return this.editForm.controls.id.value === null;
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const warehouse = this.warehouseFormService.getWarehouse(this.editForm);
    const now = dayjs();
    if (warehouse.id !== null) {
      (warehouse as any).updatedAt = now;
      this.subscribeToSaveResponse(this.warehouseService.update(warehouse));
    } else {
      (warehouse as any).createdAt = now;
      (warehouse as any).updatedAt = now;
      (warehouse as any).tenantId  = (warehouse as any).tenantId ?? 1;
      this.subscribeToSaveResponse(this.warehouseService.create(warehouse));
    }
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      LOCAL:     'Local',
      SITE:      'Site',
      SWAP:      'Échange',
      DEFECTIVE: 'Défectueux',
      MISSING:   'Manquant',
    };
    return map[type] || type;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWarehouse>>): void {
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

  protected updateForm(warehouse: IWarehouse): void {
    this.warehouse = warehouse;
    this.warehouseFormService.resetForm(this.editForm, warehouse);
  }
}
