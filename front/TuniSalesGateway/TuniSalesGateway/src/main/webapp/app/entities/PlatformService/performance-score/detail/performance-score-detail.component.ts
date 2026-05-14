import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPerformanceScore } from '../performance-score.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-performance-score-detail',
  templateUrl: './performance-score-detail.component.html',
})
export class PerformanceScoreDetailComponent implements OnInit {
  performanceScore: IPerformanceScore | null = null;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ performanceScore }) => {
      this.performanceScore = performanceScore;
    });
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
