import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MissionFormService, MissionFormGroup } from './mission-form.service';
import { IMission } from '../mission.model';
import { MissionService } from '../service/mission.service';
import { MissionStatus } from 'app/entities/enumerations/mission-status.model';

@Component({
  selector: 'jhi-mission-update',
  templateUrl: './mission-update.component.html',
})
export class MissionUpdateComponent implements OnInit {
  isSaving = false;
  mission: IMission | null = null;
  missionStatusValues = Object.keys(MissionStatus);

  editForm: MissionFormGroup = this.missionFormService.createMissionFormGroup();

  constructor(
    protected missionService: MissionService,
    protected missionFormService: MissionFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mission }) => {
      this.mission = mission;
      if (mission) {
        this.updateForm(mission);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const mission = this.missionFormService.getMission(this.editForm);
    if (mission.id !== null) {
      this.subscribeToSaveResponse(this.missionService.update(mission));
    } else {
      this.subscribeToSaveResponse(this.missionService.create(mission));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMission>>): void {
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

  protected updateForm(mission: IMission): void {
    this.mission = mission;
    this.missionFormService.resetForm(this.editForm, mission);
  }
}
