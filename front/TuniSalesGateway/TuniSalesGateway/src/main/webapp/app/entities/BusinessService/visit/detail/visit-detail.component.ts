import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IVisit } from '../visit.model';
import { IDelivery } from 'app/entities/BusinessService/delivery/delivery.model';
import { DeliveryService } from 'app/entities/BusinessService/delivery/service/delivery.service';

@Component({
  selector: 'jhi-visit-detail',
  templateUrl: './visit-detail.component.html',
  styleUrls: ['./visit-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VisitDetailComponent implements OnInit {
  visit: IVisit | null = null;
  deliveries: IDelivery[] = [];

  constructor(protected activatedRoute: ActivatedRoute, private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ visit }) => {
      this.visit = visit;
      this.loadDeliveries();
    });
  }

  /** CSS modifier for a delivery's status badge (reuses the vd-status-badge palette) */
  getDeliveryStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING: 'vd-status--planned',
      IN_PREPARATION: 'vd-status--progress',
      SHIPPED: 'vd-status--progress',
      DELIVERED: 'vd-status--completed',
      FAILED: 'vd-status--cancelled',
    };
    return map[status ?? ''] || 'vd-status--planned';
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
    if (!this.visit?.id) {
      return;
    }
    this.deliveryService.query({ 'visitId.equals': this.visit.id, size: 200 }).subscribe(res => (this.deliveries = res.body ?? []));
  }

  previousState(): void {
    window.history.back();
  }

  getStatusClass(): string {
    const map: Record<string, string> = {
      PLANNED:     'vd-status--planned',
      IN_PROGRESS: 'vd-status--progress',
      COMPLETED:   'vd-status--completed',
      MISSED:      'vd-status--missed',
      CANCELLED:   'vd-status--cancelled',
    };
    return map[this.visit?.status ?? ''] || 'vd-status--planned';
  }

  getStatusBadgeClass(): string {
    return this.getStatusClass();
  }

  getStatusLabel(): string {
    const map: Record<string, string> = {
      PLANNED:     'Planifiée',
      IN_PROGRESS: 'En cours',
      COMPLETED:   'Terminée',
      MISSED:      'Manquée',
      CANCELLED:   'Annulée',
    };
    return map[this.visit?.status ?? ''] || 'Inconnu';
  }

  getObjectiveLabel(): string {
    const map: Record<string, string> = {
      SALE:        'Vente',
      PROSPECTING: 'Prospection',
      AUDIT:       'Audit',
      COLLECTION:  'Recouvrement',
      SUPPORT:     'Support',
    };
    return map[this.visit?.objective ?? ''] || '—';
  }

  getObjectiveClass(): string {
    const map: Record<string, string> = {
      SALE:        'vd-obj--sale',
      PROSPECTING: 'vd-obj--prospect',
      AUDIT:       'vd-obj--audit',
      COLLECTION:  'vd-obj--collect',
      SUPPORT:     'vd-obj--support',
    };
    return map[this.visit?.objective ?? ''] || '';
  }
}
