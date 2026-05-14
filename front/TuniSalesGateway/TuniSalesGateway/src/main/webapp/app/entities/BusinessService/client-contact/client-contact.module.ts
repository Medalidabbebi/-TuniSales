import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ClientContactComponent } from './list/client-contact.component';
import { ClientContactDetailComponent } from './detail/client-contact-detail.component';
import { ClientContactUpdateComponent } from './update/client-contact-update.component';
import { ClientContactDeleteDialogComponent } from './delete/client-contact-delete-dialog.component';
import { ClientContactRoutingModule } from './route/client-contact-routing.module';

@NgModule({
  imports: [SharedModule, ClientContactRoutingModule],
  declarations: [ClientContactComponent, ClientContactDetailComponent, ClientContactUpdateComponent, ClientContactDeleteDialogComponent],
})
export class BusinessServiceClientContactModule {}
