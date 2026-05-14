import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SalesOfferRoutingModule } from './route/sales-offer-routing.module';
import { SalesOfferCreateComponent } from './create/sales-offer-create.component';

@NgModule({
  imports: [SharedModule, SalesOfferRoutingModule],
  declarations: [SalesOfferCreateComponent],
})
export class BusinessServiceSalesOfferModule {}
