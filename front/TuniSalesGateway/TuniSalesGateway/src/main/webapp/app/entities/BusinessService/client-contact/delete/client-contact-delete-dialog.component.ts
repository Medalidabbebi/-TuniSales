import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IClientContact } from '../client-contact.model';
import { ClientContactService } from '../service/client-contact.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './client-contact-delete-dialog.component.html',
})
export class ClientContactDeleteDialogComponent {
  clientContact?: IClientContact;

  constructor(protected clientContactService: ClientContactService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.clientContactService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
