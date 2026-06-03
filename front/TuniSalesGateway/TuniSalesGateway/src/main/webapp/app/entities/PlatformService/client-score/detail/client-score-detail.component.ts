import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClientScore } from '../client-score.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-client-score-detail',
  templateUrl: './client-score-detail.component.html',
  styleUrls: ['./client-score-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClientScoreDetailComponent implements OnInit {
  clientScore: IClientScore | null = null;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ clientScore }) => {
      this.clientScore = clientScore;
    });
  }

  getScoreBubbleClass(score: number | null | undefined): string {
    if (score == null) return 'csd-bubble--gray';
    if (score >= 80) return 'csd-bubble--green';
    if (score >= 60) return 'csd-bubble--blue';
    if (score >= 40) return 'csd-bubble--amber';
    return 'csd-bubble--red';
  }

  getHeroClass(score: number | null | undefined): string {
    if (score == null) return 'csd-hero--gray';
    if (score >= 80) return 'csd-hero--green';
    if (score >= 60) return 'csd-hero--blue';
    if (score >= 40) return 'csd-hero--amber';
    return 'csd-hero--red';
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
      EXCELLENT: 'csd-badge--green',
      GOOD:      'csd-badge--blue',
      AVERAGE:   'csd-badge--amber',
      POOR:      'csd-badge--red',
    };
    return cls ? (map[cls] || 'csd-badge--gray') : 'csd-badge--gray';
  }

  getClassIcon(cls: string | null | undefined): any {
    const map: Record<string, string> = {
      EXCELLENT: 'trophy',
      GOOD:      'thumbs-up',
      AVERAGE:   'minus-circle',
      POOR:      'exclamation-triangle',
    };
    return cls ? (map[cls] || 'star') : 'star';
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
}
