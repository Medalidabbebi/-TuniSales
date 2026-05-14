import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AuditLogComponent } from '../list/audit-log.component';
import { AuditLogDetailComponent } from '../detail/audit-log-detail.component';
import { AuditLogUpdateComponent } from '../update/audit-log-update.component';
import { AuditLogRoutingResolveService } from './audit-log-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const auditLogRoute: Routes = [
  {
    path: '',
    component: AuditLogComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AuditLogDetailComponent,
    resolve: {
      auditLog: AuditLogRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AuditLogUpdateComponent,
    resolve: {
      auditLog: AuditLogRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AuditLogUpdateComponent,
    resolve: {
      auditLog: AuditLogRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(auditLogRoute)],
  exports: [RouterModule],
})
export class AuditLogRoutingModule {}
