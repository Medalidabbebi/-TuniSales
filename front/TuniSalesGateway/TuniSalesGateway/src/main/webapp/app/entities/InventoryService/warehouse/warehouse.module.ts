import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WarehouseComponent } from './list/warehouse.component';
import { WarehouseDetailComponent } from './detail/warehouse-detail.component';
import { WarehouseUpdateComponent } from './update/warehouse-update.component';
import { WarehouseDeleteDialogComponent } from './delete/warehouse-delete-dialog.component';
import { WarehouseRoutingModule } from './route/warehouse-routing.module';

@NgModule({
  imports: [SharedModule, WarehouseRoutingModule],
  declarations: [WarehouseComponent, WarehouseDetailComponent, WarehouseUpdateComponent, WarehouseDeleteDialogComponent],
})
export class InventoryServiceWarehouseModule {}
