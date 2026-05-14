import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { WarehouseComponent } from '../list/warehouse.component';
import { WarehouseDetailComponent } from '../detail/warehouse-detail.component';
import { WarehouseUpdateComponent } from '../update/warehouse-update.component';
import { WarehouseRoutingResolveService } from './warehouse-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const warehouseRoute: Routes = [
  {
    path: '',
    component: WarehouseComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: WarehouseDetailComponent,
    resolve: {
      warehouse: WarehouseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: WarehouseUpdateComponent,
    resolve: {
      warehouse: WarehouseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: WarehouseUpdateComponent,
    resolve: {
      warehouse: WarehouseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(warehouseRoute)],
  exports: [RouterModule],
})
export class WarehouseRoutingModule {}
