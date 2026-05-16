import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IVisit } from '../visit.model';

@Component({
  selector: 'jhi-visit-detail',
  templateUrl: './visit-detail.component.html',
  styleUrls: ['./visit-detail.component.scss'],
})
export class VisitDetailComponent implements OnInit {
  visit: IVisit | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ visit }) => {
      this.visit = visit;
    });
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
