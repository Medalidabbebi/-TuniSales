import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClientScoreFormService, ClientScoreFormGroup } from './client-score-form.service';
import { IClientScore } from '../client-score.model';
import { ClientScoreService } from '../service/client-score.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ScoreClassification } from 'app/entities/enumerations/score-classification.model';

@Component({
  selector: 'jhi-client-score-update',
  templateUrl: './client-score-update.component.html',
})
export class ClientScoreUpdateComponent implements OnInit {
  isSaving = false;
  clientScore: IClientScore | null = null;
  scoreClassificationValues = Object.keys(ScoreClassification);

  editForm: ClientScoreFormGroup = this.clientScoreFormService.createClientScoreFormGroup();

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected clientScoreService: ClientScoreService,
    protected clientScoreFormService: ClientScoreFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ clientScore }) => {
      this.clientScore = clientScore;
      if (clientScore) {
        this.updateForm(clientScore);
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
    const clientScore = this.clientScoreFormService.getClientScore(this.editForm);
    if (clientScore.id !== null) {
      this.subscribeToSaveResponse(this.clientScoreService.update(clientScore));
    } else {
      this.subscribeToSaveResponse(this.clientScoreService.create(clientScore));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClientScore>>): void {
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

  protected updateForm(clientScore: IClientScore): void {
    this.clientScore = clientScore;
    this.clientScoreFormService.resetForm(this.editForm, clientScore);
  }
}
