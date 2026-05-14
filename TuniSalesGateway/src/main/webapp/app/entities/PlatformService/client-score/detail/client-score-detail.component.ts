import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClientScore } from '../client-score.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-client-score-detail',
  templateUrl: './client-score-detail.component.html',
})
export class ClientScoreDetailComponent implements OnInit {
  clientScore: IClientScore | null = null;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ clientScore }) => {
      this.clientScore = clientScore;
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
