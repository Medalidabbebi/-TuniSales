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

  getStatusBadgeClass(): string {
    const map: Record<string, string> = {
      PLANNED: 'tsg-badge--warning',
      IN_PROGRESS: 'tsg-badge--info',
      COMPLETED: 'tsg-badge--success',
      MISSED: 'tsg-badge--danger',
      CANCELLED: 'tsg-badge--neutral',
    };
    return map[this.visit?.status ?? ''] || 'tsg-badge--neutral';
  }

  getStatusLabel(): string {
    const map: Record<string, string> = {
      PLANNED: 'Planned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      MISSED: 'Missed',
      CANCELLED: 'Cancelled',
    };
    return map[this.visit?.status ?? ''] || 'Unknown';
  }

  getObjectiveLabel(): string {
    const map: Record<string, string> = {
      SALE: 'Sale',
      PROSPECTING: 'Prospecting',
      AUDIT: 'Audit',
      COLLECTION: 'Collection',
      SUPPORT: 'Support',
    };
    return map[this.visit?.objective ?? ''] || 'Unknown';
  }
}
