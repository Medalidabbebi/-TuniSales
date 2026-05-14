import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PriceListComponent } from './list/price-list.component';
import { PriceListDetailComponent } from './detail/price-list-detail.component';
import { PriceListUpdateComponent } from './update/price-list-update.component';
import { PriceListDeleteDialogComponent } from './delete/price-list-delete-dialog.component';
import { PriceListRoutingModule } from './route/price-list-routing.module';

@NgModule({
  imports: [SharedModule, PriceListRoutingModule],
  declarations: [PriceListComponent, PriceListDetailComponent, PriceListUpdateComponent, PriceListDeleteDialogComponent],
})
export class BusinessServicePriceListModule {}
