import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SalesOfferCreateComponent } from '../create/sales-offer-create.component';

const salesOfferRoute: Routes = [
  {
    path: '',
    component: SalesOfferCreateComponent,
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(salesOfferRoute)],
  exports: [RouterModule],
})
export class SalesOfferRoutingModule {}
