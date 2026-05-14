import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SwapComponent } from '../list/swap.component';
import { SwapDetailComponent } from '../detail/swap-detail.component';
import { SwapUpdateComponent } from '../update/swap-update.component';
import { SwapRoutingResolveService } from './swap-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const swapRoute: Routes = [
  {
    path: '',
    component: SwapComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SwapDetailComponent,
    resolve: {
      swap: SwapRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SwapUpdateComponent,
    resolve: {
      swap: SwapRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SwapUpdateComponent,
    resolve: {
      swap: SwapRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(swapRoute)],
  exports: [RouterModule],
})
export class SwapRoutingModule {}
