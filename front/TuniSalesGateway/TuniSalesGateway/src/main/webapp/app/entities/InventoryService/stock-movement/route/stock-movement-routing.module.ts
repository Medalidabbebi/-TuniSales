import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StockMovementComponent } from '../list/stock-movement.component';
import { StockMovementDetailComponent } from '../detail/stock-movement-detail.component';
import { StockMovementUpdateComponent } from '../update/stock-movement-update.component';
import { StockMovementRoutingResolveService } from './stock-movement-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const stockMovementRoute: Routes = [
  {
    path: '',
    component: StockMovementComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StockMovementDetailComponent,
    resolve: {
      stockMovement: StockMovementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StockMovementUpdateComponent,
    resolve: {
      stockMovement: StockMovementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StockMovementUpdateComponent,
    resolve: {
      stockMovement: StockMovementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(stockMovementRoute)],
  exports: [RouterModule],
})
export class StockMovementRoutingModule {}
