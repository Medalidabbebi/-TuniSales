import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ClientScoreComponent } from './list/client-score.component';
import { ClientScoreDetailComponent } from './detail/client-score-detail.component';
import { ClientScoreUpdateComponent } from './update/client-score-update.component';
import { ClientScoreDeleteDialogComponent } from './delete/client-score-delete-dialog.component';
import { ClientScoreRoutingModule } from './route/client-score-routing.module';

@NgModule({
  imports: [SharedModule, ClientScoreRoutingModule],
  declarations: [ClientScoreComponent, ClientScoreDetailComponent, ClientScoreUpdateComponent, ClientScoreDeleteDialogComponent],
})
export class PlatformServiceClientScoreModule {}
