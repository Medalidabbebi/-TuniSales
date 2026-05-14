import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StockAuditLineComponent } from './list/stock-audit-line.component';
import { StockAuditLineDetailComponent } from './detail/stock-audit-line-detail.component';
import { StockAuditLineUpdateComponent } from './update/stock-audit-line-update.component';
import { StockAuditLineDeleteDialogComponent } from './delete/stock-audit-line-delete-dialog.component';
import { StockAuditLineRoutingModule } from './route/stock-audit-line-routing.module';

@NgModule({
  imports: [SharedModule, StockAuditLineRoutingModule],
  declarations: [
    StockAuditLineComponent,
    StockAuditLineDetailComponent,
    StockAuditLineUpdateComponent,
    StockAuditLineDeleteDialogComponent,
  ],
})
export class InventoryServiceStockAuditLineModule {}
