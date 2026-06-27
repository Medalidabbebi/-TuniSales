import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ClaimComponent } from './list/claim.component';
import { ClaimUpdateComponent } from './update/claim-update.component';
import { ClaimRoutingModule } from './route/claim-routing.module';

@NgModule({
  imports: [SharedModule, ClaimRoutingModule],
  declarations: [ClaimComponent, ClaimUpdateComponent],
})
export class BusinessServiceClaimModule {}
