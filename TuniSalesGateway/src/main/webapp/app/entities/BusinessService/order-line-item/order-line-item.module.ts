import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { OrderLineItemComponent } from './list/order-line-item.component';
import { OrderLineItemDetailComponent } from './detail/order-line-item-detail.component';
import { OrderLineItemUpdateComponent } from './update/order-line-item-update.component';
import { OrderLineItemDeleteDialogComponent } from './delete/order-line-item-delete-dialog.component';
import { OrderLineItemRoutingModule } from './route/order-line-item-routing.module';

@NgModule({
  imports: [SharedModule, OrderLineItemRoutingModule],
  declarations: [OrderLineItemComponent, OrderLineItemDetailComponent, OrderLineItemUpdateComponent, OrderLineItemDeleteDialogComponent],
})
export class BusinessServiceOrderLineItemModule {}
