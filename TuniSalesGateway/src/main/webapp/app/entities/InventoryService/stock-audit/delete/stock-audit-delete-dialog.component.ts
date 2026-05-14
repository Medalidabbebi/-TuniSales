import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockAudit } from '../stock-audit.model';
import { StockAuditService } from '../service/stock-audit.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './stock-audit-delete-dialog.component.html',
})
export class StockAuditDeleteDialogComponent {
  stockAudit?: IStockAudit;

  constructor(protected stockAuditService: StockAuditService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.stockAuditService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
