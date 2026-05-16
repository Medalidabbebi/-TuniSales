import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMission } from '../mission.model';

@Component({
  selector: 'jhi-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MissionDetailComponent implements OnInit {
  mission: IMission | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mission }) => {
      this.mission = mission;
    });
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
