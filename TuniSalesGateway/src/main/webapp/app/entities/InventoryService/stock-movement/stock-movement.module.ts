import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StockMovementComponent } from './list/stock-movement.component';
import { StockMovementDetailComponent } from './detail/stock-movement-detail.component';
import { StockMovementUpdateComponent } from './update/stock-movement-update.component';
import { StockMovementDeleteDialogComponent } from './delete/stock-movement-delete-dialog.component';
import { StockMovementRoutingModule } from './route/stock-movement-routing.module';

@NgModule({
  imports: [SharedModule, StockMovementRoutingModule],
  declarations: [StockMovementComponent, StockMovementDetailComponent, StockMovementUpdateComponent, StockMovementDeleteDialogComponent],
})
export class InventoryServiceStockMovementModule {}
