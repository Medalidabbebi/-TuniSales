import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

import { SharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([HOME_ROUTE]), NgApexchartsModule],
  declarations: [HomeComponent],
})
export class HomeModule {}
