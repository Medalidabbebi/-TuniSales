import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ClaimComponent } from '../list/claim.component';
import { ClaimUpdateComponent } from '../update/claim-update.component';

const claimRoute: Routes = [
  {
    path: '',
    component: ClaimComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ClaimUpdateComponent,
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(claimRoute)],
  exports: [RouterModule],
})
export class ClaimRoutingModule {}
