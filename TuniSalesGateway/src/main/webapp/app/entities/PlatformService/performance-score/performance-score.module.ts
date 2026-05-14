import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PerformanceScoreComponent } from './list/performance-score.component';
import { PerformanceScoreDetailComponent } from './detail/performance-score-detail.component';
import { PerformanceScoreUpdateComponent } from './update/performance-score-update.component';
import { PerformanceScoreDeleteDialogComponent } from './delete/performance-score-delete-dialog.component';
import { PerformanceScoreRoutingModule } from './route/performance-score-routing.module';

@NgModule({
  imports: [SharedModule, PerformanceScoreRoutingModule],
  declarations: [
    PerformanceScoreComponent,
    PerformanceScoreDetailComponent,
    PerformanceScoreUpdateComponent,
    PerformanceScoreDeleteDialogComponent,
  ],
})
export class PlatformServicePerformanceScoreModule {}
