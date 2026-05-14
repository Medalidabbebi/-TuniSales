import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IClientScore } from '../client-score.model';
import { ClientScoreService } from '../service/client-score.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './client-score-delete-dialog.component.html',
})
export class ClientScoreDeleteDialogComponent {
  clientScore?: IClientScore;

  constructor(protected clientScoreService: ClientScoreService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.clientScoreService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
