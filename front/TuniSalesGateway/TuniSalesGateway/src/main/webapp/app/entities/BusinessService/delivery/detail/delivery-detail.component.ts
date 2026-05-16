import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDelivery } from '../delivery.model';
import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';

@Component({
  selector: 'jhi-delivery-detail',
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss'],
})
export class DeliveryDetailComponent implements OnInit {
  delivery: IDelivery | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ delivery }) => {
      this.delivery = delivery;
    });
  }

  previousState(): void {
    window.history.back();
  }

  /** Returns dd-status--* modifier class for detail status badge */
  getStatusClass(status: DeliveryStatus | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:        'dd-status--pending',
      IN_PREPARATION: 'dd-status--preparation',
      SHIPPED:        'dd-status--shipped',
      DELIVERED:      'dd-status--delivered',
      FAILED:         'dd-status--failed',
    };
    return map[status || ''] || 'dd-status--neutral';
  }

  /** Returns French label for a DeliveryStatus */
  getStatusLabel(status: DeliveryStatus | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:        'En attente',
      IN_PREPARATION: 'En préparation',
      SHIPPED:        'Expédiée',
      DELIVERED:      'Livrée',
      FAILED:         'Échouée',
    };
    return map[status || ''] || (status ?? '—');
  }
}
