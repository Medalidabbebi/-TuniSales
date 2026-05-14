import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IPerformanceScore } from '../performance-score.model';
import { PerformanceScoreService } from '../service/performance-score.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './performance-score-delete-dialog.component.html',
})
export class PerformanceScoreDeleteDialogComponent {
  performanceScore?: IPerformanceScore;

  constructor(protected performanceScoreService: PerformanceScoreService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.performanceScoreService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
