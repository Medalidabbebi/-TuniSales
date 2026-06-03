import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./objective-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  get isEdit(): boolean {
    return this.editForm.controls.id.value !== null;
  }

  get currentProgress(): number {
    const target = this.editForm.get('targetValue')?.value ?? 0;
    const achieved = this.editForm.get('achievedValue')?.value ?? 0;
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  }

  get progressClass(): string {
    const p = this.currentProgress;
    if (p >= 100) return 'ouf-prog--green';
    if (p >= 70)  return 'ouf-prog--blue';
    if (p > 0)    return 'ouf-prog--amber';
    return 'ouf-prog--red';
  }

  getMetricLabel(type: string): string {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'Taux de conversion',
      REVENUE:         'Chiffre d\'affaires',
      UNIT_VOLUME:     'Volume unitaire',
      VISIT_COUNT:     'Nombre de visites',
    };
    return map[type] || type;
  }

  getMetricClass(type: string): string {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'ouf-metric--blue',
      REVENUE:         'ouf-metric--green',
      UNIT_VOLUME:     'ouf-metric--orange',
      VISIT_COUNT:     'ouf-metric--purple',
    };
    return map[type] || 'ouf-metric--gray';
  }

  getMetricIcon(type: string): any {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'percent',
      REVENUE:         'money-bill-wave',
      UNIT_VOLUME:     'boxes',
      VISIT_COUNT:     'road',
    };
    return map[type] || 'bullseye';
  }

  selectMetricType(type: string): void {
    this.editForm.get('metricType')?.setValue(type);
  }

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
    (objective as any).tenantId = (objective as any).tenantId ?? 1;
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
