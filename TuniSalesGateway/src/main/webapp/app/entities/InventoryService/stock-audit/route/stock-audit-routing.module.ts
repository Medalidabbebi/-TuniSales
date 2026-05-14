import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StockAuditComponent } from '../list/stock-audit.component';
import { StockAuditDetailComponent } from '../detail/stock-audit-detail.component';
import { StockAuditUpdateComponent } from '../update/stock-audit-update.component';
import { StockAuditRoutingResolveService } from './stock-audit-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const stockAuditRoute: Routes = [
  {
    path: '',
    component: StockAuditComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StockAuditDetailComponent,
    resolve: {
      stockAudit: StockAuditRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StockAuditUpdateComponent,
    resolve: {
      stockAudit: StockAuditRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StockAuditUpdateComponent,
    resolve: {
      stockAudit: StockAuditRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(stockAuditRoute)],
  exports: [RouterModule],
})
export class StockAuditRoutingModule {}
