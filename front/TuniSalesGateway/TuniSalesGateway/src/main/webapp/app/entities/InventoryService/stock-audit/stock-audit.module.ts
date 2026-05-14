import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StockAuditComponent } from './list/stock-audit.component';
import { StockAuditDetailComponent } from './detail/stock-audit-detail.component';
import { StockAuditUpdateComponent } from './update/stock-audit-update.component';
import { StockAuditDeleteDialogComponent } from './delete/stock-audit-delete-dialog.component';
import { StockAuditRoutingModule } from './route/stock-audit-routing.module';

@NgModule({
  imports: [SharedModule, StockAuditRoutingModule],
  declarations: [StockAuditComponent, StockAuditDetailComponent, StockAuditUpdateComponent, StockAuditDeleteDialogComponent],
})
export class InventoryServiceStockAuditModule {}
