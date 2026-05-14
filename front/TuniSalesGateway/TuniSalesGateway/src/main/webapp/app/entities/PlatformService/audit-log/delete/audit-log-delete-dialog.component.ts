import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './audit-log-delete-dialog.component.html',
})
export class AuditLogDeleteDialogComponent {
  auditLog?: IAuditLog;

  constructor(protected auditLogService: AuditLogService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.auditLogService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
