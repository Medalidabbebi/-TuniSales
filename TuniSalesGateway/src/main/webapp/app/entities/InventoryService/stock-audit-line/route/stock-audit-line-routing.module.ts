import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StockAuditLineComponent } from '../list/stock-audit-line.component';
import { StockAuditLineDetailComponent } from '../detail/stock-audit-line-detail.component';
import { StockAuditLineUpdateComponent } from '../update/stock-audit-line-update.component';
import { StockAuditLineRoutingResolveService } from './stock-audit-line-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const stockAuditLineRoute: Routes = [
  {
    path: '',
    component: StockAuditLineComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StockAuditLineDetailComponent,
    resolve: {
      stockAuditLine: StockAuditLineRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StockAuditLineUpdateComponent,
    resolve: {
      stockAuditLine: StockAuditLineRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StockAuditLineUpdateComponent,
    resolve: {
      stockAuditLine: StockAuditLineRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(stockAuditLineRoute)],
  exports: [RouterModule],
})
export class StockAuditLineRoutingModule {}
