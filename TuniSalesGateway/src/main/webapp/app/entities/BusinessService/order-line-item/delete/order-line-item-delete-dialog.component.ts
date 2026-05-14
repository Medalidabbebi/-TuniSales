import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IOrderLineItem } from '../order-line-item.model';
import { OrderLineItemService } from '../service/order-line-item.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './order-line-item-delete-dialog.component.html',
})
export class OrderLineItemDeleteDialogComponent {
  orderLineItem?: IOrderLineItem;

  constructor(protected orderLineItemService: OrderLineItemService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.orderLineItemService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
