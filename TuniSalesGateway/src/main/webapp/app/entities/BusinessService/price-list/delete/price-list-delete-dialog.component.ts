import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IPriceList } from '../price-list.model';
import { PriceListService } from '../service/price-list.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './price-list-delete-dialog.component.html',
})
export class PriceListDeleteDialogComponent {
  priceList?: IPriceList;

  constructor(protected priceListService: PriceListService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.priceListService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
