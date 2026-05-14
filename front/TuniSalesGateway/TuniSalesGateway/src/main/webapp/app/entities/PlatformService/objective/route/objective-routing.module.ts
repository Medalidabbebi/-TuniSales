import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ObjectiveComponent } from '../list/objective.component';
import { ObjectiveDetailComponent } from '../detail/objective-detail.component';
import { ObjectiveUpdateComponent } from '../update/objective-update.component';
import { ObjectiveRoutingResolveService } from './objective-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const objectiveRoute: Routes = [
  {
    path: '',
    component: ObjectiveComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ObjectiveDetailComponent,
    resolve: {
      objective: ObjectiveRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ObjectiveUpdateComponent,
    resolve: {
      objective: ObjectiveRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ObjectiveUpdateComponent,
    resolve: {
      objective: ObjectiveRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(objectiveRoute)],
  exports: [RouterModule],
})
export class ObjectiveRoutingModule {}
