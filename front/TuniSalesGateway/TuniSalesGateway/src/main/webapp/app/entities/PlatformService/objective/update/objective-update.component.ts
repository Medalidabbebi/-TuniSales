import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ObjectiveFormService, ObjectiveFormGroup } from './objective-form.service';
import { IObjective } from '../objective.model';
import { ObjectiveService } from '../service/objective.service';
import { MetricType } from 'app/entities/enumerations/metric-type.model';

@Component({
  selector: 'jhi-objective-update',
  templateUrl: './objective-update.component.html',
})
export class ObjectiveUpdateComponent implements OnInit {
  isSaving = false;
  objective: IObjective | null = null;
  metricTypeValues = Object.keys(MetricType);

  editForm: ObjectiveFormGroup = this.objectiveFormService.createObjectiveFormGroup();

  constructor(
    protected objectiveService: ObjectiveService,
    protected objectiveFormService: ObjectiveFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ objective }) => {
      this.objective = objective;
      if (objective) {
        this.updateForm(objective);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const objective = this.objectiveFormService.getObjective(this.editForm);
    if (objective.id !== null) {
      this.subscribeToSaveResponse(this.objectiveService.update(objective));
    } else {
      this.subscribeToSaveResponse(this.objectiveService.create(objective));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IObjective>>): void {
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

  protected updateForm(objective: IObjective): void {
    this.objective = objective;
    this.objectiveFormService.resetForm(this.editForm, objective);
  }
}
