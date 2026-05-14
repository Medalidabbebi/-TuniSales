import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StockItemComponent } from '../list/stock-item.component';
import { StockItemDetailComponent } from '../detail/stock-item-detail.component';
import { StockItemUpdateComponent } from '../update/stock-item-update.component';
import { StockItemRoutingResolveService } from './stock-item-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const stockItemRoute: Routes = [
  {
    path: '',
    component: StockItemComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StockItemDetailComponent,
    resolve: {
      stockItem: StockItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StockItemUpdateComponent,
    resolve: {
      stockItem: StockItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StockItemUpdateComponent,
    resolve: {
      stockItem: StockItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(stockItemRoute)],
  exports: [RouterModule],
})
export class StockItemRoutingModule {}
