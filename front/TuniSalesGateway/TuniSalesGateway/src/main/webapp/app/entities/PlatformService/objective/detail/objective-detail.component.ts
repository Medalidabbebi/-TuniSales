import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IObjective } from '../objective.model';

@Component({
  selector: 'jhi-objective-detail',
  templateUrl: './objective-detail.component.html',
  styleUrls: ['./objective-detail.component.scss'],
})
export class ObjectiveDetailComponent implements OnInit {
  objective: IObjective | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ objective }) => {
      this.objective = objective;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getProgressPct(): number {
    const target = this.objective?.targetValue ?? 0;
    const achieved = this.objective?.achievedValue ?? 0;
    if (target === 0) return 0;
    return Math.min(100, Math.round((achieved / target) * 100));
  }

  getProgressClass(): string {
    const pct = this.getProgressPct();
    if (pct >= 100) return 'obj-progress__bar--success';
    if (pct >= 60)  return 'obj-progress__bar--warning';
    return 'obj-progress__bar--danger';
  }

  getMetricIcon(): string {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'chart-line',
      REVENUE:         'dollar-sign',
      SALES_COUNT:     'shopping-cart',
      CUSTOMER_COUNT:  'users',
    };
    return map[this.objective?.metricType ?? ''] ?? 'bullseye';
  }

  getMetricLabel(): string {
    return (this.objective?.metricType ?? '').replace(/_/g, ' ');
  }
}
