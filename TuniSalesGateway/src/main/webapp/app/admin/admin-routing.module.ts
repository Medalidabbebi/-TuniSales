import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/config/authority.constants';
/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

@NgModule({
  imports: [
    /* jhipster-needle-add-admin-module - JHipster will add admin modules here */
    RouterModule.forChild([
      {
        path: 'user-management',
        data: {
          pageTitle: 'userManagement.home.title',
          authorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL],
        },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
      },
      {
        path: 'docs',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule),
      },
      {
        path: 'configuration',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule),
      },
      {
        path: 'health',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./health/health.module').then(m => m.HealthModule),
      },
      {
        path: 'logs',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./logs/logs.module').then(m => m.LogsModule),
      },
      {
        path: 'metrics',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./metrics/metrics.module').then(m => m.MetricsModule),
      },
      {
        path: 'gateway',
        data: { authorities: [Authority.ADMIN_SYSTEME] },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./gateway/gateway.module').then(m => m.GatewayModule),
      },
      /* jhipster-needle-add-admin-route - JHipster will add admin routes here */
    ]),
  ],
})
export class AdminRoutingModule {}
