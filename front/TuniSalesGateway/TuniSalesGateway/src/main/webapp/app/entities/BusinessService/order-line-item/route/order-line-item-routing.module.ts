import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { OrderLineItemComponent } from '../list/order-line-item.component';
import { OrderLineItemDetailComponent } from '../detail/order-line-item-detail.component';
import { OrderLineItemUpdateComponent } from '../update/order-line-item-update.component';
import { OrderLineItemRoutingResolveService } from './order-line-item-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const orderLineItemRoute: Routes = [
  {
    path: '',
    component: OrderLineItemComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: OrderLineItemDetailComponent,
    resolve: {
      orderLineItem: OrderLineItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: OrderLineItemUpdateComponent,
    resolve: {
      orderLineItem: OrderLineItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: OrderLineItemUpdateComponent,
    resolve: {
      orderLineItem: OrderLineItemRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(orderLineItemRoute)],
  exports: [RouterModule],
})
export class OrderLineItemRoutingModule {}
