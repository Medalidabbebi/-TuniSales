import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PerformanceScoreComponent } from '../list/performance-score.component';
import { PerformanceScoreDetailComponent } from '../detail/performance-score-detail.component';
import { PerformanceScoreUpdateComponent } from '../update/performance-score-update.component';
import { PerformanceScoreRoutingResolveService } from './performance-score-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const performanceScoreRoute: Routes = [
  {
    path: '',
    component: PerformanceScoreComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PerformanceScoreDetailComponent,
    resolve: {
      performanceScore: PerformanceScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PerformanceScoreUpdateComponent,
    resolve: {
      performanceScore: PerformanceScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PerformanceScoreUpdateComponent,
    resolve: {
      performanceScore: PerformanceScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(performanceScoreRoute)],
  exports: [RouterModule],
})
export class PerformanceScoreRoutingModule {}
