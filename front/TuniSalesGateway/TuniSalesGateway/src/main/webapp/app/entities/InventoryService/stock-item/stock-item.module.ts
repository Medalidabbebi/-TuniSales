import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StockItemComponent } from './list/stock-item.component';
import { StockItemDetailComponent } from './detail/stock-item-detail.component';
import { StockItemUpdateComponent } from './update/stock-item-update.component';
import { StockItemDeleteDialogComponent } from './delete/stock-item-delete-dialog.component';
import { StockItemRoutingModule } from './route/stock-item-routing.module';

@NgModule({
  imports: [SharedModule, StockItemRoutingModule],
  declarations: [StockItemComponent, StockItemDetailComponent, StockItemUpdateComponent, StockItemDeleteDialogComponent],
})
export class InventoryServiceStockItemModule {}
