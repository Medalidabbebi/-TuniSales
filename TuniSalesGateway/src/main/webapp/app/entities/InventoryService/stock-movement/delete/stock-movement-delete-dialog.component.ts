import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockMovement } from '../stock-movement.model';
import { StockMovementService } from '../service/stock-movement.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './stock-movement-delete-dialog.component.html',
})
export class StockMovementDeleteDialogComponent {
  stockMovement?: IStockMovement;

  constructor(protected stockMovementService: StockMovementService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.stockMovementService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
