import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ObjectiveComponent } from './list/objective.component';
import { ObjectiveDetailComponent } from './detail/objective-detail.component';
import { ObjectiveUpdateComponent } from './update/objective-update.component';
import { ObjectiveDeleteDialogComponent } from './delete/objective-delete-dialog.component';
import { ObjectiveRoutingModule } from './route/objective-routing.module';

@NgModule({
  imports: [SharedModule, ObjectiveRoutingModule],
  declarations: [ObjectiveComponent, ObjectiveDetailComponent, ObjectiveUpdateComponent, ObjectiveDeleteDialogComponent],
})
export class PlatformServiceObjectiveModule {}
