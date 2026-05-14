import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockAuditLine } from '../stock-audit-line.model';
import { StockAuditLineService } from '../service/stock-audit-line.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './stock-audit-line-delete-dialog.component.html',
})
export class StockAuditLineDeleteDialogComponent {
  stockAuditLine?: IStockAuditLine;

  constructor(protected stockAuditLineService: StockAuditLineService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.stockAuditLineService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
