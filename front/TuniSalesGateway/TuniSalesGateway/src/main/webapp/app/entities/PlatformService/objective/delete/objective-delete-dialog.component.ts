import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IObjective } from '../objective.model';
import { ObjectiveService } from '../service/objective.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './objective-delete-dialog.component.html',
})
export class ObjectiveDeleteDialogComponent {
  objective?: IObjective;

  constructor(protected objectiveService: ObjectiveService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.objectiveService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
