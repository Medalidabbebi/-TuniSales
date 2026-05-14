import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PriceListComponent } from '../list/price-list.component';
import { PriceListDetailComponent } from '../detail/price-list-detail.component';
import { PriceListUpdateComponent } from '../update/price-list-update.component';
import { PriceListRoutingResolveService } from './price-list-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const priceListRoute: Routes = [
  {
    path: '',
    component: PriceListComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PriceListDetailComponent,
    resolve: {
      priceList: PriceListRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PriceListUpdateComponent,
    resolve: {
      priceList: PriceListRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PriceListUpdateComponent,
    resolve: {
      priceList: PriceListRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(priceListRoute)],
  exports: [RouterModule],
})
export class PriceListRoutingModule {}
