import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { MissionComponent } from './list/mission.component';
import { MissionDetailComponent } from './detail/mission-detail.component';
import { MissionUpdateComponent } from './update/mission-update.component';
import { MissionDeleteDialogComponent } from './delete/mission-delete-dialog.component';
import { MissionRoutingModule } from './route/mission-routing.module';

@NgModule({
  imports: [SharedModule, MissionRoutingModule],
  declarations: [MissionComponent, MissionDetailComponent, MissionUpdateComponent, MissionDeleteDialogComponent],
})
export class BusinessServiceMissionModule {}
