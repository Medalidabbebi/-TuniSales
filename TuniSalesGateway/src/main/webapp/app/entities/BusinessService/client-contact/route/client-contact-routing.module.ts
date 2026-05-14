import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ClientContactComponent } from '../list/client-contact.component';
import { ClientContactDetailComponent } from '../detail/client-contact-detail.component';
import { ClientContactUpdateComponent } from '../update/client-contact-update.component';
import { ClientContactRoutingResolveService } from './client-contact-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const clientContactRoute: Routes = [
  {
    path: '',
    component: ClientContactComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ClientContactDetailComponent,
    resolve: {
      clientContact: ClientContactRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ClientContactUpdateComponent,
    resolve: {
      clientContact: ClientContactRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ClientContactUpdateComponent,
    resolve: {
      clientContact: ClientContactRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(clientContactRoute)],
  exports: [RouterModule],
})
export class ClientContactRoutingModule {}
