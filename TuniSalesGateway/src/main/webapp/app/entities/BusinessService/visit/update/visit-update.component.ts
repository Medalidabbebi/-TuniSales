import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { VisitFormService, VisitFormGroup } from './visit-form.service';
import { IVisit } from '../visit.model';
import { VisitService } from '../service/visit.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IMission } from 'app/entities/BusinessService/mission/mission.model';
import { MissionService } from 'app/entities/BusinessService/mission/service/mission.service';
import { VisitObjective } from 'app/entities/enumerations/visit-objective.model';
import { VisitStatus } from 'app/entities/enumerations/visit-status.model';

@Component({
  selector: 'jhi-visit-update',
  templateUrl: './visit-update.component.html',
})
export class VisitUpdateComponent implements OnInit {
  isSaving = false;
  visit: IVisit | null = null;
  visitObjectiveValues = Object.keys(VisitObjective);
  visitStatusValues = Object.keys(VisitStatus);

  clientsSharedCollection: IClient[] = [];
  missionsSharedCollection: IMission[] = [];

  editForm: VisitFormGroup = this.visitFormService.createVisitFormGroup();

  constructor(
    protected visitService: VisitService,
    protected visitFormService: VisitFormService,
    protected clientService: ClientService,
    protected missionService: MissionService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  compareMission = (o1: IMission | null, o2: IMission | null): boolean => this.missionService.compareMission(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ visit }) => {
      this.visit = visit;
      if (visit) {
        this.updateForm(visit);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const visit = this.visitFormService.getVisit(this.editForm);
    if (visit.id !== null) {
      this.subscribeToSaveResponse(this.visitService.update(visit));
    } else {
      this.subscribeToSaveResponse(this.visitService.create(visit));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVisit>>): void {
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

  protected updateForm(visit: IVisit): void {
    this.visit = visit;
    this.visitFormService.resetForm(this.editForm, visit);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, visit.client);
    this.missionsSharedCollection = this.missionService.addMissionToCollectionIfMissing<IMission>(
      this.missionsSharedCollection,
      visit.mission
    );
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.visit?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));

    this.missionService
      .query()
      .pipe(map((res: HttpResponse<IMission[]>) => res.body ?? []))
      .pipe(map((missions: IMission[]) => this.missionService.addMissionToCollectionIfMissing<IMission>(missions, this.visit?.mission)))
      .subscribe((missions: IMission[]) => (this.missionsSharedCollection = missions));
  }
}
