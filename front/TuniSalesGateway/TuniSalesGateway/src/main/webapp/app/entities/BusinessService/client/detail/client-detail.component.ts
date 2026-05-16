import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClient } from '../client.model';

@Component({
  selector: 'jhi-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  client: IClient | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-status-badge--active',
      INACTIVE:   'cd-status-badge--inactive',
      SUSPENDED:  'cd-status-badge--suspended',
      CHURN_RISK: 'cd-status-badge--churn-risk',
    };
    return map[status || ''] || 'cd-status-badge--inactive';
  }

  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'Actif',
      INACTIVE:   'Inactif',
      SUSPENDED:  'Suspendu',
      CHURN_RISK: 'À risque',
    };
    return map[status || ''] || (status || '—');
  }

  getTypeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      NATIONAL_DISTRIBUTOR:  'Distributeur national',
      REGIONAL_WHOLESALER:   'Grossiste régional',
      INDEPENDENT_POS:       'PDV indépendant',
      TELECOM_OPERATOR:      'Opérateur télécom',
    };
    return map[type || ''] || (type || '—');
  }

  getKpiStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-kpi-card--green',
      INACTIVE:   'cd-kpi-card--gray',
      SUSPENDED:  'cd-kpi-card--orange',
      CHURN_RISK: 'cd-kpi-card--red',
    };
    return map[status || ''] || 'cd-kpi-card--gray';
  }

  getKpiStatusIconClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-kpi-card__icon--green',
      INACTIVE:   'cd-kpi-card__icon--gray',
      SUSPENDED:  'cd-kpi-card__icon--orange',
      CHURN_RISK: 'cd-kpi-card__icon--red',
    };
    return map[status || ''] || 'cd-kpi-card__icon--gray';
  }
}
