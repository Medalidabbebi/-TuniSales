import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { MissionComponent } from '../list/mission.component';
import { MissionDetailComponent } from '../detail/mission-detail.component';
import { MissionUpdateComponent } from '../update/mission-update.component';
import { MissionRoutingResolveService } from './mission-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const missionRoute: Routes = [
  {
    path: '',
    component: MissionComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: MissionDetailComponent,
    resolve: {
      mission: MissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: MissionUpdateComponent,
    resolve: {
      mission: MissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: MissionUpdateComponent,
    resolve: {
      mission: MissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(missionRoute)],
  exports: [RouterModule],
})
export class MissionRoutingModule {}
