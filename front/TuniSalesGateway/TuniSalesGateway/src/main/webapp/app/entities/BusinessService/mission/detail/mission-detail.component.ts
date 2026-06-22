import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMission } from '../mission.model';
import { IDelivery } from 'app/entities/BusinessService/delivery/delivery.model';
import { DeliveryService } from 'app/entities/BusinessService/delivery/service/delivery.service';

@Component({
  selector: 'jhi-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MissionDetailComponent implements OnInit {
  mission: IMission | null = null;
  deliveries: IDelivery[] = [];

  constructor(protected activatedRoute: ActivatedRoute, private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mission }) => {
      this.mission = mission;
      this.loadDeliveries();
    });
  }

  /** CSS modifier for a delivery's status pill */
  getDeliveryStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING: 'md-status-pill--planned',
      IN_PREPARATION: 'md-status-pill--progress',
      SHIPPED: 'md-status-pill--progress',
      DELIVERED: 'md-status-pill--done',
      FAILED: 'md-status-pill--cancelled',
    };
    return map[status ?? ''] || 'md-status-pill--cancelled';
  }

  getDeliveryStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING: 'En attente',
      IN_PREPARATION: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      FAILED: 'Échouée',
    };
    return map[status ?? ''] || 'Inconnu';
  }

  private loadDeliveries(): void {
    if (!this.mission?.id) {
      return;
    }
    this.deliveryService
      .query({ 'missionId.equals': this.mission.id, size: 200 })
      .subscribe(res => (this.deliveries = res.body ?? []));
  }

  previousState(): void {
    window.history.back();
  }

  getStatusBadgeClass(): string {
    const map: Record<string, string> = {
      PLANNED: 'tsg-badge--warning',
      IN_PROGRESS: 'tsg-badge--info',
      COMPLETED: 'tsg-badge--success',
      CANCELLED: 'tsg-badge--danger',
    };
    return map[this.mission?.status ?? ''] || 'tsg-badge--neutral';
  }

  /** CSS modifier for the new md-status-pill */
  getStatusClass(): string {
    const map: Record<string, string> = {
      PLANNED: 'md-status-pill--planned',
      IN_PROGRESS: 'md-status-pill--progress',
      COMPLETED: 'md-status-pill--done',
      CANCELLED: 'md-status-pill--cancelled',
    };
    return map[this.mission?.status ?? ''] || 'md-status-pill--cancelled';
  }

  getStatusLabel(): string {
    const map: Record<string, string> = {
      PLANNED: 'Planifiée',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };
    return map[this.mission?.status ?? ''] || 'Inconnu';
  }
}
