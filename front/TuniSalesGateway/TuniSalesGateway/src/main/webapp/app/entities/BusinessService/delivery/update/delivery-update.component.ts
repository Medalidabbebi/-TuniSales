import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DeliveryFormService, DeliveryFormGroup } from './delivery-form.service';
import { IDelivery } from '../delivery.model';
import { DeliveryService } from '../service/delivery.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { IMission } from 'app/entities/BusinessService/mission/mission.model';
import { MissionService } from 'app/entities/BusinessService/mission/service/mission.service';
import { IVisit } from 'app/entities/BusinessService/visit/visit.model';
import { VisitService } from 'app/entities/BusinessService/visit/service/visit.service';
import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';

@Component({
  selector: 'jhi-delivery-update',
  templateUrl: './delivery-update.component.html',
  styleUrls: ['./delivery-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliveryUpdateComponent implements OnInit {
  isSaving = false;
  delivery: IDelivery | null = null;
  deliveryStatusValues = Object.keys(DeliveryStatus);

  ordersSharedCollection: IOrder[] = [];
  missionsSharedCollection: IMission[] = [];
  visitsSharedCollection: IVisit[] = [];

  editForm: DeliveryFormGroup = this.deliveryFormService.createDeliveryFormGroup();

  constructor(
    protected deliveryService: DeliveryService,
    protected deliveryFormService: DeliveryFormService,
    protected orderService: OrderService,
    protected missionService: MissionService,
    protected visitService: VisitService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  compareMission = (o1: IMission | null, o2: IMission | null): boolean => this.missionService.compareMission(o1, o2);

  compareVisit = (o1: IVisit | null, o2: IVisit | null): boolean => this.visitService.compareVisit(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ delivery }) => {
      this.delivery = delivery;
      if (delivery) {
        this.updateForm(delivery);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const delivery = this.deliveryFormService.getDelivery(this.editForm);
    if (delivery.id !== null) {
      this.subscribeToSaveResponse(this.deliveryService.update(delivery));
    } else {
      this.subscribeToSaveResponse(this.deliveryService.create(delivery));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDelivery>>): void {
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

  protected updateForm(delivery: IDelivery): void {
    this.delivery = delivery;
    this.deliveryFormService.resetForm(this.editForm, delivery);

    this.ordersSharedCollection = this.orderService.addOrderToCollectionIfMissing<IOrder>(this.ordersSharedCollection, delivery.order);
    this.missionsSharedCollection = this.missionService.addMissionToCollectionIfMissing<IMission>(
      this.missionsSharedCollection,
      delivery.mission
    );
    this.visitsSharedCollection = this.visitService.addVisitToCollectionIfMissing<IVisit>(this.visitsSharedCollection, delivery.visit);
  }

  protected loadRelationshipsOptions(): void {
    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.delivery?.order)))
      .subscribe((orders: IOrder[]) => (this.ordersSharedCollection = orders));

    this.missionService
      .query()
      .pipe(map((res: HttpResponse<IMission[]>) => res.body ?? []))
      .pipe(
        map((missions: IMission[]) =>
          this.missionService.addMissionToCollectionIfMissing<IMission>(missions, this.delivery?.mission)
        )
      )
      .subscribe((missions: IMission[]) => (this.missionsSharedCollection = missions));

    this.visitService
      .query()
      .pipe(map((res: HttpResponse<IVisit[]>) => res.body ?? []))
      .pipe(map((visits: IVisit[]) => this.visitService.addVisitToCollectionIfMissing<IVisit>(visits, this.delivery?.visit)))
      .subscribe((visits: IVisit[]) => (this.visitsSharedCollection = visits));
  }

  /** Returns du-status--* modifier class for the live status strip */
  getStatusClass(status: DeliveryStatus | string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:        'du-status--pending',
      IN_PREPARATION: 'du-status--preparation',
      SHIPPED:        'du-status--shipped',
      DELIVERED:      'du-status--delivered',
      FAILED:         'du-status--failed',
    };
    return map[status || ''] || 'du-status--neutral';
  }

  /** Returns French label for a DeliveryStatus */
  getStatusLabel(status: DeliveryStatus | string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:        'En attente',
      IN_PREPARATION: 'En préparation',
      SHIPPED:        'Expédiée',
      DELIVERED:      'Livrée',
      FAILED:         'Échouée',
    };
    return map[status || ''] || (status as string ?? '—');
  }
}
