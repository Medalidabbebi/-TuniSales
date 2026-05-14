import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ClientScoreComponent } from '../list/client-score.component';
import { ClientScoreDetailComponent } from '../detail/client-score-detail.component';
import { ClientScoreUpdateComponent } from '../update/client-score-update.component';
import { ClientScoreRoutingResolveService } from './client-score-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const clientScoreRoute: Routes = [
  {
    path: '',
    component: ClientScoreComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ClientScoreDetailComponent,
    resolve: {
      clientScore: ClientScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ClientScoreUpdateComponent,
    resolve: {
      clientScore: ClientScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ClientScoreUpdateComponent,
    resolve: {
      clientScore: ClientScoreRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(clientScoreRoute)],
  exports: [RouterModule],
})
export class ClientScoreRoutingModule {}
