import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { WarehouseFormService, WarehouseFormGroup } from './warehouse-form.service';
import { IWarehouse } from '../warehouse.model';
import { WarehouseService } from '../service/warehouse.service';
import { WarehouseType } from 'app/entities/enumerations/warehouse-type.model';

@Component({
  selector: 'jhi-warehouse-update',
  templateUrl: './warehouse-update.component.html',
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const warehouse = this.warehouseFormService.getWarehouse(this.editForm);
    if (warehouse.id !== null) {
      this.subscribeToSaveResponse(this.warehouseService.update(warehouse));
    } else {
      this.subscribeToSaveResponse(this.warehouseService.create(warehouse));
    }
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
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(warehouse: IWarehouse): void {
    this.warehouse = warehouse;
    this.warehouseFormService.resetForm(this.editForm, warehouse);
  }
}
