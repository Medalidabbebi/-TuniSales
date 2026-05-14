import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMission } from '../mission.model';

@Component({
  selector: 'jhi-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
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

  getStatusLabel(): string {
    const map: Record<string, string> = {
      PLANNED: 'Planned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return map[this.mission?.status ?? ''] || 'Unknown';
  }
}
