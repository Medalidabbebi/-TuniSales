import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPerformanceScore } from '../performance-score.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-performance-score-detail',
  templateUrl: './performance-score-detail.component.html',
  styleUrls: ['./performance-score-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PerformanceScoreDetailComponent implements OnInit {
  performanceScore: IPerformanceScore | null = null;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ performanceScore }) => {
      this.performanceScore = performanceScore;
    });
  }

  getScoreBadgeClass(score: number | null | undefined): string {
    if (score == null) return 'psd-score--gray';
    if (score >= 80) return 'psd-score--green';
    if (score >= 60) return 'psd-score--blue';
    if (score >= 40) return 'psd-score--amber';
    return 'psd-score--red';
  }

  getHeroClass(score: number | null | undefined): string {
    if (score == null) return 'psd-hero--gray';
    if (score >= 80) return 'psd-hero--green';
    if (score >= 60) return 'psd-hero--blue';
    if (score >= 40) return 'psd-hero--amber';
    return 'psd-hero--red';
  }

  getClassLabel(cls: string | null | undefined): string {
    const map: Record<string, string> = {
      EXCELLENT: 'Excellent',
      GOOD:      'Bon',
      AVERAGE:   'Moyen',
      POOR:      'Faible',
    };
    return cls ? (map[cls] || cls) : '—';
  }

  getClassBadgeClass(cls: string | null | undefined): string {
    const map: Record<string, string> = {
      EXCELLENT: 'psd-badge--green',
      GOOD:      'psd-badge--blue',
      AVERAGE:   'psd-badge--amber',
      POOR:      'psd-badge--red',
    };
    return cls ? (map[cls] || 'psd-badge--gray') : 'psd-badge--gray';
  }

  getClassIcon(cls: string | null | undefined): any {
    const map: Record<string, string> = {
      EXCELLENT: 'trophy',
      GOOD:      'thumbs-up',
      AVERAGE:   'minus-circle',
      POOR:      'exclamation-triangle',
    };
    return cls ? (map[cls] || 'chart-bar') : 'chart-bar';
  }

  getDeltaClass(delta: number | null | undefined): string {
    if (delta == null || delta === 0) return 'psd-delta--neutral';
    return delta > 0 ? 'psd-delta--up' : 'psd-delta--down';
  }

  getDeltaIcon(delta: number | null | undefined): any {
    if (delta == null || delta === 0) return 'minus';
    return delta > 0 ? 'arrow-up' : 'arrow-down';
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }

  isValidJson(value: string | null | undefined): boolean {
    if (!value) return false;
    try { JSON.parse(value); return true; } catch { return false; }
  }

  getBreakdownEntries(): { key: string; value: unknown }[] {
    try {
      const parsed = JSON.parse(this.performanceScore?.breakdownJson ?? '{}');
      return Object.entries(parsed).map(([key, value]) => ({ key, value }));
    } catch { return []; }
  }
}
