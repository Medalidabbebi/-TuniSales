import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PerformanceScoreFormService, PerformanceScoreFormGroup } from './performance-score-form.service';
import { IPerformanceScore } from '../performance-score.model';
import { PerformanceScoreService } from '../service/performance-score.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ScoreClassification } from 'app/entities/enumerations/score-classification.model';

@Component({
  selector: 'jhi-performance-score-update',
  templateUrl: './performance-score-update.component.html',
})
export class PerformanceScoreUpdateComponent implements OnInit {
  isSaving = false;
  performanceScore: IPerformanceScore | null = null;
  scoreClassificationValues = Object.keys(ScoreClassification);

  editForm: PerformanceScoreFormGroup = this.performanceScoreFormService.createPerformanceScoreFormGroup();

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected performanceScoreService: PerformanceScoreService,
    protected performanceScoreFormService: PerformanceScoreFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ performanceScore }) => {
      this.performanceScore = performanceScore;
      if (performanceScore) {
        this.updateForm(performanceScore);
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('tuniSalesGatewayApp.error', { ...err, key: 'error.file.' + err.key })
        ),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const performanceScore = this.performanceScoreFormService.getPerformanceScore(this.editForm);
    if (performanceScore.id !== null) {
      this.subscribeToSaveResponse(this.performanceScoreService.update(performanceScore));
    } else {
      this.subscribeToSaveResponse(this.performanceScoreService.create(performanceScore));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPerformanceScore>>): void {
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

  protected updateForm(performanceScore: IPerformanceScore): void {
    this.performanceScore = performanceScore;
    this.performanceScoreFormService.resetForm(this.editForm, performanceScore);
  }
}
